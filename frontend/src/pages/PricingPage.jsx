import React, { useState } from 'react';
import { useAuth } from '../App';
import Navbar from '../components/Navbar';
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
    <div className="min-h-screen bg-white" data-testid="pricing-page">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-6 md:px-12 lg:px-24 bg-gradient-to-b from-white to-[#F8FAFC]">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 tracking-tight mb-6"
          >
            Simple, transparent pricing
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto"
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
            <span className={`text-sm font-medium ${!isAnnual ? 'text-slate-900' : 'text-slate-400'}`}>
              Monthly
            </span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className={`relative w-14 h-7 rounded-full transition-colors ${
                isAnnual ? 'bg-[#0B4DBB]' : 'bg-slate-300'
              }`}
              data-testid="billing-toggle"
            >
              <span 
                className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                  isAnnual ? 'translate-x-8' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`text-sm font-medium ${isAnnual ? 'text-slate-900' : 'text-slate-400'}`}>
              Annual
            </span>
            {isAnnual && (
              <span className="text-xs font-medium text-[#0B4DBB] bg-[#DCEAFF] px-3 py-1 rounded-full">
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
                    ? 'bg-gradient-to-b from-[#F0F7FF] to-white border-2 border-[#0B4DBB] shadow-xl shadow-blue-900/10' 
                    : 'bg-white border border-[#EEF2F7] shadow-sm'
                }`}
                data-testid={`pricing-card-${plan.name.toLowerCase()}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-[#0B4DBB] text-white text-xs font-bold uppercase tracking-wider px-4 py-1.5 rounded-full shadow-lg shadow-blue-900/20">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-sm font-bold text-[#0B4DBB] uppercase tracking-wider mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-slate-600 text-sm">{plan.tagline}</p>
                </div>

                <div className="mb-8">
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-bold text-slate-900">{plan.price}€</span>
                    {plan.period !== 'one-time' && (
                      <span className="text-slate-500">/ {plan.period}</span>
                    )}
                  </div>
                  {plan.period === 'one-time' && (
                    <p className="text-sm text-slate-500 mt-1">One-time report</p>
                  )}
                  {isAnnual && plan.period === 'month' && (
                    <p className="text-sm text-[#0B4DBB] mt-1">
                      Billed annually ({plan.price * 12}€/year)
                    </p>
                  )}
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-[#0B4DBB] flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-slate-600">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={login}
                  className={`w-full py-6 font-medium transition-all ${
                    plan.popular
                      ? 'bg-[#0B4DBB] hover:bg-[#093c96] text-white shadow-lg shadow-blue-900/20'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
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
      <section className="py-20 px-6 md:px-12 lg:px-24 bg-[#F8FAFC] border-t border-[#EEF2F7]">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-6">
              Built for high-stakes decisions
            </h2>
            <p className="text-slate-600 leading-relaxed mb-8">
              Ventura is designed to support high-stakes financial decisions. 
              Our AI models are built specifically for SaaS and AI startups — not generic businesses. 
              Every valuation is grounded in real market data and institutional-grade methodology.
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
              <span className="w-2 h-2 rounded-full bg-[#0B4DBB]"></span>
              Trusted by founders & operators
            </div>
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-6 md:px-12 lg:px-24 bg-white">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">
              Frequently asked questions
            </h2>
            <p className="text-slate-600">
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
                className="border border-[#EEF2F7] rounded-xl overflow-hidden bg-white"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-[#F8FAFC] transition-colors"
                  data-testid={`faq-${index}`}
                >
                  <span className="font-medium text-slate-900 pr-4">{faq.question}</span>
                  {openFaq === index ? (
                    <ChevronUp className="w-5 h-5 text-[#0B4DBB] flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400 flex-shrink-0" />
                  )}
                </button>
                {openFaq === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="px-6 pb-5"
                  >
                    <p className="text-slate-600 leading-relaxed">{faq.answer}</p>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 md:px-12 lg:px-24 bg-gradient-to-b from-[#F8FAFC] to-[#DCEAFF]">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
              Ready to know your value?
            </h2>
            <p className="text-slate-600 mb-8 max-w-xl mx-auto">
              Join founders who use Ventura to make informed decisions about their company's future.
            </p>
            <Button
              onClick={login}
              size="lg"
              className="bg-[#0B4DBB] hover:bg-[#093c96] text-white px-8 py-6 text-lg shadow-xl shadow-blue-900/20"
              data-testid="final-cta"
            >
              Get started for free
            </Button>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default PricingPage;
