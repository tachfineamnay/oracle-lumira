FROM node:20-alpine AS builder

# Security: Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S lumira -u 1001

WORKDIR /app

# Install dependencies first for better caching
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy source and build
COPY . .
RUN npm run build

# Production stage
FROM node:20-alpine AS production

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init curl

# Create app user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S lumira -u 1001

WORKDIR /app

# Copy built application
COPY --from=builder --chown=lumira:nodejs /app/dist ./dist
COPY --from=builder --chown=lumira:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=lumira:nodejs /app/package.json ./

# Create logs directory
RUN mkdir -p /app/logs && chown lumira:nodejs /app/logs

# Switch to non-root user
USER lumira

EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:3001/health || exit 1

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/server.js"]
