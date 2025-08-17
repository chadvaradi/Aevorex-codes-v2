import useSWR from 'swr';
import { get } from '@/lib/api';

export interface BuborRateHistory {
  [date: string]: {
    [tenor: string]: number;
  };
}

export interface BuborData {
  metadata: {
    source: string;
    timestamp: string;
    date_range: {
      start: string;
      end: string;
    }
  };
  rates: BuborRateHistory;
}

// export type BuborResponse = BaseApiResponse<BuborData>;

// Backend API response format
interface BackendBuborResponse {
  status: string;
  metadata: {
    source: string;
    timestamp: string;
    date_range: {
      start: string;
      end: string;
      period: string;
    };
  };
  rates: BuborRateHistory;
  message: string;
}

// Transform backend response to frontend format
const transformBuborData = (backendData: BackendBuborResponse): BuborData | null => {
  if (!backendData?.rates) {
    return null;
  }

  return {
    metadata: {
      source: backendData.metadata.source,
      timestamp: backendData.metadata.timestamp,
      date_range: {
        start: backendData.metadata.date_range.start,
        end: backendData.metadata.date_range.end,
      }
    },
    rates: backendData.rates
  };
};

const fetcher = async (url: string): Promise<BackendBuborResponse> => {
  const response = await get<BackendBuborResponse>(url);
  return response.data;
};

export const useBuborRates = () => {
  const { data, error, isLoading } = useSWR<BackendBuborResponse>(
    '/api/v1/macro/bubor/',
    fetcher,
    { 
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      shouldRetryOnError: false,
      errorRetryCount: 2,
      errorRetryInterval: 1000
    }
  );

  // Transform the data - data is already BackendBuborResponse type
  const transformedData = data ? transformBuborData(data) : null;

  // Helper to get the latest available rates from the historical data
  const getLatestRates = (history: BuborRateHistory | undefined) => {
    if (!history || Object.keys(history).length === 0) {
      return null;
    }
    const latestDate = Object.keys(history).sort().pop();
    return latestDate ? history[latestDate] : null;
  };

  return {
    buborData: transformedData,
    latestBuborRates: getLatestRates(transformedData?.rates),
    isLoading,
    isError: !!error,
    error,
    // Add raw data for debugging
    rawData: data,
  };
}; 