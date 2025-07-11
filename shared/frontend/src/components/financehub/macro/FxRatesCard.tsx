import React from 'react';
import { useFxRates } from '../../../hooks/macro/useForexRates';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui';

const FxRatesCard: React.FC = () => {
  const { fxRatesData, isLoading, isError, mutate, metadata } = useFxRates();

  const handleRetry = () => {
    mutate();
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="space-y-2">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-6 w-3/4" />
        </div>
      );
    }

    if (isError || !fxRatesData) {
      return (
        <ErrorState
          message="Failed to load FX rates from ECB."
          retryFn={handleRetry}
        />
      );
    }

    // Transform backend structure {CUR: {date: rate}} -> [{currency, rate}]
    const latestRatesArr: { currency: string; rate: number }[] = [];
    Object.entries(fxRatesData).forEach(([currency, series]) => {
      const dates = Object.keys(series as Record<string, number>);
      if (dates.length === 0) return;
      const latest = dates.sort().pop() as string;
      const rate = (series as Record<string, number>)[latest];
      latestRatesArr.push({ currency, rate });
    });

    if (latestRatesArr.length === 0) {
      return <div className="text-center text-sm text-gray-500">No FX data available.</div>;
    }

    return (
      <div className="grid grid-cols-2 gap-2">
        {latestRatesArr.map(({ currency, rate }) => (
          <div key={currency} className="flex justify-between items-center text-sm p-1 rounded">
            <span className="font-medium text-gray-600 dark:text-gray-400">EUR/{currency}</span>
            <span className="font-mono text-gray-800 dark:text-gray-200">{rate.toFixed(4)}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        Major FX Rates
      </h3>
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
        Source: ECB ({metadata?.date_range?.end ?? '...'})
      </p>
      {renderContent()}
    </div>
  );
};

export default FxRatesCard; 