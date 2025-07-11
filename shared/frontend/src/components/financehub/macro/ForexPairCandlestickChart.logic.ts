import { useForexPairHistory } from '@/hooks/macro/useForexPairHistory';

export const useForexCandlestickLogic = (pair: string | null) => {
  const { ohlc, isLoading, isError, refresh } = useForexPairHistory(pair);

  const series = ohlc.map((d) => ({
    date: d.date,
    open: d.open,
    high: d.high,
    low: d.low,
    close: d.close,
  }));

  return { series, isLoading, isError, refresh };
}; 