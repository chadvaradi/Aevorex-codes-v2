import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useMarketNews } from '../useMarketNews';
import useSWR from 'swr';
import { MarketNewsResponse } from '../../../lib/api';

// Mock the API module
vi.mock('../../../lib/api', () => ({
  get: vi.fn(),
}));

// Mock SWR
vi.mock('swr');

const mockUseSWR = vi.mocked(useSWR);

describe('useMarketNews', () => {
  it('should return initial state', () => {
    mockUseSWR.mockReturnValue({
      data: null,
      error: null,
      isLoading: true,
      isValidating: false,
      mutate: vi.fn(),
    } as MarketNewsResponse);

    const { result } = renderHook(() => useMarketNews());

    expect(result.current.news).toEqual([]);
    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBe(null);
  });

  it('should handle successful data fetch', async () => {
    const mockNews = [
      {
        headline: 'Test News',
        summary: 'Test summary',
        url: 'https://example.com',
        source: 'Test Source',
        timestamp: '2023-01-01T00:00:00Z',
      },
    ];

    mockUseSWR.mockReturnValue({
      data: mockNews,
      error: null,
      isLoading: false,
      isValidating: false,
      mutate: vi.fn(),
    } as MarketNewsResponse);

    const { result } = renderHook(() => useMarketNews());

    await waitFor(() => {
      expect(result.current.news).toEqual(mockNews);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(null);
    });
  });
}); 