# Oracle Lumira - Coolify v4 Deployment Runbook

## 🚀 FIXES APPLIED

### Container Runtime Hardening
- **bash**: Added to Alpine image for robust startup script
- **nginx**: Clean config on port 8080, proxy `/api/` → `127.0.0.1:3000/`
- **PM2**: Simplified config pointing to `/app/apps/api-backend/dist/server.js`
- **Health**: Increased start-period to 90s for graceful boot
- **Signals**: Proper SIGTERM handling for graceful shutdown

### Frontend API Base Fallback
- **lib/apiBase.ts**: Robust function with fallback to `/api` if build arg missing
- **utils/api.ts**: Uses the fallback function for resilient API calls
- **No localhost deps**: Works even if `VITE_API_BASE_URL` not provided

### Files Modified
```
nginx-fullstack.conf     → Clean single server on 8080
start-fullstack.sh       → Bash + graceful shutdown + diagnostics
ecosystem.config.json    → Simplified PM2 config
Dockerfile              → Added bash + 90s healthcheck start-period
apps/main-app/src/lib/apiBase.ts   → NEW: Robust API base URL
apps/main-app/src/utils/api.ts     → Uses apiBase fallback
```

## 🎯 COOLIFY V4 CONFIGURATION

### Environment Variables (Production)
Navigate to: **Configuration → Environment Variables**

Set these variables with **"Is Build Variable?" checked**:
```bash
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_51S4iWfCg2sJwWkKJEVoXyWYjclvCVA2T2nzmUiTvWsZTrmG1fAhbh2Ve4ksNalbcbOfln2x6auK32tUAyHcHR8cc00gu9wOgnl
VITE_API_BASE_URL=https://oraclelumira.com/api
```

### Port Configuration
- **Ports Exposes**: `8080` ✅
- **Ports Mappings**: Remove any host port mappings (avoid rolling-update issues)

### Internal Port
- **Internal Port**: `8080`

## 📋 DEPLOYMENT VERIFICATION

### Build Log Verification
After redeploy, check Coolify build logs contain:
```bash
--build-arg VITE_API_BASE_URL=https://oraclelumira.com/api
--build-arg VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### Post-Deploy Health Checks
```bash
# 1. Health endpoint (nginx serves directly)
curl -I https://oraclelumira.com/health.json
# Expected: HTTP/2 200

# 2. API health (proxied to Node.js)
curl -I https://oraclelumira.com/api/healthz  
# Expected: HTTP/2 200

# 3. Frontend SPA
curl -I https://oraclelumira.com/
# Expected: HTTP/2 200 

# 4. Checkout page
curl -I "https://oraclelumira.com/commande?product=mystique"
# Expected: HTTP/2 200
```

### Container Status
- **Status**: Should show "healthy" (not restarting)
- **Logs**: Should show nginx access logs, PM2 status, no errors

## 🔧 TROUBLESHOOTING

### If Container Unhealthy
1. Check Coolify container logs for startup sequence
2. Look for nginx or PM2 startup failures
3. Verify build args are present in build command

### If API Calls Fail (Frontend)
1. Check browser console for API endpoint calls
2. Verify API calls go to `/api/*` (relative paths)
3. Check nginx proxy configuration in logs

### If Build Fails
1. Ensure both build args have "Is Build Variable?" checked
2. Check for TypeScript compilation errors in backend
3. Verify Vite build succeeds with provided VITE_API_BASE_URL

## 🎉 SUCCESS CRITERIA

- ✅ Container status: **healthy** (no restart loop)
- ✅ Main site: https://oraclelumira.com → React SPA loads
- ✅ API calls: Frontend can communicate with backend
- ✅ Checkout: https://oraclelumira.com/commande?product=mystique → Works
- ✅ Health: All 4 endpoints return HTTP 200

## 📊 CONTAINER DIAGNOSTICS

If issues persist, exec into container:
```bash
# Port bindings
ss -lntp | grep -E "8080|3000"

# Process status  
ps aux | grep -E "nginx|node"

# nginx test
nginx -t

# PM2 status
pm2 list && pm2 logs --lines 50

# Test internal endpoints
curl -v http://127.0.0.1:8080/health.json
curl -v http://127.0.0.1:3000/api/healthz
```

## 🔄 ROLLBACK PLAN

If deployment fails:
1. **Coolify**: Redeploy previous successful commit
2. **Local test**: Use `validate-local-docker.sh` to verify fix locally
3. **Git**: Revert commit if needed: `git revert HEAD`

---

**Expected Result**: Container healthy, all endpoints working, no "server unavailable" errors.
