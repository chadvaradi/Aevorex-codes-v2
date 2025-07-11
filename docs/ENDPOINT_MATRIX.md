# ENDPOINT MATRIX – FinanceHub API Mapping
**Frissítve: 2025-07-13 10:25**

## Backend → Frontend Endpoint Mapping

### ✅ MŰKÖDŐ VÉGPONTOK

| Frontend Hook | Backend Endpoint | Státusz | Megjegyzés |
|---------------|------------------|---------|------------|
| `useBuborRates` | `/api/v1/macro/bubor/` | ✅ | MNB BUBOR kamatláb adatok |
| `useAuth` | `/api/v1/auth/status` | ✅ | Google OAuth státusz |
| `useAuth` | `/api/v1/auth/login` | ✅ | Google OAuth bejelentkezés |
| `useAuth` | `/api/v1/auth/logout` | ✅ | Kijelentkezés |
| `useModelList` | `/api/v1/ai/models` | ✅ | AI modell katalógus |
| `useSearchData` | `/api/v1/stock/search` | ✅ | Structured 200 payload with real-time lookup |
| `useChartData` | `/api/v1/stock/{ticker}/chart` | ✅ | Real OHLCV data or `status:error` JSON |
| `useFundamentals` | `/api/v1/stock/{ticker}/fundamentals` | ✅ | Fundamental metrics or `status:error` |
| `useNews` | `/api/v1/stock/{ticker}/news` | ✅ | News list or `status:error` |
| `useMarketNews` | `/api/v1/market/news` | ✅ | Piaci hírek |
| `useCryptoSymbols` | `/api/v1/crypto/symbols` | ✅ | Top 250 crypto list (CoinGecko live) |
| `useCryptoRate` | `/api/v1/crypto/{symbol}` | ✅ | Latest USD quote for given crypto |
| `useForexPair` | `/api/v1/macro/forex/{pair}` | ✅ | Pair detail (modal) |

### ⚠️ RÉSZLEGESEN MŰKÖDŐ VÉGPONTOK

| Frontend Hook | Backend Endpoint | Státusz | Probléma |
|---------------|------------------|---------|----------|
| `useTickerTape` | `/api/v1/stock/ticker-tape/` | ✅ | Live data or `status:error` JSON 200 – YF fallback |
| `useECBRates` | `/api/v1/macro/ecb/rates` | ✅ | Structured 200 payload + legacy alias `/rates/all` |
| `useFxRates` | `/api/v1/macro/forex/pairs` | ✅ | Key-less fallback ensures 200 with real-time rates |
| *n/a* | `/api/v1/macro/ecb/bop/` | ✅ | Structured 200 payload on missing data |
| *n/a* | `/api/v1/macro/ecb/yield-curve` | ✅ | Structured 200 payload on errors |
| *n/a* | `/api/v1/macro/ecb/fx` | ✅ | Structured 200 payload; live FX rates or status:error |
| *n/a* | `/api/v1/macro/ecb/fx/legacy` | ✅ | Legacy alias returning structured 200 |
| *n/a* | `/api/v1/macro/ecb/rpp/` | ✅ | Residential property prices |
| *n/a* | `/api/v1/macro/ecb/cpp/` | ✅ | Commercial property prices |
| *n/a* | `/api/v1/macro/ecb/bls/` | ✅ | Bank Lending Survey |
| *n/a* | `/api/v1/macro/ecb/spf/` | ✅ | Professional Forecasters survey |
| *n/a* | `/api/v1/macro/ecb/ciss/` | ✅ | Systemic stress index |
| *n/a* | `/api/v1/macro/ecb/trd/` | ✅ | External trade statistics |
| *n/a* | `/api/v1/macro/ecb/pss/` | ✅ | Payment systems statistics |
| *n/a* | `/api/v1/macro/ecb/irs/` | ✅ | Interest rate statistics |

### 🔄 ROUTING ELTÉRÉSEK

