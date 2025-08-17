## Aevorex Branding UX Upgrade – Sprint Master Plan (Living Doc v1)

Az alábbi dokumentum a branding oldal(ak) prémium szintű UX‑frissítésének folyamatosan karbantartott terve. Scope: `shared/frontend` branding nézetek és közvetlenül érintett layout elemek. Ez a dokumentum sprintenként bontja le a feladatokat, tartalmazza az elfogadási kritériumokat, mérőszámokat, kockázatokat és rollout tervet. Cél: Lighthouse ≥ 95, anti‑generic vizuális minőség (Stripe/Linear/Vercel/Apple szint), stabil teljesítmény, és a FinanceHub moduláris elvek tisztelete.

Megjegyzés: A terv a FinanceHub kézikönyvek és a Rule #008 – Teljes kódbázis‑ & dokumentum‑szinkron követelményeinek megfelel. Kiemelt fókusz: frontend↔backend illeszkedés, sebesség, tiszta információs architektúra.

---

### 1. Alapelvek és célállapot

- **minőség**: prémium, szerkesztőségi ritmusú tipó; visszafogott, mégis karakteres motion; minimális vizuális zaj
- **sebesség**: LCP < 1.8s, CLS < 0.02, TTI < 2.5s, Lighthouse ≥ 95 (desktop/mobil)
- **hozzáférhetőség**: AA kontraszt, fókusz és billentyű navigáció, `prefers-reduced-motion` tiszteletben
- **fenntarthatóság**: CSS változók/tokenezés, egyszerű util‑k, kevés dependency; komponensek LOC limit betartása
- **összhang**: illeszkedés a meglévő `shared/frontend` architektúrához, fölösleges duplikáció nélkül

---

### 2. Kötelező szabályok és keretek

- **Rule #008 – Teljes kódbázis‑ & dokumentum‑szinkron** (FinanceHub technical rule) – minden nagyobb módosítás előtt futtatandó ellenőrzési lista
- **Nincs inline CSS**: Tailwind utility + moduláris CSS, tokenekkel
- **Nincs emoji UI**: elegáns, vállalati stílus
- **Nincs mock adat**: csak valós végpont, marketing oldalon is reális copy/számok
- **SSG ajánlott**: marketing/branding route‑okra (LCP/Lighthouse miatt)

---

### 3. Design tokenek és tipó – egységes nyelv

- **Fontok**:
  - Display: Newsreader (variable, optical sizes)
  - Sans: Space Grotesk (400–700)
- **CSS változók** (globál):
  - `--font-display: 'Newsreader', serif;`
  - `--font-sans: 'Space Grotesk', system-ui, -apple-system, Segoe UI, Roboto, sans-serif;`
  - méretek: `--size-h1`, `--size-h2`, `--size-body`, stb. clamp használattal
- **Méretezés**:
  - H1: `clamp(3.2rem, 6vw, 4.6rem)`
  - H2: `clamp(2.2rem, 4vw, 3rem)`
  - Törzs: `clamp(1rem, 1.6vw, 1.125rem)`
- **Sorköz**: címsor 1.15–1.25, törzs 1.5
- **H1 tracking**: desktopon `letter-spacing: -0.005em`
- **Grid**: 12 oszlop, max‑width 1200–1280 px, section padding 72–96 px

Kód‑példa (részlet – a tényleges implementáció a globálban történik):

```css
:root {
  --font-display: 'Newsreader', serif;
  --font-sans: 'Space Grotesk', system-ui, -apple-system, Segoe UI, Roboto, sans-serif;

  --size-h1: clamp(3.2rem, 6vw, 4.6rem);
  --size-h2: clamp(2.2rem, 4vw, 3rem);
  --size-body: clamp(1rem, 1.6vw, 1.125rem);
}

.display-serif { font-family: var(--font-display); }
.body-sans { font-family: var(--font-sans); }
h1 { font-size: var(--size-h1); line-height: 1.15; letter-spacing: -0.005em; }
h2 { font-size: var(--size-h2); line-height: 1.2; }
body { font-size: var(--size-body); line-height: 1.5; }
.container { max-width: 1280px; margin: 0 auto; padding-inline: 1rem; }
```

