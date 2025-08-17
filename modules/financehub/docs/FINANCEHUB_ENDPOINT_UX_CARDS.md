## FinanceHub • Frontend ⇄ Backend UX Card Plan (v1)

Egyenkénti UX‑terv a fő backend végpontokra. Cél: prémium, minimalista, esztétikus és szakmailag hasznosítható kártyák, amelyek minden backend mezőt eljuttatnak a frontendbe. Követi a Rule #008 (repo‑szkennelés, docs‑szinkron, adattérkép, modularizáció, prémium UX) és a FinanceHub/stocks szabályokat.

Globális elvek
- Prémium UX: minimalista vizuál, tiszta hierarchia, 60 fps; skeleton shimmer < 200 ms; dark/light token.
- Adatkezelés: minden backend mező beérkezik a frontendre (TS típusok), „Details” accordionnál a ritka/extra mezők is láthatók.
- SWR: agresszív dedup, `revalidateOnFocus=false`, per‑kártya TTL; N/A megjelenítés fallback helyett.
- TV Chart: line style alap, volume off, autosize, minimal toolbar; TradingView UDF a részvényoldalon.
- Monetizáció: Free / Pro / Pro+ / Enterprise címkék és látható értékdifferenciálás.

Szabály-követelmények (FinanceHub roles)
- Chat SSE első üzenet: automatikus AI summary; nincs „0. placeholder”.
- TradingView integrációt nem cserélünk, csak konfigurálunk (Stocks=candles, Macro=line).
- Négy elemző buborék egy komponensben marad (nem külön route).
- Nincs mockadat; FX elsődleges: EODHD; adat hiányában „N/A”.

Megvalósítási ellenőrzőlista (minden kártyára)
- Típusok: generált/írt TS típus a backend payload teljes lefedésére.
- Hook: `useSWR`/SSE wrapper helyes TTL‑lel, dedupe‑pal, hibaszegregációval.
- UI: `UXCardBase`‑re épülő komponens; heading + TierBadge + EndpointChip + InfoTooltip.
- Interakció: a kártya leírás szerinti fő műveletek; billentyű‑/ARIA támogatás.
- Állapotok: skeleton (<200 ms), üres és hiba állapot külön, layout‑shift nélkül.
- „Show all fields”: teljes backend payload megjelenítése olvasható formában.
- Observability: időzítés, forrás‑flag, cache‑hit jelzés (dev/QA).

Formátum (rövidítve minden kártyánál)
- Endpoint: METHOD PATH
- Cél: rövid üzleti érték
- UI: szerkezet, vizualizáció
- Interakció: fő műveletek
- Cache: SWR/perzisztencia
- Tier: Free/Pro/Pro+/Ent
- Hibák: üres/limitált állapot

---

FH‑001 — GET /api/v1/health
- Cél: szolgáltatás állapot badge a láblécben
- UI: kicsi ikon + „ok” + verzió (tooltip)
- Interakció: katt → health modal (diagnosztika)
- Cache: TTL 60s
- Tier: Free
- Hibák: szürke ikon, „unknown”

FH‑002 — GET /metrics
- Cél: operációs metrika gyors áttekintés (admin)
- UI: mini számlálók (req/s, p95, memória)
- Interakció: „View in Grafana” link
- Cache: no‑cache (admin only)
- Tier: Ent
- Hibák: elrejtés, ha 401/403

FH‑003 — GET /api/v1/auth/status
- Cél: auth állapot a subheaderben
- UI: avatar/„Sign in” CTA, plan jelvény
- Interakció: Sign in/out
- Cache: SWR 60s
- Tier: Free
- Hibák: unauthenticated state

FH‑004 — GET /api/v1/auth/me
- Cél: profil részletek popover
- UI: név, email, plan, gyors linkek
- Interakció: plan upgrade CTA
- Cache: SWR 5m
- Tier: Free
- Hibák: reauth CTA

FH‑005 — GET /api/v1/auth/login
- Cél: Google OAuth indító
- UI: „Continue with Google” gomb, jogi linkek
- Interakció: redirect
- Cache: n/a
- Tier: Free
- Hibák: 503 → info‑panel

