import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Card, CardContent } from '@/components/ui';
import api from '@/lib/api';

type Method = 'GET' | 'POST';

interface CatalogItem {
  id: string;
  title: string;
  endpoint: string;
  method?: Method;
  tier: 'Free' | 'Pro' | 'Pro+' | 'Ent' | 'Deprecated';
  notes?: string;
  // Whether to auto-fetch on mount (SSE endpoints should be manual)
  auto?: boolean;
}

const DEFAULT_TICKER = 'AAPL';

const ITEMS: CatalogItem[] = [
  { id: 'health', title: 'Service Health', endpoint: '/api/v1/health', tier: 'Free', auto: true },
  { id: 'tape', title: 'Ticker Tape', endpoint: '/api/v1/stock/ticker-tape/', tier: 'Free', auto: true },
  { id: 'search', title: 'Symbol Search', endpoint: `/api/v1/stock/search?query=${DEFAULT_TICKER}`, tier: 'Free', auto: true },
  { id: 'stock', title: 'Stock Snapshot', endpoint: `/api/v1/stock/${DEFAULT_TICKER}`, tier: 'Free', auto: true },
  { id: 'chart', title: 'Chart Data', endpoint: `/api/v1/stock/${DEFAULT_TICKER}/chart`, tier: 'Free', auto: true },
  { id: 'fundamentals', title: 'Fundamentals', endpoint: `/api/v1/stock/${DEFAULT_TICKER}/fundamentals`, tier: 'Pro', auto: true },
  { id: 'news', title: 'Ticker News', endpoint: `/api/v1/stock/${DEFAULT_TICKER}/news`, tier: 'Pro', auto: true },
  { id: 'esg', title: 'ESG Score', endpoint: `/api/v1/stock/esg/${DEFAULT_TICKER}`, tier: 'Pro', auto: true },
  { id: 'ai-summary', title: 'AI Summary (Premium)', endpoint: `/api/v1/stock/premium/${DEFAULT_TICKER}/summary`, tier: 'Pro', auto: true },
  { id: 'ai-analysis', title: 'AI Analysis (Public Alias)', endpoint: `/api/v1/stock/${DEFAULT_TICKER}/ai-analysis`, tier: 'Pro', auto: true },
  { id: 'chat-stream', title: 'Chat Stream (SSE)', endpoint: `/api/v1/stock/chat/${DEFAULT_TICKER}/stream`, tier: 'Pro', auto: false },
  { id: 'chat-deep', title: 'Deep Analysis (SSE)', endpoint: `/api/v1/stock/chat/${DEFAULT_TICKER}/deep`, method: 'POST', tier: 'Pro+', auto: false },
  { id: 'chat-rapid', title: 'Rapid Chat (POST)', endpoint: `/api/v1/stock/chat/${DEFAULT_TICKER}`, method: 'POST', tier: 'Pro', auto: false },
  { id: 'tv-symbols', title: 'TV Symbols', endpoint: '/api/v1/tv/symbols', tier: 'Free', auto: true },
  { id: 'tv-symbol', title: 'TV Symbol Detail', endpoint: '/api/v1/tv/symbols/AAPL', tier: 'Free', auto: true },
  { id: 'market-news', title: 'Market News', endpoint: '/api/v1/market/news', tier: 'Pro', auto: true },
  { id: 'market-indices', title: 'Market Indices', endpoint: '/api/v1/market/indices', tier: 'Pro', auto: true },
  { id: 'tape-item', title: 'Ticker Tape Item', endpoint: '/api/v1/stock/ticker-tape/item?symbol=AAPL', tier: 'Free', auto: true },
  { id: 'fx-eurhuf', title: 'FX KPI (EUR/HUF)', endpoint: '/api/v1/eodhd/fx/EURHUF', tier: 'Pro', auto: true },
  { id: 'ai-models', title: 'AI Models', endpoint: '/api/v1/ai/models', tier: 'Pro', auto: true },
  { id: 'ta-full', title: 'Technical Analysis (Full)', endpoint: `/api/v1/stock/premium/technical-analysis/${DEFAULT_TICKER}/full`, tier: 'Pro', auto: true },
  { id: 'summary-alias', title: 'Summary (Alias)', endpoint: `/api/v1/stock/${DEFAULT_TICKER}/summary`, tier: 'Pro', auto: true },
  { id: 'technical-alias', title: 'Technical (Alias)', endpoint: `/api/v1/stock/${DEFAULT_TICKER}/technical`, tier: 'Pro', auto: true },
  { id: 'auth-me', title: 'Auth • Me', endpoint: '/api/v1/auth/me', tier: 'Free', auto: true },
  { id: 'auth-refresh', title: 'Auth • Refresh Token', endpoint: '/api/v1/auth/refresh-token', method: 'POST', tier: 'Free', auto: false },
];

const stringify = (data: any): string => {
  try { return JSON.stringify(data, null, 2); } catch { return String(data); }
};