Elfogadás: Lighthouse Typography/Accessibility ≥ 95; vizuális diff light/dark passz.

---

### 4. IA – oldal szerkezete

1) Hero (értékígéret + alcím + primer CTA + vizuál)

2) Proof (3 számmal alátámasztott bizonyíték)

3) Rövid tour (10–15s videó, in‑page)

4) Modulok (FinanceHub, Macro Rates, News – narratív kártyák)

5) Trust/SLA/GDPR (rövid blokk)

6) Záró CTA (Enterprise demo)

7) Footer (social + feliratkozás + jogi)

---

### 5. Sprint bontás – áttekintés

- Sprint 01: Tipográfia és grid
- Sprint 02: Hero (vizuál + CTA + háttér motívum)
- Sprint 03: Navigáció (blur header, scroll viselkedés, CTA)
- Sprint 04: Motion (scroll‑reveal + micro‑hover + reduced‑motion)
- Sprint 05: Brand‑ujjlenyomat (A‑apex/crown + chart‑pattern)
- Sprint 06: Média/performance (font preload, LCP optimalizáció, lazy)
- Sprint 07: IA véglegesítése (proof, tour, modulok, trust, CTA)
- Sprint 08: SSG/SEO (marketing route‑ok statikus exportja, OG/meta)
- Sprint 09: QA & Lighthouse tuning (≥ 95 minden metrikán)

Mindegyik sprint tartalmaz: cél, változáslista, file‑szintű érintettség, acceptance, mérőszámok, rollout.

---

### 6. Sprint 01 – Tipográfia és grid (részletes)

**Cél**: markáns editorial ritmusú tipó, egységes grid és whitespace.

**Változások**:
- `shared/frontend/index.html`: preconnect + preload a fontokra; `font-display: swap`
- `shared/frontend/src/styles/globals.css`: CSS tokenek és méretskála
- `shared/frontend/src/pages/BrandingPage.view.tsx`: `display-serif` osztály a címekre
- `shared/frontend/src/layout/BrandHeader.tsx`: tipó illesztés
- Átnézni: `BrandFooter.tsx` – tipó homogenizálás

**Elfogadási kritériumok**:
- H1/H2 méret és ritmus megfelel a specifikációnak
- 12 oszlopos grid, max‑width mérőszalaggal igazolva
- Lighthouse Typo/Acc ≥ 95; CLS ≈ 0

**Mérőszámok**:
- CLS < 0.02; layout shift csak font‑swap során, de minimális

**Kockázatok**:
- Font preload túl agresszív → blokkolás; megoldás: precíz preload csak a használt subsetre

**Rollout**:
- Dev mérés → canary → teljes

---

### 7. Sprint 02 – Hero

**Cél**: fókuszált értékígéret, erős CTA, prémium vizuál.

**Változások**:
- Jobb oldali kártya: 10–15s WebM `autoplay muted loop playsinline`, `poster` + keret
- Háttér: A‑apex + „rex/crown” radial maszk, 2% grain; aurora minimal
- `fetchpriority=high` a hero vizuálra

**Elfogadás**:
- LCP < 1.8s (mobil/desktop), vizuális zaj nincs; hero nem csúszik

**Kockázat**:
- Nagy videó → LCP romlik; mitigáció: 720p/AV1/VP9, 2–4 MB, erős poster

---

### 8. Sprint 03 – Navigáció

**Cél**: üveg/blur header, tiszta CTA, mobilon ergonomikus targetek.

**Változások**:
- `backdrop-blur-md bg-white/60 dark:bg-neutral-900/50` + hairline border
- Scroll után enyhén fedett állapot
- Mobil: 44×44 tap targetek, fókuszállapotok