FH‑006 — GET /api/v1/auth/callback
- Cél: auth folyamat visszatéréskor
- UI: „Signing you in…” progress
- Interakció: automatikus navigáció
- Cache: n/a
- Tier: Free
- Hibák: részletes hiba (debug=1)

FH‑007 — POST /api/v1/auth/refresh-token
- Cél: sess frissítés csendben
- UI: nincs vizuál (service layer), log jelzés dev‑ben
- Interakció: automatikus hívás
- Cache: n/a
- Tier: Free
- Hibák: 401 → logout + relogin CTA

FH‑008 — POST /api/v1/config/model
- Cél: kiválasztott AI modell megadása
- UI: model picker (segítő leírásokkal)
- Interakció: választás → mentés
- Cache: local + SWR mutate
- Tier: Free
- Hibák: rollback

FH‑009 — POST /api/v1/config/language
- Cél: nyelv beállítása
- UI: language dropdown
- Interakció: mentés, webszerte alkalmazás
- Cache: local
- Tier: Free
- Hibák: alap (en)

FH‑010 — POST /api/v1/config/deep
- Cél: mély elemzés pref flag
- UI: toggle + kredit figyelmeztetés
- Interakció: deep mód kapcsoló
- Cache: session
- Tier: Pro
- Hibák: upgrade CTA

FH‑011 — GET /api/v1/ai/models
- Cél: modellkatalógus
- UI: kártyarács, latencia/ár jelvények
- Interakció: select, docs link
- Cache: SWR 24h
- Tier: Pro
- Hibák: empty grid

FH‑012 — GET /api/v1/market/news
- Cél: piaci hírek (macro oldal alja)
- UI: headline lista, forrás‑badge, idő, kép
- Interakció: forrás szerinti szűrés, megnyitás
- Cache: SWR 5–10m
- Tier: Pro
- Hibák: „No fresh headlines”

FH‑013 — GET /api/v1/market/indices
- Cél: index snapshot (S&P/DJ/Nasdaq)
- UI: 3 kompakt kártya ár + %változás
- Interakció: részletek modal
- Cache: SWR 5m
- Tier: Pro
- Hibák: N/A jelzés egyes elemeknél

FH‑014 — GET /api/v1/tv/bars
- Cél: TV UDF állapot monitor
- UI: mini health + legutóbbi kérés meta
- Interakció: ping teszt
- Cache: no‑cache
- Tier: Free
- Hibák: piros jelvény

FH‑015 — GET /api/v1/tv/symbols
- Cél: szimbólumkatalógus
- UI: kereső + lista, exchange filter
- Interakció: hozzáadás watchlisthez
- Cache: SWR 24h
- Tier: Free
- Hibák: üres állapot

FH‑016 — GET /api/v1/tv/symbols/{symbol}
- Cél: szimbólum meta
- UI: detail sheet (tick size, session, currency)
- Interakció: chart megnyitás
- Cache: SWR 24h
- Tier: Free
- Hibák: 404 → „Unknown symbol”

FH‑017 — GET /api/v1/stock/ticker-tape/
- Cél: Ticker Tape (globális)
- UI: egyszer betöltött sor, CSS‑loop; stale jelölés
- Interakció: katt → ticker oldal
- Cache: mem cache + SWR disable auto refresh
- Tier: Free
- Hibák: „Loading…” skeleton vékony

FH‑018 — GET /api/v1/stock/ticker-tape/item
- Cél: egyedi elem vizsgálat (debug)
- UI: popover részletek
- Interakció: copy symbol
- Cache: n/a
- Tier: Free
- Hibák: invalid symbol

FH‑019 — GET /api/v1/stock/ticker-tape/test
- Cél: QA
- UI: teszt feed megjelenítés
- Interakció: nincs
- Cache: n/a
- Tier: Free
- Hibák: jelölő üzenet

FH‑020 — GET /api/v1/stock/search
- Cél: kereső találatok
- UI: legördülő lista emblémával
- Interakció: enter → navigáció tickerre
- Cache: debounce + SWR
- Tier: Free
- Hibák: „No matches”

FH‑021 — GET /api/v1/stock/{ticker}
- Cél: Stock Header snapshot
- UI: ár, %változás, market cap, beta badge
- Interakció: „Open Chat”, „Add watch”
- Cache: SWR 60–120s
- Tier: Free→Pro
- Hibák: stale badge

