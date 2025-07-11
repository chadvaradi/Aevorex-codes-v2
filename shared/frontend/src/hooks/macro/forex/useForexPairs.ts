import useSWR from 'swr';
import { get } from '@/lib/api';

interface ForexPairsResponse {
  pairs: string[];
}

export const useForexPairs = () => {
  const { data, error, isLoading, mutate } = useSWR<ForexPairsResponse>(
    '/api/v1/macro/forex/pairs',
    get,
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