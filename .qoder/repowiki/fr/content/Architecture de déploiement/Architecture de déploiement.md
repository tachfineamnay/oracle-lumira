# Architecture de déploiement

<cite>
**Fichiers référencés dans ce document**
- [infrastructure/docker-compose.yml](file://infrastructure/docker-compose.yml)
- [Dockerfile](file://Dockerfile)
- [apps/main-app/Dockerfile](file://apps/main-app/Dockerfile)
- [apps/expert-desk/Dockerfile](file://apps/expert-desk/Dockerfile)
- [apps/api-backend/Dockerfile](file://apps/api-backend/Dockerfile)
- [nginx.conf](file://nginx.conf)
- [nginx-frontend.conf](file://nginx-frontend.conf)
- [nginx-fullstack.conf](file://nginx-fullstack.conf)
- [start-fullstack-optimized.sh](file://start-fullstack-optimized.sh)
- [ecosystem.config.json](file://ecosystem.config.json)
- [COOLIFY-DEPLOYMENT-GUIDE.md](file://COOLIFY-DEPLOYMENT-GUIDE.md)
- [COOLIFY-DOCKER-COMPOSE-GUIDE.md](file://COOLIFY-DOCKER-COMPOSE-GUIDE.md)
- [PRE-PRODUCTION-CHECKLIST.md](file://PRE-PRODUCTION-CHECKLIST.md)
</cite>

## Table des matières
1. [Introduction](#introduction)
2. [Structure du projet](#structure-du-projet)
3. [Infrastructure Docker](#infrastructure-docker)
4. [Configuration Nginx](#configuration-nginx)
5. [Orchestration des conteneurs](#orchestration-des-conteneurs)
6. [Topologie de déploiement](#topologie-de-déploiement)
7. [Considérations de sécurité](#considérations-de-sécurité)
8. [Scalabilité et haute disponibilité](#scalabilité-et-haute-disponibilité)
9. [Surveillance et monitoring](#surveillance-et-monitoring)
10. [Communication inter-services](#communication-inter-services)
11. [Guide de déploiement](#guide-de-déploiement)
12. [Conclusion](#conclusion)

## Introduction

L'architecture de déploiement d'Oracle Lumira utilise une approche moderne basée sur Docker et Docker Compose pour orchestrer une stack complète comprenant un frontend React, un backend Node.js, une base de données MongoDB, et un système CRM Dolibarr. Cette architecture permet un déploiement cohérent, scalable et maintenable dans différents environnements.

L'infrastructure repose sur plusieurs composants clés :
- **Docker Compose** pour l'orchestration des services
- **Nginx** comme proxy inverse et serveur web statique
- **Coolify** comme plateforme de déploiement continu
- **Traefik** pour la gestion automatique des routes et SSL

## Structure du projet

L'architecture de déploiement est organisée autour de plusieurs répertoires principaux :

```mermaid
graph TB
subgraph "Répertoire racine"
Root[LumiraV1-MVP]
Infrastructure[infrastructure/]
Security[security/]
Apps[apps/]
Config[Configuration]
end
subgraph "Applications"
MainApp[main-app/]
ExpertDesk[expert-desk/]
ApiBackend[api-backend/]
end
subgraph "Fichiers de configuration"
DockerCompose[docker-compose.yml]
NginxConf[nginx.conf]
DockerFiles[Dockerfiles]
end
Root --> Infrastructure
Root --> Security
Root --> Apps
Root --> Config
Infrastructure --> DockerCompose
Apps --> MainApp
Apps --> ExpertDesk
Apps --> ApiBackend
MainApp --> DockerFiles
ExpertDesk --> DockerFiles
ApiBackend --> DockerFiles
```

**Sources du diagramme**
- [infrastructure/docker-compose.yml](file://infrastructure/docker-compose.yml#L1-L41)
- [apps/main-app/Dockerfile](file://apps/main-app/Dockerfile#L1-L76)
- [apps/expert-desk/Dockerfile](file://apps/expert-desk/Dockerfile#L1-L51)
- [apps/api-backend/Dockerfile](file://apps/api-backend/Dockerfile#L1-L15)

**Sources de section**
- [infrastructure/docker-compose.yml](file://infrastructure/docker-compose.yml#L1-L41)

## Infrastructure Docker

### Architecture multi-conteneurs

L'infrastructure utilise Docker Compose pour orchestrer plusieurs services indépendants mais interconnectés :

```mermaid
graph LR
subgraph "Services principaux"
MainApp[main-app<br/>Frontend React]
ExpertDesk[expert-desk<br/>Interface expert]
ApiBackend[api-backend<br/>API Node.js]
Dolibarr[dolibarr<br/>CRM]
end
subgraph "Services de support"
MySQL[mysql<br/>Base de données]
Mongo[mongo<br/>MongoDB]
Redis[redis<br/>Cache]
end
subgraph "Services réseau"
Traefik[traefik<br/>Reverse proxy]
Nginx[Nginx<br/>Serveur web]
end
Traefik --> MainApp
Traefik --> ExpertDesk
Traefik --> ApiBackend
Traefik --> Dolibarr
MainApp --> Nginx
ExpertDesk --> Nginx
ApiBackend --> Nginx
ApiBackend --> Mongo
ApiBackend --> MySQL
ApiBackend --> Redis
```

**Sources du diagramme**
- [infrastructure/docker-compose.yml](file://infrastructure/docker-compose.yml#L4-L35)

### Configuration Docker Compose

Le fichier `docker-compose.yml` définit la topologie complète des services :

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
    volumes:
      - dolibarr_data:/var/www/html
    depends_on:
      - mysql
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.crm.rule=Host(`crm.oraclelumira.com`)"
      - "traefik.http.services.crm.loadbalancer.server.port=80"
```

**Sources de section**
- [infrastructure/docker-compose.yml](file://infrastructure/docker-compose.yml#L1-L41)

## Configuration Nginx

### Architecture de proxy inverse

Le système utilise Nginx comme proxy inverse pour gérer les requêtes entrantes et distribuer le trafic vers les services appropriés :

```mermaid
sequenceDiagram
participant Client as Client
participant Traefik as Traefik (Port 80/443)
participant MainApp as main-app (Port 80)
participant ExpertDesk as expert-desk (Port 80)
participant ApiBackend as api-backend (Port 3000)
participant MongoDB as MongoDB
Client->>Traefik : Requête HTTPS
Traefik->>Traefik : Routage basé sur Host
alt Frontend SPA
Traefik->>MainApp : Route / → SPA
MainApp->>MainApp : Serve static files
MainApp-->>Client : HTML/CSS/JS
else Interface Expert
Traefik->>ExpertDesk : Route / → SPA
ExpertDesk->>ExpertDesk : Serve static files
ExpertDesk-->>Client : Interface React
else API Backend
Traefik->>ApiBackend : Route /api/ → Backend
ApiBackend->>ApiBackend : Process API requests
ApiBackend->>MongoDB : Database queries
MongoDB-->>ApiBackend : Query results
ApiBackend-->>Client : JSON responses
else CRM Dolibarr
Traefik->>Dolibarr : Route / → CRM
Dolibarr->>Dolibarr : Serve CRM interface
Dolibarr-->>Client : CRM web interface
end
```

**Sources du diagramme**
- [nginx.conf](file://nginx.conf#L25-L61)
- [nginx-frontend.conf](file://nginx-frontend.conf#L25-L60)

### Configuration Nginx principale

La configuration Nginx principale (`nginx.conf`) gère le routage pour tous les services :

```nginx
server {
    listen 80;
    server_name oraclelumira.com www.oraclelumira.com;
    root /usr/share/nginx/html;
    index index.html;
    
    # Headers de sécurité
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' *.stripe.com *.google.com; style-src 'self' 'unsafe-inline' fonts.googleapis.com; font-src 'self' fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' *.stripe.com api.openai.com;" always;

    # Routage SPA
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy API
    location /api/ {
        proxy_pass http://localhost:3001/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Cache assets statiques
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

**Sources de section**
- [nginx.conf](file://nginx.conf#L1-L62)
- [nginx-frontend.conf](file://nginx-frontend.conf#L1-L61)

## Orchestration des conteneurs

### Dockerfiles par service

Chaque service utilise un Dockerfile optimisé pour sa fonction spécifique :

#### Dockerfile principal (Frontend React)

```mermaid
flowchart TD
Start([Démarrage build]) --> NodeImage["node:20.18.1-alpine<br/>Stage 1: Build frontend"]
NodeImage --> CopyPackage["Copier package.json"]
CopyPackage --> InstallDeps["npm install"]
InstallDeps --> CopySrc["Copier code source"]
CopySrc --> BuildApp["npm run build"]
BuildApp --> NginxStage["nginx:1.27-alpine<br/>Stage 2: Serveur statique"]
NginxStage --> CopyAssets["Copier dist/"]
CopyAssets --> HealthCheck["Créer health.json"]
HealthCheck --> ConfigNginx["Configurer nginx.conf"]
ConfigNginx --> ExposePort["Exposer port 80"]
ExposePort --> HealthEndpoint["Health check avec curl"]
HealthEndpoint --> End([Conteneur prêt])
```

**Sources du diagramme**
- [Dockerfile](file://Dockerfile#L1-L44)

#### Dockerfile API Backend

```mermaid
flowchart TD
Start([Démarrage build]) --> NodeBuilder["node:18-alpine<br/>Stage 1: Builder"]
NodeBuilder --> CopyPackage["Copier package.json"]
CopyPackage --> InstallDeps["npm ci"]
InstallDeps --> CopySrc["Copier source"]
CopySrc --> BuildTs["npm run build"]
BuildTs --> NodeProd["node:18-alpine<br/>Stage 2: Production"]
NodeProd --> CopyModules["Copier node_modules"]
CopyModules --> CopyDist["Copier dist/"]
CopyDist --> CopyPackageJson["Copier package.json"]
CopyPackageJson --> ExposePort["Exposer port 3000"]
ExposePort --> StartCmd["CMD node dist/server.js"]
StartCmd --> End([Conteneur prêt])
```

**Sources du diagramme**
- [apps/api-backend/Dockerfile](file://apps/api-backend/Dockerfile#L1-L15)

### Scripts de démarrage

Le script `start-fullstack-optimized.sh` orchestre le démarrage séquentiel des services :

```bash
#!/bin/sh
# Démarrage optimisé de l'application fullstack

# Validation de l'environnement
echo "🔍 Environment Check:"
echo "  Node: $(node --version)"
echo "  NPM: $(npm --version)"
echo "  PM2: $(pm2 --version)"

# Démarrage API backend avec PM2
pm2-runtime start ecosystem.config.json --env production &
PM2_PID=$!

# Attente API prête
echo "⏳ Waiting for API to be ready on port 3000..."
TIMEOUT=30
COUNTER=0
API_READY=false

while [ $COUNTER -lt $TIMEOUT ]; do
    if nc -z 127.0.0.1 3000 2>/dev/null; then
        echo "✅ API is ready on port 3000"
        API_READY=true
        break
    fi
    COUNTER=$((COUNTER + 1))
    sleep 1
done

# Démarrage Nginx
echo "🌐 Starting Nginx on port 8080..."
nginx -t
exec nginx -g 'daemon off;'
```

**Sources de section**
- [start-fullstack-optimized.sh](file://start-fullstack-optimized.sh#L1-L82)
- [ecosystem.config.json](file://ecosystem.config.json#L1-L31)

## Topologie de déploiement

### Réseau et communication

```mermaid
graph TB
subgraph "Réseau Docker"
subgraph "Frontend Network"
MainAppContainer[main-app<br/>Container: oracle_main]
ExpertDeskContainer[expert-desk<br/>Container: oracle_desk]
end
subgraph "Backend Network"
ApiContainer[api-backend<br/>Container: oracle_api]
MongoDBContainer[MongoDB<br/>Container: oracle_mongo]
MySQLContainer[MySQL<br/>Container: oracle_mysql]
end
subgraph "Services externes"
DolibarrContainer[Dolibarr<br/>Container: oracle_crm]
Stripe[Stripe API]
OpenAI[OpenAI API]
end
end
subgraph "Services de proxy"
Traefik[Traefik<br/>Port 80/443]
Nginx[Nginx<br/>Port 8080]
end
subgraph "Domaines"
MainDomain[oraclelumira.com]
DeskDomain[desk.oraclelumira.com]
CrmDomain[crm.oraclelumira.com]
end
MainDomain --> Traefik
DeskDomain --> Traefik
CrmDomain --> Traefik
Traefik --> MainAppContainer
Traefik --> ExpertDeskContainer
Traefik --> ApiContainer
Traefik --> DolibarrContainer
MainAppContainer --> Nginx
ExpertDeskContainer --> Nginx
ApiContainer --> Nginx
ApiContainer --> MongoDBContainer
ApiContainer --> MySQLContainer
ApiContainer --> Stripe
ApiContainer --> OpenAI
```

**Sources du diagramme**
- [infrastructure/docker-compose.yml](file://infrastructure/docker-compose.yml#L4-L35)

### Ports et volumes

Les services utilisent les configurations de ports et volumes suivantes :

| Service | Port interne | Port externe | Volume persistant |
|---------|--------------|--------------|-------------------|
| main-app | 80 | - | - |
| expert-desk | 80 | - | - |
| api-backend | 3000 | - | - |
| dolibarr | 80 | - | dolibarr_data |
| mongodb | 27017 | - | mongodb_data |
| mysql | 3306 | - | mysql_data |

**Sources de section**
- [infrastructure/docker-compose.yml](file://infrastructure/docker-compose.yml#L4-L35)

## Considérations de sécurité

### Headers de sécurité

La configuration Nginx inclut des headers de sécurité stricts :

```nginx
# Headers de sécurité
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' *.stripe.com *.google.com; style-src 'self' 'unsafe-inline' fonts.googleapis.com; font-src 'self' fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' *.stripe.com api.openai.com;" always;
```

### Gestion des secrets

Les variables d'environnement sensibles sont gérées via Coolify :

```bash
# Variables d'environnement obligatoires
MONGODB_URI=mongodb://root:VOTRE_PASSWORD_MONGO@mongo:27017/lumira-mvp?authSource=admin
JWT_SECRET=VotreJWTSecretDe32CaracteresOuPlus123456
CORS_ORIGIN=https://oraclelumira.com,https://desk.oraclelumira.com
STRIPE_SECRET_KEY=sk_live_VotreCleStripeSecrete
STRIPE_WEBHOOK_SECRET=whsec_VotreWebhookSecret
```

### Isolation des conteneurs

- **Réseau interne** : Les services communiquent uniquement via le réseau Docker interne
- **Ports exposés** : Seuls les ports nécessaires sont exposés au niveau du proxy
- **Permissions** : Les conteneurs s'exécutent avec des utilisateurs non-root quand possible

**Sources de section**
- [nginx.conf](file://nginx.conf#L18-L25)
- [COOLIFY-DEPLOYMENT-GUIDE.md](file://COOLIFY-DEPLOYMENT-GUIDE.md#L20-L40)

## Scalabilité et haute disponibilité

### Architecture scalable

```mermaid
graph TB
subgraph "Load Balancer Layer"
LB[Traefik Load Balancer]
end
subgraph "Application Layer"
subgraph "Frontend Cluster"
MainApp1[main-app-1]
MainApp2[main-app-2]
MainApp3[main-app-3]
end
subgraph "Backend Cluster"
Api1[api-backend-1]
Api2[api-backend-2]
Api3[api-backend-3]
end
end
subgraph "Data Layer"
subgraph "Database Cluster"
Master[MongoDB Master]
Slave1[MongoDB Slave 1]
Slave2[MongoDB Slave 2]
end
subgraph "Cache Layer"
Redis1[Redis Instance 1]
Redis2[Redis Instance 2]
end
end
subgraph "External Services"
CDN[CDN Distribution]
Stripe[Stripe Payments]
Email[Email Service]
end
LB --> MainApp1
LB --> MainApp2
LB --> MainApp3
LB --> Api1
LB --> Api2
LB --> Api3
MainApp1 --> CDN
MainApp2 --> CDN
MainApp3 --> CDN
Api1 --> Master
Api2 --> Master
Api3 --> Master
Master --> Slave1
Master --> Slave2
Api1 --> Redis1
Api2 --> Redis2
Api3 --> Redis1
Api1 --> Stripe
Api2 --> Stripe
Api3 --> Stripe
Api1 --> Email
Api2 --> Email
Api3 --> Email
```

### Stratégies de scaling

1. **Horizontal Pod Autoscaling** : Auto-scaling basé sur la mémoire et CPU
2. **Load balancing** : Répartition du trafic via Traefik
3. **Database clustering** : Réplication MongoDB pour haute disponibilité
4. **Cache distribution** : Redis cluster pour la mise en cache

### Ressources et limites

```yaml
services:
  main-app:
    deploy:
      replicas: 3
      resources:
        limits:
          memory: 512M
          cpus: '0.5'
        reservations:
          memory: 256M
          cpus: '0.25'
```

## Surveillance et monitoring

### Health checks

Chaque service implémente des health checks robustes :

```mermaid
sequenceDiagram
participant Traefik as Traefik
participant MainApp as main-app
participant ExpertDesk as expert-desk
participant ApiBackend as api-backend
participant MongoDB as MongoDB
loop Every 30 seconds
Traefik->>MainApp : GET /health.json
MainApp-->>Traefik : {"status" : "healthy"}
Traefik->>ExpertDesk : GET /health.json
ExpertDesk-->>Traefik : {"status" : "healthy"}
Traefik->>ApiBackend : GET /api/health
ApiBackend->>MongoDB : Check connection
MongoDB-->>ApiBackend : Connection status
ApiBackend-->>Traefik : {"status" : "healthy"}
end
```

**Sources du diagramme**
- [apps/main-app/Dockerfile](file://apps/main-app/Dockerfile#L65-L70)
- [apps/expert-desk/Dockerfile](file://apps/expert-desk/Dockerfile#L40-L45)

### Métriques et alertes

```mermaid
graph LR
subgraph "Sources de données"
Containers[Conteneurs]
Network[Réseaux]
Storage[Stockage]
Applications[Applications]
end
subgraph "Collecteurs"
Prometheus[Prometheus]
Grafana[Grafana]
Logs[Log Aggregation]
end
subgraph "Alertes"
Email[Email Alerts]
Slack[Slack Notifications]
PagerDuty[PagerDuty]
end
Containers --> Prometheus
Network --> Prometheus
Storage --> Prometheus
Applications --> Prometheus
Prometheus --> Grafana
Prometheus --> Logs
Grafana --> Email
Prometheus --> Slack
Prometheus --> PagerDuty
```

### Endpoints de monitoring

| Service | Endpoint | Description |
|---------|----------|-------------|
| Frontend | `/health.json` | Statut du conteneur Nginx |
| API Backend | `/api/health` | Statut de l'API et base de données |
| MongoDB | `/api/db/health` | Statut de la base de données |
| Redis | `/api/redis/health` | Statut du cache |

**Sources de section**
- [COOLIFY-DEPLOYMENT-GUIDE.md](file://COOLIFY-DEPLOYMENT-GUIDE.md#L80-L100)

## Communication inter-services

### Protocoles de communication

```mermaid
sequenceDiagram
participant MainApp as Frontend React
participant Nginx as Nginx Proxy
participant ApiBackend as API Backend
participant MongoDB as MongoDB
participant Stripe as Stripe API
participant Dolibarr as Dolibarr CRM
MainApp->>Nginx : GET / (SPA)
Nginx-->>MainApp : Static files
MainApp->>Nginx : POST /api/orders (Commande)
Nginx->>ApiBackend : Proxy /api/orders
ApiBackend->>MongoDB : Create order
MongoDB-->>ApiBackend : Order created
ApiBackend->>Stripe : Create payment intent
Stripe-->>ApiBackend : Payment intent
ApiBackend-->>Nginx : JSON response
Nginx-->>MainApp : HTTP 200
ApiBackend->>Dolibarr : Sync customer data
Dolibarr-->>ApiBackend : Customer synced
Note over MainApp,Dolibarr : Communication inter-services via réseau Docker
```

**Sources du diagramme**
- [nginx.conf](file://nginx.conf#L40-L50)
- [start-fullstack-optimized.sh](file://start-fullstack-optimized.sh#L45-L55)

### Patterns de communication

1. **Asynchrone** : Webhooks Stripe, notifications Dolibarr
2. **Synchrone** : API REST entre services
3. **Event-driven** : Messages de queue pour tâches longues
4. **Cache-first** : Redis pour données fréquemment accédées

### Gestion des erreurs

```mermaid
flowchart TD
Request[Requête entrante] --> Validate[Validation]
Validate --> Valid{Valide?}
Valid --> |Non| ErrorResponse[Erreur 400]
Valid --> |Oui| Process[Traitement]
Process --> Success{Succès?}
Success --> |Oui| Response[Réponse 200]
Success --> |Non| Retry{Retry?}
Retry --> |Oui| Process
Retry --> |Non| ErrorResponse
ErrorResponse --> Log[Logger erreur]
Response --> Log
Log --> End[Fin]
```

**Sources de section**
- [start-fullstack-optimized.sh](file://start-fullstack-optimized.sh#L35-L55)

## Guide de déploiement

### Prérequis système

```mermaid
graph TB
subgraph "Prérequis"
Coolify[Coolify v4]
GitRepo[Repository Git]
DNS[DNS configuré]
SSL[Certificats SSL]
end
subgraph "Variables d'environnement"
Database[MONGODB_URI]
Stripe[STRIPE_SECRET_KEY]
Security[JWT_SECRET]
Cors[CORS_ORIGIN]
end
subgraph "Services externes"
StripeAPI[Stripe API]
EmailService[Email Service]
CloudStorage[Cloud Storage]
end
Coolify --> GitRepo
GitRepo --> DNS
DNS --> SSL
SSL --> Database
Database --> Stripe
Stripe --> Security
Security --> Cors
Cors --> StripeAPI
Cors --> EmailService
Cors --> CloudStorage
```

**Sources du diagramme**
- [COOLIFY-DEPLOYMENT-GUIDE.md](file://COOLIFY-DEPLOYMENT-GUIDE.md#L10-L50)

### Processus de déploiement

1. **Configuration Coolify**
   ```bash
   # Connexion repository
   git remote add coolify https://git.coolify.io/your-project.git
   
   # Configuration des variables d'environnement
   MONGODB_URI=mongodb://root:password@mongo:27017/lumira-mvp
   STRIPE_SECRET_KEY=sk_live_xxx
   JWT_SECRET=your-jwt-secret
   ```

2. **Build et déploiement**
   ```bash
   # Build automatique via Coolify
   docker-compose build
   
   # Démarrage des services
   docker-compose up -d
   
   # Vérification des health checks
   curl https://your-domain.com/health.json
   curl https://your-domain.com/api/health
   ```

3. **Validation post-déploiement**
   ```bash
   # Tests de fonctionnalité
   npm run test:e2e
   npm run test:api
   
   # Tests de performance
   npm run test:load
   ```

### Rollback procedure

```bash
# Procédure de rollback rapide (< 2 min)
1. Coolify UI > Deployments
2. Sélectionner commit stable précédent
3. "Redeploy" > Confirmer
4. Vérifier healthchecks ✅

# Procédure de rollback avancé
1. Arrêter services
2. Restaurer backup MongoDB
3. Redéployer version stable
4. Vérifier intégrité données
```

**Sources de section**
- [COOLIFY-DEPLOYMENT-GUIDE.md](file://COOLIFY-DEPLOYMENT-GUIDE.md#L150-L200)
- [PRE-PRODUCTION-CHECKLIST.md](file://PRE-PRODUCTION-CHECKLIST.md#L100-L128)

## Conclusion

L'architecture de déploiement d'Oracle Lumira représente une solution moderne et robuste pour le déploiement d'applications web complexes. Elle combine les avantages de Docker pour la conteneurisation, Traefik pour la gestion des routes, et Coolify pour le déploiement continu.

### Points forts de l'architecture

1. **Modularité** : Chaque service est indépendant et peut être mis à l'échelle individuellement
2. **Sécurité** : Headers de sécurité stricts, isolation des conteneurs, gestion sécurisée des secrets
3. **Disponibilité** : Architecture redondante avec load balancing et failover automatique
4. **Observabilité** : Monitoring complet avec health checks et alertes
5. **Facilité de déploiement** : Automatisation via Coolify et scripts de validation

### Recommandations futures

1. **Kubernetes** : Migration vers Kubernetes pour une gestion plus fine des ressources
2. **Service Mesh** : Implémentation Istio pour la gestion des communications inter-services
3. **Monitoring avancé** : Intégration de Jaeger pour le tracing distribué
4. **CI/CD** : Amélioration du pipeline CI/CD avec déploiements blue-green

Cette architecture fournit une base solide pour l'évolution future de l'application tout en maintenant la stabilité et la performance requises pour un environnement de production.