import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Zap, TrendingUp, DollarSign, ArrowRight, ToggleLeft, ToggleRight } from 'lucide-react';

const MultipleImpactSimulator = ({ metrics, currentMultiple = 3.0 }) => {
  const [scenarios, setScenarios] = useState({
    churn_3pct: false,
    nrr_110: false,
    arr_next_tier: false,
    founder_20h: false,
    annual_contracts: false,
    concentration_20: false
  });
  const [result, setResult] = useState(null);

  // Default values
  const defaultExitInputs = {
    churn_rate: 5,
    nrr: metrics?.nrr || 100,
    max_customer_concentration: 20,
    founder_hours_per_week: 40,
    has_annual_contracts: false
  };

  const arr = metrics?.arr || (metrics?.mrr || 0) * 12;

  useEffect(() => {
    simulateImpact();
  }, [scenarios, metrics]);

  const simulateImpact = () => {
    const activeScenarios = Object.entries(scenarios)
      .filter(([_, enabled]) => enabled)
      .map(([id]) => id);

    let projectedMultiple = currentMultiple;
    const churn = defaultExitInputs.churn_rate;
    const nrr = defaultExitInputs.nrr;

    // Apply scenario impacts
    if (scenarios.churn_3pct && churn > 3) {
      const improvement = Math.min(0.5, (churn - 3) * 0.1);
      projectedMultiple += improvement;
    }

    if (scenarios.nrr_110 && nrr < 110) {
      const improvement = Math.min(0.6, (110 - nrr) * 0.03);
      projectedMultiple += improvement;
    }

    if (scenarios.arr_next_tier) {
      if (arr < 100000) projectedMultiple += 0.8;
      else if (arr < 500000) projectedMultiple += 0.5;
      else if (arr < 1000000) projectedMultiple += 0.4;
      else projectedMultiple += 0.3;
    }

    if (scenarios.founder_20h && defaultExitInputs.founder_hours_per_week > 20) {
      const improvement = Math.min(0.5, (defaultExitInputs.founder_hours_per_week - 20) * 0.015);
      projectedMultiple += improvement;
    }

    if (scenarios.annual_contracts && !defaultExitInputs.has_annual_contracts) {
      projectedMultiple += 0.3;
    }

    if (scenarios.concentration_20 && defaultExitInputs.max_customer_concentration > 20) {
      const improvement = Math.min(0.4, (defaultExitInputs.max_customer_concentration - 20) * 0.015);
      projectedMultiple += improvement;
    }

    const currentValuation = arr * currentMultiple;
    const projectedValuation = arr * projectedMultiple;
    const deltaValue = projectedValuation - currentValuation;
    const deltaPercentage = currentValuation > 0 
      ? ((projectedValuation - currentValuation) / currentValuation) * 100 
      : 0;

    setResult({
      current_multiple: currentMultiple,
      projected_multiple: Math.round(projectedMultiple * 100) / 100,
      current_valuation: currentValuation,
      projected_valuation: projectedValuation,
      delta_value: deltaValue,
      delta_percentage: Math.round(deltaPercentage * 10) / 10,
      active_scenarios: activeScenarios
    });
  };

  const toggleScenario = (scenarioId) => {
    setScenarios(prev => ({
      ...prev,
      [scenarioId]: !prev[scenarioId]
    }));
  };

  const formatCurrency = (value) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value.toFixed(0)}`;
  };

  const scenarioList = [
    {
      id: 'churn_3pct',
      label: 'Reduce churn to 3%',
      description: 'Implement retention strategies',
      impact: '+0.2-0.5x',
      category: 'Financial'
    },
    {
      id: 'nrr_110',
      label: 'Increase NRR to 110%',
      description: 'Add upsells & expansion revenue',
      impact: '+0.3-0.6x',
      category: 'Financial'
    },
    {
      id: 'arr_next_tier',
      label: 'Reach next ARR tier',
      description: arr < 100000 ? '$100K ARR' : arr < 500000 ? '$500K ARR' : '$1M ARR',
      impact: '+0.3-0.8x',
      category: 'Growth'
    },
    {
      id: 'founder_20h',
      label: 'Reduce founder to <20h/week',
      description: 'Hire, delegate, automate',
      impact: '+0.2-0.5x',
      category: 'Operations'
    },
    {
      id: 'annual_contracts',
      label: 'Add annual contracts',
      description: 'Improve revenue predictability',
      impact: '+0.3x',
      category: 'Revenue'
    },
    {
      id: 'concentration_20',
      label: 'Reduce concentration to <20%',
      description: 'Diversify customer base',
      impact: '+0.2-0.4x',
      category: 'Risk'
    }
  ];

  const getCategoryColor = (category) => {
    switch (category) {
      case 'Financial': return 'bg-blue-100 text-blue-700';
      case 'Growth': return 'bg-emerald-100 text-emerald-700';
      case 'Operations': return 'bg-purple-100 text-purple-700';
      case 'Revenue': return 'bg-amber-100 text-amber-700';
      case 'Risk': return 'bg-red-100 text-red-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-slate-200 rounded-xl overflow-hidden"
      data-testid="multiple-impact-simulator"
    >
      {/* Header */}
      <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-[#0B4DBB]/5 to-transparent">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-lg bg-[#0B4DBB]/10 flex items-center justify-center">
            <Zap className="w-5 h-5 text-[#0B4DBB]" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900">What-If Simulator</h3>
            <p className="text-sm text-slate-500">Toggle improvements to see impact on your valuation</p>
          </div>
        </div>
      </div>

      {/* Results Display */}
      {result && (
        <div className="p-6 bg-slate-50 border-b border-slate-100">
          <div className="grid grid-cols-3 gap-4">
            {/* Current */}
            <div className="text-center">
              <p className="text-xs text-slate-500 mb-1">Current</p>
              <p className="text-2xl font-bold text-slate-600">{result.current_multiple}x</p>
              <p className="text-sm text-slate-500">{formatCurrency(result.current_valuation)}</p>
            </div>
            
            {/* Arrow */}
            <div className="flex items-center justify-center">
              <ArrowRight className="w-6 h-6 text-slate-400" />
            </div>
            
            {/* Projected */}
            <div className="text-center">
              <p className="text-xs text-slate-500 mb-1">Projected</p>
              <p className="text-2xl font-bold text-[#0B4DBB]">{result.projected_multiple}x</p>
              <p className="text-sm text-[#0B4DBB]">{formatCurrency(result.projected_valuation)}</p>
            </div>
          </div>

          {/* Delta Display */}
          {result.delta_value > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center"
            >
              <div className="flex items-center justify-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
                <span className="text-lg font-bold text-emerald-700">
                  +{formatCurrency(result.delta_value)}
                </span>
                <span className="text-sm text-emerald-600">
                  (+{result.delta_percentage}%)
                </span>
              </div>
              <p className="text-xs text-emerald-600 mt-1">
                Potential value increase with {result.active_scenarios.length} improvement{result.active_scenarios.length !== 1 ? 's' : ''}
              </p>
            </motion.div>
          )}
        </div>
      )}

      {/* Scenario Toggles */}
      <div className="p-6">
        <div className="space-y-3">
          {scenarioList.map((scenario) => (
            <motion.div
              key={scenario.id}
              whileTap={{ scale: 0.98 }}
              onClick={() => toggleScenario(scenario.id)}
              className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${
                scenarios[scenario.id]
                  ? 'bg-[#F0F7FF] border-[#0B4DBB]/30'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`transition-colors ${
                  scenarios[scenario.id] ? 'text-[#0B4DBB]' : 'text-slate-400'
                }`}>
                  {scenarios[scenario.id] ? (
                    <ToggleRight className="w-8 h-8" />
                  ) : (
                    <ToggleLeft className="w-8 h-8" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className={`font-medium ${
                      scenarios[scenario.id] ? 'text-slate-900' : 'text-slate-700'
                    }`}>
                      {scenario.label}
                    </p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${getCategoryColor(scenario.category)}`}>
                      {scenario.category}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500">{scenario.description}</p>
                </div>
              </div>
              <div className="text-right">
                <span className={`text-sm font-semibold ${
                  scenarios[scenario.id] ? 'text-[#0B4DBB]' : 'text-slate-400'
                }`}>
                  {scenario.impact}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mt-6 pt-6 border-t border-slate-100 flex gap-3">
          <button
            onClick={() => setScenarios({
              churn_3pct: true,
              nrr_110: true,
              arr_next_tier: true,
              founder_20h: true,
              annual_contracts: true,
              concentration_20: true
            })}
            className="flex-1 py-2 px-4 text-sm font-medium text-[#0B4DBB] bg-[#F0F7FF] rounded-lg hover:bg-[#DCEAFF] transition-colors"
          >
            Enable All
          </button>
          <button
            onClick={() => setScenarios({
              churn_3pct: false,
              nrr_110: false,
              arr_next_tier: false,
              founder_20h: false,
              annual_contracts: false,
              concentration_20: false
            })}
            className="flex-1 py-2 px-4 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
          >
            Reset All
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default MultipleImpactSimulator;
