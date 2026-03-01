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
  HelpCircle, DollarSign, Percent, Users, AlertTriangle, Hash, PieChart
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API = process.env.REACT_APP_BACKEND_URL + "/api";

const CreateValuation = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [analyzing, setAnalyzing] = useState(false);
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
    market_size: 'Medium',
    competitive_moat: 'Medium',
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
      submitValuation();
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
            nrr: parseFloat(formData.nrr) || 100,
            burn_multiple: parseFloat(formData.burn_multiple) || null,
            runway_months: parseInt(formData.runway_months) || null,
            team_size: parseInt(formData.team_size) || 1,
            customer_concentration: parseFloat(formData.customer_concentration) || null,
            founder_hours_per_week: parseInt(formData.founder_hours) || null,
            churn_rate: parseFloat(formData.churn_rate) || null,
            has_audited_financials: formData.has_audited_financials,
            stripe_verified: formData.stripe_connected
          },
          qualitative: {
            product_maturity: formData.product_maturity,
            market_size: formData.market_size,
            competitive_moat: formData.competitive_moat
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
  const EnhancedTooltip = ({ title, definition, example, range }) => (
    <Tooltip>
      <TooltipTrigger asChild>
        <button type="button" className="text-slate-400 hover:text-slate-600 transition-colors ml-1">
          <HelpCircle className="w-3.5 h-3.5" />
        </button>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-sm p-0 overflow-hidden">
        <div className="bg-slate-900 text-white">
          <div className="px-3 py-2 border-b border-slate-700">
            <p className="font-semibold text-sm">{title}</p>
          </div>
          <div className="px-3 py-2 space-y-2 text-xs">
            <p className="text-slate-300">{definition}</p>
            {example && (
              <p className="text-slate-400">
                <span className="text-slate-500">Example:</span> {example}
              </p>
            )}
            {range && (
              <p className="text-emerald-400 font-medium">
                {range}
              </p>
            )}
          </div>
        </div>
      </TooltipContent>
    </Tooltip>
  );

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
                            Revenue Input
                            <span className="text-red-500 ml-0.5">*</span>
                            <EnhancedTooltip 
                              title="Annual/Monthly Recurring Revenue"
                              definition="Predictable revenue from subscriptions. ARR = MRR × 12."
                              example="$1M ARR = ~$83K MRR"
                              range="Typical: $100K - $50M ARR"
                            />
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
                                  Annual Recurring Revenue (annualized contracts)
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

                {/* Step 3: Qualitative Assessment */}
                {step === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="p-6 md:p-8"
                  >
                    <h2 className="text-xl font-semibold text-slate-900 mb-6">Qualitative Assessment</h2>
                    
                    <div className="space-y-6">
                      {/* Product Maturity Slider */}
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <label className="flex items-center text-sm font-medium text-slate-700">
                            Product Maturity
                            <FieldTooltip content="Product-market fit strength. 1=MVP, 5=Market leader." />
                          </label>
                          <span className="text-sm font-semibold text-[#0B4DBB] bg-[#F0F7FF] px-2.5 py-1 rounded-lg">
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
                        <div className="flex justify-between text-[11px] text-slate-500 mt-2 px-1">
                          <span>MVP</span>
                          <span>Traction</span>
                          <span>PMF</span>
                          <span>Scaling</span>
                          <span>Leader</span>
                        </div>
                      </div>

                      {/* Market Size */}
                      <div>
                        <label className="flex items-center text-sm font-medium text-slate-700 mb-3">
                          Target Market Size
                          <FieldTooltip content="Total Addressable Market (TAM) estimate." />
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                          {[
                            { value: 'Small', label: 'Small', sub: '<$1B TAM' },
                            { value: 'Medium', label: 'Medium', sub: '$1-10B TAM' },
                            { value: 'Large', label: 'Large', sub: '>$10B TAM' }
                          ].map(opt => (
                            <motion.button
                              key={opt.value}
                              type="button"
                              onClick={() => handleChange('market_size', opt.value)}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              className={`p-4 rounded-xl border-2 transition-all ${
                                formData.market_size === opt.value
                                  ? 'border-[#0B4DBB] bg-[#F0F7FF] shadow-sm'
                                  : 'border-slate-200 hover:border-slate-300'
                              }`}
                              data-testid={`btn-market-${opt.value.toLowerCase()}`}
                            >
                              <div className={`text-base font-semibold ${
                                formData.market_size === opt.value ? 'text-[#0B4DBB]' : 'text-slate-700'
                              }`}>
                                {opt.label}
                              </div>
                              <div className="text-xs text-slate-500 mt-0.5">{opt.sub}</div>
                            </motion.button>
                          ))}
                        </div>
                      </div>

                      {/* Competitive Moat */}
                      <div>
                        <label className="flex items-center text-sm font-medium text-slate-700 mb-3">
                          Competitive Moat
                          <FieldTooltip content="Defensibility: IP, network effects, switching costs, brand." />
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                          {[
                            { value: 'Low', label: 'Low', sub: 'Easy to replicate' },
                            { value: 'Medium', label: 'Medium', sub: 'Some barriers' },
                            { value: 'Strong', label: 'Strong', sub: 'Hard to compete' }
                          ].map(opt => (
                            <motion.button
                              key={opt.value}
                              type="button"
                              onClick={() => handleChange('competitive_moat', opt.value)}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              className={`p-4 rounded-xl border-2 transition-all ${
                                formData.competitive_moat === opt.value
                                  ? 'border-[#0B4DBB] bg-[#F0F7FF] shadow-sm'
                                  : 'border-slate-200 hover:border-slate-300'
                              }`}
                              data-testid={`btn-moat-${opt.value.toLowerCase()}`}
                            >
                              <div className={`text-base font-semibold ${
                                formData.competitive_moat === opt.value ? 'text-[#0B4DBB]' : 'text-slate-700'
                              }`}>
                                {opt.label}
                              </div>
                              <div className="text-xs text-slate-500 mt-0.5">{opt.sub}</div>
                            </motion.button>
                          ))}
                        </div>
                      </div>

                      {/* Deal Readiness - Advanced */}
                      <div className="pt-4 border-t border-slate-100">
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-4">
                          Deal Readiness (Optional)
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          <div>
                            <label className="flex items-center text-sm font-medium text-slate-700 mb-2">
                              Top Customer %
                              <FieldTooltip content="Revenue from largest customer. >30% is a red flag for buyers." />
                            </label>
                            <div className="relative">
                              <Input
                                type="number"
                                value={formData.customer_concentration}
                                onChange={(e) => handleChange('customer_concentration', e.target.value)}
                                placeholder="15"
                                className="h-11 pr-9"
                                data-testid="input-customer-concentration"
                              />
                              <Percent className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            </div>
                          </div>

                          <div>
                            <label className="flex items-center text-sm font-medium text-slate-700 mb-2">
                              Monthly Churn Rate
                              <FieldTooltip content="Logo churn (customers lost / total). <2% is healthy." />
                            </label>
                            <div className="relative">
                              <Input
                                type="number"
                                step="0.1"
                                value={formData.churn_rate}
                                onChange={(e) => handleChange('churn_rate', e.target.value)}
                                placeholder="1.5"
                                className="h-11 pr-9"
                                data-testid="input-churn-rate"
                              />
                              <Percent className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            </div>
                          </div>

                          <div>
                            <label className="flex items-center text-sm font-medium text-slate-700 mb-2">
                              Founder Hours/Week
                              <FieldTooltip content="Founder involvement in daily ops. <10h = highly transferable." />
                            </label>
                            <Input
                              type="number"
                              value={formData.founder_hours}
                              onChange={(e) => handleChange('founder_hours', e.target.value)}
                              placeholder="40"
                              className="h-11"
                              data-testid="input-founder-hours"
                            />
                          </div>
                        </div>

                        {/* Toggle Options */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
                          <button
                            type="button"
                            onClick={() => handleChange('has_audited_financials', !formData.has_audited_financials)}
                            className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left ${
                              formData.has_audited_financials
                                ? 'border-emerald-500 bg-emerald-50'
                                : 'border-slate-200 hover:border-slate-300'
                            }`}
                            data-testid="toggle-audited-financials"
                          >
                            <div className={`w-5 h-5 rounded-md flex items-center justify-center ${
                              formData.has_audited_financials ? 'bg-emerald-500' : 'bg-slate-200'
                            }`}>
                              {formData.has_audited_financials && <Check className="w-3.5 h-3.5 text-white" />}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-slate-700">Audited Financials</p>
                              <p className="text-xs text-slate-500">CPA-reviewed statements</p>
                            </div>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleChange('stripe_connected', !formData.stripe_connected)}
                            className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left ${
                              formData.stripe_connected
                                ? 'border-emerald-500 bg-emerald-50'
                                : 'border-slate-200 hover:border-slate-300'
                            }`}
                            data-testid="toggle-stripe-connected"
                          >
                            <div className={`w-5 h-5 rounded-md flex items-center justify-center ${
                              formData.stripe_connected ? 'bg-emerald-500' : 'bg-slate-200'
                            }`}>
                              {formData.stripe_connected && <Check className="w-3.5 h-3.5 text-white" />}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-slate-700">Revenue Verified</p>
                              <p className="text-xs text-slate-500">Stripe/processor linked</p>
                            </div>
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Step 4: Analysis */}
                {step === 4 && (
                  <motion.div
                    key="step4"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4 }}
                    className="p-12 text-center"
                  >
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
