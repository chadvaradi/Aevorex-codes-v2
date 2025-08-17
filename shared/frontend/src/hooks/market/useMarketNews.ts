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

const fetcher = async (url: string): Promise<MarketNewsResponse> => {
  const response = await get<MarketNewsResponse>(url);
  return response.data;
};

export const useMarketNews = () => {
  const { data, error, isLoading, mutate } = useSWR<MarketNewsResponse>(
    '/api/v1/market/news',
    fetcher,
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