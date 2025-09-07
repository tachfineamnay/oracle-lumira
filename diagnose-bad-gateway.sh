#!/bin/bash
# Diagnostic script - À exécuter via Coolify SSH

echo "=== DIAGNOSTIC ORACLE LUMIRA BAD GATEWAY ==="

# 1. Container status
echo "1. Container Status:"
docker ps | grep oracle-lumira

# 2. Container logs (dernières 50 lignes)
echo -e "\n2. Container Logs:"
CONTAINER_ID=$(docker ps --filter "name=oracle-lumira" --format "{{.ID}}")
docker logs $CONTAINER_ID --tail 50

# 3. Tests internes au container
echo -e "\n3. Internal Health Tests:"
docker exec $CONTAINER_ID curl -s http://localhost:8080/health.json || echo "FAIL: nginx health"
docker exec $CONTAINER_ID curl -s http://127.0.0.1:3000/api/health || echo "FAIL: API health"

# 4. Processus actifs
echo -e "\n4. Running Processes:"
docker exec $CONTAINER_ID ps aux

# 5. Ports ouverts
echo -e "\n5. Open Ports:"
docker exec $CONTAINER_ID netstat -tlnp | grep -E "(8080|3000)"

# 6. PM2 status
echo -e "\n6. PM2 Status:"
docker exec $CONTAINER_ID pm2 status 2>/dev/null || echo "PM2 not accessible"

# 7. Nginx test
echo -e "\n7. Nginx Configuration Test:"
docker exec $CONTAINER_ID nginx -t

echo -e "\n=== DIAGNOSTIC TERMINÉ ==="