**Elfogadás**:
- A11y audit pass, keyboard nav hibamentes

---

### 9. Sprint 04 – Motion

**Cél**: finom, 60 fps animációk; reduced‑motion tisztelete.

**Változások**:
- IntersectionObserver scroll‑reveal util (120–180 ms, 8–16 px translate + opacity, 40 ms group delay)
- Hover micro‑interakciók (transform/opacity only)
- `prefers-reduced-motion: reduce` esetben animációk kikapcsolása

**Elfogadás**:
- 60 fps a Performance panelben; CPU terhelés alacsony

---

### 10. Sprint 05 – Brand‑ujjlenyomat

**Cél**: Aevorex‑specifikus vizuális motívum (A‑apex + crown) és finom chart‑mintázat.

**Változások**:
- SVG mask a hero háttérben (apex/crown), 2–3% opacity chart‑pattern a sarokban
- Csak desktopon jelenik meg; mobilon tiszta háttér

**Elfogadás**:
- Finom, nem tolakodó; világos/sötét módban konzisztens

---

### 11. Sprint 06 – Média/Performance

**Cél**: LCP/CLS/TTI optimum, font‑ és képkezelés rendben.

**Változások**:
- Font preload csak a fejléc/hero számára kritikus súlyokra
- Képek/videók `decoding="async"`, `loading="lazy"` (nem‑LCP)
- Cache‑header és szervírozás optimalizálása

**Elfogadás**:
- Lighthouse Performance ≥ 95; LCP < 1.8s, TTI < 2.5s, CLS < 0.02

---

### 12. Sprint 07 – IA véglegesítése

**Cél**: teljes oldal‑folyam finalizálása (Hero → Proof → Tour → Modulok → Trust → CTA → Footer).

**Proof**:
- 3 hiteles mérőszám beépítése (pl. „Setup 2 hét”, „Research idő −70%”, „Lighthouse ≥ 95”) – végleges számokra várunk

**Tour**:
- Rövid (10–15s) in‑page videó a termékről (posterrel)

**Elfogadás**:
- Above‑the‑fold értékígéret + CTA, zavaró elem nélkül; mérőszámok olvashatók, vizuálisan kiegyensúlyozott

---

### 13. Sprint 08 – SSG/SEO

**Cél**: marketing route‑ok statikus exportja (jobb LCP/SEO), OG/meta teljes.

**Változások**:
- Döntés: vite‑plugin‑ssg vagy Astro/Next – integrációs terv
- OG image 1200×630; title/desc; favicon; sitemap/robots igény szerint

**Elfogadás**:
- Lighthouse SEO ≥ 95; marketing URL‑ek gyors LCP‑vel

---

### 14. Sprint 09 – QA & Lighthouse tuning

**Cél**: minden kapu zöld (desktop/mobil), regressziómentes.

**Checklist**:
- [ ] Lighthouse ≥ 95 (Perf/BestPractices/SEO/A11y)
- [ ] LCP < 1.8s; CLS < 0.02; TTI < 2.5s
- [ ] A11y: fókusz, alt‑ok, kontraszt
- [ ] Mobil feature parity

---

### 15. Fájl‑ és komponens szintű érintettség

- `shared/frontend/index.html` – preconnect/preload, meta/OG
- `shared/frontend/src/styles/globals.css` – tokenek, tipó, motion utilok
- `shared/frontend/src/layout/BrandHeader.tsx` – blur header
- `shared/frontend/src/layout/BrandFooter.tsx` – social/newsletter, tipó egységesítés
- `shared/frontend/src/pages/BrandingPage.view.tsx` – hero/proof/tour/modulok/trust/CTA
- `shared/frontend/public/assets/partners/*.svg` – alma mater logók (grayscale)

---

### 16. Motion – technikai jegyzet

IntersectionObserver alapú „reveal on scroll” minta:

