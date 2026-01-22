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
    business_model: str = "SaaS"  # SaaS, Marketplace, E-Commerce, etc.

class ValuationMetrics(BaseModel):
    arr: float = 0  # Annual Recurring Revenue
    mrr: float = 0  # Monthly Recurring Revenue  
    growth_rate: float = 0  # YoY growth %
    gross_margin: float = 0  # Gross margin %
    nrr: float = 100  # Net Revenue Retention %
    team_size: int = 1

class QualitativeScores(BaseModel):
    product_maturity: int = 3  # 1-5 scale
    market_size: str = "Medium"  # Small, Medium, Large
    competitive_moat: str = "Medium"  # Low, Medium, Strong

class ValuationAdjustment(BaseModel):
    factor: str
    adjustment: float
    reason: str

class ValuationResult(BaseModel):
    low: float
    base: float
    high: float
    multiple_used: float
    base_multiple: float
    methodology: str
    arr_used: float
    adjustments: List[ValuationAdjustment] = []

class ExitScenario(BaseModel):
    scenario_type: str  # strategic_acquisition, pe_buyout, secondary_sale
    name: str
    description: str
    estimated_value: float
    multiple: float
    probability: str  # High, Medium, Low
    timeline: str  # 1-2 years, 3-5 years, etc.
    rationale: str

class ValuationAssumptions(BaseModel):
    base_multiple_source: str
    growth_assumption: str
    margin_assumption: str
    market_assumption: str
    risk_factors: List[str]

class AICommentary(BaseModel):
    key_strengths: List[str]
    key_risks: List[str]
    valuation_drivers: List[str]
    exit_readiness: str
    summary: str

class FullValuationResult(BaseModel):
    valuation: ValuationResult
    exit_scenarios: List[ExitScenario]
    assumptions: ValuationAssumptions
    ai_commentary: AICommentary

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
    qualitative: Optional[QualitativeScores] = None
    result: Optional[ValuationResult] = None
    exit_scenarios: List[ExitScenario] = []
    assumptions: Optional[ValuationAssumptions] = None
    ai_commentary: Optional[AICommentary] = None
    share_token: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ValuationCreate(BaseModel):
    project_id: str
    company_info: CompanyInfo
    metrics: ValuationMetrics
    qualitative: Optional[QualitativeScores] = None

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

# ============ VALUATION ENGINE - DETERMINISTIC & EXPLAINABLE ============

# Base multiples by stage and business model
BASE_MULTIPLES = {
    "SaaS": {
        "Pre-seed": 5.0,
        "Seed": 8.0,
        "Series A": 12.0,
        "Series B": 15.0,
        "Series C+": 18.0
    },
    "Marketplace": {
        "Pre-seed": 3.0,
        "Seed": 5.0,
        "Series A": 8.0,
        "Series B": 10.0,
        "Series C+": 12.0
    },
    "E-Commerce": {
        "Pre-seed": 2.0,
        "Seed": 3.0,
        "Series A": 5.0,
        "Series B": 6.0,
        "Series C+": 8.0
    },
    "FinTech": {
        "Pre-seed": 6.0,
        "Seed": 10.0,
        "Series A": 15.0,
        "Series B": 18.0,
        "Series C+": 22.0
    },
    "AI/ML": {
        "Pre-seed": 8.0,
        "Seed": 12.0,
        "Series A": 18.0,
        "Series B": 22.0,
        "Series C+": 28.0
    },
    "HealthTech": {
        "Pre-seed": 4.0,
        "Seed": 7.0,
        "Series A": 10.0,
        "Series B": 14.0,
        "Series C+": 18.0
    },
    "Other": {
        "Pre-seed": 4.0,
        "Seed": 6.0,
        "Series A": 9.0,
        "Series B": 12.0,
        "Series C+": 15.0
    }
}

# Multiple caps by stage (prevent absurd outputs)
MULTIPLE_CAPS = {
    "Pre-seed": 15.0,
    "Seed": 25.0,
    "Series A": 35.0,
    "Series B": 45.0,
    "Series C+": 60.0
}

def get_base_multiple(business_model: str, stage: str) -> float:
    """Get base multiple for business model and stage"""
    model_multiples = BASE_MULTIPLES.get(business_model, BASE_MULTIPLES["Other"])
    return model_multiples.get(stage, 8.0)

