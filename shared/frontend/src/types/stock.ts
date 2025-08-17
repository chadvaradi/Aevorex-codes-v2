export interface FinancialMetrics {
  revenue_ttm: number | null;
  net_income_ttm: number | null;
  operating_income_ttm: number | null;
  total_debt: number | null;
  total_equity: number | null;
  free_cash_flow_ttm: number | null;
  gross_profit_ttm: number | null;
  ebitda_ttm: number | null;
  pe_ratio: number | null;
  pb_ratio: number | null;
  debt_to_equity: number | null;
  current_ratio: number | null;
  quick_ratio: number | null;
  roa: number | null;
  roe: number | null;
  gross_margin: number | null;
  operating_margin: number | null;
  net_margin: number | null;
}

export interface PriceMetrics {
  current_price: number | null;
  open_price: number | null;
  high_price: number | null;
  low_price: number | null;
  previous_close: number | null;
  volume: number | null;
  market_cap: number | null;
  beta: number | null;
  dividend_yield: number | null;
  eps_ttm: number | null;
  price_to_sales: number | null;
  price_to_book: number | null;
  fifty_two_week_high: number | null;
  fifty_two_week_low: number | null;
}

export interface ChartResponse {
  status: string;
  data: {
    ohlcv: Array<{
      date: string;
      open: number;
      high: number;
      low: number;
      close: number;
      volume: number;
    }>;
    metadata: {
      symbol: string;
      interval: string;
      start_date: string;
      end_date: string;
    };
  };
}

export interface AiSummary {
  status: string;
  data: {
    summary: string;
    key_points: string[];
    sentiment: 'positive' | 'negative' | 'neutral';
    confidence: number;
    timestamp: string;
  };
}

export interface FundamentalsResponse {
  status: string;
  fundamentals: {
    financial_metrics: FinancialMetrics;
    price_metrics: PriceMetrics;
    timestamp: string;
    company_overview: {
      name: string;
      sector: string;
      industry: string;
      description: string;
      market_cap: number;
      employees: number;
    };
    // Legacy compatibility - alias for company_overview
    overview?: {
      name: string;
      sector: string;
      industry: string;
      description: string;
      market_cap: number;
      employees: number;
      pe_ratio?: number;
      beta?: number;
    };
    // Additional metrics compatibility
    metrics?: {
      pe_ratio?: number;
      market_cap?: number;
      dividend_yield?: number;
    };
  };
  // Direct overview access for backward compatibility
  overview?: {
    name: string;
    sector: string;
    industry: string;
    description: string;
    market_cap: number;
    employees: number;
    pe_ratio?: number;
    beta?: number;
  };
  // Direct metrics access for backward compatibility
  metrics?: Array<{
    pe_ratio?: number;
    market_cap?: number;
    dividend_yield?: number;
    revenue_ttm?: number;
    net_income_ttm?: number;
  }>;
}

export interface CompanyOverview {
  name: string;
  sector: string;
  industry: string;
  description: string;
  market_cap: number;
  employees: number;
  pe_ratio?: number;
  beta?: number;
  esg_score?: number;
  esg_rating?: string;
  esg_risk_level?: 'Low' | 'Medium' | 'High' | 'Severe';
  environmental_score?: number;
  social_score?: number;
  governance_score?: number;
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
  url: string;
  published_at: string;
  source: string;
  summary: string;
  sentiment: 'positive' | 'negative' | 'neutral';
}

// Metrics type for compatibility with existing components
export interface Metrics {
  revenue_ttm: number | undefined | null;
  net_income_ttm: number | undefined | null;
  operating_income_ttm: number | undefined | null;
  total_debt: number | undefined | null;
  total_equity: number | undefined | null;
  free_cash_flow_ttm: number | undefined | null;
  gross_profit_ttm: number | undefined | null;
  ebitda_ttm: number | undefined | null;
  pe_ratio: number | undefined | null;
  pb_ratio: number | undefined | null;
  debt_to_equity: number | undefined | null;
  current_ratio: number | undefined | null;
  quick_ratio: number | undefined | null;
  roa: number | undefined | null;
  roe: number | undefined | null;
  gross_margin: number | undefined | null;
  operating_margin: number | undefined | null;
  net_margin: number | undefined | null;
}

export interface Overview {
  name: string;
  sector: string;
  industry: string;
  description: string;
  market_cap: number;
  employees: number;
}

// StockData interface for the overall page data structure
export interface StockData {
  fundamentals: FundamentalsResponse;
  news: NewsArticle[];
  chart: ChartResponse;
  aiSummary: AiSummary;
} 