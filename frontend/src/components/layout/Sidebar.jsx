import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../App';
import VLogo from '../VLogo';
import { 
  LayoutDashboard, 
  Plus, 
  FileText, 
  Settings, 
  LogOut, 
  ChevronLeft,
  ChevronRight,
  Compass,
  TrendingUp,
  FolderOpen,
  HelpCircle,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Sidebar = ({ collapsed, onToggle }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard' || location.pathname.startsWith('/projects/');
    }
    return location.pathname.startsWith(path);
  };

  const navItems = [
    {
      label: 'Dashboard',
      icon: LayoutDashboard,
      path: '/dashboard',
      testId: 'sidebar-dashboard'
    },
    {
      label: 'New Valuation',
      icon: Plus,
      path: '/valuation/new',
      testId: 'sidebar-new-valuation',
      highlight: true
    },
    {
      label: 'Exit OS',
      icon: Compass,
      path: '/dashboard',
      testId: 'sidebar-exit-os',
      badge: 'NEW'
    }
  ];

  const secondaryItems = [
    {
      label: 'Pricing',
      icon: Zap,
      path: '/pricing',
      testId: 'sidebar-pricing'
    },
    {
      label: 'Help',
      icon: HelpCircle,
      path: '#',
      testId: 'sidebar-help'
    }
  ];

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 72 : 260 }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      className="fixed left-0 top-0 h-screen bg-white border-r border-slate-200 z-50 flex flex-col"
      data-testid="sidebar"
    >
      {/* Header */}
      <div className="h-20 flex items-center justify-between px-4 border-b border-slate-100">
        <Link to="/dashboard" className="flex items-center gap-3 overflow-hidden">
          <VLogo size="sm" />
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                className="text-xl font-bold tracking-tight text-slate-900 whitespace-nowrap"
              >
                Ventura
              </motion.span>
            )}
          </AnimatePresence>
        </Link>
        
        <button
          onClick={onToggle}
          className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-700 transition-colors"
          data-testid="sidebar-toggle"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <Link
              key={item.path + item.label}
              to={item.path}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group relative
                ${active 
                  ? 'bg-[#0B4DBB] text-white shadow-md shadow-blue-900/20' 
                  : item.highlight 
                    ? 'bg-[#F0F7FF] text-[#0B4DBB] hover:bg-[#E0EFFF]'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }
              `}
              data-testid={item.testId}
            >
              <Icon className={`w-5 h-5 flex-shrink-0 ${active ? 'text-white' : item.highlight ? 'text-[#0B4DBB]' : ''}`} />
              
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="text-sm font-medium whitespace-nowrap"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>

              {/* Badge */}
              {item.badge && !collapsed && (
                <span className="ml-auto px-1.5 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-600 rounded">
                  {item.badge}
                </span>
              )}

              {/* Tooltip for collapsed state */}
              {collapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-slate-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity">
                  {item.label}
                </div>
              )}
            </Link>
          );
        })}

        {/* Divider */}
        <div className="my-4 border-t border-slate-100" />

        {/* Secondary Navigation */}
        {secondaryItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <Link
              key={item.path + item.label}
              to={item.path}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group relative
                ${active 
                  ? 'bg-slate-100 text-slate-900' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                }
              `}
              data-testid={item.testId}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="text-sm font-medium whitespace-nowrap"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>

              {/* Tooltip for collapsed state */}
              {collapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-slate-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity">
                  {item.label}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="p-3 border-t border-slate-100">
        {user && (
          <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
            {/* Avatar */}
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#0B4DBB] to-[#1E6AE1] flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
              {user.name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            
            <AnimatePresence>
              {!collapsed && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="flex-1 min-w-0"
                >
                  <p className="text-sm font-medium text-slate-900 truncate">
                    {user.name || 'User'}
                  </p>
                  <p className="text-xs text-slate-500 truncate">
                    {user.email}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {!collapsed && (
              <button
                onClick={logout}
                className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                data-testid="sidebar-logout"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        {/* Collapsed logout button */}
        {collapsed && (
          <button
            onClick={logout}
            className="w-full mt-2 p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors flex items-center justify-center group relative"
            data-testid="sidebar-logout-collapsed"
          >
            <LogOut className="w-4 h-4" />
            <div className="absolute left-full ml-2 px-2 py-1 bg-slate-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity">
              Logout
            </div>
          </button>
        )}
      </div>
    </motion.aside>
  );
};

export default Sidebar;
