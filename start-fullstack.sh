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

# Create environment file for PM2
log "Creating PM2 environment file..."
cat > /app/.env << EOF
NODE_ENV=${NODE_ENV:-production}
PORT=${PORT:-3000}
STRIPE_SECRET_KEY=${STRIPE_SECRET_KEY:-}
MONGODB_URI=${MONGODB_URI:-}
STRIPE_WEBHOOK_SECRET=${STRIPE_WEBHOOK_SECRET:-}
JWT_SECRET=${JWT_SECRET:-default_jwt_secret}
VITE_STRIPE_PUBLISHABLE_KEY=${VITE_STRIPE_PUBLISHABLE_KEY:-}
VITE_API_BASE_URL=${VITE_API_BASE_URL:-}
AWS_LECTURES_BUCKET_NAME=${AWS_LECTURES_BUCKET_NAME:-oracle-lumira-lectures}
EOF

# Validate critical variables
if [ -z "${STRIPE_SECRET_KEY:-}" ]; then
  log "WARNING: STRIPE_SECRET_KEY is empty or unset"
else
  log "- STRIPE_SECRET_KEY=set (${#STRIPE_SECRET_KEY} chars)"
fi

if [ -z "${MONGODB_URI:-}" ]; then
  log "WARNING: MONGODB_URI is empty or unset"  
else
  log "- MONGODB_URI=set (${#MONGODB_URI} chars)"
fi

# Preflight
command -v nginx >/dev/null || { log "nginx not found"; exit 1; }
command -v pm2   >/dev/null || { log "pm2 not found"; exit 1; }
test -f /app/ecosystem.config.json || { log "missing /app/ecosystem.config.json"; exit 1; }

# Start API
log "Starting API via PM2..."
cd /app
pm2 start /app/ecosystem.config.json --env production
pm2 save || true
sleep 1
pm2 list || true
pm2 logs --nostream || true

# Optional: wait for API socket
for i in {1..30}; do
  if nc -z 127.0.0.1 3000 2>/dev/null; then
    log "API is listening on 3000."
    break
  fi
  sleep 1
done

if ! nc -z 127.0.0.1 3000 2>/dev/null; then
  log "ERROR: API failed to start on port 3000 after 30 seconds"
  pm2 logs --nostream || true
  exit 1
fi

# Validate and start nginx (FOREGROUND)
log "Validating nginx config..."
nginx -t
log "Starting nginx (foreground)..."
exec nginx -g "daemon off;"
