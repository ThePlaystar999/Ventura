import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, AlertTriangle, ChevronDown, ChevronUp, Sparkles, Target, Zap } from 'lucide-react';

/**
 * ValuationPreviewPanel - Live preview of valuation estimate
 * Shows: Multiple range, confidence, top driver, red flag
 * Updates in real-time as user changes inputs
 */
const ValuationPreviewPanel = ({ formData, isExpanded, onToggle, isMobile = false }) => {
  
  // Calculate estimated multiple and valuation based on inputs
  const estimate = useMemo(() => {
    const arr = parseFloat(formData.arr) || (parseFloat(formData.mrr) || 0) * 12;
    const growth = parseFloat(formData.growth_rate) || 0;
    const grossMargin = parseFloat(formData.gross_margin) || 70;
    const nrr = parseFloat(formData.nrr) || 100;
    const grr = parseFloat(formData.grr) || null;
    const logoChurn = parseFloat(formData.logo_churn) || null;
    const customerConcentration = parseFloat(formData.customer_concentration) || 0;
    const productMaturity = formData.product_maturity || 3;
    const marketSize = formData.market_size || 'Medium';
    const moat = formData.competitive_moat || 'Medium';
    const revenueSubscription = parseInt(formData.revenue_subscription) || 100;
    
    // Base multiple calculation (enhanced M&A model)
    let baseMultiple = 3.0; // Starting point
    
    // Growth premium (biggest driver)
    if (growth >= 100) baseMultiple += 2.0;
    else if (growth >= 75) baseMultiple += 1.5;
    else if (growth >= 50) baseMultiple += 1.0;
    else if (growth >= 25) baseMultiple += 0.5;
    
    // NRR premium
    if (nrr >= 130) baseMultiple += 1.0;
    else if (nrr >= 115) baseMultiple += 0.7;
    else if (nrr >= 105) baseMultiple += 0.4;
    else if (nrr < 90) baseMultiple -= 0.5;
    
    // GRR adjustment (new)
    if (grr) {
      if (grr >= 95) baseMultiple += 0.4;
      else if (grr >= 90) baseMultiple += 0.2;
      else if (grr < 80) baseMultiple -= 0.4;
    }
    
    // Gross margin adjustment
    if (grossMargin >= 85) baseMultiple += 0.5;
    else if (grossMargin >= 75) baseMultiple += 0.3;
    else if (grossMargin < 60) baseMultiple -= 0.5;
    
    // Customer concentration discount (new)
    if (customerConcentration > 50) baseMultiple -= 1.0;
    else if (customerConcentration > 30) baseMultiple -= 0.5;
    else if (customerConcentration > 20) baseMultiple -= 0.2;
    
    // Revenue mix adjustment (new) - higher subscription % = better
    if (revenueSubscription >= 90) baseMultiple += 0.3;
    else if (revenueSubscription < 70) baseMultiple -= 0.3;
    
    // Product maturity adjustment
    baseMultiple += (productMaturity - 3) * 0.3;
    
    // Market size adjustment
    if (marketSize === 'Large') baseMultiple += 0.5;
    else if (marketSize === 'Small') baseMultiple -= 0.3;
    
    // Moat adjustment
    if (moat === 'Strong') baseMultiple += 0.5;
    else if (moat === 'Low') baseMultiple -= 0.3;
    
    // Founder dependency adjustment (new)
    const founderDependency = formData.founder_dependency || '';
    if (founderDependency === 'Low') baseMultiple += 0.3;
    else if (founderDependency === 'High') baseMultiple -= 0.5;
    
    // Sales predictability adjustment (new)
    const salesPredictability = formData.sales_predictability || '';
    if (salesPredictability === 'Self-serve') baseMultiple += 0.3;
    else if (salesPredictability === 'Enterprise-lumpy') baseMultiple -= 0.2;
    
    // Industry adjustment
    const industry = formData.industry || '';
    if (industry === 'AI/ML' || industry === 'Cybersecurity') baseMultiple += 0.5;
    else if (industry === 'E-Commerce') baseMultiple -= 0.3;
    
    // Ensure minimum multiple
    baseMultiple = Math.max(1.5, baseMultiple);
    
    // Calculate range (±20%)
    const lowMultiple = Math.max(1.0, baseMultiple * 0.8);
    const highMultiple = baseMultiple * 1.2;
    
    // Calculate confidence (enhanced)
    let confidenceScore = 0;
    if (arr > 0) confidenceScore += 2;
    if (growth > 0) confidenceScore += 1;
    if (grossMargin > 0) confidenceScore += 1;
    if (nrr !== 100 && nrr > 0) confidenceScore += 1;
    if (grr) confidenceScore += 1;
    if (logoChurn !== null) confidenceScore += 1;
    if (customerConcentration > 0) confidenceScore += 1;
    
    let confidence = 'Low';
    if (confidenceScore >= 6) confidence = 'High';
    else if (confidenceScore >= 3) confidence = 'Moderate';
    
    // Identify top driver (prioritized)
    let topDriver = null;
    if (growth >= 75) topDriver = { label: `${growth}% YoY Growth`, type: 'positive' };
    else if (nrr >= 120) topDriver = { label: `${nrr}% NRR`, type: 'positive' };
    else if (grr && grr >= 95) topDriver = { label: `${grr}% GRR`, type: 'positive' };
    else if (moat === 'Strong') topDriver = { label: 'Strong Competitive Moat', type: 'positive' };
    else if (grossMargin >= 80) topDriver = { label: `${grossMargin}% Gross Margin`, type: 'positive' };
    else if (revenueSubscription >= 90) topDriver = { label: `${revenueSubscription}% Subscription Revenue`, type: 'positive' };
    else if (growth > 0) topDriver = { label: `${growth}% Growth Rate`, type: 'neutral' };
    
    // Identify red flag (prioritized)
    let redFlag = null;
    if (customerConcentration > 30) redFlag = `High concentration (${customerConcentration}%)`;
    else if (nrr < 90 && nrr > 0) redFlag = `Low NRR (${nrr}%)`;
    else if (grr && grr < 80) redFlag = `Low GRR (${grr}%)`;
    else if (grossMargin < 60 && grossMargin > 0) redFlag = `Low Margin (${grossMargin}%)`;
    else if (growth < 20 && growth > 0) redFlag = `Slow Growth (${growth}%)`;
    
    // Calculate estimated valuation
    const lowValuation = arr * lowMultiple;
    const baseValuation = arr * baseMultiple;
    const highValuation = arr * highMultiple;
    
    return {
      lowMultiple: lowMultiple.toFixed(1),
      baseMultiple: baseMultiple.toFixed(1),
      highMultiple: highMultiple.toFixed(1),
      confidence,
      confidenceScore,
      topDriver,
      redFlag,
      lowValuation,
      baseValuation,
      highValuation,
      hasData: arr > 0
    };
  }, [formData]);

  const formatCurrency = (value) => {
    if (!value || value === 0) return '$0';
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${Math.round(value)}`;
  };

  const confidenceColors = {
    Low: { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200', dots: 1 },
    Moderate: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200', dots: 2 },
    High: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200', dots: 3 }
  };

  const cc = confidenceColors[estimate.confidence];

  // Mobile collapsed view
  if (isMobile && !isExpanded) {
    return (
      <motion.button
        onClick={onToggle}
        className="w-full mt-6 bg-gradient-to-r from-slate-50 to-slate-100 border border-slate-200 rounded-xl p-4 flex items-center justify-between hover:border-slate-300 transition-colors"
        whileTap={{ scale: 0.99 }}
        data-testid="preview-toggle-mobile"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#0B4DBB]/10 flex items-center justify-center">
            <Target className="w-5 h-5 text-[#0B4DBB]" />
          </div>
          <div className="text-left">
            <p className="text-sm font-medium text-slate-900">Valuation Preview</p>
            {estimate.hasData ? (
              <p className="text-xs text-slate-500">
                {estimate.lowMultiple}x – {estimate.highMultiple}x ARR
              </p>
            ) : (
              <p className="text-xs text-slate-400">Enter financials to see estimate</p>
            )}
          </div>
        </div>
        <ChevronDown className="w-5 h-5 text-slate-400" />
      </motion.button>
    );
  }

  const content = (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#0B4DBB] to-[#1E6AE1] flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <h3 className="font-semibold text-slate-900">Live Estimate</h3>
        </div>
        {isMobile && (
          <button onClick={onToggle} className="p-1 hover:bg-slate-100 rounded-lg transition-colors">
            <ChevronUp className="w-5 h-5 text-slate-400" />
          </button>
        )}
      </div>

      {!estimate.hasData ? (
        <div className="text-center py-6">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
            <Target className="w-6 h-6 text-slate-400" />
          </div>
          <p className="text-sm text-slate-500">Enter your ARR and metrics</p>
          <p className="text-xs text-slate-400 mt-1">to see your valuation estimate</p>
        </div>
      ) : (
        <>
          {/* Multiple Range */}
          <div className="bg-gradient-to-br from-[#F0F7FF] to-[#E8F0FE] rounded-xl p-4 border border-[#DCEAFF]">
            <p className="text-xs font-medium text-[#0B4DBB]/70 uppercase tracking-wider mb-2">
              Estimated Multiple
            </p>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-[#0B4DBB]">
                {estimate.lowMultiple}x
              </span>
              <span className="text-slate-400 mx-1">–</span>
              <span className="text-2xl font-bold text-[#0B4DBB]">
                {estimate.highMultiple}x
              </span>
              <span className="text-sm text-slate-500 ml-1">ARR</span>
            </div>
            
            {/* Visual range bar */}
            <div className="mt-3 relative h-2 bg-[#0B4DBB]/20 rounded-full overflow-hidden">
              <motion.div 
                className="absolute left-0 top-0 h-full bg-gradient-to-r from-[#0B4DBB] to-[#1E6AE1] rounded-full"
                initial={{ width: '0%' }}
                animate={{ width: '60%' }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
              {/* Base marker */}
              <div 
                className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white border-2 border-[#0B4DBB] rounded-full shadow-sm"
                style={{ left: '50%', transform: 'translate(-50%, -50%)' }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>Low</span>
              <span className="font-medium text-[#0B4DBB]">Base: {estimate.baseMultiple}x</span>
              <span>High</span>
            </div>
          </div>

          {/* Estimated Valuation */}
          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">
              Est. Valuation Range
            </p>
            <p className="text-lg font-bold text-slate-900">
              {formatCurrency(estimate.lowValuation)} – {formatCurrency(estimate.highValuation)}
            </p>
          </div>

          {/* Confidence */}
          <div className={`rounded-xl p-4 border ${cc.bg} ${cc.border}`}>
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-slate-600">Confidence</p>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3].map((dot) => (
                  <div 
                    key={dot}
                    className={`w-2 h-2 rounded-full ${
                      dot <= cc.dots ? cc.text.replace('text-', 'bg-') : 'bg-slate-200'
                    }`}
                  />
                ))}
                <span className={`text-sm font-semibold ml-1 ${cc.text}`}>
                  {estimate.confidence}
                </span>
              </div>
            </div>
            {estimate.confidence !== 'High' && (
              <p className="text-[11px] text-slate-500 mt-1.5">
                {estimate.confidence === 'Low' ? 'Add NRR & growth data to increase' : 'Complete all metrics for full accuracy'}
              </p>
            )}
          </div>

          {/* Top Driver */}
          {estimate.topDriver && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 p-3 bg-emerald-50 rounded-lg border border-emerald-100"
            >
              <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs text-emerald-600 font-medium">Top Driver</p>
                <p className="text-sm font-semibold text-emerald-900">{estimate.topDriver.label}</p>
              </div>
            </motion.div>
          )}

          {/* Red Flag */}
          {estimate.redFlag && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg border border-amber-100"
            >
              <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-amber-600 font-medium">Area to Improve</p>
                <p className="text-sm font-semibold text-amber-900">{estimate.redFlag}</p>
              </div>
            </motion.div>
          )}
        </>
      )}
    </div>
  );

  // Desktop or Mobile expanded view
  if (isMobile) {
    return (
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        transition={{ duration: 0.3 }}
        className="mt-6 bg-white border border-slate-200 rounded-xl p-5 shadow-sm"
        data-testid="preview-panel-mobile"
      >
        {content}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm sticky top-8"
      data-testid="preview-panel-desktop"
    >
      {content}
    </motion.div>
  );
};

export default ValuationPreviewPanel;
