import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import VLogo from '../components/VLogo';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Slider } from '../components/ui/slider';
import { toast } from 'sonner';
import { ArrowLeft, ArrowRight, Building2, BarChart3, Sparkles, Star, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API = process.env.REACT_APP_BACKEND_URL + "/api";

const CreateValuation = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [analyzing, setAnalyzing] = useState(false);

  const [formData, setFormData] = useState({
    // Company Info
    company_name: '',
    industry: '',
    country: 'United States',
    stage: '',
    business_model: 'SaaS',
    // Metrics
    arr: '',
    mrr: '',
    growth_rate: '',
    gross_margin: '',
    nrr: '100',
    team_size: '',
    // Qualitative
    product_maturity: 3,
    market_size: 'Medium',
    competitive_moat: 'Medium'
  });

  // Industry = Sector/Vertical the company operates in
  const industries = [
    'SaaS',
    'AI/ML',
    'FinTech',
    'HealthTech',
    'EdTech',
    'CleanTech',
    'Cybersecurity',
    'MarTech',
    'E-Commerce',
    'Other'
  ];

  // Business Model = How the company generates revenue
  const businessModels = [
    'Subscription (SaaS)',
    'Marketplace',
    'Transactional',
    'E-Commerce',
    'Usage-Based',
    'Freemium',
    'Enterprise',
    'Advertising',
    'Other'
  ];

  const stages = [
    'Bootstrapped',
    'Pre-seed',
    'Seed',
    'Series A',
    'Series B',
    'Series C+'
  ];

  const countries = [
    'United States',
    'United Kingdom',
    'Germany',
    'France',
    'Canada',
    'Australia',
    'Other'
  ];

  const marketSizes = ['Small', 'Medium', 'Large'];
  const moatLevels = ['Low', 'Medium', 'Strong'];

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const isStep1Valid = () => {
    return formData.company_name && formData.industry && formData.stage && formData.business_model;
  };

  const isStep2Valid = () => {
    return (formData.arr || formData.mrr) && formData.growth_rate && formData.gross_margin;
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

    // Simulate analysis time
    await new Promise(resolve => setTimeout(resolve, 2500));

    try {
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
            business_model: formData.business_model
          },
          metrics: {
            arr: parseFloat(formData.arr) || 0,
            mrr: parseFloat(formData.mrr) || 0,
            growth_rate: parseFloat(formData.growth_rate) || 0,
            gross_margin: parseFloat(formData.gross_margin) || 0,
            nrr: parseFloat(formData.nrr) || 100,
            team_size: parseInt(formData.team_size) || 1
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[#F8FAFC]" data-testid="create-valuation">

      <main className="py-8 px-6 md:px-8 lg:px-12 max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 mb-2">
            Create Valuation
          </h1>
          <p className="text-slate-600">Complete each step for a comprehensive analysis</p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center mb-12">
          {steps.map((s, index) => (
            <React.Fragment key={s.number}>
              <div className="flex items-center">
                <div 
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                    step > s.number 
                      ? 'bg-[#0B4DBB] text-white' 
                      : step === s.number 
                        ? 'bg-[#0B4DBB] text-white ring-4 ring-[#DCEAFF]' 
                        : 'bg-[#EEF2F7] text-slate-400'
                  }`}
                  data-testid={`step-indicator-${s.number}`}
                >
                  {step > s.number ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <s.icon className="w-5 h-5" strokeWidth={1.5} />
                  )}
                </div>
                <span className={`ml-2 text-sm font-medium hidden sm:block ${
                  step >= s.number ? 'text-slate-900' : 'text-slate-400'
                }`}>
                  {s.title}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className={`w-8 md:w-16 h-1 mx-2 rounded transition-colors duration-300 ${
                  step > s.number ? 'bg-[#0B4DBB]' : 'bg-[#EEF2F7]'
                }`}></div>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-2xl border border-[#EEF2F7] shadow-sm overflow-hidden">
          <AnimatePresence mode="wait">
            {/* Step 1: Company Info */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="p-8"
              >
                <h2 className="text-xl font-semibold text-slate-900 mb-6">Company Information</h2>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Company Name *
                    </label>
                    <Input
                      value={formData.company_name}
                      onChange={(e) => handleChange('company_name', e.target.value)}
                      placeholder="e.g., TechStartup Inc"
                      className="input-premium"
                      data-testid="input-company-name"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Industry *
                      </label>
                      <Select value={formData.industry} onValueChange={(v) => handleChange('industry', v)}>
                        <SelectTrigger className="input-premium" data-testid="select-industry">
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
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Business Model *
                      </label>
                      <Select value={formData.business_model} onValueChange={(v) => handleChange('business_model', v)}>
                        <SelectTrigger className="input-premium" data-testid="select-business-model">
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Stage *
                      </label>
                      <Select value={formData.stage} onValueChange={(v) => handleChange('stage', v)}>
                        <SelectTrigger className="input-premium" data-testid="select-stage">
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
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Country
                      </label>
                      <Select value={formData.country} onValueChange={(v) => handleChange('country', v)}>
                        <SelectTrigger className="input-premium" data-testid="select-country">
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
                className="p-8"
              >
                <h2 className="text-xl font-semibold text-slate-900 mb-6">Financial Metrics</h2>
                
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        ARR (Annual Recurring Revenue) *
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                        <Input
                          type="number"
                          value={formData.arr}
                          onChange={(e) => handleChange('arr', e.target.value)}
                          placeholder="1000000"
                          className="input-premium pl-7"
                          data-testid="input-arr"
                        />
                      </div>
                      <p className="text-xs text-slate-500 mt-1">Annual revenue from subscriptions</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        MRR (Monthly) - Alternative
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                        <Input
                          type="number"
                          value={formData.mrr}
                          onChange={(e) => handleChange('mrr', e.target.value)}
                          placeholder="0"
                          className="input-premium pl-7"
                          data-testid="input-mrr"
                        />
                      </div>
                      <p className="text-xs text-slate-500 mt-1">Will be multiplied by 12</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        YoY Growth Rate *
                      </label>
                      <div className="relative">
                        <Input
                          type="number"
                          value={formData.growth_rate}
                          onChange={(e) => handleChange('growth_rate', e.target.value)}
                          placeholder="50"
                          className="input-premium pr-7"
                          data-testid="input-growth-rate"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">%</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Gross Margin *
                      </label>
                      <div className="relative">
                        <Input
                          type="number"
                          value={formData.gross_margin}
                          onChange={(e) => handleChange('gross_margin', e.target.value)}
                          placeholder="70"
                          className="input-premium pr-7"
                          data-testid="input-gross-margin"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">%</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Net Revenue Retention (NRR)
                      </label>
                      <div className="relative">
                        <Input
                          type="number"
                          value={formData.nrr}
                          onChange={(e) => handleChange('nrr', e.target.value)}
                          placeholder="100"
                          className="input-premium pr-7"
                          data-testid="input-nrr"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">%</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">100% = no churn, &gt;100% = expansion</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Team Size
                      </label>
                      <Input
                        type="number"
                        value={formData.team_size}
                        onChange={(e) => handleChange('team_size', e.target.value)}
                        placeholder="10"
                        className="input-premium"
                        data-testid="input-team-size"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 3: Qualitative Scores */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="p-8"
              >
                <h2 className="text-xl font-semibold text-slate-900 mb-6">Qualitative Assessment</h2>
                
                <div className="space-y-8">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <label className="text-sm font-medium text-slate-700">
                        Product Maturity
                      </label>
                      <span className="text-sm font-semibold text-[#0B4DBB]">
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
                    <div className="flex justify-between text-xs text-slate-500 mt-2">
                      <span>MVP</span>
                      <span>Early</span>
                      <span>Growing</span>
                      <span>Mature</span>
                      <span>Market Leader</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-3">
                      Market Size
                    </label>
                    <div className="grid grid-cols-3 gap-4">
                      {marketSizes.map(size => (
                        <button
                          key={size}
                          type="button"
                          onClick={() => handleChange('market_size', size)}
                          className={`p-4 rounded-xl border-2 transition-all ${
                            formData.market_size === size
                              ? 'border-[#0B4DBB] bg-[#F0F7FF]'
                              : 'border-[#EEF2F7] hover:border-[#A7C8FF]'
                          }`}
                          data-testid={`btn-market-${size.toLowerCase()}`}
                        >
                          <div className={`text-lg font-semibold ${
                            formData.market_size === size ? 'text-[#0B4DBB]' : 'text-slate-700'
                          }`}>
                            {size}
                          </div>
                          <div className="text-xs text-slate-500 mt-1">
                            {size === 'Small' && '<$1B TAM'}
                            {size === 'Medium' && '$1-10B TAM'}
                            {size === 'Large' && '>$10B TAM'}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-3">
                      Competitive Moat
                    </label>
                    <div className="grid grid-cols-3 gap-4">
                      {moatLevels.map(level => (
                        <button
                          key={level}
                          type="button"
                          onClick={() => handleChange('competitive_moat', level)}
                          className={`p-4 rounded-xl border-2 transition-all ${
                            formData.competitive_moat === level
                              ? 'border-[#0B4DBB] bg-[#F0F7FF]'
                              : 'border-[#EEF2F7] hover:border-[#A7C8FF]'
                          }`}
                          data-testid={`btn-moat-${level.toLowerCase()}`}
                        >
                          <div className={`text-lg font-semibold ${
                            formData.competitive_moat === level ? 'text-[#0B4DBB]' : 'text-slate-700'
                          }`}>
                            {level}
                          </div>
                          <div className="text-xs text-slate-500 mt-1">
                            {level === 'Low' && 'Easy to replicate'}
                            {level === 'Medium' && 'Some barriers'}
                            {level === 'Strong' && 'Hard to compete'}
                          </div>
                        </button>
                      ))}
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
                <div className="analyzing-pulse mb-8">
                  <VLogo size="xl" />
                </div>
                <h2 className="text-2xl font-semibold text-slate-900 mb-4">
                  Ventura AI is analyzing your company
                </h2>
                <p className="text-slate-600 mb-8">
                  Processing financials, market data, and comparable transactions...
                </p>
                <div className="max-w-xs mx-auto">
                  <div className="progress-bar">
                    <motion.div 
                      className="progress-bar-fill"
                      initial={{ width: '0%' }}
                      animate={{ width: '90%' }}
                      transition={{ duration: 2.5, ease: 'easeInOut' }}
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Buttons */}
          {step < 4 && (
            <div className="px-8 py-6 bg-[#F8FAFC] border-t border-[#EEF2F7] flex items-center justify-between">
              <Button
                variant="ghost"
                onClick={step === 1 ? () => navigate(-1) : handleBack}
                className="text-slate-600"
                data-testid="btn-back"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>

              <Button
                onClick={handleNext}
                disabled={(step === 1 && !isStep1Valid()) || (step === 2 && !isStep2Valid())}
                className="bg-[#0B4DBB] hover:bg-[#093c96] text-white shadow-lg shadow-blue-900/20"
                data-testid="btn-next"
              >
                {step === 3 ? 'Generate Valuation' : 'Next'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default CreateValuation;
