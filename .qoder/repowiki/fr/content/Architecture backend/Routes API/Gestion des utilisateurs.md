Maintenant, créons la documentation complète sur la gestion des utilisateurs en français.

<docs>
# Documentation de la Gestion des Utilisateurs

<cite>
**Fichiers Référencés dans ce Document**
- [users.ts](file://apps/api-backend/src/routes/users.ts)
- [User.ts](file://apps/api-backend/src/models/User.ts)
- [Order.ts](file://apps/api-backend/src/models/Order.ts)
- [auth.ts](file://apps/api-backend/src/middleware/auth.ts)
- [validation.ts](file://apps/api-backend/src/middleware/validation.ts)
- [server.ts](file://apps/api-backend/src/server.ts)
- [package.json](file://apps/api-backend/package.json)
</cite>

## Table des Matières
1. [Introduction](#introduction)
2. [Structure du Projet](#structure-du-projet)
3. [Modèle de Données Utilisateur](#modèle-de-données-utilisateur)
4. [Endpoints de Gestion des Utilisateurs](#endpoints-de-gestion-des-utilisateurs)
5. [Authentification et Sécurité](#authentification-et-sécurité)
6. [Validation des Données](#validation-des-données)
7. [Architecture de Sécurité](#architecture-de-sécurité)
8. [Exemples Pratiques](#exemples-pratiques)
9. [Gestion des Erreurs](#gestion-des-erreurs)
10. [Bonnes Pratiques de Sécurité](#bonnes-pratiques-de-sécurité)
11. [Conclusion](#conclusion)

## Introduction

Le système de gestion des utilisateurs d'Oracle Lumira est une API RESTful conçue pour gérer toutes les opérations liées aux utilisateurs, depuis l'inscription jusqu'à la récupération de profils et la mise à jour des informations. Cette documentation couvre l'ensemble des endpoints disponibles sous `/api/users`, incluant l'authentification par JWT, la validation des données, et les stratégies de sécurité mises en place.

Le système utilise Express.js comme framework principal, MongoDB comme base de données, et implémente des mécanismes robustes d'authentification et de validation pour garantir la sécurité des données utilisateur.

## Structure du Projet

La gestion des utilisateurs est organisée selon une architecture modulaire claire :

```mermaid
graph TB
subgraph "Couche API"
UsersRoutes["users.ts<br/>Endpoints Principaux"]
AuthMiddleware["auth.ts<br/>Middleware d'Auth"]
ValidationMiddleware["validation.ts<br/>Validation des Données"]
end
subgraph "Modèles de Données"
UserModel["User.ts<br/>Modèle Utilisateur"]
OrderModel["Order.ts<br/>Modèle Commande"]
end
subgraph "Infrastructure"
Server["server.ts<br/>Serveur Express"]
Config["Variables d'Environnement"]
end
UsersRoutes --> AuthMiddleware
UsersRoutes --> ValidationMiddleware
UsersRoutes --> UserModel
UsersRoutes --> OrderModel
AuthMiddleware --> UserModel
Server --> UsersRoutes
Server --> Config
```

**Sources du Diagramme**
- [users.ts](file://apps/api-backend/src/routes/users.ts#L1-L303)
- [auth.ts](file://apps/api-backend/src/middleware/auth.ts#L1-L119)
- [User.ts](file://apps/api-backend/src/models/User.ts#L1-L84)

**Sources de Section**
- [users.ts](file://apps/api-backend/src/routes/users.ts#L1-L303)
- [server.ts](file://apps/api-backend/src/server.ts#L1-L275)

## Modèle de Données Utilisateur

Le modèle `User` définit la structure complète des données utilisateur avec des contraintes de validation strictes :

```mermaid
classDiagram
class IUser {
+ObjectId _id
+string email
+string firstName
+string lastName
+string phone
+Date dateOfBirth
+Date createdAt
+Date updatedAt
+string stripeCustomerId
+number dolibarrCustomerId
+string subscriptionStatus
+number totalOrders
+Date lastOrderAt
}
class UserSchema {
+String email
+String firstName
+String lastName
+String phone
+Date dateOfBirth
+String stripeCustomerId
+Number dolibarrCustomerId
+String subscriptionStatus
+Number totalOrders
+Date lastOrderAt
+timestamps()
+transform()
}
IUser <|-- UserSchema : "implémente"
```

**Sources du Diagramme**
- [User.ts](file://apps/api-backend/src/models/User.ts#L3-L25)
- [User.ts](file://apps/api-backend/src/models/User.ts#L26-L60)

### Champs Obligatoires et Optionnels

**Champs Obligatoires :**
- `email` : Adresse email unique et valide
- `firstName` : Prénom de l'utilisateur (max 50 caractères)
- `lastName` : Nom de famille de l'utilisateur (max 50 caractères)
- `subscriptionStatus` : Statut d'abonnement (active, inactive, trial)

**Champs Optionnels :**
- `phone` : Numéro de téléphone avec validation
- `dateOfBirth` : Date de naissance
- `stripeCustomerId` : Identifiant Stripe pour les paiements
- `dolibarrCustomerId` : Identifiant Dolibarr pour la comptabilité
- `lastOrderAt` : Date de la dernière commande

**Sources de Section**
- [User.ts](file://apps/api-backend/src/models/User.ts#L10-L60)

## Endpoints de Gestion des Utilisateurs

### 1. Récupération de tous les utilisateurs (Admin)

**Endpoint :** `GET /api/users/`

**Description :** Récupère la liste paginée de tous les utilisateurs avec filtrage optionnel.

**Paramètres de Requête :**
- `page` : Numéro de page (par défaut : 1)
- `limit` : Nombre d'utilisateurs par page (par défaut : 20)
- `email` : Filtre par email (recherche partielle)
- `status` : Filtre par statut d'abonnement

**Réponse :**
```json
{
  "users": [
    {
      "_id": "654321...",
      "email": "user@example.com",
      "firstName": "Jean",
      "lastName": "Dupont",
      "subscriptionStatus": "active",
      "totalOrders": 3,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "current": 1,
    "total": 5,
    "count": 20,
    "limit": 20
  }
}
```

### 2. Récupération d'un utilisateur par ID

**Endpoint :** `GET /api/users/:id`

**Description :** Récupère les détails d'un utilisateur spécifique.

**Réponse :**
```json
{
  "_id": "654321...",
  "email": "user@example.com",
  "firstName": "Jean",
  "lastName": "Dupont",
  "phone": "+33612345678",
  "dateOfBirth": "1990-01-01",
  "subscriptionStatus": "active",
  "totalOrders": 3,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

### 3. Mise à jour d'un utilisateur (Admin)

**Endpoint :** `PATCH /api/users/:id`

**Description :** Met à jour les informations d'un utilisateur (accès réservé aux administrateurs).

**Corps de Requête :**
```json
{
  "firstName": "Nouveau Prénom",
  "lastName": "Nouveau Nom",
  "phone": "+33687654321",
  "subscriptionStatus": "active"
}
```

**Réponse :**
```json
{
  "_id": "654321...",
  "email": "user@example.com",
  "firstName": "Nouveau Prénom",
  "lastName": "Nouveau Nom",
  "phone": "+33687654321",
  "subscriptionStatus": "active",
  "updatedAt": "2024-01-15T11:00:00.000Z"
}
```

### 4. Récupération des statistiques utilisateur

**Endpoint :** `GET /api/users/:id/stats`

**Description :** Récupère les statistiques détaillées d'un utilisateur incluant ses commandes.

**Réponse :**
```json
{
  "user": {
    "_id": "654321...",
    "email": "user@example.com",
    "firstName": "Jean",
    "lastName": "Dupont"
  },
  "orderStats": {
    "total": 15,
    "completed": 12,
    "pending": 3,
    "totalSpent": 15000
  },
  "recentOrders": [...],
  "levelDistribution": {
    "1": 5,
    "2": 4,
    "3": 2,
    "4": 1
  }
}
```

### 5. Authentification Sanctuaire

**Endpoint :** `POST /api/users/auth/sanctuaire`

**Description :** Authentification pour accéder au sanctuaire (accès limité aux utilisateurs ayant des commandes complétées).

**Corps de Requête :**
```json
{
  "email": "user@example.com"
}
```

**Réponse :**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "654321...",
    "email": "user@example.com",
    "firstName": "Jean",
    "lastName": "Dupont",
    "level": 3
  }
}
```

### 6. Récupération des commandes complétées (Sanctuaire)

**Endpoint :** `GET /api/users/orders/completed`

**Description :** Récupère les commandes complétées de l'utilisateur authentifié au sanctuaire.

**Réponse :**
```json
{
  "orders": [
    {
      "id": "789012...",
      "orderNumber": "LU240115001",
      "level": 1,
      "levelName": "Simple",
      "amount": 2999,
      "status": "completed",
      "createdAt": "2024-01-15T08:30:00.000Z",
      "deliveredAt": "2024-01-15T14:45:00.000Z",
      "generatedContent": {
        "reading": "...",
        "audioUrl": "https://example.com/audio.mp3",
        "pdfUrl": "https://example.com/pdf.pdf"
      },
      "expertValidation": {
        "validationStatus": "approved"
      }
    }
  ],
  "total": 1,
  "user": {
    "id": "654321...",
    "firstName": "Jean",
    "lastName": "Dupont",
    "level": 1
  }
}
```

### 7. Récupération des statistiques sanctuaire

**Endpoint :** `GET /api/users/sanctuaire/stats`

**Description :** Récupère les statistiques spécifiques au sanctuaire de l'utilisateur.

**Réponse :**
```json
{
  "totalOrders": 15,
  "completedOrders": 12,
  "pendingOrders": 3,
  "totalSpent": 15000,
  "currentLevel": 12,
  "maxLevel": 4,
  "levelProgress": 75,
  "lastOrderDate": "2024-01-15T14:45:00.000Z",
  "availableContent": {
    "readings": 12,
    "audios": 8,
    "pdfs": 10,
    "mandalas": 5
  }
}
```

**Sources de Section**
- [users.ts](file://apps/api-backend/src/routes/users.ts#L10-L303)

## Authentification et Sécurité

### Mécanisme JWT

Le système utilise JSON Web Tokens (JWT) pour l'authentification sécurisée :

```mermaid
sequenceDiagram
participant Client as "Application Client"
participant API as "API Backend"
participant Auth as "Middleware Auth"
participant DB as "Base de Données"
Client->>API : Requête avec Token JWT
API->>Auth : authenticateToken()
Auth->>Auth : Vérifier signature JWT
Auth->>Auth : Extraire payload
Auth->>DB : Vérifier utilisateur (optionnel)
Auth->>API : Passer utilisateur authentifié
API->>Client : Réponse autorisée
Note over Client,DB : Gestion des erreurs<br/>Token expiré/invalide
```

**Sources du Diagramme**
- [auth.ts](file://apps/api-backend/src/middleware/auth.ts#L10-L50)
- [users.ts](file://apps/api-backend/src/routes/users.ts#L15-L25)

### Middleware d'Authentification

Le middleware `authenticateToken` vérifie la présence et la validité du token JWT :

**Caractéristiques :**
- Extraction automatique du header Authorization
- Vérification de la signature avec JWT_SECRET
- Gestion des erreurs spécifiques (expiré, invalide)
- Transformation automatique du payload en objet utilisateur

**Codes d'erreur :**
- `NO_TOKEN` : Token manquant
- `TOKEN_EXPIRED` : Token expiré
- `INVALID_TOKEN` : Token invalide
- `AUTH_ERROR` : Erreur générale d'authentification

### Rôles et Permissions

Le système implémente un système de rôles avec le middleware `requireRole` :

**Rôles disponibles :**
- `admin` : Accès complet aux fonctionnalités admin
- `user` : Accès limité aux fonctionnalités utilisateur

**Exemple d'utilisation :**
```typescript
router.get('/', authenticateToken, requireRole(['admin']), async (req, res) => {
  // Endpoint accessible uniquement aux admins
});
```

**Sources de Section**
- [auth.ts](file://apps/api-backend/src/middleware/auth.ts#L10-L119)
- [users.ts](file://apps/api-backend/src/routes/users.ts#L10-L25)

## Validation des Données

### Middleware de Validation Centralisé

Le système utilise `express-validator` pour la validation centralisée :

```mermaid
flowchart TD
Request["Requête Entrante"] --> Validation["Validation Middleware"]
Validation --> HasErrors{"Erreurs?"}
HasErrors --> |Oui| ErrorResponse["400 Bad Request<br/>Détails des erreurs"]
HasErrors --> |Non| NextMiddleware["Middleware Suivant"]
NextMiddleware --> BusinessLogic["Logique Métier"]
BusinessLogic --> SuccessResponse["Réponse Succès"]
ErrorResponse --> LogError["Logger Erreur"]
LogError --> ClientResponse["Réponse Client"]
```

**Sources du Diagramme**
- [validation.ts](file://apps/api-backend/src/middleware/validation.ts#L8-L25)

### Stratégies de Validation

**Validation des Emails :**
```typescript
email: {
  type: String,
  required: true,
  unique: true,
  lowercase: true,
  trim: true,
  match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
}
```

**Validation des Téléphones :**
```typescript
phone: {
  type: String,
  trim: true,
  match: [/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number']
}
```

**Validation des Noms :**
- Maximum 50 caractères
- Suppression des espaces superflus
- Validation Unicode

**Sources de Section**
- [validation.ts](file://apps/api-backend/src/middleware/validation.ts#L1-L64)
- [User.ts](file://apps/api-backend/src/models/User.ts#L20-L35)

## Architecture de Sécurité

### Protection par Rate Limiting

Le serveur implémente un rate limiting pour prévenir les attaques DDoS :

```typescript
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requêtes par fenêtre
  message: 'Too many requests from this IP',
  standardHeaders: true,
  legacyHeaders: false,
});
```

### Protection par CORS

Configuration CORS flexible pour différents environnements :

**Origines autorisées :**
- `https://oraclelumira.com`
- `https://desk.oraclelumira.com`
- `http://localhost:3000`
- `http://localhost:5173`

**Méthodes autorisées :**
- GET, POST, PUT, DELETE, OPTIONS

### Protection par Helmet

Le middleware Helmet fournit plusieurs couches de protection :
- Content Security Policy (CSP)
- Headers de sécurité HTTP
- Protection contre les attaques connues

**Sources de Section**
- [server.ts](file://apps/api-backend/src/server.ts#L40-L80)
- [server.ts](file://apps/api-backend/src/server.ts#L150-L180)

## Exemples Pratiques

### Exemple de Création d'Utilisateur

```javascript
// Requête POST vers /api/users (via admin)
fetch('https://api.oraclelumira.com/api/users', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer admin_token_here'
  },
  body: JSON.stringify({
    email: 'newuser@example.com',
    firstName: 'Marie',
    lastName: 'Martin',
    phone: '+33612345678',
    dateOfBirth: '1985-05-15',
    subscriptionStatus: 'active'
  })
})
.then(response => response.json())
.then(data => console.log(data));
```

### Exemple d'Authentification Sanctuaire

```javascript
// Requête POST vers /api/users/auth/sanctuaire
fetch('https://api.oraclelumira.com/api/users/auth/sanctuaire', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'user@example.com'
  })
})
.then(response => response.json())
.then(data => {
  localStorage.setItem('sanctuaryToken', data.token);
  console.log('Authentification réussie');
});
```

### Exemple d'Accès au Sanctuaire

```javascript
// Requête GET vers /api/users/orders/completed
fetch('https://api.oraclelumira.com/api/users/orders/completed', {
  headers: {
    'Authorization': 'Bearer sanctuary_token_here'
  }
})
.then(response => response.json())
.then(data => {
  console.log('Commandes complétées:', data.orders);
});
```

## Gestion des Erreurs

### Types d'Erreurs Communes

**Erreurs d'Authentification :**
```json
{
  "error": "Access denied. No token provided.",
  "code": "NO_TOKEN"
}
```

**Erreurs de Validation :**
```json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "email",
      "message": "Please enter a valid email",
      "value": "invalid-email"
    }
  ]
}
```

**Erreurs de Base de Données :**
```json
{
  "error": "Failed to fetch users",
  "details": {
    "code": "DUPLICATE_KEY",
    "field": "email"
  }
}
```

### Stratégies de Logging

Le système utilise Winston pour un logging structuré :

```typescript
// Exemple de log d'erreur
logger.error('Authentication error:', { 
  message: 'Invalid token', 
  stack: error.stack 
});

// Log de requête
logger.info(`${req.method} ${req.path} - ${req.ip}`);
```

**Sources de Section**
- [validation.ts](file://apps/api-backend/src/middleware/validation.ts#L8-L25)
- [auth.ts](file://apps/api-backend/src/middleware/auth.ts#L30-L50)

## Bonnes Pratiques de Sécurité

### Hachage des Mots de Passe

Bien que le système actuel ne gère pas directement les mots de passe utilisateur, il est recommandé d'implémenter bcrypt pour le hachage :

```typescript
import bcrypt from 'bcryptjs';

// Hashage du mot de passe
const salt = await bcrypt.genSalt(10);
const hashedPassword = await bcrypt.hash(password, salt);

// Vérification du mot de passe
const isValid = await bcrypt.compare(inputPassword, storedHash);
```

### Gestion des Tokens

**Renouvellement automatique :**
- Implémenter un refresh token
- Gérer l'expiration des tokens
- Stocker les tokens côté client de manière sécurisée

**Expiration des Sessions :**
- Tokens JWT avec expiration courte
- Refresh tokens avec expiration plus longue
- Blacklist des tokens compromis

### Sécurisation des Données

**Protection des champs sensibles :**
```typescript
// Dans le modèle User
toJSON: {
  transform: (doc, ret) => {
    delete ret.password;
    delete ret.stripeCustomerId;
    delete ret.__v;
    return ret;
  }
}
```

**Validation des entrées :**
- Validation côté client et serveur
- Nettoyage des données d'entrée
- Prévention des injections SQL/NOSQL

### Monitoring et Audit

**Surveillance des accès :**
- Logs d'authentification
- Monitoring des tentatives d'accès
- Alertes sur activités suspectes

**Audit des modifications :**
- Tracking des changements utilisateur
- Historique des mises à jour
- Réversibilité des actions critiques

**Sources de Section**
- [User.ts](file://apps/api-backend/src/models/User.ts#L50-L60)
- [auth.ts](file://apps/api-backend/src