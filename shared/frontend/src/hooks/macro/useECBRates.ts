import useSWR from 'swr';
import { swrFetcher } from '../../lib/api';

export interface RateHistory {
  [date: string]: {
    [rateName: string]: number;
  };
}

export interface ECBData {
  status: string;
  metadata: {
    source: string;
    date_range: {
      start: string;
      end: string;
      period: string;
    };
  };
  rates: RateHistory;
  message: string;
}

const getLatestRates = (history: RateHistory | undefined) => {
    if (!history || Object.keys(history).length === 0) {
      return null;
    }
    const latestDate = Object.keys(history).sort().pop();
    return latestDate ? history[latestDate] : null;
};


export const useECBRates = () => {
  const { data, error, isLoading } = useSWR<ECBData>(
    '/api/v1/macro/ecb/rates?period=1y',
    (url) => swrFetcher<ECBData>(url)
  );

  return {
    ecbData: data,
    latestRates: getLatestRates(data?.rates),
    isLoading,
    isError: !!error,
    error,
  };
}; 