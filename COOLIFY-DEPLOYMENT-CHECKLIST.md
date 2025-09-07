# Oracle Lumira - Coolify v4 Deployment Checklist
# DevOps Audit - Section 6: Final Deployment Validation

## Pre-Deployment Checklist

### ✅ Code Repository
- [ ] Code pushed to correct Git repository
- [ ] Latest commits include nginx, PM2, and startup script fixes
- [ ] Dockerfile optimized for Coolify (port 8080, USER lumira, logs to stdout/stderr)
- [ ] nginx-fullstack.conf configured for port 8080 and upstream 127.0.0.1:3000
- [ ] ecosystem.config.json configured for stdout/stderr logging and port 3000
- [ ] start-fullstack.sh implements proper PM2→nginx startup sequence

### ✅ Coolify Configuration
- [ ] Application connected to correct Git repository and branch
- [ ] Port mapping configured: Container 8080 → External port
- [ ] Health check endpoint set to `/health.json`
- [ ] Resource limits configured (1GB RAM, 0.5 CPU recommended)
- [ ] Environment variables configured (NODE_ENV=production, PORT=3000, etc.)
- [ ] Domain configured and SSL certificates active

### ✅ Build Validation
- [ ] Local Docker build succeeds: `docker build -t oracle-lumira:test .`
- [ ] Local container runs successfully: `docker run -p 8080:8080 oracle-lumira:test`
- [ ] Health check responds: `curl http://localhost:8080/health.json`
- [ ] Frontend loads: `curl http://localhost:8080/`
- [ ] API responds: `curl http://localhost:8080/api/health`
- [ ] Logs show proper PM2→nginx startup sequence
- [ ] No EACCES permission errors in logs

## Deployment Process

### Step 1: Coolify Application Setup
```bash
1. Login to Coolify v4 dashboard
2. Create new Application
3. Connect Git repository: [your-repo-url]
4. Set branch: main (or your deployment branch)
5. Set build pack: Dockerfile
6. Configure port: 8080
7. Set health check: /health.json
```

### Step 2: Environment Configuration
```bash
NODE_ENV=production
PORT=3000
HEALTH_CHECK_PORT=8080
# Add your specific environment variables (DB, API keys, etc.)
```

### Step 3: Deploy and Monitor
```bash
1. Click "Deploy" in Coolify
2. Monitor build logs for successful stages
3. Watch deployment logs for startup sequence
4. Verify health check turns green
5. Test application endpoints
```

## Post-Deployment Validation

### ✅ Service Health
- [ ] Application status shows "Running" in Coolify
- [ ] Health check endpoint returns 200 OK
- [ ] Frontend serves static files correctly
- [ ] API endpoints respond correctly
- [ ] Database connections established (if applicable)
- [ ] SSL certificate valid and HTTPS working

### ✅ Performance Checks
- [ ] Application startup time < 45 seconds
- [ ] Health check response time < 5 seconds
- [ ] Memory usage within expected limits (< 1GB)
- [ ] CPU usage stable under normal load
- [ ] No memory leaks detected after 1 hour

### ✅ Security Validation
- [ ] Application runs as non-root user (lumira)
- [ ] Only port 8080 exposed externally
- [ ] Security headers present in HTTP responses
- [ ] No sensitive information in logs
- [ ] File permissions correctly set
- [ ] Container follows security best practices

### ✅ Logging & Monitoring
- [ ] Application logs visible in Coolify dashboard
- [ ] nginx access logs flowing to stdout
- [ ] PM2 process logs flowing to stderr
- [ ] No critical errors in logs
- [ ] Log rotation working properly
- [ ] Monitoring alerts configured (if applicable)

## Troubleshooting Guide

### Common Issues & Solutions

**Issue: Health check fails**
```bash
# Check container logs
docker logs [container-id]
# Verify health.json exists
curl -v http://localhost:8080/health.json
```

**Issue: 502 Bad Gateway**
```bash
# Check PM2 process status
docker exec [container-id] pm2 status
# Verify API port binding
docker exec [container-id] netstat -tlnp | grep 3000
```

**Issue: EACCES log file errors**
```bash
# Verify PM2 config uses stdout/stderr
cat ecosystem.config.json | grep -A5 -B5 "out_file"
```

**Issue: Slow startup**
```bash
# Check startup script sequence
docker exec [container-id] ps aux
# Verify nginx waits for PM2
tail -f logs | grep -E "(PM2|nginx|ready)"
```

## Rollback Procedure

### Emergency Rollback
```bash
1. In Coolify: Applications > Oracle Lumira > Deployments
2. Click "Rollback" on previous working deployment
3. Monitor rollback process
4. Verify application health
5. Update DNS if needed
```

### Manual Rollback
```bash
1. Revert Git commits to last working version
2. Force redeploy in Coolify
3. Monitor deployment logs
4. Validate functionality
```

## Success Criteria

### ✅ Final Validation
- [ ] Application accessible via configured domain
- [ ] All core functionality working
- [ ] Performance meets requirements
- [ ] Security standards implemented
- [ ] Monitoring and logging operational
- [ ] Backup procedures documented
- [ ] Team notified of successful deployment

### Sign-off
- [ ] DevOps Engineer: _________________
- [ ] Application Owner: _________________  
- [ ] Security Review: _________________
- [ ] Date Deployed: _________________
- [ ] Production URL: _________________

---

**🎯 Deployment Status: READY FOR COOLIFY v4**
**📋 Critical Fixes Applied: nginx port 8080, PM2 stdout/stderr logs, proper startup sequence**
**🔒 Security: Non-root user, minimal permissions, secure headers**
**📊 Monitoring: Health checks, proper logging, resource limits**
