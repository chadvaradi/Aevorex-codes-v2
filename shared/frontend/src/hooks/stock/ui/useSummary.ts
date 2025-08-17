import useSWR from 'swr';
import { swrFetcher } from '@/lib/api';

export interface SummaryResponse {
  summary: string;
  updatedAt: string;
}

export const useAISummary = (
  ticker: string | null,
  { skip = false }: { skip?: boolean } = {}
) => {
  const shouldFetch = ticker && !skip;
  const endpoint = shouldFetch
    ? `/api/v1/stock/premium/${ticker}/summary`
    : null;

  const { data, error, isLoading } = useSWR<SummaryResponse>(
    endpoint,
    (url) => swrFetcher<SummaryResponse>(url),
    {
      revalidateOnFocus: false,
      dedupingInterval: 600000,
    }
  );

  return {
    summary: (data as any)?.summary ?? (data as any)?.ai_summary ?? null,
    updatedAt:
      (data as any)?.updatedAt ??
      (data as any)?.metadata?.timestamp ??
      null,
    loading: isLoading,
    error: error ? error.message : null,
  };
}; 