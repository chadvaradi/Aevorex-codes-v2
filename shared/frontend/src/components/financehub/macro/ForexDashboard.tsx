import React from 'react';
import { useFxRates } from '../../../hooks/macro/useForexRates';
import { ForexRateCard, LoadingState, ErrorState, EmptyState } from './ForexDashboard.components';
import { useFXDetailModal } from '../forex/FXDetailModal.logic';
import { FXDetailModal } from '../forex/FXDetailModal.view';

const ForexDashboard: React.FC = () => {
  const { fxRatesData, metadata, isLoading, isError } = useFxRates();
  const modalCtrl = useFXDetailModal();
  
  if (isLoading) {
    return <LoadingState />;
  }
  
  if (isError) {
    return <ErrorState />;
  }
  
  if (!fxRatesData || Object.keys(fxRatesData).length === 0) {
    return <EmptyState />;
  }
  
  // Get the latest and previous dates for comparison
  const dates = Object.keys(fxRatesData).sort();
  const latestDate = dates[dates.length - 1];
  const previousDate = dates[dates.length - 2];
  
  const latestRates = fxRatesData[latestDate];
  const previousRates = previousDate ? fxRatesData[previousDate] : undefined;
  
  const currencies = ['USD', 'GBP', 'JPY', 'CHF'];
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
          Foreign Exchange Rates
        </h2>
        <div className="text-sm text-neutral-500">
          {metadata?.source || 'ECB SDMX'}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {currencies.map((currency) => {
          const rate = latestRates?.[currency];
          const previousRate = previousRates?.[currency];
          
          if (!rate) return null;
          
          return (
            <ForexRateCard
              key={currency}
              currency={currency}
              rate={rate}
              previousRate={previousRate}
              date={latestDate}
              onClick={() => modalCtrl.openModal(`EUR/${currency}`)}
            />
          );
        })}
      </div>
      
      {metadata?.date_range && (
        <div className="text-xs text-neutral-400 text-center">
          Data range: {metadata.date_range.start} to {metadata.date_range.end}
        </div>
      )}
      {/* FX Detail Modal */}
      <FXDetailModal controller={modalCtrl} />
    </div>
  );
};

export default ForexDashboard; 