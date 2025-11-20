# Configuration du proxy inverse avec Nginx

<cite>
**Fichiers Référencés dans ce Document**
- [nginx.conf](file://nginx.conf)
- [nginx-frontend.conf](file://nginx-frontend.conf)
- [nginx-fullstack.conf](file://nginx-fullstack.conf)
- [docker-compose.yml](file://infrastructure/docker-compose.yml)
- [start-fullstack-optimized.sh](file://start-fullstack-optimized.sh)
- [Dockerfile](file://apps/main-app/Dockerfile)
- [apply-fixes.ps1](file://security/apply-fixes.ps1)
- [nginx-test.ps1](file://security/nginx-test.ps1)
- [NGINX-PROXY-FIX-SUCCESS.md](file://NGINX-PROXY-FIX-SUCCESS.md)
</cite>

## Table des Matières
1. [Introduction](#introduction)
2. [Structure du Projet](#structure-du-projet)
3. [Configuration Nginx Principale](#configuration-nginx-principale)
4. [Configuration Frontend Spécialisée](#configuration-frontend-spécialisée)
5. [Configuration Fullstack](#configuration-fullstack)
6. [Architecture de Proxy Inverse](#architecture-de-proxy-inverse)
7. [Analyse Détaillée des Composants](#analyse-détaillée-des-composants)
8. [Intégration Docker et Orchestration](#intégration-docker-et-orchestration)
9. [Considérations de Sécurité](#considérations-de-sécurité)
10. [Optimisations de Performance](#optimisations-de-performance)
11. [Guide de Dépannage](#guide-de-dépannage)
12. [Conclusion](#conclusion)

## Introduction

Cette documentation présente l'architecture de configuration du proxy inverse Nginx dans le projet Oracle Lumira V1 MVP. Le système utilise Nginx comme serveur web principal et reverse proxy pour orchestrer le trafic entre les applications frontend et backend, assurant la sécurité, la performance et la scalabilité de l'application.

Le projet implémente trois configurations Nginx distinctes :
- **nginx.conf** : Configuration principale pour le domaine racine
- **nginx-frontend.conf** : Configuration spécialisée pour les applications frontend
- **nginx-fullstack.conf** : Configuration optimisée pour le déploiement complet

## Structure du Projet

```mermaid
graph TB
subgraph "Infrastructure Nginx"
NginxMain["nginx.conf<br/>Domaine Racine"]
NginxFront["nginx-frontend.conf<br/>Frontend SPA"]
NginxFull["nginx-fullstack.conf<br/>Déploiement Complet"]
end
subgraph "Applications"
MainApp["main-app<br/>Port 80"]
ExpertDesk["expert-desk<br/>Port 80"]
APIBackend["api-backend<br/>Port 3001"]
end
subgraph "Services Externes"
Stripe["Stripe Payments"]
Google["Google APIs"]
OpenAI["OpenAI API"]
end
NginxMain --> MainApp
NginxMain --> APIBackend
NginxFront --> MainApp
NginxFull --> MainApp
NginxFull --> APIBackend
MainApp --> Stripe
MainApp --> Google
MainApp --> OpenAI
```

**Sources du Diagramme**
- [nginx.conf](file://nginx.conf#L1-L62)
- [nginx-frontend.conf](file://nginx-frontend.conf#L1-L61)
- [nginx-fullstack.conf](file://nginx-fullstack.conf#L1-L49)

## Configuration Nginx Principale

La configuration principale `nginx.conf` gère le domaine racine `oraclelumira.com` et `www.oraclelumira.com`. Elle implémente un proxy inverse sophistiqué avec gestion des en-têtes de sécurité et optimisations de performance.

### Bloc Serveur Principal

```mermaid
flowchart TD
Request["Requête HTTP/HTTPS"] --> ServerBlock["Bloc Serveur Nginx"]
ServerBlock --> DomainCheck{"Domaine Valide?"}
DomainCheck --> |Oui| SecurityHeaders["Appliquer En-têtes de Sécurité"]
DomainCheck --> |Non| DenyAccess["Accès Refusé"]
SecurityHeaders --> LocationRoot["Location Root /"]
LocationRoot --> SPAHandling["Gestion SPA<br/>try_files $uri $uri/ /index.html"]
SecurityHeaders --> APILocation["Location API /api/"]
APILocation --> ProxyPass["proxy_pass http://localhost:3001/api/"]
SecurityHeaders --> StaticAssets["Location Assets<br/>Cache & Compression"]
StaticAssets --> BlockSensitive["Locations Sensibles<br/>.env, .git, etc."]
```

**Sources du Diagramme**
- [nginx.conf](file://nginx.conf#L15-L58)

### En-têtes de Sécurité Avancés

La configuration implémente plusieurs en-têtes de sécurité critiques :

- **X-Frame-Options**: Protection contre les attaques de framing
- **X-Content-Type-Options**: Prévention de la détection automatique des types MIME
- **X-XSS-Protection**: Protection contre les attaques XSS
- **Strict-Transport-Security**: Force HTTPS pour une année
- **Referrer-Policy**: Contrôle des informations de référence
- **Content-Security-Policy**: Politique de sécurité des contenus

### Règles de Localisation

```mermaid
classDiagram
class LocationRules {
+root "/"
+api_routes "/api/"
+static_assets "\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$"
+dotfiles "/\."
+env_files "/\.env"
+spa_fallback "try_files $uri $uri/ /index.html"
}
class ProxyConfiguration {
+target_backend "http : //localhost : 3001"
+preserve_path true
+headers_preserved ["Host", "X-Real-IP", "X-Forwarded-For", "X-Forwarded-Proto"]
}
class SecurityRules {
+frame_options "SAMEORIGIN"
+content_type_options "nosniff"
+xss_protection "1; mode=block"
+hsts "max-age=31536000; includeSubDomains"
+csp_enabled true
}
LocationRules --> ProxyConfiguration
LocationRules --> SecurityRules
```

**Sources du Diagramme**
- [nginx.conf](file://nginx.conf#L15-L58)

**Sources de Section**
- [nginx.conf](file://nginx.conf#L1-L62)

## Configuration Frontend Spécialisée

La configuration `nginx-frontend.conf` est optimisée pour les applications Single Page Application (SPA) avec gestion des appels API vers des domaines externes.

### Architecture SPA avec Proxy API

```mermaid
sequenceDiagram
participant Browser as Navigateur
participant Nginx as Nginx Frontend
participant API as API Backend
participant Stripe as Stripe
participant Google as Google APIs
Browser->>Nginx : Requête SPA /
Nginx->>Nginx : try_files $uri $uri/ /index.html
Nginx-->>Browser : index.html
Browser->>Nginx : Requête API /api/payments
Nginx->>API : proxy_pass https : //api.oraclelumira.com/api/
API->>Stripe : Paiements Stripe
Stripe-->>API : Réponse paiement
API-->>Nginx : Réponse JSON
Nginx-->>Browser : Réponse API
```

**Sources du Diagramme**
- [nginx-frontend.conf](file://nginx-frontend.conf#L28-L35)

### Configuration de Compression et Cache

La configuration inclut une stratégie de cache intelligente pour les ressources statiques :

- **Compression Gzip** : Activée pour tous les types de contenu textuels
- **Cache Longue Durée** : 1 an pour les assets immuables
- **En-têtes Cache-Control** : Public et immutable pour optimiser les performances

**Sources de Section**
- [nginx-frontend.conf](file://nginx-frontend.conf#L1-L61)

## Configuration Fullstack

La configuration `nginx-fullstack.conf` est conçue pour le déploiement complet avec intégration Docker et gestion des processus.

### Configuration de Base

```mermaid
graph LR
subgraph "Processus Nginx"
User["user nginx"]
WorkerProcesses["worker_processes auto"]
ErrorLog["error_log /dev/stderr warn"]
PidFile["pid /var/run/nginx.pid"]
end
subgraph "Configuration HTTP"
MimeTypes["include mime.types"]
DefaultType["default_type application/octet-stream"]
SendFile["sendfile on"]
KeepAlive["keepalive_timeout 65"]
end
subgraph "Serveur Principal"
ListenPort["listen 8080 default_server"]
ServerName["server_name _"]
RootDir["root /usr/share/nginx/html"]
IndexFile["index index.html"]
end
User --> WorkerProcesses
WorkerProcesses --> ErrorLog
ErrorLog --> PidFile
MimeTypes --> DefaultType
DefaultType --> SendFile
SendFile --> KeepAlive
ListenPort --> ServerName
ServerName --> RootDir
RootDir --> IndexFile
```

**Sources du Diagramme**
- [nginx-fullstack.conf](file://nginx-fullstack.conf#L1-L25)

### Intégration Docker et Process Management

La configuration supporte l'exécution dans des conteneurs Docker avec gestion des logs et des répertoires temporaires :

- **Logs Standard** : Utilisation de `/dev/stdout` et `/dev/stderr`
- **Répertoires Temporaires** : Configuration sécurisée pour exécution non-root
- **Gestion des Processus** : Configuration PID appropriée

**Sources de Section**
- [nginx-fullstack.conf](file://nginx-fullstack.conf#L1-L49)

## Architecture de Proxy Inverse

### Flux de Trafic Principal

```mermaid
flowchart LR
subgraph "Entrée Utilisateur"
WebApp["Application Web"]
MobileApp["Application Mobile"]
APIRequests["Requêtes API"]
end
subgraph "Serveur Nginx"
LoadBalancer["Load Balancer"]
SSLTermination["SSL Termination"]
ReverseProxy["Reverse Proxy"]
end
subgraph "Services Backend"
MainAPI["API Principal<br/>Port 3001"]
ExpertAPI["API Expert<br/>Port 3002"]
PaymentService["Service Paiement"]
end
subgraph "Stockage"
MongoDB["Base de Données"]
Redis["Cache Redis"]
FileStorage["Stockage Fichiers"]
end
WebApp --> LoadBalancer
MobileApp --> LoadBalancer
APIRequests --> LoadBalancer
LoadBalancer --> SSLTermination
SSLTermination --> ReverseProxy
ReverseProxy --> MainAPI
ReverseProxy --> ExpertAPI
ReverseProxy --> PaymentService
MainAPI --> MongoDB
MainAPI --> Redis
PaymentService --> FileStorage
```

### Stratégie de Routage Intelligent

Le système implémente un routage intelligent basé sur les patterns d'URL :

1. **Ressources Statiques** : Servies directement depuis le système de fichiers
2. **API Backend** : Proxy vers les services backend sur ports différents
3. **SPA Fallback** : Gestion des routes client-side pour navigation sans rechargement
4. **Health Checks** : Endpoints dédiés pour monitoring et orchestration

## Analyse Détaillée des Composants

### Configuration des En-têtes de Sécurité

```mermaid
classDiagram
class SecurityHeaders {
+XFrameOptions : "SAMEORIGIN"
+XContentTypeOptions : "nosniff"
+XXSSProtection : "1; mode=block"
+StrictTransportSecurity : "max-age=31536000"
+ReferrerPolicy : "strict-origin-when-cross-origin"
+ContentSecurityPolicy : "default-src 'self'"
}
class CSPDirectives {
+defaultSrc : "'self'"
+scriptSrc : "'self' 'unsafe-inline' 'unsafe-eval' *.stripe.com *.google.com"
+styleSrc : "'self' 'unsafe-inline' fonts.googleapis.com"
+fontSrc : "'self' fonts.gstatic.com"
+imgSrc : "'self' data : https : "
+connectSrc : "'self' *.stripe.com api.openai.com"
}
class SecurityRules {
+preventClickjacking : true
+preventMIME : true
+preventXSS : true
+forceHTTPS : true
+restrictReferrer : true
+controlResources : true
}
SecurityHeaders --> CSPDirectives
SecurityHeaders --> SecurityRules
```

**Sources du Diagramme**
- [nginx.conf](file://nginx.conf#L19-L25)

### Gestion des En-têtes de Proxy

Chaque configuration Nginx implémente une stratégie cohérente pour la préservation des en-têtes :

- **Host** : Maintien du nom d'hôte original
- **X-Real-IP** : Adresse IP du client réelle
- **X-Forwarded-For** : Chaîne d'adresses IP pour tracing
- **X-Forwarded-Proto** : Protocole utilisé (HTTP/HTTPS)

### Optimisations de Compression

```mermaid
flowchart TD
Request["Requête"] --> CompressionCheck{"Compression<br/>Disponible?"}
CompressionCheck --> |Oui| GzipEnabled["Gzip Activé"]
CompressionCheck --> |Non| DirectResponse["Réponse Directe"]
GzipEnabled --> ContentTypeCheck{"Type Contenu<br/>Accepté?"}
ContentTypeCheck --> |Oui| CompressContent["Compresser Contenu"]
ContentTypeCheck --> |Non| DirectResponse
CompressContent --> MinLengthCheck{"Taille >= 1024?"}
MinLengthCheck --> |Oui| SendCompressed["Envoyer Compressé"]
MinLengthCheck --> |Non| DirectResponse
SendCompressed --> VaryHeader["Ajouter Vary Header"]
VaryHeader --> Response["Réponse Compressée"]
DirectResponse --> Response
```

**Sources du Diagramme**
- [nginx.conf](file://nginx.conf#L10-L14)

**Sources de Section**
- [nginx.conf](file://nginx.conf#L10-L14)
- [nginx-frontend.conf](file://nginx-frontend.conf#L10-L13)

## Intégration Docker et Orchestration

### Configuration Docker Compose

```mermaid
graph TB
subgraph "Services Docker"
MainApp["main-app<br/>Port 80"]
ExpertDesk["expert-desk<br/>Port 80"]
Dolibarr["dolibarr<br/>Port 80"]
MySQL["mysql<br/>Port 3306"]
end
subgraph "Labels Traefik"
TraefikRouter["Traefik Routers"]
TraefikService["Traefik Services"]
TraefikLB["Load Balancer"]
end
subgraph "Domaines"
MainDomain["oraclelumira.com"]
ExpertDomain["desk.oraclelumira.com"]
CRM["crm.oraclelumira.com"]
end
MainApp --> TraefikRouter
ExpertDesk --> TraefikRouter
Dolibarr --> TraefikRouter
TraefikRouter --> TraefikService
TraefikService --> TraefikLB
TraefikLB --> MainDomain
TraefikLB --> ExpertDomain
TraefikLB --> CRM
```

**Sources du Diagramme**
- [docker-compose.yml](file://infrastructure/docker-compose.yml#L4-L38)

### Scripts de Démarrage Optimisés

Le script `start-fullstack-optimized.sh` implémente une séquence de démarrage robuste :

1. **Validation Environnement** : Vérification des prérequis
2. **Démarrage Backend** : Initialisation du service API avec PM2
3. **Attente de Prêt** : Validation du service avant proxy
4. **Tests de Santé** : Vérification des endpoints critiques
5. **Démarrage Nginx** : Configuration et lancement du serveur

### Intégration avec Coolify

La configuration supporte l'orchestration avec Coolify grâce aux endpoints health :

- **/health.json** : Endpoint de santé standardisé
- **Logs Structurés** : Format compatible avec les systèmes de monitoring
- **Variables d'Environnement** : Configuration flexible pour différents environnements

**Sources de Section**
- [docker-compose.yml](file://infrastructure/docker-compose.yml#L1-L41)
- [start-fullstack-optimized.sh](file://start-fullstack-optimized.sh#L1-L82)

## Considérations de Sécurité

### Audit de Sécurité Automatisé

Le projet inclut un système d'audit de sécurité automatisé pour valider la configuration Nginx :

```mermaid
flowchart TD
SecurityAudit["Audit Sécurité Nginx"] --> HeaderCheck["Vérification En-têtes"]
SecurityAudit --> RateLimit["Contrôle Limitation Taux"]
SecurityAudit --> LogConfig["Configuration Logs"]
SecurityAudit --> TempDir["Répertoires Temp"]
HeaderCheck --> FrameOptions["X-Frame-Options"]
HeaderCheck --> ContentType["X-Content-Type-Options"]
HeaderCheck --> XSSProtection["X-XSS-Protection"]
HeaderCheck --> CSP["Content-Security-Policy"]
RateLimit --> LimitReqZone["limit_req_zone"]
RateLimit --> LimitReq["limit_req"]
LogConfig --> AccessLog["access_log"]
LogConfig --> ErrorLog["error_log"]
TempDir --> ClientBodyTemp["client_body_temp_path"]
TempDir --> ProxyTemp["proxy_temp_path"]
```

**Sources du Diagramme**
- [nginx-test.ps1](file://security/nginx-test.ps1#L33-L73)

### Protection contre les Attaques

La configuration implémente plusieurs couches de protection :

- **Content Security Policy** : Prévention des injections XSS
- **Restriction des Types MIME** : Protection contre l'exécution de scripts malveillants
- **Limitation des Taux** : Protection contre les attaques DDoS
- **Validation des Chemins** : Prévention d'accès aux fichiers sensibles

### Configuration de Logs Sécurisés

```mermaid
classDiagram
class LogConfiguration {
+access_log "/var/lib/nginx/logs/access.log"
+error_log "/var/lib/nginx/logs/error.log warn"
+log_format "main"
+structured_logging true
}
class SecurityLogging {
+attack_detection : true
+threat_monitoring : true
+compliance_logging : true
+anonymized_logs : true
}
class TempDirectories {
+client_body_temp "/var/lib/nginx/tmp/client_body"
+proxy_temp "/var/lib/nginx/tmp/proxy"
+fastcgi_temp "/var/lib/nginx/tmp/fastcgi"
+uwsgi_temp "/var/lib/nginx/tmp/uwsgi"
+scgi_temp "/var/lib/nginx/tmp/scgi"
}
LogConfiguration --> SecurityLogging
LogConfiguration --> TempDirectories
```

**Sources du Diagramme**
- [apply-fixes.ps1](file://security/apply-fixes.ps1#L90-L125)

**Sources de Section**
- [apply-fixes.ps1](file://security/apply-fixes.ps1#L58-L125)
- [nginx-test.ps1](file://security/nginx-test.ps1#L33-L73)

## Optimisations de Performance

### Cache Intelligent

La configuration implémente un système de cache intelligent basé sur les types de fichiers :

```mermaid
flowchart LR
Request["Requête"] --> FileExtension{"Extension Fichier"}
FileExtension --> |Static Assets| StaticCache["Cache 1 An<br/>Cache-Control: public, immutable"]
FileExtension --> |Dynamic Content| NoCache["Pas de Cache<br/>Cache-Control: no-cache"]
FileExtension --> |HTML| SPAFallback["Fallback SPA<br/>try_files $uri $uri/ /index.html"]
StaticCache --> CDN["CDN Distribution"]
NoCache --> OriginServer["Serveur d'Origine"]
SPAFallback --> SPAEngine["Moteur SPA"]
```

### Compression Multi-niveau

```mermaid
sequenceDiagram
participant Client as Client
participant Nginx as Nginx
participant Backend as Backend
participant CDN as CDN
Client->>Nginx : Requête GET /api/data
Nginx->>Backend : Requête Proxy
Backend-->>Nginx : Réponse compressée gzip
Nginx->>Nginx : Vérifier Accept-Encoding
Nginx->>Nginx : Ajouter Vary : Accept-Encoding
Nginx-->>Client : Réponse compressée
Note over Client,CDN : Cache distribué activé
Client->>CDN : Requête GET /static/script.js
CDN-->>Client : Réponse mise en cache
```

### Optimisations de Réseau

- **Keep-alive Connections** : Maintien des connexions persistantes
- **Sendfile Optimization** : Utilisation de sendfile pour transferts efficaces
- **Buffer Size Tuning** : Optimisation des buffers pour différents types de contenu
- **Connection Pooling** : Réutilisation des connexions vers les backends

## Guide de Dépannage

### Problèmes Courants et Solutions

```mermaid
flowchart TD
Problem["Problème Nginx"] --> Category{"Catégorie"}
Category --> |Proxy| ProxyIssue["Problème Proxy"]
Category --> |Performance| PerfIssue["Problème Performance"]
Category --> |Sécurité| SecIssue["Problème Sécurité"]
Category --> |Configuration| ConfigIssue["Problème Configuration"]
ProxyIssue --> CheckBackend["Vérifier Backend"]
ProxyIssue --> CheckHeaders["Vérifier En-têtes"]
ProxyIssue --> CheckPath["Vérifier Chemin Proxy"]
PerfIssue --> CheckCache["Vérifier Cache"]
PerfIssue --> CheckCompression["Vérifier Compression"]
PerfIssue --> CheckWorkers["Vérifier Workers"]
SecIssue --> CheckHeaders2["Vérifier En-têtes"]
SecIssue --> CheckLogs["Vérifier Logs"]
SecIssue --> CheckPermissions["Vérifier Permissions"]
ConfigIssue --> TestConfig["Tester Configuration"]
ConfigIssue --> CheckSyntax["Vérifier Syntaxe"]
ConfigIssue --> CheckIncludes["Vérifier Includes"]
```

### Scripts de Diagnostic

Le projet inclut plusieurs scripts de diagnostic :

- **test-api-proxy-fix.sh** : Validation du proxy API
- **diagnose-bad-gateway.sh** : Diagnostic des erreurs Bad Gateway
- **validate-fixes.ps1** : Validation des corrections de sécurité
- **full-diagnostic.js** : Diagnostic complet du système

### Métriques de Surveillance

```mermaid
classDiagram
class MonitoringMetrics {
+response_time_ms : histogram
+requests_per_second : counter
+error_rate_percent : gauge
+cache_hit_ratio : gauge
+memory_usage_mb : gauge
+cpu_usage_percent : gauge
}
class HealthEndpoints {
+health_json : "/health.json"
+api_health : "/api/health"
+backend_health : "/backend/health"
}
class LoggingLevels {
+access_log : "info"
+error_log : "warn"
+debug_log : "debug"
}
MonitoringMetrics --> HealthEndpoints
MonitoringMetrics --> LoggingLevels
```

**Sources de Section**
- [start-fullstack-optimized.sh](file://start-fullstack-optimized.sh#L59-L70)

## Conclusion

La configuration du proxy inverse Nginx dans Oracle Lumira V1 MVP représente une architecture robuste et sécurisée pour l'orchestration des applications web modernes. Les trois configurations fournissent des solutions adaptées aux différents cas d'usage :

- **nginx.conf** : Idéale pour les déploiements simples avec backend local
- **nginx-frontend.conf** : Optimisée pour les SPAs avec API externe
- **nginx-fullstack.conf** : Conçue pour les déploiements Docker complets

L'intégration avec Docker et les outils d'orchestration comme Coolify permet une déploiement facile et maintenable. Les considérations de sécurité et de performance garantissent que le système peut supporter des charges élevées tout en maintenant des standards de sécurité élevés.

Les scripts de diagnostic et d'audit automatisés assurent la maintenance continue de la configuration, tandis que les optimisations de cache et de compression garantissent des performances optimales pour les utilisateurs finaux.

Cette architecture constitue une base solide pour l'évolution future du projet, permettant l'ajout de nouveaux services et la montée en charge sans compromettre la sécurité ou les performances.