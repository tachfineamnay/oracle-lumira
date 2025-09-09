# Multi-stage build: Frontend + Backend API

# Stage 1: Build Frontend with Vite environment variables
FROM node:20.18.1-alpine AS frontend-builder
WORKDIR /app

# Build-time arguments for Vite environment variables
ARG VITE_STRIPE_PUBLISHABLE_KEY
ARG VITE_API_BASE_URL

# Set environment variables for Vite build
ENV VITE_STRIPE_PUBLISHABLE_KEY=$VITE_STRIPE_PUBLISHABLE_KEY
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# Copy and install frontend dependencies
COPY apps/main-app/package*.json ./apps/main-app/
RUN cd apps/main-app && npm ci --frozen-lockfile

# Install Linux-specific rollup binding for Alpine
RUN cd apps/main-app && npm install @rollup/rollup-linux-x64-musl --save-dev

# Copy frontend source and build with environment variables
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

# Install nginx, PM2, netcat for health checks, bash for startup script
RUN apk add --no-cache nginx curl netcat-openbsd dumb-init bash && \
    npm install -g pm2@latest && \
    npm cache clean --force

# Setup nginx directories with proper permissions
RUN mkdir -p /run/nginx /var/log/nginx /var/cache/nginx /var/lib/nginx/tmp && \
    chmod -R 755 /var/lib/nginx /var/log/nginx /var/cache/nginx /run/nginx

# Copy built frontend to nginx html directory
COPY --from=frontend-builder /app/apps/main-app/dist /usr/share/nginx/html

# Create health.json for Coolify healthcheck (port 8080)
RUN echo '{"status":"healthy","service":"oracle-lumira","timestamp":"'$(date -Iseconds)'","port":8080}' > /usr/share/nginx/html/health.json

# Copy built backend API
COPY --from=backend-builder /app/apps/api-backend/dist /app/apps/api-backend/dist
COPY --from=backend-builder /app/apps/api-backend/node_modules /app/apps/api-backend/node_modules
COPY --from=backend-builder /app/apps/api-backend/package.json /app/apps/api-backend/

# Copy configurations
COPY ecosystem.config.json /app/ecosystem.config.json
COPY nginx-fullstack.conf /etc/nginx/nginx.conf

# Set working directory
WORKDIR /app

# Copy startup script
COPY start-fullstack.sh /start.sh
RUN chmod +x /start.sh

# Expose port 8080 for nginx
EXPOSE 8080

# Health check for Coolify with increased start period
HEALTHCHECK --interval=15s --timeout=5s --start-period=90s --retries=3 \
    CMD curl -fsS http://localhost:8080/health.json || exit 1

# Use dumb-init for proper signal handling
ENTRYPOINT ["dumb-init", "--"]
CMD ["/start.sh"]
