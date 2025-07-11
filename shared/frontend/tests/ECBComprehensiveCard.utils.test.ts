import { describe, it, expect } from 'vitest';
import { formatValue, getLatestValue } from '../src/components/financehub/macro/ECBComprehensiveCard.utils';

describe('ECBComprehensiveCard.utils', () => {
  describe('formatValue', () => {
    it('formats percentage', () => {
      expect(formatValue(3.4567, '%')).toBe('3.46%');
    });
    it('formats billion EUR', () => {
      expect(formatValue(2500, 'billion EUR')).toBe('€2.5B');
    });
    it('formats default', () => {
      expect(formatValue(1.234, 'index')).toBe('1.23');
    });
  });

  describe('getLatestValue', () => {
    it('returns null when series missing', () => {
      expect(getLatestValue({}, 'M1')).toBeNull();
    });

    it('returns latest value for series', () => {
      const cat = {
        M1: {
          '2024-01': 1,
          '2025-01': 2,
        },
      };
      expect(getLatestValue(cat, 'M1')).toBe(2);
    });
  });
}); 