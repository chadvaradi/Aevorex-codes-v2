import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useModelList } from '../hooks/ai/useModelList';
import { useContentHubData } from '../hooks/contenthub/useContentHubData';

const ContentHub: React.FC = () => {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const [ready, setReady] = useState(false);
  const { models, loading: modelsLoading, error: modelsError } = useModelList();
  const { metrics, stats, isLoading: contentLoading } = useContentHubData();

  useEffect(() => {
    const run = async () => {
      const forceArchive = (import.meta as any).env?.VITE_FORCE_ARCHIVE_CONTENTHUB === 'true';
      if (forceArchive) {
        navigate('/archive/contenthub/');
        return;
      }
      try {
        // Model-present gating → models endpoint as minimal readiness
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 2500);
        const res = await fetch('/api/v1/ai/models', { signal: controller.signal });
        clearTimeout(timeout);
        if (!res.ok) {
          navigate('/archive/contenthub/');
          return;
        }
        setReady(true);
      } catch {
        navigate('/archive/contenthub/');
        return;
      } finally {
        setChecking(false);
      }
    };
    run();
  }, [navigate]);

  if (checking) {
    return (
      <main className="flex-1 relative">
        <div className="min-h-[40vh] flex items-center justify-center">
          <div className="flex items-center gap-3 text-content-secondary">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
            <span>Loading Content Hub…</span>
          </div>
        </div>
      </main>
    );
  }

  if (!ready) return null; // navigated to archive

  return (
    <main className="flex-1 relative">
      <div className="px-4 sm:px-6 md:px-8 py-8 space-y-12">
        {/* Hero */}
        <section className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-content-primary">Content Hub</h1>
            <p className="text-content-secondary mt-2">Create AI‑assisted research and publishing workflows.</p>
          </div>
          <a href="/archive/contenthub/" className="text-sm text-primary hover:underline">View archive version</a>
        </section>

        {/* Tools / Studios */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { t: 'Newsletter Studio', d: 'Compile model‑assisted weekly digests.' },
            { t: 'Research Workspace', d: 'Organize sources and generate insights.' },
            { t: 'Visual Content', d: 'Charts and infographics pipeline.' },
          ].map((c) => (
            <div key={c.t} className="rounded-lg border border-border-default bg-surface-default p-4">
              <h3 className="font-medium text-content-primary">{c.t}</h3>
              <p className="text-sm text-content-secondary mt-1">{c.d}</p>
            </div>
          ))}
        </section>

        {/* Models availability (read-only) */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-content-primary">AI models status</h2>
            {modelsLoading && <span className="text-xs text-content-secondary">Loading…</span>}
          </div>
          {modelsError && (
            <div className="text-sm text-red-600">Failed to load models.</div>
          )}
          {!modelsLoading && !modelsError && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {models.slice(0, 6).map((m) => (
                <div key={m.id} className="rounded-lg border border-border-default bg-surface-default p-4">
                  <div className="flex items-center justify-between">
                    <div className="font-medium text-content-primary break-all">{m.id}</div>
                    <div className="text-xs text-content-secondary">ctx {m.ctx ?? 'n/a'}</div>
                  </div>
                  <div className="text-xs text-content-tertiary mt-2">${m.price_in}/in • ${m.price_out}/out</div>
                </div>
              ))}
              {models.length === 0 && (
                <div className="text-sm text-content-secondary">API offline.</div>
              )}
            </div>
          )}
        </section>

        {/* Live metrics from real backend endpoints (news/indices) */}
        <section className="rounded-lg border border-border-default bg-surface-default p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-content-primary">Live platform metrics</h2>
            {contentLoading && <span className="text-xs text-content-secondary">Loading…</span>}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <MetricCard label="Published (news)" value={String(stats.publishedContent)} />
            <MetricCard label="Indices connected" value={String(metrics.platformsConnected)} />
            <MetricCard label="SEO score (proxy)" value={String(metrics.seoScoreAvg)} />
            <MetricCard label="Projects" value={String(stats.totalProjects)} />
          </div>
        </section>
      </div>
    </main>
  );
};

export default ContentHub;

const MetricCard: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="rounded-md border border-border-default bg-surface-subtle p-4">
    <div className="text-2xl font-semibold text-content-primary">{value}</div>
    <div className="text-sm text-content-secondary mt-1">{label}</div>
  </div>
);