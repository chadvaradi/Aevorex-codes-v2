import useSWR from 'swr';
import { get } from '@/lib/api';
import type { FundamentalsResponse } from '../types';
import React from 'react';

export const useEODHDFundamentals = (
  ticker: string | null,
  { skip = false }: { skip?: boolean } = {}
) => {
  const shouldFetch = ticker && !skip;
  // The consolidated stock fundamentals endpoint lives under /stock
  const endpoint = shouldFetch ? `/api/v1/stock/${ticker}/fundamentals` : null;

  const { data: raw, error, isLoading, mutate } = useSWR<any>(endpoint, get, {
    revalidateOnFocus: false,
    dedupingInterval: 600_000,
  });

  const fundamentals: FundamentalsResponse | undefined = React.useMemo(() => {
    if (!raw || !raw.fundamentals) return undefined;
    const f = raw.fundamentals;
    return {
      symbol: f.symbol,
      lastUpdated: f.timestamp ?? raw.metadata?.timestamp ?? '',
      overview: {
        name: f.company_overview?.name ?? '',
        sector: f.company_overview?.sector ?? '',
        market_cap: f.company_overview?.market_cap ?? null,
        pe_ratio: f.company_overview?.pe_ratio ?? null,
        beta: f.company_overview?.beta ?? null,
      },
      metrics: f.financial_metrics ? [f.financial_metrics] : [],
    };
  }, [raw]);

  return {
    fundamentals,
    loading: isLoading,
    error: error ? error.message : null,
    refresh: mutate,
  };
}; 