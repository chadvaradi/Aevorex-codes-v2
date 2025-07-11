---
name: "Aevorex Pull Request"
about: "Kérjük, töltsd ki az alábbi sablont – üzleti és technikai leírás szükséges. (EN key-phrases in brackets)"
---

## 📋 PM-barát összegzés (max 5 mondat) / PM Summary (≤5 sentences)
1. **Mi változott? / What changed?**
2. **Miért? / Why?**
3. **Üzleti hatás / Business impact**
4. **Risk flag**: <!-- low / medium / high -->
5. **Release note?** <!-- igen / nem -->

## 🖼️ UX Snapshot / Before-After Visuals
- [ ] GIF vagy screenshot (világos + sötét téma)
- [ ] 60s Loom / Screen-rec videó (ha UI változás)

## ✅ Checklist
- [ ] `explain_like_i_m_pm` szabály teljesítve (5-mondatos összefoglaló)
- [ ] `ask_me_first` limit nem lépte túl a 4 órás becslést (vagy jóváhagyva)
- [ ] `ux_snapshot` feltöltve (ha releváns)
- [ ] `risk_flag` címke beállítva (ha pénzügyi/compliance adatot érint)
- [ ] Unit / Integration / E2E tesztek zöldek
- [ ] ESLint & Ruff 0 error
- [ ] Lighthouse ≥ 90

## 📈 Metric Impact Estimate
| Metrika            | + / – | Megjegyzés |
|--------------------|-------|------------|
| Lighthouse Perf    |       |            |
| API latencia (p95) |       |            |
| Bundle méret       |       |            |

## 🌐 Kapcsolódó issue(k) / Related issues
Fixes #

## 📜 Döntési napló / Decision log entry (ha szükséges)
- [] Entry added to `docs/decision_log.md` (if major change) 