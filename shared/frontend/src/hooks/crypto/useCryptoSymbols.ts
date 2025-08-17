import useSWR from 'swr';
import { get } from '../../lib/api';

type CryptoSymbolsResponse = {
  symbols: string[];
};

const fetcher = async (url: string): Promise<CryptoSymbolsResponse> => {
  const response = await get<{ symbols: string[] }>(url);
  return response.data;
};

export const useCryptoSymbols = () => {
  const { data, error, isLoading } = useSWR<CryptoSymbolsResponse>(
    '/api/v1/crypto/symbols',
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 3600000, // 1 hour
    }
  );

  return {
    symbols: data?.symbols,
    isLoading,
    error,
  };
}; 