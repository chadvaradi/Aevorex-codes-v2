import React from 'react';
import { HealthMetric } from '../../hooks/healthhub/useHealthHubData';

interface MetricsDashboardProps {
  healthMetrics: HealthMetric[];
  selectedTimeframe: string;
  updateTimeframe: (timeframe: string) => void;
  exportReport: () => Promise<void>;
  getMetricsByType: (isPrimary: boolean) => HealthMetric[];
}

const MetricCard: React.FC<{ metric: HealthMetric }> = ({ metric }) => {
  const getTrendIcon = (trend: HealthMetric['trend']) => {
    switch (trend) {
      case 'positive':
        return '↗';
      case 'negative':
        return '↘';
      default:
        return '→';
    }
  };

  const getTrendColorClass = (trend: HealthMetric['trend']) => {
    switch (trend) {
      case 'positive':
        return 'text-green-600 dark:text-green-400';
      case 'negative':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  return (
    <div className={`p-6 rounded-xl border transition-all duration-200 hover:shadow-lg ${
      metric.isPrimary 
        ? 'bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border-red-200 dark:border-red-800' 
        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
    }`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {metric.title}
        </h3>
        <span className={`text-sm font-medium ${getTrendColorClass(metric.trend)}`}>
          {getTrendIcon(metric.trend)} {metric.trendValue}
        </span>
      </div>
      
      <div className="flex items-baseline mb-2">
        <span className="text-3xl font-bold text-gray-900 dark:text-white">
          {metric.value}
        </span>
        <span className="ml-1 text-lg text-gray-500 dark:text-gray-400">
          {metric.unit}
        </span>
      </div>
      
      <p className="text-sm text-gray-600 dark:text-gray-400">
        {metric.subtitle}
      </p>
    </div>
  );
};

export const MetricsDashboard: React.FC<MetricsDashboardProps> = ({
  selectedTimeframe,
  updateTimeframe,
  exportReport,
  getMetricsByType
}) => {
  const primaryMetrics = getMetricsByType(true);
  const secondaryMetrics = getMetricsByType(false);

  const handleTimeframeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateTimeframe(e.target.value);
  };

  const handleExportClick = async () => {
    try {
      await exportReport();
      // Could show a toast notification here
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  return (
    <section id="analytics" className="py-20 bg-gray-50 dark:bg-gray-800/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Dashboard Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-12">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Population Health Overview
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Real-time analytics for healthcare decision-making
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 mt-6 lg:mt-0">
            <select 
              value={selectedTimeframe}
              onChange={handleTimeframeChange}
              className="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="30-days">Last 30 Days</option>
              <option value="quarter">Last Quarter</option>
              <option value="year">Last Year</option>
            </select>
            
            <button 
              onClick={handleExportClick}
              className="px-6 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors flex items-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export Report
            </button>
          </div>
        </div>

        {/* Primary KPI */}
        {primaryMetrics.length > 0 && (
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Primary Health Indicator
            </h3>
            <div className="grid grid-cols-1 gap-6">
              {primaryMetrics.map((metric) => (
                <MetricCard key={metric.id} metric={metric} />
              ))}
            </div>
          </div>
        )}

        {/* Secondary KPIs */}
        {secondaryMetrics.length > 0 && (
          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Supporting Metrics
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {secondaryMetrics.map((metric) => (
                <MetricCard key={metric.id} metric={metric} />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}; 
export default MetricsDashboard;