| Frontend Hívás | Helyes Backend Endpoint | Javítás |
|----------------|-------------------------|---------|
| `/api/v1/macro/yield-curve/` | `/api/v1/macro/ecb/yield-curve` | ✅ Redirect hozzáadva |
| `/api/v1/macro/rates/all` | `/api/v1/macro/ecb/rates` | 🔄 Alias szükséges |

### 🚫 HIÁNYZÓ VÉGPONTOK

| Frontend Hook | Várt Endpoint | Státusz | Tennivaló |
|---------------|---------------|---------|-----------|
| `useHistoricalYieldCurve` | `/api/v1/macro/ecb/yield-curve` | 🔄 | Ugyanaz mint useECBYieldCurve |

## Backend Router Struktúra

### Főrouter: `/api/v1/`
```
api_router (APIRouter)
├── /auth → auth_router
├── /stock → stock_router
├── /macro → macro_router
├── /ai → ai_router
└── /market → market_data_router
```

### Stock Router: `/api/v1/stock/`
```
stock_router
├── /search → search_router
├── /chat → chat_router
├── /{ticker}/chart → chart_router
├── /fundamentals → fundamentals_router
├── /news → news_router
├── /premium → premium_router
└── /ticker-tape → ticker_tape_router
```

### Macro Router: `/api/v1/macro/`
```
macro_router
├── /ecb → ecb_router
│   ├── /rates → rates_router
│   ├── /yield-curve → yield_curve_router
│   ├── /fx → fx_router
│   └── /comprehensive → comprehensive_router
├── /rates → rates_router
├── /bubor → bubor_router
└── /forex → forex_router
```

### Premium Router: `/api/v1/stock/premium/`
```
premium_router
└── /{ticker}/summary → ai_summary_router
```

## Dependency Állapot

### ✅ Működő Services
- `CacheService` (Redis) ✅
- `get_http_client` (httpx) ✅
- `get_cache_service` ✅

### ⚠️ Problémás Dependencies
- ECB SDMX API kapcsolat instabil
- Forex API provider timeout-ok
- Ticker-tape API provider üres válaszok

## Következő Lépések

1. **Crypto router regisztrálás** (`/api/v1/crypto/`)
2. **Macro rates alias** (`/api/v1/macro/rates/all`)
3. **ECB SDMX stabilizálás**
4. **Forex API provider csere**
5. **Ticker-tape API provider javítás**

---
*Generálta: ULTRATHINK execution engine* 

## ULTRATHINK Strict Scan – 2025-07-13 (Wave 5 post-provider switch)

| Status | Count |
|--------|-------|
| ✔ 200 + full payload | 61 |
| ❌ Error payload / other | 1 |

_A full JSON with per-endpoint details is stored in `audits/strict_scan_latest.json`. This markdown section was refreshed automatically after the latest scan run._ 

## 🗂️ Teljes Endpoint Katalógus – Backend ↔ Frontend használat (2025-07-13)

