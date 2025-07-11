import { describe, it, expect } from 'vitest';
import { formatValue, formatPercentage, formatBeta, getESGRiskColor } from '../src/components/financehub/stock/bubbles/FinancialMetricsBubble.utils';

describe('FinancialMetricsBubble.utils', () => {
  describe('formatValue', () => {
    it('formats number with commas and suffix', () => {
      expect(formatValue(1234567, ' USD')).toBe('1,234,567 USD');
    });
    it('returns N/A when undefined', () => {
      expect(formatValue(undefined)).toBe('N/A');
    });
  });

  describe('formatPercentage', () => {
    it('converts decimal to percentage string', () => {
      expect(formatPercentage(0.1234)).toBe('12.34%');
    });
  });

  describe('formatBeta', () => {
    it('formats beta to 2 decimals', () => {
      expect(formatBeta(1.23456)).toBe('1.23');
    });
  });

  describe('getESGRiskColor', () => {
    const mapping: Record<string, string> = {
      Low: 'text-green-600',
      Medium: 'text-yellow-600',
      High: 'text-orange-600',
      Severe: 'text-red-600',
      Unknown: 'text-gray-500',
    };

    Object.entries(mapping).forEach(([key, expected]) => {
      it(`maps ${key} to correct tailwind class`, () => {
        expect(getESGRiskColor(key as string)).toBe(expected);
      });
    });
  });
}); 