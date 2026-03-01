import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';
import { TrendingUp, TrendingDown, ArrowRight, Edit3, Check, X, HelpCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const ExitSnapshotCard = ({ 
  projects, 
  valuations, 
  selectedProjectId,
  onProjectSelect 
}) => {
  const [targetValuation, setTargetValuation] = useState(null);
  const [isEditingTarget, setIsEditingTarget] = useState(false);
  const [tempTarget, setTempTarget] = useState('');

  // Get valuations for selected project or all valuations
  const relevantValuations = selectedProjectId 
    ? valuations.filter(v => v.project_id === selectedProjectId)
    : valuations;

  // Get latest and previous valuations
  const latestValuation = relevantValuations[0] || null;
  const previousValuation = relevantValuations[1] || null;

  // Calculate current valuation
  const currentValue = latestValuation?.result?.base || 0;
  const previousValue = previousValuation?.result?.base || 0;

  // Calculate change
  const valueDelta = currentValue - previousValue;
  const valueChangePercent = previousValue > 0 
    ? ((valueDelta / previousValue) * 100).toFixed(1) 
    : 0;
  const hasIncrease = valueDelta >= 0;

  // Get selected project
  const selectedProject = selectedProjectId 
    ? projects.find(p => p.project_id === selectedProjectId)
    : projects[0];

  // Load target valuation from localStorage (per project)
  useEffect(() => {
    const storageKey = selectedProject?.project_id 
      ? `target_valuation_${selectedProject.project_id}` 
      : 'target_valuation_default';
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      setTargetValuation(parseFloat(saved));
    } else {
      // Default target: 2x current or $500K minimum
      setTargetValuation(Math.max(currentValue * 2, 500000));
    }
  }, [selectedProject?.project_id, currentValue]);

  // Save target valuation
  const saveTargetValuation = () => {
    const value = parseFloat(tempTarget.replace(/[^0-9.]/g, ''));
    if (value && value > 0) {
      const storageKey = selectedProject?.project_id 
        ? `target_valuation_${selectedProject.project_id}` 
        : 'target_valuation_default';
      localStorage.setItem(storageKey, value.toString());
      setTargetValuation(value);
    }
    setIsEditingTarget(false);
  };

  // Calculate gap to target
  const gapToTarget = targetValuation ? targetValuation - currentValue : 0;
  const gapPercent = targetValuation && currentValue > 0
    ? ((gapToTarget / targetValuation) * 100).toFixed(0)
    : 100;
  const progressPercent = targetValuation && currentValue > 0
    ? Math.min(100, (currentValue / targetValuation) * 100)
    : 0;

  // Format currency
  const formatCurrency = (value) => {
    if (!value || value === 0) return '$0';
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`;
    }
    return `$${value.toFixed(0)}`;
  };

  // Format currency for input
  const formatCurrencyInput = (value) => {
    if (!value) return '';
    return formatCurrency(value);
  };

  // Exit readiness placeholder (would come from API in future)
  const exitReadinessScore = latestValuation ? 52 : null; // Placeholder

  // Determine CTA
  const hasValuations = relevantValuations.length > 0;
  const ctaText = hasValuations ? 'Update Valuation' : 'Start Valuation';
  const ctaLink = selectedProject 
    ? `/valuation/new/${selectedProject.project_id}` 
    : '/valuation/new';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-[#0842A0] via-[#0B4DBB] to-[#1E6AE1] rounded-2xl p-6 md:p-8 text-white relative overflow-hidden"
      data-testid="exit-snapshot-card"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
      </div>

      <div className="relative z-10">
        {/* Header with project selector */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg font-semibold text-white/80">Exit Snapshot</h2>
            {selectedProject && (
              <p className="text-sm text-white/50 mt-0.5">{selectedProject.name}</p>
            )}
          </div>
          
          {/* Project selector dropdown */}
          {projects.length > 1 && (
            <select
              value={selectedProjectId || ''}
              onChange={(e) => onProjectSelect(e.target.value || null)}
              className="bg-white/15 backdrop-blur-sm border border-white/30 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-white/50 cursor-pointer"
            >
              <option value="" className="bg-[#0B4DBB]">All Projects</option>
              {projects.map(p => (
                <option key={p.project_id} value={p.project_id} className="bg-[#0B4DBB]">
                  {p.name}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Main metrics grid */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6">
          {/* Current Valuation */}
          <div className="col-span-2 lg:col-span-1 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="flex items-center gap-1 mb-1">
              <p className="text-xs text-white/70 uppercase tracking-wider">Current Valuation</p>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="text-white/40 hover:text-white/70 transition-colors">
                    <HelpCircle className="w-3.5 h-3.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs">
                  <p className="text-sm">Your estimated enterprise value based on revenue multiple and growth metrics.</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <p className="text-2xl md:text-3xl font-bold tabular-nums" data-testid="current-valuation">
              {formatCurrency(currentValue)}
            </p>
            {latestValuation && (
              <p className="text-xs text-white/50 mt-1">
                {latestValuation.company_info?.company_name}
              </p>
            )}
          </div>

          {/* Change since last */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="flex items-center gap-1 mb-1">
              <p className="text-xs text-white/70 uppercase tracking-wider">Change</p>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="text-white/40 hover:text-white/70 transition-colors">
                    <HelpCircle className="w-3.5 h-3.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs">
                  <p className="text-sm">Valuation change since your previous assessment.</p>
                </TooltipContent>
              </Tooltip>
            </div>
            {previousValuation ? (
              <div className="flex items-center gap-2">
                {hasIncrease ? (
                  <TrendingUp className="w-5 h-5 text-emerald-300" />
                ) : (
                  <TrendingDown className="w-5 h-5 text-red-300" />
                )}
                <div>
                  <p className={`text-xl font-bold tabular-nums ${hasIncrease ? 'text-emerald-300' : 'text-red-300'}`}>
                    {hasIncrease ? '+' : ''}{valueChangePercent}%
                  </p>
                  <p className="text-xs text-white/50">
                    {hasIncrease ? '+' : ''}{formatCurrency(valueDelta)}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-xl font-bold text-white/50">—</p>
            )}
          </div>

          {/* Exit Readiness Score */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="flex items-center gap-1 mb-1">
              <p className="text-xs text-white/70 uppercase tracking-wider">Exit Readiness</p>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="text-white/40 hover:text-white/70 transition-colors">
                    <HelpCircle className="w-3.5 h-3.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs">
                  <p className="text-sm">Score from 0-100 measuring how prepared your startup is for acquisition or exit.</p>
                </TooltipContent>
              </Tooltip>
            </div>
            {exitReadinessScore !== null ? (
              <div className="flex items-center gap-2">
                <div className="relative w-10 h-10">
                  <svg className="w-10 h-10 transform -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="14" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="3" />
                    <circle 
                      cx="18" cy="18" r="14" fill="none" 
                      stroke={exitReadinessScore >= 70 ? '#34D399' : exitReadinessScore >= 50 ? '#FBBF24' : '#F87171'}
                      strokeWidth="3" 
                      strokeLinecap="round"
                      strokeDasharray={`${(exitReadinessScore / 100) * 88} 88`}
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-xs font-bold">
                    {exitReadinessScore}
                  </span>
                </div>
                <span className="text-sm text-white/70">/ 100</span>
              </div>
            ) : (
              <p className="text-xl font-bold text-white/50">—</p>
            )}
          </div>

          {/* Target Valuation */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <p className="text-xs text-white/70 uppercase tracking-wider mb-1">Target</p>
            {isEditingTarget ? (
              <div className="flex items-center gap-1">
                <Input
                  value={tempTarget}
                  onChange={(e) => setTempTarget(e.target.value)}
                  placeholder="e.g., 1000000"
                  className="h-8 bg-white/20 border-white/30 text-white text-sm w-24 placeholder:text-white/40"
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && saveTargetValuation()}
                />
                <button onClick={saveTargetValuation} className="p-1 hover:bg-white/10 rounded">
                  <Check className="w-4 h-4 text-emerald-300" />
                </button>
                <button onClick={() => setIsEditingTarget(false)} className="p-1 hover:bg-white/10 rounded">
                  <X className="w-4 h-4 text-red-300" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <p className="text-xl font-bold tabular-nums">{formatCurrencyInput(targetValuation)}</p>
                <button 
                  onClick={() => {
                    setTempTarget(targetValuation?.toString() || '');
                    setIsEditingTarget(true);
                  }}
                  className="p-1 hover:bg-white/10 rounded transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5 text-white/50" />
                </button>
              </div>
            )}
          </div>

          {/* Gap to Target */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <p className="text-xs text-white/70 uppercase tracking-wider mb-1">Gap to Target</p>
            <p className="text-xl font-bold tabular-nums">
              {gapToTarget > 0 ? formatCurrency(gapToTarget) : 'Achieved!'}
            </p>
            {gapToTarget > 0 && targetValuation && (
              <div className="mt-2">
                <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-white rounded-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <p className="text-xs text-white/50 mt-1">{progressPercent.toFixed(0)}% complete</p>
              </div>
            )}
          </div>
        </div>

        {/* CTA Button */}
        <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="text-sm text-white/50">
            {hasValuations ? (
              <span>{relevantValuations.length} valuation{relevantValuations.length !== 1 ? 's' : ''} recorded</span>
            ) : (
              <span>No valuations yet — start tracking your exit path</span>
            )}
          </div>
          
          <Link to={ctaLink}>
            <Button 
              className="bg-white text-slate-900 hover:bg-white/90 font-semibold px-6 shadow-lg"
              data-testid="snapshot-cta"
            >
              {ctaText}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default ExitSnapshotCard;
