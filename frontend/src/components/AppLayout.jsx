import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../App';
import VLogo from './VLogo';
import { Button } from './ui/button';
import { 
  LayoutDashboard, 
  FolderKanban, 
  TrendingUp, 
  FileBarChart, 
  Target, 
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const sidebarItems = [
  { 
    id: 'dashboard', 
    label: 'Dashboard', 
    icon: LayoutDashboard, 
    path: '/dashboard',
    description: 'Overview & insights'
  },
  { 
    id: 'projects', 
    label: 'Projects', 
    icon: FolderKanban, 
    path: '/projects',
    description: 'Manage projects'
  },
  { 
    id: 'valuations', 
    label: 'Valuations', 
    icon: TrendingUp, 
    path: '/valuations',
    description: 'All valuations'
  },
  { 
    id: 'reports', 
    label: 'Reports', 
    icon: FileBarChart, 
    path: '/reports',
    description: 'Export & share'
  },
  { 
    id: 'exit-score', 
    label: 'Exit Score', 
    icon: Target, 
    path: '/exit-score',
    description: 'Readiness analysis'
  },
  { 
    id: 'settings', 
    label: 'Settings', 
    icon: Settings, 
    path: '/settings',
    description: 'Account settings'
  },
];

const AppLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const isActive = (path) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(path);
  };

  const SidebarContent = ({ mobile = false }) => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={`flex items-center gap-3 px-4 py-5 border-b border-slate-100 ${collapsed && !mobile ? 'justify-center' : ''}`}>
        <Link to="/dashboard" className="flex items-center gap-3 group" onClick={() => mobile && setSidebarOpen(false)}>
          <VLogo size="sm" />
          {(!collapsed || mobile) && (
            <span className="text-lg font-bold tracking-tight text-slate-900 group-hover:text-[#0B4DBB] transition-colors">
              Ventura
            </span>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <Link
              key={item.id}
              to={item.path}
              onClick={() => mobile && setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group relative ${
                active 
                  ? 'bg-[#F0F7FF] text-[#0B4DBB]' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              } ${collapsed && !mobile ? 'justify-center' : ''}`}
              data-testid={`sidebar-${item.id}`}
            >
              <Icon className={`w-5 h-5 flex-shrink-0 ${active ? 'text-[#0B4DBB]' : 'text-slate-400 group-hover:text-slate-600'}`} />
              {(!collapsed || mobile) && (
                <>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium">{item.label}</span>
                    {mobile && (
                      <p className="text-xs text-slate-400 truncate">{item.description}</p>
                    )}
                  </div>
                  {active && (
                    <div className="w-1.5 h-1.5 rounded-full bg-[#0B4DBB]" />
                  )}
                </>
              )}
              
              {/* Tooltip for collapsed state */}
              {collapsed && !mobile && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-slate-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                  {item.label}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div className={`border-t border-slate-100 px-3 py-4 ${collapsed && !mobile ? 'flex justify-center' : ''}`}>
        {(!collapsed || mobile) ? (
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-slate-50">
            <div className="w-8 h-8 rounded-full bg-[#0B4DBB] flex items-center justify-center text-white text-sm font-medium">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">{user?.name || 'User'}</p>
              <p className="text-xs text-slate-500 truncate">{user?.email || ''}</p>
            </div>
            <button 
              onClick={logout}
              className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button 
            onClick={logout}
            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Collapse button - desktop only */}
      {!mobile && (
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 w-6 h-6 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:border-slate-300 transition-colors shadow-sm"
        >
          <ChevronRight className={`w-4 h-4 transition-transform ${collapsed ? '' : 'rotate-180'}`} />
        </button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-slate-200">
        <div className="flex items-center justify-between px-4 h-16">
          <Link to="/dashboard" className="flex items-center gap-2">
            <VLogo size="sm" />
            <span className="text-lg font-bold text-slate-900">Ventura</span>
          </Link>
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
            data-testid="mobile-menu-btn"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-black/50 z-40"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 w-[280px] bg-white z-50 shadow-xl"
              data-testid="mobile-sidebar"
            >
              <button
                onClick={() => setSidebarOpen(false)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
              <SidebarContent mobile />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside 
        className={`hidden lg:block fixed left-0 top-0 bottom-0 bg-white border-r border-slate-200 transition-all duration-300 z-30 ${
          collapsed ? 'w-[72px]' : 'w-[260px]'
        }`}
        data-testid="desktop-sidebar"
      >
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <main 
        className={`transition-all duration-300 ${
          collapsed ? 'lg:ml-[72px]' : 'lg:ml-[260px]'
        } pt-16 lg:pt-0`}
      >
        {children}
      </main>
    </div>
  );
};

export default AppLayout;
