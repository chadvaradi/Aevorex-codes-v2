# 🗂️ Macro Module Development Guide

## 📋 Áttekintés

Ez a dokumentum a FinanceHub macro modul fejlesztési útmutatója, amely tartalmazza az automatizált szinkronizációs mátrixot, a KPI dashboard-ot, a mobil optimalizációt és az AI magyarázatokat.

## 🚀 Új Funkciók

### 1. **Automatikus Szinkronizációs Mátrix**

#### Script: `scripts/auto_sync_matrix_generator.py`
- **Cél:** Automatikusan generálja és frissíti a macro endpoint szinkronizációs mátrixot
- **Input:** Backend routerek, frontend hookok, UI komponensek
- **Output:** `docs/ENDPOINT_MATRIX.md` és `docs/MACRO_ENDPOINT_SYNC_MATRIX.md`

#### Használat:
```bash
python3 scripts/auto_sync_matrix_generator.py
```

#### CI/CD Integráció:
- GitHub Actions workflow: `.github/workflows/macro-sync-matrix.yml`
- Automatikus frissítés minden PR-nél és push-nál
- Kommentár a PR-kben a változásokról

### 2. **Publikus API Dokumentáció**

#### Swagger UI
- **URL:** http://localhost:8084/docs
- **Funkciók:** Interaktív API tesztelés, schema validáció

#### ReDoc
- **URL:** http://localhost:8084/redoc
- **Funkciók:** Olvasható dokumentáció, részletes schema leírások

#### OpenAPI JSON
- **URL:** http://localhost:8084/openapi.json
- **Használat:** TypeScript generálás, CI/CD integráció

### 3. **KPI Dashboard**

#### Komponens: `MacroKPIDashboard.tsx`
- **Funkciók:** STS, infláció, monetáris aggregátumok egy helyen
- **Mobil:** Stackelt nézet, nagyobb érintőfelület
- **Desktop:** Grid/tab nézet, részletes adatok

#### Hook-ok:
- `useECBSts` - STS index adatok
- `useECBInflation` - Inflációs adatok
- `useECBMonetaryAggregates` - Monetáris aggregátumok

### 4. **Mobil Optimalizáció**

#### Komponens: `YieldCurveLiteCard.tsx`
- **Mobil:** Expandable nézet, touch-friendly interface
- **Desktop:** Mindig látható chart, részletes adatok
- **Funkciók:** 60fps animációk, skeleton loader

#### Responsive Design:
```css
/* Mobile: Stacked layout */
.sm:hidden { /* Mobile styles */ }

/* Desktop: Grid layout */
.hidden sm:block { /* Desktop styles */ }
```

### 5. **AI Magyarázatok**

#### Komponens: `PolicyNotesTooltip.tsx`
- **Funkciók:** Hover/click tooltip, AI magyarázatok
- **Adatforrás:** `useECBPolicyNotes` hook
- **UX:** Elegáns tooltip, loading states

#### Hook: `useECBPolicyNotes`
- **Endpoint:** `/api/v1/macro/ecb/policy-notes`
- **Funkciók:** Policy notes, AI magyarázatok

## 📁 Fájlstruktúra

```
shared/frontend/src/
├── components/financehub/macro/
│   ├── MacroKPIDashboard.tsx      # KPI Dashboard
│   ├── YieldCurveLiteCard.tsx     # Mobil optimalizált yield curve
│   └── PolicyNotesTooltip.tsx     # AI magyarázatok
├── hooks/macro/
│   ├── useECBInflation.ts         # Inflációs adatok
│   ├── useECBMonetaryAggregates.ts # Monetáris aggregátumok
│   └── useECBPolicyNotes.ts       # Policy notes
└── lib/
    ├── api.ts                     # API utility functions
    └── utils.ts                   # Utility functions

scripts/
└── auto_sync_matrix_generator.py  # Automatikus mátrix generátor

docs/
├── ENDPOINT_MATRIX.md             # Szinkronizációs mátrix
├── MACRO_ENDPOINT_SYNC_MATRIX.md # Részletes mátrix
└── API_DOCUMENTATION.md           # API dokumentáció
```

## 🔧 Fejlesztési Workflow

### 1. **Új Endpoint Hozzáadása**

1. **Backend:** Endpoint implementálása
2. **Frontend:** Hook létrehozása
3. **UI:** Komponens fejlesztése
4. **Dokumentáció:** Mátrix automatikus frissítése

### 2. **Mobil Optimalizáció**

1. **Responsive Design:** Tailwind breakpoints
2. **Touch Interface:** Nagyobb érintőfelület
3. **Performance:** 60fps animációk
4. **Testing:** Mobil eszközökön tesztelés

### 3. **AI Magyarázatok**

1. **Policy Notes:** Backend endpoint
2. **Tooltip:** Frontend komponens
3. **Relevance:** Adatpont-specifikus magyarázatok
4. **UX:** Elegáns tooltip design

## 🎯 Quality Gates

### **Code Quality:**
- TypeScript strict mode
- ESLint rules
- Component size ≤ 160 lines
- Test coverage ≥ 80%

### **Performance:**
- Lighthouse score ≥ 90
- 60fps animations
- Skeleton loaders < 200ms
- Mobile-first design

### **UX Standards:**
- Premium, minimalista design
- Consistent dark/light theme
- Touch-friendly mobile interface
- Elegant tooltips and animations

## 🚀 Deployment

### **Backend:**
```bash
cd modules/financehub/backend
export PYTHONPATH="$PYTHONPATH:$(pwd)"
python3 -m uvicorn main:app --reload --port 8084 --host 0.0.0.0
```

### **Frontend:**
```bash
cd shared/frontend
npm run dev
```

### **API Dokumentáció:**
- Swagger UI: http://localhost:8084/docs
- ReDoc: http://localhost:8084/redoc

## 📊 Monitoring

### **Szinkronizációs Mátrix:**
- Automatikus frissítés CI/CD-ben
- PR kommentek változásokról
- Audit eredmények dokumentálva

### **Performance:**
- Lighthouse CI integráció
- Bundle size monitoring
- Mobile performance tracking

## 🔍 Troubleshooting

### **Common Issues:**

1. **Hook Import Errors:**
   - Ellenőrizd a `@/hooks/macro/` path alias-t
   - Frissítsd a `tsconfig.json`-t

2. **Backend Connection:**
   - Ellenőrizd a `PYTHONPATH`-et
   - Indítsd el a backendet: `python3 -m uvicorn main:app --port 8084`

3. **Mobile Issues:**
   - Teszteld különböző screen size-okon
   - Ellenőrizd a touch events-et

4. **Matrix Sync:**
   - Futtasd: `python3 scripts/auto_sync_matrix_generator.py`
   - Ellenőrizd a CI/CD workflow-t

## 📞 Support

### **Fejlesztői Kapcsolat:**
- **Technical Lead:** [Contact Information]
- **Frontend Team:** [Contact Information]
- **Backend Team:** [Contact Information]

### **Dokumentáció:**
- **API Docs:** http://localhost:8084/docs
- **Architecture:** `AEVOREX_ARCHITECTURE_MASTER_DOCUMENTATION.md`
- **Sync Matrix:** `docs/ENDPOINT_MATRIX.md`

---

**Last Updated:** 2025-07-25  
**Version:** 1.0  
**Status:** ✅ Production Ready 