def calculate_growth_adjustment(growth_rate: float, stage: str) -> tuple:
    """Calculate growth rate adjustment with explanation"""
    # Different thresholds by stage
    thresholds = {
        "Pre-seed": {"exceptional": 200, "strong": 100, "moderate": 50},
        "Seed": {"exceptional": 150, "strong": 80, "moderate": 40},
        "Series A": {"exceptional": 100, "strong": 60, "moderate": 30},
        "Series B": {"exceptional": 80, "strong": 50, "moderate": 25},
        "Series C+": {"exceptional": 60, "strong": 40, "moderate": 20}
    }
    
    t = thresholds.get(stage, thresholds["Seed"])
    
    if growth_rate >= t["exceptional"]:
        return 0.4, f"Exceptional growth ({growth_rate}% YoY) - premium applied"
    elif growth_rate >= t["strong"]:
        return 0.2, f"Strong growth ({growth_rate}% YoY) - positive adjustment"
    elif growth_rate >= t["moderate"]:
        return 0.0, f"Moderate growth ({growth_rate}% YoY) - baseline"
    elif growth_rate >= 10:
        return -0.15, f"Below-average growth ({growth_rate}% YoY) - discount applied"
    else:
        return -0.3, f"Low growth ({growth_rate}% YoY) - significant discount"

def calculate_margin_adjustment(gross_margin: float, business_model: str) -> tuple:
    """Calculate gross margin adjustment with explanation"""
    # Different expectations by business model
    expectations = {
        "SaaS": {"excellent": 80, "good": 70, "acceptable": 60},
        "Marketplace": {"excellent": 70, "good": 50, "acceptable": 35},
        "E-Commerce": {"excellent": 50, "good": 35, "acceptable": 25},
        "FinTech": {"excellent": 75, "good": 60, "acceptable": 45},
        "AI/ML": {"excellent": 85, "good": 75, "acceptable": 65},
        "HealthTech": {"excellent": 70, "good": 55, "acceptable": 40},
        "Other": {"excellent": 65, "good": 50, "acceptable": 35}
    }
    
    e = expectations.get(business_model, expectations["Other"])
    
    if gross_margin >= e["excellent"]:
        return 0.2, f"Excellent gross margin ({gross_margin}%) for {business_model}"
    elif gross_margin >= e["good"]:
        return 0.1, f"Good gross margin ({gross_margin}%) for {business_model}"
    elif gross_margin >= e["acceptable"]:
        return 0.0, f"Acceptable gross margin ({gross_margin}%) for {business_model}"
    elif gross_margin >= 20:
        return -0.15, f"Below-average margin ({gross_margin}%) - improvement needed"
    else:
        return -0.25, f"Low margin ({gross_margin}%) - significant concern"

def calculate_nrr_adjustment(nrr: float) -> tuple:
    """Calculate Net Revenue Retention adjustment"""
    if nrr >= 130:
        return 0.25, f"Exceptional NRR ({nrr}%) indicates strong expansion"
    elif nrr >= 120:
        return 0.15, f"Strong NRR ({nrr}%) - healthy customer expansion"
    elif nrr >= 100:
        return 0.0, f"Healthy NRR ({nrr}%) - stable customer base"
    elif nrr >= 85:
        return -0.15, f"NRR below 100% ({nrr}%) - churn concern"
    else:
        return -0.3, f"Significant churn ({nrr}% NRR) - major risk factor"

def calculate_qualitative_adjustment(qualitative: QualitativeScores) -> tuple:
    """Calculate qualitative factors adjustment"""
    total_adj = 0.0
    reasons = []
    
    # Product maturity (1-5)
    if qualitative.product_maturity >= 5:
        total_adj += 0.1
        reasons.append("Mature, polished product (+10%)")
    elif qualitative.product_maturity >= 4:
        total_adj += 0.05
        reasons.append("Well-developed product (+5%)")
    elif qualitative.product_maturity <= 2:
        total_adj -= 0.1
        reasons.append("Early-stage product (-10%)")
    
    # Market size
    if qualitative.market_size == "Large":
        total_adj += 0.15
        reasons.append("Large addressable market (+15%)")
    elif qualitative.market_size == "Small":
        total_adj -= 0.1
        reasons.append("Limited market size (-10%)")
    
    # Competitive moat
    if qualitative.competitive_moat == "Strong":
        total_adj += 0.15
        reasons.append("Strong competitive moat (+15%)")
    elif qualitative.competitive_moat == "Low":
        total_adj -= 0.15
        reasons.append("Weak competitive position (-15%)")
    
    return total_adj, "; ".join(reasons) if reasons else "Standard qualitative assessment"

