import { useUSTYieldCurve } from '@/hooks/macro/useUSTYieldCurve';

export interface ChartPoint {
  tenor: string;
  value: number | null;
}

export const useUSTYieldCurveChartLogic = () => {
  const { curve, date, isLoading, isError, mutate } = useUSTYieldCurve();

  const series: ChartPoint[] = Object.entries(curve).map(([tenor, value]) => ({
    tenor,
    value: typeof value === 'number' ? value : null,
  }));

  return {
    series,
    date,
    isLoading,
    isError,
    refresh: mutate,
  };
}; 