import useSWR from 'swr';
import { swrFetcher } from '@/lib/api';

interface ForexPairsResponse {
  pairs: string[];
}

export const useForexPairs = () => {
  const { data, error, isLoading, mutate } = useSWR<ForexPairsResponse>(
    '/api/v1/macro/forex/pairs',
    (url) => swrFetcher<ForexPairsResponse>(url),
    {
      revalidateOnFocus: false,
    }
  );

  return {
    pairs: data?.pairs ?? [],
    isLoading,
    isError: !!error,
    error,
    mutate,
  };
}; 