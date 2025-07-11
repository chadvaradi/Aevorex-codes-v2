"""Generate endpoint manifest (router, path, method, handler, LOC).
Run: python scripts/gen_endpoint_manifest.py
"""
from __future__ import annotations

import json
import re
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parents[1]
ENDPOINTS_DIR = BASE_DIR / "modules" / "financehub" / "backend" / "api" / "endpoints"
MANIFEST_PATH = BASE_DIR / "endpoint_manifest.json"

pattern = re.compile(r"@router\.(get|post|put|delete|patch)\(([^)]*)\)")

manifest: list[dict] = []

for py_file in ENDPOINTS_DIR.rglob("*.py"):
    try:
        content = py_file.read_text(encoding="utf-8")
    except Exception:
        continue
    loc = len(content.splitlines())
    for m in pattern.finditer(content):
        method = m.group(1).upper()
        params = m.group(2)
        # crude path extraction – first positional string arg
        path_match = re.search(r"\s*['\"]([^'\"]+)['\"]", params)
        if not path_match:
            continue
        raw_path = path_match.group(1)
        # build router path: file path relative
        manifest.append(
            {
                "method": method,
                "path": raw_path,
                "file": str(py_file.relative_to(BASE_DIR)),
                "loc": loc,
                "status": "unknown",  # will be enriched later
                "tests_coverage": 0,
            }
        )

# deduplicate (method+path)
unique = {}
for ep in manifest:
    key = (ep["method"], ep["path"])
    if key not in unique:
        unique[key] = ep

final_manifest = list(unique.values())

MANIFEST_PATH.write_text(json.dumps(final_manifest, indent=2))
print(f"Manifest written to {MANIFEST_PATH.relative_to(BASE_DIR)} – {len(final_manifest)} endpoints") 