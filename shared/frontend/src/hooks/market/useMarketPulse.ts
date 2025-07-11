import useSWR from 'swr';
import { get } from '../../lib/api';

export interface MarketIndex {
  symbol: string; // e.g. ^DJI
  price: number;
  change_pct: number; // %
}

export interface MarketPulseResponse {
  indices: MarketIndex[];
  timestamp: string;
}

export const useMarketPulse = () => {
  const { data, error, isLoading } = useSWR<MarketPulseResponse>(
    '/api/v1/market/indices',
    get,
    {
      refreshInterval: 60000, // 1 percenként frissít
      revalidateOnFocus: false,
      shouldRetryOnError: false,
    }
  );

  // Backend mező `change_percent` → frontend `change_pct` kompatibilitás
  const indices = (data?.indices ?? []).map((idx: any) => ({
    symbol: idx.symbol,
    price: idx.price,
    change_pct: idx.change_percent ?? idx.change_pct ?? 0,
  }));

  return {
    indices,
    timestamp: data?.timestamp,
    isLoading,
    error,
  };
}; 