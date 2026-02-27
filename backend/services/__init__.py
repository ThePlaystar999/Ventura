"""
Ventura Services Package
========================
Pure, testable business logic separated from API layer.
"""

from .exit_engine import (
    # Data classes
    MetricsInput,
    OperationalInput,
    CategoryScore,
    ExitReadinessResult,
    
    # Enums
    ExitReadinessStatus,
    BuyerProfile,
    DealKillerSeverity,
    
    # Scoring functions
    calculate_financial_quality_score,
    calculate_revenue_predictability_score,
    calculate_operational_score,
    calculate_market_score,
    calculate_risk_score,
    classify_exit_readiness,
    estimate_percentile,
    
    # Buyer fit
    calculate_solo_operator_fit,
    calculate_micro_pe_fit,
    
    # Deal killers
    detect_deal_killers_pure,
    
    # Simulator
    simulate_multiple_changes,
    
    # Constants
    SCORE_THRESHOLDS,
    MULTIPLE_IMPACTS
)

__all__ = [
    'MetricsInput',
    'OperationalInput', 
    'CategoryScore',
    'ExitReadinessResult',
    'ExitReadinessStatus',
    'BuyerProfile',
    'DealKillerSeverity',
    'calculate_financial_quality_score',
    'calculate_revenue_predictability_score',
    'calculate_operational_score',
    'calculate_market_score',
    'calculate_risk_score',
    'classify_exit_readiness',
    'estimate_percentile',
    'calculate_solo_operator_fit',
    'calculate_micro_pe_fit',
    'detect_deal_killers_pure',
    'simulate_multiple_changes',
    'SCORE_THRESHOLDS',
    'MULTIPLE_IMPACTS'
]
