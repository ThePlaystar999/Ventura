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

# ============ EXIT READINESS SCORE MODELS ============

class ExitReadinessInputs(BaseModel):
    """Extended inputs for Exit Readiness Score calculation"""
    # Financial Quality
    arr: float = 0
    growth_rate: float = 0
    churn_rate: float = 5  # Monthly churn %
    nrr: float = 100  # Net Revenue Retention %
    
    # Revenue Predictability
    recurring_revenue_pct: float = 80  # % of revenue that's recurring
    has_annual_contracts: bool = False
    max_customer_concentration: float = 20  # % revenue from largest customer
    has_stripe_verified: bool = False
    
    # Operational Transferability
    founder_hours_per_week: float = 40
    has_documented_sops: bool = False
    tech_stack: str = "Other"  # Rails, Node, Python, Laravel, PHP, Other
    has_automated_support: bool = False
    
    # Market Attractiveness
    is_b2b: bool = True
    has_clear_icp: bool = False
    has_tam_documented: bool = False
    low_fragmentation_risk: bool = True
    
    # Risk Factors
    seo_traffic_pct: float = 30  # % of traffic from SEO
    has_legal_docs: bool = True
    has_12mo_financials: bool = True

class CategoryScore(BaseModel):
    category: str
    score: float
    max_score: float
    percentage: float
    breakdown: List[dict] = []

class ExitReadinessResult(BaseModel):
    total_score: float
    status_label: str
    status_color: str
    category_scores: List[CategoryScore]
    percentile_estimate: int
    improvement_suggestions: List[str] = []

# ============ BUYER FIT MODELS ============

class BuyerFitResult(BaseModel):
    solo_operator_fit: float
    solo_operator_factors: List[dict]
    micro_pe_fit: float
    micro_pe_factors: List[dict]

# ============ OPTIMIZATION ROADMAP MODELS ============

class OptimizationAction(BaseModel):
    action: str
    description: str
    impact_score: int  # Points added to ERS
    impact_multiple: float  # Multiple increase estimate
    difficulty: str  # Low, Medium, High
    time_estimate: str
    category: str
    priority: int  # 1-10, higher = more important

class OptimizationRoadmapResult(BaseModel):
    actions: List[OptimizationAction]
    total_potential_score_gain: int
    total_potential_multiple_gain: float

# ============ DEAL KILLER MODELS ============

class DealKiller(BaseModel):
    flag: str
    description: str
    severity: str  # Critical, High, Medium
    recommendation: str

class DealKillerResult(BaseModel):
    deal_killers: List[DealKiller]
    severity_level: str  # None, Warning, Critical
    has_critical: bool
    total_issues: int

# ============ MULTIPLE IMPACT SIMULATOR MODELS ============

class SimulatorScenario(BaseModel):
    scenario_id: str
    label: str
    description: str
    enabled: bool = False
    multiple_impact: float
    category: str

class SimulatorResult(BaseModel):
    current_multiple: float
    projected_multiple: float
    current_valuation: float
    projected_valuation: float
    delta_value: float
    delta_percentage: float
    active_scenarios: List[str]

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
    "Subscription (SaaS)": {
        "Bootstrapped": 3.0,
        "Pre-seed": 5.0,
        "Seed": 8.0,
        "Series A": 12.0,
        "Series B": 15.0,
        "Series C+": 18.0
    },
    "Marketplace": {
        "Bootstrapped": 2.0,
        "Pre-seed": 3.0,
        "Seed": 5.0,
        "Series A": 8.0,
        "Series B": 10.0,
        "Series C+": 12.0
    },
    "E-Commerce": {
        "Bootstrapped": 1.5,
        "Pre-seed": 2.0,
        "Seed": 3.0,
        "Series A": 5.0,
        "Series B": 6.0,
        "Series C+": 8.0
    },
    "Transactional": {
        "Bootstrapped": 2.5,
        "Pre-seed": 4.0,
        "Seed": 6.0,
        "Series A": 10.0,
        "Series B": 12.0,
        "Series C+": 15.0
    },
    "Usage-Based": {
        "Bootstrapped": 3.0,
        "Pre-seed": 5.0,
        "Seed": 8.0,
        "Series A": 12.0,
        "Series B": 15.0,
        "Series C+": 18.0
    },
    "Freemium": {
        "Bootstrapped": 2.0,
        "Pre-seed": 4.0,
        "Seed": 7.0,
        "Series A": 10.0,
        "Series B": 13.0,
        "Series C+": 16.0
    },
    "Enterprise": {
        "Bootstrapped": 4.0,
        "Pre-seed": 6.0,
        "Seed": 10.0,
        "Series A": 14.0,
        "Series B": 18.0,
        "Series C+": 22.0
    },
    "Advertising": {
        "Bootstrapped": 1.5,
        "Pre-seed": 2.5,
        "Seed": 4.0,
        "Series A": 6.0,
        "Series B": 8.0,
        "Series C+": 10.0
    },
    "Other": {
        "Bootstrapped": 2.0,
        "Pre-seed": 4.0,
        "Seed": 6.0,
        "Series A": 9.0,
        "Series B": 12.0,
        "Series C+": 15.0
    }
}

