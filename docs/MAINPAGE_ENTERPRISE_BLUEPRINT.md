## AEVOREX – Enterprise Mainpage Blueprint (Vite SPA)

### Cél
Rögzíti a főoldal (Mainpage) információs architektúráját, vizuális és technikai elveit, a repository üzleti értékének bemutatását, a fejlesztőcsapat publikálható ismertetőjét, a CTA-kat és a nagymodulok elrendezését – úgy, hogy a rendszer prémium, teljesítményorientált és vállalati szintű maradjon.

## Értékajánlat és modul-kontúrok
- **FinanceHub**: valós idejű piaci adatok, TradingView Advanced Chart, AI‑összefoglalók (SSE), ECB/MNB hivatalos források; Equity Research UX.
- **HealthHub**: orvosi AI támogatás, adatvezérelt insightok, személyre szabott ajánlások, biztonságos adatkezelés.
- **ContentHub**: end‑to‑end tartalomgyártás és workflow; SEO automatizálás, média feldolgozás, analitika.
- **AIHub**: modellek, prompt‑pipeline és vállalati integrációk; nagyvállalati policy‑k betartása mellett.

Megkülönböztető érték: gyors (Vite), moduláris, dark/light téma, 60 fps, < 200 ms skeleton, no‑fallback adatpolitika pénzügyi adatoknál.

## Mainpage információs architektúra (IA)
Az alábbi szekciók jelennek meg ebben a sorrendben. A meglévő komponensek a shared frontendben már elérhetők.

- **Hero** (`HeroSection`)
  - Rövid értékajánlat + élő platform státusz badge + gyors CTA.
  - Mutatók (uptime, API response, security grade, support) – hitelesség.

- **Live Demos** (`LiveDemosSection`)
  - Kártyarács a nagymodulokkal; mindegyik kattintható.
  - Címkék: „Live & Ready”, lokális port/entrypoint felvillantása fejlesztői környezetben.
  - Primer CTA: modul megnyitása.

- **Features** (`FeaturesSection`)
  - 4 modul rövid leírással és bullet‑highlightokkal.

- **Competitive (Why us)** (`CompetitiveSection`)
  - Rövid összevetés (pl. Bloomberg / Perplexity Finance / IBKR / Yahoo Finance) – mire adunk többet.

- **Stats / Credibility** (`StatsSection`)
  - Enterprise számok, tanúsítványok (ISO 27001, GDPR, SOC 2, stb.).

- **CTA** (`CTASection`)
  - Primer: „Ingyenes Demo indítása” → `"/stock/AAPL"` (vagy kijelölt bemutató útvonal).
  - Szekunder: kapcsolat/kérdés.
  - Megjelenítés: emoji‑mentes, SVG ikonok, prémium tipográfia.

- **Contact** (`ContactSection`)
  - Kapcsolatfelvételi űrlap (név, email, cég, üzenet) + elérhetőségek.
  - Backend bekötés: dedikált `POST /api/v1/contact` (ha publikálva), addig diszkrét „köszönő” visszajelzés.

## Nagymodulok elrendezése a főoldalon
- **Rács**: 2×N vagy 4×N kártya (responsive breakpointokkal), modulonként egységes kártya‑UI.
- **Hivatkozások**:
  - FinanceHub: `"/stock/:ticker"` (belépő: `"/stock/AAPL"`) + `"/macro"` + `"/news"` aloldalak.
  - HealthHub: `"/health"` (bemutató nézet + demók).
  - ContentHub: `"/content"` (munkaterület és sablonok/flowk).
  - AIHub: `"/aihub"` (modellek, playground, dokumentációs linkek).
- **Állapot badge**: online/maintenance/offline – zöld/sárga/piros kis dot animációval.

## CTA‑stratégia
- **Primer CTA**: azonnali demó a legjobb élményhez (Hero + Live Demos + CTA szekció is tartalmazza).
- **Szekunder CTA**: kapcsolatfelvétel / enterprise ajánlatkérés.
- **Mérések**: pageview + CTA click eventek; később consent‑kompatibilis analitika.

