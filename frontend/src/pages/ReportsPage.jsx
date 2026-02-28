import React from 'react';
import AppLayout from '../components/AppLayout';
import { FileBarChart, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const ReportsPage = () => {
  return (
    <AppLayout>
      <div className="p-6 md:p-8 lg:p-12 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16"
        >
          <div className="w-20 h-20 rounded-2xl bg-[#F0F7FF] flex items-center justify-center mx-auto mb-6">
            <FileBarChart className="w-10 h-10 text-[#0B4DBB]" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-3">Reports</h1>
          <p className="text-slate-600 max-w-md mx-auto mb-8">
            Generate professional PDF reports, share valuations with investors, and export your data for presentations.
          </p>
          
          <div className="bg-gradient-to-br from-slate-50 to-white border border-slate-200 rounded-2xl p-8 max-w-lg mx-auto">
            <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full w-fit mx-auto mb-4">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              Coming Soon
            </div>
            <p className="text-slate-500 text-sm mb-6">
              Advanced reporting features are under development. You can download PDF reports from individual valuation result pages.
            </p>
            <Link to="/dashboard">
              <Button className="bg-[#0B4DBB] hover:bg-[#093c96]">
                Go to Dashboard
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </AppLayout>
  );
};

export default ReportsPage;
