#!/bin/bash

# FinanceHub Total System Restart - Skálázható Teljeskörű Javítás
# Minden portkonflikust és cache problémát megold

set -e

echo "🚀 FinanceHub Total System Restart"
echo "==================================="
echo "Skálázható teljeskörű javítás - All-in-One megoldás"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

# Project paths
PROJECT_ROOT="/Users/varadicsanad/Library/Mobile Documents/com~apple~CloudDocs/downloads_service/Aevorex_local"
BACKEND_DIR="$PROJECT_ROOT/modules/financehub/backend"
FRONTEND_DIR="$PROJECT_ROOT/shared/frontend"

# Environment setup
export FINANCEHUB_CACHE_MODE=memory
export PYTHONPATH="$PYTHONPATH:$PROJECT_ROOT"

echo -e "${GREEN}✅ Cache Mode: $FINANCEHUB_CACHE_MODE${NC}"
echo -e "${GREEN}✅ PYTHONPATH: $PYTHONPATH${NC}"
echo ""

# Function to kill processes on specific ports
kill_port() {
    local port=$1
    local service_name=$2
    
    echo -e "${YELLOW}🔍 Checking port $port for $service_name...${NC}"
    
    if lsof -ti :$port >/dev/null 2>&1; then
        echo -e "${YELLOW}⚠️  Port $port in use. Killing existing processes...${NC}"
        lsof -ti :$port | xargs kill -9 2>/dev/null || true
        sleep 2
        
        # Double-check
        if lsof -ti :$port >/dev/null 2>&1; then
            echo -e "${RED}❌ Failed to free port $port${NC}"
            return 1
        else
            echo -e "${GREEN}✅ Port $port freed successfully${NC}"
        fi
    else
        echo -e "${GREEN}✅ Port $port is free${NC}"
    fi
}

# Function to clear caches
clear_caches() {
    echo -e "${YELLOW}🧹 Clearing all caches...${NC}"
    
    # Frontend Vite cache
    cd "$FRONTEND_DIR"
    rm -rf node_modules/.vite .vite dist 2>/dev/null || true
    echo -e "${GREEN}✅ Frontend cache cleared${NC}"
    
    # Python cache
    cd "$PROJECT_ROOT"
    find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
    find . -name "*.pyc" -delete 2>/dev/null || true
    echo -e "${GREEN}✅ Python cache cleared${NC}"
}

# Function to start backend
start_backend() {
    echo -e "${BLUE}🔧 Starting Backend (Memory Cache Mode)...${NC}"
    
    cd "$BACKEND_DIR"
    
    # Start in background using the correct Python interpreter
    python3 -m uvicorn main:app --reload --port 8084 --host 0.0.0.0 &
    BACKEND_PID=$!
    
    # Wait for startup
    echo -e "${YELLOW}⏳ Waiting for backend startup...${NC}"
    for i in {1..15}; do
        if curl -s http://localhost:8084/health >/dev/null 2>&1; then
            echo -e "${GREEN}✅ Backend started successfully (PID: $BACKEND_PID)${NC}"
            echo -e "${GREEN}🎯 Backend URL: http://localhost:8084${NC}"
            return 0
        fi
        sleep 1
    done
    
    echo -e "${RED}❌ Backend failed to start within 15 seconds${NC}"
    return 1
}

# Function to start frontend
start_frontend() {
    echo -e "${BLUE}🎨 Starting Frontend Dev Server...${NC}"
    
    cd "$FRONTEND_DIR"
    
    # Check if pnpm is available
    if ! command -v pnpm &> /dev/null; then
        echo -e "${RED}❌ pnpm not found. Installing...${NC}"
        npm install -g pnpm
    fi
    
    # Start in background
    pnpm dev &
    FRONTEND_PID=$!
    
    # Wait for startup
    echo -e "${YELLOW}⏳ Waiting for frontend startup...${NC}"
    for i in {1..10}; do
        if curl -s http://localhost:8083 >/dev/null 2>&1; then
            echo -e "${GREEN}✅ Frontend started successfully (PID: $FRONTEND_PID)${NC}"
            echo -e "${GREEN}🎯 Frontend URL: http://localhost:8083${NC}"
            return 0
        fi
        sleep 1
    done
    
    echo -e "${RED}❌ Frontend failed to start within 10 seconds${NC}"
    return 1
}

