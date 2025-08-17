import React from 'react';
import { AIInsight } from '../../hooks/healthhub/useHealthHubData';

interface AIInsightsSectionProps {
  aiInsights: AIInsight[];
  viewInsightDetails: (insightId: string) => void;
  getInsightsByPriority: (priority: AIInsight['priority']) => AIInsight[];
}

const InsightCard: React.FC<{ 
  insight: AIInsight; 
  onViewDetails: (id: string) => void; 
}> = ({ insight, onViewDetails }) => {
  const getInsightTypeLabel = (type: AIInsight['type']) => {
    switch (type) {
      case 'risk-alert':
        return 'Population Risk Alert';
      case 'optimization':
        return 'Optimization Opportunity';
      case 'trend-analysis':
        return 'Trend Analysis';
      default:
        return 'Health Insight';
    }
  };



  const handleViewDetails = () => {
    onViewDetails(insight.id);
  };

  return (
    <div className={`p-6 rounded-xl border transition-all duration-200 hover:shadow-lg ${
      insight.priority === 'high' 
        ? 'bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border-red-200 dark:border-red-800' 
        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
    }`}>
      {/* Insight Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
              {getInsightTypeLabel(insight.type)}
            </span>
            <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
              {insight.confidence}% confidence
            </span>
          </div>
        </div>
        
        <button 
          onClick={handleViewDetails}
          className="px-3 py-1 text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
        >
          View Details
        </button>
      </div>

      {/* Insight Content */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          {insight.title}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
          {insight.description}
        </p>
      </div>

      {/* Insight Metrics */}
      {insight.metrics && insight.metrics.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {insight.metrics.map((metric, index) => (
            <div key={index} className="text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                {metric.label}
              </p>
              <p className={`text-lg font-semibold ${
                metric.isWarning 
                  ? 'text-orange-600 dark:text-orange-400' 
                  : 'text-gray-900 dark:text-white'
              }`}>
                {metric.value}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const AIInsightsSection: React.FC<AIInsightsSectionProps> = ({
  viewInsightDetails,
  getInsightsByPriority
}) => {
  const highPriorityInsights = getInsightsByPriority('high');
  const otherInsights = [...getInsightsByPriority('medium'), ...getInsightsByPriority('low')];

  return (
    <section id="insights" className="py-20 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            AI-Generated Health Insights
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Machine learning algorithms analyze population health patterns to identify trends and recommendations.
          </p>
        </div>

        {/* High Priority Insights */}
        {highPriorityInsights.length > 0 && (
          <div className="mb-12">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              Priority Health Alerts
            </h3>
            <div className="grid grid-cols-1 gap-6">
              {highPriorityInsights.map((insight) => (
                <InsightCard 
                  key={insight.id} 
                  insight={insight} 
                  onViewDetails={viewInsightDetails} 
                />
              ))}
            </div>
          </div>
        )}

        {/* Other Insights */}
        {otherInsights.length > 0 && (
          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              Additional Health Insights
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {otherInsights.map((insight) => (
                <InsightCard 
                  key={insight.id} 
                  insight={insight} 
                  onViewDetails={viewInsightDetails} 
                />
              ))}
            </div>
          </div>
        )}

        {/* AI Disclaimer */}
        <div className="mt-12 p-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-blue-800 dark:text-blue-200 text-sm font-medium mb-1">
                AI-Generated Insights Disclaimer
              </p>
              <p className="text-blue-700 dark:text-blue-300 text-sm">
                These insights are generated by machine learning algorithms for informational purposes. 
                They should supplement, not replace, professional medical judgment and clinical decision-making.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}; 