import React from 'react';
import { useAuth } from '../App';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Button } from '../components/ui/button';
import { Target, Brain, Compass } from 'lucide-react';

const AboutPage = () => {
  const { login } = useAuth();

  const principles = [
    {
      icon: Target,
      title: 'Founder-first valuation',
      description: 'Built for the people building companies, not the ones selling services.'
    },
    {
      icon: Brain,
      title: 'Investor-grade logic',
      description: 'The same frameworks buyers and investors use, now in your hands.'
    },
    {
      icon: Compass,
      title: 'Decision-making, not selling',
      description: 'Clarity to make better decisions, not pressure to close deals.'
    }
  ];

  return (
    <div className="min-h-screen bg-white" data-testid="about-page">
      <Navbar />

      {/* HERO - Simple, Centered */}
      <section className="pt-32 pb-16 md:pt-40 md:pb-20" data-testid="about-hero">
        <div className="max-w-[900px] mx-auto px-6 md:px-12 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 mb-6">
            Why Ventura exists
          </h1>
          <p className="text-xl md:text-2xl text-slate-600 max-w-2xl mx-auto">
            Because knowing your value should not require bankers, guesswork, or pressure.
          </p>
        </div>
      </section>

      {/* STORY SECTION */}
      <section className="py-16 md:py-24" data-testid="about-story">
        <div className="max-w-[800px] mx-auto px-6 md:px-12">
          {/* Block 1 - The Problem */}
          <div className="space-y-8 mb-16">
            <p className="text-2xl md:text-3xl font-semibold text-slate-900">
              Traditional valuation is broken.
            </p>

            <div className="space-y-6">
              <div>
                <p className="text-xl md:text-2xl font-medium text-slate-900">
                  M&A advisors are expensive.
                </p>
                <p className="text-lg text-slate-500 mt-1">
                  They charge engagement fees before value is created.
                </p>
              </div>

              <div>
                <p className="text-xl md:text-2xl font-medium text-slate-900">
                  Accountants look backward.
                </p>
                <p className="text-lg text-slate-500 mt-1">
                  They explain the past, not what a buyer will pay tomorrow.
                </p>
              </div>

              <div>
                <p className="text-xl md:text-2xl font-medium text-slate-900">
                  Spreadsheets miss the full picture.
                </p>
                <p className="text-lg text-slate-500 mt-1">
                  They ignore risk, market context, and buyer psychology.
                </p>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="w-24 h-px bg-slate-200 mx-auto my-16" />

          {/* Block 2 - The Reality */}
          <div className="space-y-6 mb-16 text-center">
            <p className="text-xl md:text-2xl font-medium text-slate-900">
              Yet buyers and investors don't guess.
            </p>
            <p className="text-lg text-slate-600">
              They use structured frameworks.
            </p>
            <p className="text-lg text-slate-600">
              Risk models.
            </p>
            <p className="text-lg text-slate-600">
              Comparable transactions.
            </p>
          </div>

          {/* Divider */}
          <div className="w-24 h-px bg-slate-200 mx-auto my-16" />

          {/* Block 3 - The Solution */}
          <div className="space-y-8 text-center">
            <p className="text-2xl md:text-3xl font-semibold text-[#0B4DBB]">
              Ventura brings that same logic to founders — instantly.
            </p>

            <div className="space-y-3">
              <p className="text-xl text-slate-700">No pressure.</p>
              <p className="text-xl text-slate-700">No engagement fees.</p>
              <p className="text-xl text-slate-700">No bullshit.</p>
            </div>

            <p className="text-2xl md:text-3xl font-semibold text-slate-900 pt-4">
              Just clarity.
            </p>
          </div>
        </div>
      </section>

      {/* PRINCIPLES BLOCK */}
      <section className="py-16 md:py-24 bg-[#F8FAFC]" data-testid="about-principles">
        <div className="max-w-[900px] mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {principles.map((principle, index) => (
              <div 
                key={index} 
                className="text-center"
                data-testid={`principle-${index}`}
              >
                <div className="w-14 h-14 mx-auto mb-5 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-[#0B4DBB]">
                  <principle.icon className="w-6 h-6" strokeWidth={1.5} />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  {principle.title}
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  {principle.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-20 md:py-28" data-testid="about-cta">
        <div className="max-w-[900px] mx-auto px-6 md:px-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 mb-8">
            Clarity changes everything.
          </h2>
          
          <Button
            onClick={login}
            size="lg"
            className="bg-[#0B4DBB] hover:bg-[#093c96] text-white px-10 py-6 text-lg font-semibold shadow-xl shadow-blue-900/20 hover:shadow-2xl hover:shadow-blue-900/30 transition-all"
            data-testid="about-cta-button"
          >
            Check my valuation
          </Button>

          <p className="text-sm text-slate-500 mt-4">
            Takes minutes. No commitment.
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AboutPage;
