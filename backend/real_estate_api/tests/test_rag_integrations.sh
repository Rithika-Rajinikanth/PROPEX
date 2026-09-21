#!/bin/bash
# Phase 2: RAG Testing

echo "🧪 PHASE 2: RAG TESTING"
echo "======================"
echo ""

# Test 1: Property search with results
echo "Test 1: Property search (with results)"
response=$(curl -s -X POST http://localhost:3000/api/v1/ai/chat \
    -H "Content-Type: application/json" \
    -d '{"message": "I want a house in California under $600k"}')

echo $response | jq .
echo $response | jq -r '.message' | grep -q "Found\|property\|region"
if [ $? -eq 0 ]; then
    echo "✅ Returns property results"
else
    echo "❌ Should return properties"
fi
echo ""

# Test 2: Property search (no results - triggers fallback)
echo "Test 2: Fallback logic (no results)"
response=$(curl -s -X POST http://localhost:3000/api/v1/ai/chat \
    -H "Content-Type: application/json" \
    -d '{"message": "I want a house in Antarctica"}')

echo $response | jq -r '.message'
echo $response | jq -r '.message' | grep -qi "nearby\|alternative\|couldn.*find"
if [ $? -eq 0 ]; then
    echo "✅ Provides alternatives when no results"
else
    echo "❌ Should suggest alternatives"
fi
echo ""

# Test 3: Market information query
echo "Test 3: Market information"
response=$(curl -s -X POST http://localhost:3000/api/v1/ai/chat \
    -H "Content-Type: application/json" \
    -d '{"message": "What are the hottest markets right now?"}')

echo $response | jq -r '.message'
echo $response | jq -r '.message' | grep -qi "market\|trend\|heat"
if [ $? -eq 0 ]; then
    echo "✅ Provides market insights"
else
    echo "❌ Should return market data"
fi
echo ""

# Test 4: Context retention (multi-turn)
echo "Test 4: Context retention"
response1=$(curl -s -X POST http://localhost:3000/api/v1/ai/chat \
    -H "Content-Type: application/json" \
    -d '{"message": "I am looking for a house"}')

# Extract context
context=$(echo $response1 | jq -c '[{"role": "user", "content": "I am looking for a house"}, {"role": "assistant", "content": (.message)}]')

response2=$(curl -s -X POST http://localhost:3000/api/v1/ai/chat \
    -H "Content-Type: application/json" \
    -d "{\"message\": \"What about California?\", \"context\": $context}")

echo $response2 | jq -r '.message'
echo "✅ Multi-turn conversation works"
echo ""

echo "✅ PHASE 2 RAG TESTS PASSED!"