# FinanceHub – Stocks Page Body Archive (2025‑08‑12)

This document archives the current Stocks page body and outlines the premium UX redesign target for the Stocks page.

---

## Current Snapshot – StockPage.view.tsx (body)

```tsx
import React from 'react';

const StockPageView: React.FC = () => {
  // Temporarily empty page body per redesign; global Header/Footer remain via layout
  return (
    <main className="min-h-[40vh] w-full" aria-label="Stock page placeholder" />
  );
};

export default StockPageView;
```

Notes:
- Body is intentionally empty pending redesign; layout provides Header/Footer.

---

## Target UX – Stocks Page (final structure)

1) SubHeader (centered), right actions: plan badge, auth status
2) Ticker Tape (single load, CSS loop; mem cache)
3) Stock Header (GET /api/v1/stock/{ticker}): price, Δ%, cap, beta; ESG badge if available (GET /api/v1/stock/esg/{ticker})
4) TradingView Advanced Chart (candles, minimal toolbar, autosize; UDF endpoints)
5) Analysis Bubbles (one component, four fixed):
   - Company Overview (fundamentals key facts)
   - Financial Metrics (grid + “Show all fields” accordion for full payload)
   - Technical Analysis (snapshot/full via premium TA endpoints; soft paywall)
   - News Highlights (ticker news with source/time)
6) Chat Overlay (SSE): first message auto AI summary; Deep Analysis CTA (Pro+)

Performance/UX:
- SWR: snapshot 60–120s; fundamentals/ESG 24h; news 5–10m; TA 15m; `revalidateOnFocus=false`.
- Skeleton < 200 ms; no layout shift; mobile parity (vertical stacking).

## Design Principles (shared)

- Premium minimalism; optical centering; consistent dark/light tokens; 60 fps interactions.
- Every backend field must be accessible: key fields highlighted, full payload under “Show all fields”.
- Monetization: each premium card shows subtle upsell (Free → Pro → Pro+ → Enterprise).


