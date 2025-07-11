import useSWR from 'swr';
import { get } from '@/lib/api';

interface ComprehensiveDataResponse {
  status: string;
  data: Record<string, Record<string, Record<string, number>>>;
  metadata: {
    source: string;
    date_range: {
      start: string;
      end: string;
      period: string;
    };
  };
}

export const useECBComprehensiveData = () => {
  const { data, error, isLoading, mutate } = useSWR<ComprehensiveDataResponse>(
    '/api/v1/macro/ecb/comprehensive',
    get,
    {
      refreshInterval: 300000, // 5 minutes
      revalidateOnFocus: false,
      onError: (error) => {
        console.error('ECB Comprehensive Data API error:', error);
      },
    }
  );

  return {
    data: data?.data || {},
    metadata: data?.metadata,
    loading: isLoading,
    error: error?.message || null,
    mutate,
  };
}; 