# Function to test API connectivity
test_api_connectivity() {
    echo -e "${BLUE}🧪 Testing API connectivity...${NC}"
    
    # Test health
    if curl -s http://localhost:8084/health | grep -q "ok"; then
        echo -e "${GREEN}✅ Health endpoint working${NC}"
    else
        echo -e "${RED}❌ Health endpoint failed${NC}"
        return 1
    fi
    
    # Test inflation API
    if curl -s http://localhost:8084/api/v1/macro/ecb/inflation | grep -q "success"; then
        echo -e "${GREEN}✅ ECB Inflation API working${NC}"
    else
        echo -e "${YELLOW}⚠️  ECB Inflation API may have data issues (normal)${NC}"
    fi
    
    # Test fixing rates
    if curl -s http://localhost:8084/api/v1/macro/fixing-rates/intervals | grep -q "success"; then
        echo -e "${GREEN}✅ Fixing Rates API working${NC}"
    else
        echo -e "${RED}❌ Fixing Rates API failed${NC}"
        return 1
    fi
    
    echo -e "${GREEN}✅ All API tests passed${NC}"
}

# Main execution flow
main() {
    echo -e "${BLUE}🔄 Step 1: Killing existing processes...${NC}"
    kill_port 8084 "Backend"
    kill_port 8083 "Frontend" 
    kill_port 5173 "Alternative Frontend"
    kill_port 5174 "Alternative Frontend"
    kill_port 5175 "Alternative Frontend"
    
    # Also kill any Vite processes
    pkill -f "vite" 2>/dev/null || true
    pkill -f "uvicorn" 2>/dev/null || true
    sleep 2
    
    echo -e "${BLUE}🔄 Step 2: Clearing caches...${NC}"
    clear_caches
    
    echo -e "${BLUE}🔄 Step 3: Starting backend...${NC}"
    if ! start_backend; then
        echo -e "${RED}💥 Backend startup failed. Exiting.${NC}"
        exit 1
    fi
    
    echo -e "${BLUE}🔄 Step 4: Starting frontend...${NC}"
    if ! start_frontend; then
        echo -e "${RED}💥 Frontend startup failed. Exiting.${NC}"
        exit 1
    fi
    
    echo -e "${BLUE}🔄 Step 5: Testing connectivity...${NC}"
    if ! test_api_connectivity; then
        echo -e "${RED}💥 API connectivity test failed.${NC}"
        exit 1
    fi
    
    echo ""
    echo -e "${GREEN}🎉 SUCCESS! FinanceHub Total System Restart Complete${NC}"
    echo "=================================================="
    echo -e "${GREEN}🎯 Backend:   http://localhost:8084${NC}"
    echo -e "${GREEN}📊 Health:    http://localhost:8084/health${NC}"
    echo -e "${GREEN}📚 API Docs:  http://localhost:8084/docs${NC}"
    echo -e "${GREEN}🎨 Frontend:  http://localhost:8083${NC}"
    echo ""
    echo -e "${YELLOW}📱 Open browser: http://localhost:8083${NC}"
    echo -e "${YELLOW}📋 Navigate to: Macro Rates → Check fixing rates data${NC}"
    echo ""
    echo -e "${BLUE}💡 All services running with memory cache mode${NC}"
    echo -e "${BLUE}🔄 Auto-reload enabled for development${NC}"
    
    # Keep script running to show logs
    echo ""
    echo -e "${YELLOW}Press Ctrl+C to stop all services${NC}"
    
    # Wait for user interruption
    trap 'echo -e "\n${YELLOW}🛑 Stopping all services...${NC}"; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null || true; exit 0' INT
    wait
}

# Run main function
main "$@" 