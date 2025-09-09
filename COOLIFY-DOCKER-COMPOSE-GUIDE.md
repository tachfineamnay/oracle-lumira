# Coolify Docker Deployment Configuration Guide

## Overview
This guide explains how to deploy Oracle Lumira to Coolify using the updated docker-compose.yaml configuration that properly handles environment variables.

## Key Changes Made

### 1. Created docker-compose.yaml for Coolify
- **Purpose**: Provides proper environment variable mapping for single-container deployment
- **Location**: `/docker-compose.yaml` (root directory)
- **Key Features**:
  - Maps all required environment variables from Coolify to container
  - Correct port mapping (80:8080 for nginx, 3000 for API)
  - Health check configuration matching nginx setup
  - All environment variables properly scoped

### 2. Environment Variable Categories

#### Build-Time Variables (for frontend)
```bash
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
VITE_API_BASE_URL=/api
VITE_APP_DOMAIN=https://oraclelumira.com
```

#### Runtime Variables (for backend API)
```bash
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/lumira-mvp
MONGO_DB_NAME=lumira-mvp

# Stripe
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_PUBLISHABLE_KEY=pk_live_xxx  
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Security
JWT_SECRET=your-jwt-secret-key
SESSION_SECRET=your-session-secret

# Environment
NODE_ENV=production
PORT=3000
API_PORT=3000
```

## Deployment Steps

### 1. In Coolify Dashboard
1. **Go to your application settings**
2. **Environment Variables section**
3. **Set the following variables**:

#### Mark as "Build Time" (for frontend build):
```
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_51xxx
VITE_API_BASE_URL=/api
VITE_APP_DOMAIN=https://oraclelumira.com
```

#### Mark as "Runtime" (for backend API):
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/lumira-mvp
STRIPE_SECRET_KEY=sk_live_51xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
JWT_SECRET=your-secure-jwt-secret
SESSION_SECRET=your-secure-session-secret
NODE_ENV=production
PORT=3000
```

### 2. Coolify Configuration
1. **Build Path**: `/` (root directory)
2. **Docker Compose File**: `docker-compose.yaml`
3. **Health Check**: Enabled (uses /health.json endpoint)
4. **Port**: 80 (maps to container's 8080)

### 3. Verification Steps

#### After Deployment:
1. **Check build logs**: All frontend and backend builds should complete
2. **Check runtime logs**: Should show:
   ```
   [timestamp] [start] - STRIPE_SECRET_KEY=set (107 chars)
   [timestamp] [start] - MONGODB_URI=set (123 chars)
   [timestamp] [start] Starting PM2 API server...
   [timestamp] [start] Starting nginx...
   ```

3. **Test endpoints**:
   - `https://yourdomain.com/health.json` → Should return healthy status
   - `https://yourdomain.com/api/health` → Should return API health
   - `https://yourdomain.com/` → Should load React frontend

## Architecture Overview

```
Internet → Coolify Proxy → nginx:8080 → React SPA
                                    ↓
                                API /api/* → Node.js:3000
```

## File Structure Used
```
/
├── docker-compose.yaml          # Coolify deployment config
├── Dockerfile                   # Multi-stage build
├── start-fullstack.sh          # Container startup script
├── nginx-fullstack.conf        # nginx reverse proxy config
├── ecosystem.config.json       # PM2 process config
└── apps/
    ├── main-app/               # React frontend
    └── api-backend/            # Node.js API
```

## Troubleshooting

### Common Issues:
1. **"STRIPE_SECRET_KEY is empty"** 
   - Ensure variable is marked as "Runtime" in Coolify
   - Check docker-compose.yaml includes the variable mapping

2. **"MONGODB_URI is empty"**
   - Verify MongoDB connection string is correct
   - Ensure variable is marked as "Runtime" in Coolify

3. **Build fails with Vite errors**
   - Ensure VITE_ variables are marked as "Build Time"
   - Check that all VITE_ variables have values

4. **502 Bad Gateway**
   - Check that API is starting on port 3000
   - Verify nginx proxy configuration
   - Check container logs for API startup errors

### Debug Commands:
```bash
# Check environment variables in container
docker exec -it container_name env | grep -E "(STRIPE|MONGO|VITE)"

# Check processes
docker exec -it container_name ps aux

# Check ports
docker exec -it container_name netstat -tlnp
```

## Security Notes
- All sensitive variables (secrets, keys) should be marked as "Runtime"
- MongoDB URI should never be exposed in build logs
- Use strong JWT_SECRET and SESSION_SECRET values
- Consider using Coolify's secret management features for sensitive data

## Next Steps
1. Commit and push the new docker-compose.yaml file
2. Redeploy in Coolify
3. Monitor deployment logs for successful environment variable transmission
4. Test all endpoints after deployment
5. Set up monitoring and alerts for production environment
