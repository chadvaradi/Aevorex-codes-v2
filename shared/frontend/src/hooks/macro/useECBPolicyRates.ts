import useSWR from 'swr';
import { get } from '@/lib/api';

export interface PolicyRateHistory {
  [date: string]: {
    [rateName: string]: number;
  };
}

export interface ECBPolicyRatesResponse {
  status: string;
  data: {
    rates: PolicyRateHistory;
  };
  metadata: {
    source: string;
    date_range: {
      start: string;
      end: string;
      period: string;
    };
    description: string;
  };
}

export const useECBPolicyRates = (period: string = '1y') => {
  const { data, error, isLoading, mutate } = useSWR<ECBPolicyRatesResponse>(
    `/api/v1/macro/ecb/rates?period=${period}`,
    get,
    {
      refreshInterval: 300000, // 5 minutes
      revalidateOnFocus: false,
      onError: (error) => {
        console.error('ECB Policy Rates API error:', error);
      },
    }
  );

  // Extract latest date-based entry (ignore summary numeric fields)
  const latestPolicyRates = (() => {
    const ratesObj = data?.data?.rates;
    if (!ratesObj) return {};
    const dateKeys = Object.keys(ratesObj).filter(k => /^\d{4}-\d{2}-\d{2}$/.test(k)).sort();
    const latestDateKey = dateKeys.pop();
    if (latestDateKey) {
      return (ratesObj as Record<string, Record<string, number>>)[latestDateKey] ?? {};
    }
    return {};
  })();

  return {
    latestPolicyRates,
    rateHistory: data?.data?.rates || {},
    metadata: data?.metadata,
    isLoading,
    isError: !!error,
    error: error?.message || null,
    mutate,
  };
};

// Helper function to get specific rate by name
export const useSpecificPolicyRate = (rateName: string, period: string = '1y') => {
  const { latestPolicyRates, rateHistory, isLoading, isError, error } = useECBPolicyRates(period);
  
  const currentRate = latestPolicyRates?.[rateName];
  
  // Get historical data for this specific rate
  const historicalData = Object.entries(rateHistory).reduce((acc, [date, rates]) => {
    if (rates[rateName] !== undefined) {
      acc[date] = rates[rateName];
    }
    return acc;
  }, {} as Record<string, number>);

  return {
    currentRate,
    historicalData,
    isLoading,
    isError,
    error,
  };
}; 