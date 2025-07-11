import useSWR from 'swr';
import api from '@/lib/api';

// Assuming a search result item has this structure.
// This should be aligned with the actual API response.
export interface SearchResult {
  symbol: string;
  name: string;
}

export function useSearchData(query: string) {
  const key =
    query && query.length >= 2
      ? `/api/v1/stock/search?q=${encodeURIComponent(query)}&limit=10`
      : null;

  const { data, isLoading, error } = useSWR<SearchResult[]>(
    key,
    (url: string) => api.get<SearchResult[]>(url),
    {
      dedupingInterval: 60 * 60 * 1000, // 1 hour
    }
  );

  return { data, isLoading, error };
} 