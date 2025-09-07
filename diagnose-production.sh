#!/bin/bash

echo "🔍 Oracle Lumira Container Diagnostics"
echo "======================================="

# Test site availability
echo ""
echo "1. Testing main site (https://oraclelumira.com)..."
MAIN_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" https://oraclelumira.com 2>/dev/null || echo "000")
if [ "$MAIN_RESPONSE" = "200" ]; then
    echo "✅ Main site: OK (HTTP $MAIN_RESPONSE)"
else
    echo "❌ Main site: FAILED (HTTP $MAIN_RESPONSE)"
fi

# Test API health
echo ""
echo "2. Testing API health endpoint..."
API_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" https://oraclelumira.com/api/healthz 2>/dev/null || echo "000")
if [ "$API_RESPONSE" = "200" ]; then
    echo "✅ API health: OK (HTTP $API_RESPONSE)"
    # Get detailed health info
    API_DETAILS=$(curl -s https://oraclelumira.com/api/healthz 2>/dev/null || echo "No response")
    echo "   Details: $API_DETAILS"
else
    echo "❌ API health: FAILED (HTTP $API_RESPONSE)"
fi

# Test specific checkout URL
echo ""
echo "3. Testing checkout page (mystique product)..."
CHECKOUT_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "https://oraclelumira.com/commande?product=mystique" 2>/dev/null || echo "000")
if [ "$CHECKOUT_RESPONSE" = "200" ]; then
    echo "✅ Checkout page: OK (HTTP $CHECKOUT_RESPONSE)"
else
    echo "❌ Checkout page: FAILED (HTTP $CHECKOUT_RESPONSE)"
fi

# Test Stripe products endpoint
echo ""
echo "4. Testing Stripe products API..."
PRODUCTS_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" https://oraclelumira.com/api/products 2>/dev/null || echo "000")
if [ "$PRODUCTS_RESPONSE" = "200" ]; then
    echo "✅ Products API: OK (HTTP $PRODUCTS_RESPONSE)"
else
    echo "❌ Products API: FAILED (HTTP $PRODUCTS_RESPONSE)"
fi

echo ""
echo "🏁 Diagnostics complete!"
echo ""

# Final summary
TOTAL_TESTS=4
PASSED_TESTS=0

if [ "$MAIN_RESPONSE" = "200" ]; then PASSED_TESTS=$((PASSED_TESTS + 1)); fi
if [ "$API_RESPONSE" = "200" ]; then PASSED_TESTS=$((PASSED_TESTS + 1)); fi
if [ "$CHECKOUT_RESPONSE" = "200" ]; then PASSED_TESTS=$((PASSED_TESTS + 1)); fi
if [ "$PRODUCTS_RESPONSE" = "200" ]; then PASSED_TESTS=$((PASSED_TESTS + 1)); fi

if [ "$PASSED_TESTS" = "$TOTAL_TESTS" ]; then
    echo "🎉 ALL TESTS PASSED! Oracle Lumira is fully operational."
else
    echo "⚠️  $PASSED_TESTS/$TOTAL_TESTS tests passed. Some issues detected."
fi
