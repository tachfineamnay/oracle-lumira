FROM node:18-alpine AS builder

# Install dependencies for the main app
WORKDIR /app/apps/main-app
COPY apps/main-app/package*.json ./
# Install all deps (incl. dev) for building in builder stage
RUN npm ci

# Copy application source
COPY apps/main-app ./

# Build application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built application
COPY --from=builder /app/apps/main-app/dist /usr/share/nginx/html

# Copy nginx configuration from repository root (build context root)
COPY nginx.conf /etc/nginx/nginx.conf

# Install curl for healthcheck
RUN apk add --no-cache curl

# Create non-root user
RUN addgroup -g 1001 -S nginx && \
    adduser -S -D -H -u 1001 -h /var/cache/nginx -s /sbin/nologin -G nginx -g nginx nginx

# Set permissions
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chown -R nginx:nginx /var/cache/nginx

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
