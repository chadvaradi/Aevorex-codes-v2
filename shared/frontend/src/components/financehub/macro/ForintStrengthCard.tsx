import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent } from '@/components/ui';
import api from '@/lib/api';

interface ExchangeRate {
  rate: number;
  lastUpdated: string;
  change24h?: number;
}

// Minimal, izolált TradingView Advanced Chart – csak a Deviza kártyához
const MiniTVLineChart = ({ symbol, height = 560 }: { symbol: string; height?: number }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string>(`tvw_${Math.random().toString(36).slice(2)}`);

  useEffect(() => {
    if (!containerRef.current) return;

    // Purge TradingView perzisztens beállítások (line lock miatt)
    try {
      Object.keys(localStorage)
        .filter(k => k.startsWith('tradingview') || k.startsWith('tv.') || k.includes('chartProperties') || k.includes('chartStyle'))
        .forEach(k => { try { localStorage.removeItem(k); } catch {} });
    } catch {}

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
    script.type = 'text/javascript';
    script.async = false; // szükséges a previousElementSibling olvasáshoz

    const resolved = symbol.includes('_')
      ? (symbol === 'EUR_HUF' ? 'FX_IDC:EURHUF'
        : symbol === 'USD_HUF' ? 'FX_IDC:USDHUF'
        : symbol === 'EUR_USD' ? 'FX_IDC:EURUSD'
        : `FX_IDC:${symbol.replace('_','')}`)
      : symbol;

    const cfg: Record<string, any> = {
      autosize: true,
      theme: 'light',
      style: 8,
      symbol: resolved,
      interval: 'D',
      timezone: 'Europe/Frankfurt',
      // Explicit container binding avoids relying on previousElementSibling
      container_id: widgetIdRef.current,
      withdateranges: false,
      allow_symbol_change: false,
      hide_top_toolbar: true,
      hide_side_toolbar: true,
      save_image: false,
      watchlist: [],
      studies: [],
      overrides: {
        'mainSeriesProperties.style': 8,
        'paneProperties.background': '#ffffff',
        'paneProperties.horzGridProperties.color': '#f0f0f0',
        'paneProperties.vertGridProperties.color': '#f0f0f0',
        'scalesProperties.textColor': '#363a45',
        'mainSeriesProperties.lineStyle.color': '#2196F3',
        'mainSeriesProperties.lineStyle.linewidth': 2,
      },
      disabled_features: ['use_localstorage_for_settings'],
    };

    script.textContent = JSON.stringify(cfg);

    // Előző beágyazások takarítása
    try {
      const host = containerRef.current.querySelector(`#${widgetIdRef.current}`) as HTMLDivElement | null;
      if (host) host.innerHTML = '';
      containerRef.current.querySelectorAll('iframe[src*="tradingview"], script[src*="tradingview"]').forEach(el => {
        try { el.parentNode?.removeChild(el); } catch {}
      });
    } catch {}

    // Script beszúrása pontosan a widget-div után (Safari: várjunk egy frame-et)
    const widgetDiv = containerRef.current.querySelector(`#${widgetIdRef.current}`);
    if (widgetDiv && widgetDiv.parentElement) {
      try {
        // Delay to ensure DOM is painted before TradingView reads siblings
        requestAnimationFrame(() => {
          try { widgetDiv.parentElement!.insertBefore(script, (widgetDiv as Element).nextSibling); } catch {}
        });
      } catch {
        try { widgetDiv.parentElement.insertBefore(script, (widgetDiv as Element).nextSibling); } catch {}
      }
    }

    return () => {
      try { if (script.parentNode) script.parentNode.removeChild(script); } catch {}
      try {
        containerRef.current?.querySelectorAll('iframe[src*="tradingview"], script[src*="tradingview"]').forEach(el => {
          try { el.parentNode?.removeChild(el); } catch {}
        });
      } catch {}
    };
  }, [symbol]);

  return (
    <div
      className="tradingview-widget-container"
      ref={containerRef}
      style={{ height: `${height}px`, width: '100%' }}
    >
      <div id={widgetIdRef.current} className="tradingview-widget-container__widget" style={{ height: '100%', width: '100%' }} />
    </div>
  );
};

const ForintStrengthCard: React.FC = () => {
    const [eurHufRate, setEurHufRate] = useState<ExchangeRate | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [selectedPair, setSelectedPair] = useState<'EUR_HUF' | 'USD_HUF' | 'EUR_USD'>('EUR_HUF');
    
    const currencyPairs = [
        { key: 'EUR_HUF' as const, label: 'EUR/HUF', symbol: 'EUR_HUF' },
        { key: 'USD_HUF' as const, label: 'USD/HUF', symbol: 'USD_HUF' },
        { key: 'EUR_USD' as const, label: 'EUR/USD', symbol: 'EUR_USD' }
    ];

    useEffect(() => {
        const fetchRate = async () => {
            try {
                setLoading(true);
                // Use FinanceHub EODHD FX endpoint (no fallback) for HUF, otherwise macro forex
                const pair = selectedPair.replace('_', ''); // EUR_HUF -> EURHUF
                const isHuf = pair.endsWith('HUF');
                const url = isHuf
                  ? `/api/v1/macro/forex/${pair}`
                  : `/api/v1/macro/forex/${pair}`;
                const response = await api.get(url);
                const fx = (response as any) ?? {};
                const data = (fx as any).data ?? fx;
                if (data && data.status === 'success' && typeof data.rate === 'number') {
                    setEurHufRate({
                        rate: data.rate,
                        lastUpdated: data.timestamp || new Date().toISOString(),
                        change24h: typeof data.change === 'number' ? data.change : undefined,
                    });
                } else {
                    if (import.meta.env.DEV) console.debug('No FX data available from EODHD');
                }
            } catch (error) {
                if (import.meta.env.DEV) console.error('Error fetching EUR/HUF rate:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchRate();
        // Refresh every 5 minutes
        const interval = setInterval(fetchRate, 5 * 60 * 1000);
        return () => clearInterval(interval);
            }, [selectedPair]);

    return (
        <Card>
            <CardContent className="p-6">
                {/* Card title */}
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Deviza</h3>
                </div>

                {/* Currency pair selector */}
                <div className="flex justify-center mb-4">
                    <div className="inline-flex rounded-lg border border-slate-200 dark:border-slate-700 p-1 bg-slate-50 dark:bg-slate-800">
                        {currencyPairs.map((pair) => (
                            <button
                                key={pair.key}
                                onClick={() => setSelectedPair(pair.key)}
                                className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                                    selectedPair === pair.key
                                        ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white'
                                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-white/50 dark:hover:bg-slate-700/50'
                                }`}
                            >
                                {pair.label}
                            </button>
                        ))}
                    </div>
                </div>
                
                {/* Spot érték */}
                <div className="flex items-center justify-between">
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    {loading ? '…' : (eurHufRate ? <span className="font-semibold text-slate-900 dark:text-white">{eurHufRate.rate.toFixed(3)}</span> : '—')}
                    <span className="ml-2 text-xs">{loading ? '' : (eurHufRate ? new Date(eurHufRate.lastUpdated).toLocaleString() : '')}</span>
                  </div>
                </div>

                {/* Chart – izolált Advanced-embed (line lock, toolbars hidden) */}
                <div className="mt-2">
                  <MiniTVLineChart symbol={selectedPair} height={560} />
                </div>
            </CardContent>
        </Card>
    );
};

export default ForintStrengthCard;