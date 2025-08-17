# FinanceHub Endpoint ↔ Frontend Matrix (v2025-08)

Legend: FE? (YES/NO), Status (Stable/Alias/Deprecated/Experimental), Monetization (Free/Pro/Ent)

| Path | Methods | Summary | FE? | Where Used | Status | Monetization | HTTP | Observed | Conforms? | Recommendations |
|------|---------|---------|-----|-----------|--------|--------------|------|----------|----------|-----------------|
| /api/v1/health | GET | Service health | YES | Footer/health badge | Stable | Free | 200 | {status:ok} | YES | Keep lightweight; add version info |
| /api/v1/stock/{ticker} | GET | Aggregated stock snapshot | YES | Stock page VM | Stable | Free→Pro | 200 | snapshot (stale flags possible) | YES | Add TTL 60–120s; expose plan hints |
| /api/v1/stock/{ticker}/chart | GET | OHLCV data (period/interval) | YES | useStockPageData | Stable | Free→Pro | 200 | UDF-like OHLC arrays | YES | Document whitelist; SWR cache hints |
| /api/v1/stock/{ticker}/fundamentals | GET | Company overview & metrics | YES | useStockPageData | Stable | Pro | 200 | metrics block | YES | Version fields; FE field-coverage audit (#008) |
| /api/v1/stock/{ticker}/news | GET | Latest ticker news | YES | useStockPageData | Stable | Pro | 200 | 10 articles (Yahoo) | YES | Disable fallback in prod; dedupe sources |
| /api/v1/stock/premium/{ticker}/summary | GET | AI summary (JSON/SSE) | YES | useAISummary | Stable | Pro/Ent | 200 | gated/ok | YES | SLA metrics; prompt audit log |
| /api/v1/stock/{ticker}/summary | GET | AI summary alias | YES | legacy hooks (if any) | Alias | Pro | 200 | alias | YES | Mark deprecated; sunset date |
| /api/v1/stock/search | GET | Symbol search | YES | SearchBar | Stable | Free | 200 | results: [] (now) | YES | Debounce; abuse guard |
| /api/v1/stock/ticker-tape | GET | Ticker tape feed | YES | TickerTapePro | Stable | Free | 200 | stale:true | YES | Deterministic ordering; 30s refresh |
| /api/v1/stock/chat/{ticker}/stream | GET | SSE AI chat stream | YES | useLLMStream | Stable | Pro/Ent | 403 | plan gate msg | YES | Heartbeat; reconnect policy; tracing |
| /api/v1/stock/chat/{ticker} | POST | Non-stream AI response | PARTIAL | not primary in FE | Stable | Pro | 200 | compat | YES | Size limits; audit id |
| /api/v1/stock/chat/{ticker}/deep | POST | Deep analysis (SSE) | YES | Chat overlay CTA | Stable | Pro+ | 200 | gated | YES | Credit pricing; SLA tiering |
| /api/v1/stock/esg/{ticker} | GET | ESG score | NO | – | Stable | Pro/Ent | 200/204 | provider‑gated | YES | Provider-agnostic fallback; surface quality flags |
| /api/v1/tv/bars | GET | TradingView UDF bars | YES | TV widget | Stable | Free | 200 | s:"ok" | YES | Rate limits; symbol normalization |
| /api/v1/tv/symbols | GET | TV symbols list | YES | TV widget | Stable | Free | 200 | presets ok | YES | Cache list; consistent metadata |
| /api/v1/tv/symbols/{symbol} | GET | TV symbol config | YES | TV widget | Stable | Free | 200 | config or 404 | YES | 404 clarity; doc examples |
| /api/v1/macro/forex/pairs | GET | Supported FX pairs | NO | – | Stable | Free | 200 | EUR/USD,GBP,JPY,CHF | YES | EODHD alignment |
| /api/v1/macro/forex/{pair} | GET | FX spot rate | NO | – | Stable | Free | 200 | EURUSD ok | YES | Return N/A if unavailable |
| /api/v1/macro/forex/{base}/{quote} | GET | FX spot (segmented) | NO | – | Stable | Free | 200 | ok | YES | Same as above |
| /api/v1/macro/forex/{pair}/history | GET | FX OHLC history | NO | – | Stable | Pro | 200 | ok | YES | Add FE chart integration |
| /api/v1/macro/fixing-rates | GET | Current fixing rates | YES | Macro page | Stable | Ent | 307→200 (/) | redirect w/o slash | YES | Use trailing "/"; normalize FE calls |
| /api/v1/macro/fixing-rates/health | GET | Data source health | NO | – | Stable | Ent | 200 | ok | YES | Keep internal dashboards |
| /api/v1/macro/fixing-rates/validation | GET | Cross-reference validation | NO | – | Stable | Ent | 200 | ok | YES | Periodic audits |
| /api/v1/macro/bubor | GET | BUBOR rates | NO | – | Stable | Ent | 200 | ok | YES | Remove alias; keep single route |
| /api/v1/macro/ecb/* | GET | ECB datasets (rpp, pss, estr, irs, sec, ... ) | PARTIAL | Macro cards | Stable | Free/Ent | 200 | ok | YES | Versioned docs; dataset codes table |
| /api/v1/market/news | GET | Market-wide news | NO | – | Stable | Pro | 200 | 10 items | YES | Forrás-jogok; dedupe; FE use in dashboard |
| /api/v1/auth/login | GET | OAuth login | YES | Auth flow | Stable | – | 302 | redirect | YES | PKCE |
| /api/v1/auth/callback | GET | OAuth callback | YES | Auth flow | Stable | – | 200 | ok | YES | Error handling UX |
| /api/v1/auth/status | GET | Auth status | YES | useAuth | Stable | – | 200 | unauthenticated | YES | Cache headers minimal |
| /api/v1/auth/refresh-token | POST | Refresh token | YES | useAuth | Stable | – | 200 | ok | YES | Short-lived access tokens |
| /api/v1/eodhd/fx/EURHUF | GET | Real-time FX (EODHD) | YES | Macro KPI | Stable | Pro | 200 | rate: numeric, source:EODHD | YES | Keep process-wide key visibility; no fallback |
| /api/v1/stock/premium/technical-analysis/{ticker} | GET | TA snapshot | YES | Macro page (optional) | Stable | Pro | 200 | optimized payload; indicator_count: 0 | YES | Monitor data coverage; pandas_ta optional |
| /api/v1/stock/premium/technical-analysis/{ticker}/full | GET | TA full | YES | Macro page (optional) | Stable | Pro | 200 | {status:success,data:{}} | YES | Align FE expectations; extend data when indicators available |
| /api/v1/stock/premium/technical-analysis/quote/{ticker} | GET | Quote (deprecated) | NO | – | Deprecated | Pro | 200 | status:success,fallback:true | YES | Keep deprecated off-schema; plan removal |

Notes:
- FE hookok SWR-t használnak; SSE-nél EventSource.
- EODHD az elsődleges FX forrás; ha adat nincs, N/A (no fallback) a kérések szerint.
- AI/TA prémium: kredit/SLA alapú differenciálás javasolt.
