import { useState, useRef, useEffect } from 'react';
import { createChart, IChartApi, ISeriesApi, Time, LineData } from 'lightweight-charts';
import { useHistoricalYieldCurve } from '@/hooks/macro/useHistoricalYieldCurve';
import ButtonGroup from '@/components/ui/ButtonGroup';
import type { RawYieldCurveData } from '@/hooks/macro/useHistoricalYieldCurve';

const formatDate = (date: Date): Time => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}` as Time;
};

// Map of desired tenors to their (potential) names in the ECB data
const TENOR_MAP: { [key: string]: string } = {
  '1Y': '1 year',
  '5Y': '5 years',
  '10Y': '10 years',
};

const HistoricalYieldCurveChart = () => {
  const { yieldCurveData, isLoading, error } = useHistoricalYieldCurve();
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<{ [key: string]: ISeriesApi<'Line'> }>({});

  const [timeRange, setTimeRange] = useState('5Y');
  const intervals = ['1Y', '5Y', '10Y', 'MAX'];

  useEffect(() => {
    const dataPoints = Object.keys(yieldCurveData);
    if (!chartContainerRef.current || dataPoints.length === 0) return;

    if (!chartRef.current) {
      chartRef.current = createChart(chartContainerRef.current, {
        width: chartContainerRef.current.clientWidth,
        height: 300,
        layout: { background: { color: 'transparent' }, textColor: '#1f2937' },
        grid: { vertLines: { color: '#e5e7eb' }, horzLines: { color: '#e5e7eb' } },
        timeScale: { borderColor: '#e5e7eb' },
      });
      seriesRef.current['10Y'] = chartRef.current.addLineSeries({ color: '#3b82f6', title: '10-Year' });
      seriesRef.current['5Y'] = chartRef.current.addLineSeries({ color: '#8b5cf6', title: '5-Year' });
      seriesRef.current['1Y'] = chartRef.current.addLineSeries({ color: '#10b981', title: '1-Year' });
    }

    const dataForSeries = (tenor: keyof typeof TENOR_MAP): LineData[] => {
      const mappedTenor = TENOR_MAP[tenor];
      if (!mappedTenor) return [];

      return dataPoints
        .map((date) => {
          const dayData = (yieldCurveData as RawYieldCurveData)[date] ?? {};
          const value = (dayData as Record<string, number | undefined>)[mappedTenor];
          return {
            time: date as Time,
            value: value as number | undefined,
          };
        })
        .filter((d): d is LineData & { value: number } => d.value !== undefined && d.value !== null)
        .sort((a, b) => new Date(a.time as string).getTime() - new Date(b.time as string).getTime());
    }

    seriesRef.current['10Y'].setData(dataForSeries('10Y'));
    seriesRef.current['5Y'].setData(dataForSeries('5Y'));
    seriesRef.current['1Y'].setData(dataForSeries('1Y'));

    chartRef.current.timeScale().fitContent();

    const handleResize = () => {
      chartRef.current?.applyOptions({ width: chartContainerRef.current?.clientWidth });
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [yieldCurveData]);

  const handleIntervalChange = (newInterval: string) => {
    setTimeRange(newInterval);
    if (!chartRef.current) return;
    
    const dataKeys = Object.keys(yieldCurveData);
    if (dataKeys.length === 0) return;

    const to = new Date(dataKeys[dataKeys.length - 1]);
    let from = new Date(dataKeys[0]);

    switch (newInterval) {
      case '1Y':
        from = new Date(to.getFullYear() - 1, to.getMonth(), to.getDate());
        break;
      case '5Y':
        from = new Date(to.getFullYear() - 5, to.getMonth(), to.getDate());
        break;
      case '10Y':
        from = new Date(to.getFullYear() - 10, to.getMonth(), to.getDate());
        break;
      case 'MAX':
        // from is already set to the earliest date
        break;
    }
    chartRef.current.timeScale().setVisibleRange({
        from: formatDate(from),
        to: formatDate(to),
    });
  };

  if (isLoading) return (
    <div 
      className="h-[300px] flex justify-center items-center bg-gray-100 rounded-lg"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="w-full h-full shimmer"></div>
    </div>
  );
  if (error) return <div className="h-[300px] text-red-500">Error: {error || 'Failed to load chart data.'}</div>;

  return (
     <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Euro Area Yield Curve (Historical)</h2>
        <ButtonGroup buttons={intervals} onButtonClick={handleIntervalChange} activeButton={timeRange} />
      </div>
      <div ref={chartContainerRef} />
    </div>
  );
};

export default HistoricalYieldCurveChart; 