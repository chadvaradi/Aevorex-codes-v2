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
                <div className="space-y-2">
                    <div>
                        <h4 className="font-semibold text-content-primary">
                            {fundamentals.overview.name}
                        </h4>
                        <p className="text-sm text-content-secondary">
                            {fundamentals.overview.sector}
                        </p>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                        {typeof fundamentals.overview.pe_ratio === 'number' && (
                            <div className="flex items-center justify-between">
                                <span className="text-content-tertiary">P/E (ttm)</span>
                                <span className="font-medium text-content-primary">
                                    {fundamentals.overview.pe_ratio.toFixed(2)}
                                </span>
                            </div>
                        )}
                        {typeof fundamentals.overview.beta === 'number' && (
                            <div className="flex items-center justify-between">
                                <span className="text-content-tertiary">Beta</span>
                                <span className="font-medium text-content-primary">
                                    {fundamentals.overview.beta.toFixed(2)}
                                </span>
                            </div>
                        )}
                        {typeof fundamentals.overview.esg_score === 'number' && (
                            <div className="flex items-center justify-between">
                                <span className="text-content-tertiary">ESG</span>
                                <span className="font-medium text-content-primary">
                                    {fundamentals.overview.esg_score.toFixed(1)}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <p className="text-sm text-content-secondary" aria-live="polite">
                    No company overview available.
                </p>
            )}
        </section>
    );
}; 