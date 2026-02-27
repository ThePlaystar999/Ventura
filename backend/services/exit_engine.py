"""
Ventura Exit Engine Service
============================
Pure, deterministic scoring functions for exit readiness analysis.
All functions are synchronous, use no external APIs, and are fully testable.

Architecture Notes:
- All scoring logic is kept separate from API/UI concerns
- Functions are pure: same input always produces same output
- Designed for future ML model integration
- No database or network calls
"""

from typing import List, Dict, Tuple, Optional
from dataclasses import dataclass
from enum import Enum

# ============ ENUMS & CONSTANTS ============

class ExitReadinessStatus(Enum):
    HIGH_RISK = "High Risk Asset"
    NEEDS_OPTIMIZATION = "Needs Optimization"
    ATTRACTIVE = "Attractive Asset"
    PREMIUM = "Premium Exit Candidate"

class BuyerProfile(Enum):
    SOLO_OPERATOR = "solo_operator"
    MICRO_PE = "micro_pe"

class DealKillerSeverity(Enum):
    CRITICAL = "Critical"
    HIGH = "High"
    MEDIUM = "Medium"

# Score thresholds
SCORE_THRESHOLDS = {
    "premium": 85,
    "attractive": 70,
    "needs_optimization": 40,
    "high_risk": 0
}

# Multiple impact factors
MULTIPLE_IMPACTS = {
    "churn_reduction": {"per_point": 0.1, "max": 0.5},
    "nrr_increase": {"per_point": 0.03, "max": 0.6},
    "arr_tier_100k": 0.8,
    "arr_tier_500k": 0.5,
    "arr_tier_1m": 0.4,
    "founder_reduction": {"per_hour": 0.015, "max": 0.5},
    "annual_contracts": 0.3,
    "concentration_reduction": {"per_point": 0.015, "max": 0.4}
}

# ============ DATA CLASSES ============

@dataclass
class MetricsInput:
    """Core financial metrics for scoring"""
    arr: float = 0
    mrr: float = 0
    growth_rate: float = 0
    gross_margin: float = 70
    nrr: float = 100
    team_size: int = 0

@dataclass
class OperationalInput:
    """Operational characteristics for scoring"""
    churn_rate: float = 5
    recurring_revenue_pct: float = 80
    has_annual_contracts: bool = False
    max_customer_concentration: float = 20
    has_stripe_verified: bool = False
    founder_hours_per_week: float = 40
    has_documented_sops: bool = False
    tech_stack: str = "Other"
    has_automated_support: bool = False
    is_b2b: bool = True
    has_clear_icp: bool = False
    has_tam_documented: bool = False
    low_fragmentation_risk: bool = True
    seo_traffic_pct: float = 30
    has_legal_docs: bool = True
    has_12mo_financials: bool = True

@dataclass
class CategoryScore:
    """Score for a single category"""
    category: str
    score: float
    max_score: float
    percentage: float
    breakdown: List[Dict]

@dataclass
class ExitReadinessResult:
    """Complete exit readiness assessment"""
    total_score: float
    status: ExitReadinessStatus
    status_label: str
    status_color: str
    category_scores: List[CategoryScore]
    percentile_estimate: int
    improvement_suggestions: List[str]

# ============ SCORING FUNCTIONS ============

def calculate_financial_quality_score(
    arr: float,
    growth_rate: float,
    churn_rate: float,
    nrr: float
) -> Tuple[float, List[Dict], List[str]]:
    """
    Calculate Financial Quality score (max 30 points)
    
    Scoring breakdown:
    - ARR tier: 1-10 pts
    - Growth rate: 2-6 pts
    - Churn rate: 1-6 pts
    - NRR: 2-8 pts
    """
    score = 0.0
    breakdown = []
    suggestions = []
    
    # ARR scoring
    if arr >= 25000:
        score += 10
        breakdown.append({"item": "ARR >= $25k", "points": 10})
    elif arr >= 10000:
        score += 7
        breakdown.append({"item": "ARR $10-25k", "points": 7})
    elif arr >= 1000:
        score += 4
        breakdown.append({"item": "ARR $1-10k", "points": 4})
    else:
        score += 1
        breakdown.append({"item": "ARR < $1k", "points": 1})
        suggestions.append("Increase ARR to $25k+ for maximum financial score")
    
    # Growth scoring
    if growth_rate > 50:
        score += 6
        breakdown.append({"item": "Growth > 50%", "points": 6})
    elif growth_rate >= 20:
        score += 4
        breakdown.append({"item": "Growth 20-50%", "points": 4})
    else:
        score += 2
        breakdown.append({"item": "Growth < 20%", "points": 2})
        suggestions.append("Accelerate growth rate to 50%+ for premium positioning")
    
    # Churn scoring
    if churn_rate < 5:
        score += 6
        breakdown.append({"item": "Churn < 5%", "points": 6})
    elif churn_rate <= 8:
        score += 4
        breakdown.append({"item": "Churn 5-8%", "points": 4})
    else:
        score += 1
        breakdown.append({"item": "Churn > 8%", "points": 1})
        suggestions.append("Reduce churn below 5% to improve retention metrics")
    
    # NRR scoring
    if nrr > 110:
        score += 8
        breakdown.append({"item": "NRR > 110%", "points": 8})
    elif nrr >= 100:
        score += 6
        breakdown.append({"item": "NRR 100-110%", "points": 6})
    else:
        score += 2
        breakdown.append({"item": "NRR < 100%", "points": 2})
        suggestions.append("Improve NRR to 110%+ through upsells and expansion")
    
    return min(score, 30), breakdown, suggestions

