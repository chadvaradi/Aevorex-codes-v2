# 🔄 Macro Endpoint Sync Matrix - Használati Útmutató

## 📋 Áttekintés

A `update_macro_sync_matrix.py` script automatikusan frissíti a FinanceHub macro/ECB endpointok szinkronizációs mátrix dokumentációját. Ez a script:

1. **Backend endpointok szkennelése** - Minden macro/ECB endpoint modul felismerése
2. **Frontend hook-ok szkennelése** - Hook implementációk és státuszok ellenőrzése
3. **UI komponensek szkennelése** - React komponensek és bekötések felismerése
4. **Audit eredmények betöltése** - Legfrissebb backend audit adatok
5. **Dokumentáció frissítése** - Automatikus mátrix és progress report generálás

## 🚀 Használat

### Alapvető futtatás

```bash
# A repository gyökérkönyvtárából
python scripts/update_macro_sync_matrix.py
```

### Automatikus frissítés (cron job)

```bash
# Napi frissítés reggel 9:00-kor
0 9 * * * cd /path/to/aevorex && python scripts/update_macro_sync_matrix.py
```

### CI/CD integráció

```yaml
# .github/workflows/macro-sync.yml
name: Macro Sync Matrix Update

on:
  push:
    paths:
      - 'modules/financehub/backend/api/endpoints/macro/**'
      - 'shared/frontend/src/hooks/macro/**'
      - 'shared/frontend/src/components/financehub/macro/**'
  schedule:
    - cron: '0 9 * * *'  # Napi frissítés

jobs:
  update-matrix:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      - name: Update Macro Sync Matrix
        run: python scripts/update_macro_sync_matrix.py
      - name: Commit changes
        run: |
          git config --local user.email "action@github.com"
          git config --local user.name "GitHub Action"
          git add docs/MACRO_ENDPOINT_SYNC_MATRIX.md
          git add docs/MACRO_PROGRESS_REPORT.md
          git commit -m "Auto-update macro sync matrix" || exit 0
          git push
```

## 📊 Kimeneti fájlok

### 1. MACRO_ENDPOINT_SYNC_MATRIX.md
A fő dokumentáció, amely tartalmazza:
- **Összefoglaló statisztikák** - Backend, frontend, UI komponensek száma
- **Részletes szinkronizációs mátrix** - Minden endpoint állapota
- **Fejlesztési prioritások** - Kritikus, magas, közepes prioritású feladatok
- **Progressz követés** - Heti frissítések és metrikák

### 2. MACRO_PROGRESS_REPORT.md
Rövid progressz jelentés:
- **Összefoglaló metrikák** - Százalékos teljesítmény
- **Kritikus hiányzó elemek** - Azonnali fejlesztendő funkciók
- **Magas prioritású feladatok** - 1-2 hetes fejlesztések

## 🔧 Konfiguráció

### Script konfiguráció módosítása

```python
# scripts/update_macro_sync_matrix.py
# Konfigurációs változók a fájl elején

REPO_ROOT = Path(__file__).parent.parent
DOCS_DIR = REPO_ROOT / "docs"
BACKEND_DIR = REPO_ROOT / "modules" / "financehub" / "backend"
FRONTEND_DIR = REPO_ROOT / "shared" / "frontend" / "src"
```

### Egyéni kategóriák hozzáadása

```python
def _categorize_endpoints(self) -> Dict:
    categories = {
        "ecb_policy_rates": [],
        "ecb_yield_curve": [],
        # ... új kategória hozzáadása
        "ecb_custom": [],  # Új kategória
    }
    
    for endpoint_name, endpoint_data in self.backend_endpoints.items():
        # ... meglévő kategorizálás
        elif "custom" in endpoint_name:  # Új feltétel
            categories["ecb_custom"].append(endpoint_name)
    
    return categories
```

## 📈 Metrikák és KPI-k

### Backend Metrikák
- **Endpoint Coverage**: 100% (minden backend endpoint aktív)
- **Success Rate**: 96.8% (60/62 endpoint OK)
- **Response Time**: < 500ms (95th percentile)

### Frontend Metrikák
- **Hook Coverage**: 88.6% (31/35 endpoint)
- **UI Component Coverage**: 31.4% (11/35 endpoint)
- **Overall Integration**: 80% (28/35 endpoint)

### Progressz Célok
- **Hét 1**: 80% → 86% (2 új hook + 2 új komponens)
- **Hét 2**: 86% → 91% (2 új hook + 2 új komponens)
- **Hét 3**: 91% → 94% (1 új hook + 1 új komponens)
- **Hét 4**: 94% → 100% (4 új hook + 4 új komponens)

## 🐛 Hibaelhárítás

### Gyakori problémák

#### 1. "No module named 'pathlib'"
```bash
# Python 3.4+ szükséges
python --version
# Ha < 3.4, frissítsd Python-t
```

#### 2. "Permission denied"
```bash
# Futtatási jogosultság
chmod +x scripts/update_macro_sync_matrix.py
```

#### 3. "File not found"
```bash
# Ellenőrizd a könyvtár struktúrát
ls -la modules/financehub/backend/api/endpoints/macro/
ls -la shared/frontend/src/hooks/macro/
```

#### 4. "Regex pattern not found"
```bash
# Debug mód bekapcsolása
python -u scripts/update_macro_sync_matrix.py 2>&1 | tee debug.log
```

### Debug mód

```python
# scripts/update_macro_sync_matrix.py
import logging

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Debug üzenetek hozzáadása
logger.debug(f"Scanning file: {py_file}")
```

## 🔄 Automatizálás

### Git Hooks

```bash
# .git/hooks/pre-commit
#!/bin/bash
python scripts/update_macro_sync_matrix.py
git add docs/MACRO_ENDPOINT_SYNC_MATRIX.md
git add docs/MACRO_PROGRESS_REPORT.md
```

### IDE Integráció

#### VS Code
```json
// .vscode/tasks.json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Update Macro Sync Matrix",
      "type": "shell",
      "command": "python",
      "args": ["scripts/update_macro_sync_matrix.py"],
      "group": "build",
      "presentation": {
        "echo": true,
        "reveal": "always",
        "focus": false,
        "panel": "shared"
      }
    }
  ]
}
```

#### PyCharm
1. **File** → **Settings** → **Tools** → **External Tools**
2. **Add** új tool:
   - **Name**: Update Macro Sync Matrix
   - **Program**: `python`
   - **Arguments**: `scripts/update_macro_sync_matrix.py`
   - **Working directory**: `$ProjectFileDir$`

## 📞 Támogatás

### Kapcsolattartás
- **Fejlesztői csapat**: [Contact Information]
- **Dokumentáció**: [Link to docs]
- **Issues**: [GitHub Issues]

### Közreműködés
1. Fork a repository-t
2. Hozz létre egy feature branch-et
3. Implementáld a változtatásokat
4. Futtasd a script-et: `python scripts/update_macro_sync_matrix.py`
5. Commit és push a változtatásokat
6. Nyiss egy Pull Request-et

---

**Utolsó frissítés:** 2025-01-26  
**Verzió:** 1.0  
**Karbantartó:** Aevorex Development Team 