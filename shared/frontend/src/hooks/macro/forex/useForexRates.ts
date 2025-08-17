import useSWR from 'swr';
import { swrFetcher } from '@/lib/api';

interface ForexRatesResponse {
  status: string;
  data: {
    fx_rates: Record<string, Record<string, number>>;
  };
  metadata: {
    source: string;
    date_range: {
      start: string;
      end: string;
    };
  };
}

export const useFxRates = () => {
  const { data, error, isLoading, mutate } = useSWR<ForexRatesResponse>(
    '/api/v1/macro/ecb/fx',
    (url) => swrFetcher<ForexRatesResponse>(url),
    {
      refreshInterval: 300000, // 5 minutes
      revalidateOnFocus: false,
      onError: (error) => {
        console.error('Forex Rates API error:', error);
      },
    }
  );

  return {
    fxRatesData: data?.data?.fx_rates || {},
    metadata: data?.metadata,
    isLoading,
    isError: !!error,
    error: error?.message || null,
    mutate,
  };
}; 