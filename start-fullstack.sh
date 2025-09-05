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

# Test API health in background while nginx runs
(
    echo "🔍 Testing API health in background..."
    for i in $(seq 1 60); do
        sleep 5
        if curl -f http://localhost:3001/api/health > /dev/null 2>&1; then
            echo "✅ API backend is ready! (after ${i}x5s)"
            break
        else
            echo "⏳ Attempt $i/60: API not ready yet..."
        fi
    done
    
    # Final API status check
    if ! curl -f http://localhost:3001/api/health > /dev/null 2>&1; then
        echo "❌ API failed to start after 5 minutes! PM2 status:"
        pm2 status
        pm2 logs --lines 20
    fi
) &

# Start nginx in foreground (main process)
nginx -g "daemon off;"
