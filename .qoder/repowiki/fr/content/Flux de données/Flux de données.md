# Flux de données dans Lumira

<cite>
**Fichiers référencés dans ce document**
- [CommandeTemple.tsx](file://apps/main-app/src/pages/CommandeTemple.tsx)
- [stripe.ts](file://apps/main-app/src/api/stripe.ts)
- [payments.ts](file://apps/api-backend/src/routes/payments.ts)
- [stripe.ts](file://apps/api-backend/src/services/stripe.ts)
- [Order.ts](file://apps/api-backend/src/models/Order.ts)
- [DeskPage.tsx](file://apps/expert-desk/src/pages/DeskPage.tsx)
- [api.ts](file://apps/expert-desk/src/utils/api.ts)
- [expert.ts](file://apps/api-backend/src/routes/expert.ts)
- [Sanctuaire.tsx](file://apps/main-app/src/pages/Sanctuaire.tsx)
</cite>

## Table des matières
1. [Introduction](#introduction)
2. [Architecture des flux de données](#architecture-des-flux-de-données)
3. [Flux de commande client](#flux-de-commande-client)
4. [Flux de traitement expert](#flux-de-traitement-expert)
5. [Flux d'accès au Sanctuaire](#flux-daccès-au-sanctuaire)
6. [Protocoles et sécurité](#protocoles-et-sécurité)
7. [Formats de données](#formats-de-données)
8. [Diagrammes de séquence](#diagrammes-de-séquence)
9. [Considérations de performance](#considérations-de-performance)
10. [Guide de dépannage](#guide-de-dépannage)

## Introduction

Le système Lumira implémente trois flux de données principaux qui orchestreront l'expérience utilisateur complète : le processus de commande client, le traitement par les experts, et l'accès au Sanctuaire spirituel. Chaque flux suit un parcours spécifique tout en maintenant la sécurité des données sensibles et l'intégrité des transactions.

## Architecture des flux de données

```mermaid
graph TB
subgraph "Application Client (main-app)"
A[CommandeTemple] --> B[Stripe API]
A --> C[API Backend]
end
subgraph "API Backend"
D[Routes Payments] --> E[Stripe Service]
D --> F[Expert Routes]
D --> G[MongoDB]
end
subgraph "Stripe"
H[Payment Intents] --> I[Webhooks]
end
subgraph "Expert Desk"
J[DeskPage] --> K[API Expert]
K --> L[Validation Queue]
end
subgraph "Sanctuaire"
M[Sanctuaire.tsx] --> N[Auth Service]
N --> O[User Context]
end
A --> D
E --> H
I --> D
F --> J
G --> F
G --> M
```

**Sources du diagramme**
- [CommandeTemple.tsx](file://apps/main-app/src/pages/CommandeTemple.tsx#L1-L50)
- [payments.ts](file://apps/api-backend/src/routes/payments.ts#L1-L30)
- [DeskPage.tsx](file://apps/expert-desk/src/pages/DeskPage.tsx#L1-L50)
- [Sanctuaire.tsx](file://apps/main-app/src/pages/Sanctuaire.tsx#L1-L50)

## Flux de commande client

Le flux de commande client représente le parcours complet depuis la sélection d'un service jusqu'à la confirmation finale. Ce processus implique plusieurs étapes critiques avec échange de données sécurisées.

### Séquence d'échanges

```mermaid
sequenceDiagram
participant Client as Application Client
participant Stripe as Stripe API
participant Backend as API Backend
participant MongoDB as Base de données
Client->>Backend : GET /payments/create-payment-intent
Note over Client,Backend : Paramètres : level, service, expertId
Backend->>MongoDB : Créer commande en statut "pending"
MongoDB-->>Backend : ID commande généré
Backend->>Stripe : POST /payment-intents
Note over Backend,Stripe : Montant, métadonnées, expertId
Stripe-->>Backend : PaymentIntent avec clientSecret
Backend-->>Client : {clientSecret, orderId}
Client->>Stripe : Confirmer paiement
Note over Client,Stripe : Utilise clientSecret
Stripe-->>Client : Résultat paiement
Stripe->>Backend : Webhook payment_intent.succeeded
Backend->>MongoDB : Mettre à jour statut "completed"
Backend-->>Client : Confirmation commande
```

**Sources du diagramme**
- [CommandeTemple.tsx](file://apps/main-app/src/pages/CommandeTemple.tsx#L100-L150)
- [payments.ts](file://apps/api-backend/src/routes/payments.ts#L15-L50)

### Détails du processus

Le processus commence lorsque l'utilisateur sélectionne un niveau de service et un expert. Les données envoyées incluent :

- **Niveau de service** : Simple, Intuitive, Alchimique, Intégrale
- **Type de service** : Basic, Premium, VIP
- **ID expert** : Identifiant unique de l'expert sélectionné
- **Informations client** : Email, nom, téléphone

Le backend crée d'abord une commande en statut "pending" avant de générer l'intention de paiement Stripe. Cette approche garantit que chaque paiement est associé à une commande valide.

**Sources de la section**
- [CommandeTemple.tsx](file://apps/main-app/src/pages/CommandeTemple.tsx#L100-L130)
- [payments.ts](file://apps/api-backend/src/routes/payments.ts#L15-L40)

## Flux de traitement expert

Le flux de traitement expert permet aux experts de valider et approuver le contenu généré par l'IA. Ce processus implique une validation en deux temps avec gestion des révisions.

### Processus de validation

```mermaid
sequenceDiagram
participant Expert as Expert Desk
participant Backend as API Backend
participant AI as Assistant IA
participant MongoDB as Base de données
Expert->>Backend : POST /expert/process-order
Note over Expert,Backend : orderId, expertPrompt, expertInstructions
Backend->>MongoDB : Mettre à jour statut "processing"
Backend->>AI : Webhook n8n avec données commande
AI-->>Backend : Callback avec contenu généré
Backend->>MongoDB : Mettre à jour statut "awaiting_validation"
Expert->>Backend : GET /expert/orders/validation-queue
Backend-->>Expert : Liste commandes en attente
Expert->>Backend : POST /expert/validate-content
Note over Expert,Backend : action, validationNotes, rejectionReason
Backend->>MongoDB : Mettre à jour statut validation
Backend->>Backend : Traitement révision si nécessaire
```

**Sources du diagramme**
- [DeskPage.tsx](file://apps/expert-desk/src/pages/DeskPage.tsx#L100-L200)
- [expert.ts](file://apps/api-backend/src/routes/expert.ts#L400-L500)

### Gestion des révisions

Le système gère automatiquement les révisions en cas de rejet par l'expert. Lorsqu'une commande est rejetée, le système :

1. Incrémente le compteur de révisions
2. Remet la commande en statut "awaiting_validation"
3. Notifie l'expert de la nouvelle demande de révision
4. Permet de soumettre un nouveau contenu généré

**Sources de la section**
- [DeskPage.tsx](file://apps/expert-desk/src/pages/DeskPage.tsx#L150-L200)
- [expert.ts](file://apps/api-backend/src/routes/expert.ts#L300-L350)

## Flux d'accès au Sanctuaire

Le flux d'accès au Sanctuaire permet aux utilisateurs authentifiés d'accéder à leur espace personnel avec contenu généré. Ce processus implique l'authentification et la récupération des données utilisateur.

### Processus d'authentification

```mermaid
sequenceDiagram
participant User as Utilisateur
participant Sanctuaire as Page Sanctuaire
participant Auth as Service Auth
participant Context as User Context
User->>Sanctuaire : Accès page sanctuaire
Sanctuaire->>Auth : Vérifier authentification
Auth-->>Sanctuaire : Token JWT valide
Sanctuaire->>Context : Récupérer données utilisateur
Context-->>Sanctuaire : Informations profil + niveaux
Sanctuaire->>Sanctuaire : Afficher contenu adapté
alt Profil incomplet
Sanctuaire->>User : Afficher formulaire de profil
else Profil complet
Sanctuaire->>User : Afficher dashboard
end
```

**Sources du diagramme**
- [Sanctuaire.tsx](file://apps/main-app/src/pages/Sanctuaire.tsx#L50-L150)

### Gestion des niveaux d'accès

Le système utilise un système de niveaux hiérarchique qui contrôle l'accès aux différents contenus :

- **Niveau 1 (Simple)** : Accès basique aux informations de base
- **Niveau 2 (Intuitive)** : Accès aux analyses de base
- **Niveau 3 (Alchimique)** : Accès aux analyses approfondies
- **Niveau 4 (Intégrale)** : Accès complet aux contenus avancés

**Sources de la section**
- [Sanctuaire.tsx](file://apps/main-app/src/pages/Sanctuaire.tsx#L200-L300)

## Protocoles et sécurité

### HTTPS et chiffrement

Tous les échanges de données utilisent HTTPS avec chiffrement TLS 1.2+. Les clés d'API sont stockées en sécurité et ne transitent jamais dans les requêtes client.

### Protection des données sensibles

Les données sensibles suivantes sont protégées :

- **Tokens JWT** : Utilisés pour l'authentification côté client
- **Intents de paiement Stripe** : Données temporaires pour les transactions
- **Informations personnelles** : Données utilisateur chiffrées
- **Contenu généré** : Accès contrôlé par niveau d'utilisateur

### Validation des signatures

Le système utilise des signatures HMAC pour valider l'authenticité des webhooks Stripe et des callbacks n8n.

**Sources de la section**
- [stripe.ts](file://apps/api-backend/src/services/stripe.ts#L20-L40)
- [payments.ts](file://apps/api-backend/src/routes/payments.ts#L60-L80)

## Formats de données

### Structure JSON des commandes

```json
{
  "order": {
    "id": "order_12345",
    "status": "completed",
    "paymentStatus": "succeeded",
    "amount": 7900,
    "service": "premium",
    "level": "intuitive",
    "duration": 60,
    "expert": {
      "name": "Expert Lumira",
      "specialties": ["tarot", "oracle"],
      "rating": 4.8
    },
    "customerEmail": "client@example.com",
    "createdAt": "2024-01-15T10:30:00Z",
    "paidAt": "2024-01-15T10:35:00Z"
  }
}
```

### Schéma des données d'expert

```json
{
  "expert": {
    "id": "expert_12345",
    "name": "Oracle Expert",
    "email": "expert@oraclelumira.com",
    "role": "expert",
    "isActive": true,
    "lastLogin": "2024-01-15T10:30:00Z"
  }
}
```

**Sources de la section**
- [Order.ts](file://apps/api-backend/src/models/Order.ts#L1-L50)
- [expert.ts](file://apps/api-backend/src/routes/expert.ts#L100-L150)

## Diagrammes de séquence

### Diagramme complet du flux de paiement

```mermaid
sequenceDiagram
participant Client as Application Client
participant Stripe as Stripe API
participant Backend as API Backend
participant Webhook as Webhook Handler
participant Database as Base de données
Note over Client,Database : Phase 1 : Initialisation paiement
Client->>Backend : POST /payments/create-payment-intent
Backend->>Database : Créer commande pending
Database-->>Backend : ID commande
Backend->>Stripe : Créer PaymentIntent
Stripe-->>Backend : clientSecret + paymentIntentId
Backend-->>Client : {clientSecret, orderId}
Note over Client,Database : Phase 2 : Confirmation paiement
Client->>Stripe : Confirmer paiement
Stripe-->>Client : Résultat
Note over Client,Database : Phase 3 : Webhook Stripe
Stripe->>Webhook : payment_intent.succeeded
Webhook->>Database : Mettre à jour statut completed
Webhook-->>Stripe : Confirmation traitement
Note over Client,Database : Phase 4 : Consultation client
Client->>Backend : GET /payments/order/{orderId}
Backend->>Database : Récupérer commande
Database-->>Backend : Données commande
Backend-->>Client : Commande avec statut final
```

**Sources du diagramme**
- [CommandeTemple.tsx](file://apps/main-app/src/pages/CommandeTemple.tsx#L100-L150)
- [payments.ts](file://apps/api-backend/src/routes/payments.ts#L15-L100)

### Diagramme de validation expert

```mermaid
sequenceDiagram
participant Expert as Expert Desk
participant Backend as API Backend
participant N8N as Assistant IA
participant Database as Base de données
Note over Expert,Database : Phase 1 : Traitement commande
Expert->>Backend : POST /expert/process-order
Backend->>Database : Mettre à jour statut processing
Backend->>N8N : Webhook avec données commande
N8N-->>Backend : Callback avec contenu généré
Note over Expert,Database : Phase 2 : Validation initiale
Backend->>Database : Mettre à jour statut awaiting_validation
Expert->>Backend : GET /expert/orders/validation-queue
Backend-->>Expert : Liste commandes en attente
Expert->>Backend : POST /expert/validate-content
Backend->>Database : Mettre à jour statut validation
Note over Expert,Database : Phase 3 : Révision (si nécessaire)
Expert->>Backend : POST /expert/validate-content (rejet)
Backend->>Database : Mettre à jour statut rejected
Expert->>Backend : POST /expert/process-order (nouveau)
Backend->>N8N : Nouveau webhook
N8N-->>Backend : Callback révisé
Backend->>Database : Mettre à jour statut awaiting_validation
```

**Sources du diagramme**
- [DeskPage.tsx](file://apps/expert-desk/src/pages/DeskPage.tsx#L100-L200)
- [expert.ts](file://apps/api-backend/src/routes/expert.ts#L400-L500)

## Considérations de performance

### Optimisations des performances

Le système implémente plusieurs optimisations pour assurer une expérience fluide :

- **Indexation MongoDB** : Index sur les champs fréquemment consultés (status, expertId, createdAt)
- **Pagination** : Limitation des résultats pour éviter les requêtes trop volumineuses
- **Cache des sessions Stripe** : Réutilisation des sessions pour réduire les appels API
- **Streaming des webhooks** : Traitement asynchrone des événements Stripe

### Gestion des erreurs

Le système gère les erreurs avec des stratégies robustes :

- **Retry automatique** : Tentatives de retransmission en cas d'échec temporaire
- **Dead letter queues** : Messages échoués redirigés vers des files d'attente spéciales
- **Monitoring en temps réel** : Alertes sur anomalies de performance

**Sources de la section**
- [Order.ts](file://apps/api-backend/src/models/Order.ts#L200-L250)
- [payments.ts](file://apps/api-backend/src/routes/payments.ts#L60-L80)

## Guide de dépannage

### Problèmes courants et solutions

#### Erreurs de paiement

**Symptôme** : Le paiement échoue avec message d'erreur
**Cause** : Clé Stripe invalide ou configuration manquante
**Solution** : Vérifier la variable d'environnement STRIPE_SECRET_KEY

#### Webhooks non reçus

**Symptôme** : Les paiements ne se finalisent pas automatiquement
**Cause** : Endpoint webhook inaccessible ou signature invalide
**Solution** : Tester l'endpoint avec Stripe CLI et vérifier la signature

#### Accès refusé aux experts

**Symptôme** : Erreur 401 lors de la connexion expert
**Cause** : Token JWT expiré ou compte désactivé
**Solution** : Renouveler le token ou vérifier l'état du compte expert

### Monitoring et diagnostics

Le système propose plusieurs outils de diagnostic :

- **Logs centralisés** : Agrégation des logs pour analyse
- **Dashboard de métriques** : Surveillance des performances en temps réel
- **Tests automatisés** : Validation continue des flux critiques
- **Alertes intelligentes** : Notification précoce des anomalies

**Sources de la section**
- [payments.ts](file://apps/api-backend/src/routes/payments.ts#L60-L80)
- [expert.ts](file://apps/api-backend/src/routes/expert.ts#L200-L250)