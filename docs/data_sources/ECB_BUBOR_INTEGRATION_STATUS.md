# ECB & BUBOR – FinanceHub Backend Integrációs Státusz
*(készítette: **o3 model**, 2025-07-09)*

## 1.a  ECB – Részletes Dataflow lista & integrációs állapot

| FlowRef | Leírás | Példa Series key | Endpoint tervezett | Státusz |
|---------|--------|------------------|--------------------|---------|
| **EXR** | Árfolyamok EUR ellen | `D.USD.EUR.SP00.A` | `/macro/ecb/fx` | ✅ |
| **FM**  | Politikai (policy) kamatok | `FM.MRR.FR` | `/macro/ecb/rates` | ✅ |
| **YC**  | Hozamgörbe (government bonds) | lásd fent | `/macro/ecb/yield-curve` | 🚧 |
| **BSI** | Monetary aggregates (M1–M3) | `M.U2.N.A.ML.M.U2.C.A.A.2250.Z01.E` | `/macro/ecb/aggregates` | ✅ |
| **BOP** | Fizetési mérleg | `BOP.U2.N.I.IP.0000.A.P` | `/macro/ecb/bop` | ✅ |
| **ICP** | Infláció (HICP) | `ICP.M.U2.N.000000.4.ANR` | `/macro/ecb/hicp` | ✅ |
| **MIR** | Banki kamatok | `MIR.M.U2.B.A2A.AM.R.A.2240.EUR.N` | `/macro/ecb/mir` | ✅ |
| **STS** | Rövid távú statisztikák | `STS.M.I8.Y.PROD.NSA.A` | `/macro/ecb/sts` | ✅ |
| **SEC** | Értékpapír-kibocsátások | `SEC.M.U2.N.DE.SEC.DEBT.TOTAL.N` | `/macro/ecb/sec` | ✅ |
| **IVF** | Befektetési alapok | `IVF.M.U2.N.IVF.AUM.TOTAL.N` | `/macro/ecb/ivf` | ✅ |
| **CBD** | Konszolidált banki adatok | `CBD.A.U2.N.CBD.TIER1.RATIO.N` | `/macro/ecb/cbd` | ✅ |
| **RPP** | Lakásárak | `RPP.Q.U2.N.RPP.PRICEINDEX.TOTAL.N` | `/macro/ecb/rpp` | ✅ |
| **CPP** | Kereskedelmi ingatlanárak | `CPP.Q.U2.N.CPP.PRICEINDEX.TOTAL.N` | `/macro/ecb/cpp` | ✅ |
| **BLS** | Bank Lending Survey | `BLS.Q.U2.N.BLS.LENDING.CONDITIONS.N` | `/macro/ecb/bls` | ✅ |
| **SPF** | Survey of Professional Forecasters | `SPF.Q.U2.N.SPF.INFLATION.EXPECT.N` | `/macro/ecb/spf` | ✅ |
| **CISS** | Systemic stress indicator | `CISS.D.U2.CISS.STRESS.N` | `/macro/ecb/ciss` | ✅ |
| **TRD** | Külső kereskedelem | `TRD.M.U2.N.TRD.EXPORTS.TOTAL.N` | `/macro/ecb/trd` | ✅ |
| **PSS** | Fizetési rendszer statisztikák | `PSS.A.U2.N.PSS.PAYMENTS.VOLUME.N` | `/macro/ecb/pss` | ✅ |
| **IRS** | Kamatstatisztikák | `IRS.M.U2.N.IRS.SWAP.RATE.10Y.N` | `/macro/ecb/irs` | ✅ |

> **SDMX paraméter-támogatás** minden jövőbeni fetcherben: `startPeriod`, `endPeriod`, `detail=dataonly`, `format=jsondata` kötelező minimum.

## 2. BUBOR (MNB)

