#!/usr/bin/env python
"""Fail-fast guard: exit 1, ha bármelyik kritikus API kulcs hiányzik.
Futtasd CI-ben vagy docker entrypoint előtt: `python scripts/check_required_env.py`
"""
import sys
from modules.financehub.backend.config import settings

CRITICAL_KEYS = [
    "EODHD",
    "FMP",
    "OPENROUTER",
]

missing: list[str] = []
for key in CRITICAL_KEYS:
    secret = getattr(settings.API_KEYS, key, None)
    if not secret or not secret.get_secret_value().strip():
        missing.append(key)

if missing:
    print(f"❌ Missing critical API keys: {', '.join(missing)}", file=sys.stderr)
    sys.exit(1)

print("✅ All critical API keys present.") 