import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, Clock, Zap, TrendingUp, ChevronDown, ChevronUp, Filter } from 'lucide-react';
import { Button } from './ui/button';

const OptimizationRoadmap = ({ metrics }) => {
  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('priority'); // priority, impact, ease, time
  const [expandedAction, setExpandedAction] = useState(null);
  const [totals, setTotals] = useState({ score: 0, multiple: 0 });

  // Default exit inputs
  const defaultExitInputs = {
    churn_rate: 5,
    nrr: metrics?.nrr || 100,
    recurring_revenue_pct: 80,
    has_annual_contracts: false,
    max_customer_concentration: 20,
    founder_hours_per_week: 40,
    has_documented_sops: false,
    tech_stack: "Other",
    is_b2b: true,
    has_12mo_financials: true,
    seo_traffic_pct: 30,
    has_legal_docs: true,
    has_clear_icp: false
  };

  useEffect(() => {
    if (metrics) {
      generateRoadmap();
    }
  }, [metrics]);

  const generateRoadmap = () => {
    setLoading(true);
    const arr = metrics?.arr || (metrics?.mrr || 0) * 12;
    const generatedActions = [];

    // Churn optimization
    if (defaultExitInputs.churn_rate > 5) {
      generatedActions.push({
        action: "Reduce Customer Churn",
        description: `Current churn is ${defaultExitInputs.churn_rate}%. Implement retention strategies: onboarding improvements, proactive support, and customer success programs.`,
        impact_score: defaultExitInputs.churn_rate > 8 ? 5 : 3,
        impact_multiple: defaultExitInputs.churn_rate > 8 ? 0.3 : 0.15,
        difficulty: "Medium",
        time_estimate: "3-6 months",
        category: "Financial Quality",
        priority: defaultExitInputs.churn_rate > 8 ? 9 : 7
      });
    }

    // Founder hours
    if (defaultExitInputs.founder_hours_per_week > 30) {
      generatedActions.push({
        action: "Reduce Founder Dependency",
        description: `Currently ${defaultExitInputs.founder_hours_per_week}h/week. Hire key roles, document processes, and automate repetitive tasks.`,
        impact_score: 6,
        impact_multiple: 0.4,
        difficulty: "High",
        time_estimate: "6-12 months",
        category: "Operational Transferability",
        priority: 8
      });
    } else if (defaultExitInputs.founder_hours_per_week > 20) {
      generatedActions.push({
        action: "Further Reduce Founder Involvement",
        description: `Currently ${defaultExitInputs.founder_hours_per_week}h/week. Target <20 hours through delegation.`,
        impact_score: 3,
        impact_multiple: 0.2,
        difficulty: "Medium",
        time_estimate: "3-6 months",
        category: "Operational Transferability",
        priority: 5
      });
    }

    // Annual contracts
    if (!defaultExitInputs.has_annual_contracts) {
      generatedActions.push({
        action: "Introduce Annual Contracts",
        description: "Offer annual pricing with 15-20% discount. Improves revenue predictability and cash flow.",
        impact_score: 5,
        impact_multiple: 0.25,
        difficulty: "Low",
        time_estimate: "1-2 months",
        category: "Revenue Predictability",
        priority: 8
      });
    }

    // ARR milestones
    if (arr < 25000) {
      generatedActions.push({
        action: "Achieve $25K ARR Milestone",
        description: `Current ARR: $${arr.toLocaleString()}. Focus on customer acquisition and pricing optimization.`,
        impact_score: 6,
        impact_multiple: 0.5,
        difficulty: "High",
        time_estimate: "6-12 months",
        category: "Financial Quality",
        priority: 10
      });
    } else if (arr < 100000) {
      generatedActions.push({
        action: "Scale to $100K ARR",
        description: `Current ARR: $${arr.toLocaleString()}. Expand marketing channels and optimize conversion.`,
        impact_score: 4,
        impact_multiple: 0.3,
        difficulty: "Medium",
        time_estimate: "6-12 months",
        category: "Financial Quality",
        priority: 7
      });
    }

    // SOP documentation
    if (!defaultExitInputs.has_documented_sops) {
      generatedActions.push({
        action: "Document Standard Operating Procedures",
        description: "Create comprehensive SOPs for all critical processes: support, onboarding, billing, development.",
        impact_score: 5,
        impact_multiple: 0.2,
        difficulty: "Medium",
        time_estimate: "2-4 months",
        category: "Operational Transferability",
        priority: 7
      });
    }

    // Customer concentration
    if (defaultExitInputs.max_customer_concentration > 30) {
      generatedActions.push({
        action: "Reduce Customer Concentration",
        description: `Largest customer is ${defaultExitInputs.max_customer_concentration}% of revenue. Diversify customer base.`,
        impact_score: 4,
        impact_multiple: 0.25,
        difficulty: "High",
        time_estimate: "6-12 months",
        category: "Risk Profile",
        priority: 8
      });
    }

    // NRR improvement
    const nrr = metrics?.nrr || defaultExitInputs.nrr;
    if (nrr < 100) {
      generatedActions.push({
        action: "Improve Net Revenue Retention",
        description: `Current NRR: ${nrr}%. Implement upsell paths, usage-based pricing, expansion strategies.`,
        impact_score: 6,
        impact_multiple: 0.35,
        difficulty: "Medium",
        time_estimate: "3-6 months",
        category: "Financial Quality",
        priority: 9
      });
    }

    // Recurring revenue
    if (defaultExitInputs.recurring_revenue_pct < 90) {
      generatedActions.push({
        action: "Increase Recurring Revenue",
        description: `Currently ${defaultExitInputs.recurring_revenue_pct}% recurring. Convert one-time services to subscriptions.`,
        impact_score: 3,
        impact_multiple: 0.2,
        difficulty: "Medium",
        time_estimate: "3-6 months",
        category: "Revenue Predictability",
        priority: 6
      });
    }

    // ICP definition
    if (!defaultExitInputs.has_clear_icp) {
      generatedActions.push({
        action: "Define Ideal Customer Profile",
        description: "Document ICP with demographics, firmographics, pain points, and buying behavior.",
        impact_score: 4,
        impact_multiple: 0.15,
        difficulty: "Low",
        time_estimate: "2-4 weeks",
        category: "Market Attractiveness",
        priority: 5
      });
    }

    // Legal docs
    if (!defaultExitInputs.has_legal_docs) {
      generatedActions.push({
        action: "Complete Legal Documentation",
        description: "Ensure all contracts, IP assignments, privacy policies, and terms of service are in place.",
        impact_score: 3,
        impact_multiple: 0.1,
        difficulty: "Low",
        time_estimate: "2-4 weeks",
        category: "Risk Profile",
        priority: 9
      });
    }

    // Sort by priority initially
    generatedActions.sort((a, b) => b.priority - a.priority);

    const totalScore = generatedActions.reduce((sum, a) => sum + a.impact_score, 0);
    const totalMultiple = generatedActions.reduce((sum, a) => sum + a.impact_multiple, 0);

    setActions(generatedActions);
    setTotals({ score: totalScore, multiple: Math.round(totalMultiple * 100) / 100 });
    setLoading(false);
  };

  const sortActions = (by) => {
    setSortBy(by);
    const sorted = [...actions];
    switch (by) {
      case 'impact':
        sorted.sort((a, b) => b.impact_score - a.impact_score);
        break;
      case 'ease':
        sorted.sort((a, b) => {
          const order = { 'Low': 3, 'Medium': 2, 'High': 1 };
          return order[a.difficulty] - order[b.difficulty];
        });
        break;
      case 'time':
        sorted.sort((a, b) => {
          const getMonths = (t) => {
            if (t.includes('weeks')) return 1;
            if (t.includes('1-2')) return 1.5;
            if (t.includes('2-4 months')) return 3;
            if (t.includes('3-6')) return 4.5;
            if (t.includes('4-8')) return 6;
            return 9;
          };
          return getMonths(a.time_estimate) - getMonths(b.time_estimate);
        });
        break;
      default:
        sorted.sort((a, b) => b.priority - a.priority);
    }
    setActions(sorted);
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Low': return 'bg-emerald-100 text-emerald-700';
      case 'Medium': return 'bg-amber-100 text-amber-700';
      case 'High': return 'bg-red-100 text-red-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'Financial Quality': return 'border-l-blue-500';
      case 'Revenue Predictability': return 'border-l-purple-500';
      case 'Operational Transferability': return 'border-l-emerald-500';
      case 'Market Attractiveness': return 'border-l-amber-500';
      case 'Risk Profile': return 'border-l-red-500';
      default: return 'border-l-slate-500';
    }
  };

  if (loading) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-6 animate-pulse">
        <div className="h-6 bg-slate-200 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          <div className="h-20 bg-slate-200 rounded"></div>
          <div className="h-20 bg-slate-200 rounded"></div>
          <div className="h-20 bg-slate-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-slate-200 rounded-xl overflow-hidden"
      data-testid="optimization-roadmap"
    >
      {/* Header */}
      <div className="p-6 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Exit Optimization Roadmap</h3>
            <p className="text-sm text-slate-500 mt-1">Actionable improvements to maximize your exit value</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500">Potential Gains</p>
            <p className="text-lg font-bold text-[#0B4DBB]">+{totals.score} pts / +{totals.multiple}x</p>
          </div>
        </div>
      </div>

      {/* Sort Controls */}
      <div className="px-6 py-3 bg-slate-50 border-b border-slate-100 flex items-center gap-2">
        <Filter className="w-4 h-4 text-slate-400" />
        <span className="text-sm text-slate-500 mr-2">Sort by:</span>
        {['priority', 'impact', 'ease', 'time'].map((option) => (
          <Button
            key={option}
            variant={sortBy === option ? 'default' : 'ghost'}
            size="sm"
            onClick={() => sortActions(option)}
            className={sortBy === option ? 'bg-[#0B4DBB] text-white' : 'text-slate-600'}
          >
            {option.charAt(0).toUpperCase() + option.slice(1)}
          </Button>
        ))}
      </div>

      {/* Actions List */}
      <div className="p-6 space-y-4">
        {actions.map((action, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`border border-slate-200 rounded-xl overflow-hidden border-l-4 ${getCategoryColor(action.category)}`}
          >
            <div
              className="p-4 cursor-pointer hover:bg-slate-50 transition-colors"
              onClick={() => setExpandedAction(expandedAction === index ? null : index)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-slate-900">{action.action}</h4>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${getDifficultyColor(action.difficulty)}`}>
                      {action.difficulty}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500">{action.category}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-emerald-600">
                      <ArrowUpRight className="w-4 h-4" />
                      <span className="font-semibold">+{action.impact_score} pts</span>
                    </div>
                    <p className="text-xs text-slate-500">+{action.impact_multiple}x multiple</p>
                  </div>
                  {expandedAction === index ? 
                    <ChevronUp className="w-5 h-5 text-slate-400" /> : 
                    <ChevronDown className="w-5 h-5 text-slate-400" />
                  }
                </div>
              </div>
            </div>

            {/* Expanded Details */}
            {expandedAction === index && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="px-4 pb-4 pt-2 border-t border-slate-100 bg-slate-50"
              >
                <p className="text-sm text-slate-700 mb-4">{action.description}</p>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1 text-slate-600">
                    <Clock className="w-4 h-4" />
                    <span>{action.time_estimate}</span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-600">
                    <Zap className="w-4 h-4" />
                    <span>Priority: {action.priority}/10</span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-600">
                    <TrendingUp className="w-4 h-4" />
                    <span>Impact: {action.impact_score} points</span>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        ))}

        {actions.length === 0 && (
          <div className="text-center py-8">
            <p className="text-slate-500">🎉 Great news! No major optimizations needed.</p>
            <p className="text-sm text-slate-400 mt-1">Your business is well-positioned for exit.</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default OptimizationRoadmap;
