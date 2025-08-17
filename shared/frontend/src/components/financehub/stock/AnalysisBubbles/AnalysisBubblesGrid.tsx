import React from 'react';
import type { FundamentalsResponse, NewsArticle } from '@/hooks/stock/types';
import { CompanyOverviewBubble } from './CompanyOverview/CompanyOverviewBubble.view';
import { FinancialMetricsBubble } from './FinancialMetrics/FinancialMetricsBubble.view';
import { NewsHighlightsBubble } from './NewsHighlights/NewsHighlightsBubble.view';
import { TechnicalAnalysisBubble } from './TechnicalAnalysis/TechnicalAnalysisBubble.view';

interface AnalysisBubblesGridProps {
  loading: boolean;
  fundamentals: FundamentalsResponse | undefined;
  news: NewsArticle[] | undefined;
  ticker: string;
}

const AnalysisBubblesGrid: React.FC<AnalysisBubblesGridProps> = ({ loading, fundamentals, news, ticker }) => {
    if (loading) {
        // Render skeletons but include headings immediately for premium UX and test stability
        return (
            <div className="grid gap-4 grid-cols-[repeat(auto-fit,minmax(260px,1fr))]">
                <div className="bg-surface-default p-6 rounded-lg shadow-sm border border-border-default" aria-busy="true">
                    <h3 className="text-lg font-semibold text-content-primary mb-2">Company Overview</h3>
                    <div className="space-y-2 animate-pulse" aria-label="Loading company overview">
                        <div className="h-4 bg-surface-subtle rounded w-full"></div>
                        <div className="h-4 bg-surface-subtle rounded w-5/6"></div>
                    </div>
                </div>
                <div className="bg-surface-default p-6 rounded-lg shadow-sm border border-border-default" aria-busy="true">
                    <h3 className="text-lg font-semibold text-content-primary mb-2">Financial Metrics</h3>
                    <div className="space-y-2 animate-pulse" aria-label="Loading financial metrics">
                        <div className="h-4 bg-surface-subtle rounded w-full"></div>
                        <div className="h-4 bg-surface-subtle rounded w-3/4"></div>
                    </div>
                </div>
                <div className="bg-surface-default p-6 rounded-lg shadow-sm border border-border-default" aria-busy="true">
                    <h3 className="text-lg font-semibold text-content-primary mb-2">News Highlights</h3>
                    <div className="space-y-2 animate-pulse" aria-label="Loading news highlights">
                        <div className="h-4 bg-surface-subtle rounded w-full"></div>
                        <div className="h-4 bg-surface-subtle rounded w-2/3"></div>
                    </div>
                </div>
                <div className="bg-surface-default p-6 rounded-lg shadow-sm border border-border-default" aria-busy="true">
                    <h3 className="text-lg font-semibold text-content-primary">Technical Analysis</h3>
                    <div className="mt-2 space-y-2 animate-pulse" aria-label="Loading technical analysis">
                        <div className="h-4 bg-surface-subtle rounded w-full"></div>
                        <div className="h-4 bg-surface-subtle rounded w-4/5"></div>
                    </div>
                </div>
            </div>
        );
    }

  return (
    <div className="grid gap-4 grid-cols-[repeat(auto-fit,minmax(260px,1fr))]">
        <CompanyOverviewBubble fundamentals={fundamentals} />
        <FinancialMetricsBubble fundamentals={fundamentals} />
        <NewsHighlightsBubble news={news} />
        <TechnicalAnalysisBubble ticker={ticker} />
    </div>
  );
};

export default AnalysisBubblesGrid; 