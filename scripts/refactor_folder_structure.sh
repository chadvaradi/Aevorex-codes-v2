#!/usr/bin/env bash
# -----------------------------------------------------------------------------
# FinanceHub – Sprint-5  mini-refactor helper
# Moves overcrowded backend & frontend files into a cleaner folder hierarchy
# WITHOUT touching code.  After run, execute Ruff, isort, and the test-suite.
#
# Usage (from repo root):
#   bash scripts/refactor_folder_structure.sh --execute
#   OR dry-run (default):
#   bash scripts/refactor_folder_structure.sh
# -----------------------------------------------------------------------------
set -euo pipefail

# DRY-RUN flag (default true); use --execute to actually move files
DRY_RUN=1
if [[ "${1:-}" == "--execute" ]]; then
  DRY_RUN=0
  echo "\n❗ EXECUTION MODE – files will be moved.\n"
else
  echo "\n💡 DRY-RUN MODE – printing mv commands only. Use --execute to apply.\n"
fi

mv_cmd() {
  local src="$1" dst="$2"
  if [[ $DRY_RUN -eq 1 ]]; then
    echo "git mv \"$src\" \"$dst\""
  else
    # Try git mv first for history; if not under version control fall back to plain mv
    mkdir -p "$(dirname "$dst")"
    if git mv "$src" "$dst" 2>/dev/null; then
      :
    else
      echo "(git mv skipped – not tracked)"
      mv "$src" "$dst"
    fi
  fi
}

# -----------------------------------------------------------------------------
# Backend rearrangement – core/services
# -----------------------------------------------------------------------------
backend_root="modules/financehub/backend/core/services"

# Shared helpers → services/shared
for f in cache_manager.py cache_operations.py response_helpers.py response_builder.py; do
  [[ -f "$backend_root/$f" ]] && mv_cmd "$backend_root/$f" "$backend_root/shared/$f"
done

# Stock-specific processors / services → services/stock
for f in chart_validators.py ohlcv_processor.py technical_processors.py chart_data_handler.py \
         technical_service.py chart_service.py data_processor.py fundamentals_processors.py \
         fundamentals_service.py news_service.py news_fetcher.py; do
  [[ -f "$backend_root/$f" ]] && mv_cmd "$backend_root/$f" "$backend_root/stock/$f"
done

# Macro top-level -> services/macro
for f in macro_service.py macro_data_service.py; do
  [[ -f "$backend_root/$f" ]] && mv_cmd "$backend_root/$f" "$backend_root/macro/$f"
done

# Orchestrator → core/orchestrator
if [[ -f "$backend_root/orchestrator.py" ]]; then
  mv_cmd "$backend_root/orchestrator.py" "modules/financehub/backend/core/orchestrator/orchestrator.py"
fi

# -----------------------------------------------------------------------------
# Frontend rearrangement – stock AnalysisBubbles
# -----------------------------------------------------------------------------
fe_root="shared/frontend/src/components/financehub/stock"

# Create parent dir
mkdir -p "$fe_root/AnalysisBubbles"

mv_cmd "$fe_root/AnalysisBubblesGrid.tsx" "$fe_root/AnalysisBubbles/AnalysisBubblesGrid.tsx"

for bubble in CompanyOverview FinancialMetrics TechnicalAnalysis NewsHighlights ESGSection; do
  src_view="$fe_root/bubbles/${bubble}Bubble.view.tsx"
  if [[ -f "$src_view" ]]; then
    mkdir -p "$fe_root/AnalysisBubbles/$bubble"
    mv_cmd "$src_view" "$fe_root/AnalysisBubbles/$bubble/${bubble}Bubble.view.tsx"
  fi
done

# Remove now-empty bubbles folder (only if execute)
if [[ $DRY_RUN -eq 0 ]]; then
  rmdir "$fe_root/bubbles" 2>/dev/null || true
fi

# -----------------------------------------------------------------------------
# Hooks re-organisation – stock data/ui/llm breakdown
# -----------------------------------------------------------------------------
hooks_root="shared/frontend/src/hooks/stock"
mkdir -p "$hooks_root/data" "$hooks_root/ui" "$hooks_root/llm"

# Simple heuristic move: API/data hooks → data, others by prefix
for f in $(ls "$hooks_root" | grep "^use.*\.ts$" || true); do
  case "$f" in
    use*_data.ts|use*Api*.ts|use*Rates*.ts) sub=data ;;
    use*Stream*.ts) sub=llm ;;
    *) sub=ui ;;
  esac
  mv_cmd "$hooks_root/$f" "$hooks_root/$sub/$f"
done

# -----------------------------------------------------------------------------
# Post-step reminder
# -----------------------------------------------------------------------------
cat <<'REM'

────────────────────────────────────────
✅ Folder-move commands generated.
Next steps (manual):
 1. Inspect DRY-RUN output. If happy, rerun with --execute.
 2. Run formatting & tests:
      ruff --fix . && isort .
      pnpm lint && pnpm test
      pytest -q
 3. Commit with message: "chore(structure): stock/macro services + AnalysisBubbles modularised"
────────────────────────────────────────
REM 