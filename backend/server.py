from fastapi import FastAPI, APIRouter, HTTPException, Depends, Response, Request
from fastapi.responses import StreamingResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import io
from fpdf import FPDF
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import base64

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app
app = FastAPI(title="Ventura API", version="1.0.0")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ============ MODELS ============

class UserBase(BaseModel):
    model_config = ConfigDict(extra="ignore")
    user_id: str
    email: str
    name: str
    picture: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class SessionData(BaseModel):
    id: str
    email: str
    name: str
    picture: Optional[str] = None
    session_token: str

class CompanyInfo(BaseModel):
    company_name: str
    industry: str
    country: str = "United States"
    stage: str  # Pre-seed, Seed, Series A, etc.

class ValuationMetrics(BaseModel):
    arr: float = 0  # Annual Recurring Revenue
    mrr: float = 0  # Monthly Recurring Revenue  
    growth_rate: float = 0  # YoY growth %
    gross_margin: float = 0  # Gross margin %
    team_size: int = 1

class ValuationResult(BaseModel):
    low: float
    base: float
    high: float
    multiple_used: float
    methodology: str

class ExitScenario(BaseModel):
    scenario_type: str  # strategic_acquisition, pe_buyout, secondary_sale
    name: str
    description: str
    estimated_value: float
    probability: str  # High, Medium, Low
    timeline: str  # 1-2 years, 3-5 years, etc.

class Project(BaseModel):
    model_config = ConfigDict(extra="ignore")
    project_id: str = Field(default_factory=lambda: f"proj_{uuid.uuid4().hex[:12]}")
    user_id: str
    name: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Valuation(BaseModel):
    model_config = ConfigDict(extra="ignore")
    valuation_id: str = Field(default_factory=lambda: f"val_{uuid.uuid4().hex[:12]}")
    project_id: str
    user_id: str
    company_info: CompanyInfo
    metrics: ValuationMetrics
    result: Optional[ValuationResult] = None
    exit_scenarios: List[ExitScenario] = []
    share_token: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ValuationCreate(BaseModel):
    project_id: str
    company_info: CompanyInfo
    metrics: ValuationMetrics

class ProjectCreate(BaseModel):
    name: str

class ContactMessage(BaseModel):
    model_config = ConfigDict(extra="ignore")
    message_id: str = Field(default_factory=lambda: f"msg_{uuid.uuid4().hex[:12]}")
    name: str
    email: str
    message: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ContactMessageCreate(BaseModel):
    name: str
    email: str
    message: str

# ============ AUTH HELPERS ============

async def get_current_user(request: Request) -> UserBase:
    """Get current user from session token (cookie or header)"""
    session_token = request.cookies.get("session_token")
    if not session_token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            session_token = auth_header.split(" ")[1]
    
    if not session_token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    # Find session
    session = await db.user_sessions.find_one(
        {"session_token": session_token},
        {"_id": 0}
    )
    
    if not session:
        raise HTTPException(status_code=401, detail="Invalid session")
    
    # Check expiry
    expires_at = session.get("expires_at")
    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at)
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=401, detail="Session expired")
    
    # Get user
    user = await db.users.find_one(
        {"user_id": session["user_id"]},
        {"_id": 0}
    )
    
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    
    return UserBase(**user)

# ============ VALUATION LOGIC (MOCK AI) ============

