# Guide de Déploiement API Stateless - Oracle Lumira

## 🎯 Statut : Production Ready (100% Stateless)

### ✅ Nettoyage Complet Effectué

L'API backend a été entièrement nettoyée de toute logique de système de fichiers local :

- ❌ **Supprimé** : Fonction `ensureDirectoriesExist` et toute création de répertoires
- ❌ **Supprimé** : Imports `fs`, `path` et `execSync` non nécessaires  
- ❌ **Supprimé** : Service de fichiers statiques `express.static`
- ❌ **Supprimé** : Variables `GENERATED_DIR` et `LOGS_DIR`
- ❌ **Supprimé** : Toute référence aux chemins `/app/uploads`, `/app/generated`, `/app/logs`

### 🏗️ Architecture Stateless

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Client App    │───▶│   API Backend    │───▶│   Amazon S3     │
│                 │    │   (Stateless)    │    │  (File Storage) │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌──────────────────┐
                       │     MongoDB      │
                       │   (Database)     │
                       └──────────────────┘
```

### 📋 Variables d'Environnement Requises

```env
# Configuration Générale
NODE_ENV=production
PORT=3000

# Base de Données
MONGODB_URI="mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>"

# Stockage S3
AWS_ACCESS_KEY_ID="your_aws_access_key_id"
AWS_SECRET_ACCESS_KEY="your_aws_secret_access_key" 
AWS_REGION="eu-west-3"
AWS_S3_BUCKET_NAME="oracle-lumira-uploads-tachfine-1983"

# Paiements
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Sécurité
JWT_SECRET="your_super_long_and_random_jwt_secret"

# CORS
CORS_ORIGIN="https://oraclelumira.com,https://desk.oraclelumira.com"
FRONTEND_URL="https://oraclelumira.com"
```

### 🚀 Commandes de Déploiement

#### 1. Validation Locale
```bash
cd apps/api-backend
npm run build
node test-stateless-api.js
```

#### 2. Déploiement Coolify
```bash
# Push vers main
git add .
git commit -m "refactor(api): remove all local filesystem logic for stateless cloud deployment"
git push origin main

# Coolify déploiera automatiquement
```

#### 3. Validation Post-Déploiement
```bash
# Tester l'API en production
curl https://api.oraclelumira.com/api/healthz
curl https://api.oraclelumira.com/api/ready
```

### 🔧 Fonctionnalités Confirmées

- ✅ **Health Check** : `/api/healthz` - Endpoint de santé sans dépendance filesystem
- ✅ **Ready Check** : `/api/ready` - Vérification MongoDB et Stripe uniquement  
- ✅ **Upload S3** : Fichiers uploadés directement vers Amazon S3
- ✅ **Logging Console** : Winston configuré pour conteneurs (console only)
- ✅ **CORS Production** : Configuration sécurisée pour domaines autorisés
- ✅ **Rate Limiting** : Protection anti-spam configurée
- ✅ **Security Headers** : Helmet configuré pour la sécurité

### ⚠️ Points d'Attention

1. **Aucun Stockage Local** : L'API ne créé plus aucun fichier ou répertoire local
2. **Logs Console Only** : Tous les logs vont uniquement vers stdout/stderr
3. **S3 Requis** : Amazon S3 est maintenant obligatoire pour les uploads
4. **MongoDB Facultatif** : Mode mock disponible si MONGODB_URI absent

### 🧪 Tests de Validation

Le script `test-stateless-api.js` valide :
- Endpoints de santé fonctionnels
- Configuration CORS
- Headers de sécurité
- Absence d'endpoints de fichiers statiques

### 📊 Avantages du Déploiement Stateless

- 🏃 **Démarrage Rapide** : Aucune création de répertoires au démarrage
- 🔒 **Sécurité** : Plus d'erreurs EACCES dans les conteneurs
- ⚖️ **Scalabilité** : Compatible avec réplication horizontale
- 🌩️ **Cloud Native** : Optimisé pour Kubernetes/Docker
- 💾 **Persistance** : Fichiers persistés dans S3, pas dans conteneurs éphémères

---

**Statut** : ✅ READY FOR PRODUCTION DEPLOYMENT
