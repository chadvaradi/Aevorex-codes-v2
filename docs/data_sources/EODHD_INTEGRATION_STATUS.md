# EODHD – FinanceHub Backend Integrációs Státusz
*(készítette: **o3 model**, 2025-07-09)*

| Funkció / Dataset | Rövid leírás | Backend implementáció helye | Státusz |
|-------------------|--------------|-----------------------------|---------|
| **Stocks / ETF / Funds – End-Of-Day** | Napi záróár, HLOC, split, dividend, korrekciók | `core/fetchers/eodhd/eod_client.py`, `api/endpoints/stock_endpoints/chart` | **✅ bevezetve** |
| **Stocks – Live (15 perc késleltetés)** | Valós idejű ár *delayed* feed 60+ tőzsdéről | wrapper → `core/fetchers/eodhd/eod_client.py` (`get_live_quote`) | **🚧 folyamatban** (sandbox kulcs teszt) |
| **Splits & Dividends** | Teljes corporate action feed | `core/services/stock/dividends_service.py` | **✅ bevezetve** |
| **Adjusted Data** | Split-/dividend-korrekciós OHLCV | része az EOD pipeline-nak | **✅ bevezetve** |
| **Delisted Data** | Történeti EOD delistelt papírokra | – | **⏳ backlog** |
| **Forex – End-Of-Day** | USD/EUR stb. | `core/fetchers/eodhd/forex_client.py` | **✅ bevezetve** |
| **Forex – Live (1 perc delay)** | Major/minor párok | ugyanott (`get_live_fx`) | **🚧 folyamatban** |
| **Cryptocurrency – End-Of-Day** | BTC, ETH, … | `core/fetchers/eodhd/crypto_client.py` | **✅ bevezetve** |
| **Cryptocurrency – Live (1 perc delay)** | BTC, ETH, … real-time | `crypto_client.get_live_quote` | **🚧 folyamatban** |
| **Real-Time Websocket API** | Tick szintű feed (US stocks, FX, Crypto) | – | **⏳ backlog** |
| **Intraday API** | 1/5/15 min OHLCV | `core/services/stock/intraday_service.py` | **🚧 folyamatban** |
| **US Ticks API** | Tick-szintű US market adatok | – | **⏳ backlog** |
| **Search API** | Ticker / cégnév kereső | `api/endpoints/stock_endpoints/search` | **✅ bevezetve** |
| **Technical API** | TA-mutatók (SMA, RSI…) | `core/indicator_service/` | **✅ bevezetve** |
| **Screener API** | Fundamentális / technikai szűrők | – | **⏳ backlog** |
| **Exchanges meta-adat** | Tőzsdelista, keresk. órák | `core/fetchers/eodhd/exchanges_client.py` | **🚧 folyamatban** |
| **Simultaneous tickers limit** | 20+ párhuzamos kérés engedélyezett | HTTP-pool + async semaphore | **✅ bevezetve** |

> **Legenda**  
> ✅ bevezetve – teljesen működik, 200 OK payload  
> 🚧 folyamatban – alap fetcher megvan, auth/kvóta/fallback tesztelés alatt  
> ⏳ backlog – nincs még kód, tervezett sprint T+1 vagy később

---
**API-kulcs kezelés**  – `config/_core.py:EODHD_API_KEY` env-változóban.  
Rate limit: 1000 call/nap (starter) → cache TTL 300s.

---
Utolsó frissítés: 2025-07-09 