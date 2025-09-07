#!/bin/sh

# Oracle Lumira Fullstack Startup Script - Production Optimized
echo "🚀 Starting Oracle Lumira Fullstack..."

# Set working directory
cd /app

# Environment validation
echo "🔍 Environment Check:"
echo "  Node: $(node --version)"
echo "  NPM: $(npm --version)"
echo "  PM2: $(pm2 --version)"
echo "  User: $(whoami)"
echo "  Working Dir: $(pwd)"

# Verify critical files exist
if [ ! -f "ecosystem.config.json" ]; then
    echo "❌ ecosystem.config.json not found!"
    exit 1
fi

if [ ! -f "apps/api-backend/dist/server.js" ]; then
    echo "❌ Backend server.js not found!"
    exit 1
fi

# Start API backend with PM2
echo "📡 Starting API backend on port 3000..."
pm2-runtime start ecosystem.config.json --env production &
PM2_PID=$!

# Wait for API to be ready with proper timeout
echo "⏳ Waiting for API to be ready on port 3000..."
TIMEOUT=30
COUNTER=0
API_READY=false

while [ $COUNTER -lt $TIMEOUT ]; do
    if nc -z 127.0.0.1 3000 2>/dev/null; then
        echo "✅ API is ready on port 3000"
        API_READY=true
        break
    fi
    
    COUNTER=$((COUNTER + 1))
    echo "  Attempt $COUNTER/$TIMEOUT - API not ready yet..."
    sleep 1
done

if [ "$API_READY" = false ]; then
    echo "❌ API failed to start within ${TIMEOUT}s timeout"
    echo "📋 PM2 Status:"
    pm2 status
    echo "📋 PM2 Logs:"
    pm2 logs --nostream
    exit 1
fi

# Test API endpoint before starting nginx
echo "🔍 Testing API health endpoint..."
API_HEALTH=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3000/api/health 2>/dev/null || echo "000")
if [ "$API_HEALTH" != "200" ]; then
    echo "⚠️  API health endpoint returned $API_HEALTH (continuing anyway)"
else
    echo "✅ API health endpoint OK"
fi

# Start Nginx in foreground
echo "🌐 Starting Nginx on port 8080..."
echo "📋 Nginx configuration test:"
nginx -t

if [ $? -eq 0 ]; then
    echo "✅ Nginx configuration is valid"
    echo "🚀 Starting Nginx in foreground..."
    exec nginx -g 'daemon off;'
else
    echo "❌ Nginx configuration is invalid"
    exit 1
fi
