import useSWR from 'swr';
import { get } from '../../lib/api';

export interface DebtEquityStats {
  debt_total: number;
  equity_total: number;
  start_date: string;
  end_date: string;
}

// Back-end aggregator még nincs, front-end 3 párhuzamos fetch-et végez.
// A válaszokat összevonjuk és visszaadjuk normalizált struktúrában.

const ENDPOINTS = [
  '/api/v1/macro/ecb/sec', // Securities statistics
  '/api/v1/macro/ecb/ivf', // Investment funds
  '/api/v1/macro/ecb/cbd', // Consolidated banking
];

async function fetchDebtEquity(): Promise<DebtEquityStats> {
  // Futassuk párhuzamosan
  const responses = await Promise.all(ENDPOINTS.map((e) => get<any>(e)));

  let debt = 0;
  let equity = 0;
  let start = '9999-12-31';
  let end = '0000-01-01';

  responses.forEach((res) => {
    if (!res?.data) return;
    Object.entries(res.data as Record<string, any>).forEach(([date, values]) => {
      const v = values as Record<string, number>;
      debt += v.debt_securities ?? 0;
      equity += v.equity_securities ?? 0;
      if (date < start) start = date;
      if (date > end) end = date;
    });
  });

  return {
    debt_total: Math.round(debt),
    equity_total: Math.round(equity),
    start_date: start,
    end_date: end,
  };
}

export const useDebtEquityStats = () => {
  const { data, error, isLoading } = useSWR<DebtEquityStats>(
    'debt-equity-stats',
    fetchDebtEquity,
    {
      revalidateOnFocus: false,
      dedupingInterval: 300000, // 5 min
    }
  );

  return {
    stats: data,
    isLoading,
    error,
  };
}; 