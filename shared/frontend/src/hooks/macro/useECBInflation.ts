import useSWR from 'swr';
import { swrFetcher } from '../../lib/api';

export interface InflationRecord {
  date: string;
  cpi: number;
  core_cpi?: number;
  change_percentage?: number;
}

export interface InflationBackendResponse {
  status: string;
  count: number;
  data: Record<string, {
    HICP_All_Items: number;
    HICP_Core: number;
  }>;
}

export interface InflationResponse {
  status: string;
  data: InflationRecord[];
}

export const useECBInflation = () => {
  const { data: rawData, error, isLoading } = useSWR<InflationBackendResponse>(
    '/api/v1/macro/ecb/hicp/', // Fixed endpoint - backend uses /hicp/ prefix
    swrFetcher,
    {
      refreshInterval: 300000, // 5 minutes
      revalidateOnFocus: false,
    }
  );

  // Transform backend data to frontend format
  const transformedData: InflationRecord[] = rawData?.data && rawData.status === 'success' 
    ? Object.entries(rawData.data).map(([date, dataPoint]) => ({
        date,
        cpi: dataPoint.HICP_All_Items || 0,
        core_cpi: dataPoint.HICP_Core || 0,
        change_percentage: 0, // Calculate if needed
      })).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) // Latest first
    : [];

  return {
    data: transformedData,
    loading: isLoading,
    error: error,
    metadata: { count: rawData?.count || 0 },
  };
}; 