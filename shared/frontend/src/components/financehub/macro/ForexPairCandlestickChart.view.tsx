import React from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Bar,
} from 'recharts';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { useForexCandlestickLogic } from './ForexPairCandlestickChart.logic';

interface Props {
  pair: string | null;
}

const ForexPairCandlestickChart: React.FC<Props> = ({ pair }) => {
  const { series, isLoading, isError, refresh } = useForexCandlestickLogic(pair);

  let content: JSX.Element;
  if (isLoading) {
    content = <Skeleton className="h-72 w-full" />;
  } else if (isError) {
    content = <ErrorState message="Failed to load FX history." retryFn={refresh} />;
  } else if (!series.length) {
    content = <div className="text-sm text-content-secondary">No history.</div>;
  } else {
    content = (
      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart data={series} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" hide />
          <YAxis domain={[ (d:number)=> d*0.995, (d:number)=> d*1.005 ]} />
          <Tooltip />
          <Bar dataKey="close" fill="#0ea5e9" />
        </ComposedChart>
      </ResponsiveContainer>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>FX Candlestick {pair}</CardTitle>
      </CardHeader>
      <CardContent>{content}</CardContent>
    </Card>
  );
};

export default ForexPairCandlestickChart; 