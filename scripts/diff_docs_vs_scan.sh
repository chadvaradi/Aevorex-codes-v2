#!/bin/bash

# ULTRATHINK CI-Gate: diff_docs_vs_scan.sh
# Ensures API documentation (ENDPOINT_MATRIX_v20.md) is in sync with the actual codebase.
# Fails the build if any discrepancies are found.
# Rule #008 Compliance Script.

set -e

# --- Configuration ---
DOCS_MATRIX_FILE="docs/ENDPOINT_MATRIX_v20.md"
BACKEND_DIR="modules/financehub/backend"
TMP_SCAN_RESULT="/tmp/endpoint_scan_result.txt"

# --- Functions ---
log_info() {
    echo "[INFO] $1"
}

log_error() {
    echo "[ERROR] $1" >&2
}

# 1. Scan codebase for actual endpoints
# This grep command is a simplified version. A more robust solution might
# parse the AST or use a dedicated tool to resolve router prefixes.
scan_endpoints() {
    log_info "Scanning '$BACKEND_DIR' for live endpoint definitions..."
    grep -r --include='*.py' -E "@router\.(get|post|put|delete)" "$BACKEND_DIR" | \
        sed -E 's/.*@router\.(get|post|put|delete)\("([^"]+)".*/\2/' | \
        sort | \
        uniq > "$TMP_SCAN_RESULT"
    log_info "Scan complete. Found $(wc -l < "$TMP_SCAN_RESULT") unique endpoint paths."
}

# 2. Extract declared endpoints from the markdown matrix
extract_from_docs() {
    log_info "Extracting endpoint paths from '$DOCS_MATRIX_FILE'..."
    # This extracts the second column from the markdown table, skipping header
    grep -E "^\| GET|POST" "$DOCS_MATRIX_FILE" | \
        awk -F'|' '{print $3}' | \
        sed 's/`//g' |
        sed 's/ //g' | \
        sort | \
        uniq
}

# --- Main Execution ---
log_info "Starting API documentation sync check..."

if [ ! -f "$DOCS_MATRIX_FILE" ]; then
    log_error "Documentation matrix file not found at '$DOCS_MATRIX_FILE'!"
    exit 1
fi

scan_endpoints
DECLARED_ENDPOINTS=$(extract_from_docs)
SCANNED_ENDPOINTS=$(cat "$TMP_SCAN_RESULT")

# 3. Compare the two lists
log_info "Comparing scanned endpoints with documented endpoints..."
DIFF=$(diff <(echo "$SCANNED_ENDPOINTS") <(echo "$DECLARED_ENDPOINTS"))

# 4. Report results
if [ -z "$DIFF" ]; then
    log_info "✅ SUCCESS: API documentation is in sync with the codebase."
    rm "$TMP_SCAN_RESULT"
    exit 0
else
    log_error "❌ FAILURE: API documentation is out of sync!"
    log_error "Difference found (Left: Scanned from Code, Right: Declared in Docs):"
    echo "$DIFF"
    log_error "Please update '$DOCS_MATRIX_FILE' to match the live endpoints and re-run the pipeline."
    rm "$TMP_SCAN_RESULT"
    exit 1
fi 