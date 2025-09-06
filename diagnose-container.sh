#!/bin/bash

# Script de diagnostic pour container de production
# À copier et exécuter dans le container Coolify

echo "🔍 DIAGNOSTIC CONTAINER API BACKEND"
echo "===================================="

# Test 1: Vérifier si PM2 fonctionne
echo ""
echo "📊 1. État PM2..."
pm2 list

# Test 2: Vérifier si le port 3001 est occupé
echo ""
echo "🔌 2. Ports en écoute..."
netstat -tuln | grep :3001 || echo "❌ Port 3001 non trouvé"

# Test 3: Vérifier les logs PM2
echo ""
echo "📝 3. Logs PM2 (dernières 20 lignes)..."
pm2 logs lumira-api --lines 20

# Test 4: Test direct sur localhost:3001
echo ""
echo "🚀 4. Test direct API backend..."
curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/api/health && echo " - API Health accessible" || echo "❌ API Health inaccessible"

# Test 5: Vérifier si le fichier compilé existe
echo ""
echo "📁 5. Fichiers backend compilés..."
ls -la /app/apps/api-backend/dist/ || echo "❌ Répertoire dist non trouvé"
ls -la /app/apps/api-backend/dist/server.js || echo "❌ server.js non trouvé"

# Test 6: Variables d'environnement
echo ""
echo "🌍 6. Variables d'environnement critiques..."
echo "MONGODB_URI: ${MONGODB_URI:0:20}..." # Masqué pour sécurité
echo "JWT_SECRET: ${JWT_SECRET:+[DÉFINI]}${JWT_SECRET:-[NON DÉFINI]}"
echo "NODE_ENV: $NODE_ENV"
echo "PORT: $PORT"

# Test 7: Processus Node.js
echo ""
echo "⚙️ 7. Processus Node.js actifs..."
ps aux | grep node

echo ""
echo "✅ Diagnostic terminé!"
echo ""
echo "💡 Actions possibles:"
echo "- Si PM2 est vide: pm2 start /app/ecosystem.config.json"
echo "- Si logs montrent des erreurs: corriger et pm2 restart lumira-api"
echo "- Si MONGODB_URI manque: définir la variable et redémarrer"
