# 🚀 SOLUTION COHÉRENTE ET FONCTIONNELLE - COOLIFY DEPLOYMENT

## 📋 **Configuration appliquée :**

### **1. Docker Compose + Dockerfile (Approche hybride)**
- ✅ **docker-compose.yaml** : Gestion des variables d'environnement
- ✅ **Dockerfile** : Build multi-stage optimisé
- ✅ **Variables sécurisées** : Pas de secrets hard-codés

### **2. Variables d'environnement requises**

#### **Build Variables (Build Variable = YES)**
```bash
VITE_API_BASE_URL=https://api.oraclelumira.com
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_51Ms0j7HY5XvhVZu...
VITE_APP_DOMAIN=https://oraclelumira.com
```

#### **Runtime Variables (Build Variable = NO)**
```bash
# Backend Core
NODE_ENV=production
PORT=3000
API_PORT=3000

# Database
MONGODB_URI=mongodb://username:password@host:port/database?authSource=admin&directConnection=true
MONGO_DB_NAME=lumira-mvp

# Stripe (use your actual keys)
STRIPE_SECRET_KEY=sk_test_51Ms0j7HY5XvhVZu[...your-key...]
STRIPE_PUBLISHABLE_KEY=pk_test_51Ms0j7HY5XvhVZu[...your-key...]
STRIPE_WEBHOOK_SECRET=whsec_[...your-secret...]

# Security
JWT_SECRET=[your-jwt-secret-key-here]
SESSION_SECRET=[your-session-secret-here]
ALLOWED_ORIGINS=https://oraclelumira.com
CORS_ORIGIN=https://oraclelumira.com

# Expert Desk
EXPERT_DESK_URL=https://desk.oraclelumira.com
API_BASE_URL=https://oraclelumira.com/api

# System
DEBUG=false
LOG_LEVEL=info
UPLOADS_DIR=/app/uploads
GENERATED_DIR=/app/generated
N8N_WEBHOOK_URL=https://n8automate.ialexia.fr/webhook/10e13491-51ac-46f6-a734-89c1068cc7ec
```

## 🎯 **Actions dans Coolify :**

### **1. Configuration Build Pack**
- **Type**: `Docker Compose`
- **Docker Compose Path**: `/docker-compose.yaml`

### **2. Ajouter la variable manquante**
- **Nom**: `VITE_APP_DOMAIN`
- **Valeur**: `https://oraclelumira.com`
- **Build Variable**: `YES` ✅

### **3. Vérifier toutes les variables**
Toutes les variables listées ci-dessus doivent être présentes dans Coolify avec la bonne classification (Build Variable YES/NO).

## ✅ **Pourquoi cette solution fonctionne :**

1. **Docker Compose** → Variables d'environnement correctement injectées
2. **Dockerfile optimisé** → Build multi-stage efficace
3. **Variables sécurisées** → Toutes les variables passées via Coolify
4. **Configuration cohérente** → Frontend et backend alignés
5. **Sanity checks** → Validation des variables dans start-fullstack.sh

## 🚀 **Déploiement**

1. Commit et push ces changements
2. Ajouter `VITE_APP_DOMAIN` dans Coolify
3. Redéployer
4. Vérifier les logs de démarrage

Cette approche combine le meilleur des deux mondes : flexibilité du docker-compose + sécurité des variables Coolify.