def calculate_valuation(company_info: CompanyInfo, metrics: ValuationMetrics) -> ValuationResult:
    """Mock AI valuation calculation"""
    # Use ARR if available, otherwise MRR * 12
    annual_revenue = metrics.arr if metrics.arr > 0 else metrics.mrr * 12
    
    # Base multiple based on stage
    stage_multiples = {
        "Pre-seed": 8,
        "Seed": 10,
        "Series A": 12,
        "Series B": 15,
        "Series C+": 18
    }
    base_multiple = stage_multiples.get(company_info.stage, 10)
    
    # Adjust for growth rate
    if metrics.growth_rate > 100:
        base_multiple *= 1.5
    elif metrics.growth_rate > 50:
        base_multiple *= 1.2
    elif metrics.growth_rate < 20:
        base_multiple *= 0.8
    
    # Adjust for gross margin
    if metrics.gross_margin > 80:
        base_multiple *= 1.2
    elif metrics.gross_margin < 50:
        base_multiple *= 0.9
    
    # Industry adjustments
    industry_factors = {
        "SaaS": 1.3,
        "AI/ML": 1.5,
        "FinTech": 1.2,
        "HealthTech": 1.1,
        "E-Commerce": 0.9,
        "Marketplace": 1.0,
        "Other": 1.0
    }
    industry_factor = industry_factors.get(company_info.industry, 1.0)
    base_multiple *= industry_factor
    
    base_valuation = annual_revenue * base_multiple
    
    return ValuationResult(
        low=round(base_valuation * 0.7, 0),
        base=round(base_valuation, 0),
        high=round(base_valuation * 1.4, 0),
        multiple_used=round(base_multiple, 1),
        methodology=f"Revenue Multiple ({company_info.industry} sector, {company_info.stage} stage)"
    )

def generate_exit_scenarios(valuation_result: ValuationResult, company_info: CompanyInfo) -> List[ExitScenario]:
    """Generate exit scenarios based on valuation"""
    base_val = valuation_result.base
    
    scenarios = [
        ExitScenario(
            scenario_type="strategic_acquisition",
            name="Strategic Acquisition",
            description=f"Acquisition by a larger {company_info.industry} company seeking market expansion or technology integration.",
            estimated_value=round(base_val * 1.3, 0),
            probability="Medium",
            timeline="2-4 years"
        ),
        ExitScenario(
            scenario_type="pe_buyout",
            name="PE Buyout",
            description="Private equity firm acquisition focused on operational improvements and growth acceleration.",
            estimated_value=round(base_val * 1.1, 0),
            probability="High",
            timeline="3-5 years"
        ),
        ExitScenario(
            scenario_type="secondary_sale",
            name="Secondary Sale",
            description="Sale of existing shares to new investors or secondary market participants.",
            estimated_value=round(base_val * 0.9, 0),
            probability="High",
            timeline="1-2 years"
        )
    ]
    
    return scenarios

# ============ PDF GENERATION ============

def generate_chart_base64(valuation_result: ValuationResult) -> str:
    """Generate valuation range chart as base64"""
    fig, ax = plt.subplots(figsize=(8, 4), dpi=100)
    
    scenarios = ['Low', 'Base', 'High']
    values = [valuation_result.low, valuation_result.base, valuation_result.high]
    colors = ['#A7C8FF', '#0B4DBB', '#1E6AE1']
    
    bars = ax.barh(scenarios, values, color=colors, height=0.5)
    
    # Add value labels
    for bar, val in zip(bars, values):
        ax.text(val + max(values) * 0.02, bar.get_y() + bar.get_height()/2,
                f'${val:,.0f}', va='center', fontsize=10, fontweight='bold')
    
    ax.set_xlabel('Valuation ($)', fontsize=11, fontweight='bold')
    ax.set_title('Valuation Range', fontsize=14, fontweight='bold', color='#0B4DBB')
    ax.xaxis.set_major_formatter(plt.FuncFormatter(lambda x, p: f'${x/1e6:.1f}M'))
    ax.set_facecolor('#F8FAFC')
    fig.patch.set_facecolor('#FFFFFF')
    ax.spines['top'].set_visible(False)
    ax.spines['right'].set_visible(False)
    
    img_buffer = io.BytesIO()
    fig.savefig(img_buffer, format='png', bbox_inches='tight', dpi=100)
    img_buffer.seek(0)
    plt.close(fig)
    
    return f"data:image/png;base64,{base64.b64encode(img_buffer.read()).decode('utf-8')}"

