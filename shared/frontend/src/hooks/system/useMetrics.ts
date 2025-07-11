import useSWR from 'swr';

// Prometheus metrics endpoint is exposed at the service root, not under /api/v1
const ENDPOINT = '/metrics';

// Very naive Prometheus text parser – enough for a small dashboard.
function parsePrometheus(text: string): Record<string, number> {
  const metrics: Record<string, number> = {};
  const lines = text.split('\n');
  for (const line of lines) {
    if (!line || line.startsWith('#')) continue; // Skip comments / empty
    const [metric, value] = line.trim().split(/\s+/);
    const numeric = parseFloat(value);
    if (!Number.isNaN(numeric)) {
      metrics[metric] = numeric;
    }
  }
  return metrics;
}

export const useMetrics = () => {
  const { data, error, isLoading } = useSWR<Record<string, number>>(
    ENDPOINT,
    (url) => fetch(url).then((r) => r.text()).then(parsePrometheus),
    {
      refreshInterval: 60000, // 60 s polling
      revalidateOnFocus: false,
    }
  );

  return {
    metrics: data ?? {},
    loading: isLoading,
    error: error ? (error as Error).message : null,
  } as const;
}; 