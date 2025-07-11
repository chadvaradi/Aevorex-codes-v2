import React, { useEffect, useRef, useState } from 'react';
import { useECBYieldCurve } from '@/hooks/macro/useECBYieldCurve';
import { useECBYieldCurveHistory } from '@/hooks/macro/useECBYieldCurveHistory';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui';
import { createChart, IChartApi, LineData, Time } from 'lightweight-charts';

const ECBYieldCurveCard: React.FC = () => {
  const [showHistorical, setShowHistorical] = useState(false);
  const { curve, date, loading, error, mutate } = useECBYieldCurve();
  const { data: histData, isLoading: histLoading } = useECBYieldCurveHistory('5y');
  const effectiveCurve = showHistorical ? histData : curve;
  const effectiveLoading = showHistorical ? histLoading : loading;

  const handleRetry = () => {
    mutate();
  };

  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

  // Setup chart when data available
  useEffect(() => {
    if (!chartContainerRef.current || effectiveCurve.length === 0) return;

    if (chartRef.current) {
      chartRef.current.remove();
      chartRef.current = null;
    }

    const chart = createChart(chartContainerRef.current, {
      height: 220,
      layout: {
        textColor: '#333',
        fontFamily: 'Inter, sans-serif',
      },
      grid: {
        vertLines: { color: 'rgba(197, 203, 206, 0.2)' },
        horzLines: { color: 'rgba(197, 203, 206, 0.2)' },
      },
      rightPriceScale: {
        visible: false,
      },
      leftPriceScale: {
        visible: true,
        borderVisible: false,
      },
      timeScale: {
        visible: false,
      },
    });

    const lineSeries = chart.addLineSeries({ color: '#2563eb', lineWidth: 2 });

    const lineData: LineData[] = effectiveCurve.map((p: any, idx: number) => ({
      time: idx as unknown as Time,
      value: p.rate,
    }));

    lineSeries.setData(lineData);
    chartRef.current = chart;
  }, [effectiveCurve]);

  if (effectiveLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>ECB Yield Curve</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Skeleton className="h-4 w-3/4" />
            <div className="space-y-2">
              <Skeleton className="h-3 w-1/2" />
              <Skeleton className="h-3 w-2/3" />
              <Skeleton className="h-3 w-1/3" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>ECB Yield Curve</CardTitle>
        </CardHeader>
        <CardContent>
          <ErrorState message="Failed to load yield curve data." retryFn={handleRetry} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-col gap-2">
        <div className="flex items-center justify-between w-full">
          <CardTitle>ECB Yield Curve</CardTitle>
          <label className="flex items-center gap-2 text-sm">
            <span>Historical</span>
            <input type="checkbox" className="toggle toggle-sm" checked={showHistorical} onChange={(e)=>setShowHistorical(e.target.checked)} />
          </label>
        </div>
        {date && !showHistorical && (
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Data as of: {new Date(date).toLocaleDateString()}
          </p>
        )}
      </CardHeader>
      <CardContent>
        {(!effectiveCurve || effectiveCurve.length === 0) ? (
          <div className="text-center text-sm text-gray-500">
            No yield curve data available.
          </div>
        ) : (
          <div className="space-y-2">
            {effectiveCurve.map((point: any, index: number) => (
              <div key={`${point.tenor}-${index}`} className="flex justify-between items-center py-1">
                <span className="text-sm font-medium text-gray-600">{point.tenor}</span>
                <span className="text-sm font-mono text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-gray-700 px-2 py-1 rounded">
                  {point.rate.toFixed(3)}%
                </span>
              </div>
            ))}
            {/* Chart */}
            <div ref={chartContainerRef} className="mt-4 w-full h-[220px]" />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ECBYieldCurveCard; 