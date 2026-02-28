import React, { useMemo } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';
import { TrendingUp, Info } from 'lucide-react';
import { motion } from 'framer-motion';

const ValuationOverTimeChart = ({ valuations, selectedProjectId }) => {
  // Filter valuations by selected project if specified
  const relevantValuations = useMemo(() => {
    const filtered = selectedProjectId 
      ? valuations.filter(v => v.project_id === selectedProjectId)
      : valuations;
    
    // Sort by date ascending (oldest first for chart)
    return [...filtered].sort((a, b) => 
      new Date(a.created_at) - new Date(b.created_at)
    );
  }, [valuations, selectedProjectId]);

  // Transform data for chart
  const chartData = useMemo(() => {
    return relevantValuations.map((v, index) => ({
      date: new Date(v.created_at).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: relevantValuations.length > 5 ? '2-digit' : undefined
      }),
      value: v.result?.base || 0,
      fullDate: new Date(v.created_at).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      }),
      companyName: v.company_info?.company_name || 'Valuation',
      index: index + 1
    }));
  }, [relevantValuations]);

  // Format currency for display
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

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white rounded-lg shadow-lg border border-slate-200 p-3 text-sm">
          <p className="text-slate-500 text-xs mb-1">{data.fullDate}</p>
          <p className="font-bold text-[#0B4DBB] text-lg">{formatCurrency(data.value)}</p>
          <p className="text-slate-600 text-xs mt-1">{data.companyName}</p>
        </div>
      );
    }
    return null;
  };

  // Calculate trend
  const trend = useMemo(() => {
    if (chartData.length < 2) return null;
    const first = chartData[0].value;
    const last = chartData[chartData.length - 1].value;
    const change = last - first;
    const percentChange = first > 0 ? ((change / first) * 100).toFixed(1) : 0;
    return {
      change,
      percentChange,
      isPositive: change >= 0
    };
  }, [chartData]);

  // Check if we have enough data points
  const hasEnoughData = chartData.length >= 2;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-white rounded-2xl border border-slate-200 p-6"
      data-testid="valuation-chart-section"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#F0F7FF] flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-[#0B4DBB]" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Valuation Over Time</h3>
            <p className="text-sm text-slate-500">
              {hasEnoughData 
                ? `${chartData.length} valuations tracked`
                : 'Track your growth trajectory'
              }
            </p>
          </div>
        </div>
        
        {/* Trend indicator */}
        {trend && (
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
            trend.isPositive 
              ? 'bg-emerald-50 text-emerald-700' 
              : 'bg-red-50 text-red-700'
          }`}>
            <span>{trend.isPositive ? '+' : ''}{trend.percentChange}%</span>
            <span className="text-xs opacity-70">overall</span>
          </div>
        )}
      </div>

      {/* Chart or Empty State */}
      {hasEnoughData ? (
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0B4DBB" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#0B4DBB" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="#E2E8F0" 
                vertical={false}
              />
              <XAxis 
                dataKey="date" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#64748B', fontSize: 12 }}
                dy={10}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#64748B', fontSize: 12 }}
                tickFormatter={formatCurrency}
                width={60}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#0B4DBB"
                strokeWidth={2.5}
                fill="url(#colorValue)"
                dot={{ fill: '#0B4DBB', strokeWidth: 2, stroke: '#fff', r: 4 }}
                activeDot={{ r: 6, fill: '#0B4DBB', stroke: '#fff', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      ) : (
        /* Empty State */
        <div className="h-64 w-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-white rounded-xl border border-dashed border-slate-200">
          <div className="w-16 h-16 rounded-full bg-[#F0F7FF] flex items-center justify-center mb-4">
            <TrendingUp className="w-8 h-8 text-[#0B4DBB] opacity-50" />
          </div>
          <p className="text-slate-600 font-medium mb-1">Not enough data yet</p>
          <p className="text-sm text-slate-400 text-center max-w-xs">
            Add more valuations to track your growth trajectory and visualize your startup's journey.
          </p>
          <div className="flex items-center gap-1.5 mt-4 text-xs text-slate-400">
            <Info className="w-3.5 h-3.5" />
            <span>At least 2 valuations required</span>
          </div>
        </div>
      )}

      {/* Data points indicator */}
      {hasEnoughData && chartData.length > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-sm">
          <div className="text-slate-500">
            <span className="font-medium text-slate-700">{chartData[0].date}</span>
            <span className="mx-2">→</span>
            <span className="font-medium text-slate-700">{chartData[chartData.length - 1].date}</span>
          </div>
          <div className="text-slate-400">
            {formatCurrency(chartData[0].value)} → {formatCurrency(chartData[chartData.length - 1].value)}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default ValuationOverTimeChart;
