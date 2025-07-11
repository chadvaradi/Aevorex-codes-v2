import React from 'react';
import type { FundamentalsResponse, NewsArticle } from '@/hooks/stock/types';
import { CompanyOverviewBubble } from './CompanyOverview/CompanyOverviewBubble.view';
import { FinancialMetricsBubble } from './FinancialMetrics/FinancialMetricsBubble.view';
import { NewsHighlightsBubble } from './NewsHighlights/NewsHighlightsBubble.view';
import { TechnicalAnalysisBubble } from './TechnicalAnalysis/TechnicalAnalysisBubble.view';
import FundamentalsOverviewCard from '../FundamentalsOverviewCard';

interface AnalysisBubblesGridProps {
  loading: boolean;
  fundamentals: FundamentalsResponse | undefined;
  news: NewsArticle[] | undefined;
  ticker: string;
}

const AnalysisBubblesGrid: React.FC<AnalysisBubblesGridProps> = ({ loading, fundamentals, news, ticker }) => {
    if (loading) {
        return (
            <div className="grid gap-4 grid-cols-[repeat(auto-fit,minmax(260px,1fr))]">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-surface-default p-6 rounded-lg shadow-sm border border-border-default animate-pulse">
                        <div className="h-6 bg-surface-subtle rounded w-1/3 mb-4"></div>
                        <div className="space-y-2">
                            <div className="h-4 bg-surface-subtle rounded w-full"></div>
                            <div className="h-4 bg-surface-subtle rounded w-5/6"></div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

  return (
    <div className="grid gap-4 grid-cols-[repeat(auto-fit,minmax(260px,1fr))]">
        <CompanyOverviewBubble fundamentals={fundamentals} />
        <FinancialMetricsBubble fundamentals={fundamentals} />
        <NewsHighlightsBubble news={news} />
        <TechnicalAnalysisBubble ticker={ticker} />
        <FundamentalsOverviewCard ticker={ticker} />
    </div>
  );
};

export default AnalysisBubblesGrid; 