import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ExitReadinessCard from '../components/ExitReadinessCard';
import BuyerFitSection from '../components/BuyerFitSection';
import OptimizationRoadmap from '../components/OptimizationRoadmap';
import DealKillerAlert from '../components/DealKillerAlert';
import MultipleImpactSimulator from '../components/MultipleImpactSimulator';
import { Button } from '../components/ui/button';
import { Slider } from '../components/ui/slider';
import { toast } from 'sonner';
import { 
  ArrowLeft, Download, Share2, Copy, Check, TrendingUp, Info,
  ChevronDown, ChevronUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API = process.env.REACT_APP_BACKEND_URL + "/api";

const ValuationResults = () => {
  const { valuationId } = useParams();
  const navigate = useNavigate();
  const [valuation, setValuation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showAssumptions, setShowAssumptions] = useState(false);
  const [showAdjustments, setShowAdjustments] = useState(false);
  
  // Scenario slider state
  const [growthAdjustment, setGrowthAdjustment] = useState([100]);
  const [multipleAdjustment, setMultipleAdjustment] = useState([100]);

  useEffect(() => {
    fetchValuation();
  }, [valuationId]);

  const fetchValuation = async () => {
    try {
      const response = await fetch(`${API}/valuations/${valuationId}`, {
        credentials: 'include'
      });
      if (response.ok) {
        setValuation(await response.json());
      } else {
        toast.error('Valuation not found');
        navigate('/dashboard');
      }
    } catch (error) {
      toast.error('Failed to load valuation');
    }
    setLoading(false);
  };

  const downloadPDF = async () => {
    setDownloading(true);
    try {
      const response = await fetch(`${API}/valuations/${valuationId}/pdf`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${valuation.company_info.company_name}_Valuation.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success('PDF downloaded');
      } else {
        toast.error('Failed to download PDF');
      }
    } catch (error) {
      toast.error('Something went wrong');
    }
    setDownloading(false);
  };

  const copyShareLink = () => {
    const shareUrl = `${window.location.origin}/share/${valuation.share_token}`;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast.success('Share link copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const formatCurrency = (value) => {
    if (!value) return '$0';
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    }
    return `$${(value / 1000).toFixed(0)}K`;
  };

  // Calculate adjusted valuation based on sliders
  const getAdjustedValuation = () => {
    if (!valuation?.result) return { low: 0, base: 0, high: 0 };
    
    const growthFactor = growthAdjustment[0] / 100;
    const multipleFactor = multipleAdjustment[0] / 100;
    const combinedFactor = growthFactor * multipleFactor;
    
    return {
      low: valuation.result.low * combinedFactor,
      base: valuation.result.base * combinedFactor,
      high: valuation.result.high * combinedFactor
    };
  };

  const adjustedVal = getAdjustedValuation();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC]">
        <Navbar />
        <div className="pt-24 flex items-center justify-center">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  if (!valuation) return null;

  const { result, exit_scenarios, assumptions, ai_commentary } = valuation;

  return (
    <div className="min-h-screen bg-[#F8FAFC]" data-testid="valuation-results">
      <Navbar />

      <main className="pt-24 pb-12 px-6 md:px-12 lg:px-24 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/dashboard')}
              className="text-slate-600"
              data-testid="btn-back-dashboard"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Dashboard
            </Button>
          </div>

          <div className="flex items-center gap-3">
            <Button 
              variant="outline"
              onClick={copyShareLink}
              className="border-[#EEF2F7]"
              data-testid="btn-copy-share"
            >
              {copied ? <Check className="w-4 h-4 mr-2" /> : <Share2 className="w-4 h-4 mr-2" />}
              {copied ? 'Copied!' : 'Share Link'}
            </Button>
            <Button 
              onClick={downloadPDF}
              disabled={downloading}
              className="bg-[#0B4DBB] hover:bg-[#093c96] shadow-lg shadow-blue-900/20"
              data-testid="btn-download-pdf"
            >
              <Download className="w-4 h-4 mr-2" />
              {downloading ? 'Downloading...' : 'Download PDF'}
            </Button>
          </div>
        </div>

        {/* SECTION 1 — HERO SNAPSHOT */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="valuation-result-card p-8 md:p-12 mb-8"
        >
          <div className="text-center">
            <p className="text-white/80 text-sm uppercase tracking-wider mb-2">
              {valuation.company_info?.company_name}
            </p>
            <h1 className="text-4xl md:text-6xl font-bold mb-4" data-testid="valuation-amount">
              {formatCurrency(adjustedVal.base)}
            </h1>
            <p className="text-white/80">
              Estimated Valuation • {result?.methodology}
            </p>
            <div className="mt-4 flex items-center justify-center gap-4 text-sm">
              <span className="bg-white/20 px-3 py-1 rounded-full">
                Base Multiple: {result?.base_multiple}x
              </span>
              <span className="bg-white/20 px-3 py-1 rounded-full">
                Final Multiple: {result?.multiple_used}x
              </span>
            </div>
            <p className="text-white/60 text-sm mt-4">
              Exit intelligence dashboard for bootstrapped SaaS founders.
            </p>
          </div>
        </motion.div>

        {/* SECTION 2 — EXIT READINESS SCORE */}
        <div className="mb-8">
          <ExitReadinessCard 
            metrics={valuation.metrics} 
            valuationId={valuationId}
          />
        </div>

        {/* SECTION 3 — RISK & DEAL KILLERS */}
        <div className="mb-8">
          <DealKillerAlert metrics={valuation.metrics} />
        </div>

        {/* SECTION 4 — BUYER FIT ANALYSIS */}
        <div className="mb-8">
          <BuyerFitSection metrics={valuation.metrics} />
        </div>

        {/* SECTION 5 — EXIT OPTIMIZATION ROADMAP */}
        <div className="mb-8">
          <OptimizationRoadmap metrics={valuation.metrics} />
        </div>

        {/* SECTION 6 — WHAT-IF SIMULATOR */}
        <div className="mb-8">
          <MultipleImpactSimulator 
            metrics={valuation.metrics} 
            currentMultiple={valuation.results?.base_multiple || 3.0}
          />
        </div>

        {/* SECTION 7 — EXIT SCENARIOS */}
        <div className="bg-white rounded-xl border border-[#EEF2F7] p-6 mb-8">
          <div className="mb-6">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Realistic Exit Pathways Based on Current Metrics</p>
            <h3 className="text-lg font-semibold text-slate-900">Exit Scenarios</h3>
          </div>
          
          <div className="space-y-4">
            {exit_scenarios?.map((scenario, index) => (
              <motion.div
                key={scenario.scenario_type}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="exit-card p-5"
                data-testid={`exit-scenario-${index}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-slate-900">{scenario.name}</h4>
                    <p className="text-2xl font-bold text-[#0B4DBB] mt-1">
                      {formatCurrency(scenario.estimated_value * (growthAdjustment[0] / 100) * (multipleAdjustment[0] / 100))}
                    </p>
                    <p className="text-sm text-slate-500 mt-1">{scenario.multiple}x multiple</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`text-xs font-medium px-2 py-1 rounded ${
                      scenario.probability === 'High' ? 'bg-green-100 text-green-700' :
                      scenario.probability === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {scenario.probability} Probability
                    </span>
                    <span className="text-xs font-medium px-2 py-1 rounded bg-[#F0F7FF] text-[#0B4DBB]">
                      {scenario.timeline}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-slate-600 mb-2">{scenario.description}</p>
                <p className="text-xs text-slate-500 italic border-t border-slate-100 pt-2 mt-2">
                  {scenario.rationale}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Results */}
          <div className="lg:col-span-2 space-y-6">
            {/* Valuation Range */}
            <div className="bg-white rounded-xl border border-[#EEF2F7] p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-6">Valuation Range</h3>
              
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 rounded-xl bg-[#DCEAFF]">
                  <p className="text-sm text-slate-600 mb-1">Conservative</p>
                  <p className="text-2xl font-bold text-[#0B4DBB]" data-testid="val-low">{formatCurrency(adjustedVal.low)}</p>
                </div>
                <div className="text-center p-4 rounded-xl bg-[#0B4DBB] text-white">
                  <p className="text-sm text-white/80 mb-1">Base Case</p>
                  <p className="text-2xl font-bold" data-testid="val-base">{formatCurrency(adjustedVal.base)}</p>
                </div>
                <div className="text-center p-4 rounded-xl bg-[#1E6AE1] text-white">
                  <p className="text-sm text-white/80 mb-1">Optimistic</p>
                  <p className="text-2xl font-bold" data-testid="val-high">{formatCurrency(adjustedVal.high)}</p>
                </div>
              </div>

              {/* Scenario Sliders */}
              <div className="space-y-6 pt-6 border-t border-[#EEF2F7]">
                <h4 className="font-medium text-slate-700">Scenario Analysis</h4>
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-medium text-slate-700">Growth Adjustment</label>
                    <span className="text-sm font-semibold text-[#0B4DBB]">{growthAdjustment[0]}%</span>
                  </div>
                  <Slider
                    value={growthAdjustment}
                    onValueChange={setGrowthAdjustment}
                    min={50}
                    max={150}
                    step={5}
                    className="w-full"
                    data-testid="slider-growth"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-medium text-slate-700">Multiple Adjustment</label>
                    <span className="text-sm font-semibold text-[#0B4DBB]">{multipleAdjustment[0]}%</span>
                  </div>
                  <Slider
                    value={multipleAdjustment}
                    onValueChange={setMultipleAdjustment}
                    min={50}
                    max={150}
                    step={5}
                    className="w-full"
                    data-testid="slider-multiple"
                  />
                </div>
              </div>
            </div>

            {/* Adjustments Breakdown */}
            {result?.adjustments && result.adjustments.length > 0 && (
              <div className="bg-white rounded-xl border border-[#EEF2F7] overflow-hidden">
                <button
                  onClick={() => setShowAdjustments(!showAdjustments)}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
                >
                  <h3 className="text-lg font-semibold text-slate-900">Valuation Adjustments</h3>
                  {showAdjustments ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </button>
                
                <AnimatePresence>
                  {showAdjustments && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: 'auto' }}
                      exit={{ height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-6 space-y-3">
                        {result.adjustments.map((adj, index) => (
                          <div key={index} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              adj.adjustment > 0 ? 'bg-green-100 text-green-600' : 
                              adj.adjustment < 0 ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-600'
                            }`}>
                              {adj.adjustment > 0 ? '+' : ''}{(adj.adjustment * 100).toFixed(0)}%
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-slate-900">{adj.factor}</p>
                              <p className="text-sm text-slate-600">{adj.reason}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* SECTION 8 — ANALYSIS SUMMARY (Investor Memo Style) */}
            {ai_commentary && (
              <div className="bg-white rounded-xl border border-[#EEF2F7] p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Info className="w-4 h-4 text-[#0B4DBB]" />
                  <h3 className="text-lg font-semibold text-slate-900">Executive Summary</h3>
                </div>
                
                <div className="space-y-4 text-sm text-slate-700 leading-relaxed">
                  {/* Concise Summary - 4-6 lines max */}
                  <p>{ai_commentary.summary?.split('.').slice(0, 2).join('.')}.</p>
                  
                  <div className="flex gap-4 pt-3 border-t border-slate-100">
                    <div className="flex-1">
                      <span className="text-xs font-semibold text-green-600 uppercase">Strengths</span>
                      <p className="text-slate-600 mt-1">{ai_commentary.key_strengths?.slice(0, 2).join('. ')}.</p>
                    </div>
                    <div className="flex-1">
                      <span className="text-xs font-semibold text-amber-600 uppercase">Risks</span>
                      <p className="text-slate-600 mt-1">{ai_commentary.key_risks?.slice(0, 2).join('. ')}.</p>
                    </div>
                  </div>
                  
                  <div className="p-3 bg-[#F0F7FF] rounded-lg">
                    <span className="text-xs font-semibold text-[#0B4DBB] uppercase">Exit Readiness</span>
                    <p className="text-slate-700 mt-1">{ai_commentary.exit_readiness?.split('.').slice(0, 1).join('.')}.</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Sidebar (Buyer's Cheat Sheet) */}
          <div className="space-y-6">
            {/* QUICK SNAPSHOT — Investor Memo Side Panel */}
            <div className="bg-[#FAFBFC] rounded-xl border border-[#EEF2F7] p-5" data-testid="quick-snapshot">
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Quick Snapshot</h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">ARR</span>
                  <span className="text-base font-bold text-slate-900">{formatCurrency(result?.arr_used)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">Growth</span>
                  <span className="text-base font-bold text-slate-900">{valuation.metrics?.growth_rate}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">Gross Margin</span>
                  <span className="text-base font-bold text-slate-900">{valuation.metrics?.gross_margin}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">NRR</span>
                  <span className="text-base font-bold text-slate-900">{valuation.metrics?.nrr}%</span>
                </div>
                {valuation.metrics?.churn_rate !== undefined && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500">Churn</span>
                    <span className="text-base font-bold text-slate-900">{valuation.metrics?.churn_rate || (100 - (valuation.metrics?.nrr || 100))}%</span>
                  </div>
                )}
                <div className="flex items-center justify-between pt-2 border-t border-[#EEF2F7]">
                  <span className="text-sm text-slate-500">Multiple Used</span>
                  <span className="text-base font-bold text-[#0B4DBB]">{result?.multiple_used}x</span>
                </div>
              </div>
            </div>

            {/* BUYER FILTERS — Pre-Due-Diligence Checklist */}
            <div className="bg-[#FAFBFC] rounded-xl border border-[#EEF2F7] p-5" data-testid="buyer-filters">
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Buyer Filters</h3>
              
              <div className="space-y-3">
                {/* Stripe Verified */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Stripe Verified</span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    valuation.metrics?.stripe_verified 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-slate-100 text-slate-500'
                  }`}>
                    {valuation.metrics?.stripe_verified ? 'Yes' : 'No'}
                  </span>
                </div>
                
                {/* 12-Month History */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">12-Month History</span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    valuation.metrics?.has_12_month_history 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-amber-100 text-amber-700'
                  }`}>
                    {valuation.metrics?.has_12_month_history ? 'Yes' : 'No'}
                  </span>
                </div>
                
                {/* Founder Involvement */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Founder Involvement</span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    (valuation.metrics?.founder_hours_per_week || 40) <= 10 
                      ? 'bg-green-100 text-green-700' 
                      : (valuation.metrics?.founder_hours_per_week || 40) <= 25 
                        ? 'bg-amber-100 text-amber-700' 
                        : 'bg-red-100 text-red-700'
                  }`}>
                    {valuation.metrics?.founder_hours_per_week || '40'}h/wk
                  </span>
                </div>
                
                {/* Revenue Concentration */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Revenue Concentration &gt;30%</span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    (valuation.metrics?.top_customer_concentration || 0) > 30 
                      ? 'bg-red-100 text-red-700' 
                      : 'bg-green-100 text-green-700'
                  }`}>
                    {(valuation.metrics?.top_customer_concentration || 0) > 30 ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>
            </div>

            {/* Company Details - Condensed */}
            <div className="bg-white rounded-xl border border-[#EEF2F7] p-5">
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Company Details</h3>
              
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Company</span>
                  <span className="font-medium text-slate-900">{valuation.company_info?.company_name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Industry</span>
                  <span className="font-medium text-slate-900">{valuation.company_info?.industry}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Model</span>
                  <span className="font-medium text-slate-900">{valuation.company_info?.business_model}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Stage</span>
                  <span className="font-medium text-slate-900">{valuation.company_info?.stage}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Team</span>
                  <span className="font-medium text-slate-900">{valuation.metrics?.team_size} people</span>
                </div>
              </div>
            </div>

            {/* Assumptions Card - Collapsible */}
            {assumptions && (
              <div className="bg-white rounded-xl border border-[#EEF2F7] overflow-hidden">
                <button
                  onClick={() => setShowAssumptions(!showAssumptions)}
                  className="w-full px-5 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
                >
                  <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Assumptions</h3>
                  {showAssumptions ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </button>
                
                <AnimatePresence>
                  {showAssumptions && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: 'auto' }}
                      exit={{ height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5 space-y-3 text-sm">
                        <div>
                          <p className="text-slate-500">Multiple Source</p>
                          <p className="text-slate-700">{assumptions.base_multiple_source}</p>
                        </div>
                        <div>
                          <p className="text-slate-500">Growth</p>
                          <p className="text-slate-700">{assumptions.growth_assumption}</p>
                        </div>
                        <div>
                          <p className="text-slate-500">Margin</p>
                          <p className="text-slate-700">{assumptions.margin_assumption}</p>
                        </div>
                        {assumptions.risk_factors?.length > 0 && (
                          <div>
                            <p className="text-amber-600 font-medium">Risks</p>
                            <ul className="mt-1 space-y-1">
                              {assumptions.risk_factors?.slice(0, 3).map((risk, i) => (
                                <li key={i} className="text-slate-600 flex items-start gap-2">
                                  <span className="w-1 h-1 rounded-full bg-amber-500 mt-2 flex-shrink-0"></span>
                                  {risk}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Quick Actions */}
            <div className="bg-gradient-to-br from-[#F0F7FF] to-white rounded-xl border border-[#DCEAFF] p-5">
              <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Quick Actions</h4>
              <div className="space-y-2">
                <Link to={`/valuation/new/${valuation.project_id}`}>
                  <Button variant="outline" size="sm" className="w-full justify-start border-[#EEF2F7] hover:bg-white text-sm">
                    <TrendingUp className="w-3.5 h-3.5 mr-2" />
                    New Valuation
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={copyShareLink}
                  className="w-full justify-start border-[#EEF2F7] hover:bg-white text-sm"
                >
                  <Copy className="w-3.5 h-3.5 mr-2" />
                  Copy Investor Link
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ValuationResults;
