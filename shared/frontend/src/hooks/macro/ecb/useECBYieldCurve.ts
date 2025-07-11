import useSWR from 'swr';
import { get } from '@/lib/api';

export interface YieldCurvePoint {
  tenor: string; // e.g. '1Y'
  rate: number;
}

export interface YieldCurveResponse {
  date: string;
  points: YieldCurvePoint[];
}

interface BackendYieldCurveResponse {
  status: string;
  metadata: {
    source: string;
    date_range: {
      start: string;
      end: string;
      period: string;
    };
  };
  data: {
    yields: {
      [date: string]: {
        [tenorIndex: string]: number;
      };
    };
  };
  message: string;
}

const transformYieldCurveData = (backendData: BackendYieldCurveResponse): YieldCurveResponse | null => {
  if (!backendData?.data?.yields) {
    return null;
  }

  const yields = backendData.data.yields;
  const dates = Object.keys(yields).sort();

  if (dates.length === 0) {
    return null;
  }

  const latestDate = dates[dates.length - 1];
  const latestYields = yields[latestDate];

  const points: YieldCurvePoint[] = Object.entries(latestYields)
    .map(([tenor, rate]) => ({ tenor, rate }))
    .sort((a, b) => {
      const an = parseFloat(a.tenor);
      const bn = parseFloat(b.tenor);
      return isNaN(an) || isNaN(bn) ? a.tenor.localeCompare(b.tenor) : an - bn;
    });

  return {
    date: latestDate,
    points,
  };
};

export const useECBYieldCurve = () => {
  const { data, error, isLoading, mutate } = useSWR<BackendYieldCurveResponse>(
    '/api/v1/macro/ecb/yield-curve',
    get,
    {
      refreshInterval: 300000,
      revalidateOnFocus: false,
      onError: (error) => {
        console.error('ECB Yield Curve API error:', error);
      },
    }
  );

  const transformedData = data ? transformYieldCurveData(data) : null;

  return {
    curve: transformedData?.points ?? [],
    date: transformedData?.date || null,
    metadata: data?.metadata,
    loading: isLoading,
    error: error?.message || null,
    rawData: data,
    mutate,
  };
}; 