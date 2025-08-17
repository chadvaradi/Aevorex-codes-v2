import useSWR from 'swr';
import { get } from '../../lib/api';

type CryptoRateResponse = {
  metadata: {
    symbol: string;
    source: string;
    timestamp: string;
  };
  rate: number;
};

const fetcher = async (url: string): Promise<CryptoRateResponse> => {
  const response = await get<CryptoRateResponse>(url);
  return response.data;
};

export const useCryptoRate = (symbol: string | null) => {
  const { data, error, isLoading } = useSWR<CryptoRateResponse>(
    symbol ? `/api/v1/crypto/${symbol}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
    }
  );

  return {
    rateData: data,
    isLoading,
    error,
  };
}; 