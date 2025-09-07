# Oracle Lumira - Coolify Deployment Runbook

## 🚀 DEPLOYMENT FIXES APPLIED

### Container Runtime Configuration
- **nginx**: Listens on port 8080 (non-privileged)
- **PM2 Backend**: Runs Node.js API on port 3000  
- **Proxy Setup**: nginx proxies `/api/*` → `localhost:3000`
- **Health Check**: nginx serves `/health.json` at port 8080
- **Foreground Process**: nginx runs with `daemon off;` to keep container alive

### Files Modified
1. **start-fullstack.sh**: Production-ready startup sequence
2. **nginx-fullstack.conf**: Already configured for port 8080 + API proxy
3. **ecosystem.config.json**: PM2 points to dist/server.js on port 3000
4. **Dockerfile**: EXPOSE 8080, healthcheck to /health.json

## 🎯 COOLIFY CONFIGURATION REQUIRED

### Application Settings
```
Internal Port: 8080
```

### Build Arguments (Environment Variables)
```bash
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_51S4iWfCg2sJwWkKJEVoXyWYjclvCVA2T2nzmUiTvWsZTrmG1fAhbh2Ve4ksNalbcbOfln2x6auK32tUAyHcHR8cc00gu9wOgnl
VITE_API_BASE_URL=https://oraclelumira.com/api
```

### Health Check Configuration
```bash
# Coolify health check endpoint (nginx level)
GET /health.json

# Expected response:
HTTP 200
Content-Type: application/json
{"status":"healthy","service":"oracle-lumira","timestamp":"...","port":8080}
```

## 📋 DEPLOYMENT VALIDATION CHECKLIST

### After Redeploy
1. **Container Status**: Should show `healthy` in Coolify
2. **Health Check**: `curl https://oraclelumira.com/health.json` → HTTP 200
3. **API Health**: `curl https://oraclelumira.com/api/healthz` → HTTP 200  
4. **Frontend**: `curl https://oraclelumira.com/` → HTTP 200
5. **PM2 Status**: Container logs should show "PM2 backend is online"
6. **nginx Status**: Container logs should show "nginx configuration OK"

### Test Commands
```bash
# Health endpoint (nginx level)
curl -f https://oraclelumira.com/health.json

# API health (proxied to Node.js)  
curl -f https://oraclelumira.com/api/healthz

# Frontend SPA
curl -f https://oraclelumira.com/

# Stripe checkout page
curl -f "https://oraclelumira.com/commande?product=mystique"
```

## 🔧 TROUBLESHOOTING

### If Container is Unhealthy
1. Check Coolify logs for startup sequence
2. Verify nginx configuration: `nginx -t`
3. Check PM2 status: `pm2 list`
4. Test health endpoint: `curl localhost:8080/health.json`

### If API Calls Fail
1. Verify VITE_API_BASE_URL build argument is set correctly
2. Check nginx proxy configuration for `/api/*`
3. Test API directly: `curl localhost:3000/api/healthz`
4. Check PM2 logs: `pm2 logs`

### If Frontend Doesn't Load
1. Verify frontend build completed successfully
2. Check nginx serves static files from `/usr/share/nginx/html`
3. Test: `curl localhost:8080/` should return HTML

## 🎉 EXPECTED RESULT

- Container status: **healthy**
- Main site: https://oraclelumira.com → Working React SPA
- API endpoints: https://oraclelumira.com/api/* → Proxied to Node.js backend  
- Checkout flow: https://oraclelumira.com/commande?product=mystique → Working Stripe integration
- Expert desk: https://desk.oraclelumira.com → Working (separate deployment)

## 📝 DEPLOYMENT HISTORY

- **Previous Issue**: Container went unhealthy, nginx not listening on 8080, missing API proxy
- **Fix Applied**: nginx@8080 + pm2-runtime + api proxy + foreground process
- **Commit**: `fix(runtime): nginx@8080 + pm2-runtime + api proxy`
- **Expected**: Container healthy, all endpoints working
