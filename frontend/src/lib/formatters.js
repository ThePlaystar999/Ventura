/**
 * Shared formatting utilities for consistent date/number display
 */

/**
 * Format currency value with appropriate suffix (K, M, B)
 * @param {number} value - The numeric value to format
 * @param {Object} options - Formatting options
 * @param {number} options.decimals - Decimal places for millions (default: 1)
 * @param {boolean} options.showZero - Whether to show $0 or dash for zero values
 * @returns {string} Formatted currency string
 */
export function formatCurrency(value, options = {}) {
  const { decimals = 1, showZero = true } = options;
  
  if (value === null || value === undefined) {
    return showZero ? '$0' : '-';
  }
  
  if (value === 0) {
    return showZero ? '$0' : '-';
  }
  
  const absValue = Math.abs(value);
  const sign = value < 0 ? '-' : '';
  
  if (absValue >= 1_000_000_000) {
    return `${sign}$${(absValue / 1_000_000_000).toFixed(decimals)}B`;
  }
  if (absValue >= 1_000_000) {
    return `${sign}$${(absValue / 1_000_000).toFixed(decimals)}M`;
  }
  if (absValue >= 1_000) {
    return `${sign}$${(absValue / 1_000).toFixed(0)}K`;
  }
  return `${sign}$${Math.round(absValue)}`;
}

/**
 * Format date to readable string
 * @param {string|Date} dateInput - Date string or Date object
 * @param {Object} options - Formatting options
 * @param {string} options.format - 'short' (Jan 15) or 'long' (January 15, 2026)
 * @returns {string} Formatted date string
 */
export function formatDate(dateInput, options = {}) {
  const { format = 'short' } = options;
  
  if (!dateInput) return '-';
  
  const date = new Date(dateInput);
  
  if (isNaN(date.getTime())) return '-';
  
  if (format === 'long') {
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  }
  
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

/**
 * Format percentage with optional sign
 * @param {number} value - The percentage value
 * @param {Object} options - Formatting options
 * @param {number} options.decimals - Decimal places (default: 1)
 * @param {boolean} options.showSign - Whether to show +/- sign (default: false)
 * @returns {string} Formatted percentage string
 */
export function formatPercent(value, options = {}) {
  const { decimals = 1, showSign = false } = options;
  
  if (value === null || value === undefined || isNaN(value)) return '-';
  
  const formatted = Math.abs(value).toFixed(decimals);
  const sign = showSign ? (value >= 0 ? '+' : '-') : (value < 0 ? '-' : '');
  
  return `${sign}${formatted}%`;
}

/**
 * Calculate benchmark comparison data
 * @param {number} currentValuation - Current valuation amount
 * @param {number} benchmarkMultiplier - Multiplier for simulated benchmark (default: 1.35)
 * @returns {Object} Benchmark comparison data
 */
export function calculateBenchmark(currentValuation, benchmarkMultiplier = 1.35) {
  if (!currentValuation || currentValuation <= 0) {
    return null;
  }
  
  const benchmark = currentValuation * benchmarkMultiplier;
  const gap = benchmark - currentValuation;
  const gapPercentage = Math.round((gap / benchmark) * 100);
  const isAboveBenchmark = currentValuation >= benchmark;
  
  return {
    currentValuation,
    benchmark,
    gap: Math.abs(gap),
    gapPercentage: Math.abs(gapPercentage),
    isAboveBenchmark
  };
}

/**
 * Calculate valuation delta between two values
 * @param {number} currentValue - Current valuation
 * @param {number} previousValue - Previous valuation
 * @returns {Object} Delta calculation result
 */
export function calculateDelta(currentValue, previousValue) {
  if (!currentValue && !previousValue) {
    return { delta: 0, deltaPercent: 0, hasIncrease: true };
  }
  
  const delta = (currentValue || 0) - (previousValue || 0);
  const deltaPercent = previousValue > 0 
    ? Number(((delta / previousValue) * 100).toFixed(1))
    : 0;
  const hasIncrease = delta >= 0;
  
  return {
    delta,
    deltaPercent,
    hasIncrease
  };
}

/**
 * Calculate gap to target valuation
 * @param {number} currentValuation - Current valuation
 * @param {number} targetValuation - Target valuation
 * @returns {Object} Gap calculation result
 */
export function calculateGapToTarget(currentValuation, targetValuation) {
  if (!targetValuation || targetValuation <= 0) {
    return { gap: 0, gapPercent: 100, progressPercent: 0, achieved: false };
  }
  
  const gap = targetValuation - (currentValuation || 0);
  const gapPercent = Math.round((gap / targetValuation) * 100);
  const progressPercent = Math.min(100, Math.round(((currentValuation || 0) / targetValuation) * 100));
  const achieved = gap <= 0;
  
  return {
    gap: Math.max(0, gap),
    gapPercent: Math.max(0, gapPercent),
    progressPercent,
    achieved
  };
}

/**
 * Calculate potential valuation impact from an opportunity
 * @param {number} currentValuation - Current valuation
 * @param {number} impactPercent - Impact as a percentage (e.g., 15 for 15%)
 * @returns {number} Potential impact amount
 */
export function calculateOpportunityImpact(currentValuation, impactPercent) {
  if (!currentValuation || currentValuation <= 0 || !impactPercent) {
    return 0;
  }
  return Math.round(currentValuation * (impactPercent / 100));
}
