FROM node:20-alpine AS builder

WORKDIR /app

# Copier d'abord les fichiers de configuration du workspace depuis la racine
COPY ../../package.json ../../package-lock.json ./

# Installer toutes les dépendances du workspace (incluant vite)
RUN npm ci --include=dev

# Installer le binding Linux pour Rollup
RUN npm install @rollup/rollup-linux-x64-musl --save-dev

# Copier le code source de main-app
COPY . ./apps/main-app

# Se placer dans le répertoire main-app pour le build
WORKDIR /app/apps/main-app

# Build (maintenant vite est disponible dans ../node_modules)
RUN npm run build

# Production stage with Nginx
FROM nginx:alpine AS production

# Install curl for healthcheck
RUN apk add --no-cache curl

# Copy built application
COPY --from=builder /app/apps/main-app/dist /usr/share/nginx/html

# Create health endpoint
RUN echo '{"status":"healthy","service":"main-app","timestamp":"'$(date -Iseconds)'"}' > /usr/share/nginx/html/health.json

# Nginx configuration optimized for SPA
RUN echo 'server { \
    listen 80; \
    server_name _; \
    root /usr/share/nginx/html; \
    index index.html; \
    client_max_body_size 100M; \
    \
    # Security headers \
    add_header X-Frame-Options "DENY" always; \
    add_header X-Content-Type-Options "nosniff" always; \
    add_header X-XSS-Protection "1; mode=block" always; \
    \
    # Compression \
    gzip on; \
    gzip_vary on; \
    gzip_min_length 1024; \
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript; \
    \
    # Cache static assets \
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ { \
        expires 1y; \
        add_header Cache-Control "public, immutable"; \
    } \
    \
    # Health check \
    location /health.json { \
        access_log off; \
    } \
    \
    # SPA routing \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost/health.json || exit 1

CMD ["nginx", "-g", "daemon off;"]
