import React from 'react';
import AppLayout from '../components/AppLayout';
import { Settings, ArrowRight, User, Bell, Shield, CreditCard } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../App';

const SettingsPage = () => {
  const { user } = useAuth();

  return (
    <AppLayout>
      <div className="p-6 md:p-8 lg:p-12 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">Settings</h1>
            <p className="text-slate-600">Manage your account and preferences</p>
          </div>

          {/* Profile Section */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-[#0B4DBB] flex items-center justify-center text-white text-2xl font-bold">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900">{user?.name || 'User'}</h2>
                <p className="text-slate-500">{user?.email || 'No email'}</p>
              </div>
            </div>
            <div className="text-sm text-slate-500">
              Signed in via Google OAuth
            </div>
          </div>

          {/* Settings Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Account */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 hover:border-slate-300 transition-colors">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="font-semibold text-slate-900">Account</h3>
              </div>
              <p className="text-sm text-slate-500 mb-4">Manage your profile and preferences</p>
              <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 px-2 py-1 rounded w-fit">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                Coming Soon
              </div>
            </div>

            {/* Notifications */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 hover:border-slate-300 transition-colors">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                  <Bell className="w-5 h-5 text-purple-600" />
                </div>
                <h3 className="font-semibold text-slate-900">Notifications</h3>
              </div>
              <p className="text-sm text-slate-500 mb-4">Configure email and in-app alerts</p>
              <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 px-2 py-1 rounded w-fit">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                Coming Soon
              </div>
            </div>

            {/* Security */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 hover:border-slate-300 transition-colors">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-emerald-600" />
                </div>
                <h3 className="font-semibold text-slate-900">Security</h3>
              </div>
              <p className="text-sm text-slate-500 mb-4">Manage security and access</p>
              <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 px-2 py-1 rounded w-fit">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                Coming Soon
              </div>
            </div>

            {/* Billing */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 hover:border-slate-300 transition-colors">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-amber-600" />
                </div>
                <h3 className="font-semibold text-slate-900">Billing</h3>
              </div>
              <p className="text-sm text-slate-500 mb-4">Manage subscription and payments</p>
              <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 px-2 py-1 rounded w-fit">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                Coming Soon
              </div>
            </div>
          </div>

          {/* Back to Dashboard */}
          <div className="mt-8 text-center">
            <Link to="/dashboard">
              <Button variant="outline" className="border-slate-200">
                Back to Dashboard
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </AppLayout>
  );
};

export default SettingsPage;
