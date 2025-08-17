#!/bin/bash

# FinanceHub Quick Health Check
# Gyors diagnosztika rendszerhibákhoz

echo "🔍 FinanceHub Quick Health Check"
echo "================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Test backend
echo "🔧 Backend Test:"
if curl -s http://localhost:8084/health >/dev/null 2>&1; then
    echo -e "✅ Backend: ${GREEN}RUNNING${NC} (http://localhost:8084)"
else
    echo -e "❌ Backend: ${RED}FAILED${NC} (http://localhost:8084)"
fi

# Test frontend
echo "🎨 Frontend Test:"
if curl -s http://localhost:8083 >/dev/null 2>&1; then
    echo -e "✅ Frontend: ${GREEN}RUNNING${NC} (http://localhost:8083)"
else
    echo -e "❌ Frontend: ${RED}FAILED${NC} (http://localhost:8083)"
fi

# Test proxy connection
echo "🔗 Proxy Test:"
if curl -s "http://localhost:8083/api/v1/health" | grep -q "ok"; then
    echo -e "✅ Proxy: ${GREEN}CONNECTED${NC} (frontend → backend)"
else
    echo -e "❌ Proxy: ${RED}DISCONNECTED${NC} (frontend ↛ backend)"
fi

# Test critical APIs
echo "📊 API Tests:"

# Fixing Rates
if curl -s "http://localhost:8083/api/v1/macro/fixing-rates/intervals" | grep -q "success"; then
    echo -e "✅ Fixing Rates: ${GREEN}OK${NC}"
else
    echo -e "❌ Fixing Rates: ${RED}FAILED${NC}"
fi

# BSI Monetary
if curl -s "http://localhost:8083/api/v1/macro/ecb/bsi/" | grep -q "success"; then
    echo -e "✅ BSI Monetary: ${GREEN}OK${NC}"
else
    echo -e "❌ BSI Monetary: ${RED}FAILED${NC}"
fi

# STS
if curl -s "http://localhost:8083/api/v1/macro/ecb/sts/latest" | grep -q "success"; then
    echo -e "✅ STS: ${GREEN}OK${NC}"
else
    echo -e "❌ STS: ${RED}FAILED${NC}"
fi

# ECB Inflation
if curl -s "http://localhost:8083/api/v1/macro/ecb/inflation" | grep -q "success"; then
    echo -e "✅ ECB Inflation: ${GREEN}OK${NC}"
else
    echo -e "❌ ECB Inflation: ${RED}FAILED${NC}"
fi

echo ""
echo "🎯 Process Status:"
echo "Backend processes:"
ps aux | grep uvicorn | grep -v grep || echo "No uvicorn processes found"
echo "Frontend processes:"
ps aux | grep vite | grep -v grep || echo "No vite processes found"

echo ""
echo "💡 If any tests failed, run:"
echo "   ./modules/financehub/total_system_restart.sh" 