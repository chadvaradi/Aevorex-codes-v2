import React from 'react';
import type { NewsArticle } from '@/hooks/stock/types';

interface NewsHighlightsBubbleProps {
    news: NewsArticle[] | undefined;
}

export const NewsHighlightsBubble: React.FC<NewsHighlightsBubbleProps> = ({ news }) => {
    const isLoading = news === undefined;

    // Render skeleton shimmer when loading
    if (isLoading) {
        return (
            <div className="bg-surface-default p-6 rounded-lg shadow-sm border border-border-default animate-pulse" aria-busy="true" aria-label="Loading news highlights">
                <div className="h-6 bg-surface-subtle rounded w-1/3 mb-4" />
                <div className="space-y-2">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-4 bg-surface-subtle rounded w-full" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-surface-default p-6 rounded-lg shadow-sm border border-border-default" aria-labelledby="news-title">
            <h3 id="news-title" className="text-lg font-semibold text-content-primary mb-2">News Highlights</h3>
            {news && news.length > 0 ? (
                <ul className="space-y-2" role="list">
                    {news.slice(0, 3).map((article, index) => {
                        const publishedDate = new Date(article.published_at);
                        const hoursAgo = (Date.now() - publishedDate.getTime()) / 3600000;
                        const isNew = hoursAgo < 24;
                        return (
                            <li key={index} className="text-sm text-content-secondary flex items-start gap-2" role="listitem">
                                <span className="truncate flex-1" aria-label={article.title}>{article.title}</span>
                                {isNew && (
                                    <span className="shrink-0 px-2 py-0.5 text-xs font-semibold rounded-full bg-info-600/10 text-info-600" aria-label="New article">NEW</span>
                                )}
                            </li>
                        );
                    })}
                </ul>
            ) : (
                <p className="text-sm text-content-tertiary">No news highlights available.</p>
            )}
            {news && news.length > 0 && (
                <p className="mt-3 text-xs text-content-tertiary" aria-label="Relative time information">
                     Updated {new Date(news[0].published_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                </p>
            )}
        </div>
    );
}; 