FH‑022 — GET /api/v1/stock/{ticker}/chart
- Cél: sparkline preview
- UI: kicsi vonal grafikon
- Interakció: timeframe gombok (1D/1W/1M)
- Cache: SWR 5m
- Tier: Free
- Hibák: dotted line N/A

FH‑023 — GET /api/v1/stock/{ticker}/fundamentals
- Cél: Financial Metrics
- UI: kétoszlopos metrika‑rács, kategória címkék
- Interakció: „Show all fields” accordion (minden mező látszik)
- Cache: SWR 24h
- Tier: Pro
- Hibák: mezőhiány „—”

FH‑024 — GET /api/v1/stock/{ticker}/news
- Cél: ticker‑news összefoglaló
- UI: headline lista, ticker‑badge
- Interakció: open in new tab
- Cache: SWR 5–10m
- Tier: Pro
- Hibák: „No recent news”

FH‑025 — GET /api/v1/stock/esg/{ticker}
- Cél: ESG jelvény
- UI: score badge + range indikátor
- Interakció: info tooltip a metodikáról
- Cache: SWR 24h
- Tier: Pro/Ent
- Hibák: „Not available for this ticker”

FH‑026 — GET /api/v1/stock/{ticker}/summary (alias)
- Cél: legacy AI summary megj.
- UI: figyelmeztetés + link a prémium verzióhoz
- Interakció: open Pro summary
- Cache: n/a
- Tier: Pro
- Hibák: alias banner

FH‑027 — GET /api/v1/stock/premium/{ticker}/summary
- Cél: AI rövid kivonat (cache‑elhető)
- UI: 3–4 bullet insight, forrás‑footnote
- Interakció: „Open Chat (SSE)” CTA
- Cache: SWR 30m
- Tier: Pro/Ent
- Hibák: „Temporarily unavailable”

FH‑028 — GET /api/v1/stock/chat/{ticker}/stream
- Cél: AI Summary stream overlay (0. üzenet kötelező)
- UI: chat overlay, tokenenként streamelve
- Interakció: prompt mező, sablonok
- Cache: SSE
- Tier: Pro/Ent
- Hibák: reconnect policy, 403 → upgrade CTA

FH‑029 — POST /api/v1/stock/chat/{ticker}/deep
- Cél: mély elemzés stream (CTA)
- UI: „Deep Analysis” overlay, kredit infó
- Interakció: indítás/megállítás
- Cache: SSE
- Tier: Pro+
- Hibák: 402 → upgrade CTA

FH‑030 — POST /api/v1/stock/chat/{ticker}
- Cél: rapid (nem stream) válasz
- UI: compact Q→A kártya
- Interakció: „Promote to overlay”
- Cache: n/a
- Tier: Pro
- Hibák: méret limit tájékoztatás

FH‑031 — GET /api/v1/eodhd/fx/{pair}
- Cél: FX KPI (EUR/HUF elsődleges)
- UI: nagy érték + %változás, kis sparkline
- Interakció: pair chipválasztó
- Cache: SWR 60s
- Tier: Pro
- Hibák: N/A (nincs fallback)

FH‑032 — GET /api/v1/macro/forex/pairs
- Cél: támogatott párok listája
- UI: chip‑sor (EUR/USD/GBP/JPY/CHF…)
- Interakció: katt → KPI + TV frissül
- Cache: SWR 24h
- Tier: Free
- Hibák: üres lista jelzés

FH‑033 — GET /api/v1/macro/forex/{pair}
- Cél: alternatív FX spot összevetés
- UI: kisegítő KPI (forrás jelölve)
- Interakció: compare toggle
- Cache: SWR 60s
- Tier: Free
- Hibák: invalid pair

FH‑034 — GET /api/v1/macro/forex/{base}/{quote}
- Cél: base/quote szegmentált FX
- UI: két mezős bevitel, normalizálás vizuál
- Interakció: swap base/quote
- Cache: SWR 60s
- Tier: Free
- Hibák: normalizációs hiba

FH‑035 — GET /api/v1/macro/forex/{pair}/history
- Cél: FX történeti sparkline
- UI: vékony kékvonal
- Interakció: timeframe tap
- Cache: SWR 1d
- Tier: Free
- Hibák: hiányos idősor → pontozott

