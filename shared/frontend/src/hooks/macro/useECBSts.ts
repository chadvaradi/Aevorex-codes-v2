import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export interface STSRecord {
  [indicator: string]: number;
}

export interface STSResponse {
  status: string;
  metadata: {
    total_records: number;
    indicators: string[];
    start_date: string;
    end_date: string;
  };
  data: {
    [date: string]: STSRecord;
  };
}

export const useECBSts = (indicators?: string[]) => {
  const query = indicators && indicators.length ? `?indicators=${indicators.join(',')}` : '';
  const { data, error, isLoading } = useSWR<STSResponse>(`/api/v1/macro/ecb/sts/latest${query}`, fetcher, {
    refreshInterval: 60_000 * 30, // 30 perc
  });

  return {
    data: data?.data ?? {},
    metadata: data?.metadata,
    isLoading,
    error,
  };
}; 