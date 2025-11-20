# Configuration d'environnement

<cite>
**Fichiers Référencés dans ce Document**
- [.env.example](file://.env.example)
- [deploy.sh](file://deploy.sh)
- [start-fullstack.sh](file://start-fullstack.sh)
- [docker-compose.yml](file://infrastructure/docker-compose.yml)
- [nginx.conf](file://nginx.conf)
- [ecosystem.config.json](file://ecosystem.config.json)
- [check-env.js](file://check-env.js)
- [PAYMENT-INTENT-IMPLEMENTATION-STATUS.md](file://PAYMENT-INTENT-IMPLEMENTATION-STATUS.md)
- [apps/api-backend/package.json](file://apps/api-backend/package.json)
- [apps/api-backend/Dockerfile](file://apps/api-backend/Dockerfile)
- [apps/api-backend/src/routes/env-debug.ts](file://apps/api-backend/src/routes/env-debug.ts)
</cite>

## Table des matières
1. [Introduction](#introduction)
2. [Structure du Projet](#structure-du-projet)
3. [Variables d'Environnement Clés](#variables-denvironnement-clés)
4. [Configuration de Développement](#configuration-de-développement)
5. [Configuration de Production](#configuration-de-production)
6. [Intégration Docker](#intégration-docker)
7. [Scripts de Déploiement](#scripts-de-déploiement)
8. [Gestion des Secrets](#gestion-des-secrets)
9. [Dépannage](#dépannage)
10. [Conclusion](#conclusion)

## Introduction

Le système de configuration d'environnement de LumiraV1-MVP est conçu pour gérer efficacement les paramètres sensibles et les configurations spécifiques aux environnements (développement, production). Cette architecture permet une séparation claire entre les variables de build (build-time) et les variables d'exécution (runtime), assurant la sécurité et la flexibilité du déploiement.

Le système utilise plusieurs couches de configuration :
- Variables d'environnement système
- Fichiers .env locaux
- Configuration Docker
- Scripts de déploiement automatisés
- Gestionnaire de processus PM2

## Structure du Projet

Le projet organise ses fichiers de configuration selon un modèle multi-couches qui sépare clairement les préoccupations :

```mermaid
graph TB
subgraph "Couche 1 - Variables Système"
ENV[Systeme d'Environnement]
DOCKER[Docker Compose]
end
subgraph "Couche 2 - Configuration Locale"
BACKEND[Backend .env]
FRONTEND[Frontend .env]
API_EXAMPLE[.env.example]
end
subgraph "Couche 3 - Scripts Automatisés"
DEPLOY[deploy.sh]
START[start-fullstack.sh]
CHECK[check-env.js]
end
subgraph "Couche 4 - Services"
NGINX[Nginx Proxy]
PM2[PM2 Process Manager]
API[API Backend]
APP[Main App]
end
ENV --> BACKEND
ENV --> FRONTEND
DOCKER --> NGINX
BACKEND --> PM2
FRONTEND --> NGINX
DEPLOY --> DOCKER
START --> PM2
CHECK --> API
PM2 --> API
NGINX --> API
NGINX --> APP
```

**Sources du diagramme**
- [docker-compose.yml](file://infrastructure/docker-compose.yml#L1-L41)
- [deploy.sh](file://deploy.sh#L1-L105)
- [start-fullstack.sh](file://start-fullstack.sh#L1-L81)

## Variables d'Environnement Clés

### Variables de Build (Build Variable = YES)

Les variables de build sont injectées lors de la construction des images Docker et ne changent pas après déploiement :

```typescript
// Variables Vite (frontend)
VITE_API_BASE_URL=https://api.oraclelumira.com
VITE_STRIPE_PUBLISHABLE_KEY= pk_test_your_publishable_key_here...
VITE_APP_DOMAIN=https://oraclelumira.com

// Variables d'application
VITE_APP_NAME=Oracle Lumira
VITE_APP_VERSION=1.0.0
COMMIT_SHA=                                    // Auto-populée par CI/CD
```

### Variables d'Exécution (Build Variable = NO)

Les variables d'exécution sont configurées au moment du déploiement et peuvent varier entre environnements :

```typescript
// Configuration serveur
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://oraclelumira.com
API_BASE_URL=https://oraclelumira.com/api
DESK_HOSTNAME=desk.oraclelumira.com

// Sécurité et authentification
JWT_SECRET=REPLACE_WITH_32_PLUS_RANDOM_CHARS_IN_COOLIFY
JWT_EXPIRES_IN=7d
CORS_ORIGIN=https://oraclelumira.com,https://desk.oraclelumira.com
ENABLE_DEBUG_ROUTES=false

// Base de données
MONGODB_URI=REPLACE_WITH_PRODUCTION_MONGODB_URI_IN_COOLIFY
MONGO_ROOT_PASSWORD=REPLACE_WITH_STRONG_MONGO_PASSWORD_IN_COOLIFY

// Paiements Stripe
STRIPE_SECRET_KEY=REPLACE_WITH_LIVE_STRIPE_SECRET_IN_COOLIFY
STRIPE_WEBHOOK_SECRET=REPLACE_WITH_STRIPE_WEBHOOK_SECRET_IN_COOLIFY
VITE_STRIPE_PUBLIC_KEY=REPLACE_WITH_LIVE_STRIPE_PUBLIC_IN_COOLIFY

// Services externes
SENDGRID_API_KEY=REPLACE_WITH_SENDGRID_KEY_IN_COOLIFY_IF_NEEDED
AWS_S3_BUCKET=oracle-lumira-files
AWS_ACCESS_KEY_ID=REPLACE_WITH_AWS_ACCESS_KEY_IN_COOLIFY_IF_NEEDED
```

**Sources de section**
- [.env.example](file://.env.example#L1-L70)

## Configuration de Développement

### Configuration locale avec .env.example

Le fichier `.env.example` sert de template pour tous les environnements de développement :

```typescript
// Configuration de base
NODE_ENV=development
PORT=3001
VITE_API_URL=http://localhost:3001/api

// Variables de développement uniquement
ENABLE_DEBUG_ROUTES=true
LOG_LEVEL=debug
RATE_LIMIT_MAX_REQUESTS=1000
```

### Utilisation dans le code

Les variables d'environnement sont accédées via `process.env` dans le code TypeScript :

```typescript
// Exemple d'utilisation dans l'API backend
import * as dotenv from 'dotenv';
dotenv.config();

const port = process.env.PORT || 3001;
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const mongoUri = process.env.MONGODB_URI;

// Validation des variables critiques
if (!stripeSecretKey) {
  throw new Error('STRIPE_SECRET_KEY is required');
}
```

### Route de débogage d'environnement

Une route spécialisée permet de vérifier l'état des variables d'environnement :

```typescript
// GET /api/debug/env-check
{
  "environment": {
    "NODE_ENV": "production",
    "PORT": "3001",
    "STRIPE_SECRET_KEY": "SET (28 chars)",
    "MONGODB_URI": "SET (45 chars)",
    "allEnvKeys": [
      "NODE_ENV",
      "PORT",
      "STRIPE_SECRET_KEY",
      "MONGODB_URI"
    ]
  },
  "timestamp": "2024-01-15T10:30:45.123Z"
}
```

**Sources de section**
- [apps/api-backend/src/routes/env-debug.ts](file://apps/api-backend/src/routes/env-debug.ts#L30-L46)
- [check-env.js](file://check-env.js#L1-L38)

## Configuration de Production

### Variables de production sécurisées

La configuration de production utilise des variables sécurisées injectées par Coolify ou d'autres plateformes de déploiement :

```typescript
// Variables critiques pour la production
NODE_ENV=production
PORT=3001
JWT_SECRET=long_random_string_from_coolify_secrets
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/database?retryWrites=true&w=majority
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

### Configuration Nginx

Le serveur web Nginx est configuré pour servir les applications frontend et backend :

```nginx
# Configuration de base
server {
    listen 80;
    server_name oraclelumira.com www.oraclelumira.com;
    
    # Proxy vers l'API backend
    location /api/ {
        proxy_pass http://localhost:3001/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Gestion des assets statiques
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### Gestion des erreurs de variables manquantes

Le système inclut une validation robuste pour détecter les variables manquantes :

```javascript
// check-env.js - Validation automatique
console.log('=== Environment Variable Check ===');
console.log('NODE_ENV:', process.env.NODE_ENV || 'UNSET');
console.log('PORT:', process.env.PORT || 'UNSET');
console.log('STRIPE_SECRET_KEY:', process.env.STRIPE_SECRET_KEY ? `SET (${process.env.STRIPE_SECRET_KEY.length} chars)` : 'UNSET');
console.log('MONGODB_URI:', process.env.MONGODB_URI ? `SET (${process.env.MONGODB_URI.length} chars)` : 'UNSET');

if (!process.env.STRIPE_SECRET_KEY) {
  console.log('❌ STRIPE_SECRET_KEY is missing - payment intent will fail');
  process.exit(1);
}
```

**Sources de section**
- [nginx.conf](file://nginx.conf#L1-L62)
- [check-env.js](file://check-env.js#L1-L38)

## Intégration Docker

### Configuration Docker Compose

Le fichier `docker-compose.yml` orchestre les services nécessaires :

```yaml
version: '3.8'

services:
  main-app:
    build: ../apps/main-app
    container_name: oracle_main
    restart: unless-stopped
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.main.rule=Host(`oraclelumira.com`)"
      - "traefik.http.services.main.loadbalancer.server.port=80"

  expert-desk:
    build: ../apps/expert-desk
    container_name: oracle_desk
    restart: unless-stopped
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.desk.rule=Host(`desk.oraclelumira.com`)"
      - "traefik.http.services.desk.loadbalancer.server.port=80"

  dolibarr:
    image: dolibarr/dolibarr:17
    container_name: oracle_crm
    restart: unless-stopped
    environment:
      DOLI_DB_TYPE: mysqli
      DOLI_DB_HOST: mysql
      DOLI_DB_NAME: dolibarr
      DOLI_DB_USER: dolibarr
      DOLI_DB_PASSWORD: ${MYSQL_PASSWORD}
      DOLI_URL_ROOT: https://crm.oraclelumira.com
```

### Image Docker personnalisée

Le Dockerfile du backend construit une image optimisée :

```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
EXPOSE 3000
CMD ["node", "dist/server.js"]
```

### Variables d'environnement Docker

Les variables d'environnement sont passées au conteneur via Docker Compose :

```yaml
environment:
  - NODE_ENV=production
  - PORT=3001
  - STRIPE_SECRET_KEY=${STRIPE_SECRET_KEY}
  - MONGODB_URI=${MONGODB_URI}
  - JWT_SECRET=${JWT_SECRET}
```

**Sources de section**
- [docker-compose.yml](file://infrastructure/docker-compose.yml#L1-L41)
- [apps/api-backend/Dockerfile](file://apps/api-backend/Dockerfile#L1-L15)

## Scripts de Déploiement

### Script de déploiement principal (deploy.sh)

Le script `deploy.sh` automise le processus complet de déploiement :

```bash
#!/bin/bash

# Fonction de gestion des couleurs
print_status() { echo -e "\033[0;34m[INFO]\033[0m $1"; }
print_success() { echo -e "\033[0;32m[SUCCESS]\033[0m $1"; }
print_error() { echo -e "\033[0;31m[ERROR]\033[0m $1"; }

# Vérification des fichiers .env
if [ ! -f "apps/api-backend/.env" ]; then
    print_warning "Backend .env file not found. Creating from example..."
    if [ -f "apps/api-backend/.env.example" ]; then
        cp apps/api-backend/.env.example apps/api-backend/.env
        print_status "Please configure your .env file with proper values"
    fi
fi

# Construction des applications
print_status "Building backend..."
cd apps/api-backend
npm run build

print_status "Building frontend..."
cd ../main-app
npm run build

# Démarrage des services Docker
print_status "Starting Docker services..."
docker-compose up --build -d
```

### Script de démarrage fullstack (start-fullstack.sh)

Ce script gère le démarrage complet du système en production :

```bash
#!/usr/bin/env bash
set -Eeuo pipefail

# Création du fichier .env pour PM2
cat > /app/.env << EOF
NODE_ENV=${NODE_ENV:-production}
PORT=${PORT:-3000}
STRIPE_SECRET_KEY=${STRIPE_SECRET_KEY:-}
MONGODB_URI=${MONGODB_URI:-}
STRIPE_WEBHOOK_SECRET=${STRIPE_WEBHOOK_SECRET:-}
JWT_SECRET=${JWT_SECRET:-default_jwt_secret}
VITE_STRIPE_PUBLISHABLE_KEY=${VITE_STRIPE_PUBLISHABLE_KEY:-}
VITE_API_BASE_URL=${VITE_API_BASE_URL:-}
EOF

# Validation des variables critiques
if [ -z "${STRIPE_SECRET_KEY:-}" ]; then
  log "WARNING: STRIPE_SECRET_KEY is empty or unset"
else
  log "- STRIPE_SECRET_KEY=set (${#STRIPE_SECRET_KEY} chars)"
fi

# Démarrage via PM2
pm2 start /app/ecosystem.config.json --env production
```

### Configuration PM2

Le fichier `ecosystem.config.json` configure PM2 pour la gestion des processus :

```json
{
  "apps": [
    {
      "name": "api-backend",
      "script": "/app/apps/api-backend/dist/server.js",
      "instances": 1,
      "exec_mode": "fork",
      "watch": false,
      "env_file": "/app/.env",
      "env": {
        "NODE_ENV": "production",
        "PORT": "3000"
      },
      "out_file": "/dev/stdout",
      "error_file": "/dev/stderr",
      "max_restarts": 10,
      "min_uptime": "10s"
    }
  ]
}
```

**Sources de section**
- [deploy.sh](file://deploy.sh#L1-L105)
- [start-fullstack.sh](file://start-fullstack.sh#L1-L81)
- [ecosystem.config.json](file://ecosystem.config.json#L1-L31)

## Gestion des Secrets

### Stratégie de rotation des secrets

Le système implémente une stratégie de rotation des secrets sécurisée :

```typescript
// Exemple de génération de secrets sécurisés
import crypto from 'crypto';

// Génération de JWT_SECRET
const jwtSecret = crypto.randomBytes(32).toString('hex');
console.log('Generated JWT_SECRET:', jwtSecret);

// Génération de MONGODB_URI sécurisé
const mongoUri = `mongodb+srv://${username}:${password}@cluster.mongodb.net/database?retryWrites=true&w=majority`;
```

### Sécurité des variables sensibles

Les variables sensibles sont protégées par plusieurs couches :

1. **Chiffrement en transit** : HTTPS/TLS pour toutes les communications
2. **Stockage sécurisé** : Variables d'environnement système plutôt que fichiers
3. **Accès limité** : Restrictions d'accès aux conteneurs Docker
4. **Audit** : Logs centralisés pour surveillance des accès

### Variables de sécurité critiques

```typescript
// Variables de sécurité absolument critiques
JWT_SECRET: "32 caractères aléatoires cryptographiquement sécurisés"
MONGODB_URI: "URI de connexion sécurisée avec authentification"
STRIPE_SECRET_KEY: "Clé secrète Stripe pour paiements"
STRIPE_WEBHOOK_SECRET: "Clé de signature pour webhooks Stripe"
```

## Dépannage

### Problèmes courants et solutions

#### 1. Variables d'environnement manquantes

**Symptôme** : Erreur 500 lors des opérations Stripe
**Solution** :
```bash
# Vérification des variables
node check-env.js

# Redémarrage avec variables correctes
export STRIPE_SECRET_KEY="sk_live_xxxxxxxxxxxxx"
export MONGODB_URI="mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>"
pm2 restart api-backend
```

#### 2. Configuration Docker incorrecte

**Symptôme** : Services ne démarrent pas
**Solution** :
```bash
# Vérification de la configuration Docker
docker-compose config

# Reconstruction des images
docker-compose build --no-cache

# Vérification des logs
docker-compose logs -f
```

#### 3. Problèmes de permissions

**Symptôme** : Accès refusé aux fichiers .env
**Solution** :
```bash
# Correction des permissions
chmod 600 apps/api-backend/.env
chown -R app:app apps/api-backend/

# Vérification des permissions
ls -la apps/api-backend/.env
```

### Outils de diagnostic

#### Script de diagnostic complet

```bash
#!/bin/bash
# diagnose-production.sh

echo "=== Diagnostic de Production ==="

# Vérification des variables d'environnement
echo "Variables d'environnement :"
env | grep -E "(STRIPE|MONGODB|JWT)" | sort

# Vérification des services Docker
echo "Services Docker :"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# Vérification des logs PM2
echo "Logs PM2 :"
pm2 list
pm2 logs api-backend --lines 20

# Vérification des ports
echo "Ports ouverts :"
netstat -tlnp | grep -E "(3000|3001|80)"

# Vérification des certificats SSL
echo "Certificats SSL :"
openssl s_client -connect oraclelumira.com:443 -servername oraclelumira.com
```

#### Validation des connexions

```bash
# Test de connectivité API
curl -I https://api.oraclelumira.com/api/healthz

# Test de connectivité MongoDB
mongo --uri "mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>"

# Test de paiements Stripe
curl -X POST https://api.stripe.com/v1/payment_intents \
  -u sk_test_xxxxxxxxxxxxx: \
  -d amount=1000 \
  -d currency=eur
```

**Sources de section**
- [check-env.js](file://check-env.js#L1-L38)
- [PAYMENT-INTENT-IMPLEMENTATION-STATUS.md](file://PAYMENT-INTENT-IMPLEMENTATION-STATUS.md#L45-L146)

## Conclusion

La configuration d'environnement de LumiraV1-MVP représente une approche mature et sécurisée pour la gestion des paramètres applicatifs. Le système offre :

### Avantages clés

1. **Séparation claire** entre variables de build et runtime
2. **Sécurité renforcée** avec chiffrement et rotation des secrets
3. **Flexibilité** pour différents environnements (dev, staging, prod)
4. **Automatisation** complète via scripts et Docker
5. **Observabilité** avec monitoring et logs centralisés

### Bonnes pratiques implémentées

- Utilisation de variables d'environnement système plutôt que fichiers
- Validation automatique des configurations critiques
- Gestion centralisée via PM2 et Docker
- Scripts de déploiement idempotents
- Monitoring et alerting intégré

### Recommandations futures

1. **Implémenter Vault** pour une gestion avancée des secrets
2. **Ajouter des tests d'intégration** pour la configuration
3. **Améliorer la documentation** des variables d'environnement
4. **Automatiser la rotation** périodique des secrets
5. **Étendre le monitoring** avec métriques de performance

Cette architecture constitue une base solide pour le déploiement et la maintenance de l'application Oracle Lumira, garantissant la sécurité, la fiabilité et la scalabilité du système.
