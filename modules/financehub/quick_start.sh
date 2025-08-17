#!/bin/bash

# FinanceHub Quick Start - Teljes System Újraindítás
# Skálázható és teljeskörű javítás - Memory Cache Mode

set -e

echo "🚀 FinanceHub Quick Start - Teljes Rendszer"
echo "==========================================="
echo "Automatikus backend + frontend újraindítás"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Project paths
PROJECT_ROOT="/Users/varadicsanad/Library/Mobile Documents/com~apple~CloudDocs/downloads_service/Aevorex_local"
BACKEND_DIR="$PROJECT_ROOT/modules/financehub/backend"
FRONTEND_DIR="$PROJECT_ROOT/shared/frontend"

# Cache mode setup
export FINANCEHUB_CACHE_MODE=memory
export PYTHONPATH="$PYTHONPATH:$PROJECT_ROOT"

echo -e "${GREEN}✅ Cache Mode: $FINANCEHUB_CACHE_MODE${NC}"
echo -e "${GREEN}✅ Project Root: $PROJECT_ROOT${NC}"
echo ""

# Function to kill existing processes
cleanup_processes() {
    echo -e "${YELLOW}🧹 Cleaning up existing processes...${NC}"
    
    # Kill uvicorn on port 8084
    if lsof -Pi :8084 -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo "  ⚠️  Stopping backend on port 8084..."
        pkill -f "uvicorn.*8084" || true
        sleep 2
    fi
    
    # Kill vite processes
    echo "  ⚠️  Stopping any running vite processes..."
    pkill -f "vite" || true
    sleep 2
    
    echo -e "${GREEN}✅ Cleanup completed${NC}"
}

# Function to start backend
start_backend() {
    echo -e "${YELLOW}🔧 Starting Backend (Memory Cache)...${NC}"
    cd "$BACKEND_DIR"
    
    echo "  📁 Working directory: $(pwd)"
    echo "  🚀 Starting FastAPI with uvicorn..."
    
    # Start backend in background
    python3 -m uvicorn main:app --reload --port 8084 --host 0.0.0.0 &
    BACKEND_PID=$!
    
    echo "  📊 Backend PID: $BACKEND_PID"
    echo "  ⏳ Waiting for backend startup..."
    sleep 5
    
    # Health check
    if curl -s http://localhost:8084/health >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Backend health check passed${NC}"
        echo -e "${GREEN}📊 Backend running at: http://localhost:8084${NC}"
    else
        echo -e "${RED}❌ Backend health check failed${NC}"
        echo "  🔍 Check terminal output for errors"
    fi
}

# Function to start frontend
start_frontend() {
    echo -e "${YELLOW}🎨 Starting Frontend...${NC}"
    cd "$FRONTEND_DIR"
    
    echo "  📁 Working directory: $(pwd)"
    echo "  🧹 Clearing vite cache..."
    rm -rf node_modules/.vite || true
    
    echo "  🚀 Starting Vite dev server..."
    
    # Start frontend in background
    pnpm dev &
    FRONTEND_PID=$!
    
    echo "  📊 Frontend PID: $FRONTEND_PID"
    echo "  ⏳ Waiting for frontend startup..."
    sleep 10
    
    echo -e "${GREEN}✅ Frontend should be available at one of:${NC}"
    echo -e "${GREEN}  🎨 http://localhost:8083${NC}"
    echo -e "${GREEN}  🎨 http://localhost:5173${NC}"
    echo -e "${GREEN}  🎨 http://localhost:5174${NC}"
}

# Function to display final status
show_status() {
    echo ""
    echo -e "${GREEN}🎯 FinanceHub System Started Successfully!${NC}"
    echo "=========================================="
    echo -e "${GREEN}📊 Backend:  http://localhost:8084${NC}"
    echo -e "${GREEN}📊 API Docs: http://localhost:8084/docs${NC}"
    echo -e "${GREEN}📊 Health:   http://localhost:8084/health${NC}"
    echo ""
    echo -e "${GREEN}🎨 Frontend: Check above URLs (8083/5173/5174)${NC}"
    echo ""
    echo -e "${YELLOW}📋 Quick API Tests:${NC}"
    echo "  curl http://localhost:8084/health"
    echo "  curl http://localhost:8084/api/v1/macro/fixing-rates/intervals"
    echo ""
    echo -e "${YELLOW}🔧 To stop services:${NC}"
    echo "  pkill -f uvicorn"
    echo "  pkill -f vite"
    echo ""
    echo -e "${GREEN}🚀 Ready for development!${NC}"
}

# Main execution
echo -e "${YELLOW}Starting cleanup and restart sequence...${NC}"
cleanup_processes

echo ""
echo -e "${YELLOW}Starting backend service...${NC}"
start_backend

echo ""
echo -e "${YELLOW}Starting frontend service...${NC}"
start_frontend

echo ""
show_status

# Keep script running
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop all services${NC}"
echo "Monitoring services..."

# Wait for background processes
wait 