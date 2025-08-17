# FinanceHub – External API Resources (v2025-08)

This document lists third‑party APIs/services used by FinanceHub, with purpose, where they are used, and key notes (licensing, fallback, reliability).

## LLM / AI

- OpenRouter (broker to multiple LLMs)
  - Used for: AI stock summaries, chat SSE (`/api/v1/stock/premium/{ticker}/summary`, `/api/v1/stock/chat/*`)
  - Purpose: model routing (OpenAI/Anthropic/etc.), cost control, availability
  - Notes: Prompt + input‑data audit trail required; SSE first‑token latency SLO; fallback model configured
  - Configured models (examples, centrally maintained via `/api/v1/ai/models`):
    - `openai/gpt-4o-mini` (ctx 128k, $0.005/$0.015 per 1k tokens) – balanced, default chat
    - `openai/gpt-4o` (ctx 128k, $0.01/$0.03) – flagship multimodal
    - `anthropic/claude-3-opus` (ctx 200k, $0.015/$0.075) – deep reasoning
    - `google/gemini-1.5-pro-latest` (ctx 1M, $0.005/$0.015) – huge context window

- (Optional secondary) Direct OpenAI/Anthropic
  - Used for: backup path via UnifiedAIService
  - Notes: Keep provider keys in secret store; enforce rate limits per plan

## Market Data – Stocks/Fundamentals/News

- EODHD
  - Used for: equities OHLCV, corporate actions (splits/dividends), selected fundamentals
  - Endpoints: consumed via backend stock orchestrators and `/api/v1/stock/*`
  - Notes: Primary daily bars for charts; timezone/adjustments handled server‑side; paid (licensed)
  - Datasets in scope (status per `docs/data_sources/EODHD_INTEGRATION_STATUS.md`):
    - Stocks/ETF/Funds End‑Of‑Day (adj OHLCV) – ✅
    - Live (delayed) quotes (equities/FX/crypto) – 🚧
    - Splits & Dividends – ✅
    - Delisted data – ⏳
    - Forex EOD – ✅; Intraday – 🚧; Websocket/Ticks – ⏳
    - Crypto EOD – ✅; Live – 🚧
    - Search API – ✅; Technical API (indicators) – ✅; Screener – ⏳
    - Exchanges metadata – 🚧

- Financial Modeling Prep (FMP) or equivalent (optional)
  - Used for: fundamentals, earnings calendar/surprises (where available)
  - Notes: Secondary provider to complement EODHD; feature‑flagged

- NewsAPI/CryptoCompare (aggregated)
  - Used for: `/api/v1/stock/{ticker}/news`, `/api/v1/market/news`
  - Notes: Deduplicate sources; respect licensing; disable dev fallback in prod

## FX / Macro

- ECB SDMX Data (official)
  - Used for: Yield Curve (YC_SR_*), policy rates (DFR/MRO/MSF), €STR
  - Endpoints: `/api/v1/tv/bars` for YC/ECB instruments; `/api/v1/macro/ecb/*`
  - Notes: Official source, no mock data; caching + versioned dataset codes

- MNB / BUBOR (official publications via fetcher)
  - Used for: BUBOR curve in Fixing Rates
  - Endpoints: `/api/v1/macro/fixing-rates`, `/api/v1/macro/bubor`
  - Notes: Cross‑validation and health checks available (`/health`, `/validation`)

- Euribor (EMMI via web‑scrape – license‑clean mirror)
  - Used for: official Euribor HSTA tenors (1W,1M,3M,6M,12M)
  - Endpoints: Fixing Rates combiner
  - Notes: T+1 delay; no fallback; quality flags surfaced in metadata

- EODHD FX
  - Used for: FX spot/history (EUR_USD, EUR_HUF, etc.) in `/api/v1/macro/forex/*`
  - Notes: Primary FX source; if unavailable, return N/A (no fallback per policy)

- DXY / Commodities (Brent/WTI) – STOOQ/Nasdaq free feeds (optional)
  - Used for: macro features and dashboards
  - Notes: Read‑only indicators; mark as optional in features

## Trading/Charting

- TradingView UDF schema (self‑hosted endpoint)
  - Used for: `/api/v1/tv/bars`, `/api/v1/tv/symbols*` powering TV widgets
  - Notes: Data served from our backends (ECB/FX/Euribor/BUBOR) mapped into UDF format

## Auth / Identity

- Google OAuth2
  - Used for: login/callback/status (`/api/v1/auth/*`)
  - Notes: PKCE; session storage; returns `plan` field alongside user after login

## Monitoring / Metrics

- Prometheus/Grafana (self‑hosted)
  - Used for: `/api/v1/metrics` exporter, dashboards (financehub‑overview)
  - Notes: Internal only

## Policy / Product Rules

- Data provenance: only official/public data; if unavailable → return "N/A" (no synthetic/mocks)
- Monetization gates: SSE chat stream & deep, extended history, CSV/PDF export (Pro/Ent)
- Rate limits: per‑plan, per key/provider; audit prompt+response for AI calls

---

Last updated: 2025‑08