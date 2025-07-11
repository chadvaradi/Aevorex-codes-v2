import React from 'react';
import type { FundamentalsResponse } from '@/hooks/stock/types';

interface CompanyOverviewBubbleProps {
    fundamentals: FundamentalsResponse | undefined;
}

export const CompanyOverviewBubble: React.FC<CompanyOverviewBubbleProps> = ({ fundamentals }) => {
    return (
        <section
            className="relative bg-surface-default p-6 rounded-lg shadow-sm border border-border-default focus-within:ring-2 focus-within:ring-primary-600"
            role="region"
            aria-labelledby="company-overview-heading"
        >
            {/* LIVE badge – only visible when we have realtime data */}
            {fundamentals?.overview && (
                <span
                    className="absolute top-4 right-4 inline-flex items-center rounded-md bg-accent-primary/10 px-2 py-0.5 text-xxs font-semibold text-accent-primary uppercase tracking-wider"
                    aria-label="Live fundamentals data"
                >
                    Live
                </span>
            )}

            <h3 id="company-overview-heading" className="text-lg font-semibold text-content-primary mb-2">
                Company Overview
            </h3>
            {fundamentals?.overview ? (
                <div>
                    <h4 className="font-semibold text-content-primary">
                        {fundamentals.overview.name}
                    </h4>
                    <p className="text-sm text-content-secondary">
                        {fundamentals.overview.sector}
                    </p>
                </div>
            ) : (
                <p className="text-sm text-content-secondary" aria-live="polite">
                    No company overview available.
                </p>
            )}
        </section>
    );
}; 