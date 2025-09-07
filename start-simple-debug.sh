#!/bin/bash
set -e

echo "🚀 Oracle Lumira - Simple Startup (Debug Mode)"
echo "Current time: $(date)"
echo "Environment: NODE_ENV=${NODE_ENV:-not set}"
echo "Port: PORT=${PORT:-not set}"
echo "Working dir: $(pwd)"

# Set working directory
cd /app

# Check basic requirements
echo ""
echo "📋 File System Check:"
echo "- Ecosystem config: $(ls -la ecosystem.config.json 2>/dev/null | cut -d' ' -f1 || echo 'NOT FOUND')"
echo "- Backend server: $(ls -la apps/api-backend/dist/server.js 2>/dev/null | cut -d' ' -f1 || echo 'NOT FOUND')"
echo "- Frontend build: $(ls -la /usr/share/nginx/html/index.html 2>/dev/null | cut -d' ' -f1 || echo 'NOT FOUND')"

# Simple nginx test
echo ""
echo "🌐 Testing nginx..."
nginx -t 2>&1 || {
    echo "❌ nginx test failed, showing config:"
    cat /etc/nginx/nginx.conf
    exit 1
}

# Start PM2 backend
echo ""
echo "📡 Starting backend with PM2..."
pm2 delete all 2>/dev/null || true  # Clear any existing processes
pm2 start ecosystem.config.json --env production

# Simple wait
echo "⏳ Waiting 10 seconds for backend startup..."
sleep 10

# Check PM2 status
echo "📋 PM2 Status:"
pm2 status
pm2 logs --nostream --lines 10

# Simple port check
echo ""
echo "🔍 Port Check:"
netstat -tlnp 2>/dev/null | grep :3000 || echo "Port 3000 not listening"

# Start nginx and keep it running
echo ""
echo "🌐 Starting nginx (this will block)..."
exec nginx -g 'daemon off;'
