#!/bin/sh

echo "🔧 [ENTRYPOINT] Fixing permissions for mounted volumes..."

chown -R 1001:1001 /app/uploads /app/logs /app/generated 2>/dev/null || true
chmod -R 755 /app/uploads /app/logs /app/generated 2>/dev/null || true

echo "✅ [ENTRYPOINT] Permissions fixed. Starting application..."

exec su-exec nodejs node dist/server.js