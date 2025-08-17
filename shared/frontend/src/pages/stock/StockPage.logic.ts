import { useCallback } from 'react';
import { useStockPageData } from '@/hooks/stock/ui/useStockPageData';
import { useChatContext } from '@/contexts/ChatContext';

export interface UseStockViewModelResult {
  fundamentals: any;
  chart: any;
  news: any;
  loading: boolean;
  error: string | null | undefined;
  openChatForTicker: () => void;
  handleDeepDive: () => Promise<void>;
}

export const useStockViewModel = (ticker: string | null): UseStockViewModelResult => {
  const { openChat, sendDeepAnalysis } = useChatContext();

  const {
    fundamentals,
    chart,
    news,
    isLoading,
    error,
  } = useStockPageData(ticker ?? '');

  const openChatForTicker = useCallback(() => {
    if (!ticker) return;
    openChat(ticker);
  }, [ticker, openChat]);

  const handleDeepDive = useCallback(async () => {
    if (!ticker) return;
    openChat(ticker);
    await sendDeepAnalysis();
  }, [ticker, openChat, sendDeepAnalysis]);

  return {
    fundamentals,
    chart,
    news,
    loading: isLoading,
    error,
    openChatForTicker,
    handleDeepDive,
  };
};