def calculate_revenue_predictability_score(
    recurring_pct: float,
    has_annual: bool,
    concentration: float,
    has_verified: bool
) -> Tuple[float, List[Dict], List[str]]:
    """
    Calculate Revenue Predictability score (max 20 points)
    """
    score = 0.0
    breakdown = []
    suggestions = []
    
    if recurring_pct > 90:
        score += 8
        breakdown.append({"item": "Recurring > 90%", "points": 8})
    elif recurring_pct > 70:
        score += 5
        breakdown.append({"item": "Recurring 70-90%", "points": 5})
    else:
        score += 2
        breakdown.append({"item": "Recurring < 70%", "points": 2})
        suggestions.append("Increase recurring revenue to 90%+ for predictable income")
    
    if has_annual:
        score += 5
        breakdown.append({"item": "Annual contracts", "points": 5})
    else:
        suggestions.append("Offer annual contracts to lock in revenue")
    
    if concentration <= 30:
        score += 4
        breakdown.append({"item": "No customer > 30%", "points": 4})
    else:
        breakdown.append({"item": "Customer concentration risk", "points": 0})
        suggestions.append("Reduce customer concentration below 30%")
    
    if has_verified:
        score += 3
        breakdown.append({"item": "Stripe verified", "points": 3})
    
    return min(score, 20), breakdown, suggestions

def calculate_operational_score(
    founder_hours: float,
    has_sops: bool,
    tech_stack: str,
    has_automation: bool
) -> Tuple[float, List[Dict], List[str]]:
    """
    Calculate Operational Transferability score (max 20 points)
    """
    score = 0.0
    breakdown = []
    suggestions = []
    clean_stacks = ["Rails", "Node", "Python", "Laravel", "PHP"]
    
    if founder_hours < 20:
        score += 8
        breakdown.append({"item": "Founder < 20h/week", "points": 8})
    elif founder_hours < 30:
        score += 5
        breakdown.append({"item": "Founder 20-30h/week", "points": 5})
    else:
        score += 2
        breakdown.append({"item": "Founder > 30h/week", "points": 2})
        suggestions.append("Reduce founder dependency to < 20 hours/week")
    
    if has_sops:
        score += 5
        breakdown.append({"item": "SOPs documented", "points": 5})
    else:
        suggestions.append("Document standard operating procedures")
    
    if tech_stack in clean_stacks:
        score += 4
        breakdown.append({"item": f"Clean tech stack ({tech_stack})", "points": 4})
    else:
        score += 2
        breakdown.append({"item": "Non-standard tech stack", "points": 2})
    
    if has_automation:
        score += 3
        breakdown.append({"item": "Automated support", "points": 3})
    
    return min(score, 20), breakdown, suggestions

def calculate_market_score(
    is_b2b: bool,
    has_icp: bool,
    has_tam: bool,
    low_frag: bool
) -> Tuple[float, List[Dict], List[str]]:
    """
    Calculate Market Attractiveness score (max 15 points)
    """
    score = 0.0
    breakdown = []
    suggestions = []
    
    if is_b2b:
        score += 6
        breakdown.append({"item": "B2B model", "points": 6})
    else:
        score += 3
        breakdown.append({"item": "B2C model", "points": 3})
    
    if has_icp:
        score += 4
        breakdown.append({"item": "Clear ICP defined", "points": 4})
    else:
        suggestions.append("Define clear Ideal Customer Profile (ICP)")
    
    if has_tam:
        score += 3
        breakdown.append({"item": "TAM documented", "points": 3})
    
    if low_frag:
        score += 2
        breakdown.append({"item": "Low fragmentation risk", "points": 2})
    
    return min(score, 15), breakdown, suggestions

