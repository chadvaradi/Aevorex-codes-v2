import React from 'react';
import { Card } from '../../ui/Card';

interface NewsItemProps {
  headline: string;
  summary: string;
  url: string;
  source: string;
  timestamp: string;
}

const formatTimeAgo = (timestamp: string) => {
  const now = new Date();
  const newsTime = new Date(timestamp);
  const diffInMinutes = Math.floor((now.getTime() - newsTime.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  } else if (diffInMinutes < 1440) {
    return `${Math.floor(diffInMinutes / 60)}h ago`;
  } else {
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  }
};

export const NewsItem: React.FC<NewsItemProps> = ({ 
  headline, 
  summary, 
  url, 
  source, 
  timestamp 
}) => {
  return (
    <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
      <a 
        href={url} 
        target="_blank" 
        rel="noopener noreferrer"
        className="block"
      >
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-primary-600 dark:text-primary-400">
              {source}
            </span>
            <span className="text-xs text-neutral-400">•</span>
            <span className="text-xs text-neutral-500">
              {formatTimeAgo(timestamp)}
            </span>
          </div>
          <div className="text-neutral-400 hover:text-primary-600 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </div>
        </div>
        
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2 line-clamp-2">
          {headline}
        </h3>
        
        <p className="text-neutral-600 dark:text-neutral-400 text-sm line-clamp-3">
          {summary}
        </p>
      </a>
    </Card>
  );
};

export const LoadingState: React.FC = () => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
        Market News
      </h2>
      <div className="h-4 w-20 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse" />
    </div>
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <Card key={i} className="p-4">
          <div className="animate-pulse">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-24" />
              <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-16" />
            </div>
            <div className="h-6 bg-neutral-200 dark:bg-neutral-700 rounded mb-2" />
            <div className="space-y-2">
              <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-full" />
              <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-5/6" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  </div>
);

export const ErrorState: React.FC<{ error: string; onRetry: () => void }> = ({ error, onRetry }) => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
        Market News
      </h2>
      <button
        onClick={onRetry}
        className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
      >
        Retry
      </button>
    </div>
    <Card className="p-6 text-center">
      <div className="text-danger-600 mb-2">
        <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <p className="text-neutral-600 dark:text-neutral-400 mb-2">
        Failed to load market news
      </p>
      <p className="text-sm text-neutral-500">
        {error}
      </p>
    </Card>
  </div>
);

export const EmptyState: React.FC<{ onRefresh: () => void }> = ({ onRefresh }) => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
        Market News
      </h2>
      <button
        onClick={onRefresh}
        className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
      >
        Refresh
      </button>
    </div>
    <Card className="p-6 text-center">
      <div className="text-neutral-400 mb-2">
        <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
        </svg>
      </div>
      <p className="text-neutral-600 dark:text-neutral-400">
        No market news available
      </p>
    </Card>
  </div>
); 