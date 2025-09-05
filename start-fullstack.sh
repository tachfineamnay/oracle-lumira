#!/bin/sh

# Oracle Lumira Fullstack Startup Script
echo "🚀 Starting Oracle Lumira Fullstack..."

# Set working directory
cd /app

# Create logs directory
mkdir -p /app/logs

# Start API backend with PM2
echo "📡 Starting API backend..."
pm2 start ecosystem.config.json --no-daemon --silent &

# Wait for API to be ready
echo "⏳ Waiting for API to start..."
sleep 5

# Test API health
until curl -f http://localhost:3001/api/health > /dev/null 2>&1; do
    echo "⏳ Waiting for API to be ready..."
    sleep 2
done

echo "✅ API backend is ready!"

# Start nginx in foreground
echo "🌐 Starting nginx..."
nginx -g "daemon off;" &

# Wait for any process to exit
wait

echo "❌ Process exited, shutting down..."
exit $?