def calculate_valuation(
    company_info: CompanyInfo, 
    metrics: ValuationMetrics,
    qualitative: Optional[QualitativeScores] = None
) -> FullValuationResult:
    """
    Deterministic, explainable valuation calculation.
    No randomness, no black box - every adjustment is documented.
    """
    # Use ARR if available, otherwise MRR * 12
    arr = metrics.arr if metrics.arr > 0 else metrics.mrr * 12
    if arr == 0:
        arr = 100000  # Minimum for calculation
    
    business_model = company_info.business_model or "SaaS"
    stage = company_info.stage or "Seed"
    
    # Default qualitative if not provided
    if not qualitative:
        qualitative = QualitativeScores()
    
    # Step 1: Get base multiple
    base_multiple = get_base_multiple(business_model, stage)
    adjustments = []
    
    # Step 2: Apply growth adjustment
    growth_adj, growth_reason = calculate_growth_adjustment(metrics.growth_rate, stage)
    if growth_adj != 0:
        adjustments.append(ValuationAdjustment(
            factor="Growth Rate",
            adjustment=growth_adj,
            reason=growth_reason
        ))
    
    # Step 3: Apply margin adjustment
    margin_adj, margin_reason = calculate_margin_adjustment(metrics.gross_margin, business_model)
    if margin_adj != 0:
        adjustments.append(ValuationAdjustment(
            factor="Gross Margin",
            adjustment=margin_adj,
            reason=margin_reason
        ))
    
    # Step 4: Apply NRR adjustment
    nrr_adj, nrr_reason = calculate_nrr_adjustment(metrics.nrr)
    if nrr_adj != 0:
        adjustments.append(ValuationAdjustment(
            factor="Net Revenue Retention",
            adjustment=nrr_adj,
            reason=nrr_reason
        ))
    
    # Step 5: Apply qualitative adjustment
    qual_adj, qual_reason = calculate_qualitative_adjustment(qualitative)
    if qual_adj != 0:
        adjustments.append(ValuationAdjustment(
            factor="Qualitative Factors",
            adjustment=qual_adj,
            reason=qual_reason
        ))
    
    # Calculate total adjustment
    total_adjustment = sum(adj.adjustment for adj in adjustments)
    adjusted_multiple = base_multiple * (1 + total_adjustment)
    
    # Apply cap
    cap = MULTIPLE_CAPS.get(stage, 30.0)
    final_multiple = min(adjusted_multiple, cap)
    if adjusted_multiple > cap:
        adjustments.append(ValuationAdjustment(
            factor="Multiple Cap",
            adjustment=0,
            reason=f"Multiple capped at {cap}x for {stage} stage"
        ))
    
    # Calculate valuations
    base_valuation = arr * final_multiple
    low_valuation = base_valuation * 0.7
    high_valuation = base_valuation * 1.4
    
    # Build valuation result
    valuation_result = ValuationResult(
        low=round(low_valuation, 0),
        base=round(base_valuation, 0),
        high=round(high_valuation, 0),
        multiple_used=round(final_multiple, 2),
        base_multiple=round(base_multiple, 2),
        arr_used=arr,
        methodology=f"Revenue Multiple ({business_model}, {stage} stage)",
        adjustments=adjustments
    )
    
    # Generate exit scenarios
    exit_scenarios = generate_exit_scenarios(valuation_result, company_info, metrics)
    
    # Generate assumptions
    assumptions = generate_assumptions(company_info, metrics, qualitative, base_multiple)
    
    # Generate AI commentary
    ai_commentary = generate_ai_commentary(company_info, metrics, qualitative, valuation_result)
    
    return FullValuationResult(
        valuation=valuation_result,
        exit_scenarios=exit_scenarios,
        assumptions=assumptions,
        ai_commentary=ai_commentary
    )

