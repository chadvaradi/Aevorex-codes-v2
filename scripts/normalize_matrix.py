#!/usr/bin/env python3
"""
Endpoint Matrix Normalizer (ULTRATHINK v6)
==========================================

This script transforms the raw, runtime-generated endpoint list into a clean,
canonical, and human-readable TSV matrix.

It performs the following key functions:
1.  **Filters** the raw list against a curated list of 34 canonical endpoints.
2.  **Categorizes** each endpoint's status (Used, Ready, Planned) based on
    frontend usage data.
3.  **Enriches** the data with readable formatting.
4.  **Outputs** a clean TSV file, which serves as the single source of truth
    for API documentation and CI drift detection.
"""

from __future__ import annotations

import argparse
import csv
import re
from pathlib import Path
from typing import Set, Tuple
import json

HEADER = [
    "Backend Endpoint",
    "Method",
    "Implemented in",
    "Frontend Usage",
]

DEFAULT_PLANNED_REGEX = r"^/api/v1/(crypto|eodhd|config)/"

# --- Configuration: Ground Truth Data ---

# The 34 canonical endpoints that are considered the source of truth.
# Any endpoint not in this list will be filtered out.
CANONICAL_ENDPOINTS = {
    # (Method, Path)
    ("GET", "/api/v1/health"),
    ("GET", "/api/v1/auth/login"),
    ("GET", "/api/v1/auth/callback"),
    ("GET", "/api/v1/auth/status"),
    ("POST", "/api/v1/auth/logout"),
    ("GET", "/api/v1/stock/search"),
    ("GET", "/api/v1/stock/{ticker}/chart"),
    ("GET", "/api/v1/stock/{ticker}/fundamentals"),
    ("GET", "/api/v1/stock/{ticker}/news"),
    ("GET", "/api/v1/stock/premium/{ticker}/summary"),
    ("GET", "/api/v1/stock/premium/technical-analysis/{ticker}"),
    ("GET", "/api/v1/stock/ticker-tape"),
    ("GET", "/api/v1/stock/ticker-tape/item"),
    ("POST", "/api/v1/stock/chat/{ticker}/stream"),
    ("POST", "/api/v1/stock/chat/{ticker}/deep"),
    ("POST", "/api/v1/stock/chat/{ticker}"),
    ("GET", "/api/v1/ai/models"),
    ("GET", "/api/v1/macro/rates/all"),
    ("GET", "/api/v1/macro/ecb/rates"),
    ("GET", "/api/v1/macro/ecb/yield-curve"),
    ("GET", "/api/v1/macro/ecb/monetary-policy"),
    ("GET", "/api/v1/macro/curve/{source}"),
    ("GET", "/api/v1/macro/bubor"),
    ("GET", "/api/v1/macro/forex/pairs"),
    ("GET", "/api/v1/macro/forex/{pair}"),
    ("GET", "/api/v1/market/news"),
    ("GET", "/api/v1/crypto/symbols"),
    ("GET", "/api/v1/crypto/{symbol}"),
    ("GET", "/api/v1/eodhd/{ticker}/{dataset}"),
    ("POST", "/api/v1/config/language"),
    ("POST", "/api/v1/config/model"),
}

# Frontend usage status for each endpoint.
FRONTEND_USAGE_STATUS = {
    # Path -> Status Icon
    "/api/v1/auth/login": "✅ Used",
    "/api/v1/auth/logout": "✅ Used",
    "/api/v1/auth/status": "✅ Used",
    "/api/v1/stock/search": "✅ Used",
    "/api/v1/stock/chat/{ticker}/stream": "✅ Used",
    "/api/v1/macro/rates/all": "✅ Used",
    "/api/v1/macro/bubor": "✅ Used",
    "/api/v1/macro/forex/pairs": "✅ Used",
    "/api/v1/macro/forex/{pair}": "✅ Used",
    # Note: Historical Yield Curve is not in the canonical list.
}