def calculate_risk_score(
    seo_pct: float,
    concentration: float,
    has_legal: bool,
    has_financials: bool
) -> Tuple[float, List[Dict], List[str]]:
    """
    Calculate Risk Profile score (max 15 points, starts at 15 and subtracts)
    """
    score = 15.0
    breakdown = []
    suggestions = []
    
    if seo_pct >= 50:
        score -= 4
        breakdown.append({"item": "SEO traffic > 50%", "points": -4})
        suggestions.append("Diversify traffic sources beyond SEO")
    
    if concentration >= 40:
        score -= 6
        breakdown.append({"item": "Customer > 40% revenue", "points": -6})
    
    if not has_legal:
        score -= 3
        breakdown.append({"item": "Missing legal docs", "points": -3})
        suggestions.append("Ensure all legal documentation is in place")
    
    if not has_financials:
        score -= 2
        breakdown.append({"item": "No 12mo financials", "points": -2})
        suggestions.append("Maintain 12+ months of financial records")
    
    if not breakdown:
        breakdown.append({"item": "No major risks", "points": 0})
    
    return max(score, 0), breakdown, suggestions

def classify_exit_readiness(total_score: float) -> Tuple[ExitReadinessStatus, str, str]:
    """
    Classify the overall exit readiness based on total score.
    Returns (status_enum, status_label, status_color)
    """
    if total_score >= SCORE_THRESHOLDS["premium"]:
        return ExitReadinessStatus.PREMIUM, "Premium Exit Candidate", "purple"
    elif total_score >= SCORE_THRESHOLDS["attractive"]:
        return ExitReadinessStatus.ATTRACTIVE, "Attractive Asset", "green"
    elif total_score >= SCORE_THRESHOLDS["needs_optimization"]:
        return ExitReadinessStatus.NEEDS_OPTIMIZATION, "Needs Optimization", "yellow"
    else:
        return ExitReadinessStatus.HIGH_RISK, "High Risk Asset", "red"

def estimate_percentile(total_score: float, arr: float) -> int:
    """
    Estimate percentile ranking within ARR bucket.
    Uses simplified heuristic - could be replaced with ML model.
    """
    if arr >= 100000:
        return min(95, int(total_score * 0.95))
    elif arr >= 50000:
        return min(85, int(total_score * 0.85))
    elif arr >= 25000:
        return min(75, int(total_score * 0.75))
    else:
        return min(60, int(total_score * 0.6))

# ============ BUYER FIT FUNCTIONS ============

def calculate_solo_operator_fit(
    mrr: float,
    arr: float,
    churn: float,
    tech_stack: str,
    founder_hours: float
) -> Tuple[float, List[Dict]]:
    """
    Calculate fit score for Solo Operator buyer profile.
    Target: MRR $500-$1.2K, Price <$30K, low churn, simple tech, niche focused
    """
    score = 0.0
    factors = []
    
    # MRR scoring
    if 500 <= mrr <= 1200:
        score += 25
        factors.append({"factor": "MRR in sweet spot ($500-$1,200)", "points": 25, "positive": True})
    elif mrr < 500:
        pts = max(0, 15 - (500 - mrr) / 50)
        score += pts
        factors.append({"factor": f"MRR below target (${mrr:.0f})", "points": round(pts, 1), "positive": False})
    elif mrr <= 3000:
        pts = max(0, 20 - (mrr - 1200) / 100)
        score += pts
        factors.append({"factor": f"MRR above ideal (${mrr:.0f})", "points": round(pts, 1), "positive": True})
    else:
        factors.append({"factor": "MRR too high for solo operation", "points": 0, "positive": False})
    
    # Price scoring
    estimated_price = arr * 2.5
    if estimated_price < 30000:
        score += 20
        factors.append({"factor": "Affordable price point", "points": 20, "positive": True})
    elif estimated_price < 50000:
        score += 10
        factors.append({"factor": "Price slightly high", "points": 10, "positive": True})
    else:
        factors.append({"factor": "Price too high", "points": 0, "positive": False})
    
    # Churn
    if churn < 5:
        score += 20
        factors.append({"factor": "Low churn (manageable)", "points": 20, "positive": True})
    elif churn < 8:
        score += 10
        factors.append({"factor": "Moderate churn", "points": 10, "positive": True})
    else:
        factors.append({"factor": "High churn (risky)", "points": 0, "positive": False})
    
    # Tech stack
    simple_stacks = ["Rails", "Node", "Python", "Laravel", "PHP"]
    if tech_stack in simple_stacks:
        score += 15
        factors.append({"factor": f"Simple tech ({tech_stack})", "points": 15, "positive": True})
    else:
        score += 5
        factors.append({"factor": "Complex tech stack", "points": 5, "positive": False})
    
    # Founder hours
    if founder_hours < 25:
        score += 20
        factors.append({"factor": "Low time commitment", "points": 20, "positive": True})
    elif founder_hours < 35:
        score += 10
        factors.append({"factor": "Moderate time commitment", "points": 10, "positive": True})
    else:
        factors.append({"factor": "High time commitment", "points": 0, "positive": False})
    
    return min(100, score), factors

