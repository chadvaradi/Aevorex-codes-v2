## FinanceHub – Premium UX Website Plan (Cards Catalog + Product Pages)

This document records a complete, premium‑grade UX plan for the FinanceHub website that showcases all backend endpoints as live, monetizable cards. It is aligned with Rule #008 (full repo/doc sync, data parity, modularization, premium UX) and the FinanceHub Stocks/Macro rules.

### Principles
- Premium minimalism: clean hierarchy, optical centering, 60 fps interactions, skeleton shimmer < 200 ms, consistent dark/light tokens.
- Real data only: no mock. FX uses EODHD as primary source; if data is unavailable, show N/A (no fallback).
- Data coverage: every backend field is available in the frontend. Core fields are highlighted; all remaining fields are visible under “Show all fields”.
- Cost efficiency: Ticker Tape single‑load with CSS loop; in‑memory cache by default (Redis prepared). SWR dedupe and long `dedupingInterval` where applicable.
- Integration invariants: TradingView integration is not replaced, only configured. Chat uses SSE; first message is the AI summary, no placeholder.

### Information Architecture (SPA routes)
- `/financehub` — Landing (mission, premium UX principles, quick links)
- `/financehub/stocks` — Stocks product page (Ticker Tape → Stock Header → TradingView Chart → Analysis Bubbles → Chat overlay)
- `/financehub/macro` — Macro product page (FX KPI + TV line chart, Fixing Rates + Spread, Yield Curve + slopes)
- `/financehub/ux-cards` — Live catalog of all UX cards (75 entries) powered by real endpoints
- `/financehub/ux-cards/:id` — Card detail (endpoint, UI spec, cache/SWR, tier, upsell, full payload viewer)

### Page Layouts (wireframe‑level)
- Stocks
  - SubHeader centered; right actions isolated (plan badge, auth)
  - Ticker Tape (single load, loops via CSS)
  - Header snapshot (price, Δ%, cap, beta, ESG badge if available)
  - TradingView (candles by default, minimal toolbar, autosize)
  - Analysis Bubbles (4 fixed in one component): Company Overview, Financial Metrics (accordion shows all fields), Technical Analysis (Pro/Pro+), News Highlights
  - Chat overlay (SSE) with Deep CTA; non‑blocking errors
- Macro
  - Sticky right card: EUR/HUF KPI (EODHD) + micro sparkline + TradingView line (volume off)
  - Left column: Fixing Rates table (Euribor, BUBOR, Spread) with Health + Validation badges
  - Yield Curve line + mini slope cards (2s10s, 10s30s)
  - Compact Market News block
- UX Cards Catalog
  - Filters (Domain, Tier, Demoable) + search
  - Grid of live cards, each with: TierBadge, EndpointChip, InfoTooltip, Preview, CTA, “Show all fields”
  - Detail page shows the full backend payload and integration notes

### Component System
- `UXCardBase` (header/title + TierBadge + EndpointChip + InfoTooltip; body preview; footer CTA)
- `TierBadge` (Free/Pro/Pro+/Ent)
- `DataStatusBadge` (health/validation/SLA)
- `EndpointChip` (method + path)
- Shared constraints: ≤160 LOC per critical component; if exceeded, split into `*.view.tsx` and `*.logic.ts`.

### Data & Performance Strategy
- SWR defaults: `revalidateOnFocus=false`, domain‑specific TTLs; generous `dedupingInterval`. Errors are isolated per card (no cascade failure).
- Prefetch on ticker navigation: `/stock/{ticker}`, `/fundamentals`, `/news`, TradingView symbols.
- SSE chat: absolute URL to backend; heartbeat and reconnect; 403/402 triggers gentle upgrade CTA.
- TradingView: Stocks=candles; Macro=line (volume off). Disable `header_chart_type` on Macro; aggressively purge orphan iframes/scripts before mount.

### Monetization (card‑level)
- Free: essentials (Ticker Tape, snapshot, TV chart, HICP/€STR, search)
- Pro: fundamentals, ticker/market news, indices, EODHD FX KPI, AI rapid, TA snapshot
- Pro+: TA full, Deep Analysis SSE, broader ECB/Fed explorer
- Enterprise: fixing‑rates health/validation, comprehensive ECB, ops metrics, audits/exports

### Compliance & Rules
- Rule #008: performed full repo/doc sync; endpoint⇔FE matrix tracked. Any FE field without backend source or any unused backend field is flagged.
- Chat pipeline: preprocess (min length > 5, relevance ≥ 0.6), query_type auto, template selection under `prompt_templates/financehub/`, and ticker data block augmentation; only then POSTs to backend.
- Styling: Tailwind or modular CSS only; no inline style; no emoji UI. TradingView stays; configure only.

### Implementation Phases & Acceptance Criteria
- P0 (product pages ready)
  - Stocks: tape, header, TV (conflict‑free), bubbles, chat overlay operational
  - Macro: FX KPI + TV line, Fixing Rates + Spread, Yield Curve + slopes
  - AC: blueprint order, mobile feature parity, 60 fps, N/A displayed where data missing
- P1 (UX Cards Catalog foundation)
  - `/financehub/ux-cards` list + 20 live cards (Free/Pro/Ent mix)
  - AC: live endpoint previews; “Show all fields” shows entire payload
- P2 (complete catalog)
  - Remaining cards to total 75; detail pages; export/alerts where applicable
  - AC: all endpoints live; tier badges; upsells visible
- P3 (quality gates)
  - Lighthouse ≥ 92 (Perf + Accessibility); ESLint clean; typecheck; Cypress E2E for critical journeys

### Endpoint→Card Coverage (reference)
- Canonical per‑card specs including UI, interactions, cache and tier are defined in `FINANCEHUB_ENDPOINT_UX_CARDS.md`. The Catalog renders all of them as live demos. Each card’s detail page links back to that spec and surfaces the full backend payload to ensure field‑level parity.

### Risks & Mitigations
- TradingView style persistence → mitigate by hard style props per context and container‑scoped script insertion; purge old iframes/scripts on remount.
- API key availability (EODHD/ESG) → graceful N/A; visible provider flags; avoid mock/fallback for FX.
- Cost spikes → single‑load tape with CSS loop; SWR dedupe; long TTLs for slow‑changing datasets.

### Next Steps (Requires approval for new files)
- Pages: `/financehub` (landing), `/financehub/ux-cards`, `/financehub/ux-cards/:id` (detail)
- Components: `UXCardBase`, `TierBadge`, `EndpointChip`, `DataStatusBadge`
- Hooks: `useEndpointLiveDemo` (SWR wrapper)