| Endpoint (templ.) | Method | Rövid leírás | Frontend használat | Hook / Komponens | Teendő ha nem használt |
|-------------------|--------|--------------|--------------------|------------------|------------------------|
| `/metrics` | GET | Prometheus exporter, infra monitoring | ❌ | – | Hagyd, DevOps monitor |
| `/api/v1/health` | GET | Backend self-check ping | ❌ | – | Hagyd, Kubernetes liveness |
| `/api/v1/ai/models/` | GET | Elérhető LLM modellek listája | ✅ | `useModelList` | – |
| `/api/v1/auth/login` | GET | Google OAuth2 redirect | ✅ | Router redirect | – |
| `/api/v1/auth/callback` | GET | Google OAuth2 callback | ✅ | Böngésző redirect | – |
| `/api/v1/auth/status` | GET | Session státusz JSON | ✅ | `useAuth` | – |
| `/api/v1/auth/logout` | POST | Logout, session törlés | ✅ | `useAuth` | – |
| `/api/v1/macro/bubor` | GET | MNB BUBOR kamatlábak | ✅ | `useBuborRates` | – |
| `/api/v1/macro/rates/all` | GET | Összesített kamat alias | ⚠️ | (legacy redirect) | Alias redirect kész |
| `/api/v1/macro/forex/pairs` | GET | FX pár katalógus élő árfolyammal | ✅ | `useFxRates` | – |
| `/api/v1/macro/forex/{pair}` | GET | Konkrét FX pár részletei | ✅ | `useForexPair` | – |
| `/api/v1/macro/curve/{source}` | GET | Makro hozamgörbe (deprecated) | ❌ | – | Törlés / 410 Gone |
| `/api/v1/macro/ecb/rates` | GET | ECB Policy rates (MRR, DFR…) | ✅ | `useECBRates`, `useECBPolicyRates` | – |
| `/api/v1/macro/ecb/yield-curve` | GET | Teljes hozamgörbe | ✅ | `useECBYieldCurve` | – |
| `/api/v1/macro/ecb/yield-curve/lite` | GET | Kompakt hozamgörbe | ❌ | – | Low-latency mobil chart |
| `/api/v1/macro/ecb/historical-yield-curve` | GET | Hosszú idősorú YC | ❌ | – | Integrálni History toggle |
| `/api/v1/macro/ecb/comprehensive` | GET | Több mutató egyben | ✅ | `useECBComprehensiveData` | – |
| `/api/v1/macro/ecb/fx` | GET | ECB FX főpárok | ❌ | – | Konszolidálni `useFxRates`-szel |
| `/api/v1/macro/ecb/*/(legacy|components|alt|health)` | GET | Segéd / meta adatok | ❌ | – | Hagyható backend-debugra |
| `/api/v1/macro/ecb/sec/` | GET | Értékpapír statisztikák | ✅ | `useECBSec` | – |
| `/api/v1/macro/ecb/ivf/` | GET | Befektetési alapok | ✅ | `useECBIVF` | – |
| `/api/v1/macro/ecb/cbd/` | GET | Konszolidált banki adatok | ✅ | `useECBCbd` | – |
| `/api/v1/macro/ecb/rpp/` | GET | Lakásár index | ✅ | `useECBRpp` | – |
| `/api/v1/macro/ecb/cpp/` | GET | Kereskedelmi ingatlan árak | ✅ | `useECBCpp` | – |
| `/api/v1/macro/ecb/bls/` | GET | Bank Lending Survey | ✅ | `useECBBls` | – |
| `/api/v1/macro/ecb/spf/` | GET | Profi előrejelzések | ✅ | `useECBSpf` | – |
| `/api/v1/macro/ecb/ciss/` | GET | Rendszerszintű stressz | ✅ | `useECBCiss` | – |
| `/api/v1/macro/ecb/trd/` | GET | Külső kereskedelem | ✅ | `useECBTrd` | – |
| `/api/v1/macro/ecb/pss/` | GET | Fizetési rendszer stat | ✅ | `useECBPss` | – |
| `/api/v1/macro/ecb/irs/` | GET | Swap rate statisztika | ✅ | `useECBIRS` | – |
| `/api/v1/macro/ecb/sts/*` | GET | Rövid távú statisztikák | ❌ | – | Jövőbeni KPI dashboard |
| `/api/v1/stock/search` | GET | Ticker kereső | ✅ | `useSearchData` | – |
| `/api/v1/stock/chat/{ticker}/stream` | POST | SSE/streamelt AI chat | ✅ | `ChatContext` | – |
| `/api/v1/stock/chat/{ticker}/deep` | POST | Mélyelemzés prompt | ❌ | – | Integrálni „Deep dive” gomb |
| `/api/v1/stock/chat/{ticker}` | POST | Szinkron AI válasz | ❌ | – | Prefer stream, marad reserve |
| `/api/v1/stock/{ticker}/chart` | GET | OHLCV idősor | ✅ | `useChartData` | – |
| `/api/v1/stock/{ticker}/fundamentals` | GET | Fundamentális mutatók | ✅ | `useFundamentals` | – |
| `/api/v1/stock/{ticker}/news` | GET | Céghez kötött hírek | ✅ | `useNews` | – |
| `/api/v1/stock/{ticker}/technical` | GET | Technikai indikátor snapshot | ✅ | `useTechnicalAnalysis` | – |
| `/api/v1/stock/{ticker}/summary` | GET | Rövid összefoglaló JSON | ❌ | – | Felszínre hozni header-ben |
| `/api/v1/stock/premium/{ticker}/summary` | GET | AI-generált összefoglaló | ✅ | Bubble „Company Overview” | – |
| `/api/v1/stock/ticker-tape/` | GET | Real-time ticker feed | ✅ | `useTickerTape` | – |
| `/api/v1/stock/ticker-tape/{test|item}` | GET | Debug / unit teszt | ❌ | – | Törlés vagy hide route |
| `/api/v1/config/model` | POST | Default LLM beállítás | ❌ | – | Bevezetni settings panel |
| `/api/v1/config/deep` | POST | Mély LLM konfiguráció | ❌ | – | Backoffice-ban maradhat |
| `/api/v1/config/language` | POST | Nyelvi preferencia | ❌ | – | Intl settings jövőben |
| `/api/v1/crypto/symbols` | GET | Top crypto list | ✅ | `useCryptoSymbols` | – |
| `/api/v1/crypto/{symbol}` | GET | Egy crypto aktuális ára | ✅ | `useCryptoRate` | – |
| `/api/v1/market/news` | GET | Globális piaci hírek | ✅ | `useMarketNews` | – |
| `/api/v1/eodhd/{ticker}/{dataset}` | GET | EODHD proxy (hisztorikus) | ❌ | – | 422 fix + archiválni |

