# Quant modul – technikai terv (FinanceHub)

Röviden: igen, érdemes – de modulárisan, adatforrás- és LLM‑kompatibilisen, fokozatos rollouttal.

## Javasolt architektúra (backend, FastAPI)
- Modul: `quant/`
  - `factors/`: standardizált faktorok (value, momentum, quality, volatility, size), rolling window-ök, z-score normalizálás
  - `signals/`: szignál-kombinátorok (ensemble, voting), pozíció-szabályok, kockázati limitenkénti skálázás
  - `risk/`: idősoros kockázat (vol, drawdown, CVaR), expozíciók, faktorbeták
  - `backtest/`: eseményvezérelt és bar-by-bar visszateszt, tranzakciós költség modellek, benchmark összevetés
  - `optimizer/`: súly-optimalizáció (risk-parity, mean-variance – opcionális), portfólió-korlátok
  - `pipeline/`: adat-előkészítés (OHLCV, corporate actions, fundamentumok), feature-store kompatibilis cache-elés
  - `llm/bridge/`: prompt-összeállító a kvant metrikákból, SSE streamelt „AI insights”

- Adatforrások: meglévőkből (EODHD, ECB, FMP) – NINCS mock. A `CacheService`-t és a `StockOrchestrator`-t reuse.

- Endpontok (RBAC/plan‑gating később):
  - GET `/api/v1/quant/factors/{ticker}`
  - GET `/api/v1/quant/signals/{ticker}`
  - POST `/api/v1/quant/backtest` (paraméterezhető stratégiák)
  - GET `/api/v1/quant/insights/{ticker}/stream` (SSE: LLM‑magyarázat, trade‑rationale)

- LLM-integráció:
  - Preprocess pipeline: min length / relevancia, query_type (indicator/summary/hybrid)
  - Prompt template‑ek a kvant metrikákkal (drawdown, hit rate, SR, turnover), SSE token‑stream

- Teljesítmény:
  - Numpy/pandas alap (pandas‑ta opcionális extra), vektoros számítás, cache TTL-ek
  - Hosszabb backtest async task (Cloud Run job / PubSub trigger), rövid faktor/szignál sync

- UX/Frontend (később):
  - „Quant Insights” bubble (structured), „Strategy Backtest” kártya, SSE overlay az elemző rács alatt
  - Plan‑gating egységes (403 → „Upgrade required”)

## Bevezetési lépések (kockázat-minimalizálás)
- M0: interfészek és Pydantic modellek (FactorResponse, SignalResponse, BacktestRequest/Response)
- M1: factors + signals 2‑3 alapfaktorral, 1‑2 szignál (pl. momentum+vol filter) – cache‑elt
- M2: backtest bar-by-bar baseline + metrikák (CAGR, vol, maxDD, SR)
- M3: LLM‑bridge (SSE) a kvant metrikákból generált magyarázattal
- M4: optimizer (risk‑parity), plan‑gating és kvóták

## Ajánlott „quant stack” integrációra
(FastAPI/Cloud Run kompatibilis, LLM‑hídhoz jól illeszthető.)

- Vectorbt: vektoros backtest/indikátor motor, nagyon gyors (NumPy/numba), egyszerűen építhető be faktor/szignál pipeline‑ba.
- Backtesting.py: könnyű, event‑driven visszateszt (megbízások, stop/TP, slippage) – gyors baseline a vektoros számítás mellé.
- PyPortfolioOpt + CVXPY: portfólió‑súly optimalizálás (risk‑parity, mean‑variance, korlátok) és kockázati büdzsé kezelése.
- Mlfinlab (válogatott modulok): feature labeling, meta‑labeling, fractional differentiation – faktorminőség és „alpha durability” elemzéshez.
- Statsmodels (+ Empyrical/Riskfolio‑lib): idősoros tesztek (ADF), teljesítmény‑ és kockázati metrikák (SR, maxDD, hit rate, VaR/CVaR).
- Pandas‑ta (vagy „ta”): technikai indikátorok tisztán Pythonban (build‑barát, nincs natív könyvtár igény).
- QuantLib: kötvény/derivatíva, hozamgörbék, árazás – ha a FI/deriv modul mélyebb (ECB/MNB görbékhez ideális).
- Polars (opcionális): nagy adatmennyiségnél gyorsabb dataframe motor – batch faktor számításokra.
- ib‑insync / Alpaca (később): bróker‑/számla‑csatlakozás éles végrehajtáshoz (nem szükséges a kutatási fázisban).
- Feast (opcionális): feature‑store, ha a faktorok/feature‑k újrahasznosítása skálázódik (BigQuery‑vel jól illeszkedik GCP‑n).

## Gyakorlati induló csomag (Phase 1)
- Vectorbt + Pandas‑ta + Statsmodels + PyPortfolioOpt.  
- Ezekkel megvan: faktor/szignál számítás, gyors vektoros backtest, alap kockázat/optimalizálás.  
- Phase 2: Mlfinlab (labeling/meta‑labeling) + CVXPY korlátos optimalizáció.  
- Phase 3: QuantLib (FI/deriv), bróker integráció (ib‑insync).

## Fontos
- Új fájlok létrehozásához engedély kell. Ha rábólintás van, elkészítendő a pontos mappa‑ és API‑váz minimális dependenciákkal (numpy, pandas; pandas‑ta mint extra), és összedrótozva a meglévő cache/orchestrator réteggel.
- #008 szabály szerint indulunk: teljes repo‑szkennelés, docs‑szinkron, adat-paritás ellenőrzés, majd fokozatos integráció.
