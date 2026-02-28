import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Building2, ChevronDown, ChevronUp, Check, X } from 'lucide-react';

const BuyerFitSection = ({ metrics }) => {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedProfile, setExpandedProfile] = useState(null);

  // Default exit inputs
  const defaultExitInputs = {
    churn_rate: 5,
    nrr: metrics?.nrr || 100,
    recurring_revenue_pct: 80,
    has_annual_contracts: false,
    max_customer_concentration: 20,
    founder_hours_per_week: 40,
    has_documented_sops: false,
    tech_stack: "Other",
    is_b2b: true,
    has_12mo_financials: true,
    seo_traffic_pct: 30,
    has_legal_docs: true,
    has_clear_icp: false,
    has_tam_documented: false,
    low_fragmentation_risk: true
  };

  useEffect(() => {
    if (metrics) {
      calculateFit();
    }
  }, [metrics]);

  const calculateFit = () => {
    setLoading(true);
    // Client-side calculation
    const arr = metrics?.arr || (metrics?.mrr || 0) * 12;
    const mrr = metrics?.mrr || arr / 12;
    
    // Solo Operator Profile
    let soloScore = 0;
    const soloFactors = [];
    
    // MRR scoring
    if (mrr >= 500 && mrr <= 1200) {
      soloScore += 25;
      soloFactors.push({ factor: "MRR in sweet spot ($500-$1,200)", points: 25, positive: true });
    } else if (mrr < 500) {
      const pts = Math.max(0, 15 - (500 - mrr) / 50);
      soloScore += pts;
      soloFactors.push({ factor: `MRR below target ($${mrr.toFixed(0)})`, points: Math.round(pts), positive: false });
    } else if (mrr <= 3000) {
      const pts = Math.max(0, 20 - (mrr - 1200) / 100);
      soloScore += pts;
      soloFactors.push({ factor: `MRR above ideal ($${mrr.toFixed(0)})`, points: Math.round(pts), positive: true });
    } else {
      soloFactors.push({ factor: "MRR too high for solo operation", points: 0, positive: false });
    }
    
    // Price scoring
    const estimatedPrice = arr * 2.5;
    if (estimatedPrice < 30000) {
      soloScore += 20;
      soloFactors.push({ factor: "Affordable price point", points: 20, positive: true });
    } else if (estimatedPrice < 50000) {
      soloScore += 10;
      soloFactors.push({ factor: "Price slightly high", points: 10, positive: true });
    } else {
      soloFactors.push({ factor: "Price likely too high", points: 0, positive: false });
    }
    
    // Churn
    if (defaultExitInputs.churn_rate < 5) {
      soloScore += 20;
      soloFactors.push({ factor: "Low churn (manageable)", points: 20, positive: true });
    } else if (defaultExitInputs.churn_rate < 8) {
      soloScore += 10;
      soloFactors.push({ factor: "Moderate churn", points: 10, positive: true });
    } else {
      soloFactors.push({ factor: "High churn (risky)", points: 0, positive: false });
    }
    
    // Tech stack
    soloScore += 10;
    soloFactors.push({ factor: "Standard tech stack", points: 10, positive: true });
    
    // Time commitment
    if (defaultExitInputs.founder_hours_per_week < 25) {
      soloScore += 20;
      soloFactors.push({ factor: "Low time commitment", points: 20, positive: true });
    } else if (defaultExitInputs.founder_hours_per_week < 35) {
      soloScore += 10;
      soloFactors.push({ factor: "Moderate time commitment", points: 10, positive: true });
    } else {
      soloFactors.push({ factor: "High time commitment", points: 0, positive: false });
    }
    
    // Micro PE Profile
    let peScore = 0;
    const peFactors = [];
    
    // ARR
    if (arr >= 300000) {
      peScore += 25;
      peFactors.push({ factor: "ARR meets PE threshold ($300k+)", points: 25, positive: true });
    } else if (arr >= 200000) {
      peScore += 15;
      peFactors.push({ factor: "ARR approaching PE range", points: 15, positive: true });
    } else if (arr >= 100000) {
      peScore += 8;
      peFactors.push({ factor: "ARR below PE ideal", points: 8, positive: false });
    } else {
      peFactors.push({ factor: "ARR too low for PE", points: 0, positive: false });
    }
    
    // 12mo financials
    if (defaultExitInputs.has_12mo_financials) {
      peScore += 20;
      peFactors.push({ factor: "12+ months financial history", points: 20, positive: true });
    } else {
      peScore += 5;
      peFactors.push({ factor: "Limited financial history", points: 5, positive: false });
    }
    
    // B2B
    if (defaultExitInputs.is_b2b) {
      peScore += 20;
      peFactors.push({ factor: "B2B business model", points: 20, positive: true });
    } else {
      peScore += 8;
      peFactors.push({ factor: "B2C model", points: 8, positive: false });
    }
    
    // NRR
    const nrr = metrics?.nrr || defaultExitInputs.nrr;
    if (nrr > 100) {
      peScore += 20;
      peFactors.push({ factor: `Strong NRR (${nrr}%)`, points: 20, positive: true });
    } else if (nrr >= 95) {
      peScore += 12;
      peFactors.push({ factor: `Acceptable NRR (${nrr}%)`, points: 12, positive: true });
    } else {
      peFactors.push({ factor: `Low NRR (${nrr}%)`, points: 0, positive: false });
    }
    
    // Growth
    const growth = metrics?.growth_rate || 0;
    if (growth >= 15 && growth <= 50) {
      peScore += 15;
      peFactors.push({ factor: "Predictable growth", points: 15, positive: true });
    } else if (growth > 50) {
      peScore += 10;
      peFactors.push({ factor: "High growth", points: 10, positive: true });
    } else if (growth >= 5) {
      peScore += 8;
      peFactors.push({ factor: "Modest growth", points: 8, positive: false });
    } else {
      peFactors.push({ factor: "Flat growth", points: 0, positive: false });
    }
    
    setResult({
      solo_operator_fit: Math.min(100, soloScore),
      solo_operator_factors: soloFactors,
      micro_pe_fit: Math.min(100, peScore),
      micro_pe_factors: peFactors
    });
    setLoading(false);
  };

  const getFitColor = (score) => {
    if (score >= 70) return 'text-emerald-600';
    if (score >= 40) return 'text-amber-600';
    return 'text-red-500';
  };

  const getFitBgColor = (score) => {
    if (score >= 70) return 'bg-emerald-50 border-emerald-200';
    if (score >= 40) return 'bg-amber-50 border-amber-200';
    return 'bg-red-50 border-red-200';
  };

  const getFitLabel = (score) => {
    if (score >= 80) return 'Excellent Fit';
    if (score >= 60) return 'Good Fit';
    if (score >= 40) return 'Moderate Fit';
    return 'Low Fit';
  };

  if (loading) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-6 animate-pulse">
        <div className="h-6 bg-slate-200 rounded w-1/3 mb-4"></div>
        <div className="grid grid-cols-2 gap-4">
          <div className="h-24 bg-slate-200 rounded"></div>
          <div className="h-24 bg-slate-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!result) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-slate-200 rounded-xl overflow-hidden"
      data-testid="buyer-fit-section"
    >
      <div className="p-6 border-b border-slate-100">
        <h3 className="text-lg font-semibold text-slate-900">Buyer Fit Analysis</h3>
        <p className="text-sm text-slate-500 mt-1">How attractive is your business to different buyer types</p>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Solo Operator Card */}
          <div 
            className={`buyer-fit-card border rounded-xl p-5 cursor-pointer ${getFitBgColor(result.solo_operator_fit)}`}
            onClick={() => setExpandedProfile(expandedProfile === 'solo' ? null : 'solo')}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white/80 flex items-center justify-center">
                  <User className="w-5 h-5 text-slate-600" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Solo Operator</p>
                  <p className="text-xs text-slate-500">Individual buyers</p>
                </div>
              </div>
              {expandedProfile === 'solo' ? 
                <ChevronUp className="w-5 h-5 text-slate-400" /> : 
                <ChevronDown className="w-5 h-5 text-slate-400" />
              }
            </div>
            
            <div className="flex items-end justify-between">
              <div>
                <p className={`text-3xl font-bold ${getFitColor(result.solo_operator_fit)}`}>
                  {Math.round(result.solo_operator_fit)}%
                </p>
                <p className={`text-sm font-medium ${getFitColor(result.solo_operator_fit)}`}>
                  {getFitLabel(result.solo_operator_fit)}
                </p>
              </div>
              <div className="text-right text-xs text-slate-500">
                <p>MRR $500-$1.2K</p>
                <p>Price &lt;$30K</p>
              </div>
            </div>

            {/* Expanded factors */}
            {expandedProfile === 'solo' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-4 pt-4 border-t border-slate-200/50 space-y-2"
              >
                {result.solo_operator_factors.map((f, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      {f.positive ? 
                        <Check className="w-4 h-4 text-emerald-500" /> : 
                        <X className="w-4 h-4 text-red-400" />
                      }
                      <span className="text-slate-700">{f.factor}</span>
                    </span>
                    <span className={`font-medium ${f.positive ? 'text-emerald-600' : 'text-slate-400'}`}>
                      +{f.points}
                    </span>
                  </div>
                ))}
              </motion.div>
            )}
          </div>

          {/* Micro PE Card */}
          <div 
            className={`buyer-fit-card border rounded-xl p-5 cursor-pointer ${getFitBgColor(result.micro_pe_fit)}`}
            onClick={() => setExpandedProfile(expandedProfile === 'pe' ? null : 'pe')}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white/80 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-slate-600" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Micro PE</p>
                  <p className="text-xs text-slate-500">Private equity firms</p>
                </div>
              </div>
              {expandedProfile === 'pe' ? 
                <ChevronUp className="w-5 h-5 text-slate-400" /> : 
                <ChevronDown className="w-5 h-5 text-slate-400" />
              }
            </div>
            
            <div className="flex items-end justify-between">
              <div>
                <p className={`text-3xl font-bold ${getFitColor(result.micro_pe_fit)}`}>
                  {Math.round(result.micro_pe_fit)}%
                </p>
                <p className={`text-sm font-medium ${getFitColor(result.micro_pe_fit)}`}>
                  {getFitLabel(result.micro_pe_fit)}
                </p>
              </div>
              <div className="text-right text-xs text-slate-500">
                <p>ARR $300K+</p>
                <p>B2B, NRR &gt;100%</p>
              </div>
            </div>

            {/* Expanded factors */}
            {expandedProfile === 'pe' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-4 pt-4 border-t border-slate-200/50 space-y-2"
              >
                {result.micro_pe_factors.map((f, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      {f.positive ? 
                        <Check className="w-4 h-4 text-emerald-500" /> : 
                        <X className="w-4 h-4 text-red-400" />
                      }
                      <span className="text-slate-700">{f.factor}</span>
                    </span>
                    <span className={`font-medium ${f.positive ? 'text-emerald-600' : 'text-slate-400'}`}>
                      +{f.points}
                    </span>
                  </div>
                ))}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default BuyerFitSection;
