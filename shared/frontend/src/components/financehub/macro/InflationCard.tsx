import React from 'react';
import { useECBInflation } from '../../../hooks/macro/useECBInflation';

const InflationCard: React.FC = () => {
  const { data: inflationData, loading, error } = useECBInflation();

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="animate-pulse">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 bg-gray-300 rounded"></div>
            <div className="h-6 bg-gray-300 rounded w-32"></div>
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
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Inflation Rates</h3>
        </div>
        <div className="text-red-600 dark:text-red-400">
          Failed to load inflation data. Please try again later.
        </div>
      </div>
    );
  }

  if (!inflationData || inflationData.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Inflation Rates</h3>
        </div>
        <div className="text-gray-500 dark:text-gray-400">No inflation data available</div>
      </div>
    );
  }

  // Get latest inflation record
  const records = inflationData;
  const latestRecord = records[0];
  const previousRecord = records.length > 1 ? records[1] : null;

  // Calculate change
  const currentRate = latestRecord?.cpi;
  const previousRate = previousRecord?.cpi;
  const change = currentRate && previousRate ? currentRate - previousRate : null;
  const changePercent = change && previousRate ? (change / previousRate) * 100 : null;

  // Determine trend and color
  const getTrendColor = (rate: number) => {
    if (rate > 3) return 'text-red-600'; // High inflation
    if (rate > 2) return 'text-orange-600'; // Moderate inflation
    if (rate > 0) return 'text-green-600'; // Low inflation
    return 'text-blue-600'; // Deflation
  };

  const getChangeColor = (change: number) => {
    return change > 0 ? 'text-red-600' : 'text-green-600';
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow duration-300">
      <div className="flex items-center gap-2 mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Inflation Rates</h3>
      </div>

      {/* Current Inflation Rate */}
      <div className="space-y-4">
        <div className="text-center">
          <div className="text-3xl font-bold mb-1">
            <span className={currentRate ? getTrendColor(currentRate) : 'text-gray-500'}>
              {currentRate ? `${currentRate.toFixed(2)}%` : 'N/A'}
            </span>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Current Annual Rate
          </div>
        </div>

        {/* Change Indicator */}
        {change !== null && (
          <div className="text-center">
            <div className={`text-sm font-medium ${change !== null ? getChangeColor(change) : 'text-gray-500'}`}>
              {change > 0 ? '+' : ''}{change.toFixed(2)}% 
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

        {/* Key Metrics */}
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

        {/* Inflation Assessment */}
        {currentRate !== undefined && (
          <div className="mt-4 p-3 rounded-md bg-gray-50 dark:bg-gray-700">
            <div className="text-sm">
              <span className="font-medium text-gray-900 dark:text-white">Assessment: </span>
              <span className={getTrendColor(currentRate)}>
                {currentRate > 4 ? 'High Inflation' :
                 currentRate > 3 ? 'Above Target' :
                 currentRate > 2 ? 'Moderate' :
                 currentRate > 0 ? 'Low Inflation' : 'Deflation'}
              </span>
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              ECB target: ~2.0% annually
            </div>
          </div>
        )}

        {/* Data Source */}
        <div className="pt-2 border-t border-gray-200 dark:border-gray-600">
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>Source: ECB HICP</span>
            <span>Updated: {latestRecord?.date ? new Date(latestRecord.date).toLocaleDateString() : 'N/A'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InflationCard; 