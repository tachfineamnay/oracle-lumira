FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies only for the main-app to avoid monorepo path confusion
COPY apps/main-app/package*.json ./apps/main-app/
RUN cd apps/main-app && npm ci --include=dev

# Copy source and build with a clean Vite cache each time
COPY apps/main-app ./apps/main-app/
RUN cd apps/main-app \
 && rm -rf dist .vite node_modules/.vite \
 && npm run build

# Runtime stage with Nginx (SPA optimized)
FROM nginx:alpine AS production

RUN apk add --no-cache curl

# Copy built assets
COPY --from=builder /app/apps/main-app/dist /usr/share/nginx/html

# Health endpoint with timestamp
RUN echo '{"status":"healthy","service":"main-app","timestamp":"'$(date -Iseconds)'"}' > /usr/share/nginx/html/health.json

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
        add_header Cache-Control "no-cache, no-store, must-revalidate"; \
        expires -1; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost/health.json || exit 1

CMD ["nginx", "-g", "daemon off;"]

