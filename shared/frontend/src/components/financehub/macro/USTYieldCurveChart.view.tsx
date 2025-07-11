import React from 'react';
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Skeleton } from '@/components/ui/Skeleton';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { ErrorState } from '@/components/ui';
import { useUSTYieldCurveChartLogic } from './USTYieldCurveChart.logic';

const USTYieldCurveChart: React.FC = () => {
  const { series, date, isLoading, isError, refresh } = useUSTYieldCurveChartLogic();

  let content;
  if (isLoading) {
    content = <Skeleton className="h-56 w-full" />;
  } else if (isError) {
    content = <ErrorState message="Failed to load UST yield curve." retryFn={refresh} />;
  } else if (!series.length) {
    content = <div className="text-sm text-content-secondary">No curve data.</div>;
  } else {
    content = (
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={series} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="tenor" />
          <YAxis domain={[0, 'dataMax']} />
          <Tooltip formatter={(v: number) => `${v.toFixed(2)}%`} />
          <Line type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={2} dot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>UST Yield Curve {date && <span className="text-xs text-content-secondary">({date})</span>}</CardTitle>
      </CardHeader>
      <CardContent>{content}</CardContent>
    </Card>
  );
};

export default USTYieldCurveChart; 