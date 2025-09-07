# Multi-stage build: Frontend + Backend API

# Stage 1: Build Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app
COPY apps/main-app/package*.json ./apps/main-app/
RUN cd apps/main-app && npm ci --frozen-lockfile
COPY apps/main-app ./apps/main-app/
RUN cd apps/main-app && npm run build

# Stage 2: Build Backend API
FROM node:20-alpine AS backend-builder
WORKDIR /app

# Copy backend package files
COPY apps/api-backend/package*.json ./apps/api-backend/
RUN cd apps/api-backend && npm ci --only=production --frozen-lockfile

# Copy backend source code
COPY apps/api-backend ./apps/api-backend/

# Build TypeScript to JavaScript
RUN cd apps/api-backend && npm run build

# Stage 3: Production with nginx + Node.js 20 UNIFIED
FROM node:20-alpine

# Install nginx and PM2 - all from same Node 20 base
RUN apk add --no-cache nginx curl dumb-init && \
    npm install -g pm2@latest && \
    npm cache clean --force

# Create application user for security
RUN addgroup -g 1001 -S lumira && \
    adduser -S lumira -u 1001 -G lumira

# Setup nginx directories
RUN mkdir -p /run/nginx /var/log/nginx && \
    chown -R lumira:lumira /var/log/nginx /var/cache/nginx

# Copy built frontend
COPY --from=frontend-builder --chown=lumira:lumira /app/apps/main-app/dist /usr/share/nginx/html

# Copy built backend API
COPY --from=backend-builder --chown=lumira:lumira /app/apps/api-backend/dist /app/apps/api-backend/dist
COPY --from=backend-builder --chown=lumira:lumira /app/apps/api-backend/node_modules /app/apps/api-backend/node_modules
COPY --from=backend-builder --chown=lumira:lumira /app/apps/api-backend/package.json /app/apps/api-backend/

# Copy configurations
COPY --chown=lumira:lumira ecosystem.config.json /app/ecosystem.config.json
COPY nginx-fullstack.conf /etc/nginx/nginx.conf

# Create logs directory
RUN mkdir -p /app/logs && chown -R lumira:lumira /app/logs

# Create startup script
COPY start-fullstack.sh /start.sh
RUN chmod +x /start.sh && chown lumira:lumira /start.sh

# Switch to non-root user
USER lumira

# Expose port
EXPOSE 80

# Health check with proper start-period for PM2 + API startup
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost/health.json && curl -f http://localhost/api/ready || exit 1

# Use dumb-init for proper signal handling
ENTRYPOINT ["dumb-init", "--"]
CMD ["/start.sh"]