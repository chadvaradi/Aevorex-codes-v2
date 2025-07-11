import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/Card';
import PeriodSelector from '../../ui/PeriodSelector';
import { useECBPolicyRatesLogic } from './ECBPolicyRatesCard.logic';
import { 
  LoadingSkeleton, 
  ErrorDisplay, 
  EmptyState, 
  PolicyRateDisplay 
} from './ECBPolicyRatesCard.components';

const ECBPolicyRatesCard: React.FC = () => {
  const {
    selectedPeriod,
    policyRates,
    metadata,
    isLoading,
    isError,
    error,
    handleRetry,
    handlePeriodChange,
    hasData
  } = useECBPolicyRatesLogic();

  if (isLoading) {
    return <LoadingSkeleton selectedPeriod={selectedPeriod} onPeriodChange={handlePeriodChange} />;
  }

  if (isError || error) {
    return (
      <ErrorDisplay 
        selectedPeriod={selectedPeriod} 
        onPeriodChange={handlePeriodChange} 
        onRetry={handleRetry} 
      />
    );
  }

  if (!hasData) {
    return <EmptyState selectedPeriod={selectedPeriod} onPeriodChange={handlePeriodChange} />;
  }

  return (
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
            onPeriodChange={handlePeriodChange}
            className="ml-4"
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {policyRates.map((rate, index) => (
            <PolicyRateDisplay key={index} rate={rate} />
          ))}
        </div>
        
        {policyRates.length === 0 && (
          <div className="text-center text-sm text-content-tertiary py-4">
            No policy rates data available for display.
          </div>
        )}
        
        {/* Metadata display */}
        {metadata && (
          <div className="mt-4 pt-4 border-t border-border-default">
            <p className="text-xs text-content-tertiary">
              Data period: {metadata.date_range?.start} to {metadata.date_range?.end}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ECBPolicyRatesCard; 