#!/bin/bash

# FinanceHub Celery Worker & Beat with In-Memory Cache
# Zero Redis dependency - Optimális kis terhelésre

set -e

echo "🔄 FinanceHub Celery - Memory Cache Mode"
echo "========================================"

# Cache mode beállítás (kritikus!)
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

# Function to start worker
start_worker() {
    echo "🔧 Starting Celery Worker (memory cache)..."
    python3 -m celery -A celery_app:celery_app worker --loglevel=info --concurrency=2
}

# Function to start beat
start_beat() {
    echo "⏰ Starting Celery Beat Scheduler (memory cache)..."
    python3 -m celery -A celery_app:celery_app beat --loglevel=info
}

# Check command line argument
case "${1:-worker}" in
    "worker")
        start_worker
        ;;
    "beat")
        start_beat
        ;;
    "both")
        echo "🚀 Starting both Worker and Beat in background..."
        start_worker &
        WORKER_PID=$!
        sleep 3
        start_beat &
        BEAT_PID=$!
        
        echo "✅ Worker PID: $WORKER_PID"
        echo "✅ Beat PID: $BEAT_PID"
        echo "Press Ctrl+C to stop both processes"
        
        # Wait for processes
        wait $WORKER_PID $BEAT_PID
        ;;
    *)
        echo "Usage: $0 [worker|beat|both]"
        echo "  worker - Start only the worker process"
        echo "  beat   - Start only the beat scheduler"
        echo "  both   - Start both processes"
        exit 1
        ;;
esac 