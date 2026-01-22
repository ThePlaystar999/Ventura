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

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 md:pt-40 md:pb-32 overflow-hidden" data-testid="hero-section">
        {/* Wave Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-white via-[#F8FAFC] to-[#DCEAFF]"></div>
        <div className="absolute bottom-0 left-0 right-0 h-40">
          <svg viewBox="0 0 1440 320" preserveAspectRatio="none" className="w-full h-full">
            <path 
              fill="#A7C8FF" 
              fillOpacity="0.3" 
              d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,218.7C672,235,768,245,864,229.3C960,213,1056,171,1152,160C1248,149,1344,171,1392,181.3L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
            />
          </svg>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-32">
          <svg viewBox="0 0 1440 320" preserveAspectRatio="none" className="w-full h-full">
            <path 
              fill="#0B4DBB" 
              fillOpacity="0.05" 
              d="M0,160L48,170.7C96,181,192,203,288,197.3C384,192,480,160,576,149.3C672,139,768,149,864,165.3C960,181,1056,203,1152,197.3C1248,192,1344,160,1392,144L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
            />
          </svg>
        </div>

        <div className="relative max-w-7xl mx-auto px-6 md:px-12 lg:px-24 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Large V Logo */}
            <div className="flex justify-center mb-8">
              <VLogo size="hero" />
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 mb-6">
              Know your value.<br />
              <span className="text-[#0B4DBB]">Plan your exit.</span>
            </h1>

            <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
              AI-powered startup valuation & exit modeling for founders and investors.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button 
                onClick={login}
                size="lg"
                className="bg-[#0B4DBB] hover:bg-[#093c96] text-white px-8 py-6 text-lg shadow-lg shadow-blue-900/25 hover:shadow-xl hover:shadow-blue-900/30 transition-all"
                data-testid="hero-get-valued-btn"
              >
                Get Valued
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button 
                variant="outline"
                size="lg"
                onClick={() => document.getElementById('services').scrollIntoView({ behavior: 'smooth' })}
                className="border-[#EEF2F7] bg-white hover:bg-[#F0F7FF] text-slate-700 px-8 py-6 text-lg"
                data-testid="hero-how-it-works-btn"
              >
                How it Works
              </Button>
            </div>
          </motion.div>
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
                className="service-card bg-white border border-[#EEF2F7] rounded-xl p-8 text-center"
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
      <section id="about" className="py-20 md:py-32 bg-gradient-to-b from-[#F8FAFC] to-white" data-testid="about-section">
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
              <div className="aspect-video rounded-2xl overflow-hidden shadow-2xl shadow-blue-900/10">
                <img 
                  src="https://images.pexels.com/photos/260689/pexels-photo-260689.jpeg" 
                  alt="Modern office" 
                  className="w-full h-full object-cover"
                />
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
