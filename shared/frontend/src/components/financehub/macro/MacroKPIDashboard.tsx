import React, { useState, useMemo } from 'react';
import { useECBSts } from '../../../hooks/macro/useECBSts';
import { useECBInflation } from '../../../hooks/macro/useECBInflation';
import { useECBMonetaryAggregates } from '../../../hooks/macro/useECBMonetaryAggregates';

interface KPICardProps {
  title: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  loading?: boolean;
}

const KPICard = React.memo<KPICardProps>(({ title, value, change, trend, loading }) => {
  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
          <div className="h-6 bg-gray-300 rounded w-1/2 mb-1"></div>
          <div className="h-3 bg-gray-300 rounded w-1/4"></div>
        </div>
      </div>
    );
  }

  const trendColor = {
    up: 'text-green-600',
    down: 'text-red-600',
    neutral: 'text-gray-600'
  }[trend || 'neutral'];

  const trendIcon = {
    up: '▲',
    down: '▼',
    neutral: '→',
  }[trend || 'neutral'];

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center mb-2">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">{title}</h3>
      </div>
      <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
        {value}
      </div>
      {change && (
        <div className={`text-sm ${trendColor} flex items-center gap-1`}>
          <span>{trendIcon}</span>
          <span>{change}</span>
        </div>
      )}
    </div>
  );
});

KPICard.displayName = 'KPICard';

const MacroKPIDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'detailed'>('overview');
  
  const { data: stsData, isLoading: stsLoading } = useECBSts();
  const { data: inflationData, loading: inflationLoading } = useECBInflation();
  const { data: monetaryData, loading: monetaryLoading } = useECBMonetaryAggregates();

  const isLoading = stsLoading || inflationLoading || monetaryLoading;

  // Memoize processed data to avoid recalculation
  const processedData = useMemo(() => {
    // Process inflation data - get latest record
    const latestInflation = inflationData && inflationData.length > 0 
      ? inflationData[inflationData.length - 1] 
      : null;
    
    // Process monetary data - get latest record
    const latestMonetary = monetaryData && monetaryData.length > 0 
      ? monetaryData[monetaryData.length - 1] 
      : null;
    
    // Get latest STS data
    const stsRecords = Object.entries(stsData?.data || {});
    const latestStsRecord = stsRecords[stsRecords.length - 1];
    const latestSts = latestStsRecord ? {
      date: latestStsRecord[0],
      sts_index: (latestStsRecord[1] as any)?.retail_trade || 0,
      change_percentage: 0
    } : null;

    return {
      inflation: latestInflation,
      monetary: latestMonetary,
      sts: latestSts
    };
  }, [stsData, inflationData, monetaryData]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {/* Mobile - Stacked View */}
        <div className="grid grid-cols-2 gap-4 md:hidden">
          {[1, 2, 3, 4].map(i => (
            <KPICard key={i} title="" value="" loading={true} />
          ))}
        </div>
        
        {/* Desktop - Tab View */}
        <div className="hidden md:block">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <KPICard key={i} title="" value="" loading={true} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const safeFormat = (val: unknown, digits = 1, suffix = '%'): string => {
    const num = typeof val === 'number' ? val : typeof val === 'string' ? parseFloat(val) : NaN;
    return Number.isFinite(num) ? `${num.toFixed(digits)}${suffix}` : 'N/A';
  };

  const kpiCards: KPICardProps[] = [];

  // Inflation – include only if real value exists
  if (processedData.inflation?.cpi !== undefined && Number.isFinite(processedData.inflation.cpi)) {
    kpiCards.push({
      title: 'Inflation Rate',
      value: safeFormat(processedData.inflation.cpi),
      change: `Latest: ${processedData.inflation.date}`,
      trend: 'neutral',
    });
  }

  // Money Supply M1 – include only if backend delivered real m1
  if (processedData.monetary?.m1 && Number.isFinite(processedData.monetary.m1)) {
    kpiCards.push({
      title: 'Money Supply M1',
      value: `€${(processedData.monetary.m1 / 1000).toFixed(1)}T`,
      change: `Latest: ${processedData.monetary.date}`,
      trend: 'up',
    });
  }

  // Short-term Stats – include only if STS index is numeric
  if (processedData.sts?.sts_index && Number.isFinite(processedData.sts.sts_index)) {
    kpiCards.push({
      title: 'Short-term Stats',
      value: safeFormat(processedData.sts.sts_index, 1, ''),
      change: `Updated: ${processedData.sts.date}`,
      trend: 'neutral',
    });
  }

  // Market Health card removed until real backend metric provided

  return (
    <div className="space-y-4">
      {/* Mobile - Stacked View */}
      <div className="grid grid-cols-2 gap-4 md:hidden">
        {kpiCards.map((card, index) => (
          <KPICard
            key={index}
            title={card.title}
            value={card.value}
            change={card.change}
            trend={card.trend}
          />
        ))}
      </div>
      
      {/* Desktop - Tab View */}
      <div className="hidden md:block">
        <div className="flex space-x-1 mb-4">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'overview'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('detailed')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'detailed'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            Detailed
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpiCards.map((card, index) => (
            <KPICard
              key={index}
              title={card.title}
              value={card.value}
              change={card.change}
              trend={card.trend}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default React.memo(MacroKPIDashboard); 