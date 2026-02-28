import React, { useMemo } from 'react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';

const MiniSparkline = ({ valuations, height = 40 }) => {
  // Transform and limit to last 6 data points
  const chartData = useMemo(() => {
    if (!valuations || valuations.length === 0) return [];
    
    // Sort by date ascending and take last 6
    const sorted = [...valuations]
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
      .slice(-6);
    
    return sorted.map((v, index) => ({
      index,
      value: v.result?.base || 0
    }));
  }, [valuations]);

  // Determine if trend is positive
  const isPositive = useMemo(() => {
    if (chartData.length < 2) return true;
    return chartData[chartData.length - 1].value >= chartData[0].value;
  }, [chartData]);

  // Not enough data - show placeholder
  if (chartData.length < 2) {
    return (
      <div 
        className="flex items-center justify-center text-xs text-slate-300"
        style={{ height }}
      >
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <div 
              key={i} 
              className="w-1 bg-slate-200 rounded-full"
              style={{ height: `${10 + Math.random() * 20}px` }}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
          <defs>
            <linearGradient id={`sparkGradient-${isPositive ? 'up' : 'down'}`} x1="0" y1="0" x2="0" y2="1">
              <stop 
                offset="5%" 
                stopColor={isPositive ? '#10B981' : '#EF4444'} 
                stopOpacity={0.3}
              />
              <stop 
                offset="95%" 
                stopColor={isPositive ? '#10B981' : '#EF4444'} 
                stopOpacity={0}
              />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="value"
            stroke={isPositive ? '#10B981' : '#EF4444'}
            strokeWidth={1.5}
            fill={`url(#sparkGradient-${isPositive ? 'up' : 'down'})`}
            dot={false}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MiniSparkline;
