#!/bin/bash
echo "🧪 LOCAL DOCKER VALIDATION FOR ORACLE LUMIRA"
echo "============================================="

# Build with proper args
echo "📦 Building image..."
docker build -t oracle-lumira:test \
  --build-arg VITE_STRIPE_PUBLISHABLE_KEY=pk_test_dummy \
  --build-arg VITE_API_BASE_URL=http://localhost:8080/api \
  .

if [ $? -ne 0 ]; then
  echo "❌ Build failed!"
  exit 1
fi

echo "✅ Build successful"

# Run container
echo "🚀 Starting container..."
CONTAINER_ID=$(docker run -d -p 8080:8080 oracle-lumira:test)
echo "Container ID: $CONTAINER_ID"

# Wait for startup
echo "⏳ Waiting 60s for container startup..."
sleep 60

# Test endpoints
echo "🔍 Testing endpoints..."

echo -n "Health check: "
HEALTH=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/health.json)
if [ "$HEALTH" = "200" ]; then
  echo "✅ $HEALTH"
else
  echo "❌ $HEALTH"
fi

echo -n "Frontend: "
FRONTEND=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/)
if [ "$FRONTEND" = "200" ]; then
  echo "✅ $FRONTEND"
else
  echo "❌ $FRONTEND"
fi

echo -n "API health: "
API=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/api/healthz)
if [ "$API" = "200" ]; then
  echo "✅ $API"
else
  echo "❌ $API"
fi

# Show container diagnostics
echo ""
echo "📊 Container diagnostics:"
docker exec $CONTAINER_ID bash -c 'nginx -t && echo "nginx OK"' 2>/dev/null || echo "nginx issue"
docker exec $CONTAINER_ID bash -c 'pm2 list' 2>/dev/null || echo "PM2 issue"
docker exec $CONTAINER_ID bash -c 'ss -lntp | grep -E "8080|3000"' 2>/dev/null || echo "Port issue"

# Cleanup
echo "🧹 Cleaning up..."
docker stop $CONTAINER_ID >/dev/null
docker rm $CONTAINER_ID >/dev/null

echo ""
if [ "$HEALTH" = "200" ] && [ "$FRONTEND" = "200" ] && [ "$API" = "200" ]; then
  echo "🎉 ALL TESTS PASSED!"
  exit 0
else
  echo "⚠️  SOME TESTS FAILED"
  exit 1
fi
