import useSWR from 'swr';
import { get } from '../../lib/api';

interface HealthResponse {
  status: string;
  version?: string;
  uptime?: number;
}

/**
 * Polls the backend /api/v1/health endpoint every 30 s and returns a high-level
 * status string.  The hook is intentionally lightweight so it can be consumed
 * by any component (e.g. Header) without noticeable overhead.
 */
export const useHealthStatus = () => {
  const { data, error, isLoading } = useSWR<HealthResponse>(
    '/api/v1/health',
    (url) => get<HealthResponse>(url),
    {
      refreshInterval: 30000, // 30 s polling
      revalidateOnFocus: false,
    }
  );

  const status: 'healthy' | 'degraded' | 'unhealthy' | 'unknown' = (() => {
    const raw = data?.status?.toLowerCase();
    if (raw === 'ok' || raw === 'healthy' || raw === 'success') return 'healthy';
    if (raw === 'degraded' || raw === 'warn') return 'degraded';
    if (raw === 'fail' || raw === 'unhealthy') return 'unhealthy';
    return 'unknown';
  })();

  return {
    status,
    loading: isLoading,
    error: error ? (error as Error).message : null,
  } as const;
}; 