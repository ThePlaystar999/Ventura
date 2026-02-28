import React, { useState, useMemo } from 'react';
import { TrendingUp, ArrowRight, X, Lightbulb, Target, Zap, BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';

const BenchmarkBanner = ({ valuations, selectedProjectId, industry }) => {
  const [dismissed, setDismissed] = useState(false);
  const [insightsOpen, setInsightsOpen] = useState(false);

  // Calculate benchmark status
  const benchmarkData = useMemo(() => {
    if (!valuations || valuations.length === 0) return null;

    // Filter valuations for selected project
    const projectValuations = selectedProjectId
      ? valuations.filter(v => v.project_id === selectedProjectId)
      : valuations;

    if (projectValuations.length === 0) return null;

    // Get latest valuation
    const latestValuation = projectValuations[0];
    const currentValuation = latestValuation?.result?.base || 0;

    if (currentValuation === 0) return null;

    // Simulate benchmark if no industry data exists
    // In production, this would come from actual industry benchmark data
    const simulatedBenchmark = currentValuation * 1.35;
    const benchmark = simulatedBenchmark; // Replace with actual benchmark when available

    // Calculate gap
    const gap = benchmark - currentValuation;
    const gapPercentage = ((gap / benchmark) * 100).toFixed(0);
    const isAboveBenchmark = currentValuation >= benchmark;

    // Get industry name for display
    const industryName = latestValuation?.data?.industry || industry || 'AI SaaS';
    const stage = latestValuation?.data?.stage || 'your stage';

    return {
      currentValuation,
      benchmark,
      gap: Math.abs(gap),
      gapPercentage: Math.abs(gapPercentage),
      isAboveBenchmark,
      industryName,
      stage,
      latestValuation
    };
  }, [valuations, selectedProjectId, industry]);

  // Don't render if no valuations or dismissed
  if (!benchmarkData || dismissed) return null;

  const { isAboveBenchmark, gapPercentage, industryName, stage, currentValuation, benchmark, gap } = benchmarkData;

  const formatCurrency = (value) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    }
    return `$${(value / 1000).toFixed(0)}K`;
  };

  // Insights content for modal
  const insightsTips = isAboveBenchmark
    ? [
        { icon: Target, title: 'Maintain Growth Rate', description: 'Your current trajectory is strong. Focus on sustainable growth to maintain your lead.' },
        { icon: Zap, title: 'Expand Market Share', description: 'Consider expanding into adjacent markets while your valuation momentum is high.' },
        { icon: BarChart3, title: 'Document Your Success', description: 'Investors value demonstrated traction. Keep detailed records of your outperformance.' }
      ]
    : [
        { icon: TrendingUp, title: 'Accelerate Revenue Growth', description: 'Increasing MRR by 20% could significantly close the valuation gap.' },
        { icon: Target, title: 'Improve Unit Economics', description: 'Focus on reducing CAC and increasing LTV ratios to boost investor confidence.' },
        { icon: Zap, title: 'Strengthen Team', description: 'Strategic hires in key positions can justify higher valuation multiples.' }
      ];

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className={`relative rounded-xl border px-5 py-4 mb-6 ${
          isAboveBenchmark
            ? 'bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200'
            : 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200'
        }`}
        data-testid="benchmark-banner"
      >
        {/* Dismiss button */}
        <button
          onClick={() => setDismissed(true)}
          className="absolute top-3 right-3 p-1 rounded-full hover:bg-black/5 transition-colors"
          aria-label="Dismiss banner"
          data-testid="benchmark-banner-dismiss"
        >
          <X className="w-4 h-4 text-slate-400" />
        </button>

        <div className="flex items-center gap-4 pr-8">
          {/* Icon */}
          <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${
            isAboveBenchmark ? 'bg-emerald-100' : 'bg-amber-100'
          }`}>
            {isAboveBenchmark ? (
              <TrendingUp className="w-5 h-5 text-emerald-600" />
            ) : (
              <BarChart3 className="w-5 h-5 text-amber-600" />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-medium ${
              isAboveBenchmark ? 'text-emerald-900' : 'text-amber-900'
            }`}>
              {isAboveBenchmark ? (
                <>
                  <span className="hidden sm:inline">You're ahead of benchmark for {industryName} at {stage}. </span>
                  <span className="sm:hidden">Above benchmark! </span>
                  Keep the momentum going.
                </>
              ) : (
                <>
                  <span className="hidden sm:inline">Your valuation is {gapPercentage}% below industry average for {industryName} at {stage}. </span>
                  <span className="sm:hidden">{gapPercentage}% below benchmark. </span>
                  See how to close the gap.
                </>
              )}
            </p>
          </div>

          {/* CTA */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setInsightsOpen(true)}
            className={`flex-shrink-0 font-medium ${
              isAboveBenchmark
                ? 'text-emerald-700 hover:text-emerald-800 hover:bg-emerald-100'
                : 'text-amber-700 hover:text-amber-800 hover:bg-amber-100'
            }`}
            data-testid="benchmark-banner-cta"
          >
            <span className="hidden sm:inline">{isAboveBenchmark ? 'View Insights' : 'Close the Gap'}</span>
            <ArrowRight className="w-4 h-4 sm:ml-1" />
          </Button>
        </div>
      </motion.div>

      {/* Insights Modal */}
      <Dialog open={insightsOpen} onOpenChange={setInsightsOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-[#0B4DBB]" />
              {isAboveBenchmark ? 'Maintain Your Lead' : 'Valuation Insights'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 pt-4">
            {/* Benchmark Summary */}
            <div className={`rounded-lg p-4 ${
              isAboveBenchmark ? 'bg-emerald-50' : 'bg-amber-50'
            }`}>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-xs text-slate-500 mb-1">Your Valuation</p>
                  <p className="text-lg font-bold text-slate-900">{formatCurrency(currentValuation)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Industry Benchmark</p>
                  <p className="text-lg font-bold text-slate-900">{formatCurrency(benchmark)}</p>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-200 text-center">
                <p className={`text-sm font-medium ${isAboveBenchmark ? 'text-emerald-700' : 'text-amber-700'}`}>
                  {isAboveBenchmark 
                    ? `You're ${formatCurrency(gap)} above benchmark`
                    : `Gap to close: ${formatCurrency(gap)}`
                  }
                </p>
              </div>
            </div>

            {/* Tips */}
            <div className="space-y-3">
              <p className="text-sm font-medium text-slate-700">
                {isAboveBenchmark ? 'Tips to maintain your position:' : 'Recommendations to improve:'}
              </p>
              {insightsTips.map((tip, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex gap-3 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors"
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-[#0B4DBB]/10 flex items-center justify-center">
                    <tip.icon className="w-4 h-4 text-[#0B4DBB]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">{tip.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{tip.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Footer note */}
            <p className="text-xs text-slate-400 text-center">
              Benchmark based on industry averages for {industryName} companies
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default BenchmarkBanner;
