/**
 * IBKR-Grade Ticker Configuration
 * 
 * Master list of 29 symbols optimized for 1920px marquee display
 * with ~40s full-loop cycle time and comprehensive market coverage.
 */

export interface TickerSymbol {
  symbol: string;
  name: string;
  priority: number; // 1 = highest priority, 5 = lowest
  category: string;
  exchange?: string;
  description?: string;
}

export interface TickerCategory {
  id: string;
  name: string;
  description: string;
  symbols: TickerSymbol[];
  displayOrder: number;
}

// US Equities - Magnificent 7 + High Volume Movers
const US_EQUITIES: TickerSymbol[] = [
  { symbol: 'NVDA', name: 'NVIDIA Corp', priority: 1, category: 'us_equities', exchange: 'NASDAQ', description: 'AI/GPU leader' },
  { symbol: 'AAPL', name: 'Apple Inc', priority: 1, category: 'us_equities', exchange: 'NASDAQ', description: 'Consumer tech giant' },
  { symbol: 'MSFT', name: 'Microsoft Corp', priority: 1, category: 'us_equities', exchange: 'NASDAQ', description: 'Cloud & productivity' },
  { symbol: 'AMZN', name: 'Amazon.com Inc', priority: 1, category: 'us_equities', exchange: 'NASDAQ', description: 'E-commerce & cloud' },
  { symbol: 'GOOGL', name: 'Alphabet Inc', priority: 1, category: 'us_equities', exchange: 'NASDAQ', description: 'Search & advertising' },
  { symbol: 'META', name: 'Meta Platforms', priority: 1, category: 'us_equities', exchange: 'NASDAQ', description: 'Social media' },
  { symbol: 'TSLA', name: 'Tesla Inc', priority: 1, category: 'us_equities', exchange: 'NASDAQ', description: 'Electric vehicles' },
  { symbol: 'BAC', name: 'Bank of America', priority: 2, category: 'us_equities', exchange: 'NYSE', description: 'Major bank' },
  { symbol: 'HOOD', name: 'Robinhood Markets', priority: 2, category: 'us_equities', exchange: 'NASDAQ', description: 'Trading platform' },
  { symbol: 'PLTR', name: 'Palantir Technologies', priority: 2, category: 'us_equities', exchange: 'NYSE', description: 'Data analytics' },
  { symbol: 'AMD', name: 'Advanced Micro Devices', priority: 2, category: 'us_equities', exchange: 'NASDAQ', description: 'Semiconductor' },
  { symbol: 'INTC', name: 'Intel Corp', priority: 2, category: 'us_equities', exchange: 'NASDAQ', description: 'Chip manufacturer' },
];

// Global Index ETFs
const INDEX_ETFS: TickerSymbol[] = [
  { symbol: 'SPY', name: 'SPDR S&P 500 ETF', priority: 1, category: 'index_etfs', exchange: 'NYSE', description: 'S&P 500 tracker' },
  { symbol: 'QQQ', name: 'Invesco QQQ ETF', priority: 1, category: 'index_etfs', exchange: 'NASDAQ', description: 'Nasdaq-100 tracker' },
  { symbol: 'DIA', name: 'SPDR Dow Jones ETF', priority: 2, category: 'index_etfs', exchange: 'NYSE', description: 'Dow 30 tracker' },
  { symbol: 'IWM', name: 'iShares Russell 2000', priority: 2, category: 'index_etfs', exchange: 'NYSE', description: 'Small-cap tracker' },
];

// Index Futures (Cash Equivalent)
const INDEX_FUTURES: TickerSymbol[] = [
  { symbol: 'ES=F', name: 'E-mini S&P 500', priority: 1, category: 'index_futures', exchange: 'CME', description: 'S&P 500 futures' },
  { symbol: 'NQ=F', name: 'E-mini Nasdaq-100', priority: 1, category: 'index_futures', exchange: 'CME', description: 'Nasdaq futures' },
  { symbol: 'YM=F', name: 'E-mini Dow', priority: 2, category: 'index_futures', exchange: 'CME', description: 'Dow futures' },
  { symbol: 'RTY=F', name: 'E-mini Russell 2000', priority: 2, category: 'index_futures', exchange: 'CME', description: 'Russell futures' },
  { symbol: 'VIX', name: 'CBOE Volatility Index', priority: 1, category: 'index_futures', exchange: 'CBOE', description: 'Fear gauge' },
  { symbol: 'DAX', name: 'DAX Index', priority: 3, category: 'index_futures', exchange: 'XETRA', description: 'German index' },
  { symbol: 'FTSE', name: 'FTSE 100 Index', priority: 3, category: 'index_futures', exchange: 'LSE', description: 'UK index' },
];

