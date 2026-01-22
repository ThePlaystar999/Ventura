import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import VLogo from '../components/VLogo';
import Footer from '../components/Footer';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';
import { Download, Building2, Briefcase, Target, Users, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

const API = process.env.REACT_APP_BACKEND_URL + "/api";

const SharedValuation = () => {
  const { shareToken } = useParams();
  const [valuation, setValuation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    fetchValuation();
  }, [shareToken]);

  const fetchValuation = async () => {
    try {
      const response = await fetch(`${API}/share/${shareToken}`);
      if (response.ok) {
        setValuation(await response.json());
      } else {
        toast.error('Valuation not found or link expired');
      }
    } catch (error) {
      toast.error('Failed to load valuation');
    }
    setLoading(false);
  };

  const downloadPDF = async () => {
    setDownloading(true);
    try {
      const response = await fetch(`${API}/share/${shareToken}/pdf`);
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${valuation?.company_info?.company_name || 'Valuation'}_Report.pdf`;
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

  const formatCurrency = (value) => {
    if (!value) return '$0';
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    }
    return `$${(value / 1000).toFixed(0)}K`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-[#F0F7FF] flex items-center justify-center">
        <div className="text-center">
          <VLogo size="lg" className="mx-auto mb-4" />
          <div className="spinner mx-auto"></div>
        </div>
      </div>
    );
  }

  if (!valuation) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-[#F0F7FF] flex items-center justify-center" data-testid="shared-not-found">
        <div className="text-center">
          <VLogo size="lg" className="mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Valuation Not Found</h1>
          <p className="text-slate-600">This link may have expired or is invalid.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[#F8FAFC]" data-testid="shared-valuation">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#EEF2F7]">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24">
          <div className="flex items-center justify-between h-16 md:h-20">
            <div className="flex items-center gap-3">
              <VLogo size="sm" />
              <span className="text-xl font-bold tracking-tight text-slate-900">Ventura</span>
            </div>
            <Button 
              onClick={downloadPDF}
              disabled={downloading}
              className="bg-[#0B4DBB] hover:bg-[#093c96] shadow-lg shadow-blue-900/20"
              data-testid="shared-download-pdf"
            >
              <Download className="w-4 h-4 mr-2" />
              {downloading ? 'Downloading...' : 'Download Report'}
            </Button>
          </div>
        </div>
      </header>

      <main className="pt-28 pb-12 px-6 md:px-12 lg:px-24 max-w-5xl mx-auto">
        {/* Main Valuation Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="valuation-result-card p-8 md:p-12 mb-8"
        >
          <div className="text-center">
            <p className="text-white/80 text-sm uppercase tracking-wider mb-2">
              {valuation.company_info?.company_name}
            </p>
            <h1 className="text-4xl md:text-6xl font-bold mb-4" data-testid="shared-valuation-amount">
              {formatCurrency(valuation.result?.base)}
            </h1>
            <p className="text-white/80">
              Estimated Valuation • {valuation.result?.methodology}
            </p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Valuation Range */}
            <div className="bg-white rounded-xl border border-[#EEF2F7] p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-6">Valuation Range</h3>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 rounded-xl bg-[#DCEAFF]">
                  <p className="text-sm text-slate-600 mb-1">Conservative</p>
                  <p className="text-2xl font-bold text-[#0B4DBB]">{formatCurrency(valuation.result?.low)}</p>
                </div>
                <div className="text-center p-4 rounded-xl bg-[#0B4DBB] text-white">
                  <p className="text-sm text-white/80 mb-1">Base Case</p>
                  <p className="text-2xl font-bold">{formatCurrency(valuation.result?.base)}</p>
                </div>
                <div className="text-center p-4 rounded-xl bg-[#1E6AE1] text-white">
                  <p className="text-sm text-white/80 mb-1">Optimistic</p>
                  <p className="text-2xl font-bold">{formatCurrency(valuation.result?.high)}</p>
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
                    data-testid={`shared-exit-scenario-${index}`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-slate-900">{scenario.name}</h4>
                        <p className="text-2xl font-bold text-[#0B4DBB] mt-1">
                          {formatCurrency(scenario.estimated_value)}
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

          {/* Right Column */}
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
                    <p className="font-medium text-slate-900">{valuation.company_info?.company_name}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#F0F7FF] flex items-center justify-center">
                    <Briefcase className="w-5 h-5 text-[#0B4DBB]" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Industry</p>
                    <p className="font-medium text-slate-900">{valuation.company_info?.industry}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#F0F7FF] flex items-center justify-center">
                    <Target className="w-5 h-5 text-[#0B4DBB]" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Stage</p>
                    <p className="font-medium text-slate-900">{valuation.company_info?.stage}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#F0F7FF] flex items-center justify-center">
                    <Users className="w-5 h-5 text-[#0B4DBB]" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Team Size</p>
                    <p className="font-medium text-slate-900">{valuation.metrics?.team_size} employees</p>
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
                  <span className="font-semibold text-slate-900">{formatCurrency(valuation.metrics?.arr || (valuation.metrics?.mrr || 0) * 12)}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-[#EEF2F7]">
                  <span className="text-slate-600">Growth Rate</span>
                  <span className="font-semibold text-slate-900">{valuation.metrics?.growth_rate}%</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-[#EEF2F7]">
                  <span className="text-slate-600">Gross Margin</span>
                  <span className="font-semibold text-slate-900">{valuation.metrics?.gross_margin}%</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-slate-600">Multiple Used</span>
                  <span className="font-semibold text-[#0B4DBB]">{valuation.result?.multiple_used}x</span>
                </div>
              </div>
            </div>

            {/* Powered by Ventura */}
            <div className="bg-gradient-to-br from-[#F0F7FF] to-white rounded-xl border border-[#DCEAFF] p-6 text-center">
              <p className="text-sm text-slate-600 mb-2">Powered by</p>
              <div className="flex items-center justify-center gap-2">
                <VLogo size="sm" />
                <span className="font-bold text-slate-900">Ventura</span>
              </div>
              <p className="text-xs text-slate-500 mt-3">AI-powered startup valuation</p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SharedValuation;
