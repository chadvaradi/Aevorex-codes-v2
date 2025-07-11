import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useForexPair, ForexPairResponse } from '../useForexPair';

// Helper to build mock JSON response
const buildResponse = (pair = 'EUR/USD'): ForexPairResponse => ({
  status: 'success',
  pair,
  rate: 1.0932,
  timestamp: new Date().toISOString(),
});

// Global fetch mock
const originalFetch = global.fetch;

describe('useForexPair', () => {
  beforeEach(() => {
    (global as any).fetch = vi.fn((url: string) => {
      expect(url).toContain('/api/v1/macro/forex/EUR/USD');
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(buildResponse()),
      } as Response);
    });
  });

  afterEach(() => {
    (global as any).fetch = originalFetch;
    vi.resetAllMocks();
  });

  it('fetches forex pair data and returns parsed object', async () => {
    const { result } = renderHook(() => useForexPair('EUR/USD'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data?.pair).toBe('EUR/USD');
    expect(typeof result.current.data?.rate).toBe('number');
  });
}); 