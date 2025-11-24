#!/bin/bash

# Script de configuration CORS pour les buckets S3 Oracle Lumira
# Usage: ./configure-s3-cors.sh

set -e

echo "🔧 Configuration CORS pour les buckets S3 Oracle Lumira"
echo "========================================================="

# Vérifier que AWS CLI est installé
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI n'est pas installé. Installez-le avec:"
    echo "   curl 'https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip' -o 'awscliv2.zip'"
    echo "   unzip awscliv2.zip"
    echo "   sudo ./aws/install"
    exit 1
fi

# Buckets à configurer
UPLOADS_BUCKET="oracle-lumira-uploads-tachfine-1983"
LECTURES_BUCKET="oracle-lumira-lectures"
REGION="eu-west-3"

# Domaines autorisés
DOMAINS=(
    "https://oraclelumira.com"
    "https://www.oraclelumira.com"
    "https://api.oraclelumira.com"
    "http://localhost:3000"
    "http://localhost:5173"
)

# Créer le fichier de configuration CORS
cat > /tmp/cors-config.json <<EOF
{
  "CORSRules": [
    {
      "AllowedOrigins": [
        "https://oraclelumira.com",
        "https://www.oraclelumira.com",
        "https://api.oraclelumira.com",
        "http://localhost:3000",
        "http://localhost:5173"
      ],
      "AllowedMethods": [
        "GET",
        "HEAD"
      ],
      "AllowedHeaders": [
        "*"
      ],
      "ExposeHeaders": [
        "ETag",
        "Content-Length",
        "Content-Type",
        "Content-Disposition"
      ],
      "MaxAgeSeconds": 3600
    }
  ]
}
EOF

echo "📝 Configuration CORS créée:"
cat /tmp/cors-config.json

echo ""
echo "🔄 Application de la configuration CORS sur $UPLOADS_BUCKET..."
aws s3api put-bucket-cors \
    --bucket "$UPLOADS_BUCKET" \
    --cors-configuration file:///tmp/cors-config.json \
    --region "$REGION"

echo "✅ CORS configuré sur $UPLOADS_BUCKET"

echo ""
echo "🔄 Application de la configuration CORS sur $LECTURES_BUCKET..."
aws s3api put-bucket-cors \
    --bucket "$LECTURES_BUCKET" \
    --cors-configuration file:///tmp/cors-config.json \
    --region "$REGION"

echo "✅ CORS configuré sur $LECTURES_BUCKET"

echo ""
echo "🔍 Vérification de la configuration CORS..."
echo ""
echo "📦 CORS sur $UPLOADS_BUCKET:"
aws s3api get-bucket-cors --bucket "$UPLOADS_BUCKET" --region "$REGION" || echo "⚠️ Aucune configuration CORS"

echo ""
echo "📦 CORS sur $LECTURES_BUCKET:"
aws s3api get-bucket-cors --bucket "$LECTURES_BUCKET" --region "$REGION" || echo "⚠️ Aucune configuration CORS"

echo ""
echo "✅ Configuration CORS terminée avec succès!"
echo ""
echo "🔐 Note: Assurez-vous que vos credentials IAM ont les permissions:"
echo "   - s3:PutBucketCORS"
echo "   - s3:GetBucketCORS"

# Nettoyage
rm /tmp/cors-config.json
