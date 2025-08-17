#!/bin/bash

# FinanceHub Endpoints Tester
# Memory Cache Mode Validation

echo "🧪 FinanceHub Endpoints Testing"
echo "==============================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Base URL
BASE_URL="http://localhost:8084"

# Test function
test_endpoint() {
    local endpoint=$1
    local description=$2
    local expected_status=${3:-200}
    
    echo -n "Testing $description... "
    
    response=$(curl -s -w "%{http_code}" "$BASE_URL$endpoint" 2>/dev/null)
    http_code="${response: -3}"
    body="${response%???}"
    
    if [ "$http_code" = "$expected_status" ]; then
        echo -e "${GREEN}✅ PASS${NC} ($http_code)"
        if [[ "$body" == *"error"* ]]; then
            echo -e "${YELLOW}⚠️  Response contains error: $body${NC}"
        fi
    else
        echo -e "${RED}❌ FAIL${NC} ($http_code)"
        echo -e "${RED}   Response: $body${NC}"
    fi
}

# Wait for backend to be ready
echo "Waiting for backend to be ready..."
for i in {1..30}; do
    if curl -s "$BASE_URL/health" >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Backend is ready!${NC}"
        break
    fi
    if [ $i -eq 30 ]; then
        echo -e "${RED}❌ Backend not responding after 30 seconds${NC}"
        exit 1
    fi
    sleep 1
done

echo ""

# Core endpoints
test_endpoint "/health" "Health Check"
test_endpoint "/docs" "API Documentation"

# Fixing rates endpoints
echo ""
echo "🔧 Testing Fixing Rates Endpoints:"
test_endpoint "/api/v1/macro/fixing-rates/intervals" "Fixing Rates Intervals"
test_endpoint "/api/v1/macro/fixing-rates/changes" "Rate Changes (may be no_data initially)"
test_endpoint "/api/v1/macro/fixing-rates" "Current Fixing Rates"

# Other macro endpoints
echo ""
echo "🔧 Testing Other Macro Endpoints:"
test_endpoint "/api/v1/macro/ecb/rates" "ECB Policy Rates"
test_endpoint "/api/v1/macro/bubor" "BUBOR Rates"

# Test with JSON output
echo ""
echo "📊 Sample JSON Responses:"
echo "========================"

echo ""
echo "🔍 Fixing Rates Intervals:"
curl -s "$BASE_URL/api/v1/macro/fixing-rates/intervals" | python3 -m json.tool 2>/dev/null || echo "Invalid JSON or endpoint not available"

echo ""
echo "🔍 Rate Changes:"
curl -s "$BASE_URL/api/v1/macro/fixing-rates/changes" | python3 -m json.tool 2>/dev/null || echo "No data or invalid JSON"

echo ""
echo -e "${GREEN}✅ Endpoint testing completed!${NC}"
echo ""
echo "🎯 Next steps:"
echo "  1. Check frontend at http://localhost:5175"
echo "  2. Navigate to Macro Rates page"
echo "  3. Verify FixingRatesCard displays correctly"
echo "  4. Test export functionality" 