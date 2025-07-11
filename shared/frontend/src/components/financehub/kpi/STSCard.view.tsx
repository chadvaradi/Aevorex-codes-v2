import React from 'react';
import { KPIProps, useKpiValue } from './STSCard.logic';

export const STSCard: React.FC<KPIProps> = ({ title, indicatorKey, stsData }) => {
  const { latestVal, delta, latestDate } = useKpiValue({ indicatorKey, stsData });

  const formatNumber = (n?: number) => (n !== undefined ? n.toLocaleString(undefined, { maximumFractionDigits: 2 }) : '—');

  const deltaColor = delta === undefined ? 'text-gray-500' : delta >= 0 ? 'text-green-600' : 'text-red-600';
  const deltaSign = delta === undefined ? '' : delta > 0 ? '+' : '';

  return (
    <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm p-4 flex flex-col min-w-[140px]">
      <span className="text-xs text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wide">{title}</span>
      <span className="text-2xl font-semibold text-gray-900 dark:text-white">{formatNumber(latestVal)}</span>
      <span className={`text-sm ${deltaColor}`}>{deltaSign}{formatNumber(delta)}</span>
      {latestDate && <span className="mt-1 text-[10px] text-gray-400">{latestDate}</span>}
    </div>
  );
}; 