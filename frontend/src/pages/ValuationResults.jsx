import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
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
  
  // Mobile sidebar collapse states
  const [showMobileSnapshot, setShowMobileSnapshot] = useState(false);
  const [showMobileBuyerFilters, setShowMobileBuyerFilters] = useState(false);
  const [showMobileCompanyDetails, setShowMobileCompanyDetails] = useState(false);
  
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
        <div className="py-12 flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-[#0B4DBB] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!valuation) return null;

  const { result, exit_scenarios, assumptions, ai_commentary } = valuation;

  // Sidebar Content Component (reused for desktop and mobile)
  const SidebarContent = ({ isMobile = false }) => (
    <>
      {/* QUICK SNAPSHOT - Investor Style */}
      {isMobile ? (
        <div className="sidebar-snapshot rounded-xl overflow-hidden">
          <button
            onClick={() => setShowMobileSnapshot(!showMobileSnapshot)}
            className="w-full px-5 py-4 flex items-center justify-between bg-gradient-to-r from-slate-50 to-transparent"
          >
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Quick Snapshot</h3>
            {showMobileSnapshot ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
          </button>
          <AnimatePresence>
            {showMobileSnapshot && (
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: 'auto' }}
                exit={{ height: 0 }}
                className="overflow-hidden"
              >
                <div className="px-5 pb-5">
                  <SnapshotMetrics />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ) : (
        <div className="sidebar-snapshot rounded-xl p-5" data-testid="quick-snapshot">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Quick Snapshot</h3>
          <SnapshotMetrics />
        </div>
      )}

      {/* BUYER FILTERS - Checklist Style */}
      {isMobile ? (
        <div className="sidebar-filters rounded-xl overflow-hidden">
          <button
            onClick={() => setShowMobileBuyerFilters(!showMobileBuyerFilters)}
            className="w-full px-5 py-4 flex items-center justify-between"
          >
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Buyer Filters</h3>
            {showMobileBuyerFilters ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
          </button>
          <AnimatePresence>
            {showMobileBuyerFilters && (
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: 'auto' }}
                exit={{ height: 0 }}
                className="overflow-hidden"
              >
                <div className="px-5 pb-5">
                  <BuyerFiltersContent />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ) : (
        <div className="sidebar-filters rounded-xl p-5" data-testid="buyer-filters">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Buyer Filters</h3>
          <BuyerFiltersContent />
        </div>
      )}

      {/* COMPANY DETAILS */}
      {isMobile ? (
        <div className="bg-white rounded-xl border border-[#EEF2F7] overflow-hidden">
          <button
            onClick={() => setShowMobileCompanyDetails(!showMobileCompanyDetails)}
            className="w-full px-5 py-4 flex items-center justify-between"
          >
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Company Details</h3>
            {showMobileCompanyDetails ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
          </button>
          <AnimatePresence>
            {showMobileCompanyDetails && (
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: 'auto' }}
                exit={{ height: 0 }}
                className="overflow-hidden"
              >
                <div className="px-5 pb-5 space-y-3 text-sm">
                  <CompanyDetailsContent />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-[#EEF2F7] p-5">
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Company Details</h3>
          <CompanyDetailsContent />
        </div>
      )}

      {/* ASSUMPTIONS - Collapsible on both */}
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

      {/* QUICK ACTIONS */}
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
    </>
  );

  // Snapshot Metrics Component - Investor Style
  const SnapshotMetrics = () => (
    <div className="space-y-1">
      <div className="metric-row flex items-center justify-between py-2">
        <span className="metric-label text-sm text-slate-500">ARR</span>
        <span className="metric-value text-base font-semibold text-slate-900 tabular-nums">{formatCurrency(result?.arr_used)}</span>
      </div>
      <div className="metric-row flex items-center justify-between py-2">
        <span className="metric-label text-sm text-slate-500">Growth</span>
        <span className="metric-value text-base font-semibold text-slate-900 tabular-nums">{valuation.metrics?.growth_rate}%</span>
      </div>
      <div className="metric-row flex items-center justify-between py-2">
        <span className="metric-label text-sm text-slate-500">Gross Margin</span>
        <span className="metric-value text-base font-semibold text-slate-900 tabular-nums">{valuation.metrics?.gross_margin}%</span>
      </div>
      <div className="metric-row flex items-center justify-between py-2">
        <span className="metric-label text-sm text-slate-500">NRR</span>
        <span className="metric-value text-base font-semibold text-slate-900 tabular-nums">{valuation.metrics?.nrr}%</span>
      </div>
      <div className="metric-row flex items-center justify-between py-3 mt-2 border-t border-slate-200/60">
        <span className="metric-label text-sm text-slate-500">Multiple</span>
        <span className="metric-value text-base font-bold text-[#0B4DBB] tabular-nums">{result?.multiple_used}x</span>
      </div>
    </div>
  );

  // Buyer Filters Component - Checklist Style
  const BuyerFiltersContent = () => (
    <div className="space-y-0">
      <div className="filter-row flex items-center justify-between py-3 border-b border-slate-100">
        <span className="text-sm text-slate-600">Stripe Verified</span>
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
          valuation.metrics?.stripe_verified 
            ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' 
            : 'bg-slate-50 text-slate-500 ring-1 ring-slate-200'
        }`}>
          {valuation.metrics?.stripe_verified ? 'Yes' : 'No'}
        </span>
      </div>
      <div className="filter-row flex items-center justify-between py-3 border-b border-slate-100">
        <span className="text-sm text-slate-600">12-Month History</span>
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
          valuation.metrics?.has_12_month_history 
            ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' 
            : 'bg-amber-50 text-amber-700 ring-1 ring-amber-200'
        }`}>
          {valuation.metrics?.has_12_month_history ? 'Yes' : 'No'}
        </span>
      </div>
      <div className="filter-row flex items-center justify-between py-3 border-b border-slate-100">
        <span className="text-sm text-slate-600">Founder Involvement</span>
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
          (valuation.metrics?.founder_hours_per_week || 40) <= 10 
            ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' 
            : (valuation.metrics?.founder_hours_per_week || 40) <= 25 
              ? 'bg-amber-50 text-amber-700 ring-1 ring-amber-200' 
              : 'bg-red-50 text-red-700 ring-1 ring-red-200'
        }`}>
          {valuation.metrics?.founder_hours_per_week || '40'}h/wk
        </span>
      </div>
      <div className="filter-row flex items-center justify-between py-3">
        <span className="text-sm text-slate-600">Revenue Concentration &gt;30%</span>
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
          (valuation.metrics?.top_customer_concentration || 0) > 30 
            ? 'bg-red-50 text-red-700 ring-1 ring-red-200' 
            : 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
        }`}>
          {(valuation.metrics?.top_customer_concentration || 0) > 30 ? 'Yes' : 'No'}
        </span>
      </div>
    </div>
  );

  // Company Details Component
  const CompanyDetailsContent = () => (
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
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC]" data-testid="valuation-results">

      <main className="py-8 px-6 md:px-8 lg:px-12 max-w-[1400px] mx-auto">
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

        {/* TOP-LEVEL GRID: Main Content + Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
          
          {/* LEFT COLUMN — Main Content */}
          <div className="space-y-8">
            {/* SECTION 1 — PREMIUM HERO SNAPSHOT */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="hero-premium-card relative"
            >
              {/* Confidence Badge - Top Right */}
              <div className="absolute top-4 right-4 md:top-6 md:right-6">
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-3 py-1.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                  <div className="text-xs">
                    <span className="text-white/90 font-medium">Moderate Confidence</span>
                    <span className="text-white/50 ml-1">• Based on {Object.keys(valuation.metrics || {}).length} metrics</span>
                  </div>
                </div>
              </div>

              {/* Main Content */}
              <div className="text-center pt-8 md:pt-12 pb-10 md:pb-14 px-6 md:px-12">
                {/* Small uppercase label */}
                <p className="text-white/60 text-xs uppercase tracking-[0.2em] mb-6">
                  {valuation.company_info?.company_name}
                </p>
                
                {/* Valuation Amount with Glow */}
                <div className="relative inline-block">
                  <div className="absolute inset-0 blur-3xl bg-white/10 scale-150"></div>
                  <h1 className="relative text-5xl md:text-7xl font-extrabold tracking-tight mb-3" data-testid="valuation-amount">
                    {formatCurrency(adjustedVal.base)}
                  </h1>
                </div>
                
                {/* Secondary Label */}
                <p className="text-white/80 text-base md:text-lg font-medium mb-6">
                  Estimated Enterprise Value
                </p>
                
                {/* Multiple Display - Value Creation Style */}
                <div className="flex items-center justify-center gap-3 mb-6">
                  <span className="text-white/50 text-sm">
                    Revenue Multiple: <span className="text-white/40">{result?.base_multiple}x</span>
                  </span>
                  <span className="text-white/30">→</span>
                  <span className="text-white font-semibold text-sm">
                    {result?.multiple_used}x
                  </span>
                  {result?.multiple_used > result?.base_multiple && (
                    <span className="bg-emerald-500/20 text-emerald-300 text-xs font-medium px-2 py-0.5 rounded">
                      +{(result?.multiple_used - result?.base_multiple).toFixed(2)}x premium
                    </span>
                  )}
                  {result?.multiple_used < result?.base_multiple && (
                    <span className="bg-amber-500/20 text-amber-300 text-xs font-medium px-2 py-0.5 rounded">
                      {(result?.multiple_used - result?.base_multiple).toFixed(2)}x discount
                    </span>
                  )}
                </div>
                
                {/* Micro KPI Strip */}
                <div className="flex items-center justify-center gap-2 text-white/50 text-xs tracking-wide">
                  <span>ARR {formatCurrency(result?.arr_used)}</span>
                  <span className="text-white/30">·</span>
                  <span>{valuation.metrics?.growth_rate}% Growth</span>
                  <span className="text-white/30">·</span>
                  <span>{valuation.metrics?.gross_margin}% Gross Margin</span>
                  <span className="text-white/30">·</span>
                  <span>{valuation.metrics?.nrr}% NRR</span>
                </div>
              </div>
            </motion.div>

            {/* MOBILE SIDEBAR — Collapsible cards below Hero */}
            <div className="lg:hidden space-y-3">
              <SidebarContent isMobile={true} />
            </div>

            {/* ═══════════════════════════════════════════════════════════════
                TIER 1 - PRIMARY STRATEGIC BLOCKS (Sections 2-5)
                Highest visual importance: stronger shadow, top border accent
            ═══════════════════════════════════════════════════════════════ */}
            
            {/* SECTION 2 — EXIT READINESS SCORE */}
            <div className="tier-1-block">
              <ExitReadinessCard 
                metrics={valuation.metrics} 
                valuationId={valuationId}
              />
            </div>

            {/* SECTION 3 — RISK & DEAL KILLERS */}
            <div className="tier-1-block">
              <DealKillerAlert metrics={valuation.metrics} />
            </div>

            {/* SECTION 4 — BUYER FIT ANALYSIS */}
            <div className="tier-1-block">
              <BuyerFitSection metrics={valuation.metrics} />
            </div>

            {/* SECTION 5 — EXIT OPTIMIZATION ROADMAP */}
            <div className="tier-1-block">
              <OptimizationRoadmap metrics={valuation.metrics} />
            </div>

            {/* ═══════════════════════════════════════════════════════════════
                TIER 2 - SECONDARY STRATEGIC BLOCKS (Sections 6-7)
                Standard importance: neutral white, standard shadow
            ═══════════════════════════════════════════════════════════════ */}

            {/* SECTION 6 — WHAT-IF SIMULATOR */}
            <div className="tier-2-block">
              <MultipleImpactSimulator 
                metrics={valuation.metrics} 
                currentMultiple={valuation.results?.base_multiple || 3.0}
              />
            </div>

            {/* SECTION 7 — EXIT SCENARIOS */}
            <div className="tier-2-block">
              <div className="bg-white rounded-2xl p-6">
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
            </div>

            {/* ═══════════════════════════════════════════════════════════════
                TIER 3 - INFORMATIONAL BLOCKS
                Compact, minimal styling, reduced padding
            ═══════════════════════════════════════════════════════════════ */}

            {/* Valuation Range with Sliders */}
            <div className="tier-3-block">
              <div className="bg-white rounded-xl p-5">
                <h3 className="text-base font-semibold text-slate-900 mb-5">Valuation Range</h3>
                
                <div className="grid grid-cols-3 gap-3 mb-5">
                  <div className="text-center p-3 rounded-xl bg-slate-50">
                    <p className="text-xs text-slate-500 mb-1">Conservative</p>
                    <p className="text-xl font-bold text-slate-700" data-testid="val-low">{formatCurrency(adjustedVal.low)}</p>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-[#0B4DBB] text-white">
                    <p className="text-xs text-white/70 mb-1">Base Case</p>
                    <p className="text-xl font-bold" data-testid="val-base">{formatCurrency(adjustedVal.base)}</p>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-slate-100">
                    <p className="text-xs text-slate-500 mb-1">Optimistic</p>
                    <p className="text-xl font-bold text-slate-700" data-testid="val-high">{formatCurrency(adjustedVal.high)}</p>
                  </div>
                </div>

                {/* Scenario Sliders */}
                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <h4 className="text-sm font-medium text-slate-600">Scenario Analysis</h4>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm text-slate-600">Growth Adjustment</label>
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
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm text-slate-600">Multiple Adjustment</label>
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
            </div>

            {/* Adjustments Breakdown */}
            {result?.adjustments && result.adjustments.length > 0 && (
              <div className="tier-3-block">
                <div className="bg-white rounded-xl overflow-hidden">
                  <button
                    onClick={() => setShowAdjustments(!showAdjustments)}
                    className="w-full px-5 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors"
                  >
                    <h3 className="text-base font-semibold text-slate-900">Valuation Adjustments</h3>
                    {showAdjustments ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </button>
                  
                  <AnimatePresence>
                    {showAdjustments && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: 'auto' }}
                        exit={{ height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 pb-5 space-y-2">
                          {result.adjustments.map((adj, index) => (
                          <div key={index} className="flex items-start gap-2.5 p-2.5 bg-slate-50 rounded-lg">
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold ${
                              adj.adjustment > 0 ? 'bg-emerald-100 text-emerald-600' : 
                              adj.adjustment < 0 ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-600'
                            }`}>
                              {adj.adjustment > 0 ? '+' : ''}{(adj.adjustment * 100).toFixed(0)}%
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-slate-900">{adj.factor}</p>
                              <p className="text-xs text-slate-500">{adj.reason}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              </div>
            )}

            {/* SECTION 8 — EXECUTIVE SUMMARY (Tier 3 - Informational) */}
            {ai_commentary && (
              <div className="tier-3-block">
                <div className="bg-white rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Info className="w-4 h-4 text-slate-400" />
                    <h3 className="text-base font-semibold text-slate-900">Executive Summary</h3>
                  </div>
                  
                  <div className="space-y-3 text-sm text-slate-600 leading-relaxed">
                    <p>{ai_commentary.summary?.split('.').slice(0, 2).join('.')}.</p>
                    
                    <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100">
                      <div>
                        <span className="text-xs font-semibold text-emerald-600 uppercase">Strengths</span>
                        <p className="text-slate-500 mt-1 text-xs">{ai_commentary.key_strengths?.slice(0, 2).join('. ')}.</p>
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-amber-600 uppercase">Risks</span>
                        <p className="text-slate-500 mt-1 text-xs">{ai_commentary.key_risks?.slice(0, 2).join('. ')}.</p>
                      </div>
                    </div>
                    
                    <div className="p-2.5 bg-slate-50 rounded-lg">
                      <span className="text-xs font-semibold text-[#0B4DBB] uppercase">Exit Readiness</span>
                      <p className="text-slate-600 mt-1 text-xs">{ai_commentary.exit_readiness?.split('.').slice(0, 1).join('.')}.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN — Sticky Sidebar (Desktop Only) */}
          <div className="hidden lg:block">
            <div className="sticky top-24 space-y-4 max-h-[calc(100vh-120px)] overflow-y-auto pb-8 scrollbar-thin">
              <SidebarContent isMobile={false} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ValuationResults;