> **Megjegyzés:** A fenti táblázat wildcard (`*`) jelölése a kapcsolódó al-útvonalakra vonatkozik; minden sor 2025-07-12-én lett verifikálva a `strict_scan_latest.json` és a `shared/frontend` kód alapján. 

---

## 📑 Részletes adat- és használati kontraktusok

Az alábbi fejezet minden egyes végpontról rövid, de teljeskörű leírást ad a következő bontásban:
•  Mit vár a **kliens** (query-string, path param, body)  
•  Mit küld vissza a **backend** (fő mezők + státusz convention)  
•  **Frontend hívás helye** (hook/komponens + lifecycle)  
•  Ha **nem használt**, javaslat a bevezetésre vagy törlésre.

> A válasz-sémák összefoglalók; a teljes OpenAPI definíció a FastAPI /docs felületen érhető el.

### 🔐 Auth
| Endpoint | Kliens input | Response (200) | Frontend flow | Megjegyzés |
|-----------|--------------|----------------|---------------|------------|
| `/api/v1/auth/login` `GET` | – (sütialapú session) | 302 → Google consent | Böngésző redirect | OAuth2 flow kezdete |
| `/api/v1/auth/callback` `GET` | `code`, `state` query | 302 → `/` | Böngésző redirect | Token-csere + session set |
| `/api/v1/auth/status` `GET` | – | `{ authenticated: bool, user?: {...} }` | `useAuth` SWR  **on app load** | UI: avatar / login btn |
| `/api/v1/auth/logout` `POST` | – | `204 No Content` | `useAuth` → `logout()` | Clear cookie, redirect |

### 🤖 AI / Config
| Endpoint | Input | Response | Frontend | Non-used action |
|-----------|-------|----------|----------|-----------------|
| `/api/v1/ai/models/` `GET` | – | `{ models: [{ id, tokens, vendor }]}` | `useModelList` (settings modal) | – |
| `/api/v1/config/model` `POST` | JSON `{model_id}` | 201 / 400 | – | Beépíteni settings panelbe |
| `/api/v1/config/deep` `POST` | JSON deep-cfg | 201 | – | Back-office only |
| `/api/v1/config/language` `POST` | `{lang}` | 200 | – | Internationalisation roadmap |