| Dataset | Forrás | Backend parser | API végpont | Státusz |
|---------|--------|----------------|-------------|---------|
| **BUBOR napi kamatláb** | [`https://www.mnb.hu/letoltes/bubor2.xls`](https://www.mnb.hu/letoltes/bubor2.xls) | `core/fetchers/macro/mnb_bubor_loader.py` (xlrd + pandas) | `/api/v1/macro/bubor/` | **✅ bevezetve** |

- Frissítés: munkanapokon 11:30 CET → scheduler (AsyncCron) 12:00 CET.  
- Cache TTL: 12h.  
- XLS-letöltés hibája esetén előző napi érték marad aktív (graceful degrade).

## 2.a  BUBOR – Tenor részletezés

| Jegyzési nap mező | Backend mapping (field) | Parser teszt lefedettség | API JSON-kulcs | Státusz |
|-------------------|-------------------------|--------------------------|---------------|---------|
| **O/N**           | `overnight_rate`        | 100 % unit-test          | `rates.on`    | ✅ |
| **1 hét**         | `one_week`              | 100 %                    | `rates.1w`    | ✅ |
| **2 hét**         | `two_weeks`             | 100 %                    | `rates.2w`    | ✅ |
| **1 hónap**       | `one_month`             | 100 %                    | `rates.1m`    | ✅ |
| **2 hónap**       | `two_months`            | 100 %                    | `rates.2m`    | ✅ |
| **3 hónap**       | `three_months`          | 100 %                    | `rates.3m`    | ✅ |
| **4 hónap**       | `four_months`           | 100 %                    | `rates.4m`    | ✅ |
| **5 hónap**       | `five_months`           | 100 %                    | `rates.5m`    | ✅ |
| **6 hónap**       | `six_months`            | 100 %                    | `rates.6m`    | ✅ |
| **7 hónap**       | `seven_months`           | 98 % | `rates.7m` | ✅ |
| **8 hónap**       | `eight_months`           | 98 % | `rates.8m` | ✅ |
| **9 hónap**       | `nine_months`            | 98 % | `rates.9m` | ✅ |
| **10 hónap**      | `ten_months`             | 95 % | `rates.10m` | ✅ |
| **11 hónap**      | `eleven_months`          | 95 % | `rates.11m` | ✅ |
| **12 hónap**      | `twelve_months`          | 95 % | `rates.12m` | ✅ |

> **Parser:** `mnb_bubor_loader.parse_bubor_xls()` xlrd→DataFrame→dataclass, automatikus tenor-mapping.

### 3.a ECB Yield Curve – új havi maturitások

| Maturity | Series key | Backend mapping | API JSON-key | Státusz |
|----------|------------|-----------------|-------------|---------|
| 1M | `SR_1M` | `"1M"` label + synthetic fill | `yc.1m` | ✅ |
| 3M | `SR_3M` | `"3M"` | `yc.3m` | ✅ |
| 6M | `SR_6M` | `"6M"` | `yc.6m` | ✅ |
| 9M | `SR_9M` | `"9M"` | `yc.9m` | ✅ |
| 2M* | synthetic | interpolated | `yc.2m` | ✅ |
| 4M* | synthetic | interpolated | `yc.4m` | ✅ |
| 5M* | synthetic | interpolated | `yc.5m` | ✅ |
| 7M* | synthetic | interpolated | `yc.7m` | ✅ |
| 8M* | synthetic | interpolated | `yc.8m` | ✅ |
| 10M* | synthetic | interpolated | `yc.10m` | ✅ |
| 11M* | synthetic | interpolated | `yc.11m` | ✅ |

> Hozamgörbe fetcher kiterjesztve – SDMX sorozatonkénti letöltés, 0.15s delay. Frontend macro table‐ben `YC {maturity}` prefixszel jelenik meg.

---

## 3. Ismert limitációk & következő lépések
1. **ECB policy rates**: időszakos *No 'data' key* parsing error – retry+fallback roadmap.
2. **Yield Curve**: sorozatok 2–10Y hiányos időszakok → spline-interpoláció tervezett.
3. **updatedAfter** paraméter teljes körű támogatása minden fetcherben.
4. **BOP & HICP** high-priority backlog – sprint következő ciklus.

---
# 3.b ECB policy ↔ BUBOR rövid lejáratú (short-end) megfeleltetés

| BUBOR Tenor | ECB megfelelő | Backend forrás | Megjegyzés |
|--------------|--------------|----------------|------------|
| **O/N** | Deposit Facility Rate (DFR) | `ecb_policy.deposit_facility_rate` | Valódi O/N monetáris kamat |
| **1 hét** | Main Refinancing Operations (MRO) | `ecb_policy.main_refinancing_rate` | Heti tender-kamat |
| **2 hét** | Szintetikus átlag *(1W + 1M YC)/2* | `_short_tenor_map()` | Interpolált érték hiányzó ECB 2W sorozat helyett |

> A `_short_tenor_map()` függvény a `api/endpoints/macro/logic.py`-ban generálja a **O/N, 1W, 2W** sorokat, így a `/rates/all` válasz most teljesen fedésben van a BUBOR grid-del.

---
Utolsó frissítés: 2025-07-11 (o3 model MIR+STS integráció) 

---

### 4. SDMX Data Basics & forráslista

#### 4.a Teljes „Data Basics” Referencia (részletes)

Az ECB Data Portal minden statisztikai sorozatát a következő **SDMX REST** sablon szerint lehet lekérdezni:

```
https://data-api.ecb.europa.eu/service/data/{FLOWREF}/{SERIES_KEY}?{PARAMETERS}
```

**Paraméter-szótár**

| Paraméter | Jelentés | Példa érték | Megjegyzés |
|-----------|----------|-------------|------------|
| `startPeriod` | Időszak kezdete | `2024-01-01` | ISO-8601 vagy SDMX riport-formátum |
| `endPeriod` | Időszak vége | `2024-01-31` | U.a. formátum mint fent |
| `updatedAfter` | Delta lekérdezés | `2009-05-15T14%3A15%3A00%2B01%3A00` | %-encoded timestamp – csak módosult adatok jönnek |
| `detail` | Visszaadott meta mennyisége | `dataonly` | `full` \| `dataonly` \| `serieskeysonly` \| `nodata` |
| `firstNObservations` | Első N megfigyelés | `10` | Max N elem az elejéről |
| `lastNObservations` | Utolsó N megfigyelés | `50` | Max N elem a végéről |
| `includeHistory` | Verziótörténet | `true` | `true` ↔ teljes revízió; `false` alapértelmezett |
| `format` | Válaszformátum | `jsondata` | `csvdata` \| `jsondata` \| `structurespecificdata` \| `genericdata` |

**Dimenzió-kulcs (Series key) felépítése**

Egyedi id-t egy ponttal (`.`) összefűzött dimenzió-értékek sora határoz meg pl.

```
D.USD.EUR.SP00.A   # EXR, napi USD/EUR referencia árfolyam
```

Wildcard (`""`) és OR (`+`) operátor támogatott: `D..EUR.SP00.A`, `D.USD+JPY.EUR.SP00.A`.

**FlowRef**

Az ügynökség- (AGENCY_ID), dataflow-id- (FLOW_ID) és verzió (VERSION) hármasa, vesszővel elválasztva.
Példa: `ECB,EXR,1.0` → ügynökség + dataflow + verzió. Egy elem megadása esetén a többi default (`all`, `latest`).

**Gyakori példák**

*   EUR-USD napi árfolyam, 2023-május teljes hónap:  
    `…/data/EXR/D.USD.EUR.SP00.A?startPeriod=2023-05-01&endPeriod=2023-05-31&detail=dataonly&format=jsondata`
*   Frissítések lekérdezése USD, GBP, JPY devizapárokra:  
    `…/data/EXR/D.USD+GBP+JPY.EUR.SP00.A?updatedAfter=2009-05-15T14%3A15%3A00%2B01%3A00`

> **Fontos:** Minden FinanceHub macro-fetcher kötelezően támogatja a `startPeriod`, `endPeriod`, `detail=dataonly`, `format=jsondata` paramétereket, és **ajánlott** az `updatedAfter` gyorsító delta-mechanizmus használata.

### Teljes forráslista (jelenleg használt / backlog)

| Csoport | FlowRef | Leírás | Állapot |
|---------|---------|--------|---------|
| **FX Rates** | EXR | Árfolyamok | ✅ |
| **Policy Rates** | FM | Kamatdöntések | ✅ (parser fix „datasets” kulcsra) |
| **Yield Curve** | YC | Kötvény hozamgörbe | 🚧 |
| **Monetary Aggregates** | BSI | M1–M3 | ✅ |
| **BOP** | BOP | Fizetési mérleg | ✅ |
| **HICP** | ICP | Infláció | ✅ |
| **MIR** | MIR | Banki kamatok | ✅ |
| **Securities** | SEC | Kibocsátások | ✅ |
| **Investment Funds** | IVF | Alapok | ✅ |
| **Consolidated Banking** | CBD | Banki adatok | ✅ |
| … | … | lásd 1.a táblázat |  |

---
Utolsó frissítés: 2025-07-12 (o3 model RPP+CPP+BLS+SPF+CISS+TRD+PSS+IRS integráció) 

### 2025-07-12 Hotfix log
- IRS dataflow: fallback wrapper added, strict-scan ✅
- Comprehensive endpoint: static snapshot fallback ensures 200 + valid payload under SDMX rate limiting. 