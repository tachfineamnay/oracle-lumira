## Frontend-only multi-stage build (Option A: API séparée)

# Stage 1: Build frontend (Vite)
FROM node:20.18.1-alpine AS frontend-builder
WORKDIR /app

# Build-time arguments for Vite environment variables
ARG VITE_STRIPE_PUBLISHABLE_KEY
ARG VITE_API_BASE_URL
ARG VITE_APP_DOMAIN

# Set environment variables for Vite build
ENV VITE_STRIPE_PUBLISHABLE_KEY=$VITE_STRIPE_PUBLISHABLE_KEY
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_APP_DOMAIN=$VITE_APP_DOMAIN

# Install dependencies and build
COPY apps/main-app/package*.json ./apps/main-app/
RUN cd apps/main-app && npm install
COPY apps/main-app ./apps/main-app/
RUN cd apps/main-app && npm run build

# Stage 2: Nginx static server
FROM nginx:1.27-alpine

# Copy built assets
COPY --from=frontend-builder /app/apps/main-app/dist /usr/share/nginx/html

# Health file for Coolify
RUN echo '{"status":"healthy","service":"oracle-lumira-frontend","timestamp":"'$(date -Iseconds)'","port":80}' > /usr/share/nginx/html/health.json

# Minimal nginx config for SPA
COPY nginx-frontend.conf /etc/nginx/nginx.conf

EXPOSE 80

HEALTHCHECK --interval=15s --timeout=5s --start-period=60s --retries=3 \
  CMD wget -qO- http://localhost/health.json >/dev/null 2>&1 || exit 1

CMD ["nginx", "-g", "daemon off;"]
