# 🔍 ENDPOINT MAPPING ANALYSIS - Rule #008

**Generálva:** 2025-01-24 (ULTRATHINK módban)  
**Cél:** Frontend-Backend API szinkronizáció és duplikációk/blockerek felderítése

---

## 📊 BACKEND ↔ FRONTEND MAPPING TÁBLÁZAT

| Backend Endpoint | Method | Frontend Hook/Usage | Status | Notes |
|------------------|--------|---------------------|--------|-------|
| `/api/v1/auth/login` | GET | `useAuth.tsx` (redirect) | ✅ | Használt |
| `/api/v1/auth/callback` | GET | - | ⚠️ | Nincs közvetlen frontend hívás (OAuth flow) |
| `/api/v1/auth/status` | GET | `useAuth.tsx` | ✅ | Használt |
| `/api/v1/auth/logout` | POST | `useAuth.tsx` | ✅ | Használt |
| `/api/v1/auth/refresh-token` | POST | - | ⚠️ | **TODO**: Implementálni frontenden |
| `/api/v1/ai/models` | GET | `useModelList.ts` | ✅ | Használt |
| `/api/v1/macro/rates/all` | GET | `useMacroRates.ts` | ✅ | Használt |
| `/api/v1/macro/all` | GET | - | ❌ | **DEPRECATED** - Törölhető |
| `/api/v1/macro/curve/{source}` | GET | - | ❌ | **DEPRECATED** - Törölhető |
| `/api/v1/macro/bubor` | GET | `useBuborRates.ts` | ✅ | Használt |
| `/api/v1/macro/ecb/rates` | GET | `useECBRates.ts` | ✅ | Használt |
| `/api/v1/macro/ecb/yield-curve` | GET | `useECBYieldCurve.ts`, `useHistoricalYieldCurve.ts` | ✅ | Használt |
| `/api/v1/macro/ecb/historical-yield-curve` | GET | - | ⚠️ | **TODO**: Implementálni frontenden |
| `/api/v1/macro/ecb/monetary-policy` | GET | - | ⚠️ | **TODO**: Implementálni frontenden |
| `/api/v1/macro/ecb/fx` | GET | `useForexRates.ts` | ✅ | Használt |
| `/api/v1/macro/ecb/yield-curve/lite` | GET | - | ⚠️ | **TODO**: Implementálni frontenden |
| `/api/v1/macro/ecb/comprehensive` | GET | `useECBComprehensiveData.ts` | ✅ | Használt |
| `/api/v1/macro/ecb/monetary-aggregates` | GET | - | ⚠️ | **TODO**: Implementálni frontenden |
| `/api/v1/macro/ecb/inflation` | GET | - | ⚠️ | **TODO**: Implementálni frontenden |
| `/api/v1/macro/forex/pairs` | GET | - | ⚠️ | **TODO**: Implementálni frontenden |
| `/api/v1/macro/forex/{pair}` | GET | - | ⚠️ | **TODO**: Implementálni frontenden |
| `/api/v1/stock/premium/technical-analysis/{ticker}` | GET | - | ⚠️ | **TODO**: Implementálni frontenden |
| `/api/v1/stock/premium/technical-analysis/{ticker}/full` | GET | - | ⚠️ | **TODO**: Implementálni frontenden |
| `/api/v1/stock/premium/technical-analysis/quote/{ticker}` | GET | - | ⚠️ | **TODO**: Implementálni frontenden |
| `/api/v1/stock/premium/{ticker}/summary` | GET | `useAISummary.ts`, `useSummary.ts`, `useStockPageData.ts` | ✅ | Használt |
| `/api/v1/stock/ticker-tape` | GET | `useTickerTape.ts`, `useTickerTapeData.ts` | ✅ | Használt |
| `/api/v1/stock/ticker-tape/item` | GET | - | ⚠️ | **TODO**: Implementálni frontenden |
| `/api/v1/stock/{ticker}/news` | GET | `useNews.ts`, `useStockPageData.ts` | ✅ | Használt |
| `/api/v1/stock/search` | GET | `useSearchData.ts` | ✅ | Használt |
| `/api/v1/stock/{ticker}/fundamentals` | GET | `useFundamentals.ts`, `useStockData.ts`, `useStockPageData.ts` | ✅ | Használt |
| `/api/v1/stock/chat/finance` | POST | - | ⚠️ | **TODO**: Implementálni frontenden |
| `/api/v1/stock/chat/{ticker}` | POST | - | ⚠️ | **TODO**: Implementálni frontenden |
| `/api/v1/stock/chat/{ticker}/stream` | GET | `useChatStream.ts` | ✅ | Használt (EventSource) |
| `/api/v1/stock/{ticker}/chart` | GET | `useChartData.ts`, `useStockPageData.ts` | ✅ | Használt |
| `/api/v1/crypto/symbols` | GET | `useCryptoSymbols.ts` | ✅ | Használt |
| `/api/v1/crypto/{symbol}` | GET | `useCryptoRate.ts` | ✅ | Használt |
| `/api/v1/market/news` | GET | - | ⚠️ | **TODO**: Implementálni frontenden |
| `/api/v1/health` | GET | - | ⚠️ | **TODO**: Implementálni frontenden |
| `/metrics` | GET | - | ⚠️ | **TODO**: Implementálni frontenden |

