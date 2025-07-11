"""Endpoint audit runner (simplified). Usage: python scripts/run_endpoint_audit.py --strict
Generates endpoint_manifest.json and Markdown summary in report/.
Exit code 1 if placeholder/missing/duplicate or LOC >160 detected.
"""
from __future__ import annotations

import argparse
import json
import re
import sys
from datetime import datetime
from pathlib import Path
import glob
from collections import defaultdict

BASE_DIR = Path(__file__).resolve().parents[1]
API_DIR = BASE_DIR / "modules" / "financehub" / "backend" / "api" / "endpoints"
REPORT_DIR = BASE_DIR / "report"
REPORT_DIR.mkdir(exist_ok=True)

MANIFEST_PATH = BASE_DIR / "endpoint_manifest.json"

PLACEHOLDER_KEYWORDS = {"placeholder", "TODO", "legacy"}

# Compile decorator regex
DECORATOR_RE = re.compile(r"\s*@router\.(get|post|put|delete|patch)\((.*?)\)", re.DOTALL)
PATH_RE = re.compile(r"[\'\"]([^\'\"]+)[\'\"]")

AUDIT_GLOB = BASE_DIR / "audits" / "strict_scan_*.json"


def canonical_path(raw: str) -> str:
    """Return path with trailing slash except root or param-only."""
    if raw == "/":
        return "/"
    if raw.endswith("/"):
        return raw
    return f"{raw}/"


def load_strict_scan() -> dict[tuple[str, str], dict]:
    """Load latest strict_scan json, return mapping (method,path)->payload."""
    files = sorted(glob.glob(str(AUDIT_GLOB)))
    if not files:
        return {}
    latest = files[-1]
    try:
        data = json.loads(Path(latest).read_text(encoding="utf-8"))
    except Exception:
        return {}
    endpoint_map: dict[tuple[str, str], dict] = {}
    for item in data:
        if not isinstance(item, dict):
            continue
        m = item.get("method", "").upper()
        p = canonical_path(item.get("path", ""))
        if m and p:
            endpoint_map[(m, p)] = item
    return endpoint_map


def scan_endpoints() -> tuple[list[dict], list[dict]]:
    """Returns (unique_entries, duplicates)"""
    manifest: list[dict] = []
    duplicates: list[dict] = []

    for py in API_DIR.rglob("*.py"):
        try:
            content = py.read_text(encoding="utf-8")
        except Exception:
            continue
        loc = len(content.splitlines())
        placeholder_hint = any(kw in content.lower() for kw in PLACEHOLDER_KEYWORDS)
        for match in DECORATOR_RE.finditer(content):
            method = match.group(1).upper()
            path_match = PATH_RE.search(match.group(2))
            if not path_match:
                continue
            path_raw = path_match.group(1)
            path = canonical_path(path_raw)
            entry = {
                "method": method,
                "path": path,
                "file": str(py.relative_to(BASE_DIR)),
                "loc": loc,
                "placeholder_hint": placeholder_hint,
                "status": "unknown",
            }
            manifest.append(entry)

    unique: dict[tuple[str, str], dict] = {}
    for ep in manifest:
        key = (ep["method"], ep["path"].rstrip("/"))
        if key in unique:
            ep["status"] = "duplicate"
            unique[key]["status"] = "duplicate"
            duplicates.append(ep)
        else:
            unique[key] = ep
    return list(unique.values()), duplicates


def categorize(entries: list[dict], audit_map: dict[tuple[str, str], dict]) -> None:
    for ep in entries:
        if ep["status"] == "duplicate":
            continue  # already marked
        if ep["placeholder_hint"] or "placeholder" in ep["path"]:
            ep["status"] = "placeholder"
            continue
        if "crypto" in ep["path"]:
            ep["status"] = "missing"  # still not implemented
            continue
        audit_payload = audit_map.get((ep["method"], ep["path"]))
        if audit_payload:
            code = audit_payload.get("status_code", 200)
            if code == 200 and audit_payload.get("payload_ok", True):
                ep["status"] = "operational"
            elif code == 200:
                ep["status"] = "degraded"
            elif code == 404:
                ep["status"] = "missing"
            else:
                ep["status"] = "degraded"
        else:
            ep["status"] = "unknown"


def write_report(entries: list[dict], duplicates: list[dict]):
    date_str = datetime.utcnow().strftime("%Y-%m-%d")
    report_md = REPORT_DIR / f"endpoint_audit_{date_str}.md"

    counts = defaultdict(int)
    for ep in entries:
        counts[ep["status"]] += 1

    with report_md.open("w", encoding="utf-8") as fh:
        fh.write(f"# Endpoint Audit Report – {date_str}\n\n")
        fh.write("| Status | Count |\n|---|---|\n")
        for k, v in sorted(counts.items()):
            fh.write(f"| {k} | {v} |\n")
        fh.write("\n## Details\n")
        for ep in sorted(entries, key=lambda x: (x["status"], x["path"])):
            fh.write(f"* `{ep['method']} {ep['path']}` – {ep['status']} ({ep['file']}, LOC {ep['loc']})\n")
        if duplicates:
            fh.write("\n### Duplicates detected\n")
            for d in duplicates:
                fh.write(f"* `{d['method']} {d['path']}` in {d['file']}\n")

    print(f"Markdown report written to {report_md.relative_to(BASE_DIR)}")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--strict", action="store_true", help="fail on problems")
    args = parser.parse_args()

    audit_map = load_strict_scan()

    manifest, duplicates = scan_endpoints()
    categorize(manifest, audit_map)

    MANIFEST_PATH.write_text(json.dumps(manifest, indent=2))
    print(f"Manifest saved: {MANIFEST_PATH.relative_to(BASE_DIR)} ({len(manifest)} endpoints)")

    write_report(manifest, duplicates)

    if args.strict:
        fail = any(ep["status"] in {"placeholder", "missing", "duplicate"} or ep["loc"] > 160 for ep in manifest)
        if fail:
            print("Strict mode: problems detected – exiting 1")
            sys.exit(1)
    sys.exit(0)


if __name__ == "__main__":
    main() 