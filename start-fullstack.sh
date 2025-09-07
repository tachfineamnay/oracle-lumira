#!/bin/bash
set -e

echo "🚀 Oracle Lumira - Minimal Startup"
echo "Time: $(date)"

cd /app

# Basic checks
echo "✓ Working directory: $(pwd)"
echo "✓ Files present:"
ls -la

# Check backend
if [ -f "apps/api-backend/dist/server.js" ]; then
    echo "✓ Backend server.js found"
else
    echo "❌ Backend server.js NOT found"
    exit 1
fi

# Check frontend
if [ -f "/usr/share/nginx/html/index.html" ]; then
    echo "✓ Frontend build found"
else
    echo "❌ Frontend build NOT found"
    exit 1
fi

# Start PM2 backend first
echo "Starting PM2 backend..."
pm2 start ecosystem.config.json --env production

# Quick wait
sleep 5

# Check if backend is running
echo "PM2 status:"
pm2 list

# Test nginx config
echo "Testing nginx config..."
nginx -t

# Start nginx in foreground (this keeps container alive)
echo "Starting nginx..."
nginx -g 'daemon off;'
