#!/bin/bash

# FinanceHub Backend with In-Memory Cache
# Optimális napi 1-2x használatra - Zero Redis dependency

set -e

echo "🚀 FinanceHub Backend - Memory Cache Mode"
echo "========================================="

# Cache mode beállítás
export FINANCEHUB_CACHE_MODE=memory

# Project root és PYTHONPATH
PROJECT_ROOT="/Users/varadicsanad/Library/Mobile Documents/com~apple~CloudDocs/downloads_service/Aevorex_local"
export PYTHONPATH="$PYTHONPATH:$PROJECT_ROOT"

# Backend directory
cd "$PROJECT_ROOT/modules/financehub/backend"

echo "✅ Cache Mode: $FINANCEHUB_CACHE_MODE"
echo "✅ PYTHONPATH: $PYTHONPATH"
echo "✅ Working Dir: $(pwd)"
echo ""

# Check port availability
if lsof -Pi :8084 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  Port 8084 already in use. Stopping existing process..."
    pkill -f "uvicorn.*8084" || true
    sleep 2
fi

echo "🚀 Starting FastAPI backend with memory cache..."
python3 -m uvicorn main:app --reload --port 8084 --host 0.0.0.0

echo "🎯 Backend running at: http://localhost:8084"
echo "📊 Health check: http://localhost:8084/health"
echo "🔧 Fixing rates: http://localhost:8084/api/v1/macro/fixing-rates/intervals" 