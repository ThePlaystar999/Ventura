import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../App';
import VLogo from './VLogo';
import { Button } from './ui/button';
import { LogOut, LayoutDashboard, Plus } from 'lucide-react';

const Navbar = ({ transparent = false }) => {
  const { user, login, logout } = useAuth();
  const location = useLocation();
  const isLanding = location.pathname === '/';
  const isPricing = location.pathname === '/pricing';
  const isAbout = location.pathname === '/about';
  const isValuation = location.pathname === '/valuation';

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        transparent ? 'bg-transparent' : 'bg-white/95 backdrop-blur-md border-b border-[#EEF2F7]'
      }`}
      data-testid="navbar"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group" data-testid="navbar-logo">
            <VLogo size="md" />
            <span className="text-2xl font-bold tracking-tight text-slate-900 group-hover:text-[#0B4DBB] transition-colors">
              Ventura
            </span>
          </Link>

          {/* Navigation Links - Show for all users */}
          <div className="hidden md:flex items-center gap-8">
            <Link 
              to="/valuation" 
              className={`text-sm font-medium transition-colors ${
                isValuation ? 'text-[#0B4DBB]' : 'text-slate-600 hover:text-[#0B4DBB]'
              }`}
              data-testid="nav-valuation"
            >
              Valuation
            </Link>
            <Link 
              to="/about" 
              className={`text-sm font-medium transition-colors ${
                isAbout ? 'text-[#0B4DBB]' : 'text-slate-600 hover:text-[#0B4DBB]'
              }`}
              data-testid="nav-about"
            >
              About
            </Link>
            <Link 
              to="/pricing" 
              className={`text-sm font-medium transition-colors ${
                isPricing ? 'text-[#0B4DBB]' : 'text-slate-600 hover:text-[#0B4DBB]'
              }`}
              data-testid="nav-pricing"
            >
              Pricing
            </Link>
            {isLanding && (
              <a 
                href="#contact" 
                className="text-sm font-medium text-slate-600 hover:text-[#0B4DBB] transition-colors"
                data-testid="nav-contact"
              >
                Contact
              </a>
            )}
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Link to="/dashboard">
                  <Button 
                    variant="ghost" 
                    className="hidden md:flex items-center gap-2 text-slate-600 hover:text-[#0B4DBB] hover:bg-blue-50"
                    data-testid="nav-dashboard-btn"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </Button>
                </Link>
                <Link to="/valuation/new">
                  <Button 
                    className="bg-[#0B4DBB] hover:bg-[#093c96] text-white shadow-lg shadow-blue-900/20"
                    data-testid="nav-new-valuation-btn"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    New Valuation
                  </Button>
                </Link>
                <Button 
                  variant="ghost" 
                  onClick={logout}
                  className="text-slate-600 hover:text-red-600 hover:bg-red-50"
                  data-testid="nav-logout-btn"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <>
                <Button 
                  variant="ghost"
                  onClick={login}
                  className="text-slate-600 hover:text-[#0B4DBB] hover:bg-blue-50"
                  data-testid="nav-login-btn"
                >
                  Sign In
                </Button>
                <Button 
                  onClick={login}
                  className="bg-[#0B4DBB] hover:bg-[#093c96] text-white shadow-lg shadow-blue-900/20"
                  data-testid="nav-get-started-btn"
                >
                  Get Started
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
