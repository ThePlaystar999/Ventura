import React, { useRef, useEffect, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Button } from '../ui/button';
import { ArrowRight, Play, Shield, Clock, FileText } from 'lucide-react';

const HeroSection = ({ onGetStarted }) => {
  const containerRef = useRef(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });
  
  const mockupY = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const mockupScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95]);
  const opacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);

  // Subtle mouse tracking for 3D effect
  const handleMouseMove = (e) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = (e.clientX - rect.left - rect.width / 2) / rect.width;
    const y = (e.clientY - rect.top - rect.height / 2) / rect.height;
    setMousePosition({ x: x * 10, y: y * 10 });
  };

  return (
    <section 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative min-h-screen overflow-hidden bg-[#FAFBFC]"
      data-testid="hero-section"
    >
      {/* Premium gradient background */}
      <div className="absolute inset-0">
        {/* Main gradient - subtle warm to cool transition */}
        <div className="absolute inset-0 bg-gradient-to-b from-white via-slate-50/80 to-[#f1f5f9]" />
        
        {/* Subtle blue glow at bottom */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[120%] h-[60%] bg-gradient-to-t from-[#E8F0FE]/40 via-transparent to-transparent" />
        
        {/* Very subtle grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%230B4DBB' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}
        />
        
        {/* Subtle radial glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-gradient-radial from-[#0B4DBB]/[0.03] to-transparent rounded-full blur-3xl" />
      </div>

      {/* Content Container */}
      <div className="relative max-w-7xl mx-auto px-6 md:px-12 lg:px-16">
        {/* Top spacing for navbar */}
        <div className="pt-28 md:pt-36 lg:pt-40" />

        {/* Hero Content - Centered */}
        <motion.div 
          style={{ opacity }}
          className="text-center max-w-4xl mx-auto mb-12 md:mb-16"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-[#0B4DBB]/[0.08] border border-[#0B4DBB]/10 text-[#0B4DBB] text-sm font-medium px-4 py-2 rounded-full mb-8"
          >
            <span className="w-2 h-2 rounded-full bg-[#0B4DBB] animate-pulse" />
            AI-Powered Exit Intelligence
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-[4.25rem] font-bold tracking-tight text-slate-900 leading-[1.08] mb-6"
          >
            Your Startup Exit
            <br />
            <span className="bg-gradient-to-r from-[#0B4DBB] via-[#1E6AE1] to-[#0B4DBB] bg-clip-text text-transparent">
              Command Center
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Get AI-powered valuation, exit scenarios, and investor-ready reports.
            <br className="hidden sm:block" />
            Built for SaaS founders planning their next chapter.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10"
          >
            <Button
              onClick={onGetStarted}
              size="lg"
              className="bg-[#0B4DBB] hover:bg-[#0940a0] text-white px-8 py-6 text-base font-semibold shadow-xl shadow-[#0B4DBB]/25 hover:shadow-2xl hover:shadow-[#0B4DBB]/30 hover:scale-[1.02] transition-all duration-200 rounded-xl"
              data-testid="hero-cta-primary"
            >
              Get Your Valuation
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <button
              onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
              className="flex items-center gap-2 text-slate-600 hover:text-[#0B4DBB] font-medium transition-colors group"
              data-testid="hero-cta-secondary"
            >
              <span className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center group-hover:border-[#0B4DBB]/30 group-hover:bg-[#F0F7FF] transition-all">
                <Play className="w-4 h-4 ml-0.5" fill="currentColor" />
              </span>
              See how it works
            </button>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-500"
          >
            <span className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-400" />
              5 min setup
            </span>
            <span className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-slate-400" />
              PDF report included
            </span>
            <span className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-slate-400" />
              Bank-level security
            </span>
          </motion.div>
        </motion.div>

        {/* Dashboard Mockup - Immersive Preview */}
        <motion.div
          style={{ y: mockupY, scale: mockupScale }}
          className="relative max-w-5xl mx-auto"
        >
          {/* Outer glow effect */}
          <div className="absolute -inset-4 bg-gradient-to-t from-[#0B4DBB]/10 via-[#0B4DBB]/5 to-transparent rounded-[2rem] blur-2xl" />
          
          {/* Dashboard Container with 3D tilt */}
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            style={{
              transform: `perspective(1200px) rotateX(${2 + mousePosition.y * 0.3}deg) rotateY(${mousePosition.x * 0.3}deg)`,
              transformStyle: 'preserve-3d'
            }}
            className="relative bg-white rounded-2xl shadow-2xl shadow-slate-900/10 border border-slate-200/60 overflow-hidden"
          >
            {/* Browser Chrome */}
            <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 border-b border-slate-100">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-slate-300" />
                <div className="w-3 h-3 rounded-full bg-slate-300" />
                <div className="w-3 h-3 rounded-full bg-slate-300" />
              </div>
              <div className="flex-1 flex justify-center">
                <div className="flex items-center gap-2 bg-white rounded-lg px-4 py-1.5 text-xs text-slate-400 border border-slate-200">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  app.ventura.io
                </div>
              </div>
            </div>

            {/* Dashboard Content */}
            <div className="p-6 md:p-8 bg-gradient-to-b from-white to-slate-50/50">
              {/* Header Row */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#0B4DBB] to-[#1E6AE1] flex items-center justify-center">
                    <span className="text-white font-bold text-sm">V</span>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Exit Command Center</p>
                    <p className="font-semibold text-slate-900 text-sm">Acme Corp</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors">
                    Share
                  </button>
                  <button className="px-3 py-1.5 text-xs font-medium text-white bg-[#0B4DBB] rounded-lg">
                    Export PDF
                  </button>
                </div>
              </div>

              {/* Main Content Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                {/* Valuation Hero Card */}
                <div className="md:col-span-2 bg-gradient-to-br from-[#0B4DBB] via-[#1456c7] to-[#1E6AE1] rounded-xl p-6 text-white relative overflow-hidden">
                  {/* Subtle pattern overlay */}
                  <div className="absolute inset-0 opacity-10" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.4' fill-rule='evenodd'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/svg%3E")`
                  }} />
                  
                  <div className="relative">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="px-2 py-1 bg-white/20 backdrop-blur-sm rounded text-xs font-medium">High Confidence</span>
                      <span className="text-white/70 text-xs">Based on 8 metrics</span>
                    </div>
                    
                    <p className="text-white/70 text-sm mb-1">Estimated Enterprise Value</p>
                    <p className="text-5xl md:text-6xl font-bold mb-2 tracking-tight">$2.4M</p>
                    
                    <div className="flex items-center gap-3 text-sm">
                      <span className="text-white/70">Revenue Multiple: 4x</span>
                      <span className="px-2 py-0.5 bg-emerald-500/30 text-emerald-200 rounded text-xs font-medium">+1.2x premium</span>
                    </div>
                    
                    <div className="flex items-center gap-4 mt-4 pt-4 border-t border-white/20 text-xs text-white/60">
                      <span>ARR $600K</span>
                      <span>85% Growth</span>
                      <span>92% Margins</span>
                    </div>
                  </div>
                </div>

                {/* Right Column - Quick Metrics */}
                <div className="space-y-4">
                  {/* Exit Readiness */}
                  <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Exit Readiness</p>
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded text-xs font-medium">Strong</span>
                    </div>
                    <div className="flex items-end gap-2">
                      <span className="text-3xl font-bold text-slate-900">78</span>
                      <span className="text-slate-400 text-sm mb-1">/100</span>
                    </div>
                    <div className="mt-2 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full w-[78%] bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full" />
                    </div>
                  </div>

                  {/* Industry Rank */}
                  <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Industry Rank</p>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-[#0B4DBB]">Top 12%</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">of SaaS in $500K-$1M ARR</p>
                  </div>
                </div>
              </div>

              {/* Bottom Row - Exit Scenarios Preview */}
              <div className="mt-6 grid grid-cols-3 gap-4">
                {[
                  { label: 'Strategic Acquisition', value: '$2.8M', probability: 'High', color: 'emerald' },
                  { label: 'PE Buyout', value: '$2.1M', probability: 'Medium', color: 'amber' },
                  { label: 'IPO Path', value: '$4.2M', probability: 'Low', color: 'slate' }
                ].map((scenario) => (
                  <div key={scenario.label} className="bg-white rounded-lg p-3 border border-slate-100">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs text-slate-500 truncate">{scenario.label}</p>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                        scenario.color === 'emerald' ? 'bg-emerald-50 text-emerald-600' :
                        scenario.color === 'amber' ? 'bg-amber-50 text-amber-600' :
                        'bg-slate-100 text-slate-500'
                      }`}>
                        {scenario.probability}
                      </span>
                    </div>
                    <p className="text-lg font-bold text-slate-900">{scenario.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Gradient fade at bottom */}
            <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none" />
          </motion.div>
        </motion.div>

        {/* Bottom spacing */}
        <div className="h-32 md:h-48" />
      </div>

      {/* Subtle wave transition */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 80" preserveAspectRatio="none" className="w-full h-16 fill-white">
          <path d="M0,32L60,37.3C120,43,240,53,360,53.3C480,53,600,43,720,37.3C840,32,960,32,1080,37.3C1200,43,1320,53,1380,58.7L1440,64L1440,80L0,80Z" />
        </svg>
      </div>
    </section>
  );
};

export default HeroSection;
