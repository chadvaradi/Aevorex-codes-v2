/**
 * ECB Yield Curve Card with Simple Table + Custom Chart
 * 
 * Displays official ECB risk-free Euro area yield curve (spot rates).
 * Uses ECB SDMX YC dataflow for 1Y-30Y maturities.
 * Simplified without TradingView charts per user request.
 */
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui';
import api from '@/lib/api';

interface YieldCurveData {
  [maturity: string]: number;
}

interface ECBYieldCurveCardProps {
  className?: string;
}

const ECBYieldCurveCard: React.FC<ECBYieldCurveCardProps> = ({ 
  className = ""
}) => {
  const [yieldData, setYieldData] = useState<YieldCurveData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ECB Yield Curve maturities we want to display
  const MATURITIES = [
    { key: '1Y', label: '1Y', years: 1 },
    { key: '2Y', label: '2Y', years: 2 },
    { key: '5Y', label: '5Y', years: 5 },
    { key: '10Y', label: '10Y', years: 10 }
  ];

  useEffect(() => {
    const fetchYieldCurve = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Call dedicated backend endpoint: /api/v1/macro/ecb/yield-curve
        const resp = await api.get<{ yields: Record<string, Record<string, number>> }>(
          `/api/v1/macro/ecb/yield-curve?period=1m`
        );
        const payload = (resp as any)?.data ?? resp;
        // backend shape: { data: { yields: { '2025-08-05': { '1Y': 2.12, ... } } } }
        const yieldsByDate = payload?.yields ?? payload?.data?.yields;
        if (yieldsByDate && typeof yieldsByDate === 'object') {
          const latestDate = Object.keys(yieldsByDate).sort().pop();
          const latest = latestDate ? yieldsByDate[latestDate] : null;
           const combined: Record<string, number | null> = {};
          if (latest) {
            for (const { key, label } of MATURITIES) {
              const val = latest[key];
              combined[label] = typeof val === 'number' ? val : null;
            }
          }
          setYieldData(combined);
        } else {
          setYieldData(null);
        }
      } catch (err) {
        setError('Failed to fetch yield curve data');
        console.error('Yield curve fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchYieldCurve();
    // Refresh every 10 minutes
    const interval = setInterval(fetchYieldCurve, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Euro Area Yield Curve</CardTitle>
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
      <Card className={className}>
        <CardHeader>
          <CardTitle>Euro Area Yield Curve</CardTitle>
        </CardHeader>
        <CardContent>
          <ErrorState
            message={error || "Failed to load yield curve"}
          />
        </CardContent>
      </Card>
    );
  }

  // Table-only – chart removed per user request

  // compute derived slopes if data available
  const slope2s10s = yieldData && yieldData['2Y'] != null && yieldData['10Y'] != null
    ? ((yieldData['10Y'] as number) - (yieldData['2Y'] as number))
    : null;
  // 30Y removed from table; skip 10s30s slope

  return (
    <Card className={`relative ${className}`}>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Euro Area Yield Curve</CardTitle>
        
      </CardHeader>
      
      <CardContent>
        {/* Yield curve table */}
        {yieldData && (
          <div className="overflow-x-auto mb-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="text-left py-2 px-3 text-slate-600 dark:text-slate-400 font-medium">Maturity</th>
                  <th className="text-center py-2 px-3 text-slate-600 dark:text-slate-400 font-medium">Yield</th>
                  <th className="text-center py-2 px-3 text-slate-600 dark:text-slate-400 font-medium">Years</th>
                </tr>
              </thead>
              <tbody>
                {MATURITIES.map(({ label, years }) => (
                  <tr key={label} className="border-b border-slate-100 dark:border-slate-800">
                    <td className="py-3 px-3 font-medium text-slate-900 dark:text-white">
                      {label}
                    </td>
                    <td className="text-center py-3 px-3 font-mono text-slate-900 dark:text-white">
                      {yieldData[label] != null ? `${(yieldData[label] as number).toFixed(3)}%` : '—'}
                    </td>
                    <td className="text-center py-3 px-3 text-slate-600 dark:text-slate-400">
                      {years}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Derived slopes */}
        <div className="grid grid-cols-1 gap-3">
          <div className="p-3 rounded bg-slate-50 dark:bg-slate-800">
            <div className="text-xs text-slate-600 dark:text-slate-400">2s10s</div>
            <div className={`text-base font-mono ${slope2s10s != null ? (slope2s10s >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400') : 'text-slate-500'}`}>
              {slope2s10s != null ? `${slope2s10s.toFixed(3)}%` : '—'}
            </div>
          </div>
        </div>

        {/* Chart intentionally removed */}
        

      </CardContent>
    </Card>
  );
};

export default ECBYieldCurveCard;