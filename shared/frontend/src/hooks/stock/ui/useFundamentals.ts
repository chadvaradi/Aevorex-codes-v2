import useSWR from 'swr';
import { get } from '@/lib/api';
import type { FundamentalsResponse } from '../types';

export const useFundamentals = (
  ticker: string | null,
  { skip = false }: { skip?: boolean } = {}
) => {
  const shouldFetch = ticker && !skip;
  const endpoint = shouldFetch ? `/api/v1/stock/${ticker}/fundamentals` : null;

  const { data, error, isLoading } = useSWR<FundamentalsResponse>(
    endpoint,
    (url) => get(url),
    {
      revalidateOnFocus: false,
      dedupingInterval: 600000, // 10 min
    }
  );

  return {
    fundamentals: data,
    loading: isLoading,
    error: error ? error.message : null,
  };
}; 