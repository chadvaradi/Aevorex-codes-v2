import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent } from '@/components/ui';
import FixingRatesCard from '@/components/financehub/macro/FixingRatesCard';
import ForintStrengthCard from '@/components/financehub/macro/ForintStrengthCard';
import ECBYieldCurveCard from '@/components/financehub/macro/ECBYieldCurveCard';
import { PageHeader } from '@/components/PageHeader';
import api from '@/lib/api';

const MacroRatesPage: React.FC = () => {
  // -------------------------------
  // KPI fetch – light, page-scope
  // -------------------------------
  const [, setLoadingKpi] = useState<boolean>(true);
  const [estrOn, setEstrOn] = useState<number | null>(null);
  const [euribor3m, setEuribor3m] = useState<number | null>(null);
  const [bubor3m, setBubor3m] = useState<number | null>(null);
  const [eurHuf, setEurHuf] = useState<{ rate: number | null; delta: number | null }>({ rate: null, delta: null });

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoadingKpi(true);
        // Fixing rates (latest snapshot)
        const fixing = await api.get<any>('/api/v1/macro/fixing-rates/?force_live=true');
        const payload = (fixing as any)?.data ?? fixing;
        const ecb = payload?.data?.ecb_euribor ?? payload?.ecb_euribor ?? {};
        const bubor = payload?.data?.bubor ?? payload?.bubor ?? {};
        setEstrOn(typeof ecb['ON'] === 'number' ? ecb['ON'] : null);
        setEuribor3m(typeof ecb['3M'] === 'number' ? ecb['3M'] : null);
        setBubor3m(typeof bubor['3M'] === 'number' ? bubor['3M'] : null);

        // EUR/HUF spot – use EODHD real-time FX endpoint (no fallback per policy)
        try {
          const fxResp = await api.get<any>(`/api/v1/eodhd/fx/EURHUF`);
          const fx = (fxResp as any)?.data ?? fxResp;
          const rate = typeof fx?.rate === 'number' ? fx.rate : null;
          const delta = typeof fx?.change === 'number' ? fx.change : null;
          setEurHuf({ rate, delta });
        } catch {
          setEurHuf({ rate: null, delta: null });
        }
      } catch (e) {
        setEstrOn(null);
        setEuribor3m(null);
        setBubor3m(null);
        setEurHuf({ rate: null, delta: null });
      } finally {
        setLoadingKpi(false);
      }
    };

    fetchAll();
    const interval = setInterval(fetchAll, 15_000); // lightweight refresh
    return () => clearInterval(interval);
  }, []);

  const format = useMemo(() => ({
    p2: (n: number | null) => (typeof n === 'number' ? n.toFixed(2) : 'N/A'),
    p3: (n: number | null) => (typeof n === 'number' ? n.toFixed(3) : 'N/A'),
    sign: (n: number | null) => (typeof n === 'number' ? `${n >= 0 ? '+' : ''}${n.toFixed(3)}` : '—'),
  }), []);

  return (
    <div className="mx-auto max-w-[1600px] px-3 md:px-4 lg:px-6">
      <PageHeader
        title="Makrogazdasági Adatok"
        subtitle="Kamatok, Hozamok és Devizaárfolyamok"
      />

      {/* KPI bar */}
      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
        {[{
          label: '€STR O/N',
          value: estrOn,
          fmt: 'p3',
          delta: null,
        },{
          label: 'Euribor 3M',
          value: euribor3m,
          fmt: 'p3',
          delta: null,
        },{
          label: 'BUBOR 3M',
          value: bubor3m,
          fmt: 'p2',
          delta: null,
        },{
          label: 'EUR/HUF',
          value: eurHuf.rate,
          fmt: 'p2',
          delta: eurHuf.delta,
        }].map((kpi, idx) => (
          <Card key={idx}>
            <CardContent className="p-4">
              <div className="text-sm text-slate-500">{kpi.label}</div>
              <div className="mt-1 flex items-baseline gap-2">
                <div className="text-2xl font-semibold text-slate-900 dark:text-white">
                  {kpi.fmt === 'p3' ? format.p3(kpi.value as any) : format.p2(kpi.value as any)}
                </div>
                {kpi.delta !== null && (
                  <span className={`text-xs font-medium ${
                    (kpi.delta as number) >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {format.sign(kpi.delta)}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Controls row */}
      <div className="mt-4 flex items-center justify-between">
        <div className="text-xs text-slate-500">
          Refresh: Fixing 15s · FX 20s · Yield 90s
        </div>
        <button
          className="px-3 py-1.5 text-xs rounded-md bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 hover:opacity-90"
          onClick={() => window.location.reload()}
        >
          Refresh now
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6 items-start">
        {/* Fixing Rates & Yield Curve oszlop */}
        <div className="space-y-4">
          <FixingRatesCard />
          <ECBYieldCurveCard />
        </div>
        {/* FX Chart oszlop */}
        <div className="sticky top-20 self-start">
          <ForintStrengthCard />
        </div>
      </div>
    </div>
  );
};

export default MacroRatesPage;
