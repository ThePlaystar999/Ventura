import React, { useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import VLogo from '../components/VLogo';
import ValuationPreviewPanel from '../components/valuation/ValuationPreviewPanel';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Slider } from '../components/ui/slider';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../components/ui/tooltip';
import { toast } from 'sonner';
import { 
  ArrowLeft, ArrowRight, Building2, BarChart3, Sparkles, Star, Check, 
  HelpCircle, DollarSign, Percent, Users, AlertTriangle, Hash, PieChart,
  TrendingUp, Shield, Target, Zap, FileText, Edit3, ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { VALUATION_FIELDS } from '../constants/valuationFields';

const API = process.env.REACT_APP_BACKEND_URL + "/api";

const CreateValuation = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [previewExpanded, setPreviewExpanded] = useState(false);
  const [revenueType, setRevenueType] = useState('arr'); // 'arr' or 'mrr'

  const [formData, setFormData] = useState({
    // Company Info
    company_name: '',
    industry: '',
    country: 'United States',
    stage: '',
    business_model: 'SaaS',
    founding_year: '',
    // Metrics - Core
    arr: '',
    mrr: '',
    growth_rate: '',
    gross_margin: '',
    nrr: '',
    grr: '',
    // Metrics - Churn
    logo_churn: '',
    churn_frequency: 'monthly', // 'monthly' or 'annual'
    // Metrics - Profitability
    profitability_metric: 'ebitda', // 'ebitda' or 'sde'
    ebitda_margin: '',
    sde_margin: '',
    // Metrics - Customer
    customer_concentration: '',
    customer_count: '',
    // Metrics - Revenue Mix (must sum to 100)
    revenue_subscription: '100',
    revenue_usage: '0',
    revenue_services: '0',
    // Metrics - Other
    burn_multiple: '',
    runway_months: '',
    team_size: '',
    // Qualitative
    product_maturity: 3,
    market_size: '',
    competitive_moat: '',
    founder_dependency: '',
    sales_predictability: '',
    founder_hours: '',
    has_audited_financials: false,
    stripe_connected: false
  });

  const industries = [
    'SaaS', 'AI/ML', 'FinTech', 'HealthTech', 'EdTech', 'CleanTech',
    'Cybersecurity', 'MarTech', 'DevTools', 'HRTech', 'E-Commerce', 
    'Logistics', 'Media/Content', 'Other'
  ];

  const businessModels = [
    'SaaS (Subscription)', 'Usage-Based', 'Marketplace', 'Hybrid',
    'Transactional', 'Enterprise', 'Freemium', 'Other'
  ];

  const stages = [
    'Bootstrapped', 'Pre-seed', 'Seed', 'Series A', 'Series B', 'Series C+'
  ];

  const countries = [
    'United States', 'United Kingdom', 'Germany', 'France', 'Canada',
    'Australia', 'Netherlands', 'Singapore', 'Other'
  ];

  const handleChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const isStep1Valid = () => {
    return formData.company_name && formData.industry && formData.stage && formData.business_model;
  };

  const isStep2Valid = () => {
    const hasRevenue = revenueType === 'arr' ? formData.arr : formData.mrr;
    return hasRevenue && formData.growth_rate && formData.gross_margin;
  };

  const handleNext = () => {
    if (step === 1 && isStep1Valid()) {
      setStep(2);
    } else if (step === 2 && isStep2Valid()) {
      setStep(3);
    } else if (step === 3) {
      // Go to analysis step first
      setStep(4);
      setAnalyzing(true);
      // Simulate analysis delay, then show results
      setTimeout(() => {
        setAnalyzing(false);
        setAnalysisComplete(true);
      }, 2500);
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const submitValuation = async () => {
    setAnalyzing(true);
    setStep(4);

    await new Promise(resolve => setTimeout(resolve, 2500));

    try {
      // Calculate ARR from MRR if needed
      const arr = revenueType === 'arr' 
        ? parseFloat(formData.arr) || 0 
        : (parseFloat(formData.mrr) || 0) * 12;

      // Calculate annual churn from monthly if needed
      const logoChurn = parseFloat(formData.logo_churn) || null;
      const annualizedChurn = logoChurn && formData.churn_frequency === 'monthly' 
        ? logoChurn * 12 
        : logoChurn;

      const response = await fetch(`${API}/valuations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          project_id: projectId,
          company_info: {
            company_name: formData.company_name,
            industry: formData.industry,
            country: formData.country,
            stage: formData.stage,
            business_model: formData.business_model,
            founding_year: formData.founding_year ? parseInt(formData.founding_year) : null
          },
          metrics: {
            arr: arr,
            mrr: parseFloat(formData.mrr) || 0,
            growth_rate: parseFloat(formData.growth_rate) || 0,
            gross_margin: parseFloat(formData.gross_margin) || 0,
            // Retention metrics
            nrr: parseFloat(formData.nrr) || 100,
            grr: parseFloat(formData.grr) || null,
            logo_churn: annualizedChurn,
            churn_frequency: formData.churn_frequency,
            // Profitability
            ebitda_margin: formData.profitability_metric === 'ebitda' ? parseFloat(formData.ebitda_margin) || null : null,
            sde_margin: formData.profitability_metric === 'sde' ? parseFloat(formData.sde_margin) || null : null,
            profitability_metric_type: formData.profitability_metric,
            // Customer base
            customer_concentration: parseFloat(formData.customer_concentration) || null,
            customer_count: parseInt(formData.customer_count) || null,
            // Revenue mix
            revenue_subscription_pct: parseInt(formData.revenue_subscription) || 100,
            revenue_usage_pct: parseInt(formData.revenue_usage) || 0,
            revenue_services_pct: parseInt(formData.revenue_services) || 0,
            // Efficiency
            burn_multiple: parseFloat(formData.burn_multiple) || null,
            runway_months: parseInt(formData.runway_months) || null,
            team_size: parseInt(formData.team_size) || 1,
            // Legacy fields
            founder_hours_per_week: parseInt(formData.founder_hours) || null,
            has_audited_financials: formData.has_audited_financials,
            stripe_verified: formData.stripe_connected
          },
          qualitative: {
            product_maturity: formData.product_maturity,
            market_size: formData.market_size,
            competitive_moat: formData.competitive_moat,
            founder_dependency: formData.founder_dependency,
            sales_predictability: formData.sales_predictability,
            // Calculated score
            qualitative_score: calculateQualitativeScore().qualitativeScore,
            qualitative_notes: calculateQualitativeScore().qualitativeNotes
          }
        })
      });

      if (response.ok) {
        const valuation = await response.json();
        toast.success('Valuation complete!');
        navigate(`/valuation/${valuation.valuation_id}`);
      } else {
        const err = await response.json();
        throw new Error(err.detail || 'Failed to create valuation');
      }
    } catch (error) {
      toast.error(error.message || 'Something went wrong');
      setStep(3);
    }
    setAnalyzing(false);
  };

  const steps = [
    { number: 1, title: 'Company', icon: Building2 },
    { number: 2, title: 'Financials', icon: BarChart3 },
    { number: 3, title: 'Qualitative', icon: Star },
    { number: 4, title: 'Analysis', icon: Sparkles }
  ];

  // Show preview panel on steps 2 and 3
  const showPreview = step === 2 || step === 3;

  // Tooltip helper component
  const FieldTooltip = ({ content }) => (
    <Tooltip>
      <TooltipTrigger asChild>
        <button type="button" className="text-slate-400 hover:text-slate-600 transition-colors ml-1">
          <HelpCircle className="w-3.5 h-3.5" />
        </button>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs text-xs">
        <p>{content}</p>
      </TooltipContent>
    </Tooltip>
  );

  // Enhanced Tooltip with definition, example, and range
  const EnhancedTooltip = ({ title, definition, example, range, fieldKey }) => {
    // If fieldKey provided, use constants
    const field = fieldKey ? VALUATION_FIELDS[fieldKey] : null;
    const t = field?.tooltip || { title, definition, example, range };
    
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <button type="button" className="text-slate-400 hover:text-slate-600 transition-colors ml-1">
            <HelpCircle className="w-3.5 h-3.5" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-sm p-0 overflow-hidden">
          <div className="bg-slate-900 text-white">
            <div className="px-3 py-2 border-b border-slate-700">
              <p className="font-semibold text-sm">{t.title}</p>
            </div>
            <div className="px-3 py-2 space-y-2 text-xs">
              <p className="text-slate-300">{t.definition}</p>
              {t.example && (
                <p className="text-slate-400">
                  <span className="text-slate-500">Example:</span> {t.example}
                </p>
              )}
              {t.range && (
                <p className="text-emerald-400 font-medium">
                  {typeof t.range === 'object' ? t.range[formData.churn_frequency] || t.range.monthly : t.range}
                </p>
              )}
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    );
  };

  // Field Label with Tooltip - uses constants
  const FieldLabel = ({ fieldKey, required = false, children }) => {
    const field = VALUATION_FIELDS[fieldKey];
    if (!field) return <span>{children}</span>;
    
    return (
      <label className="flex items-center text-sm font-medium text-slate-700 mb-2">
        {field.label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
        <EnhancedTooltip fieldKey={fieldKey} />
      </label>
    );
  };

  // Field Helper Text - uses constants
  const FieldHelper = ({ fieldKey }) => {
    const field = VALUATION_FIELDS[fieldKey];
    if (!field?.helper) return null;
    return <p className="text-xs text-slate-500 mt-1">{field.helper}</p>;
  };

  // Warning Badge Component (non-blocking)
  const WarningBadge = ({ message }) => (
    <motion.div 
      initial={{ opacity: 0, y: -5 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-1.5 mt-1.5 px-2 py-1 bg-amber-50 border border-amber-200 rounded-md"
    >
      <AlertTriangle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
      <span className="text-xs text-amber-700">{message}</span>
    </motion.div>
  );

  // === VALIDATION FUNCTIONS (soft warnings, non-blocking) ===
  
  const getGrossMarginWarning = () => {
    const gm = parseFloat(formData.gross_margin);
    if (!gm) return null;
    if (gm < 30) return "Unusually low for SaaS (<30%). Verify data.";
    if (gm > 95) return "Unusually high (>95%). Verify COGS calculation.";
    if (gm < 60) return "Below typical SaaS range. May impact multiple.";
    return null;
  };

  const getNRRWarning = () => {
    const nrr = parseFloat(formData.nrr);
    const grr = parseFloat(formData.grr);
    if (!nrr) return null;
    if (nrr > 200) return "Very high (>200%). Double-check your data.";
    if (nrr < 80) return "Low NRR (<80%). High churn concern.";
    if (grr && nrr < grr) return "NRR < GRR is unusual. Please verify.";
    return null;
  };

  const getGRRWarning = () => {
    const grr = parseFloat(formData.grr);
    const nrr = parseFloat(formData.nrr);
    if (!grr) return null;
    if (grr > 100) return "GRR cannot exceed 100%.";
    if (grr < 70) return "Low GRR (<70%). Significant churn concern.";
    if (nrr && grr > nrr) return "GRR > NRR is impossible. Please verify.";
    return null;
  };

  const getConcentrationWarning = () => {
    const conc = parseFloat(formData.customer_concentration);
    if (!conc) return null;
    if (conc > 50) return "Very high (>50%). Major risk to acquirers.";
    if (conc > 30) return "High concentration (>30%). Multiple likely discounted.";
    return null;
  };

  // === QUALITATIVE SCORING SYSTEM ===
  
  // Count completed qualitative dimensions
  const getQualitativeCompletion = () => {
    let completed = 0;
    const total = 5;
    
    if (formData.product_maturity) completed++;
    if (formData.market_size) completed++;
    if (formData.competitive_moat) completed++;
    if (formData.founder_dependency) completed++;
    if (formData.sales_predictability) completed++;
    
    return { completed, total, percentage: Math.round((completed / total) * 100) };
  };

  // === COMPUTE VALUATION FUNCTION ===
  // Full valuation computation for Analysis step
  const computeValuation = () => {
    // Get ARR (from ARR or MRR)
    const arr = revenueType === 'arr' 
      ? parseFloat(formData.arr) || 0 
      : (parseFloat(formData.mrr) || 0) * 12;
    const isFromMRR = revenueType === 'mrr' && formData.mrr;
    
    // Get all metrics
    const growth = parseFloat(formData.growth_rate) || 0;
    const grossMargin = parseFloat(formData.gross_margin) || 70;
    const nrr = parseFloat(formData.nrr) || 100;
    const grr = parseFloat(formData.grr) || null;
    const logoChurn = parseFloat(formData.logo_churn) || null;
    const customerConcentration = parseFloat(formData.customer_concentration) || 0;
    const ebitdaMargin = parseFloat(formData.ebitda_margin) || null;
    const sdeMargin = parseFloat(formData.sde_margin) || null;
    const revenueSubscription = parseInt(formData.revenue_subscription) || 100;
    
    // Base multiple calculation
    let baseMultiple = 3.0;
    const drivers = [];
    const risks = [];
    const improvements = [];
    const missingInputs = [];
    
    // Track what's missing for confidence
    if (!formData.logo_churn) missingInputs.push('Churn rate');
    if (!formData.customer_concentration) missingInputs.push('Customer concentration');
    if (!formData.ebitda_margin && !formData.sde_margin) missingInputs.push('Profitability (EBITDA/SDE)');
    if (!formData.grr) missingInputs.push('GRR');
    if (!formData.nrr || formData.nrr === 100) missingInputs.push('NRR');
    
    // Growth premium (biggest driver)
    if (growth >= 100) {
      baseMultiple += 2.0;
      drivers.push({ text: `${growth}% YoY growth`, impact: '+2.0x', type: 'growth' });
    } else if (growth >= 75) {
      baseMultiple += 1.5;
      drivers.push({ text: `${growth}% YoY growth`, impact: '+1.5x', type: 'growth' });
    } else if (growth >= 50) {
      baseMultiple += 1.0;
      drivers.push({ text: `${growth}% YoY growth`, impact: '+1.0x', type: 'growth' });
    } else if (growth >= 25) {
      baseMultiple += 0.5;
    } else if (growth > 0 && growth < 25) {
      risks.push({ text: `Slow growth (${growth}%)`, impact: 'Multiple at risk' });
      improvements.push({ text: 'Increase growth rate above 50% YoY', potential: '+0.5x to +1.0x' });
    }
    
    // NRR premium
    if (nrr >= 130) {
      baseMultiple += 1.0;
      drivers.push({ text: `${nrr}% Net Revenue Retention`, impact: '+1.0x', type: 'retention' });
    } else if (nrr >= 115) {
      baseMultiple += 0.7;
      drivers.push({ text: `${nrr}% NRR (strong expansion)`, impact: '+0.7x', type: 'retention' });
    } else if (nrr >= 105) {
      baseMultiple += 0.4;
    } else if (nrr < 90 && nrr > 0) {
      baseMultiple -= 0.5;
      risks.push({ text: `Low NRR (${nrr}%)`, impact: '-0.5x' });
      improvements.push({ text: 'Improve NRR to 110%+', potential: '+0.5x to +1.0x' });
    }
    
    // GRR adjustment
    if (grr) {
      if (grr >= 95) {
        baseMultiple += 0.4;
        drivers.push({ text: `${grr}% GRR (low churn)`, impact: '+0.4x', type: 'retention' });
      } else if (grr < 80) {
        baseMultiple -= 0.4;
        risks.push({ text: `Low GRR (${grr}%)`, impact: '-0.4x' });
      }
    }
    
    // Gross margin adjustment
    if (grossMargin >= 85) {
      baseMultiple += 0.5;
      drivers.push({ text: `${grossMargin}% gross margin`, impact: '+0.5x', type: 'profitability' });
    } else if (grossMargin >= 75) {
      baseMultiple += 0.3;
    } else if (grossMargin < 60) {
      baseMultiple -= 0.5;
      risks.push({ text: `Low gross margin (${grossMargin}%)`, impact: '-0.5x' });
      improvements.push({ text: 'Improve gross margin to 70%+', potential: '+0.3x to +0.5x' });
    }
    
    // Customer concentration
    if (customerConcentration > 50) {
      baseMultiple -= 1.0;
      risks.push({ text: `Very high customer concentration (${customerConcentration}%)`, impact: '-1.0x' });
      improvements.push({ text: 'Reduce top customer below 30%', potential: '+0.5x to +1.0x' });
    } else if (customerConcentration > 30) {
      baseMultiple -= 0.5;
      risks.push({ text: `High customer concentration (${customerConcentration}%)`, impact: '-0.5x' });
      improvements.push({ text: 'Diversify customer base', potential: '+0.3x to +0.5x' });
    }
    
    // Revenue mix
    if (revenueSubscription >= 90) {
      baseMultiple += 0.3;
      drivers.push({ text: `${revenueSubscription}% subscription revenue`, impact: '+0.3x', type: 'model' });
    } else if (revenueSubscription < 70) {
      baseMultiple -= 0.3;
      risks.push({ text: `Low subscription revenue (${revenueSubscription}%)`, impact: '-0.3x' });
    }
    
    // Product maturity
    const maturityBonus = (formData.product_maturity - 3) * 0.3;
    baseMultiple += maturityBonus;
    if (formData.product_maturity >= 4) {
      drivers.push({ text: 'Strong product-market fit', impact: `+${maturityBonus.toFixed(1)}x`, type: 'product' });
    } else if (formData.product_maturity <= 2) {
      risks.push({ text: 'Early-stage product', impact: `${maturityBonus.toFixed(1)}x` });
    }
    
    // Market size
    if (formData.market_size === 'Large') {
      baseMultiple += 0.5;
      drivers.push({ text: 'Large addressable market (>$10B)', impact: '+0.5x', type: 'market' });
    } else if (formData.market_size === 'Small') {
      baseMultiple -= 0.3;
      risks.push({ text: 'Limited market size', impact: '-0.3x' });
    }
    
    // Competitive moat
    if (formData.competitive_moat === 'Strong') {
      baseMultiple += 0.5;
      drivers.push({ text: 'Strong competitive moat', impact: '+0.5x', type: 'moat' });
    } else if (formData.competitive_moat === 'Low') {
      baseMultiple -= 0.3;
      risks.push({ text: 'Weak competitive moat', impact: '-0.3x' });
      improvements.push({ text: 'Build defensibility (IP, network effects, data moat)', potential: '+0.3x to +0.5x' });
    }
    
    // Founder dependency
    if (formData.founder_dependency === 'Low') {
      baseMultiple += 0.3;
      drivers.push({ text: 'Low founder dependency', impact: '+0.3x', type: 'operations' });
    } else if (formData.founder_dependency === 'High') {
      baseMultiple -= 0.5;
      risks.push({ text: 'High founder dependency', impact: '-0.5x' });
      improvements.push({ text: 'Delegate operations, document processes', potential: '+0.3x to +0.5x' });
    }
    
    // Sales predictability
    if (formData.sales_predictability === 'Self-serve') {
      baseMultiple += 0.3;
      drivers.push({ text: 'Self-serve sales motion', impact: '+0.3x', type: 'sales' });
    } else if (formData.sales_predictability === 'Enterprise-lumpy') {
      baseMultiple -= 0.2;
      risks.push({ text: 'Enterprise-lumpy revenue', impact: '-0.2x' });
    }
    
    // Audited financials bonus
    if (formData.has_audited_financials) {
      baseMultiple += 0.2;
      drivers.push({ text: 'Audited financials', impact: '+0.2x', type: 'trust' });
    } else {
      improvements.push({ text: 'Get audited financials', potential: '+0.2x' });
    }
    
    // Industry adjustment
    if (formData.industry === 'AI/ML' || formData.industry === 'Cybersecurity') {
      baseMultiple += 0.5;
      drivers.push({ text: `${formData.industry} industry premium`, impact: '+0.5x', type: 'industry' });
    }
    
    // Ensure minimum multiple
    baseMultiple = Math.max(1.5, baseMultiple);
    
    // Calculate range
    const lowMultiple = Math.max(1.0, baseMultiple * 0.8);
    const highMultiple = baseMultiple * 1.2;
    
    // Calculate valuations
    const lowValuation = arr * lowMultiple;
    const baseValuation = arr * baseMultiple;
    const highValuation = arr * highMultiple;
    
    // Calculate confidence
    let confidenceScore = 0;
    if (arr > 0) confidenceScore += 2;
    if (growth > 0) confidenceScore += 1;
    if (grossMargin > 0) confidenceScore += 1;
    if (nrr !== 100 && nrr > 0) confidenceScore += 1;
    if (grr) confidenceScore += 1;
    if (logoChurn !== null) confidenceScore += 1;
    if (customerConcentration > 0) confidenceScore += 1;
    if (ebitdaMargin || sdeMargin) confidenceScore += 1;
    if (formData.founder_dependency) confidenceScore += 0.5;
    if (formData.sales_predictability) confidenceScore += 0.5;
    
    let confidence = 'Low';
    let confidenceExplanation = 'Limited data provided. Add more metrics for accuracy.';
    if (confidenceScore >= 8) {
      confidence = 'High';
      confidenceExplanation = 'Comprehensive data provided. High accuracy estimate.';
    } else if (confidenceScore >= 5) {
      confidence = 'Medium';
      confidenceExplanation = 'Good data coverage. Some metrics missing.';
    }
    
    // Sort drivers by impact (highest first) and limit to top 5
    const sortedDrivers = drivers
      .sort((a, b) => parseFloat(b.impact) - parseFloat(a.impact))
      .slice(0, 5);
    
    // Limit risks to 3
    const sortedRisks = risks.slice(0, 3);
    
    // Limit improvements to 4
    const sortedImprovements = improvements.slice(0, 4);
    
    return {
      arr,
      isFromMRR,
      lowMultiple,
      baseMultiple,
      highMultiple,
      lowValuation,
      baseValuation,
      highValuation,
      confidence,
      confidenceScore,
      confidenceExplanation,
      missingInputs,
      drivers: sortedDrivers,
      risks: sortedRisks,
      improvements: sortedImprovements
    };
  };

  // Calculate qualitative score (0-100) and generate notes
  const calculateQualitativeScore = () => {
    let score = 0;
    const strengths = [];
    const risks = [];
    
    // Product Maturity (0-25 points)
    const maturityScore = ((formData.product_maturity - 1) / 4) * 25;
    score += maturityScore;
    if (formData.product_maturity >= 4) {
      strengths.push('Strong product-market fit');
    } else if (formData.product_maturity <= 2) {
      risks.push('Early-stage product, higher risk');
    }
    
    // Market Size (0-20 points)
    if (formData.market_size === 'Large') {
      score += 20;
      strengths.push('Large addressable market (>$10B TAM)');
    } else if (formData.market_size === 'Medium') {
      score += 12;
    } else if (formData.market_size === 'Small') {
      score += 5;
      risks.push('Limited market size (<$1B TAM)');
    }
    
    // Competitive Moat (0-20 points)
    if (formData.competitive_moat === 'Strong') {
      score += 20;
      strengths.push('Strong competitive moat');
    } else if (formData.competitive_moat === 'Medium') {
      score += 12;
    } else if (formData.competitive_moat === 'Low') {
      score += 5;
      risks.push('Weak defensibility, easy to replicate');
    }
    
    // Founder Dependency (0-20 points) - Lower is better
    if (formData.founder_dependency === 'Low') {
      score += 20;
      strengths.push('Low founder dependency, highly transferable');
    } else if (formData.founder_dependency === 'Medium') {
      score += 12;
    } else if (formData.founder_dependency === 'High') {
      score += 5;
      risks.push('High founder dependency, key-person risk');
    }
    
    // Sales Predictability (0-15 points)
    if (formData.sales_predictability === 'Self-serve') {
      score += 15;
      strengths.push('Self-serve sales motion, scalable');
    } else if (formData.sales_predictability === 'Mixed') {
      score += 10;
    } else if (formData.sales_predictability === 'Enterprise-lumpy') {
      score += 5;
      risks.push('Enterprise sales, lumpy revenue recognition');
    }
    
    // Normalize to 0-100
    const normalizedScore = Math.min(100, Math.round(score));
    
    return {
      qualitativeScore: normalizedScore,
      qualitativeNotes: { strengths, risks },
      multiplierAdjustment: (normalizedScore - 50) / 100 // -0.5 to +0.5 multiplier adjustment
    };
  };

  // Revenue Mix Handler (auto-adjust to total 100)
  const handleRevenueMixChange = (field, value) => {
    const numValue = Math.max(0, Math.min(100, parseInt(value) || 0));
    handleChange(field, String(numValue));
  };

  const getRevenueMixTotal = () => {
    return (parseInt(formData.revenue_subscription) || 0) +
           (parseInt(formData.revenue_usage) || 0) +
           (parseInt(formData.revenue_services) || 0);
  };

  return (
    <TooltipProvider delayDuration={200}>
      <div className="min-h-screen bg-gradient-to-b from-white to-[#F8FAFC]" data-testid="create-valuation">
        <main className="py-8 px-4 md:px-8 lg:px-12">
          {/* Header */}
          <div className="text-center mb-10 max-w-2xl mx-auto">
            <motion.h1 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 mb-2"
            >
              Create Valuation
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-slate-600"
            >
              Complete each step for a comprehensive M&A-grade analysis
            </motion.p>
          </div>

          {/* Step Indicator */}
          <div className="flex items-center justify-center mb-10 max-w-2xl mx-auto">
            {steps.map((s, index) => (
              <React.Fragment key={s.number}>
                <div className="flex items-center">
                  <motion.div 
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                      step > s.number 
                        ? 'bg-[#0B4DBB] text-white' 
                        : step === s.number 
                          ? 'bg-[#0B4DBB] text-white ring-4 ring-[#DCEAFF]' 
                          : 'bg-[#EEF2F7] text-slate-400'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    data-testid={`step-indicator-${s.number}`}
                  >
                    {step > s.number ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <s.icon className="w-5 h-5" strokeWidth={1.5} />
                    )}
                  </motion.div>
                  <span className={`ml-2 text-sm font-medium hidden sm:block ${
                    step >= s.number ? 'text-slate-900' : 'text-slate-400'
                  }`}>
                    {s.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-8 md:w-12 lg:w-16 h-1 mx-2 rounded-full transition-colors duration-300 ${
                    step > s.number ? 'bg-[#0B4DBB]' : 'bg-[#EEF2F7]'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Main Content Area - 2 Column Layout on Desktop */}
          <div className={`max-w-5xl mx-auto ${showPreview ? 'lg:grid lg:grid-cols-[1fr_340px] lg:gap-8' : ''}`}>
            {/* Form Card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <AnimatePresence mode="wait">
                {/* Step 1: Company Info */}
                {step === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="p-6 md:p-8"
                  >
                    <h2 className="text-xl font-semibold text-slate-900 mb-6">Company Information</h2>
                    
                    <div className="space-y-5">
                      <div>
                        <label className="flex items-center text-sm font-medium text-slate-700 mb-2">
                          Company Name
                          <span className="text-red-500 ml-0.5">*</span>
                          <FieldTooltip content="Legal entity name as it would appear in an LOI or acquisition agreement." />
                        </label>
                        <Input
                          value={formData.company_name}
                          onChange={(e) => handleChange('company_name', e.target.value)}
                          placeholder="e.g., Acme Corp"
                          className="h-11"
                          data-testid="input-company-name"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                          <label className="flex items-center text-sm font-medium text-slate-700 mb-2">
                            Industry
                            <span className="text-red-500 ml-0.5">*</span>
                            <FieldTooltip content="Primary vertical - affects comparable multiples used in valuation." />
                          </label>
                          <Select value={formData.industry} onValueChange={(v) => handleChange('industry', v)}>
                            <SelectTrigger className="h-11" data-testid="select-industry">
                              <SelectValue placeholder="Select industry" />
                            </SelectTrigger>
                            <SelectContent>
                              {industries.map(ind => (
                                <SelectItem key={ind} value={ind}>{ind}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <label className="flex items-center text-sm font-medium text-slate-700 mb-2">
                            Business Model
                            <span className="text-red-500 ml-0.5">*</span>
                            <FieldTooltip content="Revenue model type - critical for multiple selection." />
                          </label>
                          <Select value={formData.business_model} onValueChange={(v) => handleChange('business_model', v)}>
                            <SelectTrigger className="h-11" data-testid="select-business-model">
                              <SelectValue placeholder="Select model" />
                            </SelectTrigger>
                            <SelectContent>
                              {businessModels.map(m => (
                                <SelectItem key={m} value={m}>{m}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                          <label className="flex items-center text-sm font-medium text-slate-700 mb-2">
                            Stage
                            <span className="text-red-500 ml-0.5">*</span>
                            <FieldTooltip content="Funding/maturity stage - influences risk premium in valuation." />
                          </label>
                          <Select value={formData.stage} onValueChange={(v) => handleChange('stage', v)}>
                            <SelectTrigger className="h-11" data-testid="select-stage">
                              <SelectValue placeholder="Select stage" />
                            </SelectTrigger>
                            <SelectContent>
                              {stages.map(s => (
                                <SelectItem key={s} value={s}>{s}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <label className="flex items-center text-sm font-medium text-slate-700 mb-2">
                            HQ Country
                            <FieldTooltip content="Primary jurisdiction - affects deal structure and comparables." />
                          </label>
                          <Select value={formData.country} onValueChange={(v) => handleChange('country', v)}>
                            <SelectTrigger className="h-11" data-testid="select-country">
                              <SelectValue placeholder="Select country" />
                            </SelectTrigger>
                            <SelectContent>
                              {countries.map(c => (
                                <SelectItem key={c} value={c}>{c}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                          <label className="flex items-center text-sm font-medium text-slate-700 mb-2">
                            Founded Year
                            <FieldTooltip content="Year of incorporation - used for maturity scoring." />
                          </label>
                          <Input
                            type="number"
                            value={formData.founding_year}
                            onChange={(e) => handleChange('founding_year', e.target.value)}
                            placeholder="e.g., 2020"
                            className="h-11"
                            min="1990"
                            max={new Date().getFullYear()}
                            data-testid="input-founding-year"
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Step 2: Financial Metrics - M&A Grade */}
                {step === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="p-6 md:p-8"
                  >
                    <h2 className="text-xl font-semibold text-slate-900 mb-1">Financial Metrics</h2>
                    <p className="text-sm text-slate-500 mb-6">M&A-grade inputs for accurate valuation</p>
                    
                    <div className="space-y-6">
                      {/* === SECTION: Revenue === */}
                      <div className="space-y-5">
                        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                          <DollarSign className="w-3.5 h-3.5" />
                          Revenue
                        </h3>

                        {/* ARR/MRR Toggle */}
                        <div>
                          <label className="flex items-center text-sm font-medium text-slate-700 mb-3">
                            {VALUATION_FIELDS.revenueType.label}
                            <span className="text-red-500 ml-0.5">*</span>
                            <EnhancedTooltip fieldKey="revenueType" />
                          </label>
                          
                          {/* Toggle Buttons */}
                          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg w-fit mb-3">
                            <button
                              type="button"
                              onClick={() => setRevenueType('arr')}
                              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                                revenueType === 'arr'
                                  ? 'bg-white text-slate-900 shadow-sm'
                                  : 'text-slate-600 hover:text-slate-900'
                              }`}
                              data-testid="toggle-arr"
                            >
                              I know ARR
                            </button>
                            <button
                              type="button"
                              onClick={() => setRevenueType('mrr')}
                              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                                revenueType === 'mrr'
                                  ? 'bg-white text-slate-900 shadow-sm'
                                  : 'text-slate-600 hover:text-slate-900'
                              }`}
                              data-testid="toggle-mrr"
                            >
                              I know MRR
                            </button>
                          </div>

                          {/* Revenue Input - Conditional */}
                          <AnimatePresence mode="wait">
                            {revenueType === 'arr' ? (
                              <motion.div
                                key="arr-input"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                              >
                                <div className="relative">
                                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                  <Input
                                    type="number"
                                    value={formData.arr}
                                    onChange={(e) => handleChange('arr', e.target.value)}
                                    placeholder="1,000,000"
                                    className="h-11 pl-9 text-base"
                                    data-testid="input-arr"
                                  />
                                </div>
                                <p className="text-xs text-slate-500 mt-1.5">
                                  {VALUATION_FIELDS.arr.helper}
                                </p>
                              </motion.div>
                            ) : (
                              <motion.div
                                key="mrr-input"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                              >
                                <div className="relative">
                                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                  <Input
                                    type="number"
                                    value={formData.mrr}
                                    onChange={(e) => handleChange('mrr', e.target.value)}
                                    placeholder="85,000"
                                    className="h-11 pl-9 text-base"
                                    data-testid="input-mrr"
                                  />
                                </div>
                                {formData.mrr ? (
                                  <div className="mt-2 p-2.5 bg-[#F0F7FF] rounded-lg border border-[#DCEAFF]">
                                    <p className="text-xs text-slate-600">
                                      Computed ARR: <span className="font-semibold text-[#0B4DBB]">${(parseFloat(formData.mrr) * 12).toLocaleString()}</span>
                                    </p>
                                  </div>
                                ) : (
                                  <p className="text-xs text-slate-500 mt-1.5">
                                    Monthly Recurring Revenue (will compute ARR = MRR × 12)
                                  </p>
                                )}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>

                        {/* Growth Rate */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          <div>
                            <label className="flex items-center text-sm font-medium text-slate-700 mb-2">
                              YoY Growth Rate
                              <span className="text-red-500 ml-0.5">*</span>
                              <EnhancedTooltip 
                                title="Year-over-Year Growth"
                                definition="(Current ARR - Prior Year ARR) / Prior Year ARR × 100"
                                example="Grew from $500K to $1M = 100% YoY"
                                range="Good: 50%+ | Great: 100%+ | Elite: 150%+"
                              />
                            </label>
                            <div className="relative">
                              <Input
                                type="number"
                                value={formData.growth_rate}
                                onChange={(e) => handleChange('growth_rate', e.target.value)}
                                placeholder="85"
                                className="h-11 pr-9"
                                data-testid="input-growth-rate"
                              />
                              <Percent className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            </div>
                          </div>

                          <div>
                            <label className="flex items-center text-sm font-medium text-slate-700 mb-2">
                              Gross Margin
                              <span className="text-red-500 ml-0.5">*</span>
                              <EnhancedTooltip 
                                title="Gross Margin"
                                definition="(Revenue - Cost of Goods Sold) / Revenue × 100"
                                example="$1M revenue, $250K COGS = 75% GM"
                                range="SaaS target: 70-85% | Below 60% is concerning"
                              />
                            </label>
                            <div className="relative">
                              <Input
                                type="number"
                                value={formData.gross_margin}
                                onChange={(e) => handleChange('gross_margin', e.target.value)}
                                placeholder="78"
                                className={`h-11 pr-9 ${getGrossMarginWarning() ? 'border-amber-300 focus:border-amber-400' : ''}`}
                                data-testid="input-gross-margin"
                              />
                              <Percent className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            </div>
                            {/* Gross Margin Warning */}
                            {getGrossMarginWarning() && (
                              <WarningBadge message={getGrossMarginWarning()} />
                            )}
                          </div>
                        </div>
                      </div>

                      {/* === SECTION: Retention === */}
                      <div className="pt-5 border-t border-slate-100 space-y-5">
                        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                          <PieChart className="w-3.5 h-3.5" />
                          Retention & Churn
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          {/* NRR */}
                          <div>
                            <label className="flex items-center text-sm font-medium text-slate-700 mb-2">
                              Net Revenue Retention (NRR)
                              <EnhancedTooltip 
                                title="Net Revenue Retention"
                                definition="(Starting MRR + Expansion - Contraction - Churn) / Starting MRR × 100"
                                example="Started $100K, ended $110K = 110% NRR"
                                range="Good: 100%+ | Great: 110%+ | Elite: 130%+"
                              />
                            </label>
                            <div className="relative">
                              <Input
                                type="number"
                                value={formData.nrr}
                                onChange={(e) => handleChange('nrr', e.target.value)}
                                placeholder="110"
                                className={`h-11 pr-9 ${getNRRWarning() ? 'border-amber-300 focus:border-amber-400' : ''}`}
                                data-testid="input-nrr"
                              />
                              <Percent className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            </div>
                            {getNRRWarning() && (
                              <WarningBadge message={getNRRWarning()} />
                            )}
                          </div>

                          {/* GRR */}
                          <div>
                            <label className="flex items-center text-sm font-medium text-slate-700 mb-2">
                              Gross Revenue Retention (GRR)
                              <EnhancedTooltip 
                                title="Gross Revenue Retention"
                                definition="(Starting MRR - Contraction - Churn) / Starting MRR × 100. Excludes expansion."
                                example="Started $100K, lost $8K = 92% GRR"
                                range="Good: 85%+ | Great: 90%+ | Elite: 95%+"
                              />
                            </label>
                            <div className="relative">
                              <Input
                                type="number"
                                value={formData.grr}
                                onChange={(e) => handleChange('grr', e.target.value)}
                                placeholder="92"
                                className={`h-11 pr-9 ${getGRRWarning() ? 'border-amber-300 focus:border-amber-400' : ''}`}
                                data-testid="input-grr"
                              />
                              <Percent className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            </div>
                            {getGRRWarning() && (
                              <WarningBadge message={getGRRWarning()} />
                            )}
                          </div>
                        </div>

                        {/* Logo Churn */}
                        <div>
                          <label className="flex items-center text-sm font-medium text-slate-700 mb-2">
                            Logo Churn Rate
                            <EnhancedTooltip 
                              title="Logo (Customer) Churn"
                              definition="Percentage of customers lost in a period. Different from revenue churn."
                              example={formData.churn_frequency === 'monthly' 
                                ? "Lost 5 of 200 customers/month = 2.5% monthly churn" 
                                : "Lost 24 of 200 customers/year = 12% annual churn"}
                              range={formData.churn_frequency === 'monthly'
                                ? "Good: <3% | Great: <2% | Elite: <1%"
                                : "Good: <20% | Great: <15% | Elite: <10%"}
                            />
                          </label>
                          <div className="flex gap-3">
                            {/* Frequency Toggle */}
                            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg h-11">
                              <button
                                type="button"
                                onClick={() => handleChange('churn_frequency', 'monthly')}
                                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                                  formData.churn_frequency === 'monthly'
                                    ? 'bg-white text-slate-900 shadow-sm'
                                    : 'text-slate-500'
                                }`}
                                data-testid="churn-monthly"
                              >
                                Monthly
                              </button>
                              <button
                                type="button"
                                onClick={() => handleChange('churn_frequency', 'annual')}
                                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                                  formData.churn_frequency === 'annual'
                                    ? 'bg-white text-slate-900 shadow-sm'
                                    : 'text-slate-500'
                                }`}
                                data-testid="churn-annual"
                              >
                                Annual
                              </button>
                            </div>
                            {/* Churn Input */}
                            <div className="relative flex-1">
                              <Input
                                type="number"
                                step="0.1"
                                value={formData.logo_churn}
                                onChange={(e) => handleChange('logo_churn', e.target.value)}
                                placeholder={formData.churn_frequency === 'monthly' ? "2.5" : "15"}
                                className="h-11 pr-9"
                                data-testid="input-logo-churn"
                              />
                              <Percent className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* === SECTION: Profitability === */}
                      <div className="pt-5 border-t border-slate-100 space-y-5">
                        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                          <BarChart3 className="w-3.5 h-3.5" />
                          Profitability
                        </h3>

                        <div>
                          <label className="flex items-center text-sm font-medium text-slate-700 mb-2">
                            Profitability Metric
                            <EnhancedTooltip 
                              title="EBITDA vs SDE"
                              definition="EBITDA: Earnings Before Interest, Taxes, Depreciation, Amortization. SDE: Seller's Discretionary Earnings (adds back owner salary)."
                              example="SDE is common for owner-operated businesses <$5M revenue. EBITDA for larger companies."
                              range="EBITDA margin: 10-30% | SDE margin: 20-40%"
                            />
                          </label>
                          
                          {/* EBITDA/SDE Toggle */}
                          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg w-fit mb-3">
                            <button
                              type="button"
                              onClick={() => handleChange('profitability_metric', 'ebitda')}
                              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                                formData.profitability_metric === 'ebitda'
                                  ? 'bg-white text-slate-900 shadow-sm'
                                  : 'text-slate-600'
                              }`}
                              data-testid="toggle-ebitda"
                            >
                              EBITDA
                            </button>
                            <button
                              type="button"
                              onClick={() => handleChange('profitability_metric', 'sde')}
                              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                                formData.profitability_metric === 'sde'
                                  ? 'bg-white text-slate-900 shadow-sm'
                                  : 'text-slate-600'
                              }`}
                              data-testid="toggle-sde"
                            >
                              SDE
                            </button>
                          </div>

                          <AnimatePresence mode="wait">
                            {formData.profitability_metric === 'ebitda' ? (
                              <motion.div
                                key="ebitda-input"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                              >
                                <div className="relative">
                                  <Input
                                    type="number"
                                    value={formData.ebitda_margin}
                                    onChange={(e) => handleChange('ebitda_margin', e.target.value)}
                                    placeholder="15"
                                    className="h-11 pr-9"
                                    data-testid="input-ebitda"
                                  />
                                  <Percent className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                </div>
                                <p className="text-xs text-slate-500 mt-1.5">
                                  EBITDA Margin — typical SaaS range: 10-30%
                                </p>
                              </motion.div>
                            ) : (
                              <motion.div
                                key="sde-input"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                              >
                                <div className="relative">
                                  <Input
                                    type="number"
                                    value={formData.sde_margin}
                                    onChange={(e) => handleChange('sde_margin', e.target.value)}
                                    placeholder="25"
                                    className="h-11 pr-9"
                                    data-testid="input-sde"
                                  />
                                  <Percent className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                </div>
                                <p className="text-xs text-slate-500 mt-1.5">
                                  SDE Margin — includes add-back of owner compensation
                                </p>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>

                      {/* === SECTION: Customer Base === */}
                      <div className="pt-5 border-t border-slate-100 space-y-5">
                        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                          <Users className="w-3.5 h-3.5" />
                          Customer Base
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          {/* Customer Count */}
                          <div>
                            <label className="flex items-center text-sm font-medium text-slate-700 mb-2">
                              # of Customers
                              <EnhancedTooltip 
                                title="Customer Count"
                                definition="Total active paying customers or accounts."
                                example="200 active subscriptions"
                                range="Varies by ACV. Higher count = more diversified."
                              />
                            </label>
                            <div className="relative">
                              <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                              <Input
                                type="number"
                                value={formData.customer_count}
                                onChange={(e) => handleChange('customer_count', e.target.value)}
                                placeholder="150"
                                className="h-11 pl-9"
                                data-testid="input-customer-count"
                              />
                            </div>
                          </div>

                          {/* Customer Concentration */}
                          <div>
                            <label className="flex items-center text-sm font-medium text-slate-700 mb-2">
                              Top Customer %
                              <EnhancedTooltip 
                                title="Customer Concentration"
                                definition="Revenue percentage from your largest single customer."
                                example="Largest customer is $50K of $500K ARR = 10%"
                                range="Green: <15% | Yellow: 15-30% | Red: >30%"
                              />
                            </label>
                            <div className="relative">
                              <Input
                                type="number"
                                value={formData.customer_concentration}
                                onChange={(e) => handleChange('customer_concentration', e.target.value)}
                                placeholder="12"
                                className={`h-11 pr-9 ${getConcentrationWarning() ? 'border-amber-300 focus:border-amber-400' : ''}`}
                                data-testid="input-concentration"
                              />
                              <Percent className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            </div>
                            {getConcentrationWarning() && (
                              <WarningBadge message={getConcentrationWarning()} />
                            )}
                          </div>
                        </div>

                        {/* Team Size */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          <div>
                            <label className="flex items-center text-sm font-medium text-slate-700 mb-2">
                              Team Size
                              <EnhancedTooltip 
                                title="Team Size"
                                definition="Full-time equivalent (FTE) employees including founders."
                                example="12 full-time + 4 contractors (0.5 FTE each) = 14 FTE"
                                range="Used to calculate revenue per employee efficiency."
                              />
                            </label>
                            <div className="relative">
                              <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                              <Input
                                type="number"
                                value={formData.team_size}
                                onChange={(e) => handleChange('team_size', e.target.value)}
                                placeholder="25"
                                className="h-11 pl-9"
                                data-testid="input-team-size"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* === SECTION: Revenue Mix === */}
                      <div className="pt-5 border-t border-slate-100 space-y-4">
                        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                          <PieChart className="w-3.5 h-3.5" />
                          Revenue Mix
                          <span className="text-slate-300 font-normal normal-case">(must total 100%)</span>
                        </h3>

                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <label className="flex items-center text-xs font-medium text-slate-600 mb-2">
                              Subscription
                              <EnhancedTooltip 
                                title="Subscription Revenue"
                                definition="Recurring revenue from fixed-price subscriptions."
                                example="Monthly/annual SaaS plans"
                                range="Higher = better multiple (target: 80%+)"
                              />
                            </label>
                            <div className="relative">
                              <Input
                                type="number"
                                value={formData.revenue_subscription}
                                onChange={(e) => handleRevenueMixChange('revenue_subscription', e.target.value)}
                                placeholder="80"
                                className="h-10 pr-8 text-sm"
                                data-testid="input-rev-subscription"
                              />
                              <Percent className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                            </div>
                          </div>
                          <div>
                            <label className="flex items-center text-xs font-medium text-slate-600 mb-2">
                              Usage-Based
                              <EnhancedTooltip 
                                title="Usage-Based Revenue"
                                definition="Revenue that scales with customer usage/consumption."
                                example="API calls, storage, transactions"
                                range="Growing trend, but less predictable"
                              />
                            </label>
                            <div className="relative">
                              <Input
                                type="number"
                                value={formData.revenue_usage}
                                onChange={(e) => handleRevenueMixChange('revenue_usage', e.target.value)}
                                placeholder="15"
                                className="h-10 pr-8 text-sm"
                                data-testid="input-rev-usage"
                              />
                              <Percent className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                            </div>
                          </div>
                          <div>
                            <label className="flex items-center text-xs font-medium text-slate-600 mb-2">
                              Services
                              <EnhancedTooltip 
                                title="Services Revenue"
                                definition="One-time or ongoing professional services, implementation, consulting."
                                example="Implementation fees, custom dev"
                                range="Lower multiple. Target: <20%"
                              />
                            </label>
                            <div className="relative">
                              <Input
                                type="number"
                                value={formData.revenue_services}
                                onChange={(e) => handleRevenueMixChange('revenue_services', e.target.value)}
                                placeholder="5"
                                className="h-10 pr-8 text-sm"
                                data-testid="input-rev-services"
                              />
                              <Percent className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                            </div>
                          </div>
                        </div>

                        {/* Revenue Mix Total Indicator */}
                        {getRevenueMixTotal() !== 100 && (formData.revenue_subscription || formData.revenue_usage || formData.revenue_services) && (
                          <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
                            getRevenueMixTotal() === 100 
                              ? 'bg-emerald-50 text-emerald-700' 
                              : 'bg-amber-50 text-amber-700'
                          }`}>
                            <AlertTriangle className="w-4 h-4" />
                            <span>Total: {getRevenueMixTotal()}% — must equal 100%</span>
                          </div>
                        )}
                      </div>

                      {/* === SECTION: Efficiency (Optional) === */}
                      <div className="pt-5 border-t border-slate-100 space-y-4">
                        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                          Efficiency Metrics <span className="text-slate-300 font-normal">(Optional)</span>
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          <div>
                            <label className="flex items-center text-sm font-medium text-slate-700 mb-2">
                              Burn Multiple
                              <EnhancedTooltip 
                                title="Burn Multiple"
                                definition="Net Burn / Net New ARR. Measures capital efficiency."
                                example="Burned $500K to add $400K ARR = 1.25x"
                                range="Efficient: <1x | Acceptable: 1-2x | Concerning: >2x"
                              />
                            </label>
                            <Input
                              type="number"
                              step="0.1"
                              value={formData.burn_multiple}
                              onChange={(e) => handleChange('burn_multiple', e.target.value)}
                              placeholder="1.2"
                              className="h-11"
                              data-testid="input-burn-multiple"
                            />
                          </div>

                          <div>
                            <label className="flex items-center text-sm font-medium text-slate-700 mb-2">
                              Runway (Months)
                              <EnhancedTooltip 
                                title="Cash Runway"
                                definition="Months of cash remaining at current burn rate."
                                example="$1M cash, $80K/mo burn = 12.5 months"
                                range="Safe: 18+ | Acceptable: 12-18 | Urgent: <12"
                              />
                            </label>
                            <Input
                              type="number"
                              value={formData.runway_months}
                              onChange={(e) => handleChange('runway_months', e.target.value)}
                              placeholder="18"
                              className="h-11"
                              data-testid="input-runway"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Step 3: Qualitative Assessment - M&A Enhanced */}
                {step === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="p-6 md:p-8"
                  >
                    {/* Header with Completion Counter */}
                    <div className="flex items-start justify-between mb-6">
                      <div>
                        <h2 className="text-xl font-semibold text-slate-900 mb-1">Qualitative Assessment</h2>
                        <p className="text-sm text-slate-500">These factors impact your valuation multiple</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <span className="text-2xl font-bold text-[#0B4DBB]">
                            {getQualitativeCompletion().completed}
                          </span>
                          <span className="text-lg text-slate-400">/{getQualitativeCompletion().total}</span>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-[#F0F7FF] flex items-center justify-center">
                          <svg className="w-6 h-6" viewBox="0 0 36 36">
                            <circle cx="18" cy="18" r="16" fill="none" stroke="#E5E7EB" strokeWidth="3" />
                            <circle 
                              cx="18" cy="18" r="16" fill="none" 
                              stroke="#0B4DBB" strokeWidth="3"
                              strokeDasharray={`${getQualitativeCompletion().percentage} 100`}
                              strokeLinecap="round"
                              transform="rotate(-90 18 18)"
                            />
                          </svg>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-8">
                      {/* 1. Product Maturity Slider */}
                      <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
                        <div className="flex items-center justify-between mb-4">
                          <label className="flex items-center text-sm font-semibold text-slate-800">
                            <span className="w-6 h-6 rounded-full bg-[#0B4DBB] text-white text-xs flex items-center justify-center mr-2">1</span>
                            Product Maturity
                            <EnhancedTooltip 
                              title="Product Maturity"
                              definition="Measures product-market fit strength and development stage."
                              example="1=MVP testing, 3=Clear PMF, 5=Market leader"
                              range="Higher maturity = +0.5x to +1.5x multiple premium"
                            />
                          </label>
                          <span className="text-sm font-bold text-[#0B4DBB] bg-white px-3 py-1.5 rounded-lg shadow-sm border border-slate-200">
                            {formData.product_maturity}/5
                          </span>
                        </div>
                        <Slider
                          value={[formData.product_maturity]}
                          onValueChange={([v]) => handleChange('product_maturity', v)}
                          min={1}
                          max={5}
                          step={1}
                          className="w-full"
                          data-testid="slider-product-maturity"
                        />
                        <div className="flex justify-between text-[11px] text-slate-500 mt-3 px-1">
                          <span className={formData.product_maturity === 1 ? 'text-[#0B4DBB] font-semibold' : ''}>MVP</span>
                          <span className={formData.product_maturity === 2 ? 'text-[#0B4DBB] font-semibold' : ''}>Traction</span>
                          <span className={formData.product_maturity === 3 ? 'text-[#0B4DBB] font-semibold' : ''}>PMF</span>
                          <span className={formData.product_maturity === 4 ? 'text-[#0B4DBB] font-semibold' : ''}>Scaling</span>
                          <span className={formData.product_maturity === 5 ? 'text-[#0B4DBB] font-semibold' : ''}>Leader</span>
                        </div>
                      </div>

                      {/* 2. Market Size */}
                      <div>
                        <label className="flex items-center text-sm font-semibold text-slate-800 mb-3">
                          <span className="w-6 h-6 rounded-full bg-[#0B4DBB] text-white text-xs flex items-center justify-center mr-2">2</span>
                          Target Market Size
                          <EnhancedTooltip 
                            title="Total Addressable Market (TAM)"
                            definition="The total revenue opportunity if you captured 100% market share."
                            example="CRM market = ~$100B (Large). Niche vertical = ~$500M (Small)"
                            range="Large TAM = +0.3x to +0.5x multiple | Small TAM = -0.2x to -0.3x"
                          />
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                          {[
                            { value: 'Small', label: 'Small', sub: '<$1B TAM', impact: '-0.3x multiple' },
                            { value: 'Medium', label: 'Medium', sub: '$1-10B TAM', impact: 'Baseline' },
                            { value: 'Large', label: 'Large', sub: '>$10B TAM', impact: '+0.5x multiple' }
                          ].map(opt => (
                            <motion.button
                              key={opt.value}
                              type="button"
                              onClick={() => handleChange('market_size', opt.value)}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              className={`p-4 rounded-xl border-2 transition-all text-left ${
                                formData.market_size === opt.value
                                  ? 'border-[#0B4DBB] bg-[#F0F7FF] shadow-sm'
                                  : 'border-slate-200 hover:border-slate-300 bg-white'
                              }`}
                              data-testid={`btn-market-${opt.value.toLowerCase()}`}
                            >
                              <div className={`text-base font-semibold ${
                                formData.market_size === opt.value ? 'text-[#0B4DBB]' : 'text-slate-700'
                              }`}>
                                {opt.label}
                              </div>
                              <div className="text-xs text-slate-500 mt-0.5">{opt.sub}</div>
                              <div className={`text-[10px] mt-1 font-medium ${
                                opt.value === 'Large' ? 'text-emerald-600' : 
                                opt.value === 'Small' ? 'text-amber-600' : 'text-slate-400'
                              }`}>
                                {opt.impact}
                              </div>
                            </motion.button>
                          ))}
                        </div>
                      </div>

                      {/* 3. Competitive Moat */}
                      <div>
                        <label className="flex items-center text-sm font-semibold text-slate-800 mb-3">
                          <span className="w-6 h-6 rounded-full bg-[#0B4DBB] text-white text-xs flex items-center justify-center mr-2">3</span>
                          Competitive Moat
                          <EnhancedTooltip 
                            title="Competitive Defensibility"
                            definition="How difficult is it for competitors to replicate your product/position?"
                            example="Network effects, proprietary data, patents, brand, switching costs"
                            range="Strong moat = +0.5x multiple | Weak moat = -0.3x discount"
                          />
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                          {[
                            { value: 'Low', label: 'Low', sub: 'Easy to replicate', impact: '-0.3x multiple' },
                            { value: 'Medium', label: 'Medium', sub: 'Some barriers', impact: 'Baseline' },
                            { value: 'Strong', label: 'Strong', sub: 'Hard to compete', impact: '+0.5x multiple' }
                          ].map(opt => (
                            <motion.button
                              key={opt.value}
                              type="button"
                              onClick={() => handleChange('competitive_moat', opt.value)}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              className={`p-4 rounded-xl border-2 transition-all text-left ${
                                formData.competitive_moat === opt.value
                                  ? 'border-[#0B4DBB] bg-[#F0F7FF] shadow-sm'
                                  : 'border-slate-200 hover:border-slate-300 bg-white'
                              }`}
                              data-testid={`btn-moat-${opt.value.toLowerCase()}`}
                            >
                              <div className={`text-base font-semibold ${
                                formData.competitive_moat === opt.value ? 'text-[#0B4DBB]' : 'text-slate-700'
                              }`}>
                                {opt.label}
                              </div>
                              <div className="text-xs text-slate-500 mt-0.5">{opt.sub}</div>
                              <div className={`text-[10px] mt-1 font-medium ${
                                opt.value === 'Strong' ? 'text-emerald-600' : 
                                opt.value === 'Low' ? 'text-amber-600' : 'text-slate-400'
                              }`}>
                                {opt.impact}
                              </div>
                            </motion.button>
                          ))}
                        </div>
                      </div>

                      {/* 4. Founder Dependency (NEW) */}
                      <div>
                        <label className="flex items-center text-sm font-semibold text-slate-800 mb-3">
                          <span className="w-6 h-6 rounded-full bg-[#0B4DBB] text-white text-xs flex items-center justify-center mr-2">4</span>
                          Founder Dependency
                          <EnhancedTooltip 
                            title="Founder/Key Person Risk"
                            definition="How dependent is the business on the founder's daily involvement?"
                            example="Low: Delegated ops, documented processes. High: Founder handles sales, product, customers."
                            range="Low dependency = +0.3x (transferable) | High = -0.5x (key-person risk)"
                          />
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                          {[
                            { value: 'Low', label: 'Low', sub: 'Delegated ops', impact: '+0.3x (transferable)' },
                            { value: 'Medium', label: 'Medium', sub: 'Some involvement', impact: 'Baseline' },
                            { value: 'High', label: 'High', sub: 'Founder-critical', impact: '-0.5x (key-person risk)' }
                          ].map(opt => (
                            <motion.button
                              key={opt.value}
                              type="button"
                              onClick={() => handleChange('founder_dependency', opt.value)}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              className={`p-4 rounded-xl border-2 transition-all text-left ${
                                formData.founder_dependency === opt.value
                                  ? 'border-[#0B4DBB] bg-[#F0F7FF] shadow-sm'
                                  : 'border-slate-200 hover:border-slate-300 bg-white'
                              }`}
                              data-testid={`btn-founder-${opt.value.toLowerCase()}`}
                            >
                              <div className={`text-base font-semibold ${
                                formData.founder_dependency === opt.value ? 'text-[#0B4DBB]' : 'text-slate-700'
                              }`}>
                                {opt.label}
                              </div>
                              <div className="text-xs text-slate-500 mt-0.5">{opt.sub}</div>
                              <div className={`text-[10px] mt-1 font-medium ${
                                opt.value === 'Low' ? 'text-emerald-600' : 
                                opt.value === 'High' ? 'text-amber-600' : 'text-slate-400'
                              }`}>
                                {opt.impact}
                              </div>
                            </motion.button>
                          ))}
                        </div>
                      </div>

                      {/* 5. Sales Predictability (NEW) */}
                      <div>
                        <label className="flex items-center text-sm font-semibold text-slate-800 mb-3">
                          <span className="w-6 h-6 rounded-full bg-[#0B4DBB] text-white text-xs flex items-center justify-center mr-2">5</span>
                          Sales Predictability
                          <EnhancedTooltip 
                            title="Revenue Acquisition Model"
                            definition="How predictable and scalable is your sales motion?"
                            example="Self-serve: PLG, credit card signups. Enterprise: 6+ month sales cycles, lumpy quarters."
                            range="Self-serve = +0.3x (scalable) | Enterprise-lumpy = -0.2x (unpredictable)"
                          />
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                          {[
                            { value: 'Self-serve', label: 'Self-Serve', sub: 'PLG, credit card', impact: '+0.3x (scalable)' },
                            { value: 'Mixed', label: 'Mixed', sub: 'PLG + sales', impact: 'Baseline' },
                            { value: 'Enterprise-lumpy', label: 'Enterprise', sub: 'Long cycles', impact: '-0.2x (unpredictable)' }
                          ].map(opt => (
                            <motion.button
                              key={opt.value}
                              type="button"
                              onClick={() => handleChange('sales_predictability', opt.value)}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              className={`p-4 rounded-xl border-2 transition-all text-left ${
                                formData.sales_predictability === opt.value
                                  ? 'border-[#0B4DBB] bg-[#F0F7FF] shadow-sm'
                                  : 'border-slate-200 hover:border-slate-300 bg-white'
                              }`}
                              data-testid={`btn-sales-${opt.value.toLowerCase().replace('-', '')}`}
                            >
                              <div className={`text-base font-semibold ${
                                formData.sales_predictability === opt.value ? 'text-[#0B4DBB]' : 'text-slate-700'
                              }`}>
                                {opt.label}
                              </div>
                              <div className="text-xs text-slate-500 mt-0.5">{opt.sub}</div>
                              <div className={`text-[10px] mt-1 font-medium ${
                                opt.value === 'Self-serve' ? 'text-emerald-600' : 
                                opt.value === 'Enterprise-lumpy' ? 'text-amber-600' : 'text-slate-400'
                              }`}>
                                {opt.impact}
                              </div>
                            </motion.button>
                          ))}
                        </div>
                      </div>

                      {/* Qualitative Score Summary */}
                      {getQualitativeCompletion().completed >= 3 && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-gradient-to-br from-[#F0F7FF] to-white rounded-xl p-5 border border-[#DCEAFF]"
                        >
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="text-sm font-semibold text-slate-800">Qualitative Score</h4>
                            <div className="flex items-center gap-2">
                              <span className="text-2xl font-bold text-[#0B4DBB]">
                                {calculateQualitativeScore().qualitativeScore}
                              </span>
                              <span className="text-sm text-slate-500">/100</span>
                            </div>
                          </div>
                          
                          {/* Score Bar */}
                          <div className="h-2 bg-slate-200 rounded-full overflow-hidden mb-4">
                            <motion.div 
                              className="h-full bg-gradient-to-r from-[#0B4DBB] to-[#1E6AE1] rounded-full"
                              initial={{ width: 0 }}
                              animate={{ width: `${calculateQualitativeScore().qualitativeScore}%` }}
                              transition={{ duration: 0.5, ease: 'easeOut' }}
                            />
                          </div>

                          {/* Strengths & Risks */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {calculateQualitativeScore().qualitativeNotes.strengths.length > 0 && (
                              <div>
                                <p className="text-xs font-semibold text-emerald-700 mb-2 flex items-center gap-1">
                                  <Check className="w-3.5 h-3.5" /> Strengths
                                </p>
                                <ul className="space-y-1">
                                  {calculateQualitativeScore().qualitativeNotes.strengths.map((s, i) => (
                                    <li key={i} className="text-xs text-emerald-600 flex items-start gap-1.5">
                                      <span className="w-1 h-1 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                                      {s}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {calculateQualitativeScore().qualitativeNotes.risks.length > 0 && (
                              <div>
                                <p className="text-xs font-semibold text-amber-700 mb-2 flex items-center gap-1">
                                  <AlertTriangle className="w-3.5 h-3.5" /> Risks to Address
                                </p>
                                <ul className="space-y-1">
                                  {calculateQualitativeScore().qualitativeNotes.risks.map((r, i) => (
                                    <li key={i} className="text-xs text-amber-600 flex items-start gap-1.5">
                                      <span className="w-1 h-1 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                                      {r}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}

                      {/* Deal Readiness (Optional) */}
                      <div className="pt-6 border-t border-slate-100">
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
                          Deal Readiness <span className="text-slate-300 font-normal">(Optional)</span>
                        </p>
                        
                        {/* Toggle Options */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <button
                            type="button"
                            onClick={() => handleChange('has_audited_financials', !formData.has_audited_financials)}
                            className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left ${
                              formData.has_audited_financials
                                ? 'border-emerald-500 bg-emerald-50'
                                : 'border-slate-200 hover:border-slate-300 bg-white'
                            }`}
                            data-testid="toggle-audited-financials"
                          >
                            <div className={`w-6 h-6 rounded-md flex items-center justify-center ${
                              formData.has_audited_financials ? 'bg-emerald-500' : 'bg-slate-200'
                            }`}>
                              {formData.has_audited_financials && <Check className="w-4 h-4 text-white" />}
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-slate-700">Audited Financials</p>
                              <p className="text-xs text-slate-500">CPA-reviewed or audited statements</p>
                            </div>
                            <span className="text-[10px] font-medium text-emerald-600">+0.2x</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleChange('stripe_connected', !formData.stripe_connected)}
                            className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left ${
                              formData.stripe_connected
                                ? 'border-emerald-500 bg-emerald-50'
                                : 'border-slate-200 hover:border-slate-300 bg-white'
                            }`}
                            data-testid="toggle-stripe-connected"
                          >
                            <div className={`w-6 h-6 rounded-md flex items-center justify-center ${
                              formData.stripe_connected ? 'bg-emerald-500' : 'bg-slate-200'
                            }`}>
                              {formData.stripe_connected && <Check className="w-4 h-4 text-white" />}
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-slate-700">Revenue Verified</p>
                              <p className="text-xs text-slate-500">Stripe or payment processor linked</p>
                            </div>
                            <span className="text-[10px] font-medium text-emerald-600">+0.1x</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Step 4: Analysis Results */}
                {step === 4 && (
                  <motion.div
                    key="step4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4 }}
                    className="p-6 md:p-8"
                  >
                    {/* Loading State */}
                    {analyzing && !analysisComplete && (
                      <div className="py-12 text-center">
                        <motion.div 
                          className="mb-8"
                          animate={{ 
                            scale: [1, 1.05, 1],
                            opacity: [0.8, 1, 0.8]
                          }}
                          transition={{ 
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                        >
                          <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-[#0B4DBB] to-[#1E6AE1] flex items-center justify-center shadow-xl shadow-blue-900/20">
                            <Sparkles className="w-10 h-10 text-white" />
                          </div>
                        </motion.div>
                        <h2 className="text-2xl font-semibold text-slate-900 mb-3">
                          Analyzing Your Company
                        </h2>
                        <p className="text-slate-600 mb-8 max-w-md mx-auto">
                          Processing financials, market data, and comparable transactions...
                        </p>
                        <div className="max-w-xs mx-auto">
                          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                            <motion.div 
                              className="h-full bg-gradient-to-r from-[#0B4DBB] to-[#1E6AE1] rounded-full"
                              initial={{ width: '0%' }}
                              animate={{ width: '90%' }}
                              transition={{ duration: 2.5, ease: 'easeInOut' }}
                            />
                          </div>
                          <p className="text-xs text-slate-400 mt-3">This usually takes 5-10 seconds</p>
                        </div>
                      </div>
                    )}

                    {/* Analysis Results */}
                    {analysisComplete && (() => {
                      const results = computeValuation();
                      const formatCurrency = (val) => {
                        if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
                        if (val >= 1000) return `$${(val / 1000).toFixed(0)}K`;
                        return `$${Math.round(val)}`;
                      };

                      return (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5 }}
                          className="space-y-6"
                        >
                          {/* Header */}
                          <div className="text-center mb-8">
                            <h2 className="text-2xl font-bold text-slate-900 mb-2">Valuation Analysis</h2>
                            <p className="text-slate-600">{formData.company_name}</p>
                          </div>

                          {/* Valuation Range Card */}
                          <div className="bg-gradient-to-br from-[#0B4DBB] via-[#1456c7] to-[#1E6AE1] rounded-2xl p-6 md:p-8 text-white relative overflow-hidden">
                            {/* Pattern overlay */}
                            <div className="absolute inset-0 opacity-10" style={{
                              backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.4' fill-rule='evenodd'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/svg%3E")`
                            }} />
                            
                            <div className="relative">
                              <div className="flex items-center justify-between mb-6">
                                <div>
                                  <p className="text-white/70 text-sm mb-1">Estimated Enterprise Value</p>
                                  <div className="flex items-baseline gap-3">
                                    <span className="text-4xl md:text-5xl font-bold">{formatCurrency(results.baseValuation)}</span>
                                    <span className="text-white/60 text-sm">Base case</span>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="text-white/70 text-sm mb-1">Multiple Used</p>
                                  <p className="text-2xl font-bold">{results.lowMultiple.toFixed(1)}x – {results.highMultiple.toFixed(1)}x</p>
                                  <p className="text-white/60 text-xs">Base: {results.baseMultiple.toFixed(1)}x ARR</p>
                                </div>
                              </div>

                              {/* Low/Base/High Range */}
                              <div className="grid grid-cols-3 gap-4 mb-6">
                                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                                  <p className="text-xs text-white/60 uppercase tracking-wider mb-1">Low</p>
                                  <p className="text-xl font-bold">{formatCurrency(results.lowValuation)}</p>
                                  <p className="text-xs text-white/50">{results.lowMultiple.toFixed(1)}x ARR</p>
                                </div>
                                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 border border-white/30 ring-2 ring-white/30">
                                  <p className="text-xs text-white/80 uppercase tracking-wider mb-1">Base</p>
                                  <p className="text-xl font-bold">{formatCurrency(results.baseValuation)}</p>
                                  <p className="text-xs text-white/60">{results.baseMultiple.toFixed(1)}x ARR</p>
                                </div>
                                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                                  <p className="text-xs text-white/60 uppercase tracking-wider mb-1">High</p>
                                  <p className="text-xl font-bold">{formatCurrency(results.highValuation)}</p>
                                  <p className="text-xs text-white/50">{results.highMultiple.toFixed(1)}x ARR</p>
                                </div>
                              </div>

                              {/* ARR Used */}
                              <div className="flex items-center gap-2 text-sm text-white/70">
                                <DollarSign className="w-4 h-4" />
                                <span>ARR used: {formatCurrency(results.arr)}</span>
                                {results.isFromMRR && (
                                  <span className="px-2 py-0.5 bg-white/20 rounded text-xs">Derived from MRR</span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Two Column Grid: Confidence + Drivers/Risks */}
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Confidence Card */}
                            <div className="bg-white rounded-xl border border-slate-200 p-6">
                              <div className="flex items-center justify-between mb-4">
                                <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                                  <Target className="w-5 h-5 text-slate-400" />
                                  Confidence Level
                                </h3>
                                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                  results.confidence === 'High' 
                                    ? 'bg-emerald-100 text-emerald-700' 
                                    : results.confidence === 'Medium'
                                      ? 'bg-blue-100 text-blue-700'
                                      : 'bg-amber-100 text-amber-700'
                                }`}>
                                  {results.confidence}
                                </span>
                              </div>
                              
                              {/* Confidence Bar */}
                              <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-3">
                                <motion.div 
                                  className={`h-full rounded-full ${
                                    results.confidence === 'High'
                                      ? 'bg-emerald-500'
                                      : results.confidence === 'Medium'
                                        ? 'bg-blue-500'
                                        : 'bg-amber-500'
                                  }`}
                                  initial={{ width: 0 }}
                                  animate={{ width: `${Math.min(100, results.confidenceScore * 10)}%` }}
                                  transition={{ duration: 0.5, delay: 0.2 }}
                                />
                              </div>
                              
                              <p className="text-sm text-slate-600 mb-4">{results.confidenceExplanation}</p>
                              
                              {/* Missing Inputs */}
                              {results.missingInputs.length > 0 && results.confidence !== 'High' && (
                                <div className="bg-amber-50 border border-amber-100 rounded-lg p-3">
                                  <p className="text-xs font-medium text-amber-800 mb-2">Missing inputs:</p>
                                  <div className="flex flex-wrap gap-1.5">
                                    {results.missingInputs.map((input, i) => (
                                      <span key={i} className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded text-xs">
                                        {input}
                                      </span>
                                    ))}
                                  </div>
                                  <p className="text-[11px] text-amber-600 mt-2">
                                    Add these for a more accurate valuation.
                                  </p>
                                </div>
                              )}
                            </div>

                            {/* Drivers & Risks */}
                            <div className="bg-white rounded-xl border border-slate-200 p-6">
                              <div className="grid grid-cols-1 gap-6">
                                {/* Key Drivers */}
                                <div>
                                  <h4 className="font-semibold text-slate-900 flex items-center gap-2 mb-3">
                                    <TrendingUp className="w-4 h-4 text-emerald-500" />
                                    Key Drivers
                                  </h4>
                                  {results.drivers.length > 0 ? (
                                    <ul className="space-y-2">
                                      {results.drivers.map((driver, i) => (
                                        <li key={i} className="flex items-center justify-between text-sm">
                                          <span className="text-slate-700">{driver.text}</span>
                                          <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded text-xs font-medium">
                                            {driver.impact}
                                          </span>
                                        </li>
                                      ))}
                                    </ul>
                                  ) : (
                                    <p className="text-sm text-slate-500">No significant drivers identified.</p>
                                  )}
                                </div>

                                {/* Red Flags */}
                                {results.risks.length > 0 && (
                                  <div>
                                    <h4 className="font-semibold text-slate-900 flex items-center gap-2 mb-3">
                                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                                      Red Flags
                                    </h4>
                                    <ul className="space-y-2">
                                      {results.risks.map((risk, i) => (
                                        <li key={i} className="flex items-center justify-between text-sm">
                                          <span className="text-slate-700">{risk.text}</span>
                                          <span className="px-2 py-0.5 bg-amber-50 text-amber-700 rounded text-xs font-medium">
                                            {risk.impact}
                                          </span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Improvements Card */}
                          {results.improvements.length > 0 && (
                            <div className="bg-gradient-to-br from-[#F0F7FF] to-white rounded-xl border border-[#DCEAFF] p-6">
                              <h3 className="font-semibold text-slate-900 flex items-center gap-2 mb-4">
                                <Zap className="w-5 h-5 text-[#0B4DBB]" />
                                What to Improve to Increase Valuation
                              </h3>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {results.improvements.map((item, i) => (
                                  <div key={i} className="flex items-start gap-3 bg-white rounded-lg p-3 border border-slate-100">
                                    <div className="w-6 h-6 rounded-full bg-[#0B4DBB]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                      <ChevronRight className="w-4 h-4 text-[#0B4DBB]" />
                                    </div>
                                    <div>
                                      <p className="text-sm text-slate-700">{item.text}</p>
                                      <p className="text-xs text-emerald-600 font-medium mt-0.5">
                                        Potential: {item.potential}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* CTAs */}
                          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100">
                            <Button
                              variant="outline"
                              onClick={() => {
                                setStep(2);
                                setAnalysisComplete(false);
                              }}
                              className="w-full sm:w-auto order-2 sm:order-1"
                              data-testid="btn-edit-inputs"
                            >
                              <Edit3 className="w-4 h-4 mr-2" />
                              Edit Inputs
                            </Button>
                            
                            <Button
                              onClick={submitValuation}
                              className="w-full sm:w-auto bg-[#0B4DBB] hover:bg-[#093c96] text-white shadow-lg shadow-blue-900/20 px-8 order-1 sm:order-2"
                              data-testid="btn-generate-report"
                            >
                              <FileText className="w-4 h-4 mr-2" />
                              Generate Report
                            </Button>
                          </div>
                        </motion.div>
                      );
                    })()}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Navigation Buttons */}
              {step < 4 && (
                <div className="px-6 md:px-8 py-5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                  <Button
                    variant="ghost"
                    onClick={step === 1 ? () => navigate(-1) : handleBack}
                    className="text-slate-600 hover:text-slate-900"
                    data-testid="btn-back"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>

                  <Button
                    onClick={handleNext}
                    disabled={(step === 1 && !isStep1Valid()) || (step === 2 && !isStep2Valid())}
                    className="bg-[#0B4DBB] hover:bg-[#093c96] text-white shadow-lg shadow-blue-900/20 px-6"
                    data-testid="btn-next"
                  >
                    {step === 3 ? 'Generate Valuation' : 'Continue'}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              )}
            </div>

            {/* Preview Panel - Desktop (right sidebar) */}
            {showPreview && (
              <div className="hidden lg:block">
                <ValuationPreviewPanel 
                  formData={{
                    ...formData,
                    arr: revenueType === 'mrr' ? String((parseFloat(formData.mrr) || 0) * 12) : formData.arr
                  }}
                  isMobile={false}
                />
              </div>
            )}
          </div>

          {/* Preview Panel - Mobile (collapsible accordion) */}
          {showPreview && (
            <div className="lg:hidden max-w-2xl mx-auto">
              <AnimatePresence>
                {previewExpanded ? (
                  <ValuationPreviewPanel 
                    formData={{
                      ...formData,
                      arr: revenueType === 'mrr' ? String((parseFloat(formData.mrr) || 0) * 12) : formData.arr
                    }}
                    isExpanded={previewExpanded}
                    onToggle={() => setPreviewExpanded(!previewExpanded)}
                    isMobile={true}
                  />
                ) : (
                  <ValuationPreviewPanel 
                    formData={{
                      ...formData,
                      arr: revenueType === 'mrr' ? String((parseFloat(formData.mrr) || 0) * 12) : formData.arr
                    }}
                    isExpanded={previewExpanded}
                    onToggle={() => setPreviewExpanded(!previewExpanded)}
                    isMobile={true}
                  />
                )}
              </AnimatePresence>
            </div>
          )}
        </main>
      </div>
    </TooltipProvider>
  );
};

export default CreateValuation;
