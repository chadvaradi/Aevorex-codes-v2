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

    const chartFetcher = async (url: string): Promise<ChartResponse | undefined> => {
        const raw: any = await get<any>(url);
        // Backend returns { status, data: { ohlcv, metadata: { period, interval } } }
        const ohlcv = raw?.data?.ohlcv ?? raw?.ohlcv ?? [];
        if (!ohlcv || ohlcv.length === 0) return undefined;
        const meta = raw?.data?.metadata ?? raw?.metadata ?? {};
        return {
            ohlcv,
            period: meta.period ?? '1y',
            interval: meta.interval ?? '1d',
        } as ChartResponse;
    };

    const { data: chart, error: chartError, isLoading: chartLoading } = useSWR<ChartResponse | undefined>(
        ticker ? `/api/v1/stock/${ticker}/chart` : null,
        chartFetcher
    );

    const newsFetcher = async (url: string): Promise<NewsArticle[]> => {
        const raw: any = await get<any>(url);
        const arr: any[] = raw?.news || raw?.data?.news || [];
        return arr as NewsArticle[];
    };

    const { data: news, error: newsError, isLoading: newsLoading } = useSWR<NewsArticle[]>(
        ticker ? `/api/v1/stock/${ticker}/news` : null,
        newsFetcher
    );

    const summaryFetcher = async (url: string): Promise<AiSummary> => {
        const raw: any = await get<any>(url);
        return {
            summary: raw?.data?.summary ?? raw?.summary ?? '',
            sentiment: raw?.data?.sentiment ?? raw?.sentiment ?? 'Neutral',
        } as AiSummary;
    };

    const { data: aiSummary, isLoading: summaryLoading } = useSWR<AiSummary>(
        ticker ? `/api/v1/stock/premium/${ticker}/summary` : null,
        summaryFetcher
    );

    const isLoading = fundamentalsLoading || chartLoading || newsLoading || summaryLoading;
    // Treat AI summary errors as non-critical; page should render core data even if summary fails
    const criticalError = fundamentalsError && chartError && newsError ? (fundamentalsError || chartError || newsError) : null;
    
    return {
        fundamentals,
        chart,
        news,
        aiSummary,
        isLoading,
        error: criticalError ? (criticalError as any).message : null,
    };
}; 