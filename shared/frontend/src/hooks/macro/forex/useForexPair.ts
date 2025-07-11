import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export interface ForexPairResponse {
  status: string;
  pair: string;
  rate: number;
  change?: number;
  change_percent?: number;
  timestamp: string;
  source?: string;
  message?: string;
}

export const useForexPair = (pair: string | null) => {
  const shouldFetch = Boolean(pair);
  const { data, error, isLoading, mutate } = useSWR<ForexPairResponse>(
    shouldFetch ? `/api/v1/macro/forex/${pair}` : null,
    fetcher,
    {
      refreshInterval: 60_000, // 1 perc
    }
  );

  return {
    data,
    error,
    isLoading,
    mutate,
  };
}; 