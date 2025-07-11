#!/bin/bash

# FinanceHub Development Environment Startup Script
# This script starts both backend and frontend services with proper port management

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BACKEND_PORT=8084
FRONTEND_PORT=8083
REDIS_PORT=6379
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo -e "${BLUE}🚀 Starting FinanceHub Development Environment${NC}"
echo -e "${BLUE}Project Root: ${PROJECT_ROOT}${NC}"

# Set PYTHONPATH for the entire script
export PYTHONPATH="${PROJECT_ROOT}"
echo -e "${YELLOW}📁 PYTHONPATH set to: ${PYTHONPATH}${NC}"

# Function to kill processes on specific ports
cleanup_ports() {
    echo -e "${YELLOW}🧹 Cleaning up ports...${NC}"
    
    # Kill any processes on backend port
    if lsof -ti tcp:${BACKEND_PORT} >/dev/null 2>&1; then
        echo -e "${YELLOW}Killing processes on port ${BACKEND_PORT}${NC}"
        lsof -ti tcp:${BACKEND_PORT} | xargs kill -9 2>/dev/null || true
    fi
    
    # Kill any processes on frontend port
    if lsof -ti tcp:${FRONTEND_PORT} >/dev/null 2>&1; then
        echo -e "${YELLOW}Killing processes on port ${FRONTEND_PORT}${NC}"
        lsof -ti tcp:${FRONTEND_PORT} | xargs kill -9 2>/dev/null || true
    fi
    
    # Kill any stray Vite processes
    pkill -f "vite" 2>/dev/null || true
    
    sleep 2
}

# Function to check if port is available
check_port() {
    local port=$1
    if lsof -ti tcp:${port} >/dev/null 2>&1; then
        echo -e "${RED}❌ Port ${port} is still in use${NC}"
        return 1
    else
        echo -e "${GREEN}✅ Port ${port} is available${NC}"
        return 0
    fi
}

# Function to start Redis
start_redis() {
    echo -e "${BLUE}🗄️  Starting Redis...${NC}"
    cd "${PROJECT_ROOT}"

    # If Docker daemon is not running, skip Redis startup and fall back to in-memory cache
    if ! docker info >/dev/null 2>&1; then
        echo -e "${YELLOW}⚠️  Docker daemon is not running. Skipping Redis container startup.${NC}"
        echo -e "${YELLOW}📦 CacheService will run in in-memory mode (FINANCEHUB_CACHE_MODE=memory).${NC}"
        export FINANCEHUB_CACHE_MODE="memory"
        return 0
    fi

    # Check if Redis is already running
    if docker ps | grep -q "financehub-redis"; then
        echo -e "${GREEN}✅ Redis container already running${NC}"
        return 0
    fi
    
    # Start Redis using docker-compose
    if [ -f "docker-compose.redis.yml" ]; then
        if ! docker-compose -f docker-compose.redis.yml up -d >/dev/null 2>&1; then
            echo -e "${YELLOW}⚠️  Docker compose failed (daemon not running?). Falling back to in-memory cache.${NC}"
            export FINANCEHUB_CACHE_MODE="memory"
            return 0
        fi
        
        # Wait for Redis to be ready with timeout
        echo -e "${YELLOW}⏳ Waiting for Redis to start...${NC}"
        for i in {1..15}; do
            if docker exec financehub-redis redis-cli ping >/dev/null 2>&1; then
                echo -e "${GREEN}✅ Redis started successfully on port ${REDIS_PORT}${NC}"
                return 0
            fi
            sleep 1
        done
        
        echo -e "${YELLOW}⚠️  Redis startup timeout. Falling back to in-memory cache.${NC}"
        export FINANCEHUB_CACHE_MODE="memory"
        return 0
    else
        echo -e "${YELLOW}⚠️  docker-compose.redis.yml not found. Using in-memory cache.${NC}"
        export FINANCEHUB_CACHE_MODE="memory"
        return 0
    fi
}