## Vizuális és UX elvek
- **Prémium minimalizmus**: dark/light; Tailwind tokenek; nincsenek emojik; konzisztens ikonográfia (SVG).
- **Teljesítmény**: 60 fps animációk; skeleton < 200 ms; code‑split és lazy‑load, a fenti szerkezet változatlanul gyors.
- **Stabilitás**: TradingView Advanced Chart csak a pénzügyi oldalakra; embed JSON és DOM injektálás guardokkal.
- **Hozzáférhetőség**: kontraszt, fókuszgyűrű, aria‑label; billentyűzetes navigáció.

## Biztonság és adatpolitika
- **CORS**: szigorú engedélyezés (localhost/127.0.0.1 dev); `allow_credentials=True` csak explicit originre.
- **Auth**: GIS primer + klasszikus fallback; 401 auto‑retry kliensoldali guarddal (prompt max 1×).
- **No‑fallback** pénzügyi adatpolitika: ha EODHD/ECB forrás nem elérhető → N/A, nem mock.
- **CSP**: későbbi bevezetéshez ajánlott (`vite-plugin-csp` vagy reverse proxy szabályok).

## Megfigyelhetőség és minőség
- **Lighthouse**: ≥ 92 (Performance + Accessibility); regresszió esetén visszajavítás kötelező.
- **Monitoring**: Grafana dashboardok; alap health endpoint `GET /api/v1/health`.
- **CI kapuk**: `pnpm build`, `pnpm lint`, `pnpm test`, `pnpm typecheck` + backend pytest; hibára nincs deploy.

## Fejlesztőcsapat – publikus ismertető
- **Engineering**: frontend (Vite+React+TS+Tailwind), backend (FastAPI), data integrációk (ECB/EODHD/MNB…)
- **Design**: UX kutatás, tipográfia, tokenek, sötét/világos téma; animációs irányelvek (≤150–200 ms).
- **Data/AI**: prompt‑pipeline, SSE stream summary (FinanceHub), modell‑katalógus.
- **DevOps/Sec**: környezetek, titokkezelés, CORS/CSP, audit.
- **QA**: unit/E2E, vizuális regresszió (Storybook), performancia‑teszt.

## Végrehajtási irányelvek (Rule #008 szellemében)
- Minden nagyobb módosítás előtt teljes repo‑szkennelés és dokumentum‑szinkron.
- Frontend–backend mezőparitás: új backend mező 72 órán belül propagálva a főoldal vagy modul‑nézet releváns helyére.
- Modularizáció: ≥ 200 LOC vagy több felelősség esetén bontás; csak meglévő fájlok szerkesztése (új fájl kijelölés után).

## Útvonal‑térkép (kivonat)
- `/` → Mainpage (`MainPage.view.tsx`)
- `/stock/:ticker` → FinanceHub Stock nézet (4 buborék + TV + AI chat stream)
- `/macro` → Macro Rates (ECB/BUBOR/Euribor)
- `/news` → Piaci hírek
- `/health` → HealthHub landing
- `/content` → ContentHub landing
- `/aihub` → AIHub landing

## Integrációs megjegyzések (kódhoz kötés)
- A jelenlegi főoldal komponensei:
  - `HeroSection`, `LiveDemosSection`, `FeaturesSection`, `CompetitiveSection`, `StatsSection`, `CTASection`, `ContactSection`.
- CTA‑k linkjei a fenti útvonalakra mutatnak; analitika későbbre paraméterezhető.
- Tilos új UI‑kit importálása; markdown/minta átemelés csak markup‑szinten, Tailwind tokenekkel.

## Roadmap – rövid
- Brand‑sor hozzáadása a Hero alá (SVG logó sprite, halvány, accessibility‑ready).
- CTA konverziómérés (consent‑bar kompatibilisen).
- CSP bevezetés (szigorítás fokozatos rollouttal).


