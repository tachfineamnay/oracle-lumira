FROM node:20-alpine AS builder

WORKDIR /app

# Use root workspace lockfile for deterministic installs
# 1) Copy root package.json + lockfile
COPY package*.json ./
# 2) Copy the workspace package.json so npm can resolve the workspace
COPY apps/main-app/package*.json ./apps/main-app/
# 3) Install only the workspace dependencies using the root lockfile
RUN npm ci --include=dev --workspace apps/main-app

# Copy source and build with a clean Vite cache each time
COPY apps/main-app ./apps/main-app/

# CACHE BUSTING: ARG to invalidate Docker layer cache on every build
ARG BUILD_VERSION=unknown
ARG BUILD_TIMESTAMP=unknown
ENV VITE_BUILD_VERSION=$BUILD_VERSION
ENV VITE_BUILD_TIMESTAMP=$BUILD_TIMESTAMP

RUN cd apps/main-app \
 && echo "Building version: $BUILD_VERSION at $BUILD_TIMESTAMP" \
 && rm -rf dist .vite node_modules/.vite node_modules/.cache \
 && npm run build

# Runtime stage with Nginx (SPA optimized)
FROM nginx:alpine AS production

RUN apk add --no-cache curl

# Copy built assets
COPY --from=builder /app/apps/main-app/dist /usr/share/nginx/html

# Health endpoint with BUILD_VERSION and timestamp for traceability
ARG BUILD_VERSION=unknown
ARG BUILD_TIMESTAMP=unknown
RUN echo '{"status":"healthy","service":"main-app","version":"'$BUILD_VERSION'","buildTimestamp":"'$BUILD_TIMESTAMP'","deployTimestamp":"'$(date -Iseconds)'"}' > /usr/share/nginx/html/health.json

# Nginx configuration optimized for SPA & cache-busting
RUN echo 'server { \
    listen 80; \
    server_name _; \
    root /usr/share/nginx/html; \
    index index.html; \
    client_max_body_size 1024M; \
    \
    add_header X-Frame-Options "DENY" always; \
    add_header X-Content-Type-Options "nosniff" always; \
    add_header X-XSS-Protection "1; mode=block" always; \
    \
    gzip on; \
    gzip_vary on; \
    gzip_min_length 1024; \
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript; \
    \
    # Cache immutable assets (Vite filename hashing) \
    location ~* \\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ { \
        expires 1y; \
        add_header Cache-Control "public, immutable"; \
    } \
    \
    location = /health.json { \
        add_header Cache-Control "no-cache"; \
    } \
    \
    # Serve SPA and prevent caching of HTML to avoid stale index.html \
    location / { \
        add_header Cache-Control "no-cache, no-store, must-revalidate, max-age=0"; \
        add_header Pragma "no-cache"; \
        add_header Expires "0"; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost/health.json || exit 1

CMD ["nginx", "-g", "daemon off;"]
