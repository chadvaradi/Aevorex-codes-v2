import useSWR from 'swr';
import { swrFetcher } from '@/lib/api';

interface TickerTapeItem {
  symbol: string;
  price: number;
  change: number;
  change_percent: number;
  changeColor: 'positive' | 'negative' | 'neutral';
  changeBadgeClass: string;
}

export interface TickerTapeItemWithColor extends TickerTapeItem {
  changeColor: 'positive' | 'negative' | 'neutral';
  changeBadgeClass: string;
}

interface TickerTapeAPIResponse {
  status: string;
  data: TickerTapeItem[];
  metadata: {
    total_symbols: number;
    requested_limit: number;
    data_source: string;
    last_updated: string;
    cache_hit?: boolean;
  };
  message?: string;
}

/**
 * Enhanced ticker tape data hook with color mapping and configuration-driven limits
 */
const fetcher = async (url: string): Promise<TickerTapeAPIResponse> => {
  const response = await swrFetcher<TickerTapeAPIResponse>(url);
  return response as TickerTapeAPIResponse;
};

export const useTickerTapeData = (limit: number = 20) => {
  const key = `/api/v1/stock/ticker-tape/?limit=${limit}`;
  const { data, error, isLoading, mutate } = useSWR<TickerTapeAPIResponse>(
    key,
    fetcher,
    {
      refreshInterval: 0,
      revalidateOnFocus: false,
      shouldRetryOnError: false,
      dedupingInterval: 60_000_000, // gyakorlatilag nincs háttérfrissítés
      keepPreviousData: true as any,
    }
  );

  // Process the data and add color classes
  const processedTickers: TickerTapeItemWithColor[] = (data?.data ?? []).map((ticker) => {
    const changeColor: 'positive' | 'negative' | 'neutral' = ticker.change_percent > 0 ? 'positive' : 
                       ticker.change_percent < 0 ? 'negative' : 'neutral';
    
    const changeBadgeClass = changeColor === 'positive' ? 'bg-success/10 text-success-600' :
                            changeColor === 'negative' ? 'bg-danger/10 text-danger-600' :
                            'bg-neutral/10 text-neutral-500';

    return {
      ...ticker,
      changeColor,
      changeBadgeClass,
    } as TickerTapeItemWithColor;
  }).slice(0, limit);

  return {
    tickers: processedTickers,
    loading: isLoading,
    error: error?.message || (data && data.status !== 'success' ? (data.message || 'Market data unavailable') : null),
    metadata: data?.metadata,
    refresh: mutate,
    totalSymbols: data?.metadata?.total_symbols || 0,
    cacheHit: data?.metadata?.cache_hit || false,
    dataSource: data?.metadata?.data_source || 'unknown',
    status: data?.status || 'unknown',
    message: data?.message,
  };
}; 