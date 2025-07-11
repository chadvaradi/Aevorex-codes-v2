import useSWR from 'swr';
import { get } from '../../lib/api';

export type MacroRate = {
  country: string;
  central_bank: string;
  rate_type: string;
  current_rate: number;
  last_change: string;
  next_meeting: string;
};

const API_ENDPOINT = '/api/v1/macro/ecb/rates';

interface AllRatesResponse {
  rates: MacroRate[];
  fx_rates: Record<string, unknown>; // Replace any with proper type
  timestamp: string;
}

export const useMacroRates = () => {
  const {
    data,
    error,
    isLoading: loading,
  } = useSWR<AllRatesResponse>(
    API_ENDPOINT,
    (url) => get(url),
    {
      // Per demo plan: prevent re-fetch on window focus, set 5 min TTL.
      revalidateOnFocus: false,
      dedupingInterval: 300000, // 5 minutes
    }
  );

  return {
    rates: data?.rates ?? [],
    loading,
    error: error ? error.message : null,
  };
}; 