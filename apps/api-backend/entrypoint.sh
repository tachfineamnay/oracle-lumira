#!/bin/sh

echo "🔧 [ENTRYPOINT] Fixing permissions for mounted volumes..."

# Obtenir l'UID de l'utilisateur nodejs
NODEJS_UID=$(id -u nodejs)
NODEJS_GID=$(id -g nodejs)

echo "📋 [ENTRYPOINT] nodejs UID: $NODEJS_UID, GID: $NODEJS_GID"

# Corriger les permissions avec le bon UID/GID
chown -R $NODEJS_UID:$NODEJS_GID /app/uploads /app/logs /app/generated 2>/dev/null || true
chmod -R 755 /app/uploads /app/logs /app/generated 2>/dev/null || true

echo "✅ [ENTRYPOINT] Permissions fixed. Starting application..."

exec su-exec nodejs node dist/server.js