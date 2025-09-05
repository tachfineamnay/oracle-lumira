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

# Start API backend with PM2
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

pm2 start ecosystem.config.json --no-daemon --silent

# Wait longer for API to start
echo "⏳ Waiting for API to start..."
sleep 10

# Test API health with better error handling
echo "🔍 Testing API health..."
for i in $(seq 1 30); do
    if curl -f http://localhost:3001/api/health > /dev/null 2>&1; then
        echo "✅ API backend is ready!"
        break
    else
        echo "⏳ Attempt $i/30: API not ready yet..."
        sleep 2
    fi
done

# Check if API is actually running
if ! curl -f http://localhost:3001/api/health > /dev/null 2>&1; then
    echo "❌ API failed to start! Checking PM2 logs..."
    pm2 logs --lines 50
    echo "❌ Starting nginx anyway for static files..."
fi

# Start nginx in foreground
echo "🌐 Starting nginx..."
nginx -g "daemon off;"
