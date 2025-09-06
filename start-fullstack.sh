#!/bin/sh

# Oracle Lumira Fullstack Startup Script
echo "🚀 Starting Oracle Lumira Fullstack..."

# Set working directory
cd /app

# Create required directories
mkdir -p /app/logs
mkdir -p /app/uploads
mkdir -p /app/generated

# Verify ecosystem.config.json exists
if [ ! -f "ecosystem.config.json" ]; then
    echo "❌ ecosystem.config.json not found!"
    ls -la /app/
    exit 1
fi

# Show PM2 config for debugging
echo "📋 Using PM2 config:"
cat ecosystem.config.json

# Start API backend with PM2 in background
echo "📡 Starting API backend..."
echo "🔍 Directory contents:"
ls -la /app/apps/api-backend/

echo "🔍 Checking if server.js exists:"
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
