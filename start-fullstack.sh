#!/usr/bin/env bash
set -Eeuo pipefail

log() { echo "[$(date -Iseconds)] [start] $*"; }

graceful_shutdown() {
  log "SIGTERM received → stopping services..."
  pm2 delete all || true
  nginx -s quit || true
  exit 0
}
trap graceful_shutdown TERM INT

log "Booting Oracle Lumira fullstack..."

# Environment debug (production ready)
log "Environment check:"
log "- NODE_ENV=${NODE_ENV:-unset}"
log "- PORT=${PORT:-unset}" 
log "- STRIPE_SECRET_KEY=${STRIPE_SECRET_KEY:+set (${#STRIPE_SECRET_KEY} chars)}"
log "- MONGODB_URI=${MONGODB_URI:+set (${#MONGODB_URI} chars)}"

# Preflight
command -v nginx >/dev/null || { log "nginx not found"; exit 1; }
command -v pm2   >/dev/null || { log "pm2 not found"; exit 1; }
test -f /app/ecosystem.config.json || { log "missing /app/ecosystem.config.json"; exit 1; }

# Export critical environment variables for PM2
export NODE_ENV=${NODE_ENV:-production}
export PORT=${PORT:-3000}
export STRIPE_SECRET_KEY="${STRIPE_SECRET_KEY}"
export MONGODB_URI="${MONGODB_URI}"
export STRIPE_WEBHOOK_SECRET="${STRIPE_WEBHOOK_SECRET:-}"
export JWT_SECRET="${JWT_SECRET:-default_jwt_secret}"

# Start API
log "Starting API via PM2..."
pm2 start /app/ecosystem.config.json --env production
pm2 save || true
sleep 1
pm2 list || true

# Optional: wait for API socket
for i in {1..30}; do
  if nc -z 127.0.0.1 3000 2>/dev/null; then
    log "API is listening on 3000."
    break
  fi
  sleep 1
done

# Validate and start nginx (FOREGROUND)
log "Validating nginx config..."
nginx -t
log "Starting nginx (foreground)..."
exec nginx -g "daemon off;"
