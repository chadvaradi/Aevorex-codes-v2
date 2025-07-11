import useSWR from 'swr';
import { get } from '@/lib/api';

export interface ForexPairRateResponse {
  status: string;
  pair: string;
  rate: number;
  timestamp: string;
  source: string;
}

export const useForexPairRate = (pair: string | null) => {
  const endpoint = pair ? `/api/v1/macro/forex/${pair.replace('/', '')}` : null;
  const { data, error, isLoading, mutate } = useSWR<ForexPairRateResponse>(endpoint, get, {
    refreshInterval: 60_000,
    revalidateOnFocus: false,
  });

  return {
    rateData: data,
    isLoading,
    isError: !!error,
    error,
    mutate,
  };
}; 