FH‑036 — GET /api/v1/macro/fixing-rates/
- Cél: Fixing Rates tábla (Euribor/BUBOR + Spread)
- UI: táblázat, spread sor külön kiemelve
- Interakció: export CSV
- Cache: SWR 1h
- Tier: Ent
- Hibák: részleges hiány „—”

FH‑037 — GET /api/v1/macro/fixing-rates/health
- Cél: forrás egészség
- UI: zöld/sárga/piros ikon tooltipben részletek
- Interakció: katt → validation card
- Cache: SWR 10m
- Tier: Ent
- Hibák: unknown → szürke

FH‑038 — GET /api/v1/macro/fixing-rates/validation
- Cél: kereszthivatkozás validáció
- UI: checklista státusz
- Interakció: részletek megnyitása
- Cache: SWR 1d
- Tier: Ent
- Hibák: „Out of sync” banner

FH‑039 — GET /api/v1/macro/bubor
- Cél: BUBOR alias tájékoztató
- UI: info card + redirect link a fő táblára
- Interakció: open table
- Cache: SWR 1h
- Tier: Ent
- Hibák: n/a

FH‑040 — GET /api/v1/macro/ecb/rates
- Cél: fő ECB kamatok
- UI: 3 kártya (DFR/MRO/MSF) trendnyíllal
- Interakció: időtáv választó
- Cache: SWR 1d
- Tier: Free
- Hibák: hiány „—”

FH‑041 — GET /api/v1/macro/ecb/rates/all
- Cél: részletes rate explorer
- UI: faceted táblázat
- Interakció: filter/export
- Cache: SWR 1d
- Tier: Ent
- Hibák: táblázat üres állapot

FH‑042 — GET /api/v1/macro/ecb/yield-curve
- Cél: hozamgörbe fő nézet + 2s10s, 10s30s minik
- UI: vonalgrafikon + mini slope kártyák
- Interakció: görbe dátumválasztó
- Cache: SWR 1d
- Tier: Free
- Hibák: 30Y „—” ha hiányzik

FH‑043 — GET /api/v1/macro/ecb/yield-curve/lite
- Cél: gyors görbe nézet
- UI: kompakt line chart
- Interakció: none
- Cache: SWR 1d
- Tier: Free
- Hibák: n/a

FH‑044 — GET /api/v1/macro/ecb/historical-yield-curve
- Cél: történeti görbe
- UI: időbeli slider + hőtérkép
- Interakció: play/pause
- Cache: on‑demand
- Tier: Pro
- Hibák: hiányzó pontok jelölése

FH‑045 — GET /api/v1/macro/ecb/estr/
- Cél: €STR idősor
- UI: mini chart + utolsó érték
- Interakció: export
- Cache: SWR 1d
- Tier: Free
- Hibák: „—”

FH‑046 — GET /api/v1/macro/ecb/mir/
- Cél: MFI kamatok
- UI: több oszlopos metrika kártya
- Interakció: kategória váltó
- Cache: SWR 1d
- Tier: Free
- Hibák: részleges adat

FH‑047 — GET /api/v1/macro/ecb/bsi/
- Cél: mérlegtételek
- UI: stacked bar/small multiples
- Interakció: kategória filter
- Cache: on‑demand
- Tier: Ent
- Hibák: jelmagyarázat

FH‑048 — GET /api/v1/macro/ecb/pss/
- Cél: fizetési rendszerek
- UI: táblázat + trend ikonok
- Interakció: sor rendezés
- Cache: on‑demand
- Tier: Ent
- Hibák: n/a

FH‑049 — GET /api/v1/macro/ecb/trd/
- Cél: külker statisztika
- UI: chart + táblázat
- Interakció: ország filter
- Cache: on‑demand
- Tier: Ent
- Hibák: n/a

FH‑050 — GET /api/v1/macro/ecb/bls/
- Cél: Bank Lending Survey
- UI: index idősorok (line) + összegző badge
- Interakció: kérdésblokk választó
- Cache: on‑demand
- Tier: Ent
- Hibák: hiányzó komponens „—”