```ts
// pseudo: observe elements with data-reveal
const elements = Array.from(document.querySelectorAll('[data-reveal]')) as HTMLElement[];
const io = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting) {
      e.target.classList.add('revealed');
      io.unobserve(e.target);
    }
  });
}, { rootMargin: '0px 0px -10% 0px', threshold: 0.15 });
elements.forEach(el => io.observe(el));
```

CSS (részlet):

```css
[data-reveal] { opacity: 0; transform: translateY(12px); transition: opacity .16s ease-out, transform .16s ease-out; }
.revealed { opacity: 1; transform: translateY(0); }
@media (prefers-reduced-motion: reduce) {
  [data-reveal] { transition: none; transform: none; }
}
```

---

### 17. Brand‑ujjlenyomat – technikai jegyzet

SVG pattern a finom „chart‑mikromintához” (részlet):

```svg
<svg width="0" height="0" style="position:absolute">
  <defs>
    <pattern id="chartPattern" width="8" height="8" patternUnits="userSpaceOnUse">
      <path d="M0 8 L8 0" stroke="currentColor" stroke-width="0.25" opacity="0.03" />
    </pattern>
  </defs>
</svg>
```

Használat: `background: radial-gradient(...), url(#chartPattern);`

---

### 18. Teljesítmény – ellenőrzőlista

- [ ] Fontok preload csak kritikus súlyokra
- [ ] Hero videó 2–4 MB, optimalizált kodek (VP9/AV1), erős `poster`
- [ ] Képek `decoding="async"`, nem kritikusak `loading="lazy"`
- [ ] Render‑blocking minimalizálása, script deferral
- [ ] Cache/headers beállítás

---

### 19. Hozzáférhetőség – ellenőrzőlista

- [ ] AA kontraszt
- [ ] Billentyű navigáció; fókuszállapotok
- [ ] Alt szövegek képeken
- [ ] `prefers-reduced-motion` tisztelete
- [ ] ARIA landmarkok (header/main/footer)

---

### 20. Kockázatok és mitigáció

- **LCP romlás**: nagy hero média → agresszív poszter + tömörítés
- **Motion túlzás**: animáció‑zaj → IO küszöbök és időzítés finomhangolása
- **Brand overload**: háttérmotívum túl erős → opacity ≤ 0.03, csak desktop

---

### 21. Rollout és visszaesés

- Canary deploy a branding route‑okra → mérés → teljes rollout
- Rollback: előző build visszaállítása (vite output)

---

### 22. Mérőszámok és megfigyelhetőség

- Lighthouse scorek buildenként logolva
- Web Vitals (LCP/CLS/INP) – fejlesztői körben is mérve
- Konzol error‑számlálás a branding route‑on (nulla tolerancia)

---

### 23. Dokumentum karbantartás

- Ez a dokumentum élő; minden sprint zárásánál frissítjük: állapot, mérések, screenshot linkek

---

### 24. Jelenlegi státusz (v1)

- Alma mater logók: hivatalos SVG‑k beemelve (Bocconi, UPenn, Semmelweis) a `public/assets/partners/` alá
- BrandingPage: alapstruktúra kész; hero placeholder; tipó‑tokenek folyamatban
- Következő lépés: Sprint 01 kivitelezés (tipó + grid) és mérés

---

### 25. Akciólista – azonnal

- [ ] `index.html` font preconnect + preload
- [ ] `globals.css` tipó tokenek és clamp skála
- [ ] BrandingPage címsorok `display-serif`‑re cserélése
- [ ] Grid/spacing ellenőrzés (1280 max‑width + 72–96 px paddings)

---

### 26. Melléklet – ajánlott erőforrások

- Newsreader variable (Google Fonts)
- Space Grotesk (Florian Karsten)
- Stripe/Linear/Vercel/Apple vizuális minták: tipó‑ritmus és motion inspiráció

---

### 27. Változásnapló (foglalás)

- v1.0 – kezdeti sprintterv, file‑szintű érintettség, acceptance listák

---

### 28. Aláírás

Készítette: Aevorex • Branding UX Upgrade – Living Doc v1



