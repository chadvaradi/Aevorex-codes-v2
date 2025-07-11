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

export const useCryptoRate = (symbol: string | null) => {
  const { data, error, isLoading } = useSWR<CryptoRateResponse>(
    symbol ? `/api/v1/crypto/${symbol}` : null,
    (url) => get<CryptoRateResponse>(url),
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