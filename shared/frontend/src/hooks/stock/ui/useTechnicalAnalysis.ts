import useSWR from 'swr';
import { get } from '@/lib/api';

export interface TechnicalAnalysisResponse {
    recommendation: string; // e.g. "BUY", "SELL", "NEUTRAL"
    indicators: Record<string, number>;
    updatedAt: string;
}

type RawTechnicalResponse = {
    technical_analysis?: {
        latest_indicators: Record<string, number>;
        indicator_count?: number;
    };
    recommendation?: string;
    timestamp?: string;
};

export const useTechnicalAnalysis = (
    ticker: string | null,
    { skip = false }: { skip?: boolean } = {},
) => {
    const shouldFetch = ticker && !skip;
    const endpoint = shouldFetch ? `/api/v1/stock/${ticker}/technical` : null;

    const { data: raw, error, isLoading } = useSWR<RawTechnicalResponse>(
        endpoint,
        (url) => get(url),
        {
            revalidateOnFocus: false,
            dedupingInterval: 300000, // 5 min
        },
    );

    const indicators = raw?.technical_analysis?.latest_indicators ?? {};

    // Basic heuristic: use RSI14 if present to derive recommendation when API omits it
    const deriveRecommendation = (): string => {
        const rsi = indicators['RSI_14'];
        if (typeof rsi === 'number') {
            if (rsi < 30) return 'STRONG BUY';
            if (rsi < 40) return 'BUY';
            if (rsi > 70) return 'SELL';
            if (rsi > 60) return 'WEAK SELL';
        }
        return 'NEUTRAL';
    };

    const technical: TechnicalAnalysisResponse | undefined = raw
        ? {
              recommendation: raw.recommendation || deriveRecommendation(),
              indicators,
              updatedAt: raw.timestamp || new Date().toISOString(),
          }
        : undefined;

    return {
        technical,
        loading: isLoading,
        error: error ? error.message : null,
    };
}; 