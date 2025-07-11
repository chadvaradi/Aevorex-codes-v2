export interface CompanyOverview {
  name: string;
  sector: string;
  /** Optional long business description coming from backend */
  description?: string;
  market_cap: number;
  pe_ratio: number;
  beta: number;
  esg_score?: number;
  esg_rating?: string;
  esg_risk_level?: 'Low' | 'Medium' | 'High' | 'Severe';
  environmental_score?: number;
  social_score?: number;
  governance_score?: number;
}

export interface FinancialMetrics {
  revenue: number | null;
  revenue_ttm: number | null;
  net_income: number | null;
  net_income_ttm: number | null;
  profit_margin: number | null;
  roe?: number | null;
  debt_equity?: number | null;
  pe_ratio?: number | null;
  forward_pe?: number | null;
  peg_ratio?: number | null;
  price_to_book?: number | null;
  price_to_sales?: number | null;
  dividend_yield?: number | null;
  beta?: number | null;
  eps?: number | null;
  operating_margin?: number | null;
  return_on_equity?: number | null;
  return_on_assets?: number | null;
  current_ratio?: number | null;
  quick_ratio?: number | null;
}

export interface PriceMetrics {
  pe_ratio: number | null;
  forward_pe: number | null;
}

export interface ChartDataPoint {
  date: string; // ISO YYYY-MM-DD
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface NewsArticle {
  title: string;
  summary: string;
  published_at: string; // ISO timestamp
  url?: string;
  source?: string;
}

export interface AiSummary {
  summary: string;
  sentiment: string; // e.g. "Bullish", "Bearish", "Neutral"
}

export interface FundamentalsResponse {
  overview: CompanyOverview;
  metrics: FinancialMetrics[];
  price_metrics?: PriceMetrics[];
  lastUpdated?: string; // ISO timestamp
  symbol?: string;
}

export interface ChartResponse {
  ohlcv: ChartDataPoint[];
  period: string; // e.g. "1y"
  interval: string; // e.g. "1d"
}

export interface StockData {
  fundamentals: FundamentalsResponse;
  news: NewsArticle[];
  chart: ChartResponse;
  aiSummary: AiSummary;
} 