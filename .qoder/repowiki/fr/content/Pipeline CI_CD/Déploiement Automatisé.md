# Déploiement Automatisé

<cite>
**Fichiers Référencés dans ce Document**
- [deploy.sh](file://deploy.sh)
- [deploy.ps1](file://deploy.ps1)
- [infrastructure/docker-compose.yml](file://infrastructure/docker-compose.yml)
- [COOLIFY-DEPLOYMENT-GUIDE.md](file://COOLIFY-DEPLOYMENT-GUIDE.md)
- [COOLIFY-DEPLOYMENT-RUNBOOK.md](file://COOLIFY-DEPLOYMENT-RUNBOOK.md)
- [README-COOLIFY-DEPLOY.md](file://README-COOLIFY-DEPLOY.md)
- [DEPLOYMENT-RUNBOOK-FINAL.md](file://DEPLOYMENT-RUNBOOK-FINAL.md)
- [validate-local-docker.sh](file://validate-local-docker.sh)
- [start-fullstack.sh](file://start-fullstack.sh)
- [ecosystem.config.json](file://ecosystem.config.json)
</cite>

## Table des Matières
1. [Introduction](#introduction)
2. [Structure du Projet](#structure-du-projet)
3. [Scripts de Déploiement](#scripts-de-déploiement)
4. [Architecture de Déploiement](#architecture-de-déploiement)
5. [Processus de Déploiement](#processus-de-déploiement)
6. [Intégration Coolify](#intégration-coolify)
7. [Validation et Diagnostic](#validation-et-diagnostic)
8. [Stratégies de Rollback](#stratégies-de-rollback)
9. [Guide de Dépannage](#guide-de-dépannage)
10. [Conclusion](#conclusion)

## Introduction

Le système de déploiement automatisé de LumiraV1-MVP représente une solution complète pour le déploiement cross-platform de l'application de paiement. Ce système intègre deux scripts principaux : `deploy.sh` (script Bash) et `deploy.ps1` (script PowerShell) qui permettent l'automatisation du déploiement sur différentes plateformes. Le déploiement s'appuie sur Docker Compose pour la conteneurisation et s'intègre parfaitement avec Coolify pour le déploiement en production.

Cette documentation détaille toutes les étapes du processus de déploiement, depuis la préparation de l'environnement jusqu'à la vérification de l'état des services, en passant par la gestion des erreurs et les stratégies de rollback.

## Structure du Projet

Le projet LumiraV1-MVP est organisé en plusieurs composants clés qui facilitent le déploiement automatisé :

```mermaid
graph TB
subgraph "Application Frontend"
MA[Main App<br/>React/Vite]
ED[Expert Desk<br/>React/Vite]
end
subgraph "Backend API"
API[API Backend<br/>Node.js/Express]
end
subgraph "Infrastructure"
DC[docker-compose.yml]
DF[Dockerfiles]
SC[Scripts de Déploiement]
end
subgraph "Plateforme de Déploiement"
C[Coolify v4]
NG[Nginx Proxy]
PM2[PM2 Process Manager]
end
MA --> DC
ED --> DC
API --> DC
DC --> DF
SC --> DC
DC --> C
C --> NG
NG --> PM2
PM2 --> API
```

**Sources du Diagramme**
- [infrastructure/docker-compose.yml](file://infrastructure/docker-compose.yml#L1-L41)
- [deploy.sh](file://deploy.sh#L1-L105)
- [deploy.ps1](file://deploy.ps1#L1-L182)

**Sources de Section**
- [infrastructure/docker-compose.yml](file://infrastructure/docker-compose.yml#L1-L41)
- [deploy.sh](file://deploy.sh#L1-L105)
- [deploy.ps1](file://deploy.ps1#L1-L182)

## Scripts de Déploiement

### Script Bash (deploy.sh)

Le script `deploy.sh` est conçu pour les environnements Unix/Linux et offre un processus de déploiement complet avec gestion des couleurs et des messages d'état :

```bash
#!/bin/bash

# Couleurs pour la sortie
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'

# Fonctions de message coloré
print_status() { echo -e "${BLUE}[INFO]${NC} $1"; }
print_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
print_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
print_error() { echo -e "${RED}[ERROR]${NC} $1"; }
```

**Fonctionnalités principales :**
- **Gestion des couleurs** : Messages colorés pour une meilleure visibilité
- **Vérification de l'environnement** : Contrôle de la présence des fichiers `.env`
- **Construction des applications** : Compilation des trois composants (frontend, backend, expert desk)
- **Démarrage Docker** : Utilisation de `docker-compose up --build -d`
- **Messages d'état** : Informations détaillées sur chaque étape

### Script PowerShell (deploy.ps1)

Le script `deploy.ps1` offre des fonctionnalités avancées pour Windows et les environnements PowerShell :

```powershell
function Write-Status { param($Message) }
function Write-Success { param($Message) }
function Write-Warning { param($Message) }
function Write-Error { param($Message) }

# Paramètres optionnels
param(
    [switch]$SkipBuild,
    [switch]$Development
)
```

**Fonctionnalités avancées :**
- **Paramètres flexibles** : Options `SkipBuild` et `Development`
- **Gestion d'erreurs robuste** : Blocs `try/catch` pour chaque opération
- **Vérification Docker** : Contrôle de l'installation et des versions
- **Health checks automatiques** : Vérification des services après déploiement
- **Mode développement** : Hot reload et surveillance continue

**Sources de Section**
- [deploy.sh](file://deploy.sh#L1-L105)
- [deploy.ps1](file://deploy.ps1#L1-L182)

## Architecture de Déploiement

### Composants Docker

L'architecture de déploiement repose sur Docker Compose pour orchestrer les services :

```mermaid
graph LR
subgraph "Services Docker"
MA[main-app<br/>Port 80]
ED[expert-desk<br/>Port 80]
DB[(MongoDB<br/>Port 27017)]
CRM[Dolibarr<br/>Port 80]
end
subgraph "Proxy et Load Balancing"
TR[Traefik Router]
LB[Load Balancer]
end
subgraph "Réseau Interne"
NET[Réseau Docker]
end
TR --> LB
LB --> MA
LB --> ED
MA --> DB
ED --> DB
CRM --> DB
NET --> TR
NET --> MA
NET --> ED
NET --> DB
NET --> CRM
```

**Sources du Diagramme**
- [infrastructure/docker-compose.yml](file://infrastructure/docker-compose.yml#L1-L41)

### Configuration Docker Compose

Le fichier `docker-compose.yml` définit la topologie des services :

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

  expert-desk:
    build: ../apps/expert-desk
    container_name: oracle_desk
    restart: unless-stopped
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.desk.rule=Host(`desk.oraclelumira.com`)"
```

**Sources de Section**
- [infrastructure/docker-compose.yml](file://infrastructure/docker-compose.yml#L1-L41)

## Processus de Déploiement

### Étape 1 : Préparation de l'Environnement

Les scripts de déploiement commencent par la vérification et la configuration de l'environnement :

```mermaid
flowchart TD
Start([Début du Déploiement]) --> CheckDir["Vérifier docker-compose.yml"]
CheckDir --> DirExists{"Fichier trouvé ?"}
DirExists --> |Non| ErrorExit["Erreur et Exit"]
DirExists --> |Oui| CheckEnv["Vérifier .env"]
CheckEnv --> EnvExists{"Fichiers .env présents ?"}
EnvExists --> |Non| CreateEnv["Créer depuis .env.example"]
EnvExists --> |Oui| BuildApps["Construire les Applications"]
CreateEnv --> BuildApps
BuildApps --> BuildSuccess{"Construction réussie ?"}
BuildSuccess --> |Non| ErrorExit
BuildSuccess --> |Oui| StartDocker["Démarrer Docker"]
StartDocker --> DockerSuccess{"Démarrage réussi ?"}
DockerSuccess --> |Non| ErrorExit
DockerSuccess --> |Oui| Success["Déploiement Terminé"]
ErrorExit --> End([Fin])
Success --> End
```

**Sources du Diagramme**
- [deploy.sh](file://deploy.sh#L25-L105)
- [deploy.ps1](file://deploy.ps1#L25-L182)

### Étape 2 : Construction des Applications

Chaque application est construite séquentiellement avec gestion d'erreurs :

```bash
# Construction du backend
cd apps/api-backend
if npm run build; then
    print_success "Backend build completed"
else
    print_error "Backend build failed"
    exit 1
fi
cd ../..
```

**Processus de construction :**
1. **Backend API** : Compilation TypeScript vers JavaScript
2. **Frontend Principal** : Build React/Vite avec optimisations
3. **Expert Desk** : Build React/Vite pour interface d'experts

### Étape 3 : Démarrage des Services

Le démarrage des services utilise Docker Compose avec reconstruction forcée :

```bash
if docker-compose up --build -d; then
    print_success "Docker services started successfully"
else
    print_error "Docker services failed to start"
    exit 1
fi
```

**Sources de Section**
- [deploy.sh](file://deploy.sh#L45-L85)
- [deploy.ps1](file://deploy.ps1#L85-L150)

## Intégration Coolify

### Configuration Coolify v4

Coolify fournit une plateforme de déploiement automatisé avec des fonctionnalités avancées :

```mermaid
sequenceDiagram
participant Dev as Développeur
participant Git as Repository Git
participant Coolify as Coolify v4
participant Docker as Docker Registry
participant Prod as Production
Dev->>Git : Push code
Git->>Coolify : Webhook
Coolify->>Docker : Build images
Docker-->>Coolify : Images built
Coolify->>Prod : Deploy services
Prod-->>Coolify : Health check
Coolify-->>Dev : Deployment status
```

**Sources du Diagramme**
- [COOLIFY-DEPLOYMENT-GUIDE.md](file://COOLIFY-DEPLOYMENT-GUIDE.md#L1-L228)
- [README-COOLIFY-DEPLOY.md](file://README-COOLIFY-DEPLOY.md#L1-L182)

### Variables d'Environnement Critiques

Coolify nécessite la configuration de plusieurs variables d'environnement :

```bash
# Base de données
MONGODB_URI=mongodb://root:password@mongo:27017/lumira-mvp?authSource=admin
MONGO_ROOT_PASSWORD=VotrePasswordMongoSecurise2024

# Sécurité
JWT_SECRET=VotreJWTSecretDe32CaracteresOuPlus123456
CORS_ORIGIN=https://oraclelumira.com,https://desk.oraclelumira.com

# Stripe (obligatoire)
STRIPE_SECRET_KEY=sk_live_VotreCleStripeSecrete
STRIPE_WEBHOOK_SECRET=whsec_VotreWebhookSecret
VITE_STRIPE_PUBLIC_KEY=pk_live_VotreCleStripePublique
```

### Configuration des Ports

```bash
# Port interne pour Coolify
Internal Port: 8080

# Configuration nginx sur port 8080
# Proxy API vers port 3000
# Serveur statique sur port 8080
```

**Sources de Section**
- [COOLIFY-DEPLOYMENT-GUIDE.md](file://COOLIFY-DEPLOYMENT-GUIDE.md#L1-L228)
- [README-COOLIFY-DEPLOY.md](file://README-COOLIFY-DEPLOY.md#L1-L182)

## Validation et Diagnostic

### Scripts de Validation Locaux

Le script `validate-local-docker.sh` permet de tester le déploiement localement avant la production :

```bash
#!/bin/bash
echo "🧪 LOCAL DOCKER VALIDATION FOR ORACLE LUMIRA"

# Build avec arguments appropriés
docker build -t oracle-lumira:test \
  --build-arg VITE_STRIPE_PUBLISHABLE_KEY=pk_test_dummy \
  --build-arg VITE_API_BASE_URL=http://localhost:8080/api \
  .

# Tests d'endpoints
echo -n "Health check: "
HEALTH=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/health.json)
```

**Tests automatisés :**
1. **Endpoint de santé** : `http://localhost:8080/health.json`
2. **Frontend principal** : `http://localhost:8080/`
3. **API backend** : `http://localhost:8080/api/healthz`

### Validation Coolify

Coolify intègre des mécanismes de validation automatiques :

```mermaid
flowchart TD
Deploy[Redéploiement] --> Build[Build Process]
Build --> Health[Health Check]
Health --> Healthy{"Container Healthy ?"}
Healthy --> |Oui| Monitor[Monitoring]
Healthy --> |Non| Rollback[Rollback]
Monitor --> Success[Deployment Success]
Rollback --> Diag[Diagnostic]
Diag --> Fix[Apply Fixes]
Fix --> Deploy
```

**Sources du Diagramme**
- [DEPLOYMENT-RUNBOOK-FINAL.md](file://DEPLOYMENT-RUNBOOK-FINAL.md#L1-L133)
- [validate-local-docker.sh](file://validate-local-docker.sh#L1-L75)

**Sources de Section**
- [validate-local-docker.sh](file://validate-local-docker.sh#L1-L75)
- [DEPLOYMENT-RUNBOOK-FINAL.md](file://DEPLOYMENT-RUNBOOK-FINAL.md#L1-L133)

## Stratégies de Rollback

### Rollback Rapide via Coolify

Coolify permet un rollback rapide en quelques clics :

```bash
1. Accéder à Coolify UI > Deployments
2. Sélectionner le commit stable précédent
3. Cliquer sur "Redeploy" > Confirmer
4. Vérifier les healthchecks ✅
```

### Rollback Avancé

Pour les situations complexes, un rollback avancé peut être nécessaire :

```bash
# Procédure de rollback avancé
1. Arrêter les services actuels
2. Restaurer la sauvegarde MongoDB
3. Déployer la version stable
4. Vérifier l'intégrité des données
```

### Mécanismes de Protection

```mermaid
graph TB
subgraph "Protection Continue"
HC[Health Checks]
MON[Monitoring]
ALRT[Alertes]
end
subgraph "Rollback Automatique"
AUTO[Auto-Rollback]
MANUAL[Manual Intervention]
BACKUP[Backup Restore]
end
subgraph "Validation"
VAL[Post-Rollback Validation]
TEST[Test Suite]
PERF[Performance Check]
end
HC --> AUTO
MON --> AUTO
AUTO --> BACKUP
MANUAL --> BACKUP
BACKUP --> VAL
VAL --> TEST
TEST --> PERF
```

**Sources du Diagramme**
- [DEPLOYMENT-RUNBOOK-FINAL.md](file://DEPLOYMENT-RUNBOOK-FINAL.md#L124-L132)

**Sources de Section**
- [DEPLOYMENT-RUNBOOK-FINAL.md](file://DEPLOYMENT-RUNBOOK-FINAL.md#L124-L132)

## Guide de Dépannage

### Problèmes Courants

#### Erreurs de Build

```bash
# Problème : Build échoue - dépendances manquantes
docker-compose build --no-cache

# Solution : Nettoyer et reconstruire
docker system prune -a
docker-compose build --pull
```

#### Problèmes de Connexion MongoDB

```bash
# Vérification de la configuration MongoDB
Vérifier:
- MONGODB_URI et MONGO_ROOT_PASSWORD
- Réseau Docker entre services
- Ports ouverts (27017)
```

#### Erreurs CORS

```bash
# Vérification des origines CORS
CORS_ORIGIN=contient tous les domaines requis
Exemple: https://oraclelumira.com,https://desk.oraclelumira.com
```

### Diagnostic Container

Pour diagnostiquer les problèmes de container :

```bash
# Vérification des ports
ss -lntp | grep -E "8080|3000"

# Statut des processus
ps aux | grep -E "nginx|node"

# Tests de configuration nginx
nginx -t

# Logs PM2
pm2 list && pm2 logs --lines 50

# Tests internes
curl -v http://127.0.0.1:8080/health.json
curl -v http://127.0.0.1:3000/api/healthz
```

### Scripts de Diagnostic

Le système inclut plusieurs scripts de diagnostic :

```bash
# Diagnostic complet
./diagnose-bad-gateway.sh
./diagnose-container.sh
./diagnose-production.sh

# Validation locale
./validate-local-docker.sh
```

**Sources de Section**
- [DEPLOYMENT-RUNBOOK-FINAL.md](file://DEPLOYMENT-RUNBOOK-FINAL.md#L80-L120)

## Conclusion

Le système de déploiement automatisé de LumiraV1-MVP représente une solution robuste et flexible pour le déploiement cross-platform. Les scripts `deploy.sh` et `deploy.ps1` offrent une expérience utilisateur cohérente tout en adaptant leurs fonctionnalités aux spécificités de chaque plateforme.

L'intégration avec Coolify v4 apporte des capacités avancées de monitoring, de scaling automatique et de rollback, garantissant la haute disponibilité des services en production. La combinaison de validation automatique, de diagnostic intégré et de mécanismes de protection assure un déploiement fiable et sécurisé.

Les processus de rollback rapides et avancés, ainsi que les scripts de diagnostic complets, permettent une résolution efficace des problèmes potentiels, minimisant ainsi les temps d'arrêt et assurant la continuité des services.

Cette architecture modulaire et extensible facilite l'évolution du système tout en maintenant la stabilité et la sécurité des déploiements en production.