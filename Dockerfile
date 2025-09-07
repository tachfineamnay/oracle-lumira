# Multi-stage build: Frontend + Backend API

# Stage 1: Build Frontend
FROM node:20.18.1-alpine AS frontend-builder
WORKDIR /app
COPY apps/main-app/package*.json ./apps/main-app/
RUN cd apps/main-app && npm ci --frozen-lockfile
COPY apps/main-app ./apps/main-app/
RUN cd apps/main-app && npm run build

# Stage 2: Build Backend API
FROM node:20.18.1-alpine AS backend-builder
WORKDIR /app

# Copy backend package files
COPY apps/api-backend/package*.json ./apps/api-backend/
RUN cd apps/api-backend && npm ci --frozen-lockfile

# Copy backend source code
COPY apps/api-backend ./apps/api-backend/

# Build TypeScript to JavaScript and remove devDependencies
RUN cd apps/api-backend && npm run build && npm prune --omit=dev

# Stage 3: Production with nginx + Node.js 20.18.1 UNIFIED
FROM node:20.18.1-alpine

# Install nginx, PM2, netcat for health checks - all from same Node 20 base
RUN apk add --no-cache nginx curl netcat-openbsd dumb-init && \
    npm install -g pm2@latest && \
    npm cache clean --force

# Create application user for security (Coolify requirement)
RUN addgroup -g 1001 -S lumira && \
    adduser -S lumira -u 1001 -G lumira

# Setup nginx directories with proper permissions (no /var/lib/nginx/logs - use stdout/stderr)
RUN mkdir -p /run/nginx /var/log/nginx /var/cache/nginx /var/lib/nginx/tmp/client_body /var/lib/nginx/tmp/proxy /var/lib/nginx/tmp/fastcgi /var/lib/nginx/tmp/uwsgi /var/lib/nginx/tmp/scgi && \
    chown -R lumira:lumira /var/log/nginx /var/cache/nginx /run/nginx /var/lib/nginx && \
    chmod 755 /var/lib/nginx /var/lib/nginx/tmp

# Copy built frontend
COPY --from=frontend-builder --chown=lumira:lumira /app/apps/main-app/dist /usr/share/nginx/html

# Create health.json for Coolify healthcheck (port 8080)
RUN echo '{"status":"healthy","service":"oracle-lumira","timestamp":"'$(date -Iseconds)'","port":8080}' > /usr/share/nginx/html/health.json && \
    chown lumira:lumira /usr/share/nginx/html/health.json

# Copy built backend API
COPY --from=backend-builder --chown=lumira:lumira /app/apps/api-backend/dist /app/apps/api-backend/dist
COPY --from=backend-builder --chown=lumira:lumira /app/apps/api-backend/node_modules /app/apps/api-backend/node_modules
COPY --from=backend-builder --chown=lumira:lumira /app/apps/api-backend/package.json /app/apps/api-backend/

# Copy configurations (nginx config optimized for port 8080, PM2 config with stdout/stderr logs)
COPY --chown=lumira:lumira ecosystem.config.json /app/ecosystem.config.json
COPY nginx-fullstack.conf /etc/nginx/nginx.conf

# Set working directory
WORKDIR /app

# Copy optimized startup script
COPY start-fullstack.sh /start.sh
RUN chmod +x /start.sh && chown lumira:lumira /start.sh

# Switch to non-root user (Coolify requirement)
USER lumira

# Expose port 8080 (non-privileged, Coolify requirement)
EXPOSE 8080

# Health check optimized for Coolify deployment
HEALTHCHECK --interval=15s --timeout=5s --start-period=45s --retries=3 \
    CMD curl -f http://localhost:8080/health.json || exit 1

# Use dumb-init for proper signal handling
ENTRYPOINT ["dumb-init", "--"]
CMD ["/start.sh"]