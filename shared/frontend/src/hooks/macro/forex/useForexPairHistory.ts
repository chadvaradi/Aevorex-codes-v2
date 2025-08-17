import useSWR from 'swr';
import { swrFetcher } from '@/lib/api';

export interface OHLC {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
}

export interface ForexHistoryResponse {
  status: string;
  pair: string;
  items: OHLC[];
  source: string;
}

export const useForexPairHistory = (pair: string | null, days = 30) => {
  const endpoint = pair ? `/api/v1/macro/forex/${pair.replace('/', '')}/history?days=${days}` : null;

  const { data, error, isLoading, mutate } = useSWR<ForexHistoryResponse>(endpoint, (url) => swrFetcher<ForexHistoryResponse>(url), {
    revalidateOnFocus: false,
    refreshInterval: 5 * 60_000,
  });

  return {
    ohlc: data?.items ?? [],
    isLoading,
    isError: !!error,
    error,
    refresh: mutate,
  };
}; 