import React from 'react';
import { useBuborRates } from '@/hooks/macro/useBuborRates';

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

const ErrorState: React.FC<ErrorStateProps> = ({ message, onRetry }) => (
  <div className="bg-surface-default border border-danger-default rounded-lg p-6 shadow-sm">
    <h3 className="text-lg font-semibold text-content-primary mb-4">BUBOR Rates</h3>
    <div className="text-center py-4">
      <div className="text-danger-default mb-2">
        <svg className="mx-auto h-12 w-12 text-danger-subtle" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.728-.833-2.498 0L4.316 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      <p className="text-sm text-danger-default mb-3">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-danger-default hover:bg-danger-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-danger-default transition-colors"
        >
          Try Again
        </button>
      )}
    </div>
  </div>
);

const LoadingState: React.FC = () => (
  <div className="bg-surface-default border border-border-default rounded-lg p-6 shadow-sm">
    <h3 className="text-lg font-semibold text-content-primary mb-4">BUBOR Rates</h3>
    <div className="animate-pulse space-y-3">
      <div className="h-4 bg-surface-subtle rounded w-3/4" />
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="h-3 bg-surface-subtle rounded w-1/2" />
          <div className="h-4 bg-surface-subtle rounded w-2/3" />
        </div>
        <div className="space-y-2">
          <div className="h-3 bg-surface-subtle rounded w-1/3" />
          <div className="h-4 bg-surface-subtle rounded w-1/2" />
        </div>
      </div>
    </div>
  </div>
);

const BuborRatesCard: React.FC = () => {
  const { latestBuborRates, isLoading, isError, error, rawData } = useBuborRates();

  // Show loading state
  if (isLoading) {
    return <LoadingState />;
  }

  // Show error state with retry option
  if (isError || error) {
    return (
      <ErrorState 
        message="Failed to load BUBOR rates. Please try again."
        onRetry={() => window.location.reload()}
      />
    );
  }

  // Show empty state if no data
  if (!latestBuborRates || Object.keys(latestBuborRates).length === 0) {
    return (
      <div className="bg-surface-default border border-border-default rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-content-primary mb-4">BUBOR Rates</h3>
        <div className="text-center py-8">
          <div className="text-content-tertiary mb-2">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <p className="text-sm text-content-tertiary">No BUBOR rates available at this time.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface-default border border-border-default rounded-lg p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-content-primary mb-4">BUBOR (Interbank Offered Rate)</h3>
      <div className="grid grid-cols-2 gap-4">
        {Object.entries(latestBuborRates).map(([tenor, rate]: [string, number]) => (
          <div key={tenor} className="bg-surface-subtle p-3 rounded-lg">
            <p className="text-sm font-medium text-content-secondary mb-1">{tenor}</p>
            <p className="text-lg font-semibold text-content-primary">{rate.toFixed(2)}%</p>
          </div>
        ))}
      </div>
      
      {/* Debug info in development */}
      {process.env.NODE_ENV === 'development' && rawData && (
        <details className="mt-4 text-xs text-content-tertiary">
          <summary className="cursor-pointer">Debug Info</summary>
          <pre className="mt-2 p-2 bg-surface-subtle rounded text-xs overflow-auto">
            {JSON.stringify(rawData, null, 2)}
          </pre>
        </details>
      )}
    </div>
  );
};

export default BuborRatesCard;
