import { useState } from 'react';
import { useECBPolicyRates } from '../../../hooks/macro/useECBPolicyRates';
import type { ReactNode } from 'react';

export interface PolicyRate {
  name: string;
  value: number;
  icon?: ReactNode; // optional icon visual
  description?: string;
}

export const formatRate = (value: number): string => {
  return `${value.toFixed(2)}%`;
};

export const useECBPolicyRatesLogic = (initialPeriod: string = '1y') => {
  const [selectedPeriod, setSelectedPeriod] = useState(initialPeriod);
  const { latestPolicyRates, metadata, isLoading, isError, error, mutate } = useECBPolicyRates(selectedPeriod);

  const handleRetry = () => {
    mutate();
  };

  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period);
  };

  const transformToPolicyRates = (rates: Record<string, number>): PolicyRate[] => {
    if (!rates) return [];

    // If the backend already returns tenor keys (on,1w,1m…) then map directly
    const TENOR_ORDER = [
      'on', '1w', '2w', '1m', '2m', '3m', '6m', '9m', '12m',
    ];
    const labelMap: Record<string, string> = {
      on: 'O/N',
      '1w': '1W',
      '2w': '2W',
      '1m': '1M',
      '2m': '2M',
      '3m': '3M',
      '4m': '4M',
      '5m': '5M',
      '6m': '6M',
      '7m': '7M',
      '8m': '8M',
      '9m': '9M',
      '10m': '10M',
      '11m': '11M',
      '12m': '12M',
    };

    if (rates['on'] !== undefined || rates['1w'] !== undefined) {
      return TENOR_ORDER.filter(t=>rates[t]!==undefined).map(t=>({
        name: labelMap[t] ?? t.toUpperCase(),
        value: rates[t],
      }));
    }

    // Fallback to old keys
    return Object.entries(rates).map(([name, value]) => ({ name, value }));
  };

  const policyRates = latestPolicyRates ? transformToPolicyRates(latestPolicyRates) : [];

  return {
    selectedPeriod,
    policyRates,
    metadata,
    isLoading,
    isError,
    error,
    handleRetry,
    handlePeriodChange,
    hasData: latestPolicyRates && Object.keys(latestPolicyRates).length > 0
  };
}; 