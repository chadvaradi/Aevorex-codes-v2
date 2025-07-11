#!/usr/bin/env bash
set -e
python scripts/export_openapi.py
npx --yes redoc-cli build docs/openapi.json -o docs/redoc.html
echo "✅ Redoc generated at docs/redoc.html" 