#!/bin/bash
set -e

echo "🔧 Oracle Lumira - Debug Startup"
echo "================================="
echo "Time: $(date)"
echo "Node: $(node --version)"
echo "PM2: $(pm2 --version)"
echo "PWD: $(pwd)"

cd /app

# File verification
echo ""
echo "📁 File Check:"
echo "Backend: $(ls -la apps/api-backend/dist/server.js 2>/dev/null || echo 'MISSING')"
echo "Frontend: $(ls -la /usr/share/nginx/html/index.html 2>/dev/null || echo 'MISSING')" 
echo "Ecosystem: $(ls -la ecosystem.config.json 2>/dev/null || echo 'MISSING')"

# nginx test
echo ""
echo "🌐 nginx Test:"
nginx -t 2>&1 || {
    echo "❌ nginx test failed"
    exit 1
}

# Start backend
echo ""
echo "🚀 Starting Backend:"
pm2 start ecosystem.config.json --env production
sleep 10

echo "📊 PM2 Status:"
pm2 list

# Check if port 3000 is listening
echo ""
echo "🔌 Port Check:"
netstat -tlnp 2>/dev/null | grep :3000 || echo "Port 3000 not listening"

# Start nginx
echo ""
echo "🌐 Starting nginx:"
exec nginx -g 'daemon off;'
