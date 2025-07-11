import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export const useECBYieldCurveHistory = (period: string = '1y') => {
  const { data, error, isLoading, mutate } = useSWR(
    `/api/v1/macro/ecb/historical-yield-curve?period=${period}`,
    fetcher,
    { refreshInterval: 60_000 * 60 }
  );

  return {
    data: data?.data ?? [],
    isLoading,
    error,
    mutate,
  };
}; 