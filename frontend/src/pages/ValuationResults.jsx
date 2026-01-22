import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Button } from '../components/ui/button';
import { Slider } from '../components/ui/slider';
import { toast } from 'sonner';
import { ArrowLeft, Download, Share2, Copy, Check, Building2, TrendingUp, Users, Briefcase, Target, DollarSign } from 'lucide-react';
import { motion } from 'framer-motion';

const API = process.env.REACT_APP_BACKEND_URL + "/api";

const ValuationResults = () => {
  const { valuationId } = useParams();
  const navigate = useNavigate();
  const [valuation, setValuation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // Scenario slider state
  const [growthAdjustment, setGrowthAdjustment] = useState([100]); // 100% = base case
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

  return (
    <div className="min-h-screen bg-[#F8FAFC]" data-testid="valuation-results">
      <Navbar />

      <main className="pt-24 pb-12 px-6 md:px-12 lg:px-24 max-w-6xl mx-auto">
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

        {/* Main Valuation Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="valuation-result-card p-8 md:p-12 mb-8"
        >
          <div className="text-center">
            <p className="text-white/80 text-sm uppercase tracking-wider mb-2">
              {valuation.company_info.company_name}
            </p>
            <h1 className="text-4xl md:text-6xl font-bold mb-4" data-testid="valuation-amount">
              {formatCurrency(adjustedVal.base)}
            </h1>
            <p className="text-white/80">
              Estimated Valuation • {valuation.result.methodology}
            </p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Details */}
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

            {/* Exit Scenarios */}
            <div className="bg-white rounded-xl border border-[#EEF2F7] p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-6">Exit Scenarios</h3>
              
              <div className="space-y-4">
                {valuation.exit_scenarios?.map((scenario, index) => (
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
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-medium px-2 py-1 rounded ${
                          scenario.probability === 'High' ? 'bg-green-100 text-green-700' :
                          scenario.probability === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                          {scenario.probability}
                        </span>
                        <span className="text-xs font-medium px-2 py-1 rounded bg-[#F0F7FF] text-[#0B4DBB]">
                          {scenario.timeline}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-slate-600">{scenario.description}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Company Info */}
          <div className="space-y-6">
            {/* Company Info Card */}
            <div className="bg-white rounded-xl border border-[#EEF2F7] p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Company Details</h3>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#F0F7FF] flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-[#0B4DBB]" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Company</p>
                    <p className="font-medium text-slate-900">{valuation.company_info.company_name}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#F0F7FF] flex items-center justify-center">
                    <Briefcase className="w-5 h-5 text-[#0B4DBB]" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Industry</p>
                    <p className="font-medium text-slate-900">{valuation.company_info.industry}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#F0F7FF] flex items-center justify-center">
                    <Target className="w-5 h-5 text-[#0B4DBB]" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Stage</p>
                    <p className="font-medium text-slate-900">{valuation.company_info.stage}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#F0F7FF] flex items-center justify-center">
                    <Users className="w-5 h-5 text-[#0B4DBB]" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Team Size</p>
                    <p className="font-medium text-slate-900">{valuation.metrics.team_size} employees</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Metrics Card */}
            <div className="bg-white rounded-xl border border-[#EEF2F7] p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Financial Metrics</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between py-2 border-b border-[#EEF2F7]">
                  <span className="text-slate-600">ARR</span>
                  <span className="font-semibold text-slate-900">{formatCurrency(valuation.metrics.arr || valuation.metrics.mrr * 12)}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-[#EEF2F7]">
                  <span className="text-slate-600">Growth Rate</span>
                  <span className="font-semibold text-slate-900">{valuation.metrics.growth_rate}%</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-[#EEF2F7]">
                  <span className="text-slate-600">Gross Margin</span>
                  <span className="font-semibold text-slate-900">{valuation.metrics.gross_margin}%</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-slate-600">Multiple Used</span>
                  <span className="font-semibold text-[#0B4DBB]">{valuation.result.multiple_used}x</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gradient-to-br from-[#F0F7FF] to-white rounded-xl border border-[#DCEAFF] p-6">
              <h4 className="font-semibold text-slate-900 mb-4">Quick Actions</h4>
              <div className="space-y-3">
                <Link to={`/valuation/new/${valuation.project_id}`}>
                  <Button variant="outline" className="w-full justify-start border-[#EEF2F7] hover:bg-white">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    New Valuation
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  onClick={copyShareLink}
                  className="w-full justify-start border-[#EEF2F7] hover:bg-white"
                >
                  <Copy className="w-4 h-4 mr-2" />
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
