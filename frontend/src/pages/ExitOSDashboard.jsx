import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import { Button } from '../components/ui/button';
import { 
  ArrowLeft, 
  TrendingUp, 
  Target, 
  BarChart3, 
  Zap,
  FileText,
  Calendar,
  ChevronRight,
  Activity
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const API = process.env.REACT_APP_BACKEND_URL + "/api";

const ExitOSDashboard = () => {
  const { projectId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [valuations, setValuations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjectData();
  }, [projectId]);

  const fetchProjectData = async () => {
    try {
      const [projectRes, valuationsRes] = await Promise.all([
        fetch(`${API}/projects/${projectId}`, { credentials: 'include' }),
        fetch(`${API}/valuations?project_id=${projectId}`, { credentials: 'include' })
      ]);

      if (projectRes.ok) {
        setProject(await projectRes.json());
      } else {
        toast.error('Project not found');
        navigate('/dashboard');
        return;
      }

      if (valuationsRes.ok) {
        setValuations(await valuationsRes.json());
      }
    } catch (error) {
      toast.error('Failed to load project data');
    }
    setLoading(false);
  };

  const formatCurrency = (value) => {
    if (!value || value === 0) return '$0';
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${Math.round(value)}`;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Get latest valuation
  const latestValuation = valuations[0] || null;
  const currentValue = latestValuation?.result?.base || 0;
  const exitReadinessScore = latestValuation ? 52 : null; // Placeholder

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC]">
        <div className="py-12 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-[#0B4DBB] border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]" data-testid="exit-os-dashboard">

      <main className="py-8 px-6 md:px-8 lg:px-12 max-w-[1400px] mx-auto">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link 
            to="/dashboard" 
            className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-[#0B4DBB] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
        </div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0B4DBB] to-[#1E6AE1] flex items-center justify-center">
                  <Activity className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Exit OS Dashboard</p>
                  <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
                    {project?.name}
                  </h1>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link to={`/valuation/new/${projectId}`}>
                <Button variant="outline" className="border-slate-200">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  {valuations.length > 0 ? 'Update Valuation' : 'Start Valuation'}
                </Button>
              </Link>
              {latestValuation && (
                <Link to={`/valuation/${latestValuation.valuation_id}`}>
                  <Button className="bg-[#0B4DBB] hover:bg-[#093c96]">
                    <FileText className="w-4 h-4 mr-2" />
                    View Report
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </motion.div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Current Valuation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl border border-slate-200 p-5"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-lg bg-[#F0F7FF] flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-[#0B4DBB]" />
              </div>
              <span className="text-sm text-slate-500">Current Valuation</span>
            </div>
            <p className="text-2xl font-bold text-slate-900 tabular-nums">
              {currentValue > 0 ? formatCurrency(currentValue) : '-'}
            </p>
          </motion.div>

          {/* Exit Readiness */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-white rounded-xl border border-slate-200 p-5"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center">
                <Target className="w-4 h-4 text-amber-600" />
              </div>
              <span className="text-sm text-slate-500">Exit Readiness</span>
            </div>
            <div className="flex items-baseline gap-1">
              <p className="text-2xl font-bold text-slate-900 tabular-nums">
                {exitReadinessScore ?? '-'}
              </p>
              {exitReadinessScore && <span className="text-sm text-slate-400">/100</span>}
            </div>
          </motion.div>

          {/* Valuations Count */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl border border-slate-200 p-5"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center">
                <BarChart3 className="w-4 h-4 text-purple-600" />
              </div>
              <span className="text-sm text-slate-500">Valuations</span>
            </div>
            <p className="text-2xl font-bold text-slate-900 tabular-nums">
              {valuations.length}
            </p>
          </motion.div>

          {/* Last Updated */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="bg-white rounded-xl border border-slate-200 p-5"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center">
                <Calendar className="w-4 h-4 text-emerald-600" />
              </div>
              <span className="text-sm text-slate-500">Last Updated</span>
            </div>
            <p className="text-lg font-semibold text-slate-900">
              {formatDate(latestValuation?.created_at || project?.updated_at)}
            </p>
          </motion.div>
        </div>

        {/* Main Content Area */}
        {valuations.length === 0 ? (
          /* No Valuations State */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl border border-slate-200 p-8 md:p-12 text-center"
          >
            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-[#F0F7FF] flex items-center justify-center">
              <Zap className="w-8 h-8 text-[#0B4DBB]" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">
              No valuations yet
            </h2>
            <p className="text-slate-600 mb-6 max-w-md mx-auto">
              Create your first valuation to unlock the full Exit OS dashboard with insights, 
              readiness tracking, and optimization recommendations.
            </p>
            <Link to={`/valuation/new/${projectId}`}>
              <Button size="lg" className="bg-[#0B4DBB] hover:bg-[#093c96]">
                <TrendingUp className="w-4 h-4 mr-2" />
                Start First Valuation
              </Button>
            </Link>
          </motion.div>
        ) : (
          /* Has Valuations - Show Dashboard Sections */
          <div className="space-y-6">
            {/* Valuation History */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl border border-slate-200 p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-slate-900">Valuation History</h2>
                <Link 
                  to={`/valuation/new/${projectId}`}
                  className="text-sm text-[#0B4DBB] hover:underline flex items-center gap-1"
                >
                  Add new <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
              
              <div className="space-y-3">
                {valuations.slice(0, 5).map((val, index) => (
                  <Link
                    key={val.valuation_id}
                    to={`/valuation/${val.valuation_id}`}
                    className="flex items-center justify-between p-4 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-sm font-medium text-slate-600">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">
                          {val.company_info?.company_name || 'Valuation'}
                        </p>
                        <p className="text-sm text-slate-500">
                          {formatDate(val.created_at)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-lg font-bold text-slate-900 tabular-nums">
                        {formatCurrency(val.result?.base || 0)}
                      </span>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#0B4DBB] transition-colors" />
                    </div>
                  </Link>
                ))}
              </div>
            </motion.div>

            {/* Coming Soon Sections */}
            <div className="grid md:grid-cols-2 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-xl border border-slate-200 border-dashed p-6"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center">
                    <Target className="w-4 h-4 text-slate-400" />
                  </div>
                  <h3 className="font-semibold text-slate-400">Exit Readiness Tracker</h3>
                </div>
                <p className="text-sm text-slate-400">
                  Track your progress toward exit-readiness across key dimensions.
                </p>
                <span className="inline-block mt-3 px-2 py-1 bg-slate-100 text-slate-500 text-xs font-medium rounded">
                  Coming Soon
                </span>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
                className="bg-white rounded-xl border border-slate-200 border-dashed p-6"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center">
                    <Zap className="w-4 h-4 text-slate-400" />
                  </div>
                  <h3 className="font-semibold text-slate-400">Optimization Insights</h3>
                </div>
                <p className="text-sm text-slate-400">
                  AI-powered recommendations to increase your valuation.
                </p>
                <span className="inline-block mt-3 px-2 py-1 bg-slate-100 text-slate-500 text-xs font-medium rounded">
                  Coming Soon
                </span>
              </motion.div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ExitOSDashboard;
