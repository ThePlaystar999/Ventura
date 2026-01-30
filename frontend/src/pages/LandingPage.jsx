import React, { useState } from 'react';
import { useAuth } from '../App';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import VLogo from '../components/VLogo';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { toast } from 'sonner';
import { Settings, Rocket, Shield, ArrowRight, Mail, Phone, Send } from 'lucide-react';
import { motion } from 'framer-motion';

const API = process.env.REACT_APP_BACKEND_URL + "/api";

const LandingPage = () => {
  const { login } = useAuth();
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const response = await fetch(`${API}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactForm)
      });
      if (response.ok) {
        toast.success('Message sent successfully!');
        setContactForm({ name: '', email: '', message: '' });
      } else {
        toast.error('Failed to send message');
      }
    } catch (error) {
      toast.error('Something went wrong');
    }
    setSubmitting(false);
  };

  const services = [
    {
      icon: Settings,
      title: 'AI Valuation Engine',
      description: 'SaaS & AI-specific valuation logic powered by machine learning algorithms.'
    },
    {
      icon: Rocket,
      title: 'Exit Scenarios',
      description: 'Comprehensive analysis for acquisition, PE buyout, and strategic buyer scenarios.'
    },
    {
      icon: Shield,
      title: 'Investor-Grade Reports',
      description: 'Professional PDF-ready valuation outputs designed for investor presentations.'
    }
  ];

  return (
    <div className="min-h-screen bg-white" data-testid="landing-page">
      <Navbar />

      {/* HERO SECTION - Centered Layout */}
      <section className="relative min-h-[90vh] pt-24 md:pt-32 overflow-hidden" data-testid="hero-section">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-white via-[#F8FAFC] to-[#E8F0FE]" />
        
        {/* Subtle grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%230B4DBB' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}
        />

        <div className="relative max-w-4xl mx-auto px-6 md:px-12 flex flex-col items-center justify-center min-h-[70vh] text-center">
          {/* Centered V Logo - Standalone */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <VLogo size="lg" />
          </motion.div>

          {/* Main Headlines - Centered */}
          <div className="space-y-2 mb-6">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 leading-[1.1]"
            >
              Know your value.
            </motion.h1>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#0B4DBB] leading-[1.1]"
            >
              Plan your exit.
            </motion.h1>
          </div>

          {/* Subheadline - Centered */}
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-lg md:text-xl text-slate-600 max-w-2xl mb-10"
          >
            AI-powered startup valuation & exit modeling for founders and investors.
          </motion.p>

          {/* CTAs - Centered */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button 
              onClick={login}
              size="lg"
              className="bg-[#0B4DBB] hover:bg-[#093c96] text-white px-8 py-6 text-lg font-semibold shadow-xl shadow-blue-900/20 hover:shadow-2xl hover:shadow-blue-900/30 transition-all"
              data-testid="hero-cta-primary"
            >
              Get Valued
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button 
              variant="outline"
              size="lg"
              onClick={() => document.getElementById('services').scrollIntoView({ behavior: 'smooth' })}
              className="border-slate-300 text-slate-700 hover:text-[#0B4DBB] hover:border-[#0B4DBB] px-8 py-6 text-lg font-medium"
              data-testid="hero-cta-secondary"
            >
              How it Works
            </Button>
          </motion.div>
        </div>

        {/* Bottom wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" preserveAspectRatio="none" className="w-full h-20">
            <path 
              fill="#FFFFFF" 
              d="M0,64L48,69.3C96,75,192,85,288,80C384,75,480,53,576,48C672,43,768,53,864,64C960,75,1056,85,1152,80C1248,75,1344,53,1392,42.7L1440,32L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z"
            />
          </svg>
        </div>
      </section>

      {/* FOUNDER LEVERAGE SECTION */}
      <section className="relative py-20 md:py-28 bg-white overflow-hidden" data-testid="founder-leverage-section">
        {/* Subtle grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%230B4DBB' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}
        />

        <div className="relative max-w-[900px] mx-auto px-6 md:px-12 text-center">
          {/* H2 Headlines */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="space-y-1 mb-6"
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 leading-[1.15]">
              Know your real business value.
            </h2>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#0B4DBB] leading-[1.15]">
              Plan your exit with confidence.
            </h2>
          </motion.div>

          {/* Body text */}
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
            className="text-lg md:text-xl text-slate-600 mb-8"
          >
            AI-powered valuation for founders who want leverage, not guesses.
          </motion.p>

          {/* Typewriter animated sentence */}
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            className="mb-10"
          >
            <p className="text-lg md:text-xl font-medium text-[#0B4DBB] typewriter-container">
              <span className="typewriter-text">Exit your startup for life-changing money.</span>
            </p>
          </motion.div>

          {/* CTAs */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            viewport={{ once: true }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8"
          >
            <Button 
              onClick={login}
              size="lg"
              className="bg-[#0B4DBB] hover:bg-[#093c96] text-white px-8 py-6 text-lg font-semibold shadow-xl shadow-blue-900/20 hover:shadow-2xl hover:shadow-blue-900/30 transition-all"
              data-testid="leverage-cta-primary"
            >
              Get my valuation
            </Button>
            <button 
              onClick={() => document.getElementById('services').scrollIntoView({ behavior: 'smooth' })}
              className="text-slate-700 hover:text-[#0B4DBB] text-lg font-medium inline-flex items-center gap-2 transition-colors"
              data-testid="leverage-cta-secondary"
            >
              See how it works
              <ArrowRight className="w-5 h-5" />
            </button>
          </motion.div>

          {/* Trust line */}
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            viewport={{ once: true }}
            className="text-sm text-slate-500"
          >
            Used by startup & online business founders preparing exits, fundraising & negotiations.
          </motion.p>
        </div>
      </section>

      {/* COST OF NOT KNOWING SECTION */}
      <section id="cost-of-ignorance" className="py-20 md:py-28 bg-[#F8FAFC]" data-testid="cost-section">
        <div className="max-w-[1100px] mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
            {/* Left Column - Content */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-slate-900 leading-tight mb-8">
                Most founders don't know what their business is really worth.
              </h3>

              <p className="text-lg text-slate-600 mb-4">They rely on:</p>
              
              {/* List A - Subtle */}
              <ul className="space-y-2 mb-6 pl-1">
                {['Gut feeling', 'Outdated multiples', 'Biased advisors', 'Or no valuation at all'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-500">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              {/* Divider */}
              <div className="w-16 h-px bg-slate-200 my-6" />

              <p className="text-lg text-slate-600 mb-4">That leads to:</p>

              {/* List B - Stronger */}
              <ul className="space-y-3 mb-8 pl-1">
                {[
                  'Bad negotiations',
                  'Unnecessary dilution',
                  'Missed exit windows',
                  'Six-figure mistakes'
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-800 font-medium">
                    <span className="w-2 h-2 rounded-full bg-[#0B4DBB] flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              {/* Closing line */}
              <p className="text-lg md:text-xl font-semibold text-slate-900 mb-8 border-l-4 border-[#0B4DBB] pl-4">
                One wrong valuation decision can cost years of work.
              </p>

              {/* CTA */}
              <Button
                onClick={login}
                size="lg"
                className="bg-[#0B4DBB] hover:bg-[#093c96] text-white px-8 py-6 text-lg font-semibold shadow-xl shadow-blue-900/20 hover:shadow-2xl hover:shadow-blue-900/30 transition-all"
                data-testid="cost-cta"
              >
                Avoid blind decisions
              </Button>
            </motion.div>

            {/* Right Column - Cost of Ignorance Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="lg:sticky lg:top-32"
            >
              <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-lg shadow-slate-900/5">
                {/* Label */}
                <div className="inline-flex items-center gap-2 bg-red-50 text-red-600 text-sm font-medium px-3 py-1.5 rounded-full mb-6">
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  Cost of Ignorance
                </div>

                {/* Metric chips */}
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
                    <div className="w-12 h-12 rounded-lg bg-[#0B4DBB]/10 flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-[#0B4DBB]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Potential loss</p>
                      <p className="text-lg font-semibold text-slate-900">Weeks lost</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
                    <div className="w-12 h-12 rounded-lg bg-[#0B4DBB]/10 flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-[#0B4DBB]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Potential loss</p>
                      <p className="text-lg font-semibold text-slate-900">Equity diluted</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
                    <div className="w-12 h-12 rounded-lg bg-[#0B4DBB]/10 flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-[#0B4DBB]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Potential loss</p>
                      <p className="text-lg font-semibold text-slate-900">Exit value missed</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ECONOMIC IMPACT SECTION */}
      <section id="economic-impact" className="py-20 md:py-28 bg-white" data-testid="economic-impact-section">
        <div className="max-w-[900px] mx-auto px-6 md:px-12 text-center">
          {/* Title */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 mb-3"
          >
            This is not just a number.
          </motion.h2>

          {/* Subline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
            className="text-lg text-slate-500 mb-12"
          >
            Your valuation defines your outcome.
          </motion.p>

          {/* Body intro */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-xl text-slate-700 mb-8"
          >
            Your valuation determines:
          </motion.p>

          {/* Bullet list */}
          <motion.ul
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            viewport={{ once: true }}
            className="space-y-4 mb-12 max-w-md mx-auto text-left"
          >
            {[
              'How much equity you give away',
              'How strong your negotiating position is',
              'When selling actually makes sense',
              'How much money you keep'
            ].map((item, i) => (
              <li key={i} className="text-lg text-slate-800 font-medium pl-6 relative">
                <span className="absolute left-0 top-[0.6rem] w-2 h-2 rounded-full bg-slate-900" />
                {item}
              </li>
            ))}
          </motion.ul>

          {/* Divider */}
          <div className="w-16 h-px bg-slate-200 mx-auto my-12" />

          {/* Impact sentence */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            viewport={{ once: true }}
            className="text-xl md:text-2xl font-bold text-slate-900 mb-10"
          >
            A 10–20% valuation gap can mean hundreds of thousands lost.
          </motion.p>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            viewport={{ once: true }}
          >
            <Button
              onClick={login}
              size="lg"
              className="bg-[#0B4DBB] hover:bg-[#093c96] text-white px-10 py-6 text-lg font-semibold shadow-xl shadow-blue-900/20 hover:shadow-2xl hover:shadow-blue-900/30 transition-all"
              data-testid="economic-impact-cta"
            >
              Know my number
            </Button>
          </motion.div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section id="how-it-works" className="py-20 md:py-28 bg-[#F8FAFC]" data-testid="how-it-works-section">
        <div className="max-w-[1100px] mx-auto px-6 md:px-12">
          {/* Title */}
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 text-center mb-16">
            From data to decision — in minutes
          </h2>

          {/* Steps */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6 mb-16">
            {/* Step 1 */}
            <div className="relative text-center md:text-left" data-testid="step-1">
              <div className="flex flex-col items-center md:items-start">
                <span className="text-5xl md:text-6xl font-bold text-[#0B4DBB]/10 mb-4">1</span>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">
                  Enter your metrics
                </h3>
                <p className="text-slate-600">
                  Revenue, growth, margins, business model.
                </p>
              </div>
              {/* Connector line - desktop only */}
              <div className="hidden md:block absolute top-8 left-full w-full h-px bg-slate-200 -translate-x-1/2" />
            </div>

            {/* Step 2 */}
            <div className="relative text-center md:text-left" data-testid="step-2">
              <div className="flex flex-col items-center md:items-start">
                <span className="text-5xl md:text-6xl font-bold text-[#0B4DBB]/10 mb-4">2</span>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">
                  AI valuation engine
                </h3>
                <p className="text-slate-600">
                  Benchmarks, risk analysis, exit logic.
                </p>
              </div>
              {/* Connector line - desktop only */}
              <div className="hidden md:block absolute top-8 left-full w-full h-px bg-slate-200 -translate-x-1/2" />
            </div>

            {/* Step 3 */}
            <div className="text-center md:text-left" data-testid="step-3">
              <div className="flex flex-col items-center md:items-start">
                <span className="text-5xl md:text-6xl font-bold text-[#0B4DBB]/10 mb-4">3</span>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">
                  Get your valuation report
                </h3>
                <p className="text-slate-600">
                  Clear range. Key drivers. Strategic insights.
                </p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center">
            <Button
              onClick={login}
              size="lg"
              className="bg-[#0B4DBB] hover:bg-[#093c96] text-white px-10 py-6 text-lg font-semibold shadow-xl shadow-blue-900/20 hover:shadow-2xl hover:shadow-blue-900/30 transition-all"
              data-testid="how-it-works-cta"
            >
              Start my valuation
            </Button>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 md:py-32 bg-white" data-testid="services-section">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-slate-900 mb-4">
              Our Services
            </h2>
            <p className="text-slate-600 max-w-xl mx-auto">
              Professional valuation tools designed for modern startups
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="service-card bg-white border border-[#EEF2F7] rounded-xl p-8 text-center hover:border-[#0B4DBB]/30 hover:shadow-lg transition-all"
                data-testid={`service-card-${index}`}
              >
                <div className="service-icon w-16 h-16 mx-auto mb-6 rounded-xl bg-[#F0F7FF] flex items-center justify-center text-[#0B4DBB]">
                  <service.icon className="w-8 h-8" strokeWidth={1.5} />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">{service.title}</h3>
                <p className="text-slate-600 leading-relaxed">{service.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 md:py-32 bg-[#F8FAFC]" data-testid="about-section">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-slate-900 mb-6">
                About Ventura
              </h2>
              <div className="space-y-4 text-slate-600 leading-relaxed">
                <p>
                  Ventura delivers institutional-grade valuation analysis previously reserved for 
                  investment banks and top-tier advisory firms.
                </p>
                <p>
                  Our platform combines sophisticated financial modeling with AI-powered market 
                  intelligence to provide accurate, defensible valuations that stand up to investor scrutiny.
                </p>
                <p>
                  Whether you're preparing for a funding round, exploring exit options, or conducting 
                  due diligence, Ventura provides the clarity you need to make informed decisions.
                </p>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="aspect-video rounded-2xl overflow-hidden shadow-2xl shadow-blue-900/10 bg-gradient-to-br from-[#0B4DBB] to-[#1E6AE1] flex items-center justify-center">
                <VLogo size="hero" className="opacity-20" />
              </div>
              <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-[#DCEAFF] rounded-2xl -z-10"></div>
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-[#0B4DBB] rounded-2xl opacity-10 -z-10"></div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 md:py-32 bg-white" data-testid="contact-section">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-slate-900 mb-6">
                Contact Us
              </h2>
              <p className="text-slate-600 mb-8 leading-relaxed">
                Have questions about our valuation methodology or need custom solutions? 
                Our team is ready to help.
              </p>

              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-[#F0F7FF] flex items-center justify-center text-[#0B4DBB]">
                    <Mail className="w-5 h-5" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Email</p>
                    <p className="text-slate-900 font-medium">contact@ventura.io</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-[#F0F7FF] flex items-center justify-center text-[#0B4DBB]">
                    <Phone className="w-5 h-5" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Phone</p>
                    <p className="text-slate-900 font-medium">+1 (555) 123-4567</p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <form onSubmit={handleContactSubmit} className="bg-[#F8FAFC] rounded-2xl p-8" data-testid="contact-form">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Name</label>
                    <Input
                      value={contactForm.name}
                      onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                      placeholder="Your name"
                      className="input-premium"
                      required
                      data-testid="contact-name-input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                    <Input
                      type="email"
                      value={contactForm.email}
                      onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                      placeholder="your@email.com"
                      className="input-premium"
                      required
                      data-testid="contact-email-input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Message</label>
                    <Textarea
                      value={contactForm.message}
                      onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                      placeholder="How can we help?"
                      rows={4}
                      className="input-premium resize-none"
                      required
                      data-testid="contact-message-input"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    disabled={submitting}
                    className="w-full bg-[#0B4DBB] hover:bg-[#093c96] text-white py-6 shadow-lg shadow-blue-900/20"
                    data-testid="contact-submit-btn"
                  >
                    {submitting ? (
                      <span className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Sending...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Send className="w-4 h-4" />
                        Send Message
                      </span>
                    )}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LandingPage;
