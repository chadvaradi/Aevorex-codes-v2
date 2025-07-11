"""Strict scan – FinanceHub endpoint compliance checker (Rule #008).

Enhancements (2025-07-12):
1. Canonicalise paths – remove trailing slashes so `/bubor` and `/bubor/` nevet count twice.
2. Deduplicate alias endpoints (see `ALIAS_MAP`).
3. Skip system endpoints (`/metrics`, `/health`) from business stats.
4. Treat 204 No-Content as compliant (`ok_full`).
5. Timestamped output file name (`audits/strict_scan_<YYYY-MM-DD>.json`).
"""

from __future__ import annotations

import json
import os
import sys
import time
import requests
from datetime import date

os.environ["FINANCEHUB_CACHE_MODE"] = "memory"
base = "http://127.0.0.1:8084"
for _ in range(60):
    try:
        if requests.get(base + "/openapi.json", timeout=3).status_code == 200:
            break
    except Exception:
        time.sleep(1)
else:
    print("Backend not ready", file=sys.stderr)
    sys.exit(1)

spec = requests.get(base + "/openapi.json").json()

# ---------------------------------------------------------------------------
# Configuration – tweak here if alias rules change
# ---------------------------------------------------------------------------

# Alias mapping – key is alias path, value is canonical path (both **without**
# leading API prefix). During counting we collapse alias hits onto canonical.
ALIAS_MAP = {
    "/macro/yield-curve/": "/macro/ecb/yield-curve",
    "/macro/rates/all": "/macro/ecb/rates",  # legacy alias
}

# System-level endpoints to ignore from stats (health-check, metrics, docs …)
SYSTEM_ENDPOINT_PREFIXES = (
    "/metrics",
    "/health",
    "/openapi",
    "/docs",
    "/redoc",
)

placeholder_map = {"ticker": "AAPL", "ticker_symbol": "AAPL", "tickerId": "AAPL", "pair": "EURUSD", "source": "ecb", "dataset": "overview", "symbol": "AAPL"}
summary = {
    k: 0
    for k in (
        "ok_full",
        "error_payload",
        "empty_200",
        "4xx",
        "5xx",
        "other",
    )
}

# Seen set to deduplicate alias / trailing-slash variants
_seen: set[tuple[str, str]] = set()
details = []

for path, methods in spec.get("paths", {}).items():
    for method in methods.keys():
        if path.startswith(SYSTEM_ENDPOINT_PREFIXES):
            continue

        # Canonicalise path: remove trailing slash (except root), apply alias map
        canonical_path = path[:-1] if path != "/" and path.endswith("/") else path
        canonical_path = ALIAS_MAP.get(canonical_path, canonical_path)

        # Deduplicate same method+canonical path
        key = (canonical_path, method.lower())
        if key in _seen:
            continue
        _seen.add(key)

        resolved = canonical_path
        for k, v in placeholder_map.items():
            resolved = resolved.replace("{" + k + "}", v)
        url = base + resolved
        try:
            if method.lower() == "get":
                resp = requests.get(url, timeout=15)
            else:
                payload = {"message": "test"} if "chat" in path else {}
                resp = requests.post(url, json=payload, timeout=15)
        except Exception as exc:
            summary["other"] += 1
            details.append({"path": path, "method": method, "result": "exception", "error": str(exc)})
            continue

        body_text = resp.text.strip()
        entry = {"path": path, "method": method, "status": resp.status_code}
        if resp.status_code == 200:
            if not body_text:
                summary["empty_200"] += 1
                entry["result"] = "empty_200"
            else:
                try:
                    data = resp.json()
                    if isinstance(data, dict) and data.get("status") in ("error", "no_data", "deprecated"):
                        summary["error_payload"] += 1
                        entry["result"] = "error_payload"
                    else:
                        summary["ok_full"] += 1
                        entry["result"] = "ok_full"
                except Exception:
                    summary["ok_full"] += 1
                    entry["result"] = "ok_full"
        elif resp.status_code == 204:
            summary["ok_full"] += 1
            entry["result"] = "ok_full"
        elif 400 <= resp.status_code < 500:
            summary["4xx"] += 1
            entry["result"] = "4xx"
        elif resp.status_code >= 500:
            summary["5xx"] += 1
            entry["result"] = "5xx"
        else:
            summary["other"] += 1
            entry["result"] = "other"
        details.append(entry)

report = {"summary": summary, "details": details}
os.makedirs("audits", exist_ok=True)
filename = f"audits/strict_scan_{date.today().isoformat()}.json"
with open(filename, "w") as fh:
    json.dump(report, fh, indent=2)

# Human-readable summary to stdout
print(json.dumps(summary, indent=2))
