import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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

// Typewriter component
const TypewriterText = ({ text, delay = 50 }) => {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, delay);
      return () => clearTimeout(timeout);
    } else {
      setIsComplete(true);
    }
  }, [currentIndex, text, delay]);

  return (
    <span className="inline-block">
      {displayText}
      {!isComplete && (
        <span className="inline-block w-[3px] h-[1em] bg-[#0B4DBB] ml-1 animate-pulse" />
      )}
    </span>
  );
};

const LandingPage = () => {
  const { login } = useAuth();
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [showTypewriter, setShowTypewriter] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowTypewriter(true), 800);
    return () => clearTimeout(timer);
  }, []);

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
