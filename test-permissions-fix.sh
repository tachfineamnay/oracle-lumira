#!/bin/bash

echo "🔧 [TEST] Test de validation des corrections de permissions EACCES"
echo "=================================================="

# Configuration
API_DIR="./apps/api-backend"
TEST_IMAGE="oracle-api-test"
TEST_CONTAINER="oracle-test-container"
TEST_UPLOADS_DIR="./test-uploads"

# Couleurs pour les logs
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log_success() {
    echo -e "${GREEN}✅ [TEST] $1${NC}"
}

log_error() {
    echo -e "${RED}❌ [TEST] $1${NC}"
}

log_info() {
    echo -e "${YELLOW}📋 [TEST] $1${NC}"
}

# Fonction de nettoyage
cleanup() {
    log_info "Nettoyage des ressources de test..."
    docker stop $TEST_CONTAINER 2>/dev/null || true
    docker rm $TEST_CONTAINER 2>/dev/null || true
    docker rmi $TEST_IMAGE 2>/dev/null || true
    rm -rf $TEST_UPLOADS_DIR 2>/dev/null || true
}

# Piège pour nettoyer en cas d'interruption
trap cleanup EXIT

echo "📋 [TEST] Étape 1: Build de l'image Docker avec les corrections"
cd $API_DIR
if docker build -t $TEST_IMAGE .; then
    log_success "Image Docker construite avec succès"
else
    log_error "Échec de la construction de l'image Docker"
    exit 1
fi

echo
echo "📋 [TEST] Étape 2: Création du répertoire de test uploads"
cd ../..
mkdir -p $TEST_UPLOADS_DIR
if [ $? -eq 0 ]; then
    log_success "Répertoire test-uploads créé"
else
    log_error "Échec de création du répertoire test-uploads"
    exit 1
fi

echo
echo "📋 [TEST] Étape 3: Démarrage du conteneur avec volumes montés"
if docker run -d \
    --name $TEST_CONTAINER \
    -p 3001:3000 \
    -v "$(pwd)/$TEST_UPLOADS_DIR:/app/uploads" \
    -v "$(pwd)/test-logs:/app/logs" \
    -v "$(pwd)/test-generated:/app/generated" \
    -e NODE_ENV=test \
    -e UPLOADS_DIR=/app/uploads \
    $TEST_IMAGE; then
    log_success "Conteneur démarré avec succès"
else
    log_error "Échec du démarrage du conteneur"
    exit 1
fi

echo
echo "📋 [TEST] Étape 4: Attente du démarrage de l'application (10s)"
sleep 10

echo
echo "📋 [TEST] Étape 5: Vérification des logs de démarrage"
echo "--- Logs du conteneur ---"
docker logs $TEST_CONTAINER

echo
echo "📋 [TEST] Étape 6: Vérification des permissions dans le conteneur"
log_info "Vérification de l'utilisateur d'exécution..."
docker exec $TEST_CONTAINER id

log_info "Vérification des permissions des répertoires..."
docker exec $TEST_CONTAINER ls -la /app/

log_info "Vérification des permissions des volumes..."
docker exec $TEST_CONTAINER ls -la /app/uploads /app/logs /app/generated

echo
echo "📋 [TEST] Étape 7: Test d'écriture dans le conteneur"
if docker exec $TEST_CONTAINER sh -c 'echo "test-permissions" > /app/uploads/test-write.txt'; then
    log_success "Test d'écriture dans /app/uploads réussi"
    docker exec $TEST_CONTAINER cat /app/uploads/test-write.txt
else
    log_error "Test d'écriture dans /app/uploads échoué"
fi

echo
echo "📋 [TEST] Étape 8: Test de l'endpoint de santé"
if curl -f -s http://localhost:3001/api/healthz > /dev/null; then
    log_success "Endpoint de santé accessible"
    curl -s http://localhost:3001/api/healthz | jq '.' 2>/dev/null || curl -s http://localhost:3001/api/healthz
else
    log_error "Endpoint de santé inaccessible"
fi

echo
echo "📋 [TEST] Étape 9: Vérification des fichiers sur le host"
log_info "Contenu du répertoire test-uploads sur le host:"
ls -la $TEST_UPLOADS_DIR/

echo
echo "=================================================="
log_success "Test de validation des permissions terminé"
echo "📋 [TEST] Pour tester manuellement l'upload, utiliser:"
echo "curl -X POST -F \"facePhoto=@test-image.jpg\" -F \"formData={\\\"email\\\":\\\"test@test.com\\\"}\" http://localhost:3001/api/orders/by-payment-intent/test/client-submit"