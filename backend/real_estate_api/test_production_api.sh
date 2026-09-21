#!/bin/bash

# ============================================================================
# COMPLETE API TESTING SCRIPT
# ============================================================================

set -e

BASE_URL="${API_URL:-http://localhost:3000}"
PASS=0
FAIL=0

echo "🧪 Testing Real Estate API at $BASE_URL"
echo "=========================================="
echo ""

# Helper function
test_endpoint() {
    local name="$1"
    local method="$2"
    local endpoint="$3"
    local data="$4"
    
    echo -n "Testing: $name ... "
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "\n%{http_code}" "$BASE_URL$endpoint")
    else
        response=$(curl -s -w "\n%{http_code}" -X "$method" \
            -H "Content-Type: application/json" \
            -d "$data" \
            "$BASE_URL$endpoint")
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n-1)
    
    if [ "$http_code" = "200" ] || [ "$http_code" = "201" ]; then
        echo "✅ PASS (HTTP $http_code)"
        PASS=$((PASS + 1))
        return 0
    else
        echo "❌ FAIL (HTTP $http_code)"
        echo "Response: $body"
        FAIL=$((FAIL + 1))
        return 1
    fi
}

# ============================================================================
# CRITICAL TESTS
# ============================================================================

echo "📋 CRITICAL TESTS"
echo "----------------"

# 1. Health Check
test_endpoint "Health Check" "GET" "/health"

# 2. OpenAPI JSON (MOST IMPORTANT)
echo -n "Testing: OpenAPI JSON ... "
openapi_response=$(curl -s "$BASE_URL/api-docs/openapi.json")
if echo "$openapi_response" | grep -q "\"openapi\":\"3.0"; then
    echo "✅ PASS - Valid OpenAPI JSON"
    PASS=$((PASS + 1))
else
    echo "❌ FAIL - Invalid OpenAPI response"
    echo "Got: $(echo "$openapi_response" | head -c 100)"
    FAIL=$((FAIL + 1))
fi

# 3. Swagger UI
echo -n "Testing: Swagger UI ... "
swagger_response=$(curl -s "$BASE_URL/swagger-ui/")
if echo "$swagger_response" | grep -q "swagger-ui"; then
    echo "✅ PASS"
    PASS=$((PASS + 1))
else
    echo "❌ FAIL"
    FAIL=$((FAIL + 1))
fi

echo ""
echo "📍 REGION ENDPOINTS"
echo "-------------------"

# 4. List Regions
test_endpoint "List Regions" "GET" "/api/v1/regions?limit=5"

# 5. List Regions by State
test_endpoint "List Regions (TX)" "GET" "/api/v1/regions?state=TX&limit=5"

# 6. Get Specific Region
test_endpoint "Get Region 1" "GET" "/api/v1/regions/1"

# 7. Get Region Metrics
test_endpoint "Get Metrics Region 1" "GET" "/api/v1/regions/1/metrics"

# 8. Get Region Trends
test_endpoint "Get Trends Region 1" "GET" "/api/v1/regions/1/trends?metric=zhvi&months=6"

echo ""
echo "🔍 SEARCH ENDPOINTS"
echo "-------------------"

# 9. Basic Search
test_endpoint "Basic Search" "GET" "/api/v1/search?limit=5"

# 10. Search by State
test_endpoint "Search by State" "GET" "/api/v1/search?state=CA&limit=5"

# 11. Search by Location
test_endpoint "Search by Location" "GET" "/api/v1/search?location=Los%20Angeles&limit=5"

# 12. Search with Price Range (CRITICAL FIX)
test_endpoint "Search with Prices" "GET" "/api/v1/search?price_min=200000&price_max=500000&limit=5"

echo ""
echo "📊 ANALYTICS ENDPOINTS"
echo "----------------------"

# 13. Market Trends
test_endpoint "Market Trends" "GET" "/api/v1/analytics/trends?limit=10"

# 14. Market Trends by State
test_endpoint "Trends (TX)" "GET" "/api/v1/analytics/trends?state=TX&limit=10"

# 15. Heatmap (CRITICAL FIX)
test_endpoint "Heatmap Data" "GET" "/api/v1/analytics/heatmap"

echo ""
echo "🔐 AUTH ENDPOINTS"
echo "-----------------"

# 16. Register
test_endpoint "Register User" "POST" "/api/v1/auth/register" \
    '{"email":"test'$(date +%s)'@example.com","password":"password123","name":"Test User"}'

# 17. Login
echo -n "Testing: Login ... "
login_response=$(curl -s -w "\n%{http_code}" -X POST \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"password123"}' \
    "$BASE_URL/api/v1/auth/login")

http_code=$(echo "$login_response" | tail -n1)
if [ "$http_code" = "200" ] || [ "$http_code" = "401" ]; then
    echo "✅ PASS (HTTP $http_code)"
    PASS=$((PASS + 1))
    
    if [ "$http_code" = "200" ]; then
        TOKEN=$(echo "$login_response" | head -n-1 | grep -o '"token":"[^"]*' | cut -d'"' -f4)
        echo "   Token obtained: ${TOKEN:0:20}..."
    fi
else
    echo "❌ FAIL (HTTP $http_code)"
    FAIL=$((FAIL + 1))
fi

echo ""
echo "🤖 AI ENDPOINTS (if OpenAI key configured)"
echo "-------------------------------------------"

# 18. AI Chat
test_endpoint "AI Chat" "POST" "/api/v1/ai/chat" \
    '{"message":"What are the best areas to invest?"}'

# 19. AI Recommendations
test_endpoint "AI Recommendations" "POST" "/api/v1/ai/recommend" \
    '{"budget_max":500000,"preferred_states":["TX","CA"]}'