PDF_TEMPLATE = """
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Arial, sans-serif; color: #0F172A; background: #FFFFFF; }
        .page { padding: 40px; }
        .header { text-align: center; margin-bottom: 40px; border-bottom: 3px solid #0B4DBB; padding-bottom: 20px; }
        .logo { font-size: 36px; font-weight: bold; color: #0B4DBB; margin-bottom: 10px; }
        .company-name { font-size: 28px; font-weight: 600; color: #0F172A; }
        .valuation-hero { background: linear-gradient(135deg, #0B4DBB, #1E6AE1); color: white; padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 30px; }
        .valuation-amount { font-size: 48px; font-weight: bold; }
        .valuation-label { font-size: 14px; text-transform: uppercase; letter-spacing: 2px; margin-top: 10px; }
        .section { margin-bottom: 30px; }
        .section-title { font-size: 18px; font-weight: 600; color: #0B4DBB; border-bottom: 2px solid #EEF2F7; padding-bottom: 10px; margin-bottom: 15px; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
        .info-item { background: #F8FAFC; padding: 15px; border-radius: 8px; }
        .info-label { font-size: 12px; color: #64748B; text-transform: uppercase; letter-spacing: 1px; }
        .info-value { font-size: 16px; font-weight: 600; margin-top: 5px; }
        .valuation-range { display: flex; justify-content: space-between; gap: 20px; margin-bottom: 20px; }
        .range-item { flex: 1; text-align: center; padding: 20px; border-radius: 8px; }
        .range-low { background: #DCEAFF; }
        .range-base { background: #0B4DBB; color: white; }
        .range-high { background: #1E6AE1; color: white; }
        .range-value { font-size: 24px; font-weight: bold; }
        .range-label { font-size: 12px; text-transform: uppercase; margin-top: 5px; }
        .exit-card { background: #F8FAFC; border-left: 4px solid #0B4DBB; padding: 15px; margin-bottom: 15px; border-radius: 0 8px 8px 0; }
        .exit-name { font-size: 16px; font-weight: 600; color: #0B4DBB; }
        .exit-value { font-size: 20px; font-weight: bold; margin: 10px 0; }
        .exit-desc { font-size: 13px; color: #64748B; }
        .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #EEF2F7; font-size: 12px; color: #64748B; }
        .chart-container { text-align: center; margin: 20px 0; }
        .chart-container img { max-width: 100%; }
    </style>
</head>
<body>
    <div class="page">
        <div class="header">
            <div class="logo">V VENTURA</div>
            <div class="company-name">{{ company_name }}</div>
        </div>
        
        <div class="valuation-hero">
            <div class="valuation-amount">${{ "{:,.0f}".format(base_valuation) }}</div>
            <div class="valuation-label">Estimated Valuation</div>
        </div>
        
        <div class="section">
            <div class="section-title">Company Information</div>
            <div class="info-grid">
                <div class="info-item">
                    <div class="info-label">Industry</div>
                    <div class="info-value">{{ industry }}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Stage</div>
                    <div class="info-value">{{ stage }}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Country</div>
                    <div class="info-value">{{ country }}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Team Size</div>
                    <div class="info-value">{{ team_size }} employees</div>
                </div>
            </div>
        </div>
        
        <div class="section">
            <div class="section-title">Financial Metrics</div>
            <div class="info-grid">
                <div class="info-item">
                    <div class="info-label">Annual Recurring Revenue</div>
                    <div class="info-value">${{ "{:,.0f}".format(arr) }}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Growth Rate</div>
                    <div class="info-value">{{ growth_rate }}%</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Gross Margin</div>
                    <div class="info-value">{{ gross_margin }}%</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Valuation Multiple</div>
                    <div class="info-value">{{ multiple_used }}x Revenue</div>
                </div>
            </div>
        </div>
        
        <div class="section">
            <div class="section-title">Valuation Range</div>
            <div class="valuation-range">
                <div class="range-item range-low">
                    <div class="range-value">${{ "{:,.0f}".format(low_valuation) }}</div>
                    <div class="range-label">Conservative</div>
                </div>
                <div class="range-item range-base">
                    <div class="range-value">${{ "{:,.0f}".format(base_valuation) }}</div>
                    <div class="range-label">Base Case</div>
                </div>
                <div class="range-item range-high">
                    <div class="range-value">${{ "{:,.0f}".format(high_valuation) }}</div>
                    <div class="range-label">Optimistic</div>
                </div>
            </div>
            <div class="chart-container">
                <img src="{{ chart_base64 }}" alt="Valuation Chart">
            </div>
        </div>
        
        <div class="section">
            <div class="section-title">Exit Scenarios</div>
            {% for scenario in exit_scenarios %}
            <div class="exit-card">
                <div class="exit-name">{{ scenario.name }}</div>
                <div class="exit-value">${{ "{:,.0f}".format(scenario.estimated_value) }}</div>
                <div class="exit-desc">{{ scenario.description }}</div>
                <div style="margin-top: 10px; font-size: 12px;">
                    <span style="background: #DCEAFF; padding: 4px 8px; border-radius: 4px; margin-right: 10px;">{{ scenario.probability }} Probability</span>
                    <span style="background: #EEF2F7; padding: 4px 8px; border-radius: 4px;">{{ scenario.timeline }}</span>
                </div>
            </div>
            {% endfor %}
        </div>
        
        <div class="footer">
            <p>Generated by Ventura | {{ generated_date }}</p>
            <p style="margin-top: 5px;">This report is for informational purposes only and does not constitute financial advice.</p>
        </div>
    </div>
</body>
</html>
"""

