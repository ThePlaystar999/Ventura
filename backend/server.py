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

class VenturaPDF(FPDF):
    """Custom PDF class for Ventura reports"""
    
    def header(self):
        # Logo
        self.set_font('Helvetica', 'B', 24)
        self.set_text_color(11, 77, 187)  # #0B4DBB
        self.cell(0, 10, 'V VENTURA', align='C', ln=True)
        self.ln(5)
    
    def footer(self):
        self.set_y(-15)
        self.set_font('Helvetica', '', 8)
        self.set_text_color(100, 116, 139)
        self.cell(0, 10, f'Generated by Ventura | Page {self.page_no()}', align='C')
    
    def section_title(self, title):
        self.set_font('Helvetica', 'B', 14)
        self.set_text_color(11, 77, 187)
        self.cell(0, 10, title, ln=True)
        self.set_draw_color(238, 242, 247)
        self.line(10, self.get_y(), 200, self.get_y())
        self.ln(5)
    
    def info_row(self, label, value):
        self.set_font('Helvetica', '', 10)
        self.set_text_color(100, 116, 139)
        self.cell(60, 8, label)
        self.set_text_color(15, 23, 42)
        self.set_font('Helvetica', 'B', 10)
        self.cell(0, 8, str(value), ln=True)

def generate_valuation_pdf(valuation_data: dict) -> bytes:
    """Generate PDF report for a valuation"""
    pdf = VenturaPDF()
    pdf.add_page()
    
    company = valuation_data.get("company_info", {})
    metrics = valuation_data.get("metrics", {})
    result = valuation_data.get("result", {})
    exit_scenarios = valuation_data.get("exit_scenarios", [])
    
    # Company name
    pdf.set_font('Helvetica', 'B', 18)
    pdf.set_text_color(15, 23, 42)
    pdf.cell(0, 10, company.get("company_name", ""), align='C', ln=True)
    pdf.ln(10)
    
    # Valuation hero
    pdf.set_fill_color(11, 77, 187)
    pdf.rect(10, pdf.get_y(), 190, 30, 'F')
    pdf.set_text_color(255, 255, 255)
    pdf.set_font('Helvetica', 'B', 28)
    base_val = result.get("base", 0)
    pdf.cell(0, 20, f"${base_val:,.0f}", align='C', ln=True)
    pdf.set_font('Helvetica', '', 10)
    pdf.cell(0, 8, "ESTIMATED VALUATION", align='C', ln=True)
    pdf.ln(15)
    
    # Company Information
    pdf.section_title("Company Information")
    pdf.info_row("Company", company.get("company_name", ""))
    pdf.info_row("Industry", company.get("industry", ""))
    pdf.info_row("Stage", company.get("stage", ""))
    pdf.info_row("Country", company.get("country", ""))
    pdf.info_row("Team Size", f"{metrics.get('team_size', 0)} employees")
    pdf.ln(10)
    
    # Financial Metrics
    pdf.section_title("Financial Metrics")
    arr = metrics.get("arr", 0) or (metrics.get("mrr", 0) * 12)
    pdf.info_row("Annual Recurring Revenue", f"${arr:,.0f}")
    pdf.info_row("Growth Rate", f"{metrics.get('growth_rate', 0)}%")
    pdf.info_row("Gross Margin", f"{metrics.get('gross_margin', 0)}%")
    pdf.info_row("Valuation Multiple", f"{result.get('multiple_used', 0)}x Revenue")
    pdf.ln(10)
    
    # Valuation Range
    pdf.section_title("Valuation Range")
    low_val = result.get("low", 0)
    high_val = result.get("high", 0)
    pdf.info_row("Conservative", f"${low_val:,.0f}")
    pdf.info_row("Base Case", f"${base_val:,.0f}")
    pdf.info_row("Optimistic", f"${high_val:,.0f}")
    pdf.ln(10)
    
    # Exit Scenarios
    pdf.section_title("Exit Scenarios")
    for scenario in exit_scenarios:
        pdf.set_font('Helvetica', 'B', 12)
        pdf.set_text_color(11, 77, 187)
        pdf.cell(0, 8, scenario.get("name", ""), ln=True)
        
        pdf.set_font('Helvetica', 'B', 14)
        pdf.set_text_color(15, 23, 42)
        est_val = scenario.get("estimated_value", 0)
        pdf.cell(0, 8, f"${est_val:,.0f}", ln=True)
        
        pdf.set_font('Helvetica', '', 9)
        pdf.set_text_color(100, 116, 139)
        pdf.multi_cell(0, 5, scenario.get("description", ""))
        
        pdf.set_font('Helvetica', '', 8)
        pdf.cell(50, 6, f"Probability: {scenario.get('probability', '')}")
        pdf.cell(0, 6, f"Timeline: {scenario.get('timeline', '')}", ln=True)
        pdf.ln(5)
    
    # Disclaimer
    pdf.ln(10)
    pdf.set_font('Helvetica', 'I', 8)
    pdf.set_text_color(100, 116, 139)
    pdf.multi_cell(0, 4, "This report is for informational purposes only and does not constitute financial advice. Actual valuations may vary based on market conditions and other factors.")
    
    return pdf.output()

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
