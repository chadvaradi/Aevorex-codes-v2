import useSWR from 'swr';
import { get } from '@/lib/api';
import type { ChartResponse } from '../types';

/**
 * Fetch OHLCV chart data for a given ticker.
 *
 * @param ticker Stock ticker symbol
 * @param period Query param period (defaults `1y`)
 * @param interval Query param interval (defaults `1d`)
 */
export const useChartData = (
  ticker: string | null,
  {
    period = '1y',
    interval = '1d',
    skip = false,
  }: { period?: string; interval?: string; skip?: boolean } = {}
) => {
  const shouldFetch = ticker && !skip;
  const endpoint = shouldFetch
    ? `/api/v1/stock/${ticker}/chart?period=${encodeURIComponent(period)}&interval=${encodeURIComponent(interval)}`
    : null;

  const fetcher = async (url: string): Promise<ChartResponse> => {
    const response = await get<ChartResponse>(url);
    return response.data;
  };

  const { data, error, isLoading } = useSWR<ChartResponse>(
    endpoint,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 300000,
    }
  );

  return {
    chart: data,
    loading: isLoading,
    error: error ? error.message : null,
  };
}; 