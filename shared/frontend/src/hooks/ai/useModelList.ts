import useSWR from 'swr';
import { get } from '../../lib/api';

export interface AIModel {
  id: string;
  ctx: number | null;
  price_in: number;
  price_out: number;
  strength: string;
  ux_hint: string;
  notes: string;
}

const fetcher = async (url: string): Promise<AIModel[]> => {
  const response = await get<AIModel[]>(url);
  return response.data;
};

export const useModelList = () => {
  const { data, error, isLoading } = useSWR<AIModel[]>(
    '/api/v1/ai/models',
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 3600000, // 1 hour
    }
  );

  return {
    models: data ?? [],
    loading: isLoading,
    error: error ? error.message : null,
  };
}; 