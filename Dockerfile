## Frontend-only multi-stage build (Option A: API séparée)

# Stage 1: Build frontend (Vite)
FROM node:20.18.1-alpine AS frontend-builder
WORKDIR /app

# Build-time arguments for Vite environment variables
ARG VITE_STRIPE_PUBLISHABLE_KEY
ARG VITE_API_URL
ARG VITE_API_BASE_URL
ARG VITE_APP_DOMAIN
# CACHE BUSTING: Force rebuild on every deploy by passing commit SHA
ARG BUILD_VERSION=unknown
ARG BUILD_TIMESTAMP=unknown

# Set environment variables for Vite build
ENV VITE_STRIPE_PUBLISHABLE_KEY=$VITE_STRIPE_PUBLISHABLE_KEY
# Primary variable used by frontend code
ENV VITE_API_URL=$VITE_API_URL
# Backward compatibility fallback
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_APP_DOMAIN=$VITE_APP_DOMAIN
ENV VITE_BUILD_VERSION=$BUILD_VERSION
ENV VITE_BUILD_TIMESTAMP=$BUILD_TIMESTAMP

# Install dependencies and build
COPY apps/main-app/package*.json ./apps/main-app/
RUN cd apps/main-app && npm install
COPY apps/main-app ./apps/main-app/
# CACHE INVALIDATION: Clean ALL Vite caches + inject build version to bust Docker layer cache
RUN cd apps/main-app && rm -rf dist .vite node_modules/.vite node_modules/.cache
RUN echo "Building version: $BUILD_VERSION at $BUILD_TIMESTAMP" && \
    cd apps/main-app && npm run build

# Stage 2: Nginx static server
FROM nginx:1.27-alpine

# Install curl for healthcheck
RUN apk add --no-cache curl

# Copy built assets
COPY --from=frontend-builder /app/apps/main-app/dist /usr/share/nginx/html

# Health file for Coolify with BUILD_VERSION for traceability
ARG BUILD_VERSION=unknown
ARG BUILD_TIMESTAMP=unknown
RUN echo '{"status":"healthy","service":"oracle-lumira-frontend","version":"'$BUILD_VERSION'","buildTimestamp":"'$BUILD_TIMESTAMP'","deployTimestamp":"'$(date -Iseconds)'","port":80}' > /usr/share/nginx/html/health.json

# Minimal nginx config for SPA
COPY nginx-frontend.conf /etc/nginx/nginx.conf

EXPOSE 80

HEALTHCHECK --interval=15s --timeout=5s --start-period=60s --retries=3 \
  CMD curl -fsS http://localhost/health.json || exit 1

CMD ["nginx", "-g", "daemon off;"]
