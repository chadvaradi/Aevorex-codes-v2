import useSWR from 'swr';
import { get } from '../../lib/api';

type CryptoSymbolsResponse = {
  symbols: string[];
};

export const useCryptoSymbols = () => {
  const { data, error, isLoading } = useSWR<CryptoSymbolsResponse>(
    '/api/v1/crypto/symbols',
    (url) => get<{ symbols: string[] }>(url),
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