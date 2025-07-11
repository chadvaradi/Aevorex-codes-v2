import React from 'react';
import { useECBComprehensiveData } from '../../../hooks/macro/useECBComprehensiveData';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/Card';
import { Skeleton } from '../../ui/Skeleton';
import { ErrorState } from '../../ui';
import { DataPoint, formatValue, extractDataPoints } from './ECBComprehensiveCard.utils';

const DataPointDisplay: React.FC<{ dataPoint: DataPoint }> = ({ dataPoint }) => (
  <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
      {dataPoint.label}
    </p>
    <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
      {formatValue(dataPoint.value, dataPoint.unit)}
    </p>
    {dataPoint.change !== undefined && (
      <p className={`text-xs ${dataPoint.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
        {dataPoint.change >= 0 ? '+' : ''}{dataPoint.change.toFixed(2)}% MoM
      </p>
    )}
  </div>
);

const ECBComprehensiveCard: React.FC = () => {
  const { data, loading, error, mutate } = useECBComprehensiveData();

  const handleRetry = () => {
    mutate();
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>ECB Economic Indicators</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-6 w-1/2 mb-1" />
                <Skeleton className="h-3 w-1/3" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>ECB Economic Indicators</CardTitle>
        </CardHeader>
        <CardContent>
          <ErrorState message="Failed to load ECB economic data." retryFn={handleRetry} />
        </CardContent>
      </Card>
    );
  }

  if (!data || Object.keys(data).length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>ECB Economic Indicators</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-sm text-gray-500">
            No ECB economic data available.
          </div>
        </CardContent>
      </Card>
    );
  }

  const dataPoints = extractDataPoints(data);

  return (
    <Card>
      <CardHeader>
        <CardTitle>ECB Economic Indicators</CardTitle>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Comprehensive economic data from ECB SDMX
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {dataPoints.map((point, index) => (
            <DataPointDisplay key={index} dataPoint={point} />
          ))}
        </div>
        
        {dataPoints.length === 0 && (
          <div className="text-center text-sm text-gray-500">
            No data points available for display.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ECBComprehensiveCard; 