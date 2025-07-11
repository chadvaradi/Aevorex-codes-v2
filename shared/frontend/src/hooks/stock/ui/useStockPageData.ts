import useSWR from 'swr';
import { get } from '@/lib/api';
import type { FundamentalsResponse, ChartResponse, NewsArticle, AiSummary } from '../types';

// --- Új, moduláris interfészek a backend API alapján ---

export const useStockPageData = (ticker: string) => {
    // Raw backend response shape differs from the typed `FundamentalsResponse` the UI expects.
    // Backend keys: company_overview, financial_metrics, price_metrics, ...
    // UI expects: overview (CompanyOverview) and metrics: FinancialMetrics[]

    const { data: rawFundamentals, error: fundamentalsError, isLoading: fundamentalsLoading } = useSWR<any>(
        ticker ? `/api/v1/stock/${ticker}/fundamentals` : null,
        get
    );

    const fundamentals: FundamentalsResponse | undefined = rawFundamentals
        ? (() => {
              // Prefer nested object (v3 API) but support legacy flat shape
              const fmRaw =
                  rawFundamentals.financial_metrics ??
                  rawFundamentals.fundamentals?.financial_metrics ??
                  undefined;

              // Map backend → typed FinancialMetrics (renaming keys where necessary)
              const mappedMetrics = fmRaw
                  ? {
                        revenue_ttm: fmRaw.revenue_ttm ?? fmRaw.revenue ?? null,
                        net_income: fmRaw.net_income ?? fmRaw.net_income_ttm ?? null,
                        roe: fmRaw.roe ?? fmRaw.return_on_equity ?? null,
                        debt_equity: fmRaw.debt_equity ?? fmRaw.debt_to_equity ?? null,
                        pe_ratio: fmRaw.pe_ratio,
                        forward_pe: fmRaw.forward_pe,
                        peg_ratio: fmRaw.peg_ratio,
                        price_to_book: fmRaw.price_to_book,
                        price_to_sales: fmRaw.price_to_sales,
                        dividend_yield: fmRaw.dividend_yield,
                        beta: fmRaw.beta,
                        eps: fmRaw.eps,
                        profit_margin: fmRaw.profit_margin,
                        operating_margin: fmRaw.operating_margin,
                        return_on_equity: fmRaw.return_on_equity,
                        return_on_assets: fmRaw.return_on_assets,
                        current_ratio: fmRaw.current_ratio,
                        quick_ratio: fmRaw.quick_ratio,
                    }
                  : undefined;

              return {
                  symbol: rawFundamentals.symbol ?? rawFundamentals.fundamentals?.symbol ?? ticker,
                  lastUpdated:
                      rawFundamentals.timestamp ||
                      rawFundamentals.fundamentals?.timestamp ||
                      new Date().toISOString(),
                  overview:
                      rawFundamentals.company_overview ||
                      rawFundamentals.fundamentals?.company_overview ||
                      undefined,
                  metrics: mappedMetrics ? [mappedMetrics] : [],
              } as FundamentalsResponse;
          })()
        : undefined;

    const { data: chart, error: chartError, isLoading: chartLoading } = useSWR<ChartResponse>(
        ticker ? `/api/v1/stock/${ticker}/chart` : null,
        get
    );

    const { data: news, error: newsError, isLoading: newsLoading } = useSWR<{ news: NewsArticle[] }>(
        ticker ? `/api/v1/stock/${ticker}/news` : null,
        get
    );

    const { data: aiSummary, error: summaryError, isLoading: summaryLoading } = useSWR<AiSummary>(
        ticker ? `/api/v1/stock/premium/${ticker}/summary` : null,
        get
    );

    const isLoading = fundamentalsLoading || chartLoading || newsLoading || summaryLoading;
    const error = fundamentalsError || chartError || newsError || summaryError;
    
    return {
        fundamentals,
        chart,
        news: news?.news,
        aiSummary,
        isLoading,
        error: error ? error.message : null,
    };
}; 