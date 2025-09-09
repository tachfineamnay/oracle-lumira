#!/bin/bash
set -euo pipefail

echo "🔧 Coolify Environment Variable Injector"
echo "=========================================="

# Export all Coolify variables to the environment
export NODE_ENV="${NODE_ENV:-production}"
export PORT="${PORT:-3000}"
export API_PORT="${API_PORT:-3000}"

# Database
export MONGODB_URI="${MONGODB_URI:-}"
export MONGO_DB_NAME="${MONGO_DB_NAME:-lumira-mvp}"

# Stripe
export STRIPE_SECRET_KEY="${STRIPE_SECRET_KEY:-}"
export STRIPE_PUBLISHABLE_KEY="${STRIPE_PUBLISHABLE_KEY:-}"
export STRIPE_WEBHOOK_SECRET="${STRIPE_WEBHOOK_SECRET:-}"

# Security
export ALLOWED_ORIGINS="${ALLOWED_ORIGINS:-https://oraclelumira.com}"
export JWT_SECRET="${JWT_SECRET:-}"
export SESSION_SECRET="${SESSION_SECRET:-}"
export CORS_ORIGIN="${CORS_ORIGIN:-https://oraclelumira.com}"

# Expert Desk
export EXPERT_DESK_URL="${EXPERT_DESK_URL:-https://desk.oraclelumira.com}"
export API_BASE_URL="${API_BASE_URL:-https://oraclelumira.com/api}"

# System
export DEBUG="${DEBUG:-false}"
export LOG_LEVEL="${LOG_LEVEL:-info}"
export UPLOADS_DIR="${UPLOADS_DIR:-/app/uploads}"
export GENERATED_DIR="${GENERATED_DIR:-/app/generated}"
export N8N_WEBHOOK_URL="${N8N_WEBHOOK_URL:-}"

echo "✅ Environment variables exported"
echo "📋 Key variables status:"
echo "   - STRIPE_SECRET_KEY: ${STRIPE_SECRET_KEY:+SET}${STRIPE_SECRET_KEY:-MISSING}"
echo "   - MONGODB_URI: ${MONGODB_URI:+SET}${MONGODB_URI:-MISSING}"
echo "   - NODE_ENV: ${NODE_ENV}"
echo "   - PORT: ${PORT}"

# Run the original start script
exec /start.sh "$@"
