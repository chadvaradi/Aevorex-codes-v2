import useSWR from 'swr';
import { get } from '@/lib/api';

export interface RawYieldCurveData {
  [date: string]: {
    [tenor: string]: number;
  };
}

const API_ENDPOINT = '/api/v1/macro/ecb/yield-curve';

export const useHistoricalYieldCurve = () => {
  const {
    data: yieldCurveData,
    error,
    isLoading,
  } = useSWR<RawYieldCurveData>(
    API_ENDPOINT,
    (url) => get(url),
    {
      revalidateOnFocus: false,
      dedupingInterval: 3600000,
    }
  );

  return {
    yieldCurveData: yieldCurveData ?? {},
    isLoading,
    error: error ? error.message : null,
  };
}; 