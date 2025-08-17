import useSWR from 'swr';
import { swrFetcher } from '../../lib/api';

export interface MonetaryAggregateRecord {
  date: string;
  m1?: number;
  m2?: number;
  m3?: number;
  change_percentage?: number;
}

export interface MonetaryBackendResponse {
  status: string;
  metadata: {
    source: string;
    start_date: string;
    end_date: string;
    records: number;
  };
  data: Record<string, {
    M1: number;
    M2: number;
    M3: number;
  }>;
}

export interface MonetaryAggregatesResponse {
  status: string;
  data: MonetaryAggregateRecord[];
}

export const useECBMonetaryAggregates = () => {
  const { data: rawData, error, isLoading } = useSWR<MonetaryBackendResponse>(
    '/api/v1/macro/ecb/bsi/', // Fixed endpoint - backend uses /bsi/ prefix
    swrFetcher,
    {
      refreshInterval: 300000, // 5 minutes
      revalidateOnFocus: false,
    }
  );

  // Transform backend data to frontend format
  const transformedData: MonetaryAggregateRecord[] = rawData?.data && rawData.status === 'success' 
    ? Object.entries(rawData.data).map(([date, dataPoint]) => ({
        date,
        m1: dataPoint.M1 || 0,
        m2: dataPoint.M2 || 0,
        m3: dataPoint.M3 || 0,
        change_percentage: 0, // Calculate if needed
      })).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) // Latest first
    : [];

  return {
    data: transformedData,
    loading: isLoading,
    error: error,
    metadata: rawData?.metadata,
  };
}; 