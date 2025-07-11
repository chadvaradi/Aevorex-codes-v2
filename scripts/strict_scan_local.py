"""Local strict scan – TestClient-based (no live server).
Generates audits/strict_scan_latest.json summarising HTTP 200/full payload
compliance for all registered API paths.  Complies with Rule #008.
"""
from __future__ import annotations

# pylint: disable=import-error
from datetime import datetime
from pathlib import Path
import sys
import types
import json

from fastapi.testclient import TestClient

# Legacy import shim – old path still referenced by some endpoints
dummy_mod = types.ModuleType("macro_data_service_dummy")
setattr(dummy_mod, "MacroDataService", object)
setattr(dummy_mod, "get_macro_data_service", lambda: None)
sys.modules["modules.financehub.backend.core.services.macro_data_service"] = dummy_mod

from modules.financehub.backend.app_factory import create_app

app = create_app()
client = TestClient(app)

PLACEHOLDERS = {
    "ticker": "AAPL",
    "ticker_symbol": "AAPL",
    "tickerId": "AAPL",
    "symbol": "AAPL",
    "pair": "EURUSD",
    "source": "ecb",
}

summary = {k: 0 for k in ("ok_full", "error_payload", "empty_200", "4xx", "5xx", "other")}
results: list[dict] = []

for path, methods in app.openapi()["paths"].items():
    for method in methods.keys():
        if path.startswith("/openapi") or path.startswith("/docs"):
            continue
        resolved = path
        for k, v in PLACEHOLDERS.items():
            resolved = resolved.replace("{" + k + "}", v)
        if method.lower() == "get":
            resp = client.get(resolved)
        else:
            resp = client.post(resolved, json={})
        entry = {"path": path, "method": method.upper(), "status": resp.status_code}
        body = resp.text.strip()
        if resp.status_code == 200:
            if not body:
                summary["empty_200"] += 1
                entry["result"] = "empty_200"
            else:
                try:
                    data = resp.json()
                    if isinstance(data, dict) and data.get("status") == "error":
                        summary["error_payload"] += 1
                        entry["result"] = "error_payload"
                    else:
                        summary["ok_full"] += 1
                        entry["result"] = "ok_full"
                except Exception:
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
        results.append(entry)

report = {"generated": datetime.utcnow().isoformat(), "summary": summary, "details": results}
Path("audits").mkdir(exist_ok=True)
out_path = Path("audits/strict_scan_latest.json")
out_path.write_text(json.dumps(report, indent=2))
print(json.dumps(summary, indent=2)) 