import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Target, 
  RefreshCw, 
  DollarSign, 
  Users,
  ArrowRight,
  Zap,
  BarChart3
} from 'lucide-react';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';

const ValuationBoostOpportunities = ({ valuations, selectedProjectId }) => {
  const [selectedOpportunity, setSelectedOpportunity] = useState(null);

  // Get relevant valuations
  const relevantValuations = useMemo(() => {
    if (!valuations || valuations.length === 0) return [];
    return selectedProjectId 
      ? valuations.filter(v => v.project_id === selectedProjectId)
      : valuations;
  }, [valuations, selectedProjectId]);

  const latestValuation = relevantValuations[0] || null;

  // Extract metrics with safe defaults
  const metrics = useMemo(() => {
    if (!latestValuation) return null;
    
    const m = latestValuation.metrics || {};
    const result = latestValuation.result || {};
    
    return {
      arr: result.arr_used || m.arr || (m.mrr || 0) * 12,
      mrr: m.mrr || 0,
      growth_rate: m.growth_rate || 0,
      gross_margin: m.gross_margin || 70,
      nrr: m.nrr || 100,
      churn_rate: m.churn_rate || (100 - (m.nrr || 100)),
      multiple: result.multiple_used || result.base_multiple || 3.0,
      currentValuation: result.base || 0,
      founder_hours: m.founder_hours_per_week || 40,
      team_size: m.team_size || 1
    };
  }, [latestValuation]);

  // Generate opportunities based on metrics
  const opportunities = useMemo(() => {
    if (!metrics || metrics.currentValuation === 0) {
      // Fallback generic opportunities when no data
      return [
        {
          id: 'generic-revenue',
          icon: DollarSign,
          title: 'Increase Recurring Revenue',
          description: 'Higher ARR directly increases your valuation multiple.',
          impact: null,
          impactLabel: 'High Impact',
          priority: 'high',
          color: 'emerald',
          details: 'Focus on expanding existing accounts and acquiring new customers with annual contracts to boost your ARR and improve valuation multiples.'
        },
        {
          id: 'generic-retention',
          icon: RefreshCw,
          title: 'Improve Customer Retention',
          description: 'Lower churn signals a healthier, more valuable business.',
          impact: null,
          impactLabel: 'High Impact',
          priority: 'high',
          color: 'blue',
          details: 'Reducing churn by even 1-2% can significantly impact your valuation through improved NRR and predictable revenue streams.'
        },
        {
          id: 'generic-margin',
          icon: BarChart3,
          title: 'Optimize Gross Margin',
          description: 'Higher margins mean more value for acquirers.',
          impact: null,
          impactLabel: 'Medium Impact',
          priority: 'medium',
          color: 'purple',
          details: 'SaaS businesses with 80%+ gross margins typically command premium multiples. Focus on reducing COGS and optimizing infrastructure costs.'
        }
      ];
    }

    const currentVal = metrics.currentValuation;
    const opportunities = [];

    // 1. MRR/ARR Growth Opportunity
    if (metrics.growth_rate < 50) {
      const potentialImpact = currentVal * 0.15; // 15% valuation increase
      opportunities.push({
        id: 'growth-rate',
        icon: TrendingUp,
        title: 'Accelerate Growth Rate',
        description: `Current growth at ${metrics.growth_rate}%. Target 50%+ for premium multiples.`,
        impact: potentialImpact,
        impactLabel: `+${formatCurrency(potentialImpact)}`,
        priority: metrics.growth_rate < 20 ? 'high' : 'medium',
        color: 'emerald',
        details: `Your current growth rate of ${metrics.growth_rate}% is below the 50% threshold that attracts premium buyers. Increasing to 50%+ could improve your multiple by 0.5-1.0x, adding approximately ${formatCurrency(potentialImpact)} to your valuation.`,
        actions: [
          'Implement expansion revenue strategies',
          'Optimize marketing spend efficiency',
          'Launch referral program'
        ]
      });
    }

    // 2. Retention/NRR Opportunity
    if (metrics.nrr < 110) {
      const potentialImpact = currentVal * 0.12; // 12% valuation increase
      opportunities.push({
        id: 'retention',
        icon: RefreshCw,
        title: 'Boost Net Revenue Retention',
        description: `NRR at ${metrics.nrr}%. Best-in-class SaaS achieves 120%+.`,
        impact: potentialImpact,
        impactLabel: `+${formatCurrency(potentialImpact)}`,
        priority: metrics.nrr < 100 ? 'high' : 'medium',
        color: 'blue',
        details: `Net Revenue Retention of ${metrics.nrr}% indicates ${metrics.nrr < 100 ? 'revenue contraction' : 'limited expansion'}. Improving to 110%+ through upsells and reduced churn could add ${formatCurrency(potentialImpact)} to your valuation.`,
        actions: [
          'Implement customer success program',
          'Create upsell pathways',
          'Reduce involuntary churn'
        ]
      });
    }

    // 3. Gross Margin Opportunity
    if (metrics.gross_margin < 80) {
      const potentialImpact = currentVal * 0.08; // 8% valuation increase
      opportunities.push({
        id: 'margin',
        icon: BarChart3,
        title: 'Improve Gross Margin',
        description: `Margin at ${metrics.gross_margin}%. Target 80%+ for SaaS benchmarks.`,
        impact: potentialImpact,
        impactLabel: `+${formatCurrency(potentialImpact)}`,
        priority: metrics.gross_margin < 60 ? 'high' : 'medium',
        color: 'purple',
        details: `Your gross margin of ${metrics.gross_margin}% is below the 80% SaaS benchmark. Optimizing costs could add ${formatCurrency(potentialImpact)} in perceived value by demonstrating better unit economics.`,
        actions: [
          'Optimize infrastructure costs',
          'Automate support processes',
          'Renegotiate vendor contracts'
        ]
      });
    }

    // 4. Founder Dependency Opportunity
    if (metrics.founder_hours > 25) {
      const potentialImpact = currentVal * 0.10; // 10% valuation increase
      opportunities.push({
        id: 'operations',
        icon: Users,
        title: 'Reduce Founder Dependency',
        description: `${metrics.founder_hours}h/week founder time. Target <20h for easy transfer.`,
        impact: potentialImpact,
        impactLabel: `+${formatCurrency(potentialImpact)}`,
        priority: metrics.founder_hours > 35 ? 'high' : 'medium',
        color: 'amber',
        details: `High founder involvement (${metrics.founder_hours}h/week) reduces attractiveness to buyers. Building processes and delegating could add ${formatCurrency(potentialImpact)} by demonstrating operational maturity.`,
        actions: [
          'Document SOPs for all processes',
          'Hire or delegate key functions',
          'Implement automation tools'
        ]
      });
    }

    // 5. Revenue Predictability Opportunity
    const predictabilityImpact = currentVal * 0.07; // 7% valuation increase
    opportunities.push({
      id: 'predictability',
      icon: Target,
      title: 'Increase Revenue Predictability',
      description: 'Annual contracts and diversified revenue reduce buyer risk.',
      impact: predictabilityImpact,
      impactLabel: `+${formatCurrency(predictabilityImpact)}`,
      priority: 'medium',
      color: 'cyan',
      details: `Shifting customers to annual contracts and reducing concentration risk could add ${formatCurrency(predictabilityImpact)} by improving revenue predictability and reducing buyer risk perception.`,
      actions: [
        'Offer annual contract incentives',
        'Diversify customer base',
        'Implement subscription analytics'
      ]
    });

    // Sort by priority and limit to 5
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return opportunities
      .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])
      .slice(0, 5);
  }, [metrics]);

  // Format currency helper
  function formatCurrency(value) {
    if (!value || value === 0) return '$0';
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`;
    }
    return `$${Math.round(value)}`;
  }

  // Get color classes
  const getColorClasses = (color) => {
    const colors = {
      emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', icon: 'bg-emerald-100', border: 'border-emerald-200' },
      blue: { bg: 'bg-blue-50', text: 'text-blue-600', icon: 'bg-blue-100', border: 'border-blue-200' },
      purple: { bg: 'bg-purple-50', text: 'text-purple-600', icon: 'bg-purple-100', border: 'border-purple-200' },
      amber: { bg: 'bg-amber-50', text: 'text-amber-600', icon: 'bg-amber-100', border: 'border-amber-200' },
      cyan: { bg: 'bg-cyan-50', text: 'text-cyan-600', icon: 'bg-cyan-100', border: 'border-cyan-200' }
    };
    return colors[color] || colors.blue;
  };

  // Calculate total potential impact
  const totalPotentialImpact = useMemo(() => {
    return opportunities.reduce((sum, opp) => sum + (opp.impact || 0), 0);
  }, [opportunities]);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl border border-slate-200 p-6"
        data-testid="valuation-boost-section"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0B4DBB] to-[#1E6AE1] flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Valuation Boost Opportunities</h3>
              <p className="text-sm text-slate-500">
                {totalPotentialImpact > 0 
                  ? `Up to ${formatCurrency(totalPotentialImpact)} potential increase`
                  : 'Actionable levers to increase your valuation'
                }
              </p>
            </div>
          </div>
          
          {metrics && (
            <div className="hidden sm:flex items-center gap-2 text-sm">
              <span className="text-slate-400">Current:</span>
              <span className="font-semibold text-slate-900">{formatCurrency(metrics.currentValuation)}</span>
            </div>
          )}
        </div>

        {/* Opportunities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {opportunities.map((opp, index) => {
            const colorClasses = getColorClasses(opp.color);
            const Icon = opp.icon;
            
            return (
              <motion.div
                key={opp.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`relative rounded-xl border p-4 hover:shadow-md transition-all cursor-pointer group ${colorClasses.border} ${colorClasses.bg}`}
                onClick={() => setSelectedOpportunity(opp)}
                data-testid={`opportunity-${opp.id}`}
              >
                {/* Priority Badge */}
                {opp.priority === 'high' && (
                  <div className="absolute -top-2 -right-2 px-2 py-0.5 bg-red-500 text-white text-[10px] font-medium rounded-full">
                    High Priority
                  </div>
                )}

                {/* Icon */}
                <div className={`w-10 h-10 rounded-lg ${colorClasses.icon} flex items-center justify-center mb-3`}>
                  <Icon className={`w-5 h-5 ${colorClasses.text}`} />
                </div>

                {/* Content */}
                <h4 className="font-semibold text-slate-900 mb-1 text-sm">{opp.title}</h4>
                <p className="text-xs text-slate-600 mb-3 line-clamp-2">{opp.description}</p>

                {/* Impact & CTA */}
                <div className="flex items-center justify-between">
                  <div className={`text-sm font-bold ${colorClasses.text}`}>
                    {opp.impactLabel}
                  </div>
                  <button className={`text-xs font-medium flex items-center gap-1 ${colorClasses.text} opacity-0 group-hover:opacity-100 transition-opacity`}>
                    See how
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom Summary */}
        {totalPotentialImpact > 0 && metrics && (
          <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="text-sm text-slate-600">
              <span className="font-medium text-slate-900">{opportunities.length} opportunities</span>
              {' '}identified based on your metrics
            </div>
            <div className="flex items-center gap-3 text-sm">
              <span className="text-slate-400">Potential valuation:</span>
              <span className="font-bold text-emerald-600 text-lg">
                {formatCurrency(metrics.currentValuation + totalPotentialImpact)}
              </span>
            </div>
          </div>
        )}
      </motion.div>

      {/* Opportunity Detail Modal */}
      <Dialog open={!!selectedOpportunity} onOpenChange={() => setSelectedOpportunity(null)}>
        <DialogContent className="sm:max-w-lg">
          {selectedOpportunity && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg ${getColorClasses(selectedOpportunity.color).icon} flex items-center justify-center`}>
                    <selectedOpportunity.icon className={`w-5 h-5 ${getColorClasses(selectedOpportunity.color).text}`} />
                  </div>
                  <div>
                    <DialogTitle>{selectedOpportunity.title}</DialogTitle>
                    {selectedOpportunity.impact && (
                      <p className={`text-sm font-semibold ${getColorClasses(selectedOpportunity.color).text}`}>
                        {selectedOpportunity.impactLabel} potential impact
                      </p>
                    )}
                  </div>
                </div>
              </DialogHeader>
              
              <div className="space-y-4 pt-4">
                <p className="text-sm text-slate-600 leading-relaxed">
                  {selectedOpportunity.details}
                </p>

                {selectedOpportunity.actions && (
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                      Recommended Actions
                    </p>
                    <ul className="space-y-2">
                      {selectedOpportunity.actions.map((action, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                          <div className={`w-5 h-5 rounded-full ${getColorClasses(selectedOpportunity.color).icon} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                            <span className={`text-xs font-medium ${getColorClasses(selectedOpportunity.color).text}`}>
                              {i + 1}
                            </span>
                          </div>
                          {action}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="pt-4 border-t border-slate-100">
                  <Button 
                    className="w-full bg-[#0B4DBB] hover:bg-[#093c96]"
                    onClick={() => setSelectedOpportunity(null)}
                  >
                    Got it
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ValuationBoostOpportunities;
