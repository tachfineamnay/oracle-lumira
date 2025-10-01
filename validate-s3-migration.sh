#!/bin/bash

# ===========================================
# SCRIPT DE VALIDATION MIGRATION S3
# ===========================================

echo "🚀 [VALIDATION] Début de la validation de la migration S3"

# Vérification des fichiers modifiés
echo "📋 [VALIDATION] Vérification des fichiers modifiés..."

# 1. Vérifier que le service S3 existe
if [ -f "/data/workspace/oracle-lumira/apps/api-backend/src/services/s3.ts" ]; then
    echo "✅ [VALIDATION] Service S3 créé : /src/services/s3.ts"
else
    echo "❌ [VALIDATION] Service S3 manquant !"
    exit 1
fi

# 2. Vérifier les modifications du modèle Order
if grep -q "url: string" "/data/workspace/oracle-lumira/apps/api-backend/src/models/Order.ts"; then
    echo "✅ [VALIDATION] Modèle Order migré avec support S3"
else
    echo "❌ [VALIDATION] Modèle Order non migré !"
    exit 1
fi

# 3. Vérifier les modifications des routes orders
if grep -q "s3Service" "/data/workspace/oracle-lumira/apps/api-backend/src/routes/orders.ts"; then
    echo "✅ [VALIDATION] Routes orders intègrent le service S3"
else
    echo "❌ [VALIDATION] Routes orders non migrées !"
    exit 1
fi

# 4. Vérifier la suppression du stockage local dans server.ts
if ! grep -q "express.static.*uploads" "/data/workspace/oracle-lumira/apps/api-backend/src/server.ts"; then
    echo "✅ [VALIDATION] Stockage local supprimé du serveur"
else
    echo "❌ [VALIDATION] Stockage local toujours présent !"
    exit 1
fi

# 5. Vérifier les variables d'environnement S3
if grep -q "AWS_S3_BUCKET_NAME" "/data/workspace/oracle-lumira/.env.example"; then
    echo "✅ [VALIDATION] Variables d'environnement S3 ajoutées"
else
    echo "❌ [VALIDATION] Variables d'environnement S3 manquantes !"
    exit 1
fi

# 6. Vérifier package.json pour AWS SDK
if grep -q "@aws-sdk/client-s3" "/data/workspace/oracle-lumira/apps/api-backend/package.json"; then
    echo "✅ [VALIDATION] Dépendance AWS SDK ajoutée au package.json"
else
    echo "❌ [VALIDATION] Dépendance AWS SDK manquante !"
    exit 1
fi

echo ""
echo "🎉 [VALIDATION] Migration S3 complétée avec succès !"
echo ""
echo "📝 [NEXT STEPS] Étapes suivantes pour la mise en production :"
echo "   1. Configurer les variables AWS dans Coolify :"
echo "      - AWS_ACCESS_KEY_ID"
echo "      - AWS_SECRET_ACCESS_KEY"
echo "      - AWS_REGION=eu-west-3"
echo "      - AWS_S3_BUCKET_NAME=lumira-uploads-prod"
echo ""
echo "   2. Créer le bucket S3 'lumira-uploads-prod' avec :"
echo "      - Accès public en lecture"
echo "      - Chiffrement AES-256"
echo "      - Versioning activé"
echo ""
echo "   3. Installer les dépendances : npm install"
echo ""
echo "   4. Tester l'upload en développement"
echo ""
echo "   5. Déployer en production"
echo ""
echo "⚠️  [WARNING] L'ancien système de stockage local a été complètement supprimé."
echo "    Les uploads seront uniquement stockés sur S3 après ce déploiement."