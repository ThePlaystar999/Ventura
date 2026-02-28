/**
 * Unit tests for deterministic computations
 * Run with: cd /app/frontend && yarn test --watchAll=false
 */

import {
  formatCurrency,
  formatDate,
  formatPercent,
  calculateBenchmark,
  calculateDelta,
  calculateGapToTarget,
  calculateOpportunityImpact
} from './formatters';

describe('formatCurrency', () => {
  test('formats millions correctly', () => {
    expect(formatCurrency(1500000)).toBe('$1.5M');
    expect(formatCurrency(2000000)).toBe('$2.0M');
    expect(formatCurrency(10500000)).toBe('$10.5M');
  });

  test('formats thousands correctly', () => {
    expect(formatCurrency(500000)).toBe('$500K');
    expect(formatCurrency(50000)).toBe('$50K');
    expect(formatCurrency(1000)).toBe('$1K');
  });

  test('formats small values correctly', () => {
    expect(formatCurrency(500)).toBe('$500');
    expect(formatCurrency(99)).toBe('$99');
  });

  test('handles zero and null values', () => {
    expect(formatCurrency(0)).toBe('$0');
    expect(formatCurrency(null)).toBe('$0');
    expect(formatCurrency(undefined)).toBe('$0');
    expect(formatCurrency(0, { showZero: false })).toBe('-');
  });

  test('handles billions', () => {
    expect(formatCurrency(1500000000)).toBe('$1.5B');
    expect(formatCurrency(2000000000)).toBe('$2.0B');
  });

  test('handles negative values', () => {
    expect(formatCurrency(-1500000)).toBe('-$1.5M');
    expect(formatCurrency(-50000)).toBe('-$50K');
  });
});

describe('formatPercent', () => {
  test('formats percentages correctly', () => {
    expect(formatPercent(25)).toBe('25.0%');
    expect(formatPercent(25.5)).toBe('25.5%');
    expect(formatPercent(100)).toBe('100.0%');
  });

  test('handles sign option', () => {
    expect(formatPercent(25, { showSign: true })).toBe('+25.0%');
    expect(formatPercent(-15, { showSign: true })).toBe('-15.0%');
    expect(formatPercent(0, { showSign: true })).toBe('+0.0%');
  });

  test('handles null/undefined', () => {
    expect(formatPercent(null)).toBe('-');
    expect(formatPercent(undefined)).toBe('-');
    expect(formatPercent(NaN)).toBe('-');
  });
});

describe('formatDate', () => {
  test('formats dates in short format', () => {
    const result = formatDate('2026-02-28');
    expect(result).toMatch(/Feb.*28.*2026/);
  });

  test('formats dates in long format', () => {
    const result = formatDate('2026-02-28', { format: 'long' });
    expect(result).toMatch(/February.*28.*2026/);
  });

  test('handles invalid dates', () => {
    expect(formatDate(null)).toBe('-');
    expect(formatDate('')).toBe('-');
    expect(formatDate('invalid')).toBe('-');
  });
});

describe('calculateBenchmark', () => {
  test('calculates benchmark correctly when below benchmark', () => {
    const result = calculateBenchmark(1000000, 1.35);
    
    expect(result.currentValuation).toBe(1000000);
    expect(result.benchmark).toBe(1350000);
    expect(result.gap).toBe(350000);
    expect(result.gapPercentage).toBe(26); // 350000/1350000 ≈ 26%
    expect(result.isAboveBenchmark).toBe(false);
  });

  test('calculates benchmark correctly when above benchmark', () => {
    const result = calculateBenchmark(1500000, 1.0); // Same benchmark
    
    expect(result.currentValuation).toBe(1500000);
    expect(result.benchmark).toBe(1500000);
    expect(result.gap).toBe(0);
    expect(result.isAboveBenchmark).toBe(true);
  });

  test('returns null for invalid inputs', () => {
    expect(calculateBenchmark(0)).toBe(null);
    expect(calculateBenchmark(null)).toBe(null);
    expect(calculateBenchmark(-1000)).toBe(null);
  });

  test('uses custom multiplier', () => {
    const result = calculateBenchmark(1000000, 1.5);
    expect(result.benchmark).toBe(1500000);
  });
});

describe('calculateDelta', () => {
  test('calculates positive delta correctly', () => {
    const result = calculateDelta(1500000, 1000000);
    
    expect(result.delta).toBe(500000);
    expect(result.deltaPercent).toBe(50);
    expect(result.hasIncrease).toBe(true);
  });

  test('calculates negative delta correctly', () => {
    const result = calculateDelta(800000, 1000000);
    
    expect(result.delta).toBe(-200000);
    expect(result.deltaPercent).toBe(-20);
    expect(result.hasIncrease).toBe(false);
  });

  test('handles zero previous value', () => {
    const result = calculateDelta(1000000, 0);
    
    expect(result.delta).toBe(1000000);
    expect(result.deltaPercent).toBe(0);
    expect(result.hasIncrease).toBe(true);
  });

  test('handles both zero values', () => {
    const result = calculateDelta(0, 0);
    
    expect(result.delta).toBe(0);
    expect(result.deltaPercent).toBe(0);
    expect(result.hasIncrease).toBe(true);
  });

  test('handles null values', () => {
    expect(calculateDelta(null, null).delta).toBe(0);
    expect(calculateDelta(1000000, null).delta).toBe(1000000);
  });
});

describe('calculateGapToTarget', () => {
  test('calculates gap correctly when not achieved', () => {
    const result = calculateGapToTarget(600000, 1000000);
    
    expect(result.gap).toBe(400000);
    expect(result.gapPercent).toBe(40);
    expect(result.progressPercent).toBe(60);
    expect(result.achieved).toBe(false);
  });

  test('calculates correctly when target achieved', () => {
    const result = calculateGapToTarget(1200000, 1000000);
    
    expect(result.gap).toBe(0);
    expect(result.gapPercent).toBe(0);
    expect(result.progressPercent).toBe(100); // Capped at 100
    expect(result.achieved).toBe(true);
  });

  test('handles zero current valuation', () => {
    const result = calculateGapToTarget(0, 1000000);
    
    expect(result.gap).toBe(1000000);
    expect(result.gapPercent).toBe(100);
    expect(result.progressPercent).toBe(0);
    expect(result.achieved).toBe(false);
  });

  test('handles invalid target', () => {
    expect(calculateGapToTarget(1000000, 0).progressPercent).toBe(0);
    expect(calculateGapToTarget(1000000, null).progressPercent).toBe(0);
  });
});

describe('calculateOpportunityImpact', () => {
  test('calculates impact correctly', () => {
    expect(calculateOpportunityImpact(1000000, 15)).toBe(150000);
    expect(calculateOpportunityImpact(2500000, 10)).toBe(250000);
    expect(calculateOpportunityImpact(500000, 20)).toBe(100000);
  });

  test('handles zero/null values', () => {
    expect(calculateOpportunityImpact(0, 15)).toBe(0);
    expect(calculateOpportunityImpact(null, 15)).toBe(0);
    expect(calculateOpportunityImpact(1000000, 0)).toBe(0);
    expect(calculateOpportunityImpact(1000000, null)).toBe(0);
  });

  test('rounds to nearest integer', () => {
    expect(calculateOpportunityImpact(1000000, 7)).toBe(70000);
    expect(calculateOpportunityImpact(333333, 15)).toBe(50000);
  });
});