// Forex Majors + 2 Cross
const FOREX_MAJORS: TickerSymbol[] = [
  { symbol: 'EURUSD=X', name: 'EUR/USD', priority: 1, category: 'forex', description: 'Euro vs US Dollar' },
  { symbol: 'USDJPY=X', name: 'USD/JPY', priority: 1, category: 'forex', description: 'US Dollar vs Japanese Yen' },
  { symbol: 'GBPUSD=X', name: 'GBP/USD', priority: 1, category: 'forex', description: 'British Pound vs US Dollar' },
  { symbol: 'AUDUSD=X', name: 'AUD/USD', priority: 2, category: 'forex', description: 'Australian Dollar vs US Dollar' },
  { symbol: 'USDCAD=X', name: 'USD/CAD', priority: 2, category: 'forex', description: 'US Dollar vs Canadian Dollar' },
  { symbol: 'USDCHF=X', name: 'USD/CHF', priority: 2, category: 'forex', description: 'US Dollar vs Swiss Franc' },
  { symbol: 'EURJPY=X', name: 'EUR/JPY', priority: 2, category: 'forex', description: 'Euro vs Japanese Yen' },
  { symbol: 'GBPJPY=X', name: 'GBP/JPY', priority: 2, category: 'forex', description: 'British Pound vs Japanese Yen' },
];

// Crypto Market-cap TOP 5 + 2 Narrative
const CRYPTO_MAJORS: TickerSymbol[] = [
  { symbol: 'BTC-USD', name: 'Bitcoin', priority: 1, category: 'crypto', description: 'Digital gold' },
  { symbol: 'ETH-USD', name: 'Ethereum', priority: 1, category: 'crypto', description: 'Smart contracts platform' },
  { symbol: 'BNB-USD', name: 'BNB', priority: 2, category: 'crypto', description: 'Binance ecosystem token' },
  { symbol: 'SOL-USD', name: 'Solana', priority: 2, category: 'crypto', description: 'High-performance blockchain' },
  { symbol: 'XRP-USD', name: 'XRP', priority: 2, category: 'crypto', description: 'Cross-border payments' },
  { symbol: 'DOGE-USD', name: 'Dogecoin', priority: 3, category: 'crypto', description: 'Meme cryptocurrency' },
  { symbol: 'TON-USD', name: 'Toncoin', priority: 3, category: 'crypto', description: 'Telegram blockchain' },
];

// Commodities (High Macro Correlation)
const COMMODITIES: TickerSymbol[] = [
  { symbol: 'GC=F', name: 'Gold Futures', priority: 1, category: 'commodities', exchange: 'COMEX', description: 'Precious metal' },
  { symbol: 'SI=F', name: 'Silver Futures', priority: 2, category: 'commodities', exchange: 'COMEX', description: 'Industrial metal' },
  { symbol: 'CL=F', name: 'Crude Oil Futures', priority: 1, category: 'commodities', exchange: 'NYMEX', description: 'WTI crude oil' },
  { symbol: 'NG=F', name: 'Natural Gas Futures', priority: 2, category: 'commodities', exchange: 'NYMEX', description: 'Energy commodity' },
];

// Master Categories Configuration
export const TICKER_CATEGORIES: TickerCategory[] = [
  {
    id: 'us_equities',
    name: 'US Equities',
    description: 'Magnificent 7 + High Volume Movers',
    symbols: US_EQUITIES,
    displayOrder: 1,
  },
  {
    id: 'index_etfs',
    name: 'Index ETFs',
    description: 'Global Index Trackers',
    symbols: INDEX_ETFS,
    displayOrder: 2,
  },
  {
    id: 'index_futures',
    name: 'Index Futures',
    description: 'Cash Equivalent Futures',
    symbols: INDEX_FUTURES,
    displayOrder: 3,
  },
  {
    id: 'forex',
    name: 'Forex',
    description: 'Major Currency Pairs',
    symbols: FOREX_MAJORS,
    displayOrder: 4,
  },
  {
    id: 'crypto',
    name: 'Cryptocurrency',
    description: 'Top Market Cap + Narrative',
    symbols: CRYPTO_MAJORS,
    displayOrder: 5,
  },
  {
    id: 'commodities',
    name: 'Commodities',
    description: 'High Macro Correlation',
    symbols: COMMODITIES,
    displayOrder: 6,
  },
];

// Flattened list of all symbols (29 total)
export const ALL_TICKER_SYMBOLS: TickerSymbol[] = TICKER_CATEGORIES.flatMap(cat => cat.symbols);

// Priority-sorted symbols for ticker tape display
export const TICKER_TAPE_SYMBOLS: TickerSymbol[] = ALL_TICKER_SYMBOLS.sort((a, b) => a.priority - b.priority);

// Configuration constants
export const TICKER_CONFIG = {
  TOTAL_SYMBOLS: ALL_TICKER_SYMBOLS.length,
  MARQUEE_DURATION_SECONDS: 40,
  MOBILE_DISPLAY_LIMIT: 10,
  REFRESH_INTERVAL_MS: 30000,
  CACHE_TTL_SECONDS: 300,
} as const;

// Export symbol arrays by category for convenience
export const SYMBOL_ARRAYS = {
  US_EQUITIES: US_EQUITIES.map(s => s.symbol),
  INDEX_ETFS: INDEX_ETFS.map(s => s.symbol),
  INDEX_FUTURES: INDEX_FUTURES.map(s => s.symbol),
  FOREX_MAJORS: FOREX_MAJORS.map(s => s.symbol),
  CRYPTO_MAJORS: CRYPTO_MAJORS.map(s => s.symbol),
  COMMODITIES: COMMODITIES.map(s => s.symbol),
  ALL: ALL_TICKER_SYMBOLS.map(s => s.symbol),
} as const; 