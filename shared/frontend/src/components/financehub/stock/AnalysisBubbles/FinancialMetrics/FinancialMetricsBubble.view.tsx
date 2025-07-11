import React from 'react';
import type { FundamentalsResponse } from '../../../../../hooks/stock/types';
import {
  CoreMetricsSection,
  ValuationRiskSection,
  AdditionalMetricsSection,
} from '../../bubbles/FinancialMetricsBubble.components';
import ESGSection from '../../bubbles/ESGSection.view';

interface FinancialMetricsBubbleProps {
    fundamentals: FundamentalsResponse | undefined;
}

export const FinancialMetricsBubble: React.FC<FinancialMetricsBubbleProps> = ({ fundamentals }) => {
    if (!fundamentals?.metrics?.[0] && !fundamentals?.overview) {
        return (
            <div className="bg-surface-default p-6 rounded-lg shadow-sm border border-border-default">
                <h3 className="text-lg font-semibold text-content-primary mb-2">Financial Metrics</h3>
                <p className="text-sm text-content-secondary">No financial metrics available.</p>
            </div>
        );
    }

    const metrics = fundamentals.metrics?.[0];
    const overview = fundamentals.overview;

    return (
        <div className="bg-surface-default p-6 rounded-lg shadow-sm border border-border-default">
            <h3 className="text-lg font-semibold text-content-primary mb-4">Financial Metrics</h3>
            
            <CoreMetricsSection metrics={metrics} />
            <ValuationRiskSection metrics={metrics} overview={overview} />
            <ESGSection overview={overview} />
            <AdditionalMetricsSection metrics={metrics} />
        </div>
    );
}; 