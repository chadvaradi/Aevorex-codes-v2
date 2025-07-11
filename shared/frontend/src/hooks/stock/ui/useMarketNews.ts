import useSWR from 'swr';
import { get } from '@/lib/api';

export interface MarketNewsItem {
  headline: string;
  summary: string;
  url: string;
  source: string;
  timestamp: string;
}

export interface UseMarketNewsOptions {
  limit?: number;
  skip?: boolean;
}

export const useMarketNews = (options: UseMarketNewsOptions = {}) => {
  const { limit = 10, skip = false } = options;
  
  const shouldFetch = !skip;
  const endpoint = shouldFetch ? `/api/v1/market/news?limit=${limit}` : null;

  const { data, error, isLoading, mutate } = useSWR<MarketNewsItem[]>(
    endpoint,
    (url) => get(url),
    {
      revalidateOnFocus: false,
      dedupingInterval: 300000, // 5 minutes
      refreshInterval: 300000, // Auto-refresh every 5 minutes for news
    }
  );

  return {
    news: data ?? [],
    loading: isLoading,
    error: error ? error.message : null,
    mutate,
    refresh: mutate, // Alias for easier usage
  };
}; 