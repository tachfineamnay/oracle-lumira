# Pipeline CI/CD - LumiraV1-MVP

<cite>
**Fichiers Référencés dans ce Document**
- [deploy.sh](file://deploy.sh)
- [deploy.ps1](file://deploy.ps1)
- [test-workflow.js](file://test-workflow.js)
- [validate-fixes.ps1](file://validate-fixes.ps1)
- [COOLIFY-DEPLOYMENT-GUIDE.md](file://COOLIFY-DEPLOYMENT-GUIDE.md)
- [infrastructure/docker-compose.yml](file://infrastructure/docker-compose.yml)
- [ecosystem.config.json](file://ecosystem.config.json)
- [package.json](file://package.json)
- [TEST-FLOW.md](file://TEST-FLOW.md)
- [SECURITY-HARDENING-PATCHES.md](file://SECURITY-HARDENING-PATCHES.md)
</cite>

## Table des Matières
1. [Introduction](#introduction)
2. [Structure du Pipeline](#structure-du-pipeline)
3. [Scripts de Déploiement](#scripts-de-déploiement)
4. [Tests Automatisés](#tests-automatisés)
5. [Validation des Correctifs](#validation-des-correctifs)
6. [Intégration avec Coolify](#intégration-avec-coolify)
7. [Gestion des Versions](#gestion-des-versions)
8. [Bonnes Pratiques](#bonnes-pratiques)
9. [Guide de Dépannage](#guide-de-dépannage)
10. [Conclusion](#conclusion)

## Introduction

Le pipeline CI/CD de LumiraV1-MVP constitue un système d'automatisation sophistiqué permettant le déploiement continu et la validation des modifications du projet. Ce pipeline intègre plusieurs composants : des scripts de déploiement cross-platform, des tests automatisés, une validation de sécurité approfondie, et une intégration native avec l'outil de déploiement Coolify.

Le système adopte une approche multi-environnement supportant à la fois Windows (PowerShell) et Linux (Bash), garantissant ainsi une compatibilité maximale tout en maintenant des processus de déploiement identiques.

## Structure du Pipeline

Le pipeline CI/CD de LumiraV1-MVP suit une architecture modulaire organisée autour de plusieurs piliers fondamentaux :

```mermaid
flowchart TD
A["Développement Local"] --> B["Tests Unitaires"]
B --> C["Tests d'Intégration"]
C --> D["Validation Sécurité"]
D --> E["Build Multi-App"]
E --> F["Dockerisation"]
F --> G["Déploiement Coolify"]
H["Scripts de Déploiement"] --> I["Validation Environnement"]
I --> J["Installation Dépendances"]
J --> K["Build Applications"]
K --> L["Démarrage Services"]
M["Tests Automatisés"] --> N["Workflow Oracle Lumira"]
N --> O["Validation Complète"]
P["Validation Correctifs"] --> Q["Vérifications Docker"]
Q --> R["Vérifications Nginx"]
R --> S["Audit Sécurité"]
```

**Sources du Diagramme**
- [deploy.sh](file://deploy.sh#L1-L105)
- [deploy.ps1](file://deploy.ps1#L1-L182)
- [test-workflow.js](file://test-workflow.js#L1-L146)

## Scripts de Déploiement

### Script Bash Linux (`deploy.sh`)

Le script `deploy.sh` offre une interface utilisateur colorée et structurée pour le déploiement sur environnements Linux et macOS. Il implémente un processus de déploiement étape par étape avec gestion d'erreurs robuste.

```bash
#!/bin/bash
# Couleurs pour la sortie
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Fonctions de logging coloré
print_status() { echo -e "${BLUE}[INFO]${NC} $1"; }
print_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
print_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
print_error() { echo -e "${RED}[ERROR]${NC} $1"; }
```

**Caractéristiques principales :**
- **Gestion d'environnement** : Vérification et création automatique des fichiers `.env`
- **Build multi-applications** : Construction séquentielle des trois applications (main-app, expert-desk, api-backend)
- **Docker orchestration** : Utilisation de docker-compose pour le déploiement
- **Logs interactifs** : Sortie colorée et structurée pour une meilleure visibilité

### Script PowerShell Windows (`deploy.ps1`)

Le script `deploy.ps1` fournit une alternative native Windows avec des fonctionnalités avancées de gestion d'erreurs et de développement.

```powershell
# Paramètres de configuration
param(
    [switch]$SkipBuild,
    [switch]$Development
)

# Fonctions de logging
function Write-Status { param($Message); Write-Host "[INFO] $Message" -ForegroundColor Blue; }
function Write-Success { param($Message); Write-Host "[SUCCESS] $Message" -ForegroundColor Green; }
function Write-Warning { param($Message); Write-Host "[WARNING] $Message" -ForegroundColor Yellow; }
function Write-Error { param($Message); Write-Host "[ERROR] $Message" -ForegroundColor Red; }
```

**Fonctionnalités avancées :**
- **Mode développement** : Support du hot-reload avec `-Development`
- **Skip build** : Option pour ignorer les étapes de build
- **Health checks** : Vérification automatique de la santé des services
- **Timeout configurable** : Gestion des timeouts réseau avec `-TimeoutSec 5`

**Sources de Section**
- [deploy.sh](file://deploy.sh#L1-L105)
- [deploy.ps1](file://deploy.ps1#L1-L182)

## Tests Automatisés

### Test Workflow Principal (`test-workflow.js`)

Le script `test-workflow.js` implémente un test end-to-end complet du système Oracle Lumira, couvrant le flux complet depuis la création d'une commande jusqu'à la livraison finale.

```javascript
/**
 * Test du workflow complet Oracle Lumira
 * 1. Création d'une commande via API main-app
 * 2. Vérification réception Expert Desk
 * 3. Test traitement expert → n8n
 */

async function testWorkflow() {
  console.log('🚀 Test workflow Oracle Lumira - Commande → Expert Desk');
  
  try {
    // 1. Créer une commande test
    const orderData = {
      level: 2,
      amount: 3700,
      formData: {
        firstName: 'Test',
        lastName: 'Workflow',
        email: 'test.workflow@example.com'
      }
    };

    const orderResponse = await axios.post(`${API_BASE}/products/create-order`, orderData);
    const orderId = orderResponse.data.orderId;
    
    // 2. Simulation paiement réussi
    await axios.post(`${API_BASE}/products/simulate-payment`, {
      orderId: orderId,
      status: 'paid'
    });
    
    // 3. Test login Expert
    const loginResponse = await axios.post(`${API_BASE}/expert/login`, {
      email: EXPERT_EMAIL,
      password: EXPERT_PASSWORD
    });
    
    // 4. Récupérer commandes pendantes
    const ordersResponse = await axios.get(`${API_BASE}/expert/orders/pending`, {
      headers: { Authorization: `Bearer ${expertToken}` }
    });
    
    // 5. Tester traitement par Expert
    const promptData = {
      orderId: orderId,
      expertPrompt: `Test prompt Expert pour ${testOrder.formData.firstName}`,
      expertInstructions: 'Test workflow - génération automatique pour validation système'
    };

    const processResponse = await axios.post(`${API_BASE}/expert/process-order`, promptData, {
      headers: { Authorization: `Bearer ${expertToken}` }
    });

    console.log('✅ WORKFLOW TEST RÉUSSI !');
    return { success: true, orderId, orderNumber: processResponse.data.orderNumber };

  } catch (error) {
    console.error('❌ ERREUR WORKFLOW:', error.message);
    return { success: false, error: error.message };
  }
}
```

**Flux de test détaillé :**
1. **Création commande** : Simulation de création d'une commande avec données de test
2. **Simulation paiement** : Mise à jour du statut de paiement
3. **Authentification expert** : Test du login avec credentials spécifiques
4. **Récupération commandes** : Vérification de la présence de la commande dans la queue
5. **Traitement expert** : Simulation du traitement par l'expert avec prompts générés
6. **Validation n8n** : Vérification de l'envoi vers le système d'automation n8n

### Architecture des Tests

```mermaid
sequenceDiagram
participant Test as "Script Test"
participant API as "API Backend"
participant Expert as "Expert Desk"
participant Mongo as "MongoDB"
participant N8N as "n8n Automation"
Test->>API : POST /products/create-order
API-->>Test : {orderId}
Test->>API : POST /products/simulate-payment
Test->>API : POST /expert/login
API-->>Test : {token, expert}
Test->>API : GET /expert/orders/pending
API-->>Test : {orders}
Test->>API : POST /expert/process-order
API->>N8N : Webhook n8n
N8N-->>API : Confirmation
API-->>Test : {n8nStatus, orderNumber}
Note over Test,N8N : Workflow complet validé
```

**Sources du Diagramme**
- [test-workflow.js](file://test-workflow.js#L20-L120)

**Sources de Section**
- [test-workflow.js](file://test-workflow.js#L1-L146)

## Validation des Correctifs

### Script de Validation (`validate-fixes.ps1`)

Le script `validate-fixes.ps1` effectue une série de vérifications automatisées pour valider l'application des correctifs de sécurité et d'optimisation.

```powershell
# Structure des résultats de validation
$validationResults = @{
    dockerfile_permissions = $false
    nginx_config_updated = $false
    node_version_locked = $false
    pm2_optimized = $false
    frontend_vulnerabilities = $false
    ecosystem_enhanced = $false
}

$totalChecks = $validationResults.Count
$passedChecks = 0

# Vérifications individuelles
function Validate-DockerPermissions {
    $dockerContent = Get-Content "Dockerfile" -Raw
    if ($dockerContent -match "/var/lib/nginx/tmp/client_body" -and $dockerContent -match "chmod 755") {
        Write-Host "✅ Permissions nginx configurees" -ForegroundColor Green
        $validationResults.dockerfile_permissions = $true
        $passedChecks++
    }
}
```

### Critères de Validation

Le script valide six critères essentiels :

1. **Permissions Docker Nginx** : Vérification des répertoires temporaires et permissions
2. **Configuration Nginx** : Validation des chemins de log et temporaire
3. **Version Node.js** : Verrouillage de la version spécifique (20.18.1)
4. **Optimisation PM2** : Configuration des logs JSON et max_restarts
5. **Vulnérabilités Frontend** : Audit npm avec seuil de vulnérabilités haute priorité
6. **Middleware Logging** : Présence du middleware de logging dans l'écosystème

### Résultats et Report

```powershell
# Calcul du taux de réussite
$successRate = [math]::Round(($passedChecks / $totalChecks) * 100, 1)
Write-Host "Taux de reussite: $successRate%" -ForegroundColor $(if($successRate -ge 80){"Green"}elseif($successRate -ge 60){"Yellow"}else{"Red"})

# Création du rapport de validation
$report = @{
    timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    validation_results = $validationResults
    success_rate = $successRate
    status = if ($exitCode -eq 0) { "READY" } else { "NOT_READY" }
}

$report | ConvertTo-Json -Depth 3 | Out-File "validation-report.json" -Encoding UTF8
```

**Sources de Section**
- [validate-fixes.ps1](file://validate-fixes.ps1#L1-L144)

## Intégration avec Coolify

### Guide de Déploiement Coolify

Coolify v4 constitue la plateforme de déploiement principale pour LumiraV1-MVP, offrant une interface web intuitive pour la gestion des déploiements continus.

```mermaid
flowchart LR
A["GitHub/GitLab"] --> B["Webhook Coolify"]
B --> C["Build Docker Compose"]
C --> D["Services Containers"]
D --> E["Main App<br/>Port 80"]
D --> F["Expert Desk<br/>Port 80"]
D --> G["API Backend<br/>Port 3001"]
D --> H["MongoDB<br/>Port 27017"]
E --> I["Traefik Load Balancer"]
F --> I
G --> I
H --> I
I --> J["Domaines<br/>oraclelumira.com<br/>desk.oraclelumira.com<br/>api.oraclelumira.com"]
```

**Sources du Diagramme**
- [COOLIFY-DEPLOYMENT-GUIDE.md](file://COOLIFY-DEPLOYMENT-GUIDE.md#L1-L228)
- [infrastructure/docker-compose.yml](file://infrastructure/docker-compose.yml#L1-L41)

### Configuration Coolify

#### Variables d'Environnement Obligatoires

```bash
# Base de Données
MONGODB_URI=mongodb://root:VOTRE_PASSWORD_MONGO@mongo:27017/lumira-mvp?authSource=admin
MONGO_ROOT_PASSWORD=VotrePasswordMongoSecurise2024

# Sécurité
JWT_SECRET=VotreJWTSecretDe32CaracteresOuPlus123456
CORS_ORIGIN=https://oraclelumira.com,https://desk.oraclelumira.com

# Stripe (OBLIGATOIRE pour paiements)
STRIPE_SECRET_KEY=sk_live_VotreCleStripeSecrete
STRIPE_WEBHOOK_SECRET=whsec_VotreWebhookSecret
VITE_STRIPE_PUBLIC_KEY=pk_live_VotreCleStripePublique
```

#### Configuration des Domaines

```yaml
# Application Principale
Domain: oraclelumira.com
Service: main-app
Port: 80

# Interface Expert
Domain: desk.oraclelumira.com  
Service: expert-desk
Port: 80

# API (optionnel, généralement via proxy)
Domain: api.oraclelumira.com
Service: api
Port: 3001
```

### Processus de Build et Déploiement

1. **Détection du push Git** : Webhook Coolify détecte les commits
2. **Build Docker Compose** : Construction des images pour chaque service
3. **Orchestration des services** : Démarrage des containers avec traefik
4. **Health checks** : Vérification de la disponibilité des services
5. **Rollback automatique** : Retour arrière en cas d'échec

**Sources de Section**
- [COOLIFY-DEPLOYMENT-GUIDE.md](file://COOLIFY-DEPLOYMENT-GUIDE.md#L1-L228)

## Gestion des Versions

### Stratégie de Versioning

Le projet utilise une approche de versioning sémantique avec gestion des workspaces npm :

```json
{
  "name": "oracle-lumira",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "workspaces": [
    "apps/main-app",
    "apps/expert-desk", 
    "apps/shared"
  ]
}
```

### Scripts de Build Multi-Applications

```bash
# Build complet des trois applications
npm run build:all          # main-app + expert-desk
npm run build:main         # Application principale
npm run build:desk         # Interface expert

# Scripts de développement
npm run dev                # Développement simultané
npm run dev:main           # Développement principal uniquement
npm run dev:api            # Développement API uniquement
npm run dev:desk           # Développement expert uniquement
```

### Docker Build Optimisé

```bash
# Build Docker avec optimisations
docker build -f apps/main-app/Dockerfile -t oracle-main .

# Run local avec port mapping
docker run -p 3000:80 oracle-main

# Build avec cache
docker-compose build --no-cache
```

**Sources de Section**
- [package.json](file://package.json#L1-L37)
- [deploy.sh](file://deploy.sh#L50-L70)

## Bonnes Pratiques

### Sécurité et Hardening

Le projet implémente plusieurs couches de sécurité :

```mermaid
flowchart TD
A["Sécurité Docker"] --> B["Non-root Execution"]
A --> C["Permissions Restrictives"]
A --> D["Répertoires Temporaires"]
E["Configuration Nginx"] --> F["Logging Sécurisé"]
E --> G["Headers de Sécurité"]
E --> H["Redirection HTTPS"]
I["Audit Sécurité"] --> J["Vulnérabilités npm"]
I --> K["Variables d'Environnement"]
I --> L["Certificats SSL"]
M["Monitoring"] --> N["Health Checks"]
M --> O["Logs Centralisés"]
M --> P["Alertes Automatiques"]
```

**Sources du Diagramme**
- [SECURITY-HARDENING-PATCHES.md](file://SECURITY-HARDENING-PATCHES.md#L47-L91)

### Optimisations de Performance

1. **Build Vite** : Optimisation des bundles avec analyse de taille
2. **Docker Multi-stage** : Images optimisées et légères
3. **PM2 Configuration** : Gestion des processus avec monitoring
4. **Cache CDN** : Optimisation des assets statiques

### Tests de Charge et Performance

```javascript
// Lighthouse Scores attendus
// Performance : 85+
// Accessibilité : 90+
// Best Practices : 95+
// SEO : 80+

// Bundle Analysis
npm run build -- --analyze
// Vérifier tailles chunks :
// React/Router : ~100KB
// Framer Motion : ~50KB
// App code : ~30KB
```

**Sources de Section**
- [TEST-FLOW.md](file://TEST-FLOW.md#L1-L172)

## Guide de Dépannage

### Problèmes Courants

#### Erreurs de Build

```bash
# 1. Build échoue - Vérification des dépendances
docker-compose build --no-cache

# 2. Permissions Docker
chmod +x deploy.sh
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# 3. Port conflits
lsof -i :3000  # Linux
netstat -ano | findstr :3000  # Windows
```

#### Erreurs MongoDB

```bash
# Vérification connexion MongoDB
docker-compose exec mongo mongo -u root -p $MONGO_ROOT_PASSWORD --authenticationDatabase admin

# Reset base de données
docker-compose down
docker volume rm lumirav1_mongo-data
docker-compose up -d
```

#### Erreurs Stripe

```bash
# Vérification webhooks Stripe
stripe listen --forward-to localhost:3001/api/payments/webhook

# Test paiement
stripe samples charge-create \
  --amount=3700 \
  --payment-method-types="card" \
  --api-key=$STRIPE_SECRET_KEY
```

### Debugging Avancé

```bash
# Logs en temps réel
docker-compose logs -f

# Inspection des containers
docker ps
docker inspect oracle_main

# Shell dans container
docker-compose exec main-app sh

# Tests de connectivité
curl -I http://localhost:3001/api/health
telnet localhost 27017
```

### Checklist de Déploiement

```bash
# Pré-déploiement
- [ ] Variables d'environnement configurées
- [ ] Tests locaux validés
- [ ] Docker build fonctionnel
- [ ] Base de données initialisée

# Post-déploiement
- [ ] Services healthcheck
- [ ] Logs sans erreurs
- [ ] Fonctionnalités critiques testées
- [ ] Performance monitorée
```

## Conclusion

Le pipeline CI/CD de LumiraV1-MVP représente une solution d'automatisation mature et robuste, intégrant efficacement les pratiques DevOps modernes avec des outils spécialisés comme Coolify. Le système offre :

- **Flexibilité Cross-Platform** : Support natif Windows et Linux
- **Automatisation Complète** : Du développement local au déploiement en production
- **Qualité Garantie** : Tests automatisés et validation de sécurité
- **Scalabilité** : Architecture modulaire et containerisée
- **Observabilité** : Monitoring et logging intégrés

Cette approche permet aux équipes de développement de livrer rapidement et de manière fiable des améliorations continues tout en maintenant des standards élevés de qualité et de sécurité. Le pipeline constitue une base solide pour l'évolution future du projet vers des architectures plus complexes et des besoins métier croissants.