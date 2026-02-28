import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/button';
import MiniSparkline from './MiniSparkline';
import { 
  Trash2, 
  ExternalLink, 
  Calendar, 
  TrendingUp,
  FileText,
  ArrowRight,
  MoreVertical
} from 'lucide-react';
import { motion } from 'framer-motion';

const ProjectCard = ({ 
  project, 
  valuations, 
  onDelete, 
  formatCurrency,
  formatDate 
}) => {
  // Get valuations for this project
  const projectValuations = valuations.filter(v => v.project_id === project.project_id);
  const hasValuations = projectValuations.length > 0;
  const latestValuation = projectValuations[0]; // Already sorted by date desc
  
  // Current valuation
  const currentValue = latestValuation?.result?.base || 0;
  
  // Exit readiness placeholder (would come from API)
  const exitReadinessScore = hasValuations ? 52 : null;
  
  // Get score color
  const getScoreColor = (score) => {
    if (!score) return 'text-slate-400';
    if (score >= 70) return 'text-emerald-600';
    if (score >= 50) return 'text-amber-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score) => {
    if (!score) return 'bg-slate-100';
    if (score >= 70) return 'bg-emerald-50';
    if (score >= 50) return 'bg-amber-50';
    return 'bg-red-50';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:border-slate-300 hover:shadow-md transition-all duration-200 group"
      data-testid={`project-card-${project.project_id}`}
    >
      {/* Card Header */}
      <div className="p-5">
        {/* Top row: Name + Delete */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-slate-900 truncate text-lg">
              {project.name}
            </h3>
            <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
              <Calendar className="w-3.5 h-3.5" />
              <span>Updated {formatDate(project.updated_at || project.created_at)}</span>
            </div>
          </div>
          
          <button
            onClick={() => onDelete(project.project_id)}
            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
            title="Delete project"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* Metrics Row */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {/* Current Valuation */}
          <div className="bg-slate-50 rounded-lg p-3">
            <p className="text-xs text-slate-500 mb-0.5">Current Valuation</p>
            {hasValuations ? (
              <p className="text-xl font-bold text-slate-900 tabular-nums">
                {formatCurrency(currentValue)}
              </p>
            ) : (
              <p className="text-sm text-slate-400">No valuation yet</p>
            )}
          </div>
          
          {/* Exit Readiness */}
          <div className={`rounded-lg p-3 ${getScoreBgColor(exitReadinessScore)}`}>
            <p className="text-xs text-slate-500 mb-0.5">Exit Readiness</p>
            {exitReadinessScore !== null ? (
              <div className="flex items-center gap-1.5">
                <span className={`text-xl font-bold tabular-nums ${getScoreColor(exitReadinessScore)}`}>
                  {exitReadinessScore}
                </span>
                <span className="text-xs text-slate-400">/100</span>
              </div>
            ) : (
              <p className="text-sm text-slate-400">—</p>
            )}
          </div>
        </div>

        {/* Sparkline */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400">Valuation Trend</span>
            {projectValuations.length > 0 && (
              <span className="text-xs text-slate-400">
                {projectValuations.length} valuation{projectValuations.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
          <MiniSparkline valuations={projectValuations} height={48} />
        </div>

        {/* CTAs */}
        <div className="flex gap-2">
          {hasValuations ? (
            <>
              <Link to={`/valuation/new/${project.project_id}`} className="flex-1">
                <Button 
                  className="w-full bg-[#0B4DBB] hover:bg-[#093c96] text-white text-sm"
                  size="sm"
                >
                  <TrendingUp className="w-3.5 h-3.5 mr-1.5" />
                  Update Valuation
                </Button>
              </Link>
              <Link to={`/valuation/${latestValuation.valuation_id}`}>
                <Button 
                  variant="outline"
                  size="sm"
                  className="border-slate-200 hover:bg-slate-50"
                  title="View Report"
                >
                  <FileText className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </>
          ) : (
            <Link to={`/valuation/new/${project.project_id}`} className="flex-1">
              <Button 
                className="w-full bg-[#0B4DBB] hover:bg-[#093c96] text-white text-sm"
                size="sm"
              >
                Start Valuation
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Recent Valuations Footer */}
      {projectValuations.length > 0 && (
        <div className="border-t border-slate-100 bg-slate-50/50 px-5 py-3">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
            Recent
          </p>
          <div className="space-y-1.5">
            {projectValuations.slice(0, 2).map((val) => (
              <Link 
                key={val.valuation_id}
                to={`/valuation/${val.valuation_id}`}
                className="flex items-center justify-between py-1 text-sm hover:text-[#0B4DBB] transition-colors group/item"
              >
                <span className="text-slate-600 truncate flex-1 mr-2">
                  {val.company_info?.company_name}
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-slate-900 tabular-nums">
                    {formatCurrency(val.result?.base || 0)}
                  </span>
                  <ExternalLink className="w-3 h-3 text-slate-400 opacity-0 group-hover/item:opacity-100 transition-opacity" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default ProjectCard;
