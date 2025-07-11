import React from 'react';
import { useTechnicalAnalysis } from '@/hooks/stock/useTechnicalAnalysis';
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon } from '@heroicons/react/24/solid';

interface TechnicalAnalysisBubbleProps {
    ticker: string;
}

export const TechnicalAnalysisBubble: React.FC<TechnicalAnalysisBubbleProps> = ({ ticker }) => {
    const { technical, loading, error } = useTechnicalAnalysis(ticker);

    if (loading) {
        return (
            <div className="bg-surface-default p-6 rounded-lg shadow-sm border border-border-default animate-pulse h-40" />
        );
    }

    if (error) {
        return (
            <div className="bg-surface-default p-6 rounded-lg shadow-sm border border-danger-default text-danger-default">
                Failed to load technical analysis.
            </div>
        );
    }

    // Helper to map recommendation to color classes
    const getBadgeClass = (rec: string) => {
        const normalized = rec.toLowerCase();
        if (normalized.includes('buy')) return 'bg-success-600/10 text-success-600';
        if (normalized.includes('sell')) return 'bg-danger-600/10 text-danger-600';
        return 'bg-neutral-600/10 text-neutral-600';
    };

    const formatValue = (val: unknown): string => {
        if (typeof val === 'number') return val.toFixed(2);
        return String(val);
    };

    return (
        <div className="bg-surface-default p-6 rounded-lg shadow-sm border border-border-default" aria-labelledby={`ta-title-${ticker}`}> 
            <div className="flex items-center justify-between mb-2">
                <h3 id={`ta-title-${ticker}`} className="text-lg font-semibold text-content-primary">AI Technical Analysis</h3>
                {technical?.recommendation && (
                    <span
                        className={`inline-block px-2 py-0.5 text-xs font-semibold rounded-full ${getBadgeClass(
                            technical.recommendation,
                        )}`}
                        aria-label={`Recommendation badge: ${technical.recommendation}`}
                    >
                        {technical.recommendation}
                    </span>
                )}
            </div>

            {technical ? (
                <ul className="text-sm text-content-secondary space-y-1" role="list">
                    {Object.entries(technical?.indicators ?? {}).map(([key, val]: [string, any]) => {
                        const numericVal = typeof val === 'number' ? val : parseFloat(val);
                        const isPositive = !Number.isNaN(numericVal) && numericVal > 0;
                        const pillColor = isPositive
                            ? 'bg-success-600/10 text-success-600'
                            : 'bg-danger-600/10 text-danger-600';
                        const Icon = isPositive ? ArrowTrendingUpIcon : ArrowTrendingDownIcon;
                        return (
                            <li key={key} className="flex items-center justify-between" role="listitem">
                                <span className="capitalize">{key.replace(/_/g, ' ')}</span>
                                <span
                                    className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full ${pillColor}`}
                                    aria-label={`${key} indicator value ${formatValue(val)}`}
                                >
                                    <Icon className="h-4 w-4" aria-hidden="true" />
                                    {formatValue(val)}
                                </span>
                            </li>
                        );
                    })}
                </ul>
            ) : (
                <p className="text-sm text-content-tertiary">No technical analysis available.</p>
            )}
        </div>
    );
}; 