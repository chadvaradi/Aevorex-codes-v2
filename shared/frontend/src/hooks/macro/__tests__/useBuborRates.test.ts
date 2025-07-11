import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useBuborRates, BuborData } from '../useBuborRates';

const buildResponse = (): BuborData => ({
  metadata: {
    source: 'test',
    timestamp: new Date().toISOString(),
    date_range: {
      start: '2025-07-10',
      end: '2025-07-11',
    },
  },
  rates: {
    '2025-07-11': { 'O/N': 6.5, '1W': 6.5 },
  },
});

const originalFetch = global.fetch;

describe('useBuborRates', () => {
  beforeEach(() => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ status: 'success', ...buildResponse() }),
      } as Response),
    );
  });

  afterEach(() => {
    global.fetch = originalFetch as any;
    vi.restoreAllMocks();
  });

  it('returns latest rates', async () => {
    const { result } = renderHook(() => useBuborRates());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.latestBuborRates).toEqual({ 'O/N': 6.5, '1W': 6.5 });
  });
}); 