# ============ AUTH ROUTES ============

@api_router.post("/auth/session")
async def create_session(request: Request, response: Response):
    """Exchange session_id for session_token via Emergent Auth"""
    import httpx
    
    body = await request.json()
    session_id = body.get("session_id")
    
    if not session_id:
        raise HTTPException(status_code=400, detail="session_id required")
    
    # Get session data from Emergent
    async with httpx.AsyncClient() as client_http:
        resp = await client_http.get(
            "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
            headers={"X-Session-ID": session_id}
        )
    
    if resp.status_code != 200:
        raise HTTPException(status_code=401, detail="Invalid session_id")
    
    data = resp.json()
    
    # Create or update user
    user_id = f"user_{uuid.uuid4().hex[:12]}"
    existing_user = await db.users.find_one({"email": data["email"]}, {"_id": 0})
    
    if existing_user:
        user_id = existing_user["user_id"]
        await db.users.update_one(
            {"user_id": user_id},
            {"$set": {
                "name": data["name"],
                "picture": data.get("picture"),
                "updated_at": datetime.now(timezone.utc).isoformat()
            }}
        )
    else:
        await db.users.insert_one({
            "user_id": user_id,
            "email": data["email"],
            "name": data["name"],
            "picture": data.get("picture"),
            "created_at": datetime.now(timezone.utc).isoformat()
        })
    
    # Create session
    session_token = data["session_token"]
    expires_at = datetime.now(timezone.utc) + timedelta(days=7)
    
    await db.user_sessions.insert_one({
        "user_id": user_id,
        "session_token": session_token,
        "expires_at": expires_at.isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    
    # Set cookie
    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        secure=True,
        samesite="none",
        path="/",
        max_age=7 * 24 * 60 * 60
    )
    
    return {
        "user_id": user_id,
        "email": data["email"],
        "name": data["name"],
        "picture": data.get("picture")
    }

@api_router.get("/auth/me")
async def get_me(user: UserBase = Depends(get_current_user)):
    """Get current user info"""
    return {
        "user_id": user.user_id,
        "email": user.email,
        "name": user.name,
        "picture": user.picture
    }

@api_router.post("/auth/logout")
async def logout(request: Request, response: Response):
    """Logout and clear session"""
    session_token = request.cookies.get("session_token")
    if session_token:
        await db.user_sessions.delete_one({"session_token": session_token})
    
    response.delete_cookie(key="session_token", path="/")
    return {"message": "Logged out"}

# ============ PROJECT ROUTES ============

@api_router.get("/projects", response_model=List[Project])
async def get_projects(user: UserBase = Depends(get_current_user)):
    """Get all projects for current user"""
    projects = await db.projects.find(
        {"user_id": user.user_id},
        {"_id": 0}
    ).sort("created_at", -1).to_list(100)
    
    for p in projects:
        if isinstance(p.get('created_at'), str):
            p['created_at'] = datetime.fromisoformat(p['created_at'])
        if isinstance(p.get('updated_at'), str):
            p['updated_at'] = datetime.fromisoformat(p['updated_at'])
    
    return projects

@api_router.post("/projects", response_model=Project)
async def create_project(data: ProjectCreate, user: UserBase = Depends(get_current_user)):
    """Create a new project"""
    project = Project(
        user_id=user.user_id,
        name=data.name
    )
    
    doc = project.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    doc['updated_at'] = doc['updated_at'].isoformat()
    
    await db.projects.insert_one(doc)
    return project

@api_router.delete("/projects/{project_id}")
async def delete_project(project_id: str, user: UserBase = Depends(get_current_user)):
    """Delete a project and its valuations"""
    result = await db.projects.delete_one({
        "project_id": project_id,
        "user_id": user.user_id
    })
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Delete associated valuations
    await db.valuations.delete_many({"project_id": project_id})
    
    return {"message": "Project deleted"}

# ============ VALUATION ROUTES ============

@api_router.get("/valuations", response_model=List[Valuation])
async def get_valuations(project_id: Optional[str] = None, user: UserBase = Depends(get_current_user)):
    """Get all valuations for current user, optionally filtered by project"""
    query = {"user_id": user.user_id}
    if project_id:
        query["project_id"] = project_id
    
    valuations = await db.valuations.find(query, {"_id": 0}).sort("created_at", -1).to_list(100)
    
    for v in valuations:
        if isinstance(v.get('created_at'), str):
            v['created_at'] = datetime.fromisoformat(v['created_at'])
    
    return valuations

@api_router.post("/valuations", response_model=Valuation)
async def create_valuation(data: ValuationCreate, user: UserBase = Depends(get_current_user)):
    """Create a new valuation with AI analysis"""
    # Verify project exists and belongs to user
    project = await db.projects.find_one({
        "project_id": data.project_id,
        "user_id": user.user_id
    }, {"_id": 0})
    
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Calculate valuation
    result = calculate_valuation(data.company_info, data.metrics)
    exit_scenarios = generate_exit_scenarios(result, data.company_info)
    
    # Generate share token
    share_token = uuid.uuid4().hex[:16]
    
    valuation = Valuation(
        project_id=data.project_id,
        user_id=user.user_id,
        company_info=data.company_info,
        metrics=data.metrics,
        result=result,
        exit_scenarios=exit_scenarios,
        share_token=share_token
    )
    
    doc = valuation.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.valuations.insert_one(doc)
    
    # Update project timestamp
    await db.projects.update_one(
        {"project_id": data.project_id},
        {"$set": {"updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    return valuation

@api_router.get("/valuations/{valuation_id}", response_model=Valuation)
async def get_valuation(valuation_id: str, user: UserBase = Depends(get_current_user)):
    """Get a specific valuation"""
    valuation = await db.valuations.find_one({
        "valuation_id": valuation_id,
        "user_id": user.user_id
    }, {"_id": 0})
    
    if not valuation:
        raise HTTPException(status_code=404, detail="Valuation not found")
    
    if isinstance(valuation.get('created_at'), str):
        valuation['created_at'] = datetime.fromisoformat(valuation['created_at'])
    
    return valuation

@api_router.delete("/valuations/{valuation_id}")
async def delete_valuation(valuation_id: str, user: UserBase = Depends(get_current_user)):
    """Delete a valuation"""
    result = await db.valuations.delete_one({
        "valuation_id": valuation_id,
        "user_id": user.user_id
    })
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Valuation not found")
    
    return {"message": "Valuation deleted"}

# ============ SHARE ROUTES ============

@api_router.get("/share/{share_token}")
async def get_shared_valuation(share_token: str):
    """Get valuation by share token (public, read-only)"""
    valuation = await db.valuations.find_one(
        {"share_token": share_token},
        {"_id": 0, "user_id": 0}  # Don't expose user_id
    )
    
    if not valuation:
        raise HTTPException(status_code=404, detail="Valuation not found")
    
    if isinstance(valuation.get('created_at'), str):
        valuation['created_at'] = datetime.fromisoformat(valuation['created_at'])
    
    return valuation

# ============ PDF EXPORT ============

@api_router.get("/valuations/{valuation_id}/pdf")
async def export_pdf(valuation_id: str, user: UserBase = Depends(get_current_user)):
    """Export valuation as PDF"""
    valuation = await db.valuations.find_one({
        "valuation_id": valuation_id,
        "user_id": user.user_id
    }, {"_id": 0})
    
    if not valuation:
        raise HTTPException(status_code=404, detail="Valuation not found")
    
    # Parse result
    result = valuation.get("result", {})
    company_info = valuation.get("company_info", {})
    metrics = valuation.get("metrics", {})
    
    # Generate chart
    chart_base64 = generate_chart_base64(ValuationResult(**result))
    
    # Render template
    template = Template(PDF_TEMPLATE)
    html_content = template.render(
        company_name=company_info.get("company_name", "Unknown"),
        industry=company_info.get("industry", "Unknown"),
        stage=company_info.get("stage", "Unknown"),
        country=company_info.get("country", "Unknown"),
        team_size=metrics.get("team_size", 0),
        arr=metrics.get("arr", 0) or metrics.get("mrr", 0) * 12,
        growth_rate=metrics.get("growth_rate", 0),
        gross_margin=metrics.get("gross_margin", 0),
        low_valuation=result.get("low", 0),
        base_valuation=result.get("base", 0),
        high_valuation=result.get("high", 0),
        multiple_used=result.get("multiple_used", 0),
        exit_scenarios=valuation.get("exit_scenarios", []),
        chart_base64=chart_base64,
        generated_date=datetime.now(timezone.utc).strftime("%B %d, %Y")
    )
    
    # Generate PDF
    pdf_bytes = HTML(string=html_content).write_pdf()
    
    filename = f"{company_info.get('company_name', 'valuation').replace(' ', '_')}_Valuation.pdf"
    
    return StreamingResponse(
        io.BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'}
    )

@api_router.get("/share/{share_token}/pdf")
async def export_shared_pdf(share_token: str):
    """Export shared valuation as PDF (public)"""
    valuation = await db.valuations.find_one(
        {"share_token": share_token},
        {"_id": 0}
    )
    
    if not valuation:
        raise HTTPException(status_code=404, detail="Valuation not found")
    
    # Same PDF generation as above
    result = valuation.get("result", {})
    company_info = valuation.get("company_info", {})
    metrics = valuation.get("metrics", {})
    
    chart_base64 = generate_chart_base64(ValuationResult(**result))
    
    template = Template(PDF_TEMPLATE)
    html_content = template.render(
        company_name=company_info.get("company_name", "Unknown"),
        industry=company_info.get("industry", "Unknown"),
        stage=company_info.get("stage", "Unknown"),
        country=company_info.get("country", "Unknown"),
        team_size=metrics.get("team_size", 0),
        arr=metrics.get("arr", 0) or metrics.get("mrr", 0) * 12,
        growth_rate=metrics.get("growth_rate", 0),
        gross_margin=metrics.get("gross_margin", 0),
        low_valuation=result.get("low", 0),
        base_valuation=result.get("base", 0),
        high_valuation=result.get("high", 0),
        multiple_used=result.get("multiple_used", 0),
        exit_scenarios=valuation.get("exit_scenarios", []),
        chart_base64=chart_base64,
        generated_date=datetime.now(timezone.utc).strftime("%B %d, %Y")
    )
    
    pdf_bytes = HTML(string=html_content).write_pdf()
    filename = f"{company_info.get('company_name', 'valuation').replace(' ', '_')}_Valuation.pdf"
    
    return StreamingResponse(
        io.BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'}
    )

# ============ CONTACT ROUTES ============

@api_router.post("/contact", response_model=ContactMessage)
async def submit_contact(data: ContactMessageCreate):
    """Submit contact form (public)"""
    message = ContactMessage(
        name=data.name,
        email=data.email,
        message=data.message
    )
    
    doc = message.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.contact_messages.insert_one(doc)
    return message

# ============ HEALTH CHECK ============

@api_router.get("/")
async def root():
    return {"message": "Ventura API", "version": "1.0.0"}

@api_router.get("/health")
async def health():
    return {"status": "healthy"}

# Include router
app.include_router(api_router)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
