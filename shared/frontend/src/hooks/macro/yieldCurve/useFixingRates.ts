import useSWR from 'swr';
import { get } from '@/lib/api';

export interface RawFixingRatesData {
  data?: {
    rates: {
      [date: string]: {
        ecb_rate: number | null;
        bubor_rate: number | null;
      };
    }
  }
}

const API_ENDPOINT = '/api/v1/macro/ecb/historical-yield-curve';

export const useFixingRates = () => {
  const {
    data: rawData,
    error,
    isLoading,
  } = useSWR<RawFixingRatesData>(
    API_ENDPOINT,
    (url) => get(url),
    {
      revalidateOnFocus: false,
      dedupingInterval: 3600000,
    }
  );

  return {
    fixingRatesData: rawData?.data?.rates ?? {},
    isLoading,
    error: error ? error.message : null,
  };
}; 