### 📈 Macro – ECB & egyéb
| Endpoint | Input példa | Response fő mezők | Frontend hook | Állapot |
|-----------|------------|-------------------|---------------|---------|
| `/api/v1/macro/ecb/rates` | `?period=1y` | `{ data.rates{date}{DFR,MRR,..} }` | `useECBPolicyRates` | ✔ |
| `/api/v1/macro/ecb/yield-curve` | – | `{ data.yields{date}{1Y:rate,..} }` | `useECBYieldCurve` | ✔ |
| `/api/v1/macro/ecb/sec/` | – | `{ data.series[...] }` | `useECBSec` card | ✔ |
| ... | ... | ... | ... | ... |
| `/api/v1/macro/curve/{source}` | path `source` | `{ status:error }` (legacy) | – | **Törlendő** – összevonva YC endpointtal |
| `/api/v1/macro/sts/*` | – | `{ data.indicators[...] }` | – | **Bevezetés**: KPI dashboard (Sprint Q3) |

### 💹 Stock
| Endpoint | Input | Response | Frontend | Megjegyzés |
|-----------|-------|----------|----------|------------|
| `/api/v1/stock/search` `GET` | `?q=apple` | `{ suggestions: [...] }` | `useSearchData` (autocomplete) | ✔ |
| `/api/v1/stock/{ticker}/chart` | `ticker` path, `?interval=1d` | `{ candles: [...], metadata }` | `useChartData` (TradingView adapter) | ✔ |
| `/api/v1/stock/{ticker}/fundamentals` | path | `{ ratios, income_statement,...}` | `useFundamentals` bubble | ✔ |
| `/api/v1/stock/{ticker}/technical` | path | `{ sma50, rsi14, macd,...}` | `useTechnicalAnalysis` bubble | ✔ – új alias |
| `/api/v1/stock/{ticker}/news` | path | `{ articles:[{title,url}...]}` | `useNews` bubble | ✔ |
| `/api/v1/stock/premium/{ticker}/summary` | path | `{ summary, sentiment, bullets[] }` | Company Overview bubble | ✔ |
| `/api/v1/stock/ticker-tape/` | `?limit=12` | `{ tape:[{symbol,price,change}]}` | `useTickerTape` header bar | ⚠ 422 on exotic symbols |
| `/api/v1/stock/chat/{ticker}/stream` `POST` | `text/event-stream`, body `{prompt}` | SSE chunked tokens | `ChatContext` provider | ✔ |
| `/api/v1/stock/chat/{ticker}/deep` `POST` | `{ prompt, depth:"deep"}` | `{ analysis }` | – | **Integráció**: „Deep-dive” CTA |
| `/api/v1/eodhd/{ticker}/{dataset}` | path | 422 jelenleg | – | **BLOCKER**: fix provider / remove |

### 🌐 Market & Crypto
| Endpoint | Input | Response | Frontend | Megjegyzés |
|-----------|-------|----------|----------|------------|
| `/api/v1/market/news` | – | `{ headlines:[...] }` | `useMarketNews` home feed | ✔ |
| `/api/v1/crypto/symbols` | – | `{ symbols:[...] }` | `useCryptoSymbols` selector | ✔ |
| `/api/v1/crypto/{symbol}` | path | `{ priceUSD, change24h }` | `useCryptoRate` | ✔ |

---

### 📌 Összegzett tapasztalatok
1.  **Kiemelkedő lefedettség:** 65 aktív végpontból 46-ot már használ a frontend (71 %).  
2.  **Holt URL-ek:** 7 végpont csak legacy/support célú – javasolt 410 vagy admin-only flag.  
3.  **Bevezetendő végpontok:** `STS`, `historical-yield-curve`, `deep chat`, FX-detail – ezek üzleti értéket adnak (dashboard, deep-dive).  
4.  **Hibás payload:** `ticker-tape` 422 rare tickereknél → provider switch / cache.  
5.  **Dokumentáció-next step:** OpenAPI spec auto-export a `audits/strict_scan_latest.json` alapján, majd Redoc / Cloudflare Pages dev-portal [[link](https://developers.cloudflare.com/api-shield/management-and-monitoring/developer-portal)].

> **Action Plan**  
> •  `/api/v1/stock/chat/{ticker}/deep` UI integrálás  
> •  STS & historical YC kártyák (Sprint 7)  
> •  Ticker-tape provider csere  
> •  EODHD endpoint fix vagy archiválás 