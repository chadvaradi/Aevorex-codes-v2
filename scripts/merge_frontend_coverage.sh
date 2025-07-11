#!/usr/bin/env bash
# Merge Vitest (unit) and Cypress (e2e) coverage to single report
set -euo pipefail
ROOT_DIR="$(dirname "$0")/.."
UNIT_DIR="$ROOT_DIR/shared/frontend/coverage/unit"
E2E_DIR="$ROOT_DIR/shared/frontend/coverage/e2e"
MERGE_DIR="$ROOT_DIR/shared/frontend/coverage/combined"
mkdir -p "$MERGE_DIR"
nyc merge "$UNIT_DIR" "$E2E_DIR" > "$MERGE_DIR/coverage.json"
nyc report --reporter=lcov --reporter=text-summary --report-dir "$MERGE_DIR" --temp-dir "$MERGE_DIR" --reporter=json-summary
echo "Combined coverage written to $MERGE_DIR" 