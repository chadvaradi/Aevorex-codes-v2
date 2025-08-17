import useSWR from 'swr';
import { get } from '@/lib/api';
import { NewsArticle, FundamentalsResponse } from './types';

// --- Új, moduláris interfészek a backend API alapján ---

export interface FinancialMetrics {
  pe_ratio?: number;
  price_to_book?: number;
  price_to_sales?: number;
  // add other fields as needed
}

export interface PriceMetrics {
  current_price?: number;
  day_change?: number;
  day_change_percent?: number;
  // add other fields as needed
}

export interface AiSummary {
  content: string;
  timestamp: string;
  confidence?: number;
}

export const useStockPageData = (ticker: string) => {
    // Raw backend response shape differs from the typed `FundamentalsResponse` the UI expects.
    // Backend keys: company_overview, financial_metrics, price_metrics, ...
    // UI expects: overview (CompanyOverview) and metrics: FinancialMetrics[]

    const fundamentalsFetcher = async (url: string) => {
        const response = await get<{ fundamentals: FundamentalsResponse }>(url);
        return response.data;
    };

    const { data: rawFundamentals, error: fundamentalsError, isLoading: fundamentalsLoading } = useSWR<{ fundamentals: FundamentalsResponse }>(
        ticker ? `/api/v1/stock/${ticker}/fundamentals` : null,
        fundamentalsFetcher
    );

    const fundamentals: FundamentalsResponse | undefined = rawFundamentals
        ? (() => {
              // Prefer nested object (v3 API) but support legacy flat shape
              const fmRaw =
                  (rawFundamentals.fundamentals as any)?.financial_metrics ??
                  undefined;

              // Map backend → typed FinancialMetrics (renaming keys where necessary)
              const mappedMetrics = fmRaw
                  ? {
                        revenue_ttm: fmRaw.revenue_ttm ?? fmRaw.revenue ?? null,
                        // If backend omits net_income but provides revenue + profit_margin, derive it.
                        net_income:
                            fmRaw.net_income ??
                            fmRaw.net_income_ttm ??
                            (fmRaw.revenue && fmRaw.profit_margin
                                ? fmRaw.revenue * fmRaw.profit_margin
                                : null),
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
                  symbol: (rawFundamentals.fundamentals as any)?.symbol ?? ticker,
                  lastUpdated:
                      (rawFundamentals.fundamentals as any)?.timestamp ||
                      new Date().toISOString(),
                  overview:
                      (rawFundamentals.fundamentals as any)?.company_overview ||
                      undefined,
                  metrics: mappedMetrics ? [mappedMetrics] : [],
              } as FundamentalsResponse;
          })()
        : undefined;

    const chartFetcher = async (url: string): Promise<any> => {
        const response = await get<any>(url);
        // Normalise to { data: { ohlcv, metadata } }
        if (response?.data?.data?.ohlcv) return response.data.data;
        if ((response as any)?.data?.ohlcv) return (response as any).data;
        return response.data;
    };

    const newsFetcher = async (url: string) => {
        const response = await get<{ news: NewsArticle[] }>(url);
        return response.data;
    };

    const { data: chart, error: chartError, isLoading: chartLoading } = useSWR<any>(
        ticker ? `/api/v1/stock/${ticker}/chart` : null,
        chartFetcher
    );

    const { data: rawNews, error: newsError, isLoading: newsLoading } = useSWR<{ news: NewsArticle[] }>(
        ticker ? `/api/v1/stock/${ticker}/news` : null,
        newsFetcher
    );

    // Normalise news schema → NewsArticle (backend keys: title, summary, url, image_url, published_date, source, sentiment)
    const mapToNewsArticle = (raw: any): NewsArticle => {
        return {
            title: raw?.title ?? 'Untitled',
            summary: raw?.summary ?? '',
            published_at: raw?.published_date ?? new Date().toISOString(),
            url: raw?.url ?? '#',
            source: raw?.source ?? '',
            sentiment: raw?.sentiment ?? 'neutral',
        } as NewsArticle;
    };

    const summaryFetcher = async (url: string): Promise<AiSummary> => {
        const response = await get<any>(url);
        // Backend returns { status, data: { summary } }
        if (response?.data?.data?.summary) {
            return { content: response.data.data.summary, timestamp: new Date().toISOString() } as any;
        }
        return response.data as any;
    };

    const { data: aiSummary, error: summaryError, isLoading: summaryLoading } = useSWR<AiSummary>(
        ticker ? `/api/v1/stock/premium/${ticker}/summary` : null,
        summaryFetcher
    );

    const isLoading = fundamentalsLoading || chartLoading || newsLoading || summaryLoading;
    const error = fundamentalsError || chartError || newsError || summaryError;
    
    return {
        fundamentals,
        chart,
        news: rawNews?.news ? rawNews.news.map(mapToNewsArticle) : [],
        aiSummary,
        isLoading,
        error: error ? error.message : null,
    };
}; 