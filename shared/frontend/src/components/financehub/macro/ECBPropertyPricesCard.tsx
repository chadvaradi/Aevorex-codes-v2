import React from 'react';
import { useECBRpp } from '../../../hooks/macro/useECBRpp';
import { useECBCpp } from '../../../hooks/macro/useECBCpp';
import { Card, CardHeader, CardTitle, CardContent } from '../../ui/Card';
import { Skeleton } from '../../ui/Skeleton';
import { ErrorState } from '../../ui';

const getLatestValue = (records: any): number | null => {
  if (!records) return null;
  // Handle array of { date, value }
  if (Array.isArray(records)) {
    const latest = records[records.length - 1];
    return typeof latest?.value === 'number' ? latest.value : null;
  }
  // Handle object keyed by date → value
  if (typeof records === 'object') {
    const dates = Object.keys(records).sort();
    if (dates.length) {
      return records[dates[dates.length - 1]] as number;
    }
  }
  return null;
};

const ECBPropertyPricesCard: React.FC = () => {
  const {
    data: rppData,
    isLoading: loadingRpp,
    isError: errorRpp,
  } = useECBRpp();
  const {
    data: cppData,
    isLoading: loadingCpp,
    isError: errorCpp,
  } = useECBCpp();

  const isLoading = loadingRpp || loadingCpp;
  const isError = errorRpp || errorCpp;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Property Price Indices (RPP & CPP)</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <ErrorState message="Failed to load property price data." retryFn={() => window.location.reload()} />
    );
  }

  const rppLatest = getLatestValue(rppData);
  const cppLatest = getLatestValue(cppData);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Property Price Indices</CardTitle>
        <p className="text-sm text-content-secondary">
          Latest residential (RPP) & commercial (CPP) indices
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-surface-subtle p-3 rounded-lg">
            <p className="text-sm font-medium text-content-secondary mb-1">Residential (RPP)</p>
            <p className="text-lg font-semibold text-content-primary">
              {rppLatest !== null ? rppLatest.toFixed(2) : 'N/A'}
            </p>
          </div>
          <div className="bg-surface-subtle p-3 rounded-lg">
            <p className="text-sm font-medium text-content-secondary mb-1">Commercial (CPP)</p>
            <p className="text-lg font-semibold text-content-primary">
              {cppLatest !== null ? cppLatest.toFixed(2) : 'N/A'}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ECBPropertyPricesCard; 