def generate_exit_scenarios(
    valuation_result: ValuationResult, 
    company_info: CompanyInfo,
    metrics: ValuationMetrics
) -> List[ExitScenario]:
    """Generate detailed exit scenarios with rationale"""
    base_val = valuation_result.base
    multiple = valuation_result.multiple_used
    arr = valuation_result.arr_used
    
    # Strategic acquisition - typically premium for synergies
    strategic_multiple = min(multiple * 1.3, multiple + 5)
    strategic_value = arr * strategic_multiple
    
    # PE buyout - more conservative, focused on profitability
    pe_multiple = multiple * 0.9 if metrics.gross_margin < 60 else multiple
    pe_value = arr * pe_multiple
    
    # Secondary - typically at discount for liquidity
    secondary_multiple = multiple * 0.85
    secondary_value = arr * secondary_multiple
    
    scenarios = [
        ExitScenario(
            scenario_type="strategic_acquisition",
            name="Strategic Acquisition",
            description=f"Acquisition by a larger {company_info.industry} player seeking market expansion, technology capabilities, or talent acquisition.",
            estimated_value=round(strategic_value, 0),
            multiple=round(strategic_multiple, 2),
            probability="Medium" if metrics.growth_rate > 30 else "Low",
            timeline="2-4 years",
            rationale=f"Strategic buyers typically pay a premium of 20-40% over financial valuations for synergy potential. With {metrics.growth_rate}% growth and {metrics.gross_margin}% margins, strategic interest is {'likely' if metrics.growth_rate > 50 else 'possible'}."
        ),
        ExitScenario(
            scenario_type="pe_buyout",
            name="Private Equity Buyout",
            description="Acquisition by a PE firm focused on operational improvements, consolidation plays, and growth acceleration through add-on acquisitions.",
            estimated_value=round(pe_value, 0),
            multiple=round(pe_multiple, 2),
            probability="High" if metrics.gross_margin > 60 else "Medium",
            timeline="3-5 years",
            rationale=f"PE buyers prioritize predictable cash flows and margin expansion potential. Current {metrics.gross_margin}% gross margin {'meets' if metrics.gross_margin > 60 else 'is below'} typical PE thresholds. {metrics.nrr}% NRR indicates {'strong' if metrics.nrr > 110 else 'acceptable'} revenue quality."
        ),
        ExitScenario(
            scenario_type="secondary_sale",
            name="Secondary / Partial Exit",
            description="Sale of existing shares to later-stage investors, secondary funds, or employee liquidity programs.",
            estimated_value=round(secondary_value, 0),
            multiple=round(secondary_multiple, 2),
            probability="High",
            timeline="1-2 years",
            rationale=f"Secondary transactions typically occur at 10-20% discount to primary valuations for liquidity. This provides near-term liquidity for founders and early investors while maintaining company trajectory."
        )
    ]
    
    return scenarios

def generate_assumptions(
    company_info: CompanyInfo,
    metrics: ValuationMetrics,
    qualitative: QualitativeScores,
    base_multiple: float
) -> ValuationAssumptions:
    """Generate transparent assumptions list"""
    risk_factors = []
    
    if metrics.growth_rate < 30:
        risk_factors.append("Growth rate below market expectations for stage")
    if metrics.gross_margin < 60:
        risk_factors.append("Gross margin indicates potential unit economics concerns")
    if metrics.nrr < 100:
        risk_factors.append("Net churn indicates retention challenges")
    if qualitative.competitive_moat == "Low":
        risk_factors.append("Limited competitive differentiation")
    if qualitative.market_size == "Small":
        risk_factors.append("Addressable market may limit upside")
    if metrics.team_size < 5:
        risk_factors.append("Small team - key person risk")
    
    if not risk_factors:
        risk_factors.append("No significant risk factors identified")
    
    return ValuationAssumptions(
        base_multiple_source=f"Base {base_multiple}x multiple derived from {company_info.business_model} sector benchmarks at {company_info.stage} stage",
        growth_assumption=f"Assumes current {metrics.growth_rate}% YoY growth trajectory is sustainable for 12-24 months",
        margin_assumption=f"Current {metrics.gross_margin}% gross margin expected to {'improve' if metrics.gross_margin < 70 else 'maintain'} as scale increases",
        market_assumption=f"{qualitative.market_size} market size with {qualitative.competitive_moat.lower()} competitive barriers",
        risk_factors=risk_factors
    )

