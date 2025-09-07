#!/bin/bash
set -e

echo "🚀 Starting Oracle Lumira Full-Stack Application..."
echo "📝 Node version: $(node --version)"
echo "📝 NPM version: $(npm --version)"
echo "📝 PM2 version: $(pm2 --version)"
echo "📝 Current directory: $(pwd)"

# Set working directory
cd /app

# Verify critical files exist
echo "🔍 Verifying required files..."
if [ ! -f "ecosystem.config.json" ]; then
    echo "❌ ecosystem.config.json not found!"
    exit 1
fi

if [ ! -f "apps/api-backend/dist/server.js" ]; then
    echo "❌ Backend server.js not found!"
    echo "📁 Contents of apps/api-backend/:"
    ls -la apps/api-backend/ || echo "Directory not found"
    exit 1
fi

if [ ! -f "/usr/share/nginx/html/index.html" ]; then
    echo "❌ Frontend build not found!"
    echo "📁 Contents of /usr/share/nginx/html/:"
    ls -la /usr/share/nginx/html/ || echo "Directory not found"
    exit 1
fi

echo "✅ All required files found"

# Test nginx configuration
echo "🔍 Testing nginx configuration..."
nginx -t || {
    echo "❌ nginx configuration test failed!"
    echo "📄 nginx config contents:"
    cat /etc/nginx/nginx.conf
    exit 1
}
echo "✅ nginx configuration is valid"

# Start API backend with PM2 in background
echo "📡 Starting API backend with PM2..."
pm2 start ecosystem.config.json --env production

# Wait for API to be ready
echo "⏳ Waiting for API to be ready on port 3000..."
TIMEOUT=60
COUNTER=0

while [ $COUNTER -lt $TIMEOUT ]; do
    if curl -s -f http://127.0.0.1:3000/api/healthz >/dev/null 2>&1; then
        echo "✅ API is ready on port 3000"
        break
    fi
    
    COUNTER=$((COUNTER + 1))
    if [ $((COUNTER % 10)) -eq 0 ]; then
        echo "  Still waiting... (${COUNTER}/${TIMEOUT}s)"
        echo "📋 PM2 Status:"
        pm2 status
    fi
    sleep 1
done

if [ $COUNTER -eq $TIMEOUT ]; then
    echo "❌ API failed to start within ${TIMEOUT}s timeout"
    echo "📋 PM2 Status:"
    pm2 status
    echo "📋 PM2 Logs:"
    pm2 logs --nostream --lines 50
    exit 1
fi

# Test API endpoint
echo "🔍 Testing API health endpoint..."
API_RESPONSE=$(curl -s http://127.0.0.1:3000/api/healthz || echo "ERROR")
if [ "$API_RESPONSE" != "ERROR" ]; then
    echo "✅ API health endpoint responded: $API_RESPONSE"
else
    echo "⚠️  API health endpoint not accessible (continuing anyway)"
fi

# Start nginx in foreground (keeps container alive)
echo "🌐 Starting nginx on port 8080 (foreground)..."
exec nginx -g 'daemon off;'
