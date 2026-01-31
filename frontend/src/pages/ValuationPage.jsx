import React from 'react';
import { useAuth } from '../App';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Button } from '../components/ui/button';
import { Lock, TrendingUp, AlertTriangle, Target, Lightbulb, BarChart3 } from 'lucide-react';

const ValuationPage = () => {
  const { user, login } = useAuth();

  const handleUnlock = () => {
    if (user) {
      window.location.href = '/valuation/new';
    } else {
      login();
    }
  };

  const reportFeatures = [
    {
      icon: BarChart3,
      title: 'Estimated valuation range',
      description: 'Low, base, and high scenarios with clear methodology.'
    },
    {
      icon: TrendingUp,
      title: 'Key value drivers',
      description: 'What makes your business attractive to buyers.'
    },
    {
      icon: AlertTriangle,
      title: 'Risk factors',
      description: 'Potential concerns investors will raise.'
    },
    {
      icon: Target,
      title: 'Exit readiness score',
      description: 'How prepared you are to sell today.'
    },
    {
      icon: Lightbulb,
      title: 'Strategic recommendations',
      description: 'Actions to maximize your exit value.'
    }
  ];

  return (
    <div className="min-h-screen bg-white" data-testid="valuation-page">
      <Navbar />

      {/* HERO SECTION */}
      <section className="pt-28 pb-16 md:pt-36 md:pb-24" data-testid="valuation-hero">
        <div className="max-w-[1100px] mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
            {/* Left - Content */}
            <div>
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-slate-900 leading-[1.1] mb-6">
                Your business valuation — explained
              </h1>
              <p className="text-xl text-slate-600 mb-8 leading-relaxed">
                Get investor-grade insights into what your business is worth and why. 
                No guesswork. No hidden formulas.
              </p>

              {/* What you get list */}
              <div className="mb-8">
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">
                  What you'll receive
                </p>
                <ul className="space-y-3">
                  {[
                    'Estimated valuation range',
                    'Key value drivers',
                    'Risk factors',
                    'Exit readiness score',
                    'Strategic recommendations'
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-slate-800">
                      <svg className="w-5 h-5 text-[#0B4DBB] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="font-medium">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Life-changing money framing */}
              <blockquote className="border-l-4 border-[#0B4DBB] pl-5 py-2 mb-8">
                <p className="text-lg text-slate-700 font-medium mb-3">
                  This is not just a number.
                </p>
                <p className="text-slate-600">
                  It's the difference between:
                </p>
                <ul className="mt-2 space-y-1 text-slate-600">
                  <li>• selling smart</li>
                  <li>• or leaving money on the table.</li>
                </ul>
              </blockquote>

              <Button
                onClick={handleUnlock}
                size="lg"
                className="bg-[#0B4DBB] hover:bg-[#093c96] text-white px-10 py-6 text-lg font-semibold shadow-xl shadow-blue-900/20 hover:shadow-2xl hover:shadow-blue-900/30 transition-all"
                data-testid="hero-unlock-btn"
              >
                Unlock my full report
              </Button>
            </div>

            {/* Right - Valuation Preview Card */}
            <div className="lg:sticky lg:top-28">
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 relative overflow-hidden" data-testid="valuation-preview-card">
                {/* Locked overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-transparent to-transparent pointer-events-none z-10" />
                
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <span className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
                    Valuation Preview
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full">
                    <Lock className="w-3 h-3" />
                    Locked
                  </span>
                </div>

                {/* Valuation Range - Blurred */}
                <div className="text-center py-8 mb-6 border-b border-slate-200">
                  <p className="text-sm text-slate-500 mb-2">Estimated valuation</p>
                  <p className="text-4xl md:text-5xl font-bold text-slate-300 blur-sm select-none">
                    $2.4M – $3.8M
                  </p>
                </div>

                {/* Preview Rows - Locked */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[#0B4DBB]/10 flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-[#0B4DBB]" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-500">Top value driver</p>
                        <p className="font-medium text-slate-300 blur-sm select-none">Recurring revenue growth</p>
                      </div>
                    </div>
                    <Lock className="w-4 h-4 text-slate-400" />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
                        <AlertTriangle className="w-5 h-5 text-amber-500" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-500">Main risk factor</p>
                        <p className="font-medium text-slate-300 blur-sm select-none">Customer concentration</p>
                      </div>
                    </div>
                    <Lock className="w-4 h-4 text-slate-400" />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                        <Target className="w-5 h-5 text-emerald-500" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-500">Exit readiness score</p>
                        <p className="font-medium text-slate-300 blur-sm select-none">72 / 100</p>
                      </div>
                    </div>
                    <Lock className="w-4 h-4 text-slate-400" />
                  </div>
                </div>

                {/* Unlock prompt */}
                <div className="relative z-20 mt-6 text-center">
                  <Button
                    onClick={handleUnlock}
                    className="w-full bg-[#0B4DBB] hover:bg-[#093c96] text-white py-5 font-semibold shadow-lg"
                    data-testid="card-unlock-btn"
                  >
                    <Lock className="w-4 h-4 mr-2" />
                    Unlock full report
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WHAT'S INSIDE THE REPORT */}
      <section className="py-20 md:py-28 bg-[#F8FAFC]" data-testid="report-features">
        <div className="max-w-[1100px] mx-auto px-6 md:px-12">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 mb-4">
              What's inside the report
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Everything you need to understand your business value and plan your next move.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reportFeatures.map((feature, index) => (
              <div 
                key={index}
                className="bg-white border border-slate-200 rounded-xl p-6 hover:border-[#0B4DBB]/30 hover:shadow-lg transition-all"
                data-testid={`feature-card-${index}`}
              >
                <div className="w-12 h-12 rounded-xl bg-[#F0F7FF] flex items-center justify-center text-[#0B4DBB] mb-4">
                  <feature.icon className="w-6 h-6" strokeWidth={1.5} />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BOTTOM CTA */}
      <section id="unlock" className="py-20 md:py-28 bg-white" data-testid="bottom-cta">
        <div className="max-w-[800px] mx-auto px-6 md:px-12 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 mb-4">
            Make decisions with clarity.
          </h2>
          <p className="text-lg text-slate-600 mb-10">
            Know your worth before you negotiate. Know your risks before you commit.
          </p>
          <Button
            onClick={handleUnlock}
            size="lg"
            className="bg-[#0B4DBB] hover:bg-[#093c96] text-white px-12 py-6 text-lg font-semibold shadow-xl shadow-blue-900/20 hover:shadow-2xl hover:shadow-blue-900/30 transition-all"
            data-testid="bottom-unlock-btn"
          >
            Unlock my full report
          </Button>
          <p className="text-sm text-slate-500 mt-4">
            Takes minutes. No commitment required.
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ValuationPage;
