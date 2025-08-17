import useSWR from 'swr';
import { swrFetcher } from '../../lib/api';

interface ForexPairsResponse {
  pairs: string[];
}

interface ForexRateResponse {
  status: string;
  pair: string;
  rate: number;
  timestamp: string;
  source: string;
}

export const useForexPairs = () => {
  const { data, error, isLoading } = useSWR<ForexPairsResponse>(
    '/api/v1/macro/forex/pairs',
    swrFetcher
  );

  return {
    pairs: data?.pairs,
    loading: isLoading,
    error,
  };
};

export const useForexPairRate = (pair: string | null) => {
  const { data, error, isLoading } = useSWR<ForexRateResponse>(
    pair ? `/api/v1/macro/forex/${pair.replace('/', '')}` : null,
    swrFetcher
  );

  return {
    rateData: data,
    loading: isLoading,
    error,
  };
}; 