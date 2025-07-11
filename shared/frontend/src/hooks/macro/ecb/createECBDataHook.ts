import useSWR from 'swr';
import { get } from '@/lib/api';

export interface ECBGenericResponse<T = any> {
  status: string;
  data: T;
  metadata?: Record<string, any>;
  message?: string;
}

export const createECBDataHook = <T = any>(endpoint: string) => () => {
  const { data, error, isLoading, mutate } = useSWR<ECBGenericResponse<T>>(endpoint, get);

  return {
    data: data?.data,
    metadata: data?.metadata,
    isLoading,
    isError: !!error,
    error,
    mutate,
  };
}; 