// @ts-nocheck
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock SWR before importing the hook so that the hook picks up the mocked implementation.
vi.mock('swr', () => {
  return {
    __esModule: true,
    default: vi.fn(),
  };
});

import { renderHook } from '@testing-library/react';
import { useFxRates } from '../useForexRates';
import * as api from '@/lib/api';

// Access the mocked useSWR implementation
 
import useSWR from 'swr';
// Cast to any for simpler mocking control in tests
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockedUseSWR: any = useSWR as unknown as any;

// Mock the API module
vi.mock('@/lib/api');

const mockFxRatesResponse = {
  status: 'success',
  data: {
    fx_rates: {
      '2025-01-22': {
        USD: 1.0500,
        GBP: 0.8300,
        JPY: 155.00,
        CHF: 0.9200,
      },
      '2025-01-21': {
        USD: 1.0480,
        GBP: 0.8280,
        JPY: 154.50,
        CHF: 0.9180,
      },
    },
  },
  metadata: {
    source: 'ECB SDMX EXR dataflow',
    date_range: {
      start: '2025-01-21',
      end: '2025-01-22',
      period: 'custom',
    },
  },
  message: 'FX rates retrieved successfully.',
};

describe('useForexRates', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedUseSWR.mockReset();
  });

  describe('Successful Data Fetching', () => {
    it('fetches and returns forex rates data correctly', async () => {
      mockedUseSWR.mockReturnValue({
        data: mockFxRatesResponse,
        error: undefined,
        isLoading: false,
        mutate: vi.fn(),
      });

      const { result } = renderHook(() => useFxRates());

      expect(result.current.isLoading).toBe(false);
      expect(result.current.fxRatesData).toEqual(mockFxRatesResponse.data.fx_rates);
      expect(result.current.metadata).toEqual(mockFxRatesResponse.metadata);
      expect(result.current.isError).toBe(false);
    });

    it('calls the correct API endpoint', () => {
      mockedUseSWR.mockImplementation((key: string) => {
        expect(key).toBe('/api/v1/macro/ecb/fx');
        return {
          data: mockFxRatesResponse,
          error: undefined,
          isLoading: false,
          mutate: vi.fn(),
        } as any;
      });

      renderHook(() => useFxRates());
    });
  });

  describe('Error Handling', () => {
    it('handles API errors gracefully', async () => {
      const mockError = new Error('API Error');
      mockedUseSWR.mockReturnValue({
        data: undefined,
        error: mockError,
        isLoading: false,
        mutate: vi.fn(),
      });

      const { result } = renderHook(() => useFxRates());

      expect(result.current.isError).toBe(true);
      expect(result.current.error).toBe(mockError.message);
      expect(result.current.fxRatesData).toEqual({});
    });

    it('handles network errors', () => {
      const networkError = new Error('Network Error');
      mockedUseSWR.mockReturnValue({
        data: undefined,
        error: networkError,
        isLoading: false,
        mutate: vi.fn(),
      });

      const { result } = renderHook(() => useFxRates());

      expect(result.current.isError).toBe(true);
      expect(result.current.error).toBe(networkError.message);
      expect(result.current.fxRatesData).toEqual({});
    });
  });

  describe('Data Structure Validation', () => {
    it('handles empty rates data', async () => {
      const emptyResponse = {
        ...mockFxRatesResponse,
        data: { fx_rates: {} },
      };

      mockedUseSWR.mockReturnValue({
        data: emptyResponse,
        error: undefined,
        isLoading: false,
        mutate: vi.fn(),
      });

      const { result } = renderHook(() => useFxRates());

      expect(result.current.fxRatesData).toEqual({});
      expect(result.current.isError).toBe(false);
    });

    it('handles malformed response structure', async () => {
      const malformedResponse = {
        status: 'success',
        data: null,
        metadata: mockFxRatesResponse.metadata,
      };

      mockedUseSWR.mockReturnValue({
        data: malformedResponse,
        error: undefined,
        isLoading: false,
        mutate: vi.fn(),
      });

      const { result } = renderHook(() => useFxRates());

      expect(result.current.fxRatesData).toEqual({});
    });
  });

  describe('SWR Configuration', () => {
    it('uses suspense mode correctly', async () => {
      mockedUseSWR.mockReturnValue({
        data: mockFxRatesResponse,
        error: undefined,
        isLoading: false,
        mutate: vi.fn(),
      });

      const { result } = renderHook(() => useFxRates());

      expect(result.current.mutate).toBeDefined();
    });

    it('provides mutate function for manual revalidation', async () => {
      mockedUseSWR.mockReturnValue({
        data: mockFxRatesResponse,
        error: undefined,
        isLoading: false,
        mutate: vi.fn(),
      });

      const { result } = renderHook(() => useFxRates());

      expect(typeof result.current.mutate).toBe('function');
    });
  });

  describe('Currency Coverage', () => {
    it('handles major currency pairs correctly', async () => {
      const majorCurrenciesResponse = {
        ...mockFxRatesResponse,
        data: {
          fx_rates: {
            '2025-01-22': {
              USD: 1.0500,
              GBP: 0.8300,
              JPY: 155.00,
              CHF: 0.9200,
              CAD: 1.4500,
              AUD: 1.6200,
            },
          },
        },
      };

      mockedUseSWR.mockReturnValue({
        data: majorCurrenciesResponse,
        error: undefined,
        isLoading: false,
        mutate: vi.fn(),
      });

      const { result } = renderHook(() => useFxRates());

      const rates = result.current.fxRatesData?.['2025-01-22'];
      expect(rates).toBeDefined();
      expect(rates?.USD).toBe(1.0500);
      expect(rates?.GBP).toBe(0.8300);
      expect(rates?.JPY).toBe(155.00);
      expect(rates?.CHF).toBe(0.9200);
    });
  });
}); 