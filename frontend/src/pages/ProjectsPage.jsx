import React from 'react';
import AppLayout from '../components/AppLayout';
import { FolderKanban, Plus, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const ProjectsPage = () => {
  return (
    <AppLayout>
      <div className="p-6 md:p-8 lg:p-12 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16"
        >
          <div className="w-20 h-20 rounded-2xl bg-[#F0F7FF] flex items-center justify-center mx-auto mb-6">
            <FolderKanban className="w-10 h-10 text-[#0B4DBB]" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-3">Projects</h1>
          <p className="text-slate-600 max-w-md mx-auto mb-8">
            Manage all your startup projects in one place. Track valuations, compare progress, and organize your portfolio.
          </p>
          
          <div className="bg-gradient-to-br from-slate-50 to-white border border-slate-200 rounded-2xl p-8 max-w-lg mx-auto">
            <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full w-fit mx-auto mb-4">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              Coming Soon
            </div>
            <p className="text-slate-500 text-sm mb-6">
              This dedicated projects view is under development. For now, you can manage your projects from the Dashboard.
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

export default ProjectsPage;
