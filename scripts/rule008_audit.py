#!/usr/bin/env python3
"""Rule #008 audit script – ensures repo/document sync & component size limits.

This is a **placeholder** (MVP) that currently performs three fast checks so CI
can fail early. Full feature parity with the manual checklist can be expanded
incrementally.

Checks implemented:
1. Ensures no frontend files exceed the component_max_loc defined in overlay.
2. Verifies that every endpoint under modules/financehub/backend/api/endpoints
   is present in docs/API_DOCUMENTATION.md (basic string match).
3. Confirms there is no code under deprecated path modules/financehub/frontend.

Exit status 0 on success, 1 on any failure.
"""
from __future__ import annotations
import pathlib
import sys
import yaml

REPO = pathlib.Path(__file__).resolve().parent.parent
OVERLAY_PATH = REPO / "module_overlays" / "financehub.yaml"
DOC_PATH = REPO / "docs" / "API_DOCUMENTATION.md"
BACKEND_ENDPOINTS_DIR = REPO / "modules" / "financehub" / "backend" / "api" / "endpoints"
DEPRECATED_FE_PATH = REPO / "modules" / "financehub" / "frontend"


def _load_overlay():
    data = yaml.safe_load(OVERLAY_PATH.read_text())
    return data.get("module_overlay", {})


def check_component_size(max_loc: int) -> bool:
    src_dir = REPO / "shared" / "frontend" / "src"
    violations = []
    for path in src_dir.rglob("*.tsx"):
        # Skip test files and test directories from LOC enforcement
        rel_path_str = str(path.relative_to(REPO))
        if "/__tests__/" in rel_path_str or rel_path_str.endswith(('.test.tsx', '.spec.tsx')):
            continue
        try:
            lines = path.read_text(encoding="utf-8").splitlines()
        except Exception:
            continue
        if len(lines) > max_loc:
            violations.append((path, len(lines)))
    if violations:
        print("Rule008-FAIL: Components exceeding line limit:")
        for p, n in violations:
            print(f"  {p.relative_to(REPO)} – {n} lines (limit {max_loc})")
        return False
    return True


def check_deprecated_frontend() -> bool:
    if DEPRECATED_FE_PATH.exists():
        files = list(DEPRECATED_FE_PATH.rglob("*.tsx"))
        if files:
            print(f"Rule008-FAIL: Deprecated frontend path contains {len(files)} files.")
            return False
    return True


def check_endpoint_docs_sync() -> bool:
    if not DOC_PATH.exists():
        print("Rule008-WARN: API doc not found – skipping sync check")
        return True
    doc_text = DOC_PATH.read_text(encoding="utf-8")
    missing = []
    for py in BACKEND_ENDPOINTS_DIR.rglob("*.py"):
        name = py.name
        # Skip dunder, private or helper modules, and currently internal submodules not exposed at API gateway
        if name in {"__init__.py", "models.py", "utils.py"} or name.startswith("_"):
            continue
        rel_parts = py.relative_to(REPO).parts
        if "macro" in rel_parts and "ecb" in rel_parts:
            # ECB sub-modules are aggregated under /macro endpoints – skip individual files
            continue
        if "crypto" in rel_parts:
            # Crypto module not yet public – skip
            continue
        if "stock_header" in rel_parts:
            continue
        # Consider files that define a FastAPI router (heuristic)
        try:
            text = py.read_text(encoding="utf-8")
        except Exception:
            continue
        if "APIRouter(" not in text and "router = APIRouter" not in text and "router = FastAPI" not in text:
            # Helper file – skip
            continue
        rel = py.relative_to(REPO)
        endpoint_hint = "/" + "/".join(rel.parts[-3:]).replace(".py", "")
        if endpoint_hint not in doc_text:
            missing.append(endpoint_hint)
    if missing:
        print("Rule008-FAIL: Following endpoints not documented:")
        for e in missing:
            print("  " + e)
        return False
    return True


def main():
    overlay = _load_overlay()
    max_loc = overlay.get("component_max_loc", 180)

    ok = True
    ok &= check_component_size(max_loc)
    ok &= check_deprecated_frontend()
    ok &= check_endpoint_docs_sync()

    if not ok:
        sys.exit(1)
    print("Rule #008 audit passed ✅")


if __name__ == "__main__":
    main() 