def generate_ai_commentary(
    company_info: CompanyInfo,
    metrics: ValuationMetrics,
    qualitative: QualitativeScores,
    valuation: ValuationResult
) -> AICommentary:
    """Generate investment-grade AI commentary"""
    strengths = []
    risks = []
    drivers = []
    
    # Analyze strengths
    if metrics.growth_rate > 80:
        strengths.append(f"Exceptional {metrics.growth_rate}% YoY growth demonstrates strong product-market fit")
    elif metrics.growth_rate > 50:
        strengths.append(f"Strong {metrics.growth_rate}% growth rate positions company for rapid scaling")
    
    if metrics.gross_margin > 75:
        strengths.append(f"Industry-leading {metrics.gross_margin}% gross margin indicates strong unit economics")
    elif metrics.gross_margin > 60:
        strengths.append(f"Healthy {metrics.gross_margin}% gross margin supports sustainable growth")
    
    if metrics.nrr > 120:
        strengths.append(f"Excellent {metrics.nrr}% NRR indicates strong customer expansion and satisfaction")
    elif metrics.nrr > 105:
        strengths.append(f"Solid {metrics.nrr}% NRR demonstrates customer retention strength")
    
    if qualitative.market_size == "Large":
        strengths.append("Large addressable market provides significant expansion runway")
    
    if qualitative.competitive_moat == "Strong":
        strengths.append("Strong competitive moat protects market position")
    
    # Analyze risks
    if metrics.growth_rate < 30:
        risks.append(f"{metrics.growth_rate}% growth rate may challenge future fundraising at premium valuations")
    
    if metrics.gross_margin < 50:
        risks.append(f"{metrics.gross_margin}% gross margin indicates unit economics challenges requiring attention")
    
    if metrics.nrr < 100:
        risks.append(f"Net churn at {metrics.nrr}% NRR requires immediate retention focus")
    
    if qualitative.competitive_moat == "Low":
        risks.append("Limited competitive differentiation increases market risk")
    
    if qualitative.product_maturity <= 2:
        risks.append("Early-stage product may face execution risk in scaling")
    
    if metrics.team_size < 10:
        risks.append(f"Team of {metrics.team_size} may face scaling challenges")
    
    # Valuation drivers
    drivers.append(f"ARR of ${valuation.arr_used:,.0f} provides revenue base for multiple-based valuation")
    drivers.append(f"{valuation.multiple_used}x revenue multiple applied based on growth profile and market position")
    
    total_adj = sum(adj.adjustment for adj in valuation.adjustments)
    if total_adj > 0:
        drivers.append(f"Net positive {total_adj*100:.0f}% adjustment to base multiple for strong fundamentals")
    elif total_adj < 0:
        drivers.append(f"Net negative {abs(total_adj)*100:.0f}% adjustment to base multiple for risk factors")
    
    # Exit readiness assessment
    if metrics.growth_rate > 50 and metrics.gross_margin > 60 and metrics.nrr > 100:
        exit_readiness = "HIGH - Company demonstrates metrics attractive to both strategic and financial buyers. Recommend preparing data room and advisor engagement within 18-24 months."
    elif metrics.growth_rate > 30 and metrics.gross_margin > 50:
        exit_readiness = "MEDIUM - Fundamentals support exit discussions, but improving growth rate and retention metrics would strengthen negotiating position. Consider 2-3 year optimization window."
    else:
        exit_readiness = "DEVELOPING - Focus on improving core metrics before exit preparation. Priority areas: growth acceleration, margin improvement, and retention. 3-5 year horizon recommended."
    
    # Generate summary
    arr_str = f"${metrics.arr/1000000:.1f}M" if metrics.arr >= 1000000 else f"${metrics.arr/1000:.0f}K"
    val_str = f"${valuation.base/1000000:.1f}M" if valuation.base >= 1000000 else f"${valuation.base/1000:.0f}K"
    
    summary = f"{company_info.company_name} is a {company_info.stage} stage {company_info.business_model} company operating in the {company_info.industry} sector. "
    summary += f"With {arr_str} ARR growing at {metrics.growth_rate}% YoY and {metrics.gross_margin}% gross margins, the company demonstrates "
    
    if metrics.growth_rate > 50 and metrics.gross_margin > 60:
        summary += "strong fundamentals suitable for premium valuation. "
    elif metrics.growth_rate > 30:
        summary += "solid fundamentals with room for optimization. "
    else:
        summary += "early-stage metrics requiring focused execution. "
    
    summary += f"Base case valuation of {val_str} reflects a {valuation.multiple_used}x revenue multiple, "
    summary += f"adjusted from the {valuation.base_multiple}x sector baseline based on company-specific factors."
    
    return AICommentary(
        key_strengths=strengths if strengths else ["Company demonstrates potential in target market"],
        key_risks=risks if risks else ["Standard execution risks for stage"],
        valuation_drivers=drivers,
        exit_readiness=exit_readiness,
        summary=summary
    )

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
    
    company_info = valuation.get("company_info", {})
    
    # Generate PDF using fpdf2
    pdf_bytes = generate_valuation_pdf(valuation)
    
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
    
    company_info = valuation.get("company_info", {})
    
    # Generate PDF using fpdf2
    pdf_bytes = generate_valuation_pdf(valuation)
    
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
