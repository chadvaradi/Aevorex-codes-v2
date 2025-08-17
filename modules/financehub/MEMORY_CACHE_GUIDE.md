# FinanceHub Memory Cache Guide

## 🎯 Áttekintés

A FinanceHub optimalizált in-memory cache módot használ napi 1-10x használatra. Ez **teljes körű Redis alternatíva** zero external dependencies-szel.

### Miért Memory Cache?

- ✅ **Zero setup cost** - Nincs Redis szerver vagy konfiguráció
- ✅ **Gyorsabb** - Localhost memory access vs. network calls  
- ✅ **Egyszerűbb** - Egy process, egy parancs indítás
- ✅ **Költséghatékony** - $0/hó vs $15-50/hó Redis managed service
- ✅ **Elegendő** - Napi 1-100x használatra optimális

## 🚀 Gyors Indítás

### 1. Backend Indítása
```bash
cd modules/financehub
chmod +x start_memory_cache.sh
./start_memory_cache.sh
```

### 2. Celery Worker (Opcionális)
```bash
chmod +x start_celery_memory.sh
./start_celery_memory.sh worker
```

### 3. Celery Beat Scheduler (Opcionális)
```bash
# Külön terminalban:
./start_celery_memory.sh beat
```

### 4. Minden Egyben
```bash
# Worker + Beat együtt:
./start_celery_memory.sh both
```

## 📊 Endpoint Tesztelés

```bash
# Health check
curl http://localhost:8084/health

# Fixing rates intervals
curl http://localhost:8084/api/v1/macro/fixing-rates/intervals

# Rate changes (első futtatás után lesz adat)
curl http://localhost:8084/api/v1/macro/fixing-rates/changes
```

## ⚙️ Konfiguráció

### Environment Variables

```bash
# Memory cache aktiválás (default)
export FINANCEHUB_CACHE_MODE=memory

# Redis használat (advanced, külső Redis szerverre)
export FINANCEHUB_CACHE_MODE=redis
```

### Cache Behavior

| Funkció | Memory Cache | Redis Cache |
|---------|--------------|-------------|
| **TTL support** | ❌ Ignored (egyszerűsítés) | ✅ Full support |
| **Persistence** | ❌ RAM only | ✅ Disk backup |
| **Multi-worker** | ❌ Process-local | ✅ Shared cache |
| **Performance** | ✅ ~0.1ms | ⚠️ ~1-5ms |
| **Setup** | ✅ Zero config | ❌ Redis setup |

## 🔄 Scaling Strategy

### Phase 1: Memory Cache (Jelenlegi)
- **Felhasználók**: 1-10 napi
- **Cache size**: < 100MB
- **Uptime**: Development/staging

### Phase 2: Memory + Persistence
- **Felhasználók**: 10-50 napi  
- **Megoldás**: SQLite cache table addon
- **Migration**: `FINANCEHUB_CACHE_MODE=sqlite`

### Phase 3: Redis Migration
- **Felhasználók**: 50+ concurrent
- **Megoldás**: External Redis cluster
- **Migration**: `FINANCEHUB_CACHE_MODE=redis`

## 🐛 Troubleshooting

### Redis Error (`_AsyncRESP2Parser`)
**Megoldás**: Memory cache már aktív, hiba eltűnik automatikusan.

### Cache Miss After Restart
**Normal**: Memory cache RAM-based, restart után üres.
**Megoldás**: Első API call újratölti.

### Celery Task Failures
**Ellenőrizd**: `FINANCEHUB_CACHE_MODE=memory` minden terminálban.
**Tipp**: `export` parancs hatásos csak az aktuális session-ben.

## 📈 Monitoring

```bash
# Cache méret ellenőrzés (Python)
python3 -c "
from utils.cache_service import CacheService
import asyncio
async def check():
    cache = CacheService()
    keys = await cache.keys('*')
    print(f'Cached keys: {len(keys)}')
    for k in keys[:5]:  # First 5
        print(f'  {k}')
asyncio.run(check())
"
```

## 🔧 Development

### Cache Clear
```python
# Programmatically
cache = CacheService()
await cache.close()  # Clears all data
```

### Custom TTL (Future Enhancement)
```python
# Jelenleg TTL ignored in memory mode
# Feature request: https://github.com/project/issues/XXX
```

---

**✅ Eredmény**: Zero-Redis FinanceHub environment napi 1-2x használatra optimalizálva! 