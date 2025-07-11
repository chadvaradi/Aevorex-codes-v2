export interface BaseApiResponse<T, M = Record<string, unknown>> {
  status: 'success' | 'error';
  data: T;
  metadata: M;
  message?: string;
} 