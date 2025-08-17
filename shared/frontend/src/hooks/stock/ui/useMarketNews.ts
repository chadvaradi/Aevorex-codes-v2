import useSWR from 'swr';
import { swrFetcher } from '@/lib/api';

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

  // The backend may return one of the following shapes:
  // 1) MarketNewsItem[]
  // 2) { news: MarketNewsItem[] }
  // 3) { data: { news: MarketNewsItem[] } }
  const { data, error, isLoading, mutate } = useSWR<any>(
    endpoint,
    (url) => swrFetcher<any>(url),
    {
      revalidateOnFocus: false,
      dedupingInterval: 300000, // 5 minutes
      refreshInterval: 300000, // Auto-refresh every 5 minutes for news
    }
  );

  const normalised: MarketNewsItem[] = Array.isArray(data)
    ? data
    : Array.isArray(data?.news)
      ? data.news
      : Array.isArray(data?.data?.news)
        ? data.data.news
        : [];

  return {
    news: normalised,
    loading: isLoading,
    error: error ? (error as Error).message : null,
    mutate,
    refresh: mutate,
  };
}; 