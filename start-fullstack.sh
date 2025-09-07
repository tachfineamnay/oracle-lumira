#!/bin/bash
set -e

echo "🚀 Oracle Lumira - Production Startup"
echo "Time: $(date)"

cd /app

# Environment validation
echo "📋 Environment Check:"
echo "  Node: $(node --version)"
echo "  PM2: $(pm2 --version)"
echo "  Working Dir: $(pwd)"
echo "  PORT: ${PORT:-3000}"

# Verify critical files exist
echo "🔍 File System Check:"
if [ ! -f "apps/api-backend/dist/server.js" ]; then
    echo "❌ Backend server.js NOT found at apps/api-backend/dist/server.js"
    ls -la apps/api-backend/dist/ || echo "dist/ directory not found"
    exit 1
fi
echo "✅ Backend server.js found"

if [ ! -f "/usr/share/nginx/html/index.html" ]; then
    echo "❌ Frontend build NOT found at /usr/share/nginx/html/index.html"
    ls -la /usr/share/nginx/html/ || echo "nginx html directory not found"
    exit 1
fi
echo "✅ Frontend build found"

# Test nginx configuration
echo "🌐 Testing nginx configuration..."
nginx -t || {
    echo "❌ nginx configuration test failed"
    exit 1
}
echo "✅ nginx configuration OK"

# Start API backend with PM2 in background
echo "🚀 Starting API backend with PM2..."
pm2 start ecosystem.config.json --env production

# Wait for API to be ready
echo "⏳ Waiting for API to be ready..."
TIMEOUT=30
COUNTER=0

while [ $COUNTER -lt $TIMEOUT ]; do
    if pm2 list | grep -q "online"; then
        echo "✅ PM2 backend is online"
        break
    fi
    COUNTER=$((COUNTER + 1))
    echo "  Waiting... ($COUNTER/$TIMEOUT)"
    sleep 1
done

if [ $COUNTER -eq $TIMEOUT ]; then
    echo "❌ Backend failed to start within ${TIMEOUT}s"
    pm2 list
    pm2 logs --nostream --lines 20
    exit 1
fi

# Show PM2 status
echo "📊 PM2 Status:"
pm2 list

# Start nginx in foreground (keeps container alive)
echo "🌐 Starting nginx in foreground..."
exec nginx -g 'daemon off;'
