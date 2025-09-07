# Oracle Lumira - Test Procedures for Coolify v4 Deployment
# DevOps Audit - Section 4: Test Commands

## Local Docker Build & Test

# 1. Build image locally
docker build -t oracle-lumira:test .

# 2. Run container locally (test port 8080)
docker run -d --name lumira-test -p 8080:8080 oracle-lumira:test

# 3. Health checks
curl -v http://localhost:8080/health.json
curl -v http://localhost:8080/
curl -v http://localhost:8080/api/health

# 4. Log inspection
docker logs lumira-test --follow

# 5. Container inspection
docker exec lumira-test ps aux
docker exec lumira-test netstat -tlnp
docker exec lumira-test nginx -t

# 6. Clean up
docker stop lumira-test && docker rm lumira-test

## Coolify Deployment Test Commands

# 1. Deploy to Coolify staging
# Via Coolify UI: Connect GitHub repo, set branch, configure port 8080

# 2. Verify deployment
curl -v https://[your-coolify-domain]/health.json
curl -v https://[your-coolify-domain]/
curl -v https://[your-coolify-domain]/api/health

# 3. Monitor deployment logs
# Via Coolify UI: Applications > Oracle Lumira > Logs

# 4. Check container status
# Via Coolify UI: Applications > Oracle Lumira > Resources

## Load Testing (Optional)

# 1. Basic load test
for i in {1..50}; do curl -s http://localhost:8080/health.json > /dev/null && echo "Request $i: OK" || echo "Request $i: FAIL"; done

# 2. Concurrent requests
curl -w "%{http_code}\\n" -s -o /dev/null http://localhost:8080/ &
curl -w "%{http_code}\\n" -s -o /dev/null http://localhost:8080/health.json &
curl -w "%{http_code}\\n" -s -o /dev/null http://localhost:8080/api/health &
wait

## Security Validation

# 1. Port scanning
nmap -p 8080 localhost

# 2. Header inspection
curl -I http://localhost:8080/

# 3. File permissions check
docker exec lumira-test ls -la /app/
docker exec lumira-test ls -la /usr/share/nginx/html/
docker exec lumira-test ps aux | grep nginx
docker exec lumira-test ps aux | grep pm2

## Performance Benchmarks

# 1. Response time test
time curl -s http://localhost:8080/health.json

# 2. Memory usage
docker stats lumira-test --no-stream

# 3. Startup time measurement
start_time=$(date +%s)
docker run -d --name lumira-startup -p 8081:8080 oracle-lumira:test
while ! curl -s http://localhost:8081/health.json > /dev/null; do sleep 1; done
end_time=$(date +%s)
echo "Startup time: $((end_time - start_time)) seconds"
docker stop lumira-startup && docker rm lumira-startup
