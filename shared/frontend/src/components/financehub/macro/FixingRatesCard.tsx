import React from 'react';
import { Card } from '../../ui/Card';
import { useFixingRates } from '../../../hooks/macro/useFixingRates';
import { DocumentArrowDownIcon } from '@heroicons/react/20/solid';
import { useAuth } from '../../../hooks/auth/useAuth';
// DataSourceInfo removed per user request
// Removed TradingView - simplified to table-only per user request

interface FixingRatesCardProps {
  className?: string;
}



const FixingRatesCard: React.FC<FixingRatesCardProps> = ({ 
  className = ''
}) => {
  const { rawBackendData, isLoading } = useFixingRates(); // Simplified - metadata not needed
  const auth = useAuth() as unknown as { plan?: 'free' | 'pro' | 'team' | 'enterprise' };
  const plan = auth?.plan || 'free';

  // Get latest rates from the data
  const getLatestRates = () => {
    if (!rawBackendData?.data) {
      return null;
    }
    
    // Direct backend structure mapping: rawBackendData.data = {ecb_euribor: {...}, bubor: {...}}
    const ecbData = rawBackendData.data.ecb_euribor || {};
    const buborData = rawBackendData.data.bubor || {};
    
    return [
      { period: 'ON', ecb: ecbData.ON, bubor: buborData['O/N'] },
      { period: '1W', ecb: ecbData['1W'], bubor: buborData['1W'] },
      { period: '1M', ecb: ecbData['1M'], bubor: buborData['1M'] },
      { period: '3M', ecb: ecbData['3M'], bubor: buborData['3M'] },
      { period: '6M', ecb: ecbData['6M'], bubor: buborData['6M'] },
      { period: '12M', ecb: ecbData['12M'] || ecbData['1Y'], bubor: buborData['12M'] },
    ];
  };

  const handleExport = () => {
    const rates = getLatestRates();
    if (!rates) return;
    
    // Create CSV with format: 2 rows (BUBOR, Euribor) × 6 columns (ON, 1W, 1M, 3M, 6M, 12M)
    const csvData = [];
    csvData.push(['Rate Type', 'ON', '1W', '1M', '3M', '6M', '12M'].join(','));
    
    // BUBOR row
    const buborRow = ['BUBOR'];
    rates.forEach(({ bubor }) => {
      buborRow.push(bubor ? bubor.toFixed(3) : 'N/A');
    });
    csvData.push(buborRow.join(','));
    
    // Euribor row  
    const euriborRow = ['Euribor'];
    rates.forEach(({ ecb }) => {
      euriborRow.push(ecb ? ecb.toFixed(3) : 'N/A');
    });
    csvData.push(euriborRow.join(','));
    
    const blob = new Blob([csvData.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${new Date().toISOString().split('T')[0]}_bubor_euribor_rates.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <Card className={`relative ${className}`}>
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Fixing Rates
            </h3>
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 animate-pulse rounded"></div>
            </div>
          </div>
          <div className="space-y-2">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex justify-between items-center py-2">
                <div className="w-8 h-4 bg-gray-200 dark:bg-gray-700 animate-pulse rounded"></div>
                <div className="w-16 h-4 bg-gray-200 dark:bg-gray-700 animate-pulse rounded"></div>
                <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 animate-pulse rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  const displayRates = getLatestRates();
  const showFallback = !displayRates || displayRates.length === 0;

  return (
    <Card className={`relative ${className}`}>
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Fixing Rates
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Official ECB €STR + Euribor HSTA + BUBOR rates
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleExport}
              disabled={showFallback || plan === 'free'}
              className="flex items-center space-x-1 px-2 py-1 text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <DocumentArrowDownIcon className="w-3 h-3" />
              <span>CSV</span>
            </button>
          </div>
        </div>

        {/* Simple two-row table layout: BUBOR and Euribor rates */}

        {/* Two-row table: BUBOR and Euribor rates */}
        {displayRates && !isLoading && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="text-left py-2 px-3 text-slate-600 dark:text-slate-400 font-medium">Rate Type</th>
                  <th className="text-center py-2 px-2 text-slate-600 dark:text-slate-400 font-medium">ON</th>
                  <th className="text-center py-2 px-2 text-slate-600 dark:text-slate-400 font-medium">1W</th>
                  <th className="text-center py-2 px-2 text-slate-600 dark:text-slate-400 font-medium">1M</th>
                  <th className="text-center py-2 px-2 text-slate-600 dark:text-slate-400 font-medium">3M</th>
                  <th className="text-center py-2 px-2 text-slate-600 dark:text-slate-400 font-medium">6M</th>
                  <th className="text-center py-2 px-2 text-slate-600 dark:text-slate-400 font-medium">12M</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-slate-100 dark:border-slate-800">
                  <td className="py-3 px-3 font-medium text-slate-900 dark:text-white">
                    BUBOR <span className="text-xs text-slate-500">(HUF)</span>
                  </td>
                  {displayRates.map(({ period, bubor }) => (
                    <td key={`bubor-${period}`} className="text-center py-3 px-2 font-mono text-slate-900 dark:text-white">
                      {bubor ? `${bubor.toFixed(3)}%` : 'N/A'}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-3 px-3 font-medium text-slate-900 dark:text-white">
                    Euribor <span className="text-xs text-slate-500">(EUR)</span>
                  </td>
                  {displayRates.map(({ period, ecb }) => (
                    <td key={`ecb-${period}`} className="text-center py-3 px-2 font-mono text-slate-900 dark:text-white">
                      {ecb ? `${ecb.toFixed(3)}%` : 'N/A'}
                    </td>
                  ))}
                </tr>
                {/* Spread row */}
                <tr>
                  <td className="py-3 px-3 font-medium text-slate-900 dark:text-white">Spread <span className="text-xs text-slate-500">(BUBOR−Euribor)</span></td>
                  {displayRates.map(({ period, bubor, ecb }) => {
                    const v = (typeof bubor === 'number' && typeof ecb === 'number') ? bubor - ecb : null;
                    return (
                      <td key={`spr-${period}`} className={`text-center py-3 px-2 font-mono ${v==null ? 'text-slate-500' : v>=0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        {v==null ? '—' : `${v.toFixed(3)}%`}
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* Simple rates table - no charts needed */}
      </div>

      {/* DataSourceInfo removed per user request */}
    </Card>
  );
};

export default FixingRatesCard;