# Multiple caps by stage (prevent absurd outputs)
MULTIPLE_CAPS = {
    "Bootstrapped": 10.0,
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
        "Bootstrapped": {"exceptional": 100, "strong": 50, "moderate": 25},
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
        "Subscription (SaaS)": {"excellent": 80, "good": 70, "acceptable": 60},
        "Marketplace": {"excellent": 70, "good": 50, "acceptable": 35},
        "E-Commerce": {"excellent": 50, "good": 35, "acceptable": 25},
        "Transactional": {"excellent": 60, "good": 45, "acceptable": 30},
        "Usage-Based": {"excellent": 75, "good": 65, "acceptable": 55},
        "Freemium": {"excellent": 75, "good": 60, "acceptable": 45},
        "Enterprise": {"excellent": 85, "good": 75, "acceptable": 65},
        "Advertising": {"excellent": 60, "good": 45, "acceptable": 30},
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

# ============ EXIT READINESS SCORE ENGINE ============

def calculate_exit_readiness_score(
    metrics: ValuationMetrics,
    exit_inputs: ExitReadinessInputs
) -> ExitReadinessResult:
    """
    Calculate Exit Readiness Score (0-100) with weighted categories.
    Deterministic and explainable scoring.
    """
    category_scores = []
    total_score = 0.0
    improvement_suggestions = []
    
    # CATEGORY A — Financial Quality (30 pts max)
    financial_score = 0.0
    financial_breakdown = []
    
    # ARR scoring
    arr = metrics.arr if metrics.arr > 0 else metrics.mrr * 12
    if arr >= 25000:
        financial_score += 10
        financial_breakdown.append({"item": "ARR >= $25k", "points": 10})
    elif arr >= 10000:
        financial_score += 7
        financial_breakdown.append({"item": "ARR $10-25k", "points": 7})
    elif arr >= 1000:
        financial_score += 4
        financial_breakdown.append({"item": "ARR $1-10k", "points": 4})
    else:
        financial_score += 1
        financial_breakdown.append({"item": "ARR < $1k", "points": 1})
        improvement_suggestions.append("Increase ARR to $25k+ for maximum financial score")
    
    # Growth scoring
    growth = metrics.growth_rate
    if growth > 50:
        financial_score += 6
        financial_breakdown.append({"item": "Growth > 50%", "points": 6})
    elif growth >= 20:
        financial_score += 4
        financial_breakdown.append({"item": "Growth 20-50%", "points": 4})
    else:
        financial_score += 2
        financial_breakdown.append({"item": "Growth < 20%", "points": 2})
        improvement_suggestions.append("Accelerate growth rate to 50%+ for premium positioning")
    
    # Churn scoring
    churn = exit_inputs.churn_rate
    if churn < 5:
        financial_score += 6
        financial_breakdown.append({"item": "Churn < 5%", "points": 6})
    elif churn <= 8:
        financial_score += 4
        financial_breakdown.append({"item": "Churn 5-8%", "points": 4})
    else:
        financial_score += 1
        financial_breakdown.append({"item": "Churn > 8%", "points": 1})
        improvement_suggestions.append("Reduce churn below 5% to improve retention metrics")
    
    # NRR scoring
    nrr = exit_inputs.nrr if exit_inputs.nrr else metrics.nrr
    if nrr > 110:
        financial_score += 8
        financial_breakdown.append({"item": "NRR > 110%", "points": 8})
    elif nrr >= 100:
        financial_score += 6
        financial_breakdown.append({"item": "NRR 100-110%", "points": 6})
    else:
        financial_score += 2
        financial_breakdown.append({"item": "NRR < 100%", "points": 2})
        improvement_suggestions.append("Improve NRR to 110%+ through upsells and expansion")
    
    financial_score = min(financial_score, 30)  # Cap at 30
    category_scores.append(CategoryScore(
        category="Financial Quality",
        score=financial_score,
        max_score=30,
        percentage=round((financial_score / 30) * 100, 1),
        breakdown=financial_breakdown
    ))
    total_score += financial_score
    
    # CATEGORY B — Revenue Predictability (20 pts max)
    predictability_score = 0.0
    predictability_breakdown = []
    
    if exit_inputs.recurring_revenue_pct > 90:
        predictability_score += 8
        predictability_breakdown.append({"item": "Recurring > 90%", "points": 8})
    elif exit_inputs.recurring_revenue_pct > 70:
        predictability_score += 5
        predictability_breakdown.append({"item": "Recurring 70-90%", "points": 5})
    else:
        predictability_score += 2
        predictability_breakdown.append({"item": "Recurring < 70%", "points": 2})
        improvement_suggestions.append("Increase recurring revenue to 90%+ for predictable income")
    
    if exit_inputs.has_annual_contracts:
        predictability_score += 5
        predictability_breakdown.append({"item": "Annual contracts", "points": 5})
    else:
        improvement_suggestions.append("Offer annual contracts to lock in revenue")
    
    if exit_inputs.max_customer_concentration <= 30:
        predictability_score += 4
        predictability_breakdown.append({"item": "No customer > 30%", "points": 4})
    else:
        predictability_breakdown.append({"item": "Customer concentration risk", "points": 0})
        improvement_suggestions.append("Reduce customer concentration below 30%")
    
    if exit_inputs.has_stripe_verified:
        predictability_score += 3
        predictability_breakdown.append({"item": "Stripe verified", "points": 3})
    
    predictability_score = min(predictability_score, 20)
    category_scores.append(CategoryScore(
        category="Revenue Predictability",
        score=predictability_score,
        max_score=20,
        percentage=round((predictability_score / 20) * 100, 1),
        breakdown=predictability_breakdown
    ))
    total_score += predictability_score
    
    # CATEGORY C — Operational Transferability (20 pts max)
    operational_score = 0.0
    operational_breakdown = []
    
    if exit_inputs.founder_hours_per_week < 20:
        operational_score += 8
        operational_breakdown.append({"item": "Founder < 20h/week", "points": 8})
    elif exit_inputs.founder_hours_per_week < 30:
        operational_score += 5
        operational_breakdown.append({"item": "Founder 20-30h/week", "points": 5})
    else:
        operational_score += 2
        operational_breakdown.append({"item": "Founder > 30h/week", "points": 2})
        improvement_suggestions.append("Reduce founder dependency to < 20 hours/week")
    
    if exit_inputs.has_documented_sops:
        operational_score += 5
        operational_breakdown.append({"item": "SOPs documented", "points": 5})
    else:
        improvement_suggestions.append("Document standard operating procedures")
    
    clean_stacks = ["Rails", "Node", "Python", "Laravel", "PHP"]
    if exit_inputs.tech_stack in clean_stacks:
        operational_score += 4
        operational_breakdown.append({"item": f"Clean tech stack ({exit_inputs.tech_stack})", "points": 4})
    else:
        operational_score += 2
        operational_breakdown.append({"item": "Non-standard tech stack", "points": 2})
    
    if exit_inputs.has_automated_support:
        operational_score += 3
        operational_breakdown.append({"item": "Automated support", "points": 3})
    
    operational_score = min(operational_score, 20)
    category_scores.append(CategoryScore(
        category="Operational Transferability",
        score=operational_score,
        max_score=20,
        percentage=round((operational_score / 20) * 100, 1),
        breakdown=operational_breakdown
    ))
    total_score += operational_score
    
    # CATEGORY D — Market Attractiveness (15 pts max)
    market_score = 0.0
    market_breakdown = []
    
    if exit_inputs.is_b2b:
        market_score += 6
        market_breakdown.append({"item": "B2B model", "points": 6})
    else:
        market_score += 3
        market_breakdown.append({"item": "B2C model", "points": 3})
    
    if exit_inputs.has_clear_icp:
        market_score += 4
        market_breakdown.append({"item": "Clear ICP defined", "points": 4})
    else:
        improvement_suggestions.append("Define clear Ideal Customer Profile (ICP)")
    
    if exit_inputs.has_tam_documented:
        market_score += 3
        market_breakdown.append({"item": "TAM documented", "points": 3})
    
    if exit_inputs.low_fragmentation_risk:
        market_score += 2
        market_breakdown.append({"item": "Low fragmentation risk", "points": 2})
    
    market_score = min(market_score, 15)
    category_scores.append(CategoryScore(
        category="Market Attractiveness",
        score=market_score,
        max_score=15,
        percentage=round((market_score / 15) * 100, 1),
        breakdown=market_breakdown
    ))
    total_score += market_score
    
    # CATEGORY E — Risk Profile (15 pts max, starts at 15 and subtracts)
    risk_score = 15.0
    risk_breakdown = []
    
    if exit_inputs.seo_traffic_pct >= 50:
        risk_score -= 4
        risk_breakdown.append({"item": "SEO traffic > 50%", "points": -4})
        improvement_suggestions.append("Diversify traffic sources beyond SEO")
    
    if exit_inputs.max_customer_concentration >= 40:
        risk_score -= 6
        risk_breakdown.append({"item": "Customer > 40% revenue", "points": -6})
    
    if not exit_inputs.has_legal_docs:
        risk_score -= 3
        risk_breakdown.append({"item": "Missing legal docs", "points": -3})
        improvement_suggestions.append("Ensure all legal documentation is in place")
    
    if not exit_inputs.has_12mo_financials:
        risk_score -= 2
        risk_breakdown.append({"item": "No 12mo financials", "points": -2})
        improvement_suggestions.append("Maintain 12+ months of financial records")
    
    if not risk_breakdown:
        risk_breakdown.append({"item": "No major risks", "points": 0})
    
    risk_score = max(risk_score, 0)
    category_scores.append(CategoryScore(
        category="Risk Profile",
        score=risk_score,
        max_score=15,
        percentage=round((risk_score / 15) * 100, 1),
        breakdown=risk_breakdown
    ))
    total_score += risk_score
    
    # Clamp total score
    total_score = max(0, min(100, total_score))
    
    # Classification
    if total_score >= 85:
        status_label = "Premium Exit Candidate"
        status_color = "purple"
    elif total_score >= 70:
        status_label = "Attractive Asset"
        status_color = "green"
    elif total_score >= 40:
        status_label = "Needs Optimization"
        status_color = "yellow"
    else:
        status_label = "High Risk Asset"
        status_color = "red"
    
    # Percentile estimate based on ARR bucket
    if arr >= 100000:
        percentile_estimate = min(95, int(total_score * 0.95))
    elif arr >= 50000:
        percentile_estimate = min(85, int(total_score * 0.85))
    elif arr >= 25000:
        percentile_estimate = min(75, int(total_score * 0.75))
    else:
        percentile_estimate = min(60, int(total_score * 0.6))
    
    return ExitReadinessResult(
        total_score=round(total_score, 1),
        status_label=status_label,
        status_color=status_color,
        category_scores=category_scores,
        percentile_estimate=percentile_estimate,
        improvement_suggestions=improvement_suggestions[:5]  # Top 5 suggestions
    )

# ============ BUYER FIT ENGINE ============

def calculate_buyer_fit(
    metrics: ValuationMetrics,
    exit_inputs: ExitReadinessInputs
) -> BuyerFitResult:
    """
    Calculate fit scores for different buyer profiles.
    Solo Operator and Micro PE profiles.
    """
    arr = metrics.arr if metrics.arr > 0 else metrics.mrr * 12
    mrr = metrics.mrr if metrics.mrr > 0 else arr / 12
    
    # ===== PROFILE 1: SOLO OPERATOR =====
    solo_score = 0.0
    solo_factors = []
    
    # MRR 500-1,200 (25 pts)
    if 500 <= mrr <= 1200:
        solo_score += 25
        solo_factors.append({"factor": "MRR in sweet spot ($500-$1,200)", "points": 25, "positive": True})
    elif mrr < 500:
        points = max(0, 15 - (500 - mrr) / 50)
        solo_score += points
        solo_factors.append({"factor": f"MRR below target (${mrr:.0f})", "points": round(points, 1), "positive": False})
    elif mrr <= 3000:
        points = max(0, 20 - (mrr - 1200) / 100)
        solo_score += points
        solo_factors.append({"factor": f"MRR above ideal but manageable (${mrr:.0f})", "points": round(points, 1), "positive": True})
    else:
        solo_factors.append({"factor": "MRR too high for solo operation", "points": 0, "positive": False})
    
    # Price < 30k (20 pts) - estimate based on 2-3x ARR
    estimated_price = arr * 2.5
    if estimated_price < 30000:
        solo_score += 20
        solo_factors.append({"factor": "Affordable price point", "points": 20, "positive": True})
    elif estimated_price < 50000:
        solo_score += 10
        solo_factors.append({"factor": "Price slightly high but reachable", "points": 10, "positive": True})
    else:
        solo_factors.append({"factor": "Price likely too high for solos", "points": 0, "positive": False})
    
    # Churn <5% (20 pts)
    churn = exit_inputs.churn_rate
    if churn < 5:
        solo_score += 20
        solo_factors.append({"factor": "Low churn (manageable)", "points": 20, "positive": True})
    elif churn < 8:
        solo_score += 10
        solo_factors.append({"factor": "Moderate churn", "points": 10, "positive": True})
    else:
        solo_factors.append({"factor": "High churn (risky for solos)", "points": 0, "positive": False})
    
    # Simple tech stack (15 pts)
    simple_stacks = ["Rails", "Node", "Python", "Laravel", "PHP"]
    if exit_inputs.tech_stack in simple_stacks:
        solo_score += 15
        solo_factors.append({"factor": f"Simple tech stack ({exit_inputs.tech_stack})", "points": 15, "positive": True})
    else:
        solo_score += 5
        solo_factors.append({"factor": "Complex tech stack", "points": 5, "positive": False})
    
    # Niche focused / low founder hours (20 pts)
    if exit_inputs.founder_hours_per_week < 25:
        solo_score += 20
        solo_factors.append({"factor": "Low time commitment required", "points": 20, "positive": True})
    elif exit_inputs.founder_hours_per_week < 35:
        solo_score += 10
        solo_factors.append({"factor": "Moderate time commitment", "points": 10, "positive": True})
    else:
        solo_factors.append({"factor": "High time commitment (challenging)", "points": 0, "positive": False})
    
    solo_fit = min(100, solo_score)
    
    # ===== PROFILE 2: MICRO PE =====
    pe_score = 0.0
    pe_factors = []
    
    # ARR >300k (25 pts)
    if arr >= 300000:
        pe_score += 25
        pe_factors.append({"factor": "ARR meets PE threshold ($300k+)", "points": 25, "positive": True})
    elif arr >= 200000:
        pe_score += 15
        pe_factors.append({"factor": "ARR approaching PE range", "points": 15, "positive": True})
    elif arr >= 100000:
        pe_score += 8
        pe_factors.append({"factor": "ARR below PE ideal but growing", "points": 8, "positive": False})
    else:
        pe_factors.append({"factor": "ARR too low for PE interest", "points": 0, "positive": False})
    
    # 12+ months stable (20 pts)
    if exit_inputs.has_12mo_financials:
        pe_score += 20
        pe_factors.append({"factor": "12+ months financial history", "points": 20, "positive": True})
    else:
        pe_score += 5
        pe_factors.append({"factor": "Limited financial history", "points": 5, "positive": False})
    
    # B2B (20 pts)
    if exit_inputs.is_b2b:
        pe_score += 20
        pe_factors.append({"factor": "B2B business model", "points": 20, "positive": True})
    else:
        pe_score += 8
        pe_factors.append({"factor": "B2C model (less PE interest)", "points": 8, "positive": False})
    
    # NRR >100% (20 pts)
    nrr = metrics.nrr if metrics.nrr else exit_inputs.nrr
    if nrr > 100:
        pe_score += 20
        pe_factors.append({"factor": f"Strong NRR ({nrr}%)", "points": 20, "positive": True})
    elif nrr >= 95:
        pe_score += 12
        pe_factors.append({"factor": f"Acceptable NRR ({nrr}%)", "points": 12, "positive": True})
    else:
        pe_factors.append({"factor": f"Low NRR ({nrr}%)", "points": 0, "positive": False})
    
    # Predictable growth (15 pts)
    growth = metrics.growth_rate
    if 15 <= growth <= 50:
        pe_score += 15
        pe_factors.append({"factor": "Predictable, sustainable growth", "points": 15, "positive": True})
    elif growth > 50:
        pe_score += 10
        pe_factors.append({"factor": "High growth (may be unstable)", "points": 10, "positive": True})
    elif growth >= 5:
        pe_score += 8
        pe_factors.append({"factor": "Modest growth", "points": 8, "positive": False})
    else:
        pe_factors.append({"factor": "Flat or declining growth", "points": 0, "positive": False})
    
    pe_fit = min(100, pe_score)
    
    return BuyerFitResult(
        solo_operator_fit=round(solo_fit, 1),
        solo_operator_factors=solo_factors,
        micro_pe_fit=round(pe_fit, 1),
        micro_pe_factors=pe_factors
    )

# ============ OPTIMIZATION ROADMAP ENGINE ============

def generate_optimization_roadmap(
    metrics: ValuationMetrics,
    exit_inputs: ExitReadinessInputs
) -> OptimizationRoadmapResult:
    """
    Generate dynamic improvement suggestions with impact estimates.
    """
    actions = []
    arr = metrics.arr if metrics.arr > 0 else metrics.mrr * 12
    
    # Churn optimization
    if exit_inputs.churn_rate > 5:
        impact = 5 if exit_inputs.churn_rate > 8 else 3
        actions.append(OptimizationAction(
            action="Reduce Customer Churn",
            description=f"Current churn is {exit_inputs.churn_rate}%. Implement retention strategies: onboarding improvements, proactive support, and customer success programs.",
            impact_score=impact,
            impact_multiple=0.3 if exit_inputs.churn_rate > 8 else 0.15,
            difficulty="Medium",
            time_estimate="3-6 months",
            category="Financial Quality",
            priority=9 if exit_inputs.churn_rate > 8 else 7
        ))
    
    # Founder hours optimization
    if exit_inputs.founder_hours_per_week > 30:
        actions.append(OptimizationAction(
            action="Reduce Founder Dependency",
            description=f"Currently {exit_inputs.founder_hours_per_week}h/week. Hire key roles, document processes, and automate repetitive tasks.",
            impact_score=6,
            impact_multiple=0.4,
            difficulty="High",
            time_estimate="6-12 months",
            category="Operational Transferability",
            priority=8
        ))
    elif exit_inputs.founder_hours_per_week > 20:
        actions.append(OptimizationAction(
            action="Further Reduce Founder Involvement",
            description=f"Currently {exit_inputs.founder_hours_per_week}h/week. Target <20 hours through delegation and automation.",
            impact_score=3,
            impact_multiple=0.2,
            difficulty="Medium",
            time_estimate="3-6 months",
            category="Operational Transferability",
            priority=5
        ))
    
    # Annual contracts
    if not exit_inputs.has_annual_contracts:
        actions.append(OptimizationAction(
            action="Introduce Annual Contracts",
            description="Offer annual pricing with discount incentive (15-20% off). Improves revenue predictability and cash flow.",
            impact_score=5,
            impact_multiple=0.25,
            difficulty="Low",
            time_estimate="1-2 months",
            category="Revenue Predictability",
            priority=8
        ))
    
    # ARR growth
    if arr < 25000:
        actions.append(OptimizationAction(
            action="Achieve $25K ARR Milestone",
            description=f"Current ARR: ${arr:,.0f}. Focus on customer acquisition and pricing optimization to reach minimum viable scale.",
            impact_score=6,
            impact_multiple=0.5,
            difficulty="High",
            time_estimate="6-12 months",
            category="Financial Quality",
            priority=10
        ))
    elif arr < 100000:
        actions.append(OptimizationAction(
            action="Scale to $100K ARR",
            description=f"Current ARR: ${arr:,.0f}. Expand marketing channels and optimize conversion funnel.",
            impact_score=4,
            impact_multiple=0.3,
            difficulty="Medium",
            time_estimate="6-12 months",
            category="Financial Quality",
            priority=7
        ))
    
    # SOP documentation
    if not exit_inputs.has_documented_sops:
        actions.append(OptimizationAction(
            action="Document Standard Operating Procedures",
            description="Create comprehensive SOPs for all critical processes: customer support, onboarding, billing, development.",
            impact_score=5,
            impact_multiple=0.2,
            difficulty="Medium",
            time_estimate="2-4 months",
            category="Operational Transferability",
            priority=7
        ))
    
    # Customer concentration
    if exit_inputs.max_customer_concentration > 30:
        actions.append(OptimizationAction(
            action="Reduce Customer Concentration",
            description=f"Largest customer is {exit_inputs.max_customer_concentration}% of revenue. Diversify customer base to reduce risk.",
            impact_score=4,
            impact_multiple=0.25,
            difficulty="High",
            time_estimate="6-12 months",
            category="Risk Profile",
            priority=8
        ))
    
    # NRR improvement
    nrr = metrics.nrr if metrics.nrr else exit_inputs.nrr
    if nrr < 100:
        actions.append(OptimizationAction(
            action="Improve Net Revenue Retention",
            description=f"Current NRR: {nrr}%. Implement upsell paths, usage-based pricing tiers, and expansion revenue strategies.",
            impact_score=6,
            impact_multiple=0.35,
            difficulty="Medium",
            time_estimate="3-6 months",
            category="Financial Quality",
            priority=9
        ))
    
    # Recurring revenue
    if exit_inputs.recurring_revenue_pct < 90:
        actions.append(OptimizationAction(
            action="Increase Recurring Revenue",
            description=f"Currently {exit_inputs.recurring_revenue_pct}% recurring. Convert one-time services to subscriptions.",
            impact_score=3,
            impact_multiple=0.2,
            difficulty="Medium",
            time_estimate="3-6 months",
            category="Revenue Predictability",
            priority=6
        ))
    
    # SEO dependency
    if exit_inputs.seo_traffic_pct >= 50:
        actions.append(OptimizationAction(
            action="Diversify Traffic Sources",
            description=f"SEO accounts for {exit_inputs.seo_traffic_pct}% of traffic. Build paid, referral, and direct channels.",
            impact_score=4,
            impact_multiple=0.2,
            difficulty="Medium",
            time_estimate="4-8 months",
            category="Risk Profile",
            priority=6
        ))
    
    # ICP definition
    if not exit_inputs.has_clear_icp:
        actions.append(OptimizationAction(
            action="Define Ideal Customer Profile",
            description="Document your ICP with demographics, firmographics, pain points, and buying behavior.",
            impact_score=4,
            impact_multiple=0.15,
            difficulty="Low",
            time_estimate="2-4 weeks",
            category="Market Attractiveness",
            priority=5
        ))
    
    # Legal documentation
    if not exit_inputs.has_legal_docs:
        actions.append(OptimizationAction(
            action="Complete Legal Documentation",
            description="Ensure all contracts, IP assignments, privacy policies, and terms of service are in place.",
            impact_score=3,
            impact_multiple=0.1,
            difficulty="Low",
            time_estimate="2-4 weeks",
            category="Risk Profile",
            priority=9
        ))
    
    # Sort by priority
    actions.sort(key=lambda x: x.priority, reverse=True)
    
    total_score_gain = sum(a.impact_score for a in actions)
    total_multiple_gain = sum(a.impact_multiple for a in actions)
    
    return OptimizationRoadmapResult(
        actions=actions,
        total_potential_score_gain=total_score_gain,
        total_potential_multiple_gain=round(total_multiple_gain, 2)
    )

# ============ DEAL KILLER DETECTION ENGINE ============

def detect_deal_killers(
    metrics: ValuationMetrics,
    exit_inputs: ExitReadinessInputs
) -> DealKillerResult:
    """
    Detect potential deal killers that could derail an exit.
    """
    deal_killers = []
    
    # Revenue concentration >40%
    if exit_inputs.max_customer_concentration > 40:
        deal_killers.append(DealKiller(
            flag="Revenue Concentration",
            description=f"Your largest customer represents {exit_inputs.max_customer_concentration}% of revenue. Most buyers consider >40% a critical risk.",
            severity="Critical",
            recommendation="Aggressively diversify customer base before going to market. Consider delaying exit 6-12 months to reduce concentration."
        ))
    elif exit_inputs.max_customer_concentration > 30:
        deal_killers.append(DealKiller(
            flag="Revenue Concentration Warning",
            description=f"Your largest customer represents {exit_inputs.max_customer_concentration}% of revenue. This will be flagged in due diligence.",
            severity="High",
            recommendation="Focus on acquiring new customers to reduce concentration below 25% before exit."
        ))
    
    # No verified payments (Stripe)
    if not exit_inputs.has_stripe_verified:
        deal_killers.append(DealKiller(
            flag="Unverified Revenue",
            description="Revenue is not verified through a payment processor. Buyers require proof of revenue.",
            severity="High",
            recommendation="Connect Stripe, PayPal, or equivalent to provide verifiable transaction history."
        ))
    
    # No 12 months history
    if not exit_inputs.has_12mo_financials:
        deal_killers.append(DealKiller(
            flag="Insufficient Financial History",
            description="Less than 12 months of financial records. Most buyers require 12-24 months minimum.",
            severity="Critical",
            recommendation="Wait until you have at least 12 months of documented financials before pursuing exit."
        ))
    
    # Churn >10%
    if exit_inputs.churn_rate > 10:
        deal_killers.append(DealKiller(
            flag="Excessive Churn",
            description=f"Monthly churn of {exit_inputs.churn_rate}% is unsustainable. Buyers will see this as a failing business.",
            severity="Critical",
            recommendation="Pause exit plans. Focus entirely on retention: improve onboarding, add customer success, identify churn causes."
        ))
    elif exit_inputs.churn_rate > 8:
        deal_killers.append(DealKiller(
            flag="High Churn Warning",
            description=f"Monthly churn of {exit_inputs.churn_rate}% is above acceptable levels for most buyers.",
            severity="High",
            recommendation="Implement retention strategies before going to market. Target <5% monthly churn."
        ))
    
    # Founder dependency >40h/week
    if exit_inputs.founder_hours_per_week > 40:
        deal_killers.append(DealKiller(
            flag="Founder Dependency",
            description=f"Founder works {exit_inputs.founder_hours_per_week}+ hours/week. Business is not transferable in current state.",
            severity="Critical",
            recommendation="Hire key roles, document all processes, automate operations. Reduce to <20 hours before exit."
        ))
    elif exit_inputs.founder_hours_per_week > 30:
        deal_killers.append(DealKiller(
            flag="High Founder Involvement",
            description=f"Founder works {exit_inputs.founder_hours_per_week} hours/week. Many buyers will see this as too risky.",
            severity="High",
            recommendation="Delegate responsibilities and create SOPs. Target <20 hours for attractive exit."
        ))
    
    # No legal documentation
    if not exit_inputs.has_legal_docs:
        deal_killers.append(DealKiller(
            flag="Missing Legal Documentation",
            description="Critical legal documents are missing. This will halt any serious acquisition process.",
            severity="High",
            recommendation="Ensure you have: Terms of Service, Privacy Policy, IP assignments, employee/contractor agreements."
        ))
    
    # Determine overall severity
    critical_count = sum(1 for dk in deal_killers if dk.severity == "Critical")
    high_count = sum(1 for dk in deal_killers if dk.severity == "High")
    
    if critical_count > 0:
        severity_level = "Critical"
    elif high_count > 0:
        severity_level = "Warning"
    else:
        severity_level = "None"
    
    return DealKillerResult(
        deal_killers=deal_killers,
        severity_level=severity_level,
        has_critical=critical_count > 0,
        total_issues=len(deal_killers)
    )

# ============ MULTIPLE IMPACT SIMULATOR ENGINE ============

def simulate_multiple_impact(
    metrics: ValuationMetrics,
    exit_inputs: ExitReadinessInputs,
    current_multiple: float,
    scenarios: List[str]  # List of enabled scenario IDs
) -> SimulatorResult:
    """
    Simulate the impact of improvements on valuation multiple.
    """
    arr = metrics.arr if metrics.arr > 0 else metrics.mrr * 12
    current_valuation = arr * current_multiple
    
    projected_multiple = current_multiple
    active_scenarios = []
    
    # Scenario: Churn reduced to 3%
    if "churn_3pct" in scenarios and exit_inputs.churn_rate > 3:
        improvement = min(0.5, (exit_inputs.churn_rate - 3) * 0.1)
        projected_multiple += improvement
        active_scenarios.append("churn_3pct")
    
    # Scenario: NRR increased to 110%
    nrr = metrics.nrr if metrics.nrr else exit_inputs.nrr
    if "nrr_110" in scenarios and nrr < 110:
        improvement = min(0.6, (110 - nrr) * 0.03)
        projected_multiple += improvement
        active_scenarios.append("nrr_110")
    
    # Scenario: ARR reaches next tier
    if "arr_next_tier" in scenarios:
        if arr < 100000:
            projected_multiple += 0.8  # Reaching $100K ARR
        elif arr < 500000:
            projected_multiple += 0.5  # Reaching $500K ARR
        elif arr < 1000000:
            projected_multiple += 0.4  # Reaching $1M ARR
        else:
            projected_multiple += 0.3  # Reaching next tier
        active_scenarios.append("arr_next_tier")
    
    # Scenario: Founder hours reduced to <20
    if "founder_20h" in scenarios and exit_inputs.founder_hours_per_week > 20:
        improvement = min(0.5, (exit_inputs.founder_hours_per_week - 20) * 0.015)
        projected_multiple += improvement
        active_scenarios.append("founder_20h")
    
    # Scenario: Annual contracts implemented
    if "annual_contracts" in scenarios and not exit_inputs.has_annual_contracts:
        projected_multiple += 0.3
        active_scenarios.append("annual_contracts")
    
    # Scenario: Customer concentration reduced to <20%
    if "concentration_20" in scenarios and exit_inputs.max_customer_concentration > 20:
        improvement = min(0.4, (exit_inputs.max_customer_concentration - 20) * 0.015)
        projected_multiple += improvement
        active_scenarios.append("concentration_20")
    
    projected_valuation = arr * projected_multiple
    delta_value = projected_valuation - current_valuation
    delta_percentage = ((projected_valuation - current_valuation) / current_valuation) * 100 if current_valuation > 0 else 0
    
    return SimulatorResult(
        current_multiple=round(current_multiple, 2),
        projected_multiple=round(projected_multiple, 2),
        current_valuation=round(current_valuation, 2),
        projected_valuation=round(projected_valuation, 2),
        delta_value=round(delta_value, 2),
        delta_percentage=round(delta_percentage, 1),
        active_scenarios=active_scenarios
    )

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
            rationale="Secondary transactions typically occur at 10-20% discount to primary valuations for liquidity. This provides near-term liquidity for founders and early investors while maintaining company trajectory."
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
    """Generate comprehensive PDF report for a valuation including Exit OS insights"""
    pdf = VenturaPDF()
    pdf.add_page()
    
    company = valuation_data.get("company_info", {})
    metrics_dict = valuation_data.get("metrics", {})
    result = valuation_data.get("result", {})
    exit_scenarios = valuation_data.get("exit_scenarios", [])
    
    # Create metric objects for calculations
    metrics = ValuationMetrics(**metrics_dict) if metrics_dict else None
    exit_inputs = ExitReadinessInputs()  # Use defaults for PDF
    
    # Company name
    pdf.set_font('Helvetica', 'B', 18)
    pdf.set_text_color(15, 23, 42)
    pdf.cell(0, 10, company.get("company_name", ""), align='C', ln=True)
    pdf.set_font('Helvetica', '', 10)
    pdf.set_text_color(100, 116, 139)
    pdf.cell(0, 6, "Exit Intelligence Report", align='C', ln=True)
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
    
    # ============ EXIT READINESS SCORE ============
    if metrics:
        ers_result = calculate_exit_readiness_score(metrics, exit_inputs)
        
        pdf.section_title("Exit Readiness Score")
        
        # Score display
        pdf.set_font('Helvetica', 'B', 24)
        score_color = (139, 92, 246) if ers_result.total_score >= 85 else \
                      (16, 185, 129) if ers_result.total_score >= 70 else \
                      (245, 158, 11) if ers_result.total_score >= 40 else (239, 68, 68)
        pdf.set_text_color(*score_color)
        pdf.cell(40, 15, f"{ers_result.total_score:.0f}/100")
        
        pdf.set_font('Helvetica', 'B', 12)
        pdf.cell(0, 15, ers_result.status_label, ln=True)
        
        pdf.set_font('Helvetica', '', 9)
        pdf.set_text_color(100, 116, 139)
        pdf.cell(0, 6, f"Top {100 - ers_result.percentile_estimate}% of businesses in your ARR range", ln=True)
        pdf.ln(5)
        
        # Category breakdown
        for cat in ers_result.category_scores:
            pdf.set_font('Helvetica', '', 9)
            pdf.set_text_color(15, 23, 42)
            pct = cat.percentage
            bar_color = (16, 185, 129) if pct >= 70 else (245, 158, 11) if pct >= 40 else (239, 68, 68)
            pdf.cell(70, 6, f"{cat.category}")
            pdf.set_font('Helvetica', 'B', 9)
            pdf.cell(30, 6, f"{cat.score:.0f}/{cat.max_score:.0f}")
            # Draw mini progress bar
            pdf.set_fill_color(226, 232, 240)
            pdf.rect(pdf.get_x(), pdf.get_y() + 1, 60, 4, 'F')
            pdf.set_fill_color(*bar_color)
            pdf.rect(pdf.get_x(), pdf.get_y() + 1, 60 * (pct/100), 4, 'F')
            pdf.ln(8)
        pdf.ln(5)
    
    # ============ BUYER FIT ANALYSIS ============
    if metrics:
        bf_result = calculate_buyer_fit(metrics, exit_inputs)
        
        pdf.section_title("Buyer Fit Analysis")
        
        # Solo Operator
        pdf.set_font('Helvetica', 'B', 11)
        pdf.set_text_color(15, 23, 42)
        pdf.cell(90, 8, "Solo Operator Fit:")
        solo_color = (16, 185, 129) if bf_result.solo_operator_fit >= 70 else \
                     (245, 158, 11) if bf_result.solo_operator_fit >= 40 else (239, 68, 68)
        pdf.set_text_color(*solo_color)
        pdf.cell(0, 8, f"{bf_result.solo_operator_fit:.0f}%", ln=True)
        
        # Micro PE
        pdf.set_font('Helvetica', 'B', 11)
        pdf.set_text_color(15, 23, 42)
        pdf.cell(90, 8, "Micro PE Fit:")
        pe_color = (16, 185, 129) if bf_result.micro_pe_fit >= 70 else \
                   (245, 158, 11) if bf_result.micro_pe_fit >= 40 else (239, 68, 68)
        pdf.set_text_color(*pe_color)
        pdf.cell(0, 8, f"{bf_result.micro_pe_fit:.0f}%", ln=True)
        
        pdf.set_font('Helvetica', '', 8)
        pdf.set_text_color(100, 116, 139)
        pdf.cell(0, 6, "Solo: MRR $500-$1.2K, <$30K price | PE: ARR $300K+, B2B, NRR >100%", ln=True)
        pdf.ln(5)
    
    # ============ DEAL KILLER FLAGS ============
    if metrics:
        dk_result = detect_deal_killers(metrics, exit_inputs)
        
        pdf.section_title("Risk Assessment")
        
        if dk_result.total_issues == 0:
            pdf.set_font('Helvetica', 'B', 10)
            pdf.set_text_color(16, 185, 129)
            pdf.cell(0, 8, "✓ No Deal Killers Detected", ln=True)
            pdf.set_font('Helvetica', '', 9)
            pdf.set_text_color(100, 116, 139)
            pdf.cell(0, 6, "Your business has no critical issues that would block an exit.", ln=True)
        else:
            pdf.set_font('Helvetica', 'B', 10)
            if dk_result.has_critical:
                pdf.set_text_color(239, 68, 68)
                pdf.cell(0, 8, f"[!] {dk_result.total_issues} Potential Deal Killer(s) - CRITICAL", ln=True)
            else:
                pdf.set_text_color(245, 158, 11)
                pdf.cell(0, 8, f"[!] {dk_result.total_issues} Issue(s) Requiring Attention", ln=True)
            
            for dk in dk_result.deal_killers:
                pdf.set_font('Helvetica', 'B', 9)
                severity_color = (239, 68, 68) if dk.severity == "Critical" else (245, 158, 11)
                pdf.set_text_color(*severity_color)
                pdf.cell(0, 6, f"• {dk.flag} ({dk.severity})", ln=True)
                pdf.set_font('Helvetica', '', 8)
                pdf.set_text_color(100, 116, 139)
                pdf.multi_cell(0, 4, f"  {dk.description}")
                pdf.ln(2)
        pdf.ln(5)
    
    # ============ OPTIMIZATION ROADMAP ============
    if metrics:
        opt_result = generate_optimization_roadmap(metrics, exit_inputs)
        
        if opt_result.actions:
            pdf.section_title("Optimization Roadmap")
            
            pdf.set_font('Helvetica', '', 9)
            pdf.set_text_color(11, 77, 187)
            pdf.cell(0, 6, f"Potential Gains: +{opt_result.total_potential_score_gain} ERS points | +{opt_result.total_potential_multiple_gain}x multiple", ln=True)
            pdf.ln(3)
            
            # Top 5 actions
            for i, action in enumerate(opt_result.actions[:5]):
                pdf.set_font('Helvetica', 'B', 9)
                pdf.set_text_color(15, 23, 42)
                pdf.cell(0, 6, f"{i+1}. {action.action}", ln=True)
                
                pdf.set_font('Helvetica', '', 8)
                pdf.set_text_color(100, 116, 139)
                pdf.cell(60, 5, f"Impact: +{action.impact_score} pts / +{action.impact_multiple}x")
                pdf.cell(40, 5, f"Difficulty: {action.difficulty}")
                pdf.cell(0, 5, f"Timeline: {action.time_estimate}", ln=True)
                pdf.ln(2)
        pdf.ln(5)
    
    # ============ COMPANY INFORMATION ============
    pdf.section_title("Company Information")
    pdf.info_row("Company", company.get("company_name", ""))
    pdf.info_row("Industry", company.get("industry", ""))
    pdf.info_row("Stage", company.get("stage", ""))
    pdf.info_row("Business Model", company.get("business_model", ""))
    pdf.info_row("Country", company.get("country", ""))
    pdf.info_row("Team Size", f"{metrics_dict.get('team_size', 0)} employees")
    pdf.ln(5)
    
    # ============ FINANCIAL METRICS ============
    pdf.section_title("Financial Metrics")
    arr = metrics_dict.get("arr", 0) or (metrics_dict.get("mrr", 0) * 12)
    pdf.info_row("Annual Recurring Revenue", f"${arr:,.0f}")
    pdf.info_row("Monthly Recurring Revenue", f"${metrics_dict.get('mrr', 0):,.0f}")
    pdf.info_row("Growth Rate (YoY)", f"{metrics_dict.get('growth_rate', 0)}%")
    pdf.info_row("Gross Margin", f"{metrics_dict.get('gross_margin', 0)}%")
    pdf.info_row("Net Revenue Retention", f"{metrics_dict.get('nrr', 100)}%")
    pdf.info_row("Valuation Multiple", f"{result.get('multiple_used', 0)}x Revenue")
    pdf.ln(5)
    
    # ============ VALUATION RANGE ============
    pdf.section_title("Valuation Range")
    low_val = result.get("low", 0)
    high_val = result.get("high", 0)
    pdf.info_row("Conservative (Low)", f"${low_val:,.0f}")
    pdf.info_row("Base Case", f"${base_val:,.0f}")
    pdf.info_row("Optimistic (High)", f"${high_val:,.0f}")
    pdf.ln(5)
    
    # ============ EXIT SCENARIOS ============
    if exit_scenarios:
        pdf.add_page()
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
    
    # ============ DISCLAIMER ============
    pdf.ln(10)
    pdf.set_font('Helvetica', 'I', 8)
    pdf.set_text_color(100, 116, 139)
    pdf.multi_cell(0, 4, "This Exit Intelligence Report is generated by Ventura's AI-powered valuation engine. It is for informational purposes only and does not constitute financial, legal, or investment advice. Actual valuations may vary based on market conditions, buyer interest, and negotiation outcomes. We recommend consulting with qualified M&A advisors before making any exit decisions.")
    
    pdf.ln(5)
    pdf.set_font('Helvetica', 'B', 8)
    pdf.cell(0, 5, f"Report Generated: {datetime.now(timezone.utc).strftime('%B %d, %Y at %H:%M UTC')}", align='C', ln=True)
    
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
    """Create a new valuation with the deterministic valuation engine"""
    # Verify project exists and belongs to user
    project = await db.projects.find_one({
        "project_id": data.project_id,
        "user_id": user.user_id
    }, {"_id": 0})
    
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Calculate valuation using the new comprehensive engine
    full_result = calculate_valuation(
        data.company_info, 
        data.metrics,
        data.qualitative
    )
    
    # Generate share token
    share_token = uuid.uuid4().hex[:16]
    
    valuation = Valuation(
        project_id=data.project_id,
        user_id=user.user_id,
        company_info=data.company_info,
        metrics=data.metrics,
        qualitative=data.qualitative,
        result=full_result.valuation,
        exit_scenarios=full_result.exit_scenarios,
        assumptions=full_result.assumptions,
        ai_commentary=full_result.ai_commentary,
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

# ============ EXIT READINESS SCORE ROUTES ============

@api_router.post("/exit-readiness/calculate", response_model=ExitReadinessResult)
async def calculate_exit_readiness(
    metrics: ValuationMetrics,
    exit_inputs: ExitReadinessInputs,
    user: UserBase = Depends(get_current_user)
):
    """Calculate Exit Readiness Score based on metrics and operational inputs"""
    result = calculate_exit_readiness_score(metrics, exit_inputs)
    return result

@api_router.post("/exit-readiness/calculate-from-valuation/{valuation_id}", response_model=ExitReadinessResult)
async def calculate_exit_readiness_from_valuation(
    valuation_id: str,
    exit_inputs: ExitReadinessInputs,
    user: UserBase = Depends(get_current_user)
):
    """Calculate Exit Readiness Score using existing valuation metrics"""
    valuation = await db.valuations.find_one({
        "valuation_id": valuation_id,
        "user_id": user.user_id
    }, {"_id": 0})
    
    if not valuation:
        raise HTTPException(status_code=404, detail="Valuation not found")
    
    metrics = ValuationMetrics(**valuation.get("metrics", {}))
    result = calculate_exit_readiness_score(metrics, exit_inputs)
    return result

@api_router.post("/buyer-fit/calculate", response_model=BuyerFitResult)
async def calculate_buyer_fit_score(
    metrics: ValuationMetrics,
    exit_inputs: ExitReadinessInputs,
    user: UserBase = Depends(get_current_user)
):
    """Calculate Buyer Fit scores for Solo Operator and Micro PE profiles"""
    result = calculate_buyer_fit(metrics, exit_inputs)
    return result

@api_router.post("/optimization-roadmap/generate", response_model=OptimizationRoadmapResult)
async def generate_roadmap(
    metrics: ValuationMetrics,
    exit_inputs: ExitReadinessInputs,
    user: UserBase = Depends(get_current_user)
):
    """Generate optimization roadmap with actionable improvements"""
    result = generate_optimization_roadmap(metrics, exit_inputs)
    return result

@api_router.post("/deal-killers/detect", response_model=DealKillerResult)
async def detect_deal_killers_endpoint(
    metrics: ValuationMetrics,
    exit_inputs: ExitReadinessInputs,
    user: UserBase = Depends(get_current_user)
):
    """Detect potential deal killers that could derail an exit"""
    result = detect_deal_killers(metrics, exit_inputs)
    return result

class SimulatorRequest(BaseModel):
    metrics: ValuationMetrics
    exit_inputs: ExitReadinessInputs
    current_multiple: float
    scenarios: List[str]

@api_router.post("/simulator/impact", response_model=SimulatorResult)
async def simulate_impact(
    request: SimulatorRequest,
    user: UserBase = Depends(get_current_user)
):
    """Simulate the impact of improvements on valuation multiple"""
    result = simulate_multiple_impact(
        request.metrics,
        request.exit_inputs,
        request.current_multiple,
        request.scenarios
    )
    return result

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
