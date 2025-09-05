FROM node:18-alpine AS builder

# Build the main app from monorepo root context
WORKDIR /app/apps/main-app
COPY apps/main-app/package*.json ./
# Install all dependencies (including dev) for building
RUN npm ci

# Copy application source
COPY apps/main-app ./

# Build application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built application
COPY --from=builder /app/apps/main-app/dist /usr/share/nginx/html

# Copy nginx configuration from repository root
COPY nginx.conf /etc/nginx/nginx.conf

# Install curl for container HEALTHCHECK
RUN apk add --no-cache curl

# Set permissions (nginx user already exists in nginx:alpine)
RUN chown -R nginx:nginx /usr/share/nginx/html \
	&& chown -R nginx:nginx /var/cache/nginx

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
	CMD curl -f http://localhost/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
