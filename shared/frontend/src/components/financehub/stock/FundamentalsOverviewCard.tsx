import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui';
import { useEODHDFundamentals } from '@/hooks/stock/useEODHDFundamentals';

interface Props {
  ticker: string;
}

const FundamentalsOverviewCard: React.FC<Props> = ({ ticker }) => {
  const { fundamentals, loading, error, refresh } = useEODHDFundamentals(ticker);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Fundamentals (EODHD)</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return <ErrorState message="Failed to load fundamentals." retryFn={refresh} />;
  }

  if (!fundamentals) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Fundamentals (EODHD)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-content-secondary">No fundamentals data.</div>
        </CardContent>
      </Card>
    );
  }

  const mc = fundamentals.overview?.market_cap ?? null;
  const pe = fundamentals.overview?.pe_ratio ?? null;
  const metrics = fundamentals.metrics?.[0] ?? {};
  const eps = (metrics as any)?.eps ?? null;
  const dividendYield = (metrics as any)?.dividend_yield ?? null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Fundamentals (EODHD)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between"><span>Market Cap</span><span>{mc ? mc.toLocaleString() : '-'}</span></div>
          <div className="flex justify-between"><span>P/E (TTM)</span><span>{pe ?? '-'}</span></div>
          <div className="flex justify-between"><span>EPS (TTM)</span><span>{eps ?? '-'}</span></div>
          <div className="flex justify-between"><span>Dividend Yield</span><span>{dividendYield ?? '-'}</span></div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FundamentalsOverviewCard; 