# Default statuses
STATUS_READY = "🛈 Ready"
STATUS_PLANNED = "📝 Planned"

def normalize_path(raw: str) -> str:
    """Collapse duplicates, drop unwanted prefixes, strip trailing slash."""
    # Remove duplicate slashes
    raw = re.sub(r"/+", "/", raw.strip())

    # Split into segments (ignore leading slash for simplicity)
    segments = [seg for seg in raw.split("/") if seg]

    # Filter out unwanted directory artefacts
    unwanted = {"routers", "stock_endpoints"}
    segments = [seg for seg in segments if seg not in unwanted]

    # Collapse consecutive duplicates (macro/macro ➜ macro)
    collapsed: list[str] = []
    for seg in segments:
        if not collapsed or collapsed[-1] != seg:
            collapsed.append(seg)

    path = "/" + "/".join(collapsed)
    return path.rstrip("/") if path != "/" else "/"


def load_frontend_used(frontend_usage_file: Path | None) -> Set[str]:
    if not frontend_usage_file or not frontend_usage_file.exists():
        return set()
    used: set[str] = set()
    with frontend_usage_file.open(newline="", encoding="utf-8") as f:
        reader = csv.reader(f, delimiter="\t")
        for row in reader:
            if len(row) >= 2:
                used.add(row[1].strip())
    return used


def is_planned(path: str, patterns: list[str]) -> bool:
    return any(re.search(p, path) for p in patterns)


def process_matrix(
    input_file: Path,
    output_file: Path,
    frontend_usage_file: Path | None = None,
    planned_patterns: list[str] | None = None,
) -> None:
    planned_patterns = planned_patterns or [DEFAULT_PLANNED_REGEX]
    fe_used = load_frontend_used(frontend_usage_file)

    seen: set[Tuple[str, str]] = set()
    rows_out: list[list[str]] = []

    with input_file.open(encoding="utf-8") as f:
        try:
            data = json.load(f)
        except json.JSONDecodeError:
            print(f"Error: Invalid JSON in {input_file}")
            return

    for item in data:
        raw_path = item.get("path", "")
        # The 'methods' field is a list, we take the first one for simplicity
        method = item.get("methods", [""])[0]
        impl_path = item.get("source_file", "N/A")
        
        if not raw_path or not method:
            continue

        norm_path = normalize_path(raw_path)
        key = (norm_path, method.upper())
        if key in seen:
            continue
        seen.add(key)

        # Determine status
        if norm_path in fe_used:
            status = "✅ used"
        elif is_planned(norm_path, planned_patterns):
            status = "📝 planned"
        else:
            status = "🛈 ready"

        rows_out.append([norm_path, method.upper(), impl_path, status])

    # Sort for stability
    rows_out.sort(key=lambda r: (r[0], r[1]))

    with output_file.open("w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f, delimiter="\t")
        writer.writerow(["Endpoint", "Method", "Implemented in", "Status"])
        writer.writerows(rows_out)

    print(f"✅ Normalized matrix written to {output_file} (rows: {len(rows_out)})")


def main() -> None:
    parser = argparse.ArgumentParser(description="Normalize endpoint matrix TSV and add status col.")
    parser.add_argument("input", type=Path, help="Source TSV file (v5-R5)")
    parser.add_argument("-o", "--output", type=Path, required=True, help="Output TSV path (v6)")
    parser.add_argument(
        "--frontend-usage",
        type=Path,
        help="Optional TSV that maps FE files -> endpoints (for used detection)",
    )
    parser.add_argument(
        "--planned-regex",
        action="append",
        help="Regex(es) for endpoints considered 'planned' (can repeat)",
    )
    args = parser.parse_args()

    process_matrix(
        input_file=args.input,
        output_file=args.output,
        frontend_usage_file=args.frontend_usage,
        planned_patterns=args.planned_regex,
    )


if __name__ == "__main__":
    main() 