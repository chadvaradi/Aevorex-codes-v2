import React from 'react';
import { useParams } from 'react-router-dom';
import type { FundamentalsResponse, ChartResponse } from '@/hooks/stock/types';

interface StockHeaderProps {
    fundamentals: FundamentalsResponse | undefined;
    chartData: ChartResponse | undefined;
    loading?: boolean;
}

const StockHeader: React.FC<StockHeaderProps> = ({ fundamentals, chartData, loading }) => {
    const { ticker } = useParams<{ ticker: string }>();

    if (loading || !fundamentals || !chartData) {
        return (
            <div className="mb-8 animate-pulse">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="h-8 w-32 bg-surface-subtle rounded mb-2" />
                        <div className="h-4 w-48 bg-surface-subtle rounded" />
                    </div>
                    <div className="text-right">
                        <div className="h-8 w-20 bg-surface-subtle rounded mb-2" />
                        <div className="h-4 w-24 bg-surface-subtle rounded" />
                    </div>
                </div>
            </div>
        );
    }
    
    const companyName = fundamentals?.overview?.name ?? 'Unknown Company';
    const sector = fundamentals?.overview?.sector ?? 'N/A';

    // Get latest price from chart data
    const ohlcv = chartData.chart_data.ohlcv;
    const latestChartPoint = ohlcv?.[ohlcv.length - 1];
    const currentPrice = latestChartPoint?.close || 0;
    
    const priceChange = (latestChartPoint?.close || 0) - (ohlcv?.[ohlcv.length - 2]?.close || 0);
    const priceChangePercent = (priceChange / (ohlcv?.[ohlcv.length - 2]?.close || 1)) * 100;
    const isPositiveChange = priceChange >= 0;

    return (
        <div className="mb-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-content-primary">{ticker?.toUpperCase()}</h1>
                    <p className="text-content-secondary">{companyName} - {sector}</p>
                </div>
                <div className="text-right">
                    <div className="text-3xl font-bold text-content-primary">${currentPrice.toFixed(2)}</div>
                    <div className={`${isPositiveChange ? 'text-success-default' : 'text-danger-default'} text-sm`}>
                        {isPositiveChange ? '+' : ''}{priceChange.toFixed(2)} ({isPositiveChange ? '+' : ''}{priceChangePercent.toFixed(2)}%)
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StockHeader; 