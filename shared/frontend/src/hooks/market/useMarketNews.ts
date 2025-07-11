import useSWR from 'swr';
import { get } from '@/lib/api';

export interface MarketNewsItem {
  title: string;
  url: string;
  published_at: string;
  provider: string;
  summary?: string;
}

export interface MarketNewsResponse {
  status: string;
  news: MarketNewsItem[];
  metadata?: Record<string, unknown>;
}

export const useMarketNews = () => {
  const { data, error, isLoading, mutate } = useSWR<MarketNewsResponse>(
    '/api/v1/market/news',
    get,
    {
      refreshInterval: 5 * 60_000, // 5 minutes
      revalidateOnFocus: false,
    }
  );

  return {
    news: data?.news ?? [],
    metadata: data?.metadata,
    isLoading,
    isError: !!error,
    error,
    refresh: mutate,
  };
}; 