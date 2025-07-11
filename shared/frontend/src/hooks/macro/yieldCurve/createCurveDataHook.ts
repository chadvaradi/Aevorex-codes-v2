import useSWR from 'swr';
import { get } from '@/lib/api';

export interface YieldCurveResponse {
  status: string;
  source: string;
  curve: Record<string, number | null>;
  date: string;
  [key: string]: any;
}

export const createCurveDataHook = (endpoint: string, refreshMs = 15 * 60_000) => () => {
  const { data, error, isLoading, mutate } = useSWR<YieldCurveResponse>(endpoint, get, {
    refreshInterval: refreshMs,
    revalidateOnFocus: false,
  });

  return {
    curve: data?.curve ?? {},
    date: data?.date ?? '',
    source: data?.source ?? '',
    isLoading,
    isError: !!error,
    error,
    mutate,
  };
}; 