def calculate_micro_pe_fit(
    arr: float,
    has_12mo: bool,
    is_b2b: bool,
    nrr: float,
    growth: float
) -> Tuple[float, List[Dict]]:
    """
    Calculate fit score for Micro PE buyer profile.
    Target: ARR >$300K, 12mo stable, B2B, NRR >100%, predictable growth
    """
    score = 0.0
    factors = []
    
    # ARR
    if arr >= 300000:
        score += 25
        factors.append({"factor": "ARR meets PE threshold ($300k+)", "points": 25, "positive": True})
    elif arr >= 200000:
        score += 15
        factors.append({"factor": "ARR approaching PE range", "points": 15, "positive": True})
    elif arr >= 100000:
        score += 8
        factors.append({"factor": "ARR below PE ideal", "points": 8, "positive": False})
    else:
        factors.append({"factor": "ARR too low for PE", "points": 0, "positive": False})
    
    # Financial history
    if has_12mo:
        score += 20
        factors.append({"factor": "12+ months history", "points": 20, "positive": True})
    else:
        score += 5
        factors.append({"factor": "Limited history", "points": 5, "positive": False})
    
    # B2B
    if is_b2b:
        score += 20
        factors.append({"factor": "B2B model", "points": 20, "positive": True})
    else:
        score += 8
        factors.append({"factor": "B2C model", "points": 8, "positive": False})
    
    # NRR
    if nrr > 100:
        score += 20
        factors.append({"factor": f"Strong NRR ({nrr}%)", "points": 20, "positive": True})
    elif nrr >= 95:
        score += 12
        factors.append({"factor": f"Acceptable NRR ({nrr}%)", "points": 12, "positive": True})
    else:
        factors.append({"factor": f"Low NRR ({nrr}%)", "points": 0, "positive": False})
    
    # Growth
    if 15 <= growth <= 50:
        score += 15
        factors.append({"factor": "Predictable growth", "points": 15, "positive": True})
    elif growth > 50:
        score += 10
        factors.append({"factor": "High growth", "points": 10, "positive": True})
    elif growth >= 5:
        score += 8
        factors.append({"factor": "Modest growth", "points": 8, "positive": False})
    else:
        factors.append({"factor": "Flat growth", "points": 0, "positive": False})
    
    return min(100, score), factors

# ============ DEAL KILLER DETECTION ============