# Function to start backend
start_backend() {
    echo -e "${BLUE}🔧 Starting Backend (FastAPI)...${NC}"
    cd "${PROJECT_ROOT}/modules/financehub/backend"
    
    # Check if .env exists
    if [ ! -f "${PROJECT_ROOT}/env.local" ]; then
        echo -e "${YELLOW}⚠️  No env.local file found. Creating from template...${NC}"
        if [ -f "${PROJECT_ROOT}/env.local.template" ]; then
            cp "${PROJECT_ROOT}/env.local.template" "${PROJECT_ROOT}/env.local"
            echo -e "${YELLOW}📝 Please edit env.local with your API keys${NC}"
        else
            echo -e "${RED}❌ No env.local.template found. Please create env.local manually${NC}"
        fi
    fi
    
    # Start backend in background with proper Python path
    PYTHONPATH="${PROJECT_ROOT}" python main.py &
    BACKEND_PID=$!
    
    # Wait for backend to start
    echo -e "${YELLOW}⏳ Waiting for backend to start...${NC}"
    for i in {1..30}; do
        if curl -s http://localhost:${BACKEND_PORT}/api/v1/health >/dev/null 2>&1; then
            echo -e "${GREEN}✅ Backend started successfully on port ${BACKEND_PORT}${NC}"
            return 0
        fi
        sleep 1
    done
    
    echo -e "${RED}❌ Backend failed to start${NC}"
    return 1
}

# Function to start frontend
start_frontend() {
    echo -e "${BLUE}🎨 Starting Frontend (Vite)...${NC}"
    cd "${PROJECT_ROOT}/shared/frontend"
    
    # Set Node.js memory options to prevent OOM
    export NODE_OPTIONS="--max-old-space-size=4096"
    
    # Start frontend in background
    pnpm dev &
    FRONTEND_PID=$!
    
    # Wait for frontend to start
    echo -e "${YELLOW}⏳ Waiting for frontend to start...${NC}"
    for i in {1..30}; do
        if curl -s http://localhost:${FRONTEND_PORT} >/dev/null 2>&1; then
            echo -e "${GREEN}✅ Frontend started successfully on port ${FRONTEND_PORT}${NC}"
            return 0
        fi
        sleep 1
    done
    
    echo -e "${RED}❌ Frontend failed to start${NC}"
    return 1
}

# Function to handle cleanup on exit
cleanup_on_exit() {
    echo -e "\n${YELLOW}🛑 Shutting down services...${NC}"
    
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null || true
    fi
    
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null || true
    fi
    
    cleanup_ports
    echo -e "${GREEN}✅ Cleanup completed${NC}"
}

# Set up signal handlers
trap cleanup_on_exit EXIT INT TERM

# Main execution
main() {
    # Change to project root
    cd "${PROJECT_ROOT}"
    
    # Clean up any existing processes
    cleanup_ports
    
    # Verify ports are available
    if ! check_port ${BACKEND_PORT} || ! check_port ${FRONTEND_PORT}; then
        echo -e "${RED}❌ Required ports are not available${NC}"
        exit 1
    fi
    
    # Start services in order: Redis -> Backend -> Frontend
    if start_redis && start_backend && start_frontend; then
        echo -e "\n${GREEN}🎉 Development environment is ready!${NC}"
        echo -e "${GREEN}Redis:    redis://localhost:${REDIS_PORT}${NC}"
        echo -e "${GREEN}Backend:  http://localhost:${BACKEND_PORT}${NC}"
        echo -e "${GREEN}Frontend: http://localhost:${FRONTEND_PORT}${NC}"
        echo -e "${YELLOW}Press Ctrl+C to stop all services${NC}"
        
        # Wait for user interrupt
        wait
    else
        echo -e "${RED}❌ Failed to start development environment${NC}"
        exit 1
    fi
}

# Check if script is run directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi 