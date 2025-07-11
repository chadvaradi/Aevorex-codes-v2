import React from 'react';
import type { FundamentalsResponse } from '@/hooks/stock/types';

interface CompanyOverviewBubbleProps {
  fundamentals: FundamentalsResponse | undefined;
}

export const CompanyOverviewBubble: React.FC<CompanyOverviewBubbleProps> = ({ fundamentals }) => {
  return (
    <div
      className="bg-surface-default p-6 rounded-lg shadow-sm border border-border-default"
      aria-labelledby="overview-title"
    >
      <h3 id="overview-title" className="text-lg font-semibold text-content-primary mb-2">
        Company Overview
      </h3>
      {fundamentals?.overview ? (
        <div className="space-y-1">
          {fundamentals.overview.name && (
            <h4 className="font-semibold text-content-primary">
              {fundamentals.overview.name}
            </h4>
          )}
          {fundamentals.overview.sector && (
            <p className="text-sm text-content-secondary">
              {fundamentals.overview.sector}
            </p>
          )}
          {fundamentals.overview.description && (
            <p className="text-sm text-content-primary leading-relaxed mt-2 max-h-40 overflow-y-auto">
              {fundamentals.overview.description}
            </p>
          )}
        </div>
      ) : (
        <p className="text-sm text-content-tertiary">No company overview available.</p>
      )}
    </div>
  );
};