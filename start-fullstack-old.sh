#!/bin/sh

# Oracle Lumira Fullstack Startup Script - Production Optimized
echo "🚀 Starting Oracle Lumira Fullstack..."

# Set working directory
cd /app

# Create required directories with proper permissions
mkdir -p /app/logs /app/uploads /app/generated
chmod 755 /app/logs /app/uploads /app/generated

# Ensure nginx directories exist and are writable
mkdir -p /var/lib/nginx/tmp /var/lib/nginx/logs
chmod 755 /var/lib/nginx/tmp /var/lib/nginx/logs

# Verify critical files exist
if [ ! -f "ecosystem.config.json" ]; then
    echo "❌ ecosystem.config.json not found!"
    exit 1
fi

if [ ! -f "apps/api-backend/dist/server.js" ]; then
    echo "❌ Backend server.js not found!"
    exit 1
fi

# Environment validation
echo "� Environment Check:"
echo "  Node: $(node --version)"
echo "  NPM: $(npm --version)"
echo "  PM2: $(pm2 --version)"
echo "  User: $(whoami)"
echo "  Working Dir: $(pwd)"
ls -la /app/apps/api-backend/dist/

# Test if Node.js can require the built server
echo "🔍 Testing built server file:"
if [ -f "/app/apps/api-backend/dist/server.js" ]; then
    echo "✅ server.js exists"
    node -e "console.log('Node.js can run')"
else
    echo "❌ server.js missing!"
    exit 1
fi

# Start PM2 in background (daemon mode)
pm2 start ecosystem.config.json

# Start nginx immediately (don't wait for API)
echo "🌐 Starting nginx..."
echo "📡 API will start in background, nginx serving frontend immediately"

# Wait for API to be ready before starting nginx
echo "⏳ Waiting for API backend to be ready..."
for i in $(seq 1 30); do
    sleep 2
    if curl -f http://localhost:3001/api/health > /dev/null 2>&1; then
        echo "✅ API backend is ready! (after ${i}x2s)"
        break
    else
        echo "⏳ Attempt $i/30: API not ready yet..."
        if [ $i -eq 30 ]; then
            echo "❌ API failed to start after 60s! PM2 status:"
            pm2 status
            pm2 logs --lines 30
            echo "⚠️ Starting nginx anyway to serve frontend..."
        fi
    fi
done

# Test API health in background while nginx runs
(
    echo "🔍 API monitoring in background..."
    for i in $(seq 1 60); do
        sleep 10
        if curl -f http://localhost:3001/api/health > /dev/null 2>&1; then
            echo "✅ API backend running normally (check ${i})"
        else
            echo "⚠️ API health check failed (check ${i})"
            pm2 status
        fi
    done
) &

# Start nginx in foreground (main process)
nginx -g "daemon off;"
