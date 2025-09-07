# Oracle Lumira - Security & Observability Options
# DevOps Audit - Section 5: Enhanced Monitoring & Security

## A. Advanced Security Headers (nginx-fullstack.conf)

```nginx
# Add to server block for enhanced security
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self'" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;
```

## B. PM2 Advanced Monitoring (ecosystem.config.json)

```json
{
  "apps": [{
    "name": "oracle-lumira-api",
    "script": "./apps/api-backend/dist/server.js",
    "instances": 1,
    "exec_mode": "fork",
    "env_production": {
      "NODE_ENV": "production",
      "PORT": 3000
    },
    "out_file": "/dev/stdout",
    "error_file": "/dev/stderr",
    "log_file": "/dev/stdout",
    "combine_logs": true,
    "time": true,
    "listen_timeout": 8000,
    "kill_timeout": 5000,
    "max_memory_restart": "500M",
    "max_restarts": 10,
    "min_uptime": "10s",
    "watch": false,
    "ignore_watch": ["node_modules", "logs"],
    "source_map_support": true,
    "merge_logs": true
  }]
}
```

## C. Health Check Endpoint Enhancement

Create `/app/apps/api-backend/src/routes/health.ts`:

```typescript
import { Request, Response, Router } from 'express';
import mongoose from 'mongoose';

const router = Router();

router.get('/health', async (req: Request, res: Response) => {
  try {
    const health = {
      status: 'healthy',
      service: 'oracle-lumira-api',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: process.version,
      port: process.env.PORT || 3000,
      database: {
        status: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
        host: mongoose.connection.host || 'unknown'
      }
    };

    res.status(200).json(health);
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      service: 'oracle-lumira-api',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
```

## D. Coolify Environment Variables

Set in Coolify UI > Application > Environment:

```bash
# Essential
NODE_ENV=production
PORT=3000
HEALTH_CHECK_PORT=8080

# Security
CORS_ORIGIN=https://your-domain.com
JWT_SECRET=your-secure-jwt-secret-here
BCRYPT_ROUNDS=12

# Database
MONGODB_URI=mongodb://your-mongo-connection-string

# Logging
LOG_LEVEL=info
LOG_FORMAT=json

# Performance
PM2_INSTANCES=1
MAX_MEMORY_RESTART=500M
```

## E. Nginx Access Logs (Optional)

If detailed logging needed, modify nginx config:

```nginx
# Add to http block
log_format detailed '$remote_addr - $remote_user [$time_local] '
                   '"$request" $status $body_bytes_sent '
                   '"$http_referer" "$http_user_agent" '
                   '$request_time $upstream_response_time';

# Add to server block
access_log /dev/stdout detailed;
error_log /dev/stderr info;
```

## F. Container Resource Limits

Add to docker-compose.yml or Coolify resource settings:

```yaml
deploy:
  resources:
    limits:
      memory: 1G
      cpus: '0.5'
    reservations:
      memory: 512M
      cpus: '0.25'
```

## G. Security Scanning Integration

```bash
# Dockerfile security scan
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
  -v $(pwd):/path aquasec/trivy image oracle-lumira:latest

# Dependency vulnerability check
npm audit --production --audit-level high

# Static code analysis
docker run --rm -v $(pwd):/app semgrep/semgrep --config=auto /app
```

## H. Monitoring Integration Options

1. **Prometheus Metrics** (PM2 + nginx):
   ```bash
   # Add to ecosystem.config.json
   "pmx": true,
   "vizion": false
   
   # nginx prometheus module
   location /nginx_status {
     stub_status on;
     access_log off;
     allow 127.0.0.1;
     deny all;
   }
   ```

2. **Grafana Dashboard** - Import Oracle Lumira metrics

3. **Alerting Rules**:
   - CPU > 80% for 5min
   - Memory > 90% for 2min  
   - Health check failures > 3 consecutive
   - Response time > 5s average

## I. Backup & Recovery

```bash
# Database backup
mongodump --uri="$MONGODB_URI" --out /backups/$(date +%Y%m%d)

# Application state backup
tar -czf lumira-backup-$(date +%Y%m%d).tar.gz /app/uploads /app/generated

# Restore procedure
mongorestore --uri="$MONGODB_URI" /backups/YYYYMMDD/
```
