import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, XCircle, ChevronDown, ChevronUp, ShieldAlert } from 'lucide-react';

const DealKillerAlert = ({ metrics }) => {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

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
    has_stripe_verified: false,
    has_clear_icp: false
  };

  useEffect(() => {
    if (metrics) {
      detectKillers();
    }
  }, [metrics]);

  const detectKillers = () => {
    setLoading(true);
    const dealKillers = [];

    // Revenue concentration >40%
    if (defaultExitInputs.max_customer_concentration > 40) {
      dealKillers.push({
        flag: "Revenue Concentration",
        description: `Your largest customer represents ${defaultExitInputs.max_customer_concentration}% of revenue. Most buyers consider >40% a critical risk.`,
        severity: "Critical",
        recommendation: "Aggressively diversify customer base before going to market."
      });
    } else if (defaultExitInputs.max_customer_concentration > 30) {
      dealKillers.push({
        flag: "Revenue Concentration Warning",
        description: `Your largest customer represents ${defaultExitInputs.max_customer_concentration}% of revenue. This will be flagged in due diligence.`,
        severity: "High",
        recommendation: "Focus on acquiring new customers to reduce concentration below 25%."
      });
    }

    // No verified payments
    if (!defaultExitInputs.has_stripe_verified) {
      dealKillers.push({
        flag: "Unverified Revenue",
        description: "Revenue is not verified through a payment processor. Buyers require proof of revenue.",
        severity: "High",
        recommendation: "Connect Stripe, PayPal, or equivalent to provide verifiable transaction history."
      });
    }

    // No 12 months history
    if (!defaultExitInputs.has_12mo_financials) {
      dealKillers.push({
        flag: "Insufficient Financial History",
        description: "Less than 12 months of financial records. Most buyers require 12-24 months minimum.",
        severity: "Critical",
        recommendation: "Wait until you have at least 12 months of documented financials."
      });
    }

    // Churn >10%
    if (defaultExitInputs.churn_rate > 10) {
      dealKillers.push({
        flag: "Excessive Churn",
        description: `Monthly churn of ${defaultExitInputs.churn_rate}% is unsustainable. Buyers will see this as a failing business.`,
        severity: "Critical",
        recommendation: "Pause exit plans. Focus entirely on retention."
      });
    } else if (defaultExitInputs.churn_rate > 8) {
      dealKillers.push({
        flag: "High Churn Warning",
        description: `Monthly churn of ${defaultExitInputs.churn_rate}% is above acceptable levels.`,
        severity: "High",
        recommendation: "Implement retention strategies before going to market."
      });
    }

    // Founder dependency >40h/week
    if (defaultExitInputs.founder_hours_per_week > 40) {
      dealKillers.push({
        flag: "Founder Dependency",
        description: `Founder works ${defaultExitInputs.founder_hours_per_week}+ hours/week. Business is not transferable.`,
        severity: "Critical",
        recommendation: "Hire key roles, document all processes, reduce to <20 hours."
      });
    } else if (defaultExitInputs.founder_hours_per_week > 30) {
      dealKillers.push({
        flag: "High Founder Involvement",
        description: `Founder works ${defaultExitInputs.founder_hours_per_week} hours/week. Many buyers will see this as risky.`,
        severity: "High",
        recommendation: "Delegate responsibilities and create SOPs."
      });
    }

    // No legal docs
    if (!defaultExitInputs.has_legal_docs) {
      dealKillers.push({
        flag: "Missing Legal Documentation",
        description: "Critical legal documents are missing. This will halt any acquisition.",
        severity: "High",
        recommendation: "Ensure you have ToS, Privacy Policy, IP assignments, contractor agreements."
      });
    }

    const criticalCount = dealKillers.filter(dk => dk.severity === "Critical").length;
    const highCount = dealKillers.filter(dk => dk.severity === "High").length;

    setResult({
      deal_killers: dealKillers,
      severity_level: criticalCount > 0 ? "Critical" : highCount > 0 ? "Warning" : "None",
      has_critical: criticalCount > 0,
      total_issues: dealKillers.length
    });
    setLoading(false);
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'Critical': return 'bg-red-100 text-red-700 border-red-200';
      case 'High': return 'bg-amber-100 text-amber-700 border-amber-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  if (loading) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-6 animate-pulse">
        <div className="h-6 bg-slate-200 rounded w-1/3 mb-4"></div>
        <div className="h-16 bg-slate-200 rounded"></div>
      </div>
    );
  }

  if (!result || result.total_issues === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-emerald-50 border border-emerald-200 rounded-xl p-6"
        data-testid="deal-killer-clear"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
            <ShieldAlert className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h3 className="font-semibold text-emerald-800">No Deal Killers Detected</h3>
            <p className="text-sm text-emerald-600">Your business has no critical issues that would block an exit.</p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`border rounded-xl overflow-hidden ${
        result.has_critical 
          ? 'bg-red-50 border-red-300' 
          : 'bg-amber-50 border-amber-300'
      }`}
      data-testid="deal-killer-alert"
    >
      {/* Header */}
      <div 
        className="p-6 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              result.has_critical ? 'bg-red-100' : 'bg-amber-100'
            }`}>
              {result.has_critical ? (
                <XCircle className="w-6 h-6 text-red-600" />
              ) : (
                <AlertTriangle className="w-6 h-6 text-amber-600" />
              )}
            </div>
            <div>
              <h3 className={`text-lg font-semibold ${
                result.has_critical ? 'text-red-800' : 'text-amber-800'
              }`}>
                ⚠️ Potential Deal Killers ({result.total_issues})
              </h3>
              <p className={`text-sm ${
                result.has_critical ? 'text-red-600' : 'text-amber-600'
              }`}>
                {result.has_critical 
                  ? 'Critical issues that must be resolved before exit'
                  : 'Issues that may impact your exit process'
                }
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-sm font-medium px-3 py-1 rounded-full ${
              result.has_critical 
                ? 'bg-red-200 text-red-800' 
                : 'bg-amber-200 text-amber-800'
            }`}>
              {result.severity_level}
            </span>
            {expanded ? (
              <ChevronUp className={`w-5 h-5 ${result.has_critical ? 'text-red-500' : 'text-amber-500'}`} />
            ) : (
              <ChevronDown className={`w-5 h-5 ${result.has_critical ? 'text-red-500' : 'text-amber-500'}`} />
            )}
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="px-6 pb-6 space-y-4"
          >
            {result.deal_killers.map((killer, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl p-4 border border-slate-200"
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-slate-900">{killer.flag}</h4>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full border ${getSeverityColor(killer.severity)}`}>
                    {killer.severity}
                  </span>
                </div>
                <p className="text-sm text-slate-600 mb-3">{killer.description}</p>
                <div className="bg-slate-50 rounded-lg p-3">
                  <p className="text-xs font-medium text-slate-500 mb-1">Recommendation:</p>
                  <p className="text-sm text-slate-700">{killer.recommendation}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default DealKillerAlert;
