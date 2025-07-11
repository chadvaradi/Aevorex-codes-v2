import React from 'react';
import { formatValue, formatPercentage, formatBeta } from './FinancialMetricsBubble.utils';

interface Metrics {
  revenue_ttm?: number;
  net_income?: number;
  roe?: number;
  debt_equity?: number;
  pe_ratio?: number;
  beta?: number;
  peg_ratio?: number;
  price_to_book?: number;
  dividend_yield?: number;
  profit_margin?: number;
  operating_margin?: number;
  current_ratio?: number;
  return_on_assets?: number;
  quick_ratio?: number;
  gross_margin?: number;
  ps_ratio?: number;
  payout_ratio?: number;
}

interface Overview {
  pe_ratio?: number;
  beta?: number;
  esg_score?: number;
  esg_rating?: string;
  esg_risk_level?: string;
  environmental_score?: number;
  social_score?: number;
  governance_score?: number;
}

export const CoreMetricsSection: React.FC<{ metrics: Metrics }> = ({ metrics }) => (
    <div className="space-y-3 mb-4">
        <h4 className="text-sm font-medium text-content-secondary border-b border-border-subtle pb-1">
            Core Metrics (TTM)
        </h4>
        <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
                <span className="text-content-tertiary">Revenue:</span>
                <span className="ml-2 text-content-primary font-medium">
                    {formatValue(metrics?.revenue_ttm, '', '$')}
                </span>
            </div>
            <div>
                <span className="text-content-tertiary">Net Income:</span>
                <span className="ml-2 text-content-primary font-medium">
                    {formatValue(metrics?.net_income, '', '$')}
                </span>
            </div>
            <div>
                <span className="text-content-tertiary">ROE:</span>
                <span className="ml-2 text-content-primary font-medium">
                    {formatPercentage(metrics?.roe)}
                </span>
            </div>
            <div>
                <span className="text-content-tertiary">Debt/Equity:</span>
                <span className="ml-2 text-content-primary font-medium">
                    {formatValue(metrics?.debt_equity)}
                </span>
            </div>
        </div>
    </div>
);

export const ValuationRiskSection: React.FC<{ metrics: Metrics; overview: Overview }> = ({ metrics, overview }) => (
    <div className="space-y-3 mb-4">
        <h4 className="text-sm font-medium text-content-secondary border-b border-border-subtle pb-1">
            Valuation & Risk
        </h4>
        <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
                <span className="text-content-tertiary">P/E Ratio:</span>
                <span className="ml-2 text-content-primary font-medium">
                    {formatValue(metrics?.pe_ratio || overview?.pe_ratio)}
                </span>
            </div>
            <div>
                <span className="text-content-tertiary">Beta:</span>
                <span className="ml-2 text-content-primary font-medium">
                    {formatBeta(metrics?.beta || overview?.beta)}
                </span>
            </div>
            <div>
                <span className="text-content-tertiary">PEG Ratio:</span>
                <span className="ml-2 text-content-primary font-medium">
                    {formatValue(metrics?.peg_ratio)}
                </span>
            </div>
            <div>
                <span className="text-content-tertiary">P/B Ratio:</span>
                <span className="ml-2 text-content-primary font-medium">
                    {formatValue(metrics?.price_to_book)}
                </span>
            </div>
        </div>
    </div>
);

export const AdditionalMetricsSection: React.FC<{ metrics: Metrics }> = ({ metrics }) => {
    if (!metrics?.dividend_yield && !metrics?.profit_margin && !metrics?.operating_margin) return null;
    
    return (
        <div className="space-y-3 mt-4">
            <h4 className="text-sm font-medium text-content-secondary border-b border-border-subtle pb-1">
                Additional Metrics
            </h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
                {metrics.dividend_yield && (
                    <div>
                        <span className="text-content-tertiary">Dividend Yield:</span>
                        <span className="ml-2 text-content-primary font-medium">
                            {formatPercentage(metrics.dividend_yield)}
                        </span>
                    </div>
                )}
                {metrics.profit_margin && (
                    <div>
                        <span className="text-content-tertiary">Profit Margin:</span>
                        <span className="ml-2 text-content-primary font-medium">
                            {formatPercentage(metrics.profit_margin)}
                        </span>
                    </div>
                )}
                {metrics.operating_margin && (
                    <div>
                        <span className="text-content-tertiary">Operating Margin:</span>
                        <span className="ml-2 text-content-primary font-medium">
                            {formatPercentage(metrics.operating_margin)}
                        </span>
                    </div>
                )}
                {metrics.current_ratio && (
                    <div>
                        <span className="text-content-tertiary">Current Ratio:</span>
                        <span className="ml-2 text-content-primary font-medium">
                            {formatValue(metrics.current_ratio)}
                        </span>
                    </div>
                )}
                {metrics.gross_margin && (
                    <div>
                        <span className="text-content-tertiary">Gross Margin:</span>
                        <span className="ml-2 text-content-primary font-medium">
                            {formatPercentage(metrics.gross_margin)}
                        </span>
                    </div>
                )}
                {metrics.return_on_assets && (
                    <div>
                        <span className="text-content-tertiary">Return on Assets:</span>
                        <span className="ml-2 text-content-primary font-medium">
                            {formatPercentage(metrics.return_on_assets)}
                        </span>
                    </div>
                )}
                {metrics.quick_ratio && (
                    <div>
                        <span className="text-content-tertiary">Quick Ratio:</span>
                        <span className="ml-2 text-content-primary font-medium">
                            {formatValue(metrics.quick_ratio)}
                        </span>
                    </div>
                )}
                {metrics.ps_ratio && (
                    <div>
                        <span className="text-content-tertiary">P/S Ratio:</span>
                        <span className="ml-2 text-content-primary font-medium">
                            {formatValue(metrics.ps_ratio)}
                        </span>
                    </div>
                )}
                {metrics.payout_ratio && (
                    <div>
                        <span className="text-content-tertiary">Payout Ratio:</span>
                        <span className="ml-2 text-content-primary font-medium">
                            {formatPercentage(metrics.payout_ratio)}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}; 