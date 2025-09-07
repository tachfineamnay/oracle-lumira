#!/bin/bash
echo "🧪 ORACLE LUMIRA - API PROXY VALIDATION"
echo "======================================="

echo "🔍 Testing API endpoints after nginx proxy fix..."

# Test 1: Health check
echo ""
echo "1. Testing API health endpoint..."
HEALTH_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" https://oraclelumira.com/api/healthz)
if [ "$HEALTH_RESPONSE" = "200" ]; then
    echo "✅ /api/healthz: OK (HTTP $HEALTH_RESPONSE)"
else
    echo "❌ /api/healthz: FAILED (HTTP $HEALTH_RESPONSE)"
fi

# Test 2: Payment intent creation (the main fix)
echo ""
echo "2. Testing payment intent creation (main fix)..."
PAYMENT_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" \
  -X POST https://oraclelumira.com/api/products/create-payment-intent \
  -H "Content-Type: application/json" \
  -d '{"product":"mystique"}')

if [ "$PAYMENT_RESPONSE" != "404" ]; then
    echo "✅ /api/products/create-payment-intent: Fixed! (HTTP $PAYMENT_RESPONSE)"
    echo "   Expected: 200/201/400 (business logic), Got: $PAYMENT_RESPONSE"
else
    echo "❌ /api/products/create-payment-intent: Still 404!"
fi

# Test 3: Other API routes
echo ""
echo "3. Testing other API routes..."
PRODUCTS_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" https://oraclelumira.com/api/products)
echo "   /api/products: HTTP $PRODUCTS_RESPONSE"

ORDERS_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" https://oraclelumira.com/api/orders)  
echo "   /api/orders: HTTP $ORDERS_RESPONSE"

# Test 4: Frontend still works
echo ""
echo "4. Testing frontend SPA..."
FRONTEND_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" https://oraclelumira.com/)
if [ "$FRONTEND_RESPONSE" = "200" ]; then
    echo "✅ Frontend: OK (HTTP $FRONTEND_RESPONSE)"
else
    echo "❌ Frontend: FAILED (HTTP $FRONTEND_RESPONSE)"
fi

# Test 5: Checkout page
echo ""
echo "5. Testing checkout page..."
CHECKOUT_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "https://oraclelumira.com/commande?product=mystique")
if [ "$CHECKOUT_RESPONSE" = "200" ]; then
    echo "✅ Checkout page: OK (HTTP $CHECKOUT_RESPONSE)"
else
    echo "❌ Checkout page: FAILED (HTTP $CHECKOUT_RESPONSE)"
fi

echo ""
echo "📊 SUMMARY:"
echo "- Health endpoint: $HEALTH_RESPONSE"
echo "- Payment creation: $PAYMENT_RESPONSE (🎯 Main fix)"
echo "- Frontend: $FRONTEND_RESPONSE" 
echo "- Checkout: $CHECKOUT_RESPONSE"

echo ""
if [ "$PAYMENT_RESPONSE" != "404" ] && [ "$HEALTH_RESPONSE" = "200" ] && [ "$FRONTEND_RESPONSE" = "200" ]; then
    echo "🎉 SUCCESS: nginx proxy fix working! Payment API no longer 404"
    echo ""
    echo "✨ Next step: Test in browser:"
    echo "   1. Go to: https://oraclelumira.com/commande?product=mystique"
    echo "   2. Check browser console - no red XHR errors"
    echo "   3. Stripe Elements should load and work in test mode"
else
    echo "⚠️  Some issues remain. Check Coolify logs for details."
fi
