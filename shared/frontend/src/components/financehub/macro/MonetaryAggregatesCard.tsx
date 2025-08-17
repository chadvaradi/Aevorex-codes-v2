import React, { useState } from 'react';
import { useECBMonetaryAggregates } from '../../../hooks/macro/useECBMonetaryAggregates';

const MonetaryAggregatesCard: React.FC = () => {
  const [selectedAggregate, setSelectedAggregate] = useState<string>('M1');
  const { data: monetaryData, loading, error } = useECBMonetaryAggregates();

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="animate-pulse">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 bg-gray-300 rounded"></div>
            <div className="h-6 bg-gray-300 rounded w-48"></div>
          </div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-300 rounded w-full"></div>
            <div className="h-4 bg-gray-300 rounded w-3/4"></div>
            <div className="h-8 bg-gray-300 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border border-red-200 dark:border-red-700">
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Monetary Aggregates</h3>
        </div>
        <div className="text-red-600 dark:text-red-400">
          Failed to load monetary data. Please try again later.
        </div>
      </div>
    );
  }

  if (!monetaryData || monetaryData.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Monetary Aggregates</h3>
        </div>
        <div className="text-gray-500 dark:text-gray-400">No monetary data available</div>
      </div>
    );
  }

  // Get latest monetary record
  const records = monetaryData;
  const latestRecord = records[0];
  const previousRecord = records.length > 1 ? records[1] : null;

  // Get current and previous values for selected aggregate
  const currentValue = latestRecord ? (latestRecord as any)[selectedAggregate.toLowerCase()] : null;
  const previousValue = previousRecord ? (previousRecord as any)[selectedAggregate.toLowerCase()] : null;

  // Calculate change
  const change = currentValue && previousValue ? currentValue - previousValue : null;
  const changePercent = change && previousValue ? (change / previousValue) * 100 : null;

  // Available aggregates
  const aggregates = ['M1', 'M2', 'M3'];

  // Format large numbers
  const formatValue = (value: number) => {
    if (value >= 1000000) {
      return `€${(value / 1000000).toFixed(1)}T`;
    } else if (value >= 1000) {
      return `€${(value / 1000).toFixed(1)}B`;
    }
    return `€${value.toFixed(2)}M`;
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow duration-300">
      <div className="flex items-center gap-2 mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Monetary Aggregates</h3>
      </div>

      {/* Aggregate Selector */}
      <div className="mb-4">
        <div className="flex gap-2">
          {aggregates.map((aggregate) => (
            <button
              key={aggregate}
              onClick={() => setSelectedAggregate(aggregate)}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                selectedAggregate === aggregate
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {aggregate}
            </button>
          ))}
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {selectedAggregate === 'M1' && 'Currency + overnight deposits'}
          {selectedAggregate === 'M2' && 'M1 + deposits up to 2 years'}
          {selectedAggregate === 'M3' && 'M2 + marketable instruments'}
        </div>
      </div>

      {/* Current Value Display */}
      <div className="space-y-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            {currentValue ? formatValue(currentValue) : 'N/A'}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Current {selectedAggregate} Outstanding
          </div>
        </div>

        {/* Change Indicator */}
        {change !== null && (
          <div className="text-center">
            <div className={`text-sm font-medium ${
              change > 0 ? 'text-green-600' : change < 0 ? 'text-red-600' : 'text-gray-500'
            }`}>
              {change > 0 ? '+' : ''}{formatValue(Math.abs(change))}
              {changePercent !== null && (
                <span className="ml-1">
                  ({changePercent > 0 ? '+' : ''}{changePercent.toFixed(1)}%)
                </span>
              )}
              {/* directional glyph removed to comply with no-emoji policy */}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              vs previous period
            </div>
          </div>
        )}

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-600">
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              {latestRecord?.date ? new Date(latestRecord.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'N/A'}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Latest Period</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              {records.length}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Total Records</div>
          </div>
        </div>

        {/* Growth Assessment */}
        {changePercent !== null && (
          <div className="mt-4 p-3 rounded-md bg-gray-50 dark:bg-gray-700">
            <div className="text-sm">
              <span className="font-medium text-gray-900 dark:text-white">Growth: </span>
              <span className={
                Math.abs(changePercent) > 10 ? 'text-red-600' :
                Math.abs(changePercent) > 5 ? 'text-orange-600' :
                'text-green-600'
              }>
                {Math.abs(changePercent) > 10 ? 'High Volatility' :
                 Math.abs(changePercent) > 5 ? 'Moderate Growth' :
                 'Stable'}
              </span>
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              {selectedAggregate} money supply change
            </div>
          </div>
        )}

        {/* Data Source */}
        <div className="pt-2 border-t border-gray-200 dark:border-gray-600">
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>Source: ECB BSI</span>
            <span>Updated: {latestRecord?.date ? new Date(latestRecord.date).toLocaleDateString() : 'N/A'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonetaryAggregatesCard; 