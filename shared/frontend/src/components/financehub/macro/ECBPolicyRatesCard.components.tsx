import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/Card';
import { Skeleton } from '../../ui/Skeleton';
import PeriodSelector from '../../ui/PeriodSelector';
import { ErrorState } from '../../ui';
import { PolicyRate, formatRate } from './ECBPolicyRatesCard.logic';

export const PolicyRateDisplay: React.FC<{ rate: PolicyRate }> = ({ rate }) => (
  <div className="bg-surface-subtle p-3 rounded-lg text-center">
    <p className="text-sm font-medium text-content-secondary mb-1">{rate.name}</p>
    <p className="text-lg font-semibold text-content-primary">{formatRate(rate.value)}</p>
  </div>
);

export const LoadingSkeleton: React.FC<{ selectedPeriod: string; onPeriodChange: (period: string) => void }> = ({ 
  selectedPeriod, 
  onPeriodChange 
}) => (
  <Card>
    <CardHeader>
      <div className="flex justify-between items-center">
        <div>
          <CardTitle>ECB Policy Rates</CardTitle>
          <p className="text-sm text-content-secondary">
            European Central Bank key interest rates
          </p>
        </div>
        <PeriodSelector
          selectedPeriod={selectedPeriod}
          onPeriodChange={onPeriodChange}
          className="ml-4"
        />
      </div>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-surface-subtle p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <Skeleton className="h-4 w-3/4" />
            </div>
            <Skeleton className="h-8 w-1/2 mb-1" />
            <Skeleton className="h-3 w-full" />
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

export const ErrorDisplay: React.FC<{ 
  selectedPeriod: string; 
  onPeriodChange: (period: string) => void; 
  onRetry: () => void; 
}> = ({ selectedPeriod, onPeriodChange, onRetry }) => (
  <Card>
    <CardHeader>
      <div className="flex justify-between items-center">
        <CardTitle>ECB Policy Rates</CardTitle>
        <PeriodSelector
          selectedPeriod={selectedPeriod}
          onPeriodChange={onPeriodChange}
          className="ml-4"
        />
      </div>
    </CardHeader>
    <CardContent>
      <ErrorState 
        message="Failed to load ECB policy rates. Please try again."
        retryFn={onRetry}
      />
    </CardContent>
  </Card>
);

export const EmptyState: React.FC<{ selectedPeriod: string; onPeriodChange: (period: string) => void }> = ({ 
  selectedPeriod, 
  onPeriodChange 
}) => (
  <Card>
    <CardHeader>
      <div className="flex justify-between items-center">
        <CardTitle>ECB Policy Rates</CardTitle>
        <PeriodSelector
          selectedPeriod={selectedPeriod}
          onPeriodChange={onPeriodChange}
          className="ml-4"
        />
      </div>
    </CardHeader>
    <CardContent>
      <div className="text-center text-sm text-content-tertiary py-8">
        No ECB policy rates available at this time.
      </div>
    </CardContent>
  </Card>
); 