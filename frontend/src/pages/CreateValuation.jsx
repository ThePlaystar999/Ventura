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
  HelpCircle, DollarSign, Percent, Users 
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

                {/* Step 2: Financial Metrics */}
                {step === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="p-6 md:p-8"
                  >
                    <h2 className="text-xl font-semibold text-slate-900 mb-6">Financial Metrics</h2>
                    
                    <div className="space-y-5">
                      {/* ARR/MRR Toggle */}
                      <div>
                        <label className="flex items-center text-sm font-medium text-slate-700 mb-3">
                          Revenue Input
                          <span className="text-red-500 ml-0.5">*</span>
                          <FieldTooltip content="Choose ARR (Annual) or MRR (Monthly). MRR will be multiplied by 12." />
                        </label>
                        
                        {/* Toggle Button */}
                        <div className="flex items-center gap-2 mb-3">
                          <button
                            type="button"
                            onClick={() => setRevenueType('arr')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                              revenueType === 'arr'
                                ? 'bg-[#0B4DBB] text-white shadow-md'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                            data-testid="toggle-arr"
                          >
                            ARR
                          </button>
                          <button
                            type="button"
                            onClick={() => setRevenueType('mrr')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                              revenueType === 'mrr'
                                ? 'bg-[#0B4DBB] text-white shadow-md'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                            data-testid="toggle-mrr"
                          >
                            MRR
                          </button>
                        </div>

                        {/* Revenue Input - Conditional based on toggle */}
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
                                  className="h-11 pl-9"
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
                                  className="h-11 pl-9"
                                  data-testid="input-mrr"
                                />
                              </div>
                              <p className="text-xs text-slate-500 mt-1.5">
                                Monthly Recurring Revenue
                                {formData.mrr && (
                                  <span className="text-[#0B4DBB] font-medium ml-1">
                                    (= ${(parseFloat(formData.mrr) * 12).toLocaleString()} ARR)
                                  </span>
                                )}
                              </p>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                          <label className="flex items-center text-sm font-medium text-slate-700 mb-2">
                            YoY Growth Rate
                            <span className="text-red-500 ml-0.5">*</span>
                            <FieldTooltip content="Year-over-year ARR growth. Major driver of valuation multiple." />
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
                          <p className="text-xs text-slate-500 mt-1">Typical SaaS: 50-100%+</p>
                        </div>

                        <div>
                          <label className="flex items-center text-sm font-medium text-slate-700 mb-2">
                            Gross Margin
                            <span className="text-red-500 ml-0.5">*</span>
                            <FieldTooltip content="(Revenue - COGS) / Revenue. SaaS benchmark: 70-85%." />
                          </label>
                          <div className="relative">
                            <Input
                              type="number"
                              value={formData.gross_margin}
                              onChange={(e) => handleChange('gross_margin', e.target.value)}
                              placeholder="78"
                              className="h-11 pr-9"
                              data-testid="input-gross-margin"
                            />
                            <Percent className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          </div>
                          <p className="text-xs text-slate-500 mt-1">Target: 70%+</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                          <label className="flex items-center text-sm font-medium text-slate-700 mb-2">
                            Net Revenue Retention
                            <FieldTooltip content="(Start MRR + Expansion - Churn) / Start MRR. >100% = net expansion." />
                          </label>
                          <div className="relative">
                            <Input
                              type="number"
                              value={formData.nrr}
                              onChange={(e) => handleChange('nrr', e.target.value)}
                              placeholder="110"
                              className="h-11 pr-9"
                              data-testid="input-nrr"
                            />
                            <Percent className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          </div>
                          <p className="text-xs text-slate-500 mt-1">Best-in-class: 120%+</p>
                        </div>

                        <div>
                          <label className="flex items-center text-sm font-medium text-slate-700 mb-2">
                            Team Size
                            <FieldTooltip content="Full-time equivalent employees." />
                          </label>
                          <div className="relative">
                            <Input
                              type="number"
                              value={formData.team_size}
                              onChange={(e) => handleChange('team_size', e.target.value)}
                              placeholder="25"
                              className="h-11 pl-9"
                              data-testid="input-team-size"
                            />
                            <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          </div>
                        </div>
                      </div>

                      {/* Advanced Metrics - Collapsible */}
                      <div className="pt-4 border-t border-slate-100">
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-4">
                          Advanced Metrics (Optional)
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          <div>
                            <label className="flex items-center text-sm font-medium text-slate-700 mb-2">
                              Burn Multiple
                              <FieldTooltip content="Net Burn / Net New ARR. <1x = efficient, >2x = concerning." />
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
                              <FieldTooltip content="Months of cash remaining at current burn rate." />
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
