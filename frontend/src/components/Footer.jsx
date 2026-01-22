import React from 'react';
import VLogo from './VLogo';

const Footer = () => {
  return (
    <footer className="bg-gradient-to-b from-white to-[#F0F7FF] pt-16 pb-8" data-testid="footer">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24">
        <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-12">
          {/* Logo & Description */}
          <div className="max-w-sm">
            <div className="flex items-center gap-3 mb-4">
              <VLogo size="sm" />
              <span className="text-xl font-bold tracking-tight text-slate-900">Ventura</span>
            </div>
            <p className="text-slate-600 text-sm leading-relaxed">
              AI-powered startup valuation and exit modeling. Know your value, plan your exit.
            </p>
          </div>

          {/* Links */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8 md:gap-16">
            <div>
              <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">Product</h4>
              <ul className="space-y-3">
                <li><a href="#services" className="text-sm text-slate-600 hover:text-[#0B4DBB] transition-colors">Features</a></li>
                <li><a href="#" className="text-sm text-slate-600 hover:text-[#0B4DBB] transition-colors">Pricing</a></li>
                <li><a href="#" className="text-sm text-slate-600 hover:text-[#0B4DBB] transition-colors">API</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">Company</h4>
              <ul className="space-y-3">
                <li><a href="#about" className="text-sm text-slate-600 hover:text-[#0B4DBB] transition-colors">About</a></li>
                <li><a href="#" className="text-sm text-slate-600 hover:text-[#0B4DBB] transition-colors">Blog</a></li>
                <li><a href="#contact" className="text-sm text-slate-600 hover:text-[#0B4DBB] transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">Legal</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-sm text-slate-600 hover:text-[#0B4DBB] transition-colors">Privacy</a></li>
                <li><a href="#" className="text-sm text-slate-600 hover:text-[#0B4DBB] transition-colors">Terms</a></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-[#EEF2F7] pt-8">
          <p className="text-center text-sm text-slate-500">
            &copy; {new Date().getFullYear()} Ventura. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
