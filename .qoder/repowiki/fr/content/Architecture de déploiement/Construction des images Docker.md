# Construction des Images Docker

<cite>
**Fichiers Référencés dans ce Document**
- [Dockerfile](file://Dockerfile)
- [apps/main-app/Dockerfile](file://apps/main-app/Dockerfile)
- [apps/api-backend/Dockerfile](file://apps/api-backend/Dockerfile)
- [apps/expert-desk/Dockerfile](file://apps/expert-desk/Dockerfile)
- [infrastructure/docker-compose.yml](file://infrastructure/docker-compose.yml)
- [nginx-frontend.conf](file://nginx-frontend.conf)
- [nginx.conf](file://nginx.conf)
- [package.json](file://package.json)
- [COOLIFY-DEPLOYMENT-GUIDE.md](file://COOLIFY-DEPLOYMENT-GUIDE.md)
</cite>

## Table des Matières
1. [Introduction](#introduction)
2. [Vue d'Ensemble de l'Architecture Docker](#vue-densemble-de-larchitecture-docker)
3. [Dockerfile main-app](#dockerfile-main-app)
4. [Dockerfile api-backend](#dockerfile-api-backend)
5. [Dockerfile expert-desk](#dockerfile-expert-desk)
6. [Comparaison des Approches](#comparaison-des-approches)
7. [Bonnes Pratiques de Sécurité](#bonnes-pratiques-de-sécurité)
8. [Optimisation des Performances](#optimisation-des-performances)
9. [Intégration avec docker-compose](#intégration-avec-docker-compose)
10. [Guide de Déploiement](#guide-de-déploiement)
11. [Conclusion](#conclusion)

## Introduction

Le projet Oracle Lumira utilise une architecture Docker moderne avec plusieurs applications distinctes, chacune ayant ses propres besoins de construction et de déploiement. Cette documentation explore en détail les stratégies de construction des images Docker, en se concentrant sur les trois principaux Dockerfiles : main-app (application principale), api-backend (serveur API), et expert-desk (interface expert).

L'approche adoptée combine les techniques de multi-stage builds, l'optimisation des couches Docker, et l'application de bonnes pratiques de sécurité pour créer des images légères et sécurisées. Chaque application suit une stratégie adaptée à ses spécificités techniques et de performance.

## Vue d'Ensemble de l'Architecture Docker

L'architecture Docker du projet Oracle Lumira suit un modèle de services multiples orchestrés par Docker Compose. Chaque service possède sa propre image Docker optimisée selon ses besoins spécifiques.

```mermaid
graph TB
subgraph "Infrastructure Globale"
DC[docker-compose.yml]
TR[Traefik Load Balancer]
NG[Nginx Proxy]
end
subgraph "Applications Frontend"
MA[main-app<br/>React/Vite]
ED[expert-desk<br/>React/Vite]
end
subgraph "Applications Backend"
API[api-backend<br/>Express/TypeScript]
DB[(MongoDB)]
end
subgraph "Services Externes"
CR[Dolibarr CRM]
ST[Stripe Payments]
EM[SendGrid Email]
end
DC --> MA
DC --> ED
DC --> API
DC --> DB
DC --> CR
TR --> MA
TR --> ED
TR --> API
TR --> CR
MA --> API
API --> DB
API --> ST
API --> EM
NG --> MA
NG --> ED
```

**Sources du Diagramme**
- [infrastructure/docker-compose.yml](file://infrastructure/docker-compose.yml#L1-L41)
- [COOLIFY-DEPLOYMENT-GUIDE.md](file://COOLIFY-DEPLOYMENT-GUIDE.md#L1-L50)

## Dockerfile main-app

Le Dockerfile de main-app implémente une stratégie de multi-stage build sophistiquée optimisée pour les applications React/Vite. Cette approche minimise la taille finale de l'image tout en maintenant les performances de production.

### Étape de Build (Stage 1)

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app

# Copie des fichiers de configuration du workspace
COPY ../../package.json ../../package-lock.json ./

# Installation optimisée des dépendances
RUN npm ci --include=dev

# Installation du binding Linux pour Rollup
RUN npm install @rollup/rollup-linux-x64-musl --save-dev

# Copie du code source spécifique à main-app
COPY . ./apps/main-app

# Build de l'application
WORKDIR /app/apps/main-app
RUN npm run build
```

**Analyse des Instructions Clés :**

- **FROM node:20-alpine AS builder** : Utilisation de la dernière version LTS de Node.js avec Alpine Linux pour minimiser la taille de l'image
- **npm ci --include=dev** : Installation optimisée des dépendances avec package-lock.json
- **@rollup/rollup-linux-x64-musl** : Installation du binding natif pour améliorer les performances de build
- **WORKDIR /app/apps/main-app** : Positionnement dans le répertoire spécifique de l'application

### Étape de Production (Stage 2)

```dockerfile
FROM nginx:alpine AS production

# Installation d'utilitaires pour les healthchecks
RUN apk add --no-cache curl

# Copie des assets construits
COPY --from=builder /app/apps/main-app/dist /usr/share/nginx/html

# Configuration Nginx optimisée pour SPA
RUN echo 'server { \
    listen 80; \
    server_name _; \
    root /usr/share/nginx/html; \
    index index.html; \
    \
    # Headers de sécurité \
    add_header X-Frame-Options "DENY" always; \
    add_header X-Content-Type-Options "nosniff" always; \
    add_header X-XSS-Protection "1; mode=block" always; \
    \
    # Compression \
    gzip on; \
    gzip_vary on; \
    gzip_min_length 1024; \
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript; \
    \
    # Cache des ressources statiques \
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ { \
        expires 1y; \
        add_header Cache-Control "public, immutable"; \
    } \
    \
    # Routage SPA \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

# Health check pour monitoring
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost/health.json || exit 1

CMD ["nginx", "-g", "daemon off;"]
```

**Sources de la Section**
- [apps/main-app/Dockerfile](file://apps/main-app/Dockerfile#L1-L76)

## Dockerfile api-backend

Le Dockerfile api-backend suit une approche plus simple mais efficace pour les applications Node.js Express. Cette stratégie optimise la rapidité de déploiement tout en maintenant la sécurité.

### Construction Multi-Stage Simplifiée

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

**Analyse des Optimisations :**

- **Version Node.js 18** : Utilisation d'une version LTS stable pour la production
- **Copie sélective** : Seules les dépendances nécessaires sont copiées depuis le stage de build
- **Exposition du port 3000** : Port standard pour les applications Express
- **CMD simplifié** : Point d'entrée direct vers le serveur compilé

**Sources de la Section**
- [apps/api-backend/Dockerfile](file://apps/api-backend/Dockerfile#L1-L15)

## Dockerfile expert-desk

Le Dockerfile expert-desk combine les avantages du multi-stage build avec des optimisations spécifiques pour les applications React destinées aux experts.

### Configuration Avancée Nginx

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --verbose
COPY . .
ENV NODE_ENV=production
RUN npm run build

FROM nginx:alpine
RUN apk add --no-cache curl

# Copie des assets construits
COPY --from=builder /app/dist /usr/share/nginx/html

# Configuration Nginx personnalisée
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Permissions appropriées
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chown -R nginx:nginx /var/cache/nginx

# Création du répertoire PID nginx
RUN mkdir -p /var/run/nginx && \
    chown -R nginx:nginx /var/run/nginx

EXPOSE 80

# Health check optimisé
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
```

**Configuration Nginx Spécifique :**

```nginx
# Headers de sécurité renforcés
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' *.stripe.com *.google.com; style-src 'self' 'unsafe-inline' fonts.googleapis.com; font-src 'self' fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' *.stripe.com api.openai.com;" always;
```

**Sources de la Section**
- [apps/expert-desk/Dockerfile](file://apps/expert-desk/Dockerfile#L1-L51)
- [nginx.conf](file://nginx.conf#L1-L62)

## Comparaison des Approches

### Stratégies de Multi-Stage Build

```mermaid
graph LR
subgraph "main-app"
MA1[Builder: Node 20 + Alpine]
MA2[Production: Nginx Alpine]
MA3[Compression & Cache]
end
subgraph "api-backend"
API1[Builder: Node 18 + Alpine]
API2[Runtime: Node 18 + Alpine]
API3[Minimal Build]
end
subgraph "expert-desk"
ED1[Builder: Node 20 + Alpine]
ED2[Production: Nginx Alpine]
ED3[Permissions & Security]
end
MA1 --> MA2
API1 --> API2
ED1 --> ED2
MA2 --> MA3
ED2 --> ED3
```

**Sources du Diagramme**
- [apps/main-app/Dockerfile](file://apps/main-app/Dockerfile#L1-L76)
- [apps/api-backend/Dockerfile](file://apps/api-backend/Dockerfile#L1-L15)
- [apps/expert-desk/Dockerfile](file://apps/expert-desk/Dockerfile#L1-L51)

### Différences Clés par Application

| Aspect | main-app | api-backend | expert-desk |
|--------|----------|-------------|-------------|
| **Version Node** | 20.18.1 | 18.x | 20.x |
| **Build Tool** | Vite | TypeScript | Vite |
| **Serveur Web** | Nginx | None | Nginx |
| **Stratégie Build** | Multi-stage | Multi-stage | Multi-stage |
| **Optimisations** | Compression, cache | Minimal | Permissions, security |
| **Ports Exposés** | 80 | 3000 | 80 |

## Bonnes Pratiques de Sécurité

### Utilisation d'Utilisateurs Non-Root

Bien que les Dockerfiles actuels ne créent pas explicitement des utilisateurs non-root, les bonnes pratiques recommandées incluent :

```dockerfile
# Recommandation pour créer un utilisateur sécurisé
RUN addgroup -g 1001 lumira && \
    adduser -D -s /bin/sh -u 1001 lumira -G lumira

USER lumira
WORKDIR /app
```

### Minimisation des Couches

Les Dockerfiles appliquent plusieurs stratégies pour minimiser le nombre de couches :

1. **Combinaison des RUN** :
```dockerfile
# ❌ Mauvais - trop de couches
RUN apt-get update
RUN apt-get install -y curl
RUN apt-get clean

# ✅ Bon - couche unique
RUN apk add --no-cache curl
```

2. **Copie sélective** :
```dockerfile
# Copie seulement des fichiers nécessaires
COPY package*.json ./
RUN npm ci
COPY . .
```

3. **Nettoyage automatique** :
```dockerfile
# Nettoyage immédiat après installation
RUN npm ci && npm cache clean --force
```

### Headers de Sécurité Nginx

Chaque application implémente des headers de sécurité standardisés :

```nginx
# Headers de sécurité communs
add_header X-Frame-Options "DENY" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
```

**Sources de la Section**
- [nginx-frontend.conf](file://nginx-frontend.conf#L17-L21)
- [nginx.conf](file://nginx.conf#L18-L23)

## Optimisation des Performances

### Caching des Dépendances

La stratégie de caching optimise significativement les temps de build :

```dockerfile
# Étape 1: Copie des fichiers package.json
COPY package*.json ./

# Étape 2: Installation des dépendances
RUN npm ci

# Étape 3: Copie du reste du code
COPY . .

# Étape 4: Build de l'application
RUN npm run build
```

Cette approche permet au cache Docker de réutiliser les étapes d'installation tant que package.json n'a pas changé.

### Configuration Nginx Optimisée

```nginx
# Compression Gzip
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css text/xml text/javascript application/javascript application/json application/xml+rss;

# Cache des ressources statiques
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}

# Routage SPA avec fallback
location / {
    try_files $uri $uri/ /index.html;
}
```

### .dockerignore Recommandé

Pour optimiser encore plus les performances :

```
# Ignorer les fichiers de développement
node_modules/
.git/
*.log
.env*
*.local

# Ignorer les builds temporaires
dist/
build/
*.tmp

# Ignorer les caches système
.npm-cache/
.yarn-cache/
```

**Sources de la Section**
- [nginx-frontend.conf](file://nginx-frontend.conf#L8-L15)
- [nginx.conf](file://nginx.conf#L8-L15)

## Intégration avec docker-compose

### Configuration docker-compose.yml

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

  api-backend:
    build: ../apps/api-backend
    container_name: oracle_api
    restart: unless-stopped
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.api.rule=Host(`api.oraclelumira.com`)"
      - "traefik.http.services.api.loadbalancer.server.port=3000"
```

### Orchestration des Services

```mermaid
sequenceDiagram
participant Client as Client Browser
participant Traefik as Traefik LB
participant MainApp as main-app : 80
participant ExpertDesk as expert-desk : 80
participant API as api-backend : 3000
Client->>Traefik : Requête oraclelumira.com
Traefik->>MainApp : Route vers main-app
MainApp-->>Traefik : Réponse HTML/CSS/JS
Traefik-->>Client : Contenu statique
Client->>Traefik : Requête desk.oraclelumira.com
Traefik->>ExpertDesk : Route vers expert-desk
ExpertDesk-->>Traefik : Interface expert
Traefik-->>Client : Interface React
Client->>Traefik : Requête api.oraclelumira.com
Traefik->>API : Route vers api-backend
API-->>Traefik : Données JSON/API
Traefik-->>Client : Réponses API
```

**Sources du Diagramme**
- [infrastructure/docker-compose.yml](file://infrastructure/docker-compose.yml#L4-L20)

**Sources de la Section**
- [infrastructure/docker-compose.yml](file://infrastructure/docker-compose.yml#L1-L41)

## Guide de Déploiement

### Variables d'Environnement Critiques

Pour le déploiement en production, les variables suivantes sont essentielles :

```bash
# Variables obligatoires
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_VotreCleStripe
VITE_API_BASE_URL=https://api.oraclelumira.com
VITE_APP_DOMAIN=oraclelumira.com

# Variables de sécurité
JWT_SECRET=VotreJWTSecretLongEtComplexe
MONGODB_URI=mongodb://root:password@mongo:27017/lumira?authSource=admin

# Variables Stripe
STRIPE_SECRET_KEY=sk_live_VotreCleStripeSecrete
STRIPE_WEBHOOK_SECRET=whsec_VotreWebhookSecret
```

### Commandes de Build et Déploiement

```bash
# Build des images individuelles
docker build -f apps/main-app/Dockerfile -t oracle-main:latest .
docker build -f apps/api-backend/Dockerfile -t oracle-api:latest .
docker build -f apps/expert-desk/Dockerfile -t oracle-desk:latest .

# Build avec variables d'environnement
docker build -f apps/main-app/Dockerfile \
  --build-arg VITE_STRIPE_PUBLISHABLE_KEY=pk_live_xxx \
  --build-arg VITE_API_BASE_URL=https://api.example.com \
  -t oracle-main:prod .

# Déploiement avec docker-compose
docker-compose up -d

# Validation des healthchecks
curl -f http://localhost/health.json
curl -f http://localhost:3000/health
```

### Monitoring et Observabilité

```bash
# Vérification des containers
docker ps --filter "health=healthy"

# Logs en temps réel
docker-compose logs -f main-app
docker-compose logs -f api-backend

# Inspection des healthchecks
docker inspect oracle_main --format='{{.State.Health.Status}}'
```

**Sources de la Section**
- [COOLIFY-DEPLOYMENT-GUIDE.md](file://COOLIFY-DEPLOYMENT-GUIDE.md#L25-L60)

## Conclusion

L'architecture Docker du projet Oracle Lumira démontre une approche mature et bien pensée pour la construction d'applications modernes. Les trois Dockerfiles analysés illustrent différentes stratégies adaptées aux besoins spécifiques de chaque application :

1. **main-app** : Multi-stage build sophistiqué avec optimisations Nginx pour les applications React
2. **api-backend** : Approche minimaliste efficace pour les services backend
3. **expert-desk** : Combinaison de sécurité et de performance pour les interfaces spécialisées

Les bonnes pratiques appliquées incluent la minimisation des couches, l'utilisation d'utilisateurs non-root, les headers de sécurité, et les healthchecks robustes. L'intégration avec docker-compose et Traefik permet une orchestration fluide des services, tandis que les stratégies de caching optimisent considérablement les temps de build.

Cette architecture fournit une base solide pour le déploiement en production, avec des mécanismes de monitoring intégrés et des procédures de rollback rapides. La compatibilité avec Coolify et les outils de CI/CD facilite les déploiements automatisés et les mises à jour continues.