def detect_deal_killers_pure(
    concentration: float,
    has_verified: bool,
    has_12mo: bool,
    churn: float,
    founder_hours: float,
    has_legal: bool
) -> List[Dict]:
    """
    Pure function to detect deal killers.
    Returns list of deal killer dictionaries.
    """
    killers = []
    
    if concentration > 40:
        killers.append({
            "flag": "Revenue Concentration",
            "description": f"Largest customer is {concentration}% of revenue. Most buyers consider >40% critical risk.",
            "severity": DealKillerSeverity.CRITICAL.value,
            "recommendation": "Aggressively diversify customer base before going to market."
        })
    elif concentration > 30:
        killers.append({
            "flag": "Revenue Concentration Warning",
            "description": f"Largest customer is {concentration}% of revenue. Will be flagged in due diligence.",
            "severity": DealKillerSeverity.HIGH.value,
            "recommendation": "Focus on reducing concentration below 25%."
        })
    
    if not has_verified:
        killers.append({
            "flag": "Unverified Revenue",
            "description": "Revenue not verified through payment processor. Buyers require proof.",
            "severity": DealKillerSeverity.HIGH.value,
            "recommendation": "Connect Stripe/PayPal for verifiable transaction history."
        })
    
    if not has_12mo:
        killers.append({
            "flag": "Insufficient Financial History",
            "description": "Less than 12 months of records. Most buyers require 12-24 months minimum.",
            "severity": DealKillerSeverity.CRITICAL.value,
            "recommendation": "Wait until you have 12+ months of documented financials."
        })
    
    if churn > 10:
        killers.append({
            "flag": "Excessive Churn",
            "description": f"Monthly churn of {churn}% is unsustainable. Buyers will see failing business.",
            "severity": DealKillerSeverity.CRITICAL.value,
            "recommendation": "Pause exit. Focus entirely on retention first."
        })
    elif churn > 8:
        killers.append({
            "flag": "High Churn Warning",
            "description": f"Monthly churn of {churn}% is above acceptable levels.",
            "severity": DealKillerSeverity.HIGH.value,
            "recommendation": "Implement retention strategies. Target <5% churn."
        })
    
    if founder_hours > 40:
        killers.append({
            "flag": "Founder Dependency",
            "description": f"Founder works {founder_hours}+ hours/week. Business not transferable.",
            "severity": DealKillerSeverity.CRITICAL.value,
            "recommendation": "Hire key roles, document processes, reduce to <20 hours."
        })
    elif founder_hours > 30:
        killers.append({
            "flag": "High Founder Involvement",
            "description": f"Founder works {founder_hours} hours/week. Many buyers see this as risky.",
            "severity": DealKillerSeverity.HIGH.value,
            "recommendation": "Delegate responsibilities. Target <20 hours."
        })
    
    if not has_legal:
        killers.append({
            "flag": "Missing Legal Documentation",
            "description": "Critical legal documents missing. Will halt acquisition process.",
            "severity": DealKillerSeverity.HIGH.value,
            "recommendation": "Ensure ToS, Privacy Policy, IP assignments are in place."
        })
    
    return killers

# ============ MULTIPLE IMPACT SIMULATION ============

def simulate_multiple_changes(
    current_multiple: float,
    arr: float,
    scenarios: List[str],
    churn: float = 5,
    nrr: float = 100,
    founder_hours: float = 40,
    has_annual: bool = False,
    concentration: float = 20
) -> Dict:
    """
    Pure function to simulate impact of improvements on valuation multiple.
    """
    projected = current_multiple
    active = []
    
    if "churn_3pct" in scenarios and churn > 3:
        improvement = min(MULTIPLE_IMPACTS["churn_reduction"]["max"], 
                         (churn - 3) * MULTIPLE_IMPACTS["churn_reduction"]["per_point"])
        projected += improvement
        active.append("churn_3pct")
    
    if "nrr_110" in scenarios and nrr < 110:
        improvement = min(MULTIPLE_IMPACTS["nrr_increase"]["max"],
                         (110 - nrr) * MULTIPLE_IMPACTS["nrr_increase"]["per_point"])
        projected += improvement
        active.append("nrr_110")
    
    if "arr_next_tier" in scenarios:
        if arr < 100000:
            projected += MULTIPLE_IMPACTS["arr_tier_100k"]
        elif arr < 500000:
            projected += MULTIPLE_IMPACTS["arr_tier_500k"]
        elif arr < 1000000:
            projected += MULTIPLE_IMPACTS["arr_tier_1m"]
        else:
            projected += 0.3
        active.append("arr_next_tier")
    
    if "founder_20h" in scenarios and founder_hours > 20:
        improvement = min(MULTIPLE_IMPACTS["founder_reduction"]["max"],
                         (founder_hours - 20) * MULTIPLE_IMPACTS["founder_reduction"]["per_hour"])
        projected += improvement
        active.append("founder_20h")
    
    if "annual_contracts" in scenarios and not has_annual:
        projected += MULTIPLE_IMPACTS["annual_contracts"]
        active.append("annual_contracts")
    
    if "concentration_20" in scenarios and concentration > 20:
        improvement = min(MULTIPLE_IMPACTS["concentration_reduction"]["max"],
                         (concentration - 20) * MULTIPLE_IMPACTS["concentration_reduction"]["per_point"])
        projected += improvement
        active.append("concentration_20")
    
    current_val = arr * current_multiple
    projected_val = arr * projected
    delta = projected_val - current_val
    pct = (delta / current_val * 100) if current_val > 0 else 0
    
    return {
        "current_multiple": round(current_multiple, 2),
        "projected_multiple": round(projected, 2),
        "current_valuation": round(current_val, 2),
        "projected_valuation": round(projected_val, 2),
        "delta_value": round(delta, 2),
        "delta_percentage": round(pct, 1),
        "active_scenarios": active
    }
