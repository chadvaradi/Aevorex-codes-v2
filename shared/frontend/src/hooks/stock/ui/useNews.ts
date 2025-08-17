import useSWR from 'swr';
import { swrFetcher } from '@/lib/api';
import type { NewsArticle } from '../types';

// Helper to normalise backend raw item → NewsArticle
const mapToNewsArticle = (raw: any): NewsArticle => {
  const base = raw.summary ?? raw;
  return {
    title: base.title ?? raw.title ?? 'Untitled',
    summary: base.summary ?? base.description ?? '',
    published_at:
      base.pubDate || raw.published_date || raw.displayTime || new Date().toISOString(),
  };
};

export interface NewsResponse {
  metadata: {
    symbol: string;
    total_articles: number;
    returned_articles: number;
  };
  news: NewsArticle[];
}

export const useStockNews = (
  ticker: string | null,
  { limit = 10, skip = false }: { limit?: number; skip?: boolean } = {}
) => {
  const shouldFetch = ticker && !skip;
  const endpoint = shouldFetch
    ? `/api/v1/stock/${ticker}/news?limit=${limit}`
    : null;

  const { data, error, isLoading } = useSWR<NewsResponse>(
    endpoint,
    (url) => swrFetcher<NewsResponse>(url),
    {
      revalidateOnFocus: false,
      dedupingInterval: 300000,
    }
  );

  return {
    news: data?.news ? data.news.map(mapToNewsArticle) : [],
    metadata: data?.metadata,
    loading: isLoading,
    error: error ? error.message : null,
  };
}; 