const UXCardsCatalog: React.FC = () => {
  // SSE state shared by chat cards (id → active)
  const sseRef = useRef<Record<string, EventSource | null>>({});
  const [results, setResults] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [prompt, setPrompt] = useState<string>('Provide a brief analysis for AAPL');

  const fetchItem = useCallback(async (it: CatalogItem) => {
    try {
      setLoading((s) => ({ ...s, [it.id]: true }));
      setErrors((e) => ({ ...e, [it.id]: '' }));
      if ((it.method || 'GET') === 'GET') {
        const resp = await api.get<any>(it.endpoint);
        setResults((r) => ({ ...r, [it.id]: resp }));
      } else {
        // Minimal POST bodies where applicable
        const body = it.id === 'chat-rapid' ? { message: prompt } : {};
        const resp = await api.post<any>(it.endpoint, body);
        setResults((r) => ({ ...r, [it.id]: resp }));
      }
    } catch (err: any) {
      setErrors((e) => ({ ...e, [it.id]: err?.message || 'Error' }));
    } finally {
      setLoading((s) => ({ ...s, [it.id]: false }));
    }
  }, [prompt]);

  const startSSE = useCallback((it: CatalogItem) => {
    try {
      // Avoid duplicate streams
      if (sseRef.current[it.id]) return;
      const abs = (window as any).location ? it.endpoint.replace(/^\//, `${window.location.origin}/`) : it.endpoint;
      const es = new EventSource(abs);
      sseRef.current[it.id] = es;
      setResults((r) => ({ ...r, [it.id]: { status: 'streaming', tokens: [] } }));
      es.onmessage = (ev) => {
        try {
          const data = JSON.parse(ev.data);
          if (data?.type === 'token') {
            setResults((r) => {
              const prev = r[it.id]?.tokens || [];
              return { ...r, [it.id]: { status: 'streaming', tokens: [...prev, data.token].slice(-50) } };
            });
          } else if (data?.type === 'end') {
            setResults((r) => ({ ...r, [it.id]: { status: 'ended' } }));
            stopSSE(it);
          }
        } catch {}
      };
      es.onerror = () => {
        setErrors((e) => ({ ...e, [it.id]: 'SSE error' }));
        stopSSE(it);
      };
    } catch (e: any) {
      setErrors((er) => ({ ...er, [it.id]: e?.message || 'SSE init failed' }));
    }
  }, []);

  const stopSSE = useCallback((it: CatalogItem) => {
    const es = sseRef.current[it.id];
    if (es) {
      try { es.close(); } catch {}
      sseRef.current[it.id] = null;
    }
  }, []);

  useEffect(() => {
    // Auto-fetch selected items to show live preview instantly
    ITEMS.filter((i) => i.auto).forEach((i) => void fetchItem(i));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const grid = useMemo(() => ITEMS, []);

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">FinanceHub • UX Cards Catalog (P1)</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Live previews powered by real endpoints. Prompt for POST chat: </p>
        <div className="mt-2 flex items-center gap-2">
          <input
            className="w-full max-w-xl rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm dark:bg-slate-900 dark:text-white dark:border-slate-700"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            aria-label="Chat prompt"
          />
          <button
            className="rounded-md bg-slate-900 px-3 py-1.5 text-sm text-white dark:bg-white dark:text-slate-900"
            onClick={() => fetchItem({ id: 'chat-rapid', title: '', endpoint: `/api/v1/stock/chat/${DEFAULT_TICKER}`, method: 'POST', tier: 'Pro' })}
          >Send</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {grid.map((it) => (
          <Card key={it.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-medium text-slate-900 dark:text-white">{it.title}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{it.method || 'GET'} {it.endpoint}</div>
                </div>
                <span className="text-[10px] uppercase tracking-wide rounded-md px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">{it.tier}</span>
              </div>

              {/* Controls */}
              <div className="mt-3 flex items-center gap-2">
                {it.id === 'chat-stream' ? (
                  <>
                    <button className="rounded bg-slate-900 text-white px-2 py-1 text-xs dark:bg-white dark:text-slate-900" onClick={() => startSSE(it)}>Start</button>
                    <button className="rounded border border-slate-300 px-2 py-1 text-xs dark:border-slate-700" onClick={() => stopSSE(it)}>Stop</button>
                  </>
                ) : it.method === 'POST' ? (
                  <button className="rounded bg-slate-900 text-white px-2 py-1 text-xs dark:bg-white dark:text-slate-900" onClick={() => fetchItem(it)} disabled={loading[it.id]}>Call</button>
                ) : (
                  <button className="rounded bg-slate-900 text-white px-2 py-1 text-xs dark:bg-white dark:text-slate-900" onClick={() => fetchItem(it)} disabled={loading[it.id]}>Refresh</button>
                )}
                {loading[it.id] && <span className="text-xs text-slate-500">Loading…</span>}
                {errors[it.id] && <span className="text-xs text-red-600">{errors[it.id]}</span>}
              </div>

              {/* Preview */}
              <pre className="mt-3 max-h-48 overflow-auto rounded bg-slate-50 p-2 text-[11px] leading-snug text-slate-800 dark:bg-slate-900 dark:text-slate-200 border border-slate-200 dark:border-slate-800">
                {it.id === 'chat-stream'
                  ? stringify(results[it.id]?.tokens || [])
                  : stringify(results[it.id] ?? { note: 'No data yet' })}
              </pre>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default UXCardsCatalog;


