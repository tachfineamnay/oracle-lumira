# Multi-stage build: Frontend + Backend API

# Stage 1: Build Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app
COPY apps/main-app/package*.json ./apps/main-app/
RUN cd apps/main-app && npm ci
COPY apps/main-app ./apps/main-app/
RUN cd apps/main-app && npm run build

# Stage 2: Build Backend API
FROM node:20-alpine AS backend-builder
WORKDIR /app
COPY apps/api-backend/package*.json ./apps/api-backend/
RUN cd apps/api-backend && npm ci --only=production
COPY apps/api-backend ./apps/api-backend/
RUN cd apps/api-backend && npm run build

# Stage 3: Production with nginx + Node.js
FROM nginx:alpine

# Install Node.js and PM2 for running API
RUN apk add --no-cache nodejs npm
RUN npm install -g pm2

# Copy built frontend
COPY --from=frontend-builder /app/apps/main-app/dist /usr/share/nginx/html

# Copy built backend
COPY --from=backend-builder /app/apps/api-backend/dist /app/api
COPY --from=backend-builder /app/apps/api-backend/node_modules /app/node_modules
COPY --from=backend-builder /app/apps/api-backend/package.json /app/

# Copy nginx configuration for fullstack (frontend + API proxy)
COPY nginx-fullstack.conf /etc/nginx/nginx.conf

# Install curl for container HEALTHCHECK
RUN apk add --no-cache curl

# Create PM2 ecosystem file for API
RUN echo '{ "apps": [{ "name": "lumira-api", "script": "/app/api/server.js", "env": { "NODE_ENV": "production", "PORT": "3001" } }] }' > /app/ecosystem.config.json

# Create startup script
COPY start-fullstack.sh /start.sh
RUN chmod +x /start.sh

# Set permissions (nginx user already exists in nginx:alpine)
RUN chown -R nginx:nginx /usr/share/nginx/html \
	&& chown -R nginx:nginx /var/cache/nginx

# Expose port
EXPOSE 80

# Health check for both frontend and API
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD curl -f http://localhost/ && curl -f http://localhost/api/health || exit 1

# Start with our custom script
CMD ["/start.sh"]