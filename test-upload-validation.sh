#!/bin/bash

echo "🔧 [UPLOAD-TEST] Test d'upload de fichier pour validation EACCES"
echo "============================================================"

# Configuration
API_URL="http://localhost:3001"
TEST_IMAGE_PATH="./test-image.jpg"

# Couleurs pour les logs
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log_success() {
    echo -e "${GREEN}✅ [UPLOAD-TEST] $1${NC}"
}

log_error() {
    echo -e "${RED}❌ [UPLOAD-TEST] $1${NC}"
}

log_info() {
    echo -e "${YELLOW}📋 [UPLOAD-TEST] $1${NC}"
}

# Créer une image de test si elle n'existe pas
create_test_image() {
    if [ ! -f "$TEST_IMAGE_PATH" ]; then
        log_info "Création d'une image de test..."
        # Créer une image JPEG simple de 1x1 pixel
        echo -e '\xff\xd8\xff\xe0\x00\x10JFIF\x00\x01\x01\x01\x00H\x00H\x00\x00\xff\xdb\x00C\x00\x08\x06\x06\x07\x06\x05\x08\x07\x07\x07\t\t\x08\n\x0c\x14\r\x0c\x0b\x0b\x0c\x19\x12\x13\x0f\x14\x1d\x1a\x1f\x1e\x1d\x1a\x1c\x1c $.\'"'"' ",#\x1c\x1c(7),01444\x1f"'"'"'=)37+"'"'"')\x14\x1f\x1f\x1f\x1f\x1f\x1f\x1f\x1f\x1f\x1f\x1f\x1f\x1f\x1f\x1f\x1f\xff\xc0\x00\x11\x08\x00\x01\x00\x01\x01\x01\x11\x00\x02\x11\x01\x03\x11\x01\xff\xc4\x00\x14\x00\x01\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x08\xff\xc4\x00\x14\x10\x01\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\xff\xda\x00\x0c\x03\x01\x00\x02\x11\x03\x11\x00\x3f\x00\xaa\xff\xd9' > "$TEST_IMAGE_PATH"
        log_success "Image de test créée: $TEST_IMAGE_PATH"
    else
        log_info "Image de test existante trouvée: $TEST_IMAGE_PATH"
    fi
}

# Test de connexion à l'API
test_api_connection() {
    log_info "Test de connexion à l'API..."
    if curl -f -s "$API_URL/api/healthz" > /dev/null; then
        log_success "API accessible"
        return 0
    else
        log_error "API inaccessible sur $API_URL"
        return 1
    fi
}

# Test d'upload de fichier
test_file_upload() {
    log_info "Test d'upload de fichier..."
    
    # Créer les données de formulaire
    local form_data='{"email":"test@test.com","phone":"0123456789","dateOfBirth":"1990-01-01","specificQuestion":"Test question"}'
    
    # Effectuer l'upload
    local response=$(curl -s -w "\nHTTP_CODE:%{http_code}" \
        -X POST \
        -F "facePhoto=@$TEST_IMAGE_PATH;type=image/jpeg" \
        -F "formData=$form_data" \
        "$API_URL/api/orders/by-payment-intent/test-upload/client-submit" 2>&1)
    
    local http_code=$(echo "$response" | grep "HTTP_CODE:" | cut -d: -f2)
    local body=$(echo "$response" | grep -v "HTTP_CODE:")
    
    echo "Réponse HTTP: $http_code"
    echo "Corps de la réponse:"
    echo "$body"
    
    if [ "$http_code" = "200" ] || [ "$http_code" = "201" ]; then
        log_success "Upload réussi (HTTP $http_code)"
        return 0
    elif [ "$http_code" = "404" ]; then
        log_info "Upload échoué avec 404 (normal pour payment intent inexistant)"
        # Vérifier si l'erreur est liée aux permissions ou à la logique métier
        if echo "$body" | grep -q "EACCES"; then
            log_error "Erreur EACCES détectée dans la réponse"
            return 1
        else
            log_info "Pas d'erreur de permissions détectée"
            return 0
        fi
    else
        log_error "Upload échoué (HTTP $http_code)"
        # Vérifier spécifiquement les erreurs de permissions
        if echo "$body" | grep -q "EACCES\|permission denied"; then
            log_error "Erreur de permissions détectée!"
            return 1
        fi
        return 1
    fi
}

# Test des logs d'erreur
check_container_logs() {
    log_info "Vérification des logs du conteneur pour erreurs EACCES..."
    if docker logs oracle-test-container 2>&1 | grep -i "eacces\|permission denied"; then
        log_error "Erreurs de permissions trouvées dans les logs"
        return 1
    else
        log_success "Aucune erreur de permissions dans les logs"
        return 0
    fi
}

# Script principal
main() {
    create_test_image
    
    if ! test_api_connection; then
        log_error "Impossible de se connecter à l'API. Assurez-vous que le conteneur est démarré."
        exit 1
    fi
    
    test_file_upload
    upload_result=$?
    
    check_container_logs
    logs_result=$?
    
    echo
    echo "============================================================"
    if [ $upload_result -eq 0 ] && [ $logs_result -eq 0 ]; then
        log_success "Tous les tests d'upload ont réussi!"
        log_success "Le problème EACCES semble résolu."
    else
        log_error "Des erreurs ont été détectées."
        log_error "Le problème EACCES persiste."
        exit 1
    fi
}

# Exécution du script principal
main "$@"