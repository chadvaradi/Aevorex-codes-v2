#!/bin/bash

# FinanceHub All Services Startup
# Memory Cache Mode - Zero Redis Dependencies

set -e

echo "🚀 FinanceHub Complete System Startup"
echo "====================================="
echo "Memory Cache Mode - Optimalizált napi 1-2x használatra"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Project root
PROJECT_ROOT="/Users/varadicsanad/Library/Mobile Documents/com~apple~CloudDocs/downloads_service/Aevorex_local"
FINANCEHUB_DIR="$PROJECT_ROOT/modules/financehub"

# Cache mode beállítás
export FINANCEHUB_CACHE_MODE=memory
export PYTHONPATH="$PYTHONPATH:$PROJECT_ROOT"

echo -e "${GREEN}✅ Cache Mode: $FINANCEHUB_CACHE_MODE${NC}"
echo -e "${GREEN}✅ PYTHONPATH: $PYTHONPATH${NC}"
echo ""

# Function to check if port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 0  # Port is in use
    else
        return 1  # Port is free
    fi
}

# Function to start backend
start_backend() {
    echo -e "${YELLOW}🔧 Starting Backend (Memory Cache)...${NC}"
    cd "$PROJECT_ROOT/modules/financehub/backend"
    
    if check_port 8084; then
        echo -e "${YELLOW}⚠️  Port 8084 already in use. Stopping existing process...${NC}"
        pkill -f "uvicorn.*8084" || true
        sleep 2
    fi
    
    echo -e "${GREEN}🚀 Backend starting at http://localhost:8084${NC}"
    python3 -m uvicorn main:app --reload --port 8084 --host 0.0.0.0 &
    BACKEND_PID=$!
    sleep 3
    
    # Health check
    if curl -s http://localhost:8084/health >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Backend health check passed${NC}"
    else
        echo -e "${RED}❌ Backend health check failed${NC}"
    fi
}

# Function to start celery
start_celery() {
    echo -e "${YELLOW}🔄 Starting Celery Worker & Beat...${NC}"
    cd "$PROJECT_ROOT/modules/financehub/backend"
    
    # Start worker
    python3 -m celery -A celery_app:celery_app worker --loglevel=info --concurrency=2 &
    WORKER_PID=$!
    sleep 2
    
    # Start beat
    python3 -m celery -A celery_app:celery_app beat --loglevel=info &
    BEAT_PID=$!
    sleep 2
    
    echo -e "${GREEN}✅ Celery Worker PID: $WORKER_PID${NC}"
    echo -e "${GREEN}✅ Celery Beat PID: $BEAT_PID${NC}"
}

# Function to start frontend
start_frontend() {
    echo -e "${YELLOW}🎨 Starting Frontend Dev Server...${NC}"
    cd "$PROJECT_ROOT/shared/frontend"
    
    # Check if pnpm is available
    if ! command -v pnpm &> /dev/null; then
        echo -e "${RED}❌ pnpm not found. Installing...${NC}"
        npm install -g pnpm
    fi
    
    echo -e "${GREEN}🚀 Frontend starting at http://localhost:5175${NC}"
    pnpm dev &
    FRONTEND_PID=$!
}

# Start all services
echo -e "${YELLOW}Starting all services...${NC}"

start_backend
start_celery
start_frontend

echo ""
echo -e "${GREEN}🎯 All Services Started!${NC}"
echo "================================"
echo -e "${GREEN}📊 Backend:   http://localhost:8084${NC}"
echo -e "${GREEN}📊 Health:    http://localhost:8084/health${NC}"
echo -e "${GREEN}📊 API Docs:  http://localhost:8084/docs${NC}"
echo -e "${GREEN}🎨 Frontend:  http://localhost:5175${NC}"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop all services${NC}"

# Wait for all background processes
wait $BACKEND_PID $WORKER_PID $BEAT_PID $FRONTEND_PID 