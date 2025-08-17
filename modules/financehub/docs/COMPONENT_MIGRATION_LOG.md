# FinanceHub – Frontend Komponens Migrációs Napló

*Frissítve:* 2025-06-16

Ez a fájl szolgál a statikus → React + Vite SPA átültetés státuszának nyomon követésére. **Minden komponensnél** jelöljük a legutóbbi állapotot, hogy elkerüljük a duplikált munkát és lássuk a hátralévő feladatokat.

| # | Legacy modul / JS / CSS | Új React modul (src/) | Átültetés állapota | Utolsó frissítés | Megjegyzés |
|---|-------------------------|-----------------------|-------------------|------------------|------------|
| 1 | `static/js/components/chat/*` + `chat` bubble CSS | `src/components/chat/ChatPanel.*` | ✅ **Ported & verified** | 2025-06-15 | SSE-streaming működik. |
| 2 | `static/js/ui/header-ui.js` + `header` CSS | `src/features/header/Header.view.tsx` | ⏳ **WIP – React refactor** | 2025-06-16 | useHeader hook + Header.view.tsx kész; LegacyBridge header-init kikapcsolható. |
| 3 | `static/js/components/ticker-tape/*` | tervezett: `src/features/ticker/TickerTape.view.tsx` | ☑️ **Bridged via Legacy** | 2025-06-16 | React Portal (`LegacyTickerTapePortal`) + TickerTapeUnified.init(). |
| 4 | `static/js/components/stock-header/*` | tervezett: `src/features/stock-header/StockHeader.view.tsx` | ❌ **Pending** | – | GET `/api/v1/stock/header/{ticker}` |
| 5 | TradingView Chart (`chart.js`) | `src/features/chart/TradingViewChart.view.tsx` | ☑️ **Bridged via Legacy** | 2025-06-16 | React Portal (`LegacyChartPortal`) relies on UnifiedChartManager auto-init. |
| 6 | Analysis Bubbles (Company Overview, Financial Metrics, Technical Analysis, News Highlights) | `src/features/bubbles/*` | ❌ **Pending** | – | Négy almappa. |
| 7 | Footer (`footer.js`) | `src/features/footer/Footer.view.tsx` | ❌ **Pending** | – | -- |
| 8 | ThemeManager (`theme-manager.js`) | `src/core/theme/useTheme.ts` | ☑️ **Bridged via Legacy** | 2025-06-14 | Végleges React-hook refaktor hátra van. |
| 9 | Global CSS (`static/css/main_financehub.css`) | – (globálisan @importálva) | ☑️ **Bridged via Legacy** | 2025-06-16 | Betöltve `src/index.css` @importtal; Tailwind mellett él. |
| 10 | Legacy JS bundle (`static/js/main_combined_financehub.js`) | – (Runtime import) | ☑️ **Bridged via Legacy** | 2025-06-16 | Dinamikus import `src/legacy/GlobalAdapter.ts`; window-scope singletonok elérhetők. |
| 11 | `archive_modules/*/shared/frontend/src/pages/StockPage.tsx` | `src/pages/stock/StockPage.view.tsx` + `src/pages/stock/StockPage.logic.ts` | ✅ **Ported & verified** | 2025-08-08 | 1:1 parity + LOC ≤160; TradingView + 4 bubble + SSE chat. |
| 12 | `archive_modules/*/shared/frontend/src/contexts/ChatContext*.tsx` | `src/contexts/ChatContext.tsx` (egységesített) | ✅ **Ported & verified** | 2025-08-08 | `ChatContext 2` re-export nélkül, egy konzisztens provider. |
| 13 | `archive_modules/*/shared/frontend/src/hooks/stock/llm/useLLMStream.ts` | `src/hooks/stock/useLLMStream.ts` | ✅ **Ported & verified** | 2025-08-08 | SSE GET auto-summary; POST non-stream reply; min-length/relevance gating. |
| 14 | `archive_modules/*/shared/frontend/src/hooks/stock/ui/useTickerTapeData.ts` | `src/hooks/stock/ui/useTickerTapeData.ts` | ✅ **Ported & verified** | 2025-08-08 | Endpoint: GET `/api/v1/stock/ticker-tape/`. |
| 15 | `archive_modules/*/shared/frontend/src/hooks/stock/ui/useFundamentals.ts` | `src/hooks/stock/ui/useFundamentals.ts` | ✅ **Ported & verified** | 2025-08-08 | Endpoint: GET `/api/v1/stock/{ticker}/fundamentals`. |
| 16 | `archive_modules/*/shared/frontend/src/hooks/stock/ui/useNews.ts` | `src/hooks/stock/ui/useNews.ts` | ✅ **Ported & verified** | 2025-08-08 | Endpoint: GET `/api/v1/stock/{ticker}/news`. |
| 17 | `archive_modules/*/shared/frontend/src/hooks/stock/ui/useChartData.ts` | `src/hooks/stock/ui/useChartData.ts` | ✅ **Ported & verified** | 2025-08-08 | Endpoint: GET `/api/v1/stock/{ticker}/chart`. |
| 18 | `archive_modules/*/shared/frontend/src/hooks/stock/ui/useTechnicalAnalysis.ts` | `src/hooks/stock/ui/useTechnicalAnalysis.ts` | ✅ **Ported & verified** | 2025-08-08 | Endpoint: GET `/api/v1/stock/{ticker}/technical`. |
| 19 | `archive_modules/*/shared/frontend/src/hooks/stock/useSearchData.ts` | `src/hooks/stock/useSearchData.ts` | ✅ **Ported & verified** | 2025-08-08 | Endpoint: GET `/api/v1/stock/search`. |
| 20 | `archive_modules/*/shared/frontend/src/hooks/system/useMetrics.ts` | `src/hooks/system/useMetrics.ts` | ✅ **Ported & verified** | 2025-08-08 | Prometheus `/metrics` text parser. |

**Jelmagyarázat**

- ✅ Ported & verified – React komponens kész, legacy inicializáció kikapcsolva, Lighthouse vizuális parity oké.
- ☑️ Bridged via Legacy – Még a LegacyBridge tölti be, de React-SPA-val kompatibilis, refaktor később.
- ⏳ WIP – Aktív fejlesztés alatt.
- ❌ Pending – Még teljesen legacy.

> Ha új komponenst portolsz vagy a státusz változik, **minden commitban** frissítsd ezt a táblázatot, hogy a csapat mindig lássa az aktuális helyzetet. 

> Megjegyzés (Wave 1): archív források érintetlenek maradnak (read‑only). A központi SPA‑ba integrálás egységes fájlokba történik drift nélkül. SSE stream mindenhol `GET`. 