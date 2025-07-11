import React from 'react';
import { Card } from '../../ui/Card';

interface ForexRateCardProps {
  currency: string;
  rate: number;
  previousRate?: number;
  date: string;
  onClick?: () => void;
}

export const ForexRateCard: React.FC<ForexRateCardProps> = ({ 
  currency, 
  rate, 
  previousRate, 
  date,
  onClick
}) => {
  const change = previousRate ? rate - previousRate : 0;
  const changePercent = previousRate ? ((change / previousRate) * 100) : 0;
  
  const isPositive = change > 0;
  const isNegative = change < 0;
  
  return (
    <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer" onClick={onClick}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-neutral-500">EUR</span>
          <span className="text-xs text-neutral-400">→</span>
          <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            {currency}
          </span>
        </div>
        <div className="text-xs text-neutral-400">
          {new Date(date).toLocaleDateString()}
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
          {rate.toFixed(4)}
        </div>
        
        {previousRate && (
          <div className={`flex items-center gap-1 text-sm ${
            isPositive ? 'text-success-600' : 
            isNegative ? 'text-danger-600' : 
            'text-neutral-500'
          }`}>
            {isPositive && '+'}
            {change.toFixed(4)}
            <span className="text-xs">
              ({isPositive && '+'}{changePercent.toFixed(2)}%)
            </span>
          </div>
        )}
      </div>
    </Card>
  );
};

export const LoadingState: React.FC = () => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
        Foreign Exchange Rates
      </h2>
      <div className="h-4 w-24 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <Card key={i} className="p-4 h-24">
          <div className="animate-pulse">
            <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded mb-2" />
            <div className="h-6 bg-neutral-200 dark:bg-neutral-700 rounded w-3/4" />
          </div>
        </Card>
      ))}
    </div>
  </div>
);

export const ErrorState: React.FC = () => (
  <div className="space-y-4">
    <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
      Foreign Exchange Rates
    </h2>
    <Card className="p-6 text-center">
      <div className="text-danger-600 mb-2">
        <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <p className="text-neutral-600 dark:text-neutral-400">
        Failed to load forex rates. Please try again later.
      </p>
    </Card>
  </div>
);

export const EmptyState: React.FC = () => (
  <div className="space-y-4">
    <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
      Foreign Exchange Rates
    </h2>
    <Card className="p-6 text-center">
      <p className="text-neutral-600 dark:text-neutral-400">
        No forex data available.
      </p>
    </Card>
  </div>
); 