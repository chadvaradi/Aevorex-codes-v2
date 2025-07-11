import React from 'react';
import { useMarketNews } from '../../../hooks/stock/useMarketNews';
import { NewsItem, LoadingState, ErrorState, EmptyState } from './MarketNewsDashboard.components';

const MarketNewsDashboard: React.FC = () => {
  const { news, loading, error, refresh } = useMarketNews({ limit: 20 });
  
  if (loading) {
    return <LoadingState />;
  }
  
  if (error) {
    return <ErrorState error={error} onRetry={refresh} />;
  }
  
  if (!news || news.length === 0) {
    return <EmptyState onRefresh={refresh} />;
  }
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
          Market News
        </h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-neutral-500">
            {news.length} articles
          </span>
          <button
            onClick={() => refresh()}
            className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>
      </div>
      
      <div className="space-y-4">
        {news.map((article, index) => (
          <NewsItem
            key={`${article.url}-${index}`}
            headline={article.headline}
            summary={article.summary}
            url={article.url}
            source={article.source}
            timestamp={article.timestamp}
          />
        ))}
      </div>
      
      <div className="text-center">
        <button
          onClick={() => refresh()}
          className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
        >
          Load More
        </button>
      </div>
    </div>
  );
};

export default MarketNewsDashboard; 