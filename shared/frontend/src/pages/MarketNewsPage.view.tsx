import React from 'react';
import { useMarketNews } from '@/hooks/market/useMarketNews';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

const MarketNewsPage: React.FC = () => {
  const { news, isLoading, isError, refresh } = useMarketNews();

  let content: JSX.Element;
  if (isLoading) {
    content = (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    );
  } else if (isError) {
    content = <ErrorState message="Failed to load market news." retryFn={refresh} />;
  } else if (!news.length) {
    content = <div className="text-sm text-content-secondary">No news available.</div>;
  } else {
    content = (
      <div className="space-y-4">
        {news.map((item) => (
          <a
            key={item.url}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block bg-surface-default border border-border-default rounded-lg p-4 hover:bg-surface-subtle transition-colors"
          >
            <h3 className="font-medium text-content-primary mb-1">{item.title}</h3>
            <div className="text-xs text-content-secondary flex justify-between">
              <span>{new Date(item.published_at).toLocaleString()}</span>
              <span>{item.provider}</span>
            </div>
            {item.summary && (
              <p className="text-sm text-content-secondary mt-2 line-clamp-3">{item.summary}</p>
            )}
          </a>
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Market News</CardTitle>
        </CardHeader>
        <CardContent>{content}</CardContent>
      </Card>
    </div>
  );
};

export default MarketNewsPage; 