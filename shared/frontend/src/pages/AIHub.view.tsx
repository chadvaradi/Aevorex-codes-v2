import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useModelList } from '../hooks/ai/useModelList';

const AIHub: React.FC = () => {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const [ready, setReady] = useState(false);
  const [inferenceReady, setInferenceReady] = useState<boolean>(false);
  const { models, loading: modelsLoading, error: modelsError } = useModelList();

  useEffect(() => {
    const run = async () => {
      const forceArchive = (import.meta as any).env?.VITE_FORCE_ARCHIVE_AIHUB === 'true';
      if (forceArchive) {
        navigate('/archive/aihub/');
        return;
      }
      try {
        // Model-present gating → prefer v1 models; fallback to v2
        const candidates = ['/api/v1/ai/models', '/api/v2/models'];
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 2500);
        let ok = false;
        for (const url of candidates) {
          try {
            const r = await fetch(url, { method: 'GET', signal: controller.signal });
            if (r.ok) { ok = true; break; }
          } catch {}
        }
        clearTimeout(timeout);
        if (!ok) {
          navigate('/archive/aihub/');
          return;
        }
        setReady(true);
      } catch {
        navigate('/archive/aihub/');
        return;
      } finally {
        setChecking(false);
      }
    };
    run();
  }, [navigate]);

  useEffect(() => {
    // Probe unified inference proxy (if exists). No-mock: disable if not available.
    const ctrl = new AbortController();
    const probe = async () => {
      try {
        const r = await fetch('/api/v1/ai/infer', { method: 'OPTIONS', signal: ctrl.signal });
        setInferenceReady(r.ok);
      } catch {
        setInferenceReady(false);
      }
    };
    probe();
    return () => ctrl.abort();
  }, []);

  if (checking) {
    return (
      <main className="flex-1 relative">
        <div className="min-h-[40vh] flex items-center justify-center">
          <div className="flex items-center gap-3 text-content-secondary">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
            <span>Loading AI Hub…</span>
          </div>
        </div>
      </main>
    );
  }

  if (!ready) return null; // navigated to archive

  // NOTE: Natív AIHub komponensek csak akkor renderelődnek, ha az API kész.
  // Az adatokat közvetlen API‑hívásokon keresztül kell betölteni (mock tiltva).
  return (
    <main className="flex-1 relative">
      <div className="px-4 sm:px-6 md:px-8 py-8 space-y-12">
        {/* Header / Hero */}
        <section className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-content-primary">AI Hub</h1>
            <p className="text-content-secondary mt-2">Enterprise AI capabilities with model-aware UX.</p>
          </div>
          <a href="/archive/aihub/" className="text-sm text-primary hover:underline">View archive version</a>
        </section>

        {/* Capabilities */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { t: 'Model routing', d: 'Automatic selection based on task and plan.' },
            { t: 'Streaming summaries', d: 'Token-by-token SSE for market context.' },
            { t: 'Cost visibility', d: 'Per‑1K token pricing and context window.' },
          ].map((c) => (
            <div key={c.t} className="rounded-lg border border-border-default bg-surface-default p-4">
              <h3 className="font-medium text-content-primary">{c.t}</h3>
              <p className="text-sm text-content-secondary mt-1">{c.d}</p>
            </div>
          ))}
        </section>

        {/* Models */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-content-primary">Available models</h2>
            {modelsLoading && <span className="text-xs text-content-secondary">Loading…</span>}
          </div>
          {modelsError && (
            <div className="text-sm text-red-600">Failed to load models.</div>
          )}
          {!modelsLoading && !modelsError && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {models.map((m) => (
                <div key={m.id} className="rounded-lg border border-border-default bg-surface-default p-4">
                  <div className="flex items-center justify-between">
                    <div className="font-medium text-content-primary break-all">{m.id}</div>
                    <div className="text-xs text-content-secondary">ctx {m.ctx ?? 'n/a'}</div>
                  </div>
                  <div className="text-sm text-content-secondary mt-2">{m.strength}</div>
                  <div className="text-xs text-content-tertiary mt-2">${m.price_in}/in • ${m.price_out}/out</div>
                  {m.ux_hint && <div className="text-xs text-content-tertiary mt-1">{m.ux_hint}</div>}
                  {m.notes && <div className="text-xs text-content-tertiary mt-1 line-clamp-2">{m.notes}</div>}
                </div>
              ))}
              {models.length === 0 && (
                <div className="text-sm text-content-secondary">No models available.</div>
              )}
            </div>
          )}
        </section>

        {/* Playground */}
        <section className="rounded-lg border border-border-default bg-surface-default p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-content-primary">Playground</h2>
            {!inferenceReady && (
              <span className="text-xs text-amber-600">API offline (unified inference endpoint not available)</span>
            )}
          </div>
          <div className="space-y-3">
            <textarea
              className="w-full min-h-[120px] rounded-md border border-border-default bg-surface-subtle p-3 text-content-primary outline-none focus:ring-2 focus:ring-primary/50"
              placeholder={inferenceReady ? 'Type a prompt…' : 'Playground disabled – missing /api/v1/ai/infer'}
              disabled={!inferenceReady}
            />
            <div className="flex items-center gap-3">
              <button
                className={`px-4 py-2 rounded-md text-white ${inferenceReady ? 'bg-primary hover:bg-primary/90' : 'bg-neutral-400 cursor-not-allowed'}`}
                disabled={!inferenceReady}
              >
                Run inference
              </button>
              <a href="/archive/aihub/" className="text-sm text-primary hover:underline">Open archive</a>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};

export default AIHub;