FH‑051 — GET /api/v1/macro/ecb/spf/
- Cél: prof. előrejelzők felmérése
- UI: boxplot/violin + medián badge
- Interakció: horizon választó
- Cache: on‑demand
- Tier: Ent
- Hibák: minta‑méret figyelmeztetés

FH‑052 — GET /api/v1/macro/ecb/ciss/
- Cél: rendszerkockázati index
- UI: single line + zóna sávok
- Interakció: időtáv
- Cache: on‑demand
- Tier: Ent
- Hibák: hiány „—”

FH‑053 — GET /api/v1/macro/ecb/icp/
- Cél: HICP infláció
- UI: headline + core idősor
- Interakció: ország filter (ha van)
- Cache: SWR 1d
- Tier: Free
- Hibák: késleltetett adat jelző

FH‑054 — GET /api/v1/macro/ecb/sec/
- Cél: értékpapír‑kibocsátások
- UI: táblázat + aggregált kártyák
- Interakció: komponensek megnyitása
- Cache: on‑demand
- Tier: Ent
- Hibák: n/a

FH‑055 — GET /api/v1/macro/ecb/sec/components
- Cél: SEC komponensek
- UI: részletes táblázat
- Interakció: export
- Cache: on‑demand
- Tier: Ent
- Hibák: n/a

FH‑056 — GET /api/v1/macro/ecb/sec/health
- Cél: SEC forrás‑health
- UI: badge
- Interakció: részletek tooltip
- Cache: SWR 1d
- Tier: Ent
- Hibák: szürke unknown

FH‑057 — GET /api/v1/macro/ecb/ivf/
- Cél: befektetési alapok
- UI: kategória kártyák
- Interakció: filter
- Cache: on‑demand
- Tier: Ent
- Hibák: n/a

FH‑058 — GET /api/v1/macro/ecb/irs/
- Cél: kamatswap görbék
- UI: multi‑line chart
- Interakció: tenor választó
- Cache: on‑demand
- Tier: Ent
- Hibák: interpolációs jegyzet

FH‑059 — GET /api/v1/macro/ecb/cbd/
- Cél: központi bank adatok
- UI: info + listák
- Interakció: filter
- Cache: on‑demand
- Tier: Ent
- Hibák: n/a

FH‑060 — GET /api/v1/macro/ecb/rpp/
- Cél: lakóingatlan árak
- UI: line chart + YoY badge
- Interakció: ország/regió filter
- Cache: on‑demand
- Tier: Ent
- Hibák: késleltetés jelzés

FH‑061 — GET /api/v1/macro/ecb/cpp/
- Cél: kereskedelmi ingatlan árak
- UI: line chart + YoY
- Interakció: filter
- Cache: on‑demand
- Tier: Ent
- Hibák: n/a

FH‑062 — GET /api/v1/macro/ecb/bop/
- Cél: fizetési mérleg
- UI: tabs (CA/FA/KA) + idősorok
- Interakció: komponensek megnyitása
- Cache: on‑demand
- Tier: Ent
- Hibák: hiányzó komponensek jelölése

FH‑063 — GET /api/v1/macro/ecb/bop/components
- Cél: BoP részletek
- UI: táblázat
- Interakció: export
- Cache: on‑demand
- Tier: Ent
- Hibák: n/a

FH‑064 — GET /api/v1/macro/ecb/bop/health
- Cél: BoP egészség
- UI: health badge
- Interakció: tooltip
- Cache: SWR 1d
- Tier: Ent
- Hibák: unknown

FH‑065 — GET /api/v1/macro/ecb/fx
- Cél: ECB referencia FX
- UI: táblázat + kiválasztó
- Interakció: pair választó
- Cache: SWR 1d
- Tier: Free
- Hibák: n/a

FH‑066 — GET /api/v1/macro/ecb/fx/legacy
- Cél: legacy referencia FX
- UI: info banner + adat
- Interakció: n/a
- Cache: n/a
- Tier: Free
- Hibák: deprec jelző

FH‑067 — GET /api/v1/macro/ecb/monetary-aggregates
- Cél: M1–M3
- UI: multi‑line + táblázat
- Interakció: idősáv
- Cache: on‑demand
- Tier: Ent
- Hibák: n/a

