import useSWR from 'swr';
import { get } from '@/lib/api';

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
}

/**
 * Enhanced ticker tape data hook with color mapping and configuration-driven limits
 */
export const useTickerTapeData = (limit: number = 20) => {
  // Always attempt fetch; the API client will retry & surface network errors.
  const { data, error, isLoading, mutate } = useSWR<TickerTapeAPIResponse>(
    `/api/v1/stock/ticker-tape/?limit=${limit}`,
    get,
    {
      refreshInterval: 30000, // 30s auto refresh
      revalidateOnFocus: false,
      shouldRetryOnError: false,
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
    error: error?.message || null,
    metadata: data?.metadata,
    refresh: mutate,
    totalSymbols: data?.metadata?.total_symbols || 0,
    cacheHit: data?.metadata?.cache_hit || false,
    dataSource: data?.metadata?.data_source || 'unknown',
  };
}; 