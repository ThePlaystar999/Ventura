import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronUp, Info, TrendingUp, Shield, Target, Building2, AlertTriangle } from 'lucide-react';

const API = process.env.REACT_APP_BACKEND_URL + "/api";

const ExitReadinessCard = ({ metrics, valuationId }) => {
  const [score, setScore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [showTooltip, setShowTooltip] = useState(null);

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
    calculateScore();
  }, [metrics, valuationId]);

  const calculateScore = async () => {
    setLoading(true);
    try {
      const endpoint = valuationId 
        ? `${API}/exit-readiness/calculate-from-valuation/${valuationId}`
        : `${API}/exit-readiness/calculate`;
      
      const body = valuationId 
        ? defaultExitInputs 
        : { metrics, exit_inputs: defaultExitInputs };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(valuationId ? defaultExitInputs : body)
      });

      if (response.ok) {
        const data = await response.json();
        setScore(data);
      }
    } catch (error) {
      console.error('Failed to calculate exit readiness:', error);
    }
    setLoading(false);
  };

  const getStatusColor = (color) => {
    switch (color) {
      case 'purple': return 'bg-purple-500';
      case 'green': return 'bg-emerald-500';
      case 'yellow': return 'bg-amber-500';
      case 'red': return 'bg-red-500';
      default: return 'bg-slate-400';
    }
  };

  const getStatusBgColor = (color) => {
    switch (color) {
      case 'purple': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'green': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'yellow': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'red': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
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

  const tooltipContent = {
    'Financial Quality': 'ARR, growth rate, churn, and net revenue retention metrics',
    'Revenue Predictability': 'Recurring revenue %, contract length, customer concentration',
    'Operational Transferability': 'Founder dependency, SOPs, tech stack, automation',
    'Market Attractiveness': 'B2B vs B2C, ICP clarity, TAM documentation',
    'Risk Profile': 'Traffic sources, concentration risk, legal & financial documentation'
  };

  if (loading) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-6 animate-pulse">
        <div className="h-6 bg-slate-200 rounded w-1/3 mb-4"></div>
        <div className="h-20 bg-slate-200 rounded mb-4"></div>
        <div className="space-y-2">
          <div className="h-4 bg-slate-200 rounded"></div>
          <div className="h-4 bg-slate-200 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  if (!score) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-slate-200 rounded-xl overflow-hidden"
      data-testid="exit-readiness-card"
    >
      {/* Header */}
      <div className="p-6 border-b border-slate-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900">Exit Readiness Score</h3>
          <span className={`text-xs font-medium px-3 py-1.5 rounded-full border ${getStatusBgColor(score.status_color)}`}>
            {score.status_label}
          </span>
        </div>

        {/* Large Score Display */}
        <div className="flex items-center gap-6">
          <div className="relative">
            <svg className="w-28 h-28 transform -rotate-90">
              <circle
                cx="56"
                cy="56"
                r="48"
                fill="none"
                stroke="#E2E8F0"
                strokeWidth="8"
              />
              <circle
                cx="56"
                cy="56"
                r="48"
                fill="none"
                stroke={score.status_color === 'purple' ? '#8B5CF6' : 
                       score.status_color === 'green' ? '#10B981' :
                       score.status_color === 'yellow' ? '#F59E0B' : '#EF4444'}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${(score.total_score / 100) * 301.6} 301.6`}
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-3xl font-bold text-slate-900">{Math.round(score.total_score)}</span>
            </div>
          </div>
          
          <div className="flex-1">
            <p className="text-sm text-slate-500 mb-1">Percentile Estimate</p>
            <p className="text-2xl font-semibold text-slate-900">Top {100 - score.percentile_estimate}%</p>
            <p className="text-xs text-slate-400 mt-1">of businesses in your ARR range</p>
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="p-6">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center justify-between w-full text-sm font-medium text-slate-700 mb-4"
        >
          <span>Category Breakdown</span>
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        <div className="space-y-4">
          {score.category_scores.map((category, index) => {
            const Icon = getCategoryIcon(category.category);
            return (
              <div key={index} className="relative">
                <div className="flex items-center justify-between mb-1.5">
                  <div 
                    className="flex items-center gap-2 cursor-help"
                    onMouseEnter={() => setShowTooltip(category.category)}
                    onMouseLeave={() => setShowTooltip(null)}
                  >
                    <Icon className="w-4 h-4 text-slate-400" />
                    <span className="text-sm text-slate-700">{category.category}</span>
                    <Info className="w-3 h-3 text-slate-300" />
                  </div>
                  <span className="text-sm font-medium text-slate-900">
                    {category.score}/{category.max_score}
                  </span>
                </div>
                
                {/* Progress Bar */}
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${category.percentage}%` }}
                    transition={{ duration: 0.8, delay: index * 0.1 }}
                    className={`h-full rounded-full ${
                      category.percentage >= 80 ? 'bg-emerald-500' :
                      category.percentage >= 60 ? 'bg-[#0B4DBB]' :
                      category.percentage >= 40 ? 'bg-amber-500' : 'bg-red-500'
                    }`}
                  />
                </div>

                {/* Tooltip */}
                {showTooltip === category.category && (
                  <div className="absolute left-0 top-full mt-1 z-10 bg-slate-900 text-white text-xs px-3 py-2 rounded-lg shadow-lg max-w-xs">
                    {tooltipContent[category.category]}
                  </div>
                )}

                {/* Expanded Breakdown */}
                {expanded && category.breakdown.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-2 pl-6 space-y-1"
                  >
                    {category.breakdown.map((item, i) => (
                      <div key={i} className="flex items-center justify-between text-xs">
                        <span className="text-slate-500">{item.item}</span>
                        <span className={`font-medium ${item.points >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
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

      {/* Improvement Suggestions */}
      {score.improvement_suggestions.length > 0 && (
        <div className="px-6 pb-6">
          <div className="bg-amber-50 border border-amber-100 rounded-lg p-4">
            <p className="text-sm font-medium text-amber-800 mb-2">Top Improvements</p>
            <ul className="space-y-1.5">
              {score.improvement_suggestions.slice(0, 3).map((suggestion, index) => (
                <li key={index} className="text-xs text-amber-700 flex items-start gap-2">
                  <span className="text-amber-500 mt-0.5">•</span>
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
