import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export interface PolicyNote {
  date: string;
  note: string;
  source: string;
  relevance_score?: number;
}

export interface PolicyNotesResponse {
  status: string;
  data: PolicyNote[];
}

export const useECBPolicyNotes = () => {
  const { data, error, isLoading } = useSWR<PolicyNotesResponse>('/api/v1/macro/ecb/policy-notes', fetcher, {
    refreshInterval: 60_000 * 60, // 1 óra
  });

  return {
    data,
    loading: isLoading,
    error,
  };
}; 