---

## 🚨 KRITIKUS BLOCKEREK

### 1. **Duplicate/Zavaros Komponensek**
- `useStockData.ts` + `useStockPageData.ts` → **DUPLIKÁCIÓ** (mindkettő `/fundamentals` hívás)
- `useAISummary.ts` + `useSummary.ts` → **DUPLIKÁCIÓ** (mindkettő `/summary` hívás)
- `useTickerTape.ts` + `useTickerTapeData.ts` → **DUPLIKÁCIÓ** (mindkettő `/ticker-tape` hívás)

### 2. **Hiányzó Frontend Implementációk**
- **Chat endpointok**: `POST /stock/chat/{ticker}` és `POST /stock/chat/finance`
- **Technical Analysis**: Teljes `/premium/technical-analysis/*` endpoint-család
- **Forex**: `/macro/forex/pairs` és `/macro/forex/{pair}`
- **Health & Metrics**: `/health` és `/metrics`

### 3. **Felesleges Backend Endpointok**
- `/api/v1/macro/all` (deprecated)
- `/api/v1/macro/curve/{source}` (deprecated)

---

## 🎯 AKCIÓTERV (Rule #008 szerint)

### PHASE 1: Duplikáció-eltávolítás
1. **Törölni**: `useStockData.ts` → használd `useStockPageData.ts`
2. **Törölni**: `useAISummary.ts` → használd `useSummary.ts`
3. **Törölni**: `useTickerTape.ts` → használd `useTickerTapeData.ts`

### PHASE 2: Deprecated endpoint-eltávolítás
1. **Backend cleanup**: `/macro/all` és `/macro/curve/{source}` endpointok törlése

### PHASE 3: Frontend hiányosságok pótlása
1. **Chat System**: `POST /stock/chat/*` implementálása
2. **Technical Analysis**: `/premium/technical-analysis/*` hookjai
3. **Health Check**: `/health` monitoring hook

---

## 📋 KÖVETKEZŐ LÉPÉSEK

1. ✅ **Endpoint mapping** kész
2. 🔄 **Duplikáció-eltávolítás** (PHASE 1)
3. 🔄 **Deprecated cleanup** (PHASE 2)
4. 🔄 **Frontend implementáció** (PHASE 3)
5. 🔄 **CI gate validation** (lint + test + Lighthouse ≥ 90)

---

**Status:** ⚠️ **BLOCKER** - Duplikációk és hiányzó implementációk miatt további fejlesztés előtt cleanup szükséges.

---

*Generálva: ULTRATHINK v21 - Rule #008 compliance check*
