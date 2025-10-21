#!/bin/sh
set -e
IMAGE_NAME="lumira-frontend-debug:latest"

echo "--- 1. Building Docker image using apps/main-app/Dockerfile ---"
docker build -t $IMAGE_NAME -f ./apps/main-app/Dockerfile .

echo "\n--- 2. Starting a temporary container from the new image ---"
CONTAINER_ID=$(docker run -d $IMAGE_NAME)

echo "\n--- 3. Verifying content of index.html inside the container ---"
echo "Expected to find headers for cache control in nginx.conf..."
docker exec $CONTAINER_ID cat /etc/nginx/nginx.conf | grep 'Cache-Control' || echo "CACHE-CONTROL HEADERS NOT FOUND!"

echo "\n--- 4. Verifying content of JavaScript bundles ---"
echo "Searching for 'DrawsWaiting' string in JS files..."
docker exec $CONTAINER_ID sh -c "find /usr/share/nginx/html/assets -name '*.js' -exec grep -l 'DrawsWaiting' {} +" || echo "DrawsWaiting COMPONENT NOT FOUND IN BUNDLES!"

echo "\n--- 5. Cleaning up temporary container ---"
docker rm -f $CONTAINER_ID

echo "\n--- DEBUG BUILD COMPLETED ---"
