import useSWR from 'swr';
import { swrFetcher } from '@/lib/api';
import { useEffect, useMemo, useRef, useState } from 'react';

// Assuming a search result item has this structure.
// This should be aligned with the actual API response.
export interface SearchResult {
  symbol: string;
  name: string;
}

export function useSearchData(query: string) {
  const [debounced, setDebounced] = useState('');
  const debounceMs = 250;
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      setDebounced(query);
    }, debounceMs);
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [query]);

  const key = useMemo(() => {
    const q = debounced?.trim();
    if (!q || q.length < 2) return null;
    return `/api/v1/stock/search?q=${encodeURIComponent(q)}&limit=10`;
  }, [debounced]);

  const { data, isLoading, error } = useSWR<SearchResult[]>(
    key,
    (url: string) => swrFetcher<SearchResult[]>(url),
    {
      revalidateOnFocus: false,
      dedupingInterval: 5000,
      keepPreviousData: true as any,
    }
  );

  return { data: data ?? [], isLoading, error };
}