FH‑068 — GET /api/v1/macro/ecb/monetary-policy
- Cél: monetáris politika narratíva
- UI: bullet összefoglaló + források
- Interakció: részletek
- Cache: on‑demand
- Tier: Ent
- Hibák: n/a

FH‑069 — GET /api/v1/macro/fed/policy
- Cél: Fed policy sorozatok
- UI: fő kamatsáv + idősortérkép
- Interakció: horizon választó
- Cache: SWR 1d
- Tier: Free
- Hibák: hiány „—”

FH‑070 — GET /api/v1/macro/fed/search
- Cél: FRED kereső
- UI: kereső + facet (tag)
- Interakció: kiválasztás → series card
- Cache: on‑demand
- Tier: Free
- Hibák: no results

FH‑071 — GET /api/v1/macro/fed/search/tags
- Cél: FRED tagok
- UI: facet list
- Interakció: filter builder
- Cache: on‑demand
- Tier: Free
- Hibák: n/a

FH‑072 — GET /api/v1/macro/fed/{series_id}/observations
- Cél: FRED idősor
- UI: vonal grafikon + meta
- Interakció: export
- Cache: on‑demand
- Tier: Pro
- Hibák: sorozat nem található

FH‑073 — GET /api/v1/crypto/symbols
- Cél: kripto szimbólumok
- UI: lista + szűrés
- Interakció: kiválasztás
- Cache: SWR 24h
- Tier: Free
- Hibák: üres

FH‑074 — GET /api/v1/crypto/{symbol}
- Cél: kripto ticker
- UI: ár + %változás
- Interakció: megnyitás chartban
- Cache: SWR 5m
- Tier: Free
- Hibák: N/A

FH‑075 — GET /api/v1/eodhd/{ticker}/{dataset}
- Cél: EODHD dataset explorer (dividends/splits/fundamentals)
- UI: tabokra bontott megjelenítés (lista/táblázat)
- Interakció: export, ticker váltás
- Cache: SWR 24h (fundamentals), 1d (div/split)
- Tier: Pro
- Hibák: provider fallback jelzés (yfinance)

FH‑076 — GET /api/v1/stock/premium/technical-analysis/quote/{ticker}
- Cél: [DEPRECATED] gyors quote a TA szolgáltatásból (csak összevetés/compat)
- UI: kompakt ár + % változás badge, „Deprecated” szalag
- Interakció: „Open main chart” CTA (átirányítás a TV chartra)
- Cache: SWR 60s
- Tier: Deprecated/Pro
- Hibák: üres állapot → javasolt fő chart megnyitása

FH‑077 — GET /api/v1/stock/{ticker}/ai-analysis
- Cél: publikus AI összefoglaló alias (stabil URL)
- UI: 3–4 bullet insight + forrás‑megjelölés, „Open Chat (SSE)” CTA
- Interakció: deep‑link a Chat overlay‑hez adott tickerrel
- Cache: SWR 30m
- Tier: Pro/Ent
- Hibák: „Temporarily unavailable” üzenet, fallback CTA a streamhez

FH‑078 — GET /api/v1/auth/start
- Cél: OAuth kezdő (cookie seed + redirect)
- UI: „Signing in…” progress panel (kisegítő böngészőknek)
- Interakció: automatikus navigáció Google‑re
- Cache: n/a
- Tier: Free
- Hibák: 404/503 → információs panel és visszalépés gomb

FH‑079 — GET/POST /api/v1/auth/logout
- Cél: kijelentkezés (mindkét metódus támogatott)
- UI: kis megerősítő panel (opcionális), állapotjelzés a headerben
- Interakció: logout → session tisztítás → redirect a landingre
- Cache: n/a
- Tier: Free
- Hibák: idempotens sikerüzenet akkor is, ha nincs session

Megjegyzések
- Minden kártya összes backend mezője elérhető a „Show all fields” részben; a fő UI csak a releváns subsetet emeli ki.
- A chat‑pipeline a szabály szerinti preprocess‑lépéseket végzi (min length, relevance, template kiválasztás, ticker data merge), és csak valid payload megy a backendnek.
- A kártyák komponens‑limitje ≤160 LOC; ha meghaladja, szétszedjük `*.view.tsx` + `*.logic.ts` szerkezetre.