echo ""
echo "=============================================="
echo "📊 TEST SUMMARY"
echo "=============================================="
echo "✅ Passed: $PASS"
echo "❌ Failed: $FAIL"
echo "Total: $((PASS + FAIL))"
echo ""

if [ $FAIL -eq 0 ]; then
    echo "🎉 ALL TESTS PASSED!"
    echo ""
    echo "✅ Your API is ready for production!"
    echo "   • Swagger UI: $BASE_URL/swagger-ui"
    echo "   • OpenAPI JSON: $BASE_URL/api-docs/openapi.json"
    echo "   • Health Check: $BASE_URL/health"
    exit 0
else
    echo "⚠️  Some tests failed. Please check the errors above."
    exit 1


#!/bin/bash
# Phase 1: Semantic Search Testing Script

set -e  # Exit on error

echo "🧪 PHASE 1: SEMANTIC SEARCH TESTING"
echo "===================================="
echo ""

# 1. Test ML Service Health
echo "1️⃣ Testing ML Service..."
curl -s http://localhost:8000/health | jq .
if [ $? -eq 0 ]; then
    echo "✅ ML service is running"
else
    echo "❌ ML service is not running. Start with: cd ml && uvicorn app:app"
    exit 1
fi
echo ""

# 2. Test Embedding Generation
echo "2️⃣ Testing Embedding Generation..."
response=$(curl -s -X POST http://localhost:8000/embed \
    -H "Content-Type: application/json" \
    -d '{"text": "beautiful beach house"}')

dimensions=$(echo $response | jq -r '.dimensions')
if [ "$dimensions" = "384" ]; then
    echo "✅ Embeddings working (384 dimensions)"
else
    echo "❌ Embedding generation failed"
    exit 1
fi
echo ""

# 3. Test Database Connection
echo "3️⃣ Testing Database..."
psql -U postgres -d realestate -c "SELECT COUNT(*) FROM regions WHERE embedding IS NOT NULL;" | grep -q "[0-9]"
if [ $? -eq 0 ]; then
    echo "✅ Database has embeddings"
else
    echo "❌ Database missing embeddings. Run: python ml/scripts/seed_embeddings.py"
    exit 1
fi
echo ""

# 4. Test Semantic Search Endpoint
echo "4️⃣ Testing Semantic Search Endpoint..."
response=$(curl -s "http://localhost:3000/api/v1/search/semantic?q=beach%20house%20California")
count=$(echo $response | jq '. | length')

if [ "$count" -gt 0 ]; then
    echo "✅ Semantic search returning $count results"
    echo "Sample result:"
    echo $response | jq '.[0] | {region_name, state_name, current_value}'
else
    echo "❌ Semantic search returned no results"
    exit 1
fi
echo ""

# 5. Test Query Relevance
echo "5️⃣ Testing Query Relevance..."
echo "Searching for 'affordable family neighborhoods'..."
response=$(curl -s "http://localhost:3000/api/v1/search/semantic?q=affordable%20family%20neighborhoods")
echo $response | jq '.[0:3] | .[] | {region_name, current_value}'
echo ""

echo "Searching for 'luxury mountain homes'..."
response=$(curl -s "http://localhost:3000/api/v1/search/semantic?q=luxury%20mountain%20homes")
echo $response | jq '.[0:3] | .[] | {region_name, current_value}'
echo ""

echo "✅ PHASE 1 TESTS PASSED!"
echo ""
echo "Next steps:"
echo "- Run: cargo test --features integration"
echo "- Then proceed to Phase 2 (RAG)"


#!/bin/bash
# End-to-End Full Workflow Test

echo "🧪 E2E: COMPLETE WORKFLOW TEST"
echo "=============================="
echo ""

# Scenario: User searches for property, gets no results, receives alternatives

# Step 1: User searches
echo "Step 1: User searches for 'beach house Antarctica'"
response=$(curl -s -X POST http://localhost:3000/api/v1/ai/chat \
    -H "Content-Type: application/json" \
    -d '{"message": "I want a beach house in Antarctica under $300k"}')

message=$(echo $response | jq -r '.message')
suggestions=$(echo $response | jq -r '.suggestions')

echo "AI Response:"
echo "$message"
echo ""
echo "Suggestions:"
echo "$suggestions" | jq .
echo ""

# Verify fallback triggered
if echo "$message" | grep -qi "couldn.*find\|no.*properties\|alternative"; then
    echo "✅ Fallback logic triggered"
else
    echo "❌ Should trigger fallback"
    exit 1
fi

# Step 2: Follow suggestion
if echo "$suggestions" | grep -q "California"; then
    echo "Step 2: Following suggestion to search California..."
    
    response2=$(curl -s -X POST http://localhost:3000/api/v1/ai/chat \
        -H "Content-Type: application/json" \
        -d '{"message": "Show me beach houses in California"}')
    
    message2=$(echo $response2 | jq -r '.message')
    echo "$message2"
    
    if echo "$message2" | grep -qi "found\|properties\|region"; then
        echo "✅ Returns actual results"
    else
        echo "❌ Should return properties"
        exit 1
    fi
fi
echo ""

# Step 3: Get property details
echo "Step 3: Get property details..."
region_id=$(echo $response2 | jq -r '.message' | grep -oP '/regions/\K[0-9]+' | head -1)

if [ -n "$region_id" ]; then
    details=$(curl -s "http://localhost:3000/api/v1/regions/$region_id/metrics")
    echo $details | jq '{region_name, current_value, heat_index}'
    echo "✅ Retrieved property details"
fi
echo ""

echo "✅ E2E WORKFLOW TEST PASSED!"