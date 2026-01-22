import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../App';
import VLogo from '../components/VLogo';
import Footer from '../components/Footer';
import { Button } from '../components/ui/button';
import { Check, ChevronDown, ChevronUp } from 'lucide-react';
import { motion } from 'framer-motion';

const PricingPage = () => {
  const { login } = useAuth();
  const [isAnnual, setIsAnnual] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  const plans = [
    {
      name: 'REPORT',
      price: 49,
      period: 'one-time',
      tagline: 'Know your value.',
      features: [
        '1 AI-powered startup valuation',
        'Valuation range (Low / Base / High)',
        'SaaS & AI-specific revenue multiple logic',
        'Confidence score & assumptions',
        'Investor-grade PDF report'
      ],
      cta: 'Generate my report',
      popular: false
    },
    {
      name: 'FOUNDER',
      price: isAnnual ? 33 : 39,
      period: 'month',
      tagline: 'Build clarity. Plan your exit.',
      features: [
        '3 valuations per month',
        'AI Valuation Engine',
        'Exit Scenarios (Strategic, PE, Acquisition)',
        'Sensitivity analysis (key drivers sliders)',
        'PDF export',
        'Valuation history'
      ],
      cta: 'Start Founder plan',
      popular: false
    },
    {
      name: 'PRO',
      price: isAnnual ? 83 : 99,
      period: 'month',
      tagline: 'Investor-level insights.',
      features: [
        'Unlimited valuations',
        'Advanced exit scenarios & timelines',
        'Action plan per scenario',
        'Investor-grade customizable PDF reports',
        'Shareable report link',
        'Light white-label',
        'Priority compute'
      ],
      cta: 'Upgrade to Pro',
      popular: true
    }
  ];

  const faqs = [
    {
      question: 'Is Ventura a replacement for a banker or advisor?',
      answer: 'Ventura is designed to complement, not replace, professional advisors. Our platform provides data-driven insights and market-calibrated valuations that can inform your conversations with bankers, lawyers, and M&A advisors. For significant transactions, we recommend working with qualified professionals alongside our tools.'
    },
    {
      question: 'How accurate are the valuations?',
      answer: 'Our valuation models are built specifically for SaaS and AI startups, using revenue multiples calibrated against recent market transactions. While no valuation is definitive until a deal closes, our methodology provides institutional-grade estimates that align with how VCs and strategic buyers evaluate companies.'
    },
    {
      question: 'Can I share reports with investors?',
      answer: 'Yes. Pro plan users can generate shareable links and export investor-grade PDF reports. These are designed to be presentation-ready for board meetings, investor discussions, and due diligence processes.'
    },
    {
      question: 'Is my data confidential?',
      answer: 'Absolutely. Your financial data is encrypted at rest and in transit. We do not share, sell, or use your company data to train models. Each valuation is processed in isolation, and you can delete your data at any time.'
    },
    {
      question: 'Can I cancel anytime?',
      answer: 'Yes. All subscriptions can be cancelled at any time with no penalties. You will retain access until the end of your current billing period. One-time reports remain accessible indefinitely.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0A]" data-testid="pricing-page">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0A0A0A]/95 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24">
          <div className="flex items-center justify-between h-16 md:h-20">
            <Link to="/" className="flex items-center gap-3 group">
              <VLogo size="sm" />
              <span className="text-xl font-bold tracking-tight text-white group-hover:text-[#3D5AFE] transition-colors">
                Ventura
              </span>
            </Link>
            <div className="flex items-center gap-4">
              <Link to="/" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">
                Home
              </Link>
              <Button 
                onClick={login}
                className="bg-[#3D5AFE] hover:bg-[#536DFE] text-white shadow-lg shadow-[#3D5AFE]/25"
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-6 md:px-12 lg:px-24">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight mb-6"
          >
            Simple, transparent pricing
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg md:text-xl text-[#BFC5D2] max-w-2xl mx-auto"
          >
            Professional valuation and exit insights for modern startups.
          </motion.p>

          {/* Billing Toggle */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-10 flex items-center justify-center gap-4"
          >
            <span className={`text-sm font-medium ${!isAnnual ? 'text-white' : 'text-gray-500'}`}>
              Monthly
            </span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className={`relative w-14 h-7 rounded-full transition-colors ${
                isAnnual ? 'bg-[#3D5AFE]' : 'bg-gray-700'
              }`}
              data-testid="billing-toggle"
            >
              <span 
                className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-transform ${
                  isAnnual ? 'translate-x-8' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`text-sm font-medium ${isAnnual ? 'text-white' : 'text-gray-500'}`}>
              Annual
            </span>
            {isAnnual && (
              <span className="text-xs font-medium text-[#3D5AFE] bg-[#3D5AFE]/10 px-2 py-1 rounded-full">
                2 months free
              </span>
            )}
          </motion.div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-24 px-6 md:px-12 lg:px-24">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                className={`relative rounded-2xl p-8 ${
                  plan.popular 
                    ? 'bg-gradient-to-b from-[#3D5AFE]/20 to-[#0A0A0A] border-2 border-[#3D5AFE] shadow-xl shadow-[#3D5AFE]/20' 
                    : 'bg-[#111111] border border-white/10'
                }`}
                data-testid={`pricing-card-${plan.name.toLowerCase()}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-[#3D5AFE] text-white text-xs font-bold uppercase tracking-wider px-4 py-1.5 rounded-full shadow-lg shadow-[#3D5AFE]/30">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-sm font-bold text-[#3D5AFE] uppercase tracking-wider mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-[#BFC5D2] text-sm">{plan.tagline}</p>
                </div>

                <div className="mb-8">
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-bold text-white">{plan.price}€</span>
                    {plan.period !== 'one-time' && (
                      <span className="text-[#BFC5D2]">/ {plan.period}</span>
                    )}
                  </div>
                  {plan.period === 'one-time' && (
                    <p className="text-sm text-[#BFC5D2] mt-1">One-time report</p>
                  )}
                  {isAnnual && plan.period === 'month' && (
                    <p className="text-sm text-[#3D5AFE] mt-1">
                      Billed annually ({plan.price * 12}€/year)
                    </p>
                  )}
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-[#3D5AFE] flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-[#BFC5D2]">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={login}
                  className={`w-full py-6 font-medium transition-all ${
                    plan.popular
                      ? 'bg-[#3D5AFE] hover:bg-[#536DFE] text-white shadow-lg shadow-[#3D5AFE]/30 hover:shadow-xl hover:shadow-[#3D5AFE]/40'
                      : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                  }`}
                  data-testid={`cta-${plan.name.toLowerCase()}`}
                >
                  {plan.cta}
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-20 px-6 md:px-12 lg:px-24 border-t border-white/10">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">
              Built for high-stakes decisions
            </h2>
            <p className="text-[#BFC5D2] leading-relaxed mb-8">
              Ventura is designed to support high-stakes financial decisions. 
              Our AI models are built specifically for SaaS and AI startups — not generic businesses. 
              Every valuation is grounded in real market data and institutional-grade methodology.
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
              <span className="w-2 h-2 rounded-full bg-[#3D5AFE]"></span>
              Trusted by founders & operators
            </div>
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-6 md:px-12 lg:px-24 bg-[#111111]">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Frequently asked questions
            </h2>
            <p className="text-[#BFC5D2]">
              Everything you need to know about Ventura.
            </p>
          </motion.div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="border border-white/10 rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
                  data-testid={`faq-${index}`}
                >
                  <span className="font-medium text-white pr-4">{faq.question}</span>
                  {openFaq === index ? (
                    <ChevronUp className="w-5 h-5 text-[#3D5AFE] flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />
                  )}
                </button>
                {openFaq === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="px-6 pb-5"
                  >
                    <p className="text-[#BFC5D2] leading-relaxed">{faq.answer}</p>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 md:px-12 lg:px-24">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to know your value?
            </h2>
            <p className="text-[#BFC5D2] mb-8 max-w-xl mx-auto">
              Join founders who use Ventura to make informed decisions about their company's future.
            </p>
            <Button
              onClick={login}
              size="lg"
              className="bg-[#3D5AFE] hover:bg-[#536DFE] text-white px-8 py-6 text-lg shadow-xl shadow-[#3D5AFE]/30 hover:shadow-2xl hover:shadow-[#3D5AFE]/40 transition-all"
              data-testid="final-cta"
            >
              Get started for free
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 md:px-12 lg:px-24 border-t border-white/10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <VLogo size="sm" />
            <span className="text-lg font-bold text-white">Ventura</span>
          </div>
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} Ventura. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-sm text-gray-500">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PricingPage;
