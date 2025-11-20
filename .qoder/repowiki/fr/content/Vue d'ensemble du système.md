# Vue d'ensemble du système Oracle Lumira

<cite>
**Fichiers référencés dans ce document**
- [README.md](file://README.md)
- [package.json](file://package.json)
- [apps/main-app/package.json](file://apps/main-app/package.json)
- [apps/api-backend/package.json](file://apps/api-backend/package.json)
- [apps/expert-desk/package.json](file://apps/expert-desk/package.json)
- [apps/main-app/src/router.tsx](file://apps/main-app/src/router.tsx)
- [apps/main-app/src/services/sanctuaire.ts](file://apps/main-app/src/services/sanctuaire.ts)
- [apps/api-backend/src/models/User.ts](file://apps/api-backend/src/models/User.ts)
- [apps/api-backend/src/models/Order.ts](file://apps/api-backend/src/models/Order.ts)
- [apps/api-backend/src/routes/users.ts](file://apps/api-backend/src/routes/users.ts)
- [apps/main-app/src/pages/LandingTemple.tsx](file://apps/main-app/src/pages/LandingTemple.tsx)
- [apps/expert-desk/src/App.tsx](file://apps/expert-desk/src/App.tsx)
- [apps/main-app/src/utils/api.ts](file://apps/main-app/src/utils/api.ts)
- [infrastructure/docker-compose.yml](file://infrastructure/docker-compose.yml)
- [AUDIT-DESK-SANCTUAIRE-RAPPORT.md](file://AUDIT-DESK-SANCTUAIRE-RAPPORT.md)
</cite>

## Table des matières
1. [Introduction](#introduction)
2. [Architecture globale](#architecture-globale)
3. [Points d'entrée principaux](#points-dentrée-principaux)
4. [Flux de données et workflows](#flux-de-données-et-workflows)
5. [Composants principaux](#composants-principaux)
6. [Intégrations système](#intégrations-système)
7. [Parcours utilisateur](#parcours-utilisateur)
8. [Considérations de performance](#considérations-de-performance)
9. [Guide de dépannage](#guide-de-dépannage)
10. [Conclusion](#conclusion)

## Introduction

Oracle Lumira est une application web mystique qui offre des lectures vibratoires personnalisées à travers 4 niveaux d'exploration spirituelle. Cette plateforme combine React/TypeScript, un design immersif et des intégrations avancées (Stripe, MongoDB, Dolibarr, n8n) pour créer une expérience utilisateur profonde et interactive.

L'application suit une architecture monorepo moderne avec trois applications principales :
- **Landing Temple** : Interface d'accueil immersive
- **Main App** : Application client complète avec dashboard
- **Expert Desk** : Interface d'administration pour les experts

## Architecture globale

Oracle Lumira utilise une architecture microservices moderne avec une approche monorepo, permettant une gestion centralisée du code tout en maintenant la séparation des responsabilités.

```mermaid
graph TB
subgraph "Infrastructure"
LB[Load Balancer<br/>Traefik/Nginx]
DC[docker-compose.yml]
end
subgraph "Applications Frontend"
LT[Landing Temple<br/>React/Vite]
MA[Main App<br/>React/Vite]
ED[Expert Desk<br/>React/Vite]
end
subgraph "Backend API"
BE[API Backend<br/>Express/Mongoose]
STR[Stripe Payments]
N8N[n8n Automation]
end
subgraph "Systèmes Externes"
DB[(MongoDB<br/>Users/Orders)]
CRM[Dolibarr CRM]
CDN[Cloud Storage]
end
LB --> LT
LB --> MA
LB --> ED
LT --> BE
MA --> BE
ED --> BE
BE --> STR
BE --> N8N
BE --> DB
BE --> CRM
BE --> CDN
DC --> LT
DC --> MA
DC --> ED
DC --> BE
DC --> DB
DC --> CRM
```

**Sources du diagramme**
- [infrastructure/docker-compose.yml](file://infrastructure/docker-compose.yml#L1-L41)
- [apps/main-app/package.json](file://apps/main-app/package.json#L1-L45)
- [apps/api-backend/package.json](file://apps/api-backend/package.json#L1-L76)
- [apps/expert-desk/package.json](file://apps/expert-desk/package.json#L1-L42)

**Sources de section**
- [README.md](file://README.md#L1-L259)
- [infrastructure/docker-compose.yml](file://infrastructure/docker-compose.yml#L1-L41)

## Points d'entrée principaux

### Landing Temple (Point d'entrée principal)

Le Landing Temple constitue le premier contact utilisateur avec Oracle Lumira. Il offre une expérience immersive avec des éléments visuels sophistiqués.

```mermaid
flowchart TD
A[Visiteur] --> B[Hero Immersif]
B --> C[Mandala Animé]
C --> D[Particules Interactives]
D --> E[Présentation Niveaux]
E --> F[Formulaire Dynamique]
F --> G[Progress Bar Circulaire]
G --> H[Témoignages]
H --> I[Section Upsells]
I --> J[Appel à Action]
J --> K{Choix Niveau}
K --> |Simple| L[Commande Niveau 1]
K --> |Intuitive| M[Commande Niveau 2]
K --> |Alchimique| N[Commande Niveau 3]
K --> |Intégrale| O[Commande Niveau 4]
```

**Caractéristiques principales :**
- **Hero immersif** avec animation mandala
- **Section niveaux** présentant 4 niveaux d'exploration
- **Formulaire adaptatif** selon le niveau sélectionné
- **Progress bar** type mandala pour indication de progression
- **Témoignages** et preuve sociale

### Sanctuaire (Dashboard client)

Le Sanctuaire est le dashboard personnel des utilisateurs, accessible après authentification sécurisée.

```mermaid
sequenceDiagram
participant U as Utilisateur
participant S as Sanctuaire
participant A as API Backend
participant M as MongoDB
participant E as Expert Desk
U->>S : Authentification email
S->>A : POST /users/auth/sanctuaire
A->>M : Vérification commandes complétées
M-->>A : Liste commandes
A-->>S : JWT temporaire (24h)
S-->>U : Accès dashboard
U->>S : Navigation dans dashboard
S->>A : GET /users/orders/completed
A->>M : Récupération commandes validées
M-->>A : Données commandes
A-->>S : Commandes validées
S-->>U : Affichage contenu téléchargeable
Note over U,E : Workflow Expert → Client
E->>A : Validation expert
A->>M : Mise à jour status 'completed'
A->>S : Notification mise à jour
```

**Sources du diagramme**
- [apps/api-backend/src/routes/users.ts](file://apps/api-backend/src/routes/users.ts#L100-L150)
- [apps/main-app/src/services/sanctuaire.ts](file://apps/main-app/src/services/sanctuaire.ts#L59-L111)

### Expert Desk (Interface expert)

L'Expert Desk est l'interface d'administration pour les experts, permettant la validation et génération de contenus.

```mermaid
classDiagram
class ExpertDesk {
+Queue de validation
+Éditeur de prompts
+Génération automatisée
+Validation et upload
+Traçabilité MongoDB
}
class OrdersQueue {
+Liste commandes en attente
+Statut validation
+Priorité traitement
}
class ContentGenerator {
+Templates prompts par niveau
+Intégration n8n
+OpenAI + TTS
+PDF generation
}
class ContentValidator {
+Validation manuelle
+Notes et commentaires
+Rejet avec raisons
+Révision demandée
}
ExpertDesk --> OrdersQueue : "gère"
ExpertDesk --> ContentGenerator : "utilise"
ExpertDesk --> ContentValidator : "contient"
ContentGenerator --> ContentValidator : "transmet"
```

**Sources du diagramme**
- [apps/expert-desk/src/App.tsx](file://apps/expert-desk/src/App.tsx#L1-L54)
- [apps/main-app/src/pages/LandingTemple.tsx](file://apps/main-app/src/pages/LandingTemple.tsx#L1-L22)

**Sources de section**
- [apps/main-app/src/router.tsx](file://apps/main-app/src/router.tsx#L1-L25)
- [apps/main-app/src/services/sanctuaire.ts](file://apps/main-app/src/services/sanctuaire.ts#L1-L64)
- [apps/expert-desk/src/App.tsx](file://apps/expert-desk/src/App.tsx#L1-L54)

## Flux de données et workflows

### Workflow complet utilisateur

Le flux de données dans Oracle Lumira suit un parcours bien structuré depuis l'accès jusqu'à la livraison du contenu.

```mermaid
graph TD
A[Landing Temple] --> B[Sélection Niveau]
B --> C[Formulaire Questions]
C --> D[Upsells & Paiement Stripe]
D --> E[MongoDB Order pending]
E --> F[Dolibarr Client + Tags]
F --> G[Expert Desk Processing]
G --> H[n8n → GPT → TTS → PDF]
H --> I[Upload Files → Order done]
I --> J[Email + Dashboard Update]
J --> K[Client Télécharge]
subgraph "Validation Expert"
G --> G1[Assignation Expert]
G1 --> G2[Génération Contenu]
G2 --> G3[Validation Manuelle]
G3 --> G4[Approbation/Rejet]
end
subgraph "Systèmes Externes"
F --> F1[Dolibarr CRM]
H --> H1[n8n Automation]
H --> H2[OpenAI API]
H --> H3[TTS Services]
I --> I1[Cloud Storage]
end
```

**Sources du diagramme**
- [README.md](file://README.md#L100-L120)
- [AUDIT-DESK-SANCTUAIRE-RAPPORT.md](file://AUDIT-DESK-SANCTUAIRE-RAPPORT.md#L139-L188)

### Flux de données backend

Le backend gère la persistance des données et orchestre les interactions avec les systèmes externes.

```mermaid
sequenceDiagram
participant C as Client
participant API as API Backend
participant M as MongoDB
participant STR as Stripe
participant N8N as n8n
participant CRM as Dolibarr
C->>API : POST /orders (création commande)
API->>M : Enregistrement Order (status : pending)
API->>STR : Création Payment Intent
STR-->>API : Payment Intent ID
API-->>C : Confirmation paiement
C->>API : POST /payments/confirm
API->>STR : Confirmer paiement
STR-->>API : Paiement confirmé
API->>M : Mise à jour Order (status : paid)
API->>N8N : Webhook génération contenu
N8N->>N8N : Traitement GPT + TTS
N8N->>API : Retour contenu généré
API->>M : Mise à jour Order (generatedContent)
API->>CRM : Création client + tags
CRM-->>API : Confirmation création
API->>M : Mise à jour Order (status : completed)
API->>C : Notification finalisation
```

**Sources du diagramme**
- [apps/api-backend/src/models/Order.ts](file://apps/api-backend/src/models/Order.ts#L1-L199)
- [apps/api-backend/src/routes/users.ts](file://apps/api-backend/src/routes/users.ts#L100-L150)

**Sources de section**
- [README.md](file://README.md#L100-L120)
- [AUDIT-DESK-SANCTUAIRE-RAPPORT.md](file://AUDIT-DESK-SANCTUAIRE-RAPPORT.md#L139-L188)

## Composants principaux

### Architecture frontend

Les applications frontend utilisent React 18 avec TypeScript et Vite pour des performances optimales.

```mermaid
classDiagram
class MainApp {
+React 18 + TypeScript
+Vite Build Tool
+Tailwind CSS
+Framer Motion
+React Router
}
class LandingTemple {
+Hero Component
+Levels Section
+Dynamic Form
+Testimonials
+Upsell Section
}
class Sanctuaire {
+User Dashboard
+Order History
+Content Downloads
+Audio Player
+Mandala Viewer
}
class ExpertDesk {
+Validation Queue
+Content Editor
+Preview Panel
+Authentication
}
MainApp --> LandingTemple : "affiche"
MainApp --> Sanctuaire : "gère"
MainApp --> ExpertDesk : "intègre"
```

**Sources du diagramme**
- [apps/main-app/package.json](file://apps/main-app/package.json#L1-L45)
- [apps/main-app/src/pages/LandingTemple.tsx](file://apps/main-app/src/pages/LandingTemple.tsx#L1-L22)
- [apps/expert-desk/package.json](file://apps/expert-desk/package.json#L1-L42)

### Modèles de données

La base de données MongoDB stocke les informations essentielles pour le fonctionnement de l'application.

```mermaid
erDiagram
USER {
ObjectId _id PK
string email UK
string firstName
string lastName
string phone
Date dateOfBirth
Date createdAt
Date updatedAt
string stripeCustomerId
number dolibarrCustomerId
enum subscriptionStatus
number totalOrders
Date lastOrderAt
}
ORDER {
ObjectId _id PK
string orderNumber UK
ObjectId userId FK
string userEmail
string userName
number level
string levelName
number amount
string currency
enum status
string paymentIntentId
string stripeSessionId
json formData
array files
json clientInputs
string expertPrompt
string expertInstructions
json generatedContent
json expertReview
json expertValidation
number revisionCount
Date deliveredAt
string deliveryMethod
Date createdAt
Date updatedAt
}
EXPERT {
ObjectId _id PK
string name
string email
string expertiseLevel
number rating
Date joinedAt
}
USER ||--o{ ORDER : "place des"
ORDER ||--|| EXPERT : "assigné à"
```

**Sources du diagramme**
- [apps/api-backend/src/models/User.ts](file://apps/api-backend/src/models/User.ts#L1-L83)
- [apps/api-backend/src/models/Order.ts](file://apps/api-backend/src/models/Order.ts#L1-L199)

**Sources de section**
- [apps/main-app/src/utils/api.ts](file://apps/main-app/src/utils/api.ts#L1-L80)
- [apps/api-backend/src/models/User.ts](file://apps/api-backend/src/models/User.ts#L1-L83)
- [apps/api-backend/src/models/Order.ts](file://apps/api-backend/src/models/Order.ts#L1-L199)

## Intégrations système

### Systèmes externes intégrés

Oracle Lumira s'intègre avec plusieurs systèmes externes pour fournir une expérience complète.

```mermaid
graph LR
subgraph "Oracle Lumira"
APP[Application]
API[API Backend]
end
subgraph "Stripe Payments"
STR[Stripe Checkout]
WEB[Webhooks]
PAY[Paiements]
end
subgraph "Dolibarr CRM"
CRM[Dolibarr Instance]
CLI[Clients]
TAG[Tags]
DOC[Documents]
end
subgraph "n8n Automation"
N8N[n8n Platform]
GPT[OpenAI API]
TTS[Text-to-Speech]
GEN[Content Generation]
end
subgraph "Cloud Storage"
CDN[Cloud Storage]
PDF[Generated PDFs]
AUDIO[Audio Files]
SVG[Mandala SVGs]
end
APP --> API
API --> STR
API --> CRM
API --> N8N
API --> CDN
STR --> WEB
WEB --> API
N8N --> GPT
N8N --> TTS
N8N --> GEN
GEN --> CDN
```

**Sources du diagramme**
- [apps/api-backend/package.json](file://apps/api-backend/package.json#L15-L30)
- [infrastructure/docker-compose.yml](file://infrastructure/docker-compose.yml#L1-L41)

### Configuration des variables d'environnement

```typescript
// Variables Stripe requises
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...

// Base de données
MONGODB_URI=mongodb://localhost:27017/oracle-lumira

// Dolibarr CRM
VITE_DOLIBARR_URL=https://crm.domain.com
VITE_DOLIBARR_API_KEY=...

// n8n Automation
N8N_WEBHOOK_URL=https://n8n.domain.com/webhook/lumira-assistant
N8N_TOKEN=...
```

**Sources de section**
- [README.md](file://README.md#L50-L80)
- [infrastructure/docker-compose.yml](file://infrastructure/docker-compose.yml#L1-L41)

## Parcours utilisateur

### Parcours client complet

Le parcours utilisateur est conçu pour être fluide et intuitif, guidant l'utilisateur à travers chaque étape.

```mermaid
flowchart TD
START[Visiteur arrive sur le site] --> HERO[Hero Immersif]
HERO --> LEVELS[Présentation des 4 niveaux]
LEVELS --> SELECT{Sélection niveau}
SELECT --> SIMPLE[Niveau Simple<br/>€29]
SELECT --> INTUITIVE[Niveau Intuitif<br/>€59]
SELECT --> ALCHIMICAL[Niveau Alchimique<br/>€99]
SELECT --> INTEGRAL[Niveau Intégral<br/>€149]
SIMPLE --> FORM1[Formulaire simple]
INTUITIVE --> FORM2[Formulaire intermédiaire]
ALCHIMICAL --> FORM3[Formulaire complet]
INTEGRAL --> FORM4[Formulaire détaillé]
FORM1 --> UPS1[Upsells disponibles]
FORM2 --> UPS2[Upsells + audio]
FORM3 --> UPS3[Upsells + audio + rituel]
FORM4 --> UPS4[Upsells + audio + rituel + pack complet]
UPS1 --> PAY[Processus paiement Stripe]
UPS2 --> PAY
UPS3 --> PAY
UPS4 --> PAY
PAY --> CONFIRM[Confirmation paiement]
CONFIRM --> REDIRECT[Redirection vers Sanctuaire]
REDIRECT --> DASHBOARD[Dashboard personnel]
DASHBOARD --> CONTENT[Accès au contenu généré]
CONTENT --> DOWNLOAD[Téléchargements PDF/Audio/Mandala]
```

### Parcours expert

Le parcours expert permet aux experts de valider et générer le contenu des lectures.

```mermaid
sequenceDiagram
participant E as Expert
participant ED as Expert Desk
participant API as API Backend
participant N8N as n8n
participant M as MongoDB
E->>ED : Connexion interface
ED->>API : Authentification JWT
API-->>ED : Token valide
E->>ED : Accès queue validation
ED->>API : GET /orders/pending
API->>M : Récupération commandes en attente
M-->>API : Liste commandes
API-->>ED : Commandes en attente
E->>ED : Sélection commande
ED->>API : GET /orders/ : id
API->>M : Détails commande
M-->>API : Informations commande
API-->>ED : Détails commande
E->>ED : Génération contenu
ED->>API : POST /orders/ : id/generate
API->>N8N : Webhook génération
N8N->>N8N : Traitement GPT + TTS
N8N-->>API : Contenu généré
API->>M : Mise à jour commande
API-->>ED : Contenu généré
E->>ED : Validation finale
ED->>API : POST /orders/ : id/validate
API->>M : Mise à jour status 'completed'
API-->>ED : Validation confirmée
```

**Sources du diagramme**
- [apps/expert-desk/src/App.tsx](file://apps/expert-desk/src/App.tsx#L1-L54)
- [apps/api-backend/src/routes/users.ts](file://apps/api-backend/src/routes/users.ts#L100-L150)

### Parcours administrateur

L'administrateur peut gérer les utilisateurs et surveiller le système.

```mermaid
flowchart TD
ADMIN[Administrateur] --> LOGIN[Connexion admin]
LOGIN --> DASH[Dashboard administration]
DASH --> USERS[Gestion utilisateurs]
DASH --> ORDERS[Gestion commandes]
DASH --> STATS[Statistiques système]
DASH --> CONFIG[Configuration]
USERS --> SEARCH[Recherche par email]
USERS --> UPDATE[Mise à jour infos]
USERS --> DELETE[Suppression compte]
ORDERS --> FILTER[Filtrage par statut]
ORDERS --> REVIEW[Révision commandes]
ORDERS --> EXPORT[Export données]
STATS --> REVENUE[Chiffre d'affaires]
STATS --> USERS_COUNT[Nombre utilisateurs]
STATS --> LEVELS_DISTRIB[Distribution niveaux]
CONFIG --> ENV_VARS[Variables environnement]
CONFIG --> API_KEYS[Clés API]
CONFIG --> SYSTEM_SETTINGS[Paramètres système]
```

**Sources de section**
- [apps/api-backend/src/routes/users.ts](file://apps/api-backend/src/routes/users.ts#L1-L100)
- [apps/main-app/src/services/sanctuaire.ts](file://apps/main-app/src/services/sanctuaire.ts#L1-L64)

## Considérations de performance

### Optimisations frontend

L'application utilise plusieurs techniques d'optimisation pour garantir des performances élevées.

**Techniques d'optimisation :**
- **Bundle splitting** automatique avec Vite
- **Lazy loading** des composants lourds
- **Gzip compression** avec Nginx
- **Cache stratégique** pour les assets
- **Optimisation CSS** avec Tailwind

**Mesures de performance :**
- **Mobile-first** design responsive
- **Animations optimisées** (transform/opacity priority)
- **Code splitting** pour réduction bundle initial
- **Image optimization** avec formats modernes

### Optimisations backend

Le backend est optimisé pour gérer efficacement les requêtes et les traitements.

**Techniques d'optimisation :**
- **Rate limiting** avec Express Rate Limit
- **Validation** avec Joi pour sécurité
- **Logging** avec Winston pour monitoring
- **Middleware** d'authentification optimisé
- **Indexes MongoDB** pour requêtes rapides

**Sources de section**
- [README.md](file://README.md#L150-L180)
- [apps/api-backend/package.json](file://apps/api-backend/package.json#L15-L30)

## Guide de dépannage

### Problèmes courants et solutions

**Problème : Erreur d'authentification sanctuaire**
```bash
# Vérification des logs backend
docker logs oracle_lumira_api

# Vérification des tokens JWT
curl -H "Authorization: Bearer <token>" http://localhost:3000/api/users/auth/sanctuaire

# Vérification des commandes complétées
mongo
db.orders.find({userId: "<user-id>", status: "completed"})
```

**Problème : Intégration Stripe échouée**
```bash
# Vérification clés Stripe
echo $VITE_STRIPE_PUBLISHABLE_KEY
echo $STRIPE_SECRET_KEY

# Test webhook Stripe
stripe listen --forward-to=localhost:3000/api/payments/webhook
```

**Problème : n8n ne génère pas de contenu**
```bash
# Vérification connexion n8n
curl -X POST https://n8n.domain.com/webhook/lumira-assistant \
  -H "Authorization: Bearer <n8n-token>" \
  -H "Content-Type: application/json" \
  -d '{"level": 1, "formData": {...}}'

# Vérification logs n8n
docker logs oracle_n8n
```

### Diagnostic système

**Scripts de diagnostic disponibles :**
- `diagnose-bad-gateway.sh` : Vérification proxy Nginx
- `diagnose-container.sh` : Diagnostic containers Docker
- `diagnose-production.sh` : Diagnostic production
- `full-diagnostic.js` : Diagnostic complet système

**Sources de section**
- [README.md](file://README.md#L200-L230)
- [deploy.sh](file://deploy.sh)
- [deploy.ps1](file://deploy.ps1)

## Conclusion

Oracle Lumira représente une solution complète et sophistiquée pour la création et distribution de lectures spirituelles personnalisées. Son architecture monorepo moderne, combinée avec des technologies éprouvées (React, Express, MongoDB), permet de fournir une expérience utilisateur fluide et performante.

**Points forts identifiés :**
- **Architecture modulaire** avec séparation claire des responsabilités
- **Intégrations robustes** avec systèmes externes (Stripe, Dolibarr, n8n)
- **Expérience utilisateur** immersive et intuitive
- **Sécurité renforcée** avec authentification JWT et validation multi-critères
- **Scalabilité** avec Docker et docker-compose

**Améliorations futures prévues :**
- Migration vers Next.js pour améliorer SEO
- Implémentation de WebSocket pour notifications temps réel
- Extension du système de niveaux avec nouvelles fonctionnalités
- Amélioration de l'interface mobile native

Cette documentation fournit une vue d'ensemble complète du système Oracle Lumira, couvrant à la fois les aspects techniques pour les développeurs et les considérations architecturales pour les décideurs techniques.