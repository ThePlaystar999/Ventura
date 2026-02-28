import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronUp, Info, TrendingUp, Shield, Target, Building2, AlertTriangle, AlertCircle } from 'lucide-react';

const API = process.env.REACT_APP_BACKEND_URL + "/api";

const ExitReadinessCard = ({ metrics, valuationId }) => {
  const [score, setScore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [showTooltip, setShowTooltip] = useState(null);
  const [animateScore, setAnimateScore] = useState(false);

  // Default exit inputs - can be extended to allow user customization
  const defaultExitInputs = {
    arr: metrics?.arr || 0,
    growth_rate: metrics?.growth_rate || 0,
    churn_rate: 5,
    nrr: metrics?.nrr || 100,
    recurring_revenue_pct: 80,
    has_annual_contracts: false,
    max_customer_concentration: 20,
    has_stripe_verified: false,
    founder_hours_per_week: 40,
    has_documented_sops: false,
    tech_stack: "Other",
    has_automated_support: false,
    is_b2b: true,
    has_clear_icp: false,
    has_tam_documented: false,
    low_fragmentation_risk: true,
    seo_traffic_pct: 30,
    has_legal_docs: true,
    has_12mo_financials: true
  };

  useEffect(() => {
    if (metrics) {
      calculateScore();
    }
  }, [metrics, valuationId]);

  useEffect(() => {
    if (score) {
      // Trigger animation after score is set
      setTimeout(() => setAnimateScore(true), 100);
    }
  }, [score]);

  const calculateScore = async () => {
    setLoading(true);
    try {
      const result = calculateScoreLocally(metrics, defaultExitInputs);
      setScore(result);
    } catch (error) {
      console.error('Failed to calculate exit readiness:', error);
    }
    setLoading(false);
  };

  // Client-side calculation mirrors backend logic
  const calculateScoreLocally = (metrics, exitInputs) => {
    let totalScore = 0;
    const categoryScores = [];
    const improvementSuggestions = [];

    // CATEGORY A — Financial Quality (30 pts max)
    let financialScore = 0;
    const financialBreakdown = [];
    const arr = metrics?.arr || (metrics?.mrr || 0) * 12;

    if (arr >= 25000) {
      financialScore += 10;
      financialBreakdown.push({ item: "ARR >= $25k", points: 10 });
    } else if (arr >= 10000) {
      financialScore += 7;
      financialBreakdown.push({ item: "ARR $10-25k", points: 7 });
    } else if (arr >= 1000) {
      financialScore += 4;
      financialBreakdown.push({ item: "ARR $1-10k", points: 4 });
    } else {
      financialScore += 1;
      financialBreakdown.push({ item: "ARR < $1k", points: 1 });
      improvementSuggestions.push("Increase ARR to $25k+ for maximum financial score");
    }

    const growth = metrics?.growth_rate || 0;
    if (growth > 50) {
      financialScore += 6;
      financialBreakdown.push({ item: "Growth > 50%", points: 6 });
    } else if (growth >= 20) {
      financialScore += 4;
      financialBreakdown.push({ item: "Growth 20-50%", points: 4 });
    } else {
      financialScore += 2;
      financialBreakdown.push({ item: "Growth < 20%", points: 2 });
      improvementSuggestions.push("Accelerate growth rate to 50%+ for premium positioning");
    }

    const churn = exitInputs.churn_rate || 5;
    if (churn < 5) {
      financialScore += 6;
      financialBreakdown.push({ item: "Churn < 5%", points: 6 });
    } else if (churn <= 8) {
      financialScore += 4;
      financialBreakdown.push({ item: "Churn 5-8%", points: 4 });
    } else {
      financialScore += 1;
      financialBreakdown.push({ item: "Churn > 8%", points: 1 });
      improvementSuggestions.push("Reduce churn below 5% to improve retention metrics");
    }

    const nrr = metrics?.nrr || exitInputs.nrr || 100;
    if (nrr > 110) {
      financialScore += 8;
      financialBreakdown.push({ item: "NRR > 110%", points: 8 });
    } else if (nrr >= 100) {
      financialScore += 6;
      financialBreakdown.push({ item: "NRR 100-110%", points: 6 });
    } else {
      financialScore += 2;
      financialBreakdown.push({ item: "NRR < 100%", points: 2 });
      improvementSuggestions.push("Improve NRR to 110%+ through upsells and expansion");
    }

    financialScore = Math.min(financialScore, 30);
    categoryScores.push({
      category: "Financial Quality",
      score: financialScore,
      max_score: 30,
      percentage: Math.round((financialScore / 30) * 100 * 10) / 10,
      breakdown: financialBreakdown
    });
    totalScore += financialScore;

    // CATEGORY B — Revenue Predictability (20 pts max)
    let predictabilityScore = 0;
    const predictabilityBreakdown = [];

    if (exitInputs.recurring_revenue_pct > 90) {
      predictabilityScore += 8;
      predictabilityBreakdown.push({ item: "Recurring > 90%", points: 8 });
    } else if (exitInputs.recurring_revenue_pct > 70) {
      predictabilityScore += 5;
      predictabilityBreakdown.push({ item: "Recurring 70-90%", points: 5 });
    } else {
      predictabilityScore += 2;
      predictabilityBreakdown.push({ item: "Recurring < 70%", points: 2 });
    }

    if (exitInputs.has_annual_contracts) {
      predictabilityScore += 5;
      predictabilityBreakdown.push({ item: "Annual contracts", points: 5 });
    }

    if (exitInputs.max_customer_concentration <= 30) {
      predictabilityScore += 4;
      predictabilityBreakdown.push({ item: "No customer > 30%", points: 4 });
    }

    predictabilityScore = Math.min(predictabilityScore, 20);
    categoryScores.push({
      category: "Revenue Predictability",
      score: predictabilityScore,
      max_score: 20,
      percentage: Math.round((predictabilityScore / 20) * 100 * 10) / 10,
      breakdown: predictabilityBreakdown
    });
    totalScore += predictabilityScore;

    // CATEGORY C — Operational Transferability (20 pts max)
    let operationalScore = 0;
    const operationalBreakdown = [];

    if (exitInputs.founder_hours_per_week < 20) {
      operationalScore += 8;
      operationalBreakdown.push({ item: "Founder < 20h/week", points: 8 });
    } else if (exitInputs.founder_hours_per_week < 30) {
      operationalScore += 5;
      operationalBreakdown.push({ item: "Founder 20-30h/week", points: 5 });
    } else {
      operationalScore += 2;
      operationalBreakdown.push({ item: "Founder > 30h/week", points: 2 });
      improvementSuggestions.push("Reduce founder dependency to < 20 hours/week");
    }

    if (exitInputs.has_documented_sops) {
      operationalScore += 5;
      operationalBreakdown.push({ item: "SOPs documented", points: 5 });
    }

    operationalScore = Math.min(operationalScore, 20);
    categoryScores.push({
      category: "Operational Transferability",
      score: operationalScore,
      max_score: 20,
      percentage: Math.round((operationalScore / 20) * 100 * 10) / 10,
      breakdown: operationalBreakdown
    });
    totalScore += operationalScore;

    // CATEGORY D — Market Attractiveness (15 pts max)
    let marketScore = 0;
    const marketBreakdown = [];

    if (exitInputs.is_b2b) {
      marketScore += 6;
      marketBreakdown.push({ item: "B2B model", points: 6 });
    } else {
      marketScore += 3;
      marketBreakdown.push({ item: "B2C model", points: 3 });
    }

    if (exitInputs.has_clear_icp) {
      marketScore += 4;
      marketBreakdown.push({ item: "Clear ICP defined", points: 4 });
    }

    marketScore = Math.min(marketScore, 15);
    categoryScores.push({
      category: "Market Attractiveness",
      score: marketScore,
      max_score: 15,
      percentage: Math.round((marketScore / 15) * 100 * 10) / 10,
      breakdown: marketBreakdown
    });
    totalScore += marketScore;

    // CATEGORY E — Risk Profile (15 pts max)
    let riskScore = 15;
    const riskBreakdown = [];

    if (exitInputs.seo_traffic_pct >= 50) {
      riskScore -= 4;
      riskBreakdown.push({ item: "SEO traffic > 50%", points: -4 });
    }

    if (!exitInputs.has_legal_docs) {
      riskScore -= 3;
      riskBreakdown.push({ item: "Missing legal docs", points: -3 });
    }

    if (!exitInputs.has_12mo_financials) {
      riskScore -= 2;
      riskBreakdown.push({ item: "No 12mo financials", points: -2 });
    }

    if (riskBreakdown.length === 0) {
      riskBreakdown.push({ item: "No major risks", points: 0 });
    }

    riskScore = Math.max(riskScore, 0);
    categoryScores.push({
      category: "Risk Profile",
      score: riskScore,
      max_score: 15,
      percentage: Math.round((riskScore / 15) * 100 * 10) / 10,
      breakdown: riskBreakdown
    });
    totalScore += riskScore;

    // Clamp and classify
    totalScore = Math.max(0, Math.min(100, totalScore));

    // Updated classification labels
    let statusLabel, statusColor, readinessLabel;
    if (totalScore >= 85) {
      statusLabel = "Premium Exit Candidate";
      statusColor = "purple";
      readinessLabel = "Highly Exit-Ready";
    } else if (totalScore >= 70) {
      statusLabel = "Attractive Asset";
      statusColor = "green";
      readinessLabel = "Exit-Ready";
    } else if (totalScore >= 55) {
      statusLabel = "Moderate Candidate";
      statusColor = "blue";
      readinessLabel = "Moderately Exit-Ready";
    } else if (totalScore >= 40) {
      statusLabel = "Needs Preparation";
      statusColor = "yellow";
      readinessLabel = "Partially Exit-Ready";
    } else {
      statusLabel = "High Risk Asset";
      statusColor = "red";
      readinessLabel = "Not Exit-Ready";
    }

    // Percentile estimate
    let percentileEstimate;
    if (arr >= 100000) {
      percentileEstimate = Math.min(95, Math.floor(totalScore * 0.95));
    } else if (arr >= 50000) {
      percentileEstimate = Math.min(85, Math.floor(totalScore * 0.85));
    } else if (arr >= 25000) {
      percentileEstimate = Math.min(75, Math.floor(totalScore * 0.75));
    } else {
      percentileEstimate = Math.min(60, Math.floor(totalScore * 0.6));
    }

    // Find primary bottleneck (lowest scoring category)
    const sortedCategories = [...categoryScores].sort((a, b) => a.percentage - b.percentage);
    const primaryBottleneck = sortedCategories[0];

    return {
      total_score: Math.round(totalScore * 10) / 10,
      status_label: statusLabel,
      status_color: statusColor,
      readiness_label: readinessLabel,
      category_scores: categoryScores,
      percentile_estimate: percentileEstimate,
      improvement_suggestions: improvementSuggestions.slice(0, 5),
      primary_bottleneck: primaryBottleneck
    };
  };

  const getStatusBgColor = (color) => {
    switch (color) {
      case 'purple': return 'bg-purple-50 text-purple-700 ring-1 ring-purple-200';
      case 'green': return 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200';
      case 'blue': return 'bg-blue-50 text-blue-700 ring-1 ring-blue-200';
      case 'yellow': return 'bg-amber-50 text-amber-700 ring-1 ring-amber-200';
      case 'red': return 'bg-red-50 text-red-700 ring-1 ring-red-200';
      default: return 'bg-slate-50 text-slate-700 ring-1 ring-slate-200';
    }
  };

  const getScoreGradient = (score) => {
    if (score >= 70) return { start: '#10B981', end: '#34D399' }; // Emerald
    if (score >= 55) return { start: '#F59E0B', end: '#FBBF24' }; // Amber/Gold
    if (score >= 40) return { start: '#F97316', end: '#FB923C' }; // Orange
    return { start: '#EF4444', end: '#F87171' }; // Red
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Financial Quality': return TrendingUp;
      case 'Revenue Predictability': return Target;
      case 'Operational Transferability': return Building2;
      case 'Market Attractiveness': return Shield;
      case 'Risk Profile': return AlertTriangle;
      default: return Info;
    }
  };

  const getCategoryBarGradient = (percentage) => {
    if (percentage >= 80) return 'from-emerald-400 to-emerald-500';
    if (percentage >= 60) return 'from-blue-400 to-blue-500';
    if (percentage >= 40) return 'from-amber-400 to-amber-500';
    return 'from-red-400 to-red-500';
  };

  const tooltipContent = {
    'Financial Quality': 'ARR, growth rate, churn, and net revenue retention metrics',
    'Revenue Predictability': 'Recurring revenue %, contract length, customer concentration',
    'Operational Transferability': 'Founder dependency, SOPs, tech stack, automation',
    'Market Attractiveness': 'B2B vs B2C, ICP clarity, TAM documentation',
    'Risk Profile': 'Traffic sources, concentration risk, legal & financial documentation'
  };

  // Calculate ARR tier label
  const getArrTierLabel = () => {
    const arr = metrics?.arr || (metrics?.mrr || 0) * 12;
    if (arr >= 1000000) return '$1M+';
    if (arr >= 500000) return '$500K-$1M';
    if (arr >= 100000) return '$100K-$500K';
    if (arr >= 50000) return '$50K-$100K';
    if (arr >= 25000) return '$25K-$50K';
    return '<$25K';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 animate-pulse" style={{ boxShadow: '0 0 0 1px rgba(11, 77, 187, 0.08), 0 8px 24px -8px rgba(11, 77, 187, 0.15)' }}>
        <div className="h-6 bg-slate-200 rounded w-1/3 mb-4"></div>
        <div className="h-32 bg-slate-200 rounded mb-4"></div>
        <div className="space-y-2">
          <div className="h-4 bg-slate-200 rounded"></div>
          <div className="h-4 bg-slate-200 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  if (!score) return null;

  const gradient = getScoreGradient(score.total_score);
  // Precise circumference calculation: 2 * PI * radius
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  // Progress calculation: how much of the stroke to show
  const progress = score.total_score / 100;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl overflow-hidden"
      style={{ 
        boxShadow: '0 0 0 1px rgba(11, 77, 187, 0.08), 0 8px 24px -8px rgba(11, 77, 187, 0.15), 0 4px 12px -4px rgba(0, 0, 0, 0.08)'
      }}
      data-testid="exit-readiness-card"
    >
      {/* Header */}
      <div className="p-6 pb-0">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Exit Readiness Score</h3>
            <p className="text-xs text-slate-400 mt-0.5">Financial intelligence assessment</p>
          </div>
          <span className={`text-xs font-medium px-3 py-1.5 rounded-full ${getStatusBgColor(score.status_color)}`}>
            {score.status_label}
          </span>
        </div>

        {/* Score Display Section */}
        <div className="flex items-center gap-8 pb-6">
          {/* Gradient Progress Ring */}
          <div className="relative flex-shrink-0">
            <svg 
              className="w-32 h-32" 
              viewBox="0 0 120 120"
              style={{ transform: 'rotate(-90deg)' }}
            >
              {/* Gradient definition - rotated to follow arc direction */}
              <defs>
                <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor={gradient.start} />
                  <stop offset="100%" stopColor={gradient.end} />
                </linearGradient>
              </defs>
              {/* Background circle - full ring */}
              <circle
                cx="60"
                cy="60"
                r={radius}
                fill="none"
                stroke="#F1F5F9"
                strokeWidth="10"
              />
              {/* Progress circle */}
              <motion.circle
                cx="60"
                cy="60"
                r={radius}
                fill="none"
                stroke="url(#scoreGradient)"
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={`${circumference} ${circumference}`}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: animateScore ? strokeDashoffset : circumference }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                style={{ transformOrigin: 'center' }}
              />
            </svg>
            {/* Score text inside circle */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-center">
                <span className="text-3xl font-bold text-slate-900 tabular-nums">{Math.round(score.total_score)}</span>
                <span className="text-sm text-slate-400 font-medium">/100</span>
              </div>
              <span className="text-xs text-slate-500 mt-0.5 font-medium">{score.readiness_label}</span>
            </div>
          </div>
          
          {/* Percentile & Bottleneck Info */}
          <div className="flex-1 space-y-4">
            {/* Percentile - Data intelligent style */}
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-bold text-slate-900 tabular-nums">Top {100 - score.percentile_estimate}%</span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                of SaaS in your ARR range <span className="text-slate-400">({getArrTierLabel()})</span>
              </p>
            </div>

            {/* Primary Bottleneck - Warning style */}
            {score.primary_bottleneck && score.primary_bottleneck.percentage < 50 && (
              <div className="flex items-start gap-2 p-2.5 bg-amber-50 rounded-lg ring-1 ring-amber-200/60">
                <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-amber-800">Primary Bottleneck</p>
                  <p className="text-xs text-amber-700">{score.primary_bottleneck.category}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="px-6 pb-6">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center justify-between w-full text-sm font-medium text-slate-600 mb-4 hover:text-slate-900 transition-colors"
        >
          <span>Category Breakdown</span>
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        <div className="space-y-4">
          {score.category_scores.map((category, index) => {
            const Icon = getCategoryIcon(category.category);
            const isCritical = category.percentage < 30;
            
            return (
              <div key={index} className="relative">
                <div className="flex items-center justify-between mb-2">
                  <div 
                    className="flex items-center gap-2 cursor-help"
                    onMouseEnter={() => setShowTooltip(category.category)}
                    onMouseLeave={() => setShowTooltip(null)}
                  >
                    <Icon className="w-4 h-4 text-slate-400" />
                    <span className="text-sm text-slate-700 font-medium">{category.category}</span>
                    {isCritical && (
                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-red-100 text-red-600 ring-1 ring-red-200">
                        Critical Area
                      </span>
                    )}
                  </div>
                  <span className="text-sm font-semibold text-slate-900 tabular-nums">
                    {category.score}<span className="text-slate-400 font-normal">/{category.max_score}</span>
                  </span>
                </div>
                
                {/* Premium Progress Bar with Gradient */}
                <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${category.percentage}%` }}
                    transition={{ duration: 0.8, delay: index * 0.1 }}
                    className={`h-full rounded-full bg-gradient-to-r ${getCategoryBarGradient(category.percentage)}`}
                    style={{ 
                      boxShadow: category.percentage >= 60 ? '0 1px 2px rgba(0,0,0,0.1)' : 'none'
                    }}
                  />
                </div>

                {/* Tooltip */}
                {showTooltip === category.category && (
                  <div className="absolute left-0 top-full mt-2 z-10 bg-slate-900 text-white text-xs px-3 py-2 rounded-lg shadow-xl max-w-xs">
                    {tooltipContent[category.category]}
                    <div className="absolute -top-1 left-4 w-2 h-2 bg-slate-900 rotate-45"></div>
                  </div>
                )}

                {/* Expanded Breakdown */}
                {expanded && category.breakdown.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-2 ml-6 space-y-1 border-l-2 border-slate-100 pl-3"
                  >
                    {category.breakdown.map((item, i) => (
                      <div key={i} className="flex items-center justify-between text-xs py-0.5">
                        <span className="text-slate-500">{item.item}</span>
                        <span className={`font-medium tabular-nums ${item.points >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                          {item.points > 0 ? '+' : ''}{item.points} pts
                        </span>
                      </div>
                    ))}
                  </motion.div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Improvement Suggestions - Compact */}
      {score.improvement_suggestions.length > 0 && (
        <div className="px-6 pb-6">
          <div className="bg-gradient-to-r from-slate-50 to-slate-100/50 rounded-xl p-4 ring-1 ring-slate-200/60">
            <p className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">Priority Improvements</p>
            <ul className="space-y-1.5">
              {score.improvement_suggestions.slice(0, 3).map((suggestion, index) => (
                <li key={index} className="text-xs text-slate-600 flex items-start gap-2">
                  <span className="w-1 h-1 rounded-full bg-slate-400 mt-1.5 flex-shrink-0"></span>
                  {suggestion}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default ExitReadinessCard;
