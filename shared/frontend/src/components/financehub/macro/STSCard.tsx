import React, { useState } from 'react';
import { useECBSts } from '../../../hooks/macro/useECBSts';

const STSCard: React.FC = () => {
  const [selectedIndicator, setSelectedIndicator] = useState<string>('retail_trade');
  const { data: stsData, isLoading, error } = useECBSts();

  if (isLoading) {
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
            <div className="h-4 bg-gray-300 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border border-red-200 dark:border-red-700">
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Short-term Statistics</h3>
        </div>
        <div className="text-red-600 dark:text-red-400">
          Failed to load STS data. Please try again later.
        </div>
      </div>
    );
  }

  if (!stsData || !stsData.data) {
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Short-term Statistics</h3>
        </div>
        <div className="text-gray-500 dark:text-gray-400">No STS data available</div>
      </div>
    );
  }

  // Extract available indicators
  const indicators = Array.isArray(stsData.metadata?.indicators) ? stsData.metadata.indicators : [];
  const stsRecords = Object.entries(stsData.data || {});
  
  // Get latest data for selected indicator
  const latestRecord = stsRecords.find(([_, record]) =>
    record && typeof record === 'object' && selectedIndicator in (record as any)
  );

  const latestValue = latestRecord ? (latestRecord[1] as any)[selectedIndicator] : null;
  const latestDate = latestRecord ? latestRecord[0] : null;

  // Calculate trends (simplified)
  const trend = stsRecords.length > 1 ? 
    (parseFloat(latestValue) > parseFloat(Object.values(stsRecords[stsRecords.length - 2][1])[0] || '0') ? 'up' : 'down') : 'neutral';

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow duration-300">
      <div className="flex items-center gap-2 mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Short-term Statistics</h3>
      </div>

      {/* Indicator Selector */}
      {indicators.length > 0 && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Indicator
          </label>
          <select
            value={selectedIndicator}
            onChange={(e) => setSelectedIndicator(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            {indicators.map((indicator: string) => (
              <option key={indicator} value={indicator}>
                {indicator.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Current Value Display */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Current Value:</span>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-gray-900 dark:text-white">
              {latestValue ? parseFloat(latestValue).toFixed(2) : 'N/A'}
            </span>
            {trend !== 'neutral' && (
              <span className={`text-sm ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                {trend === 'up' ? '▲' : '▼'}
              </span>
            )}
          </div>
        </div>
        
        {latestDate && (
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-700 dark:text-gray-300">Last Updated:</span>
            <span className="text-gray-900 dark:text-white">
              {new Date(latestDate).toLocaleDateString()}
            </span>
          </div>
        )}

        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-700 dark:text-gray-300">Total Records:</span>
          <span className="text-gray-900 dark:text-white">
            {stsData.metadata?.total_records || stsRecords.length}
          </span>
        </div>
      </div>

      {/* Data Period */}
      {stsData.metadata && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>Period: {stsData.metadata.start_date} - {stsData.metadata.end_date}</span>
            <span>Source: ECB</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default STSCard; 