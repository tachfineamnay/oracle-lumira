# 🔍 AUDIT TECHNIQUE COMPLET - ORACLE LUMIRA

**Date** : 25 Octobre 2025  
**Version** : 1.0.0  
**Auditeur** : Dev Full-Stack Senior

---

## 📋 SOMMAIRE

1. [Vue d'Ensemble](#1-vue-densemble)
2. [Stack Technique](#2-stack-technique)
3. [Architecture](#3-architecture)
4. [Modèles de Données](#4-modèles-de-données)
5. [Fonctionnalités](#5-fonctionnalités)
6. [Sécurité](#6-sécurité)
7. [Performance](#7-performance)
8. [Qualité du Code](#8-qualité-du-code)
9. [Points Forts](#9-points-forts)
10. [Points Faibles](#10-points-faibles)
11. [Recommandations](#11-recommandations)

---

## 1. VUE D'ENSEMBLE

### 1.1 Type d'Application
**Suite SaaS B2C Full-Stack** pour coaching spirituel et lectures Oracle personnalisées.

### 1.2 Modules
```
oracle-lumira/
├── apps/main-app/        → Frontend Client (React + Vite)
├── apps/api-backend/     → API REST (Node.js + Express + MongoDB)
├── apps/expert-desk/     → Interface Expert (React + Vite)
├── infrastructure/       → Docker Compose + Dolibarr CRM
└── qa-tests/            → Tests E2E Playwright
```

### 1.3 Domaine Métier
- Vente de lectures Oracle (4 niveaux : 27€ → 97€)
- Paiements Stripe avec webhook
- Upload fichiers clients (photos + données naissance)
- Génération contenus personnalisés (PDF, Audio, Mandala)
- Espace client sécurisé "Sanctuaire"
- Interface Expert pour traiter commandes

---

## 2. STACK TECHNIQUE

### 2.1 Frontend

| Techno | Version | Usage |
|--------|---------|-------|
| React | 18.3.1 | UI Framework |
| TypeScript | 5.5.3 | Typage statique |
| Vite | 5.4.2 | Build tool |
| React Router | 7.8.2 | Routage SPA |
| Tailwind CSS | 3.4.1 | Styling |
| Framer Motion | 12.23.12 | Animations |
| Axios | 1.6.2 | HTTP Client |
| Stripe React | 4.0.0 | Paiements |

### 2.2 Backend

| Techno | Version | Usage |
|--------|---------|-------|
| Node.js | ≥18.0.0 | Runtime |
| Express | 4.18.2 | Web Framework |
| MongoDB | via Mongoose | BDD NoSQL |
| Mongoose | 8.0.3 | ODM |
| Stripe | 16.0.0 | API Paiements |
| JWT | 9.0.2 | Auth tokens |
| AWS S3 | 3.481.0 | Stockage fichiers |
| Bcrypt | 2.4.3 | Hash passwords |
| Winston | 3.11.0 | Logging |

### 2.3 Infrastructure
- **Conteneurisation** : Docker + Docker Compose
- **CRM** : Dolibarr 17
- **Tests E2E** : Playwright
- **CI/CD** : Scripts PowerShell + Git

---

## 3. ARCHITECTURE

### 3.1 Architecture Globale

```
┌─────────────┐
│   Client    │
│   Browser   │
└──────┬──────┘
       │
       ├──────────┐
       ▼          ▼
┌──────────┐ ┌──────────┐
│ Main-App │ │Expert Desk│
│  (SPA)   │ │  (SPA)   │
└─────┬────┘ └─────┬────┘
      │            │
      └─────┬──────┘
            ▼
      ┌──────────┐
      │API Backend│
      │ (Express)│
      └─────┬────┘
            │
    ┌───────┼───────┬────────┐
    ▼       ▼       ▼        ▼
┌────────┐ ┌─────┐ ┌─────┐ ┌─────┐
│MongoDB │ │Stripe│ │AWS S3│ │Logs │
└────────┘ └─────┘ └─────┘ └─────┘
```

### 3.2 Frontend - Structure

**Main-App** :
```
src/
├── components/
│   ├── ui/              # GlassCard, PageLayout, LoadingScreen
│   ├── auth/            # CapabilityGuard (gating)
│   ├── checkout/        # Formulaires paiement
│   ├── sanctuaire/      # OnboardingForm (4 étapes)
│   └── spheres/         # Sections Sanctuaire (Draws, Profile...)
├── contexts/
│   └── SanctuaireContext.tsx  # ⭐ Source de vérité unique
├── pages/
│   ├── LandingTempleRefonte   # Homepage
│   ├── CommandeTempleSPA      # Checkout
│   ├── ConfirmationTempleSPA  # Post-paiement
│   └── Sanctuaire             # Espace client
├── services/
│   ├── productOrder.ts
│   └── sanctuaire.ts
└── router.tsx
```

**Design System - Palette Stellaire Celeste** :
```css
cosmic-void:   #0B0B1A  /* Noir profond */
cosmic-deep:   #1A1B3A  /* Bleu nuit */
cosmic-gold:   #FFD700  /* Or mystique */
cosmic-purple: #A855F7  /* Violet lumineux */
```

### 3.3 Backend - Routes API

```
routes/
├── health.ts         # GET  /api/health
├── ready.ts          # GET  /api/ready (Mongo+Stripe checks)
├── users.ts          # Auth Sanctuaire, profil, entitlements
├── products.ts       # Catalogue, create PaymentIntent
├── stripe.ts         # Webhook payment_intent.succeeded
├── orders.ts         # CRUD commandes
├── expert.ts         # Interface expert
└── uploads.ts        # Presign S3
```

**Endpoints Critiques** :

| Méthode | Endpoint | Fonction |
|---------|----------|----------|
| POST | `/users/auth/sanctuaire-v2` | Auth client avec email |
| GET | `/users/profile` | Récupération profil |
| PATCH | `/users/profile` | MAJ profil |
| GET | `/users/entitlements` | Capacités débloquées |
| POST | `/products/create-payment-intent` | Créer paiement Stripe |
| POST | `/stripe/webhook` | Traiter payment_intent.succeeded |
| GET | `/users/orders/completed` | Commandes complétées |

---

## 4. MODÈLES DE DONNÉES

### 4.1 User (MongoDB)

```typescript
{
  email: string,                   // unique, lowercase
  firstName: string,
  lastName: string,
  phone?: string,
  stripeCustomerId?: string,
  subscriptionStatus: 'active' | 'inactive',
  totalOrders: number,
  
  profile?: {
    birthDate: string,
    birthTime: string,
    birthPlace: string,
    specificQuestion: string,
    objective: string,
    facePhotoUrl: string,         // S3 key
    palmPhotoUrl: string,          // S3 key
    profileCompleted: boolean,
    submittedAt: Date
  },
  
  createdAt: Date,
  updatedAt: Date
}
```

### 4.2 Order

```typescript
{
  _id: ObjectId,
  orderNumber: string,             // ORD-{timestamp}-{random}
  userId: ObjectId,
  userEmail: string,
  level: 1 | 2 | 3 | 4,
  amount: number,                  // centimes
  status: 'pending' | 'paid' | 'processing' | 'completed',
  paymentIntentId: string,
  
  formData: {
    firstName, lastName, email, phone,
    dateOfBirth, specificQuestion
  },
  
  generatedContent: {
    archetype: string,
    reading: string,               // Texte complet
    audioUrl: string,              // S3
    pdfUrl: string,                // S3
    mandalaSvg: string,            // S3
    ritual: string,
    blockagesAnalysis: string
  },
  
  expertValidation: {
    validatorId: ObjectId,
    validationStatus: 'pending' | 'approved' | 'rejected',
    validatedAt: Date
  },
  
  deliveredAt: Date,
  createdAt: Date
}
```

### 4.3 ProductOrder

```typescript
{
  _id: ObjectId,
  productId: 'initie' | 'mystique' | 'profond' | 'integrale',
  customerEmail: string,
  amount: number,
  status: 'pending' | 'completed' | 'failed',
  paymentIntentId: string,
  metadata: Record<string, any>,
  completedAt: Date
}
```

---

## 5. FONCTIONNALITÉS

### 5.1 Parcours Client

**1. Homepage** → Landing avec sections :
- Hero animé (mandala rotatif)
- 4 niveaux de produits (cards)
- Témoignages
- Upsell section
- Footer

**2. Checkout** (`/commande`) :
- Formulaire multi-étapes
- Sélection niveau (27€ → 97€)
- Stripe Elements (carte bancaire)
- Validation email temps réel

**3. Confirmation** (`/confirmation`) :
- Polling statut commande
- Auth automatique (`/auth/sanctuaire-v2`)
- Stockage token JWT (24h)
- Redirection vers Sanctuaire (temporisée 150ms)

**4. Sanctuaire** (`/sanctuaire`) :
- **Dashboard** : Vue d'ensemble
- **Onboarding** (si profil incomplet) :
  - Étape 0 : Bienvenue (infos pré-remplies)
  - Étape 1 : Naissance (date, heure, lieu)
  - Étape 2 : Intention (question, objectif)
  - Étape 3 : Photos (visage + paume, upload S3)
- **Mes Lectures** (`/draws`) : PDF, Audio, Mandala
- **Profil** (`/profile`) : Gestion données perso
- **Synthèse** (`/synthesis`) : Analyse spirituelle (niveau Profond)
- **Guidance** (`/guidance`) : Mentorat (niveau Intégral)

### 5.2 Système d'Entitlements

**Hiérarchie** : Intégrale > Profond > Mystique > Initié

**Capacités par niveau** :

| Niveau | Prix | Capacités principales |
|--------|------|----------------------|
| **Initié** | 27€ | PDF de base, audio court, profil, lectures |
| **Mystique** | 47€ | + Rituels, audio complet, analyse blocages, sphère mandala |
| **Profond** | 67€ | + Mandala HD, ligne karmique, cycles de vie, synthèse |
| **Intégral** | 97€ | + Mandala perso, mission d'âme, mentorat 30j, guidance |

**Héritage automatique** : Profond = Initié + Mystique + Profond

**Exemple capacités** :
```typescript
'sanctuaire.sphere.readings'    // Accès section lectures
'sanctuaire.sphere.mandala'     // Accès mandala
'analysis.karmic_line'          // Analyse ligne karmique
'mentorat.personalized'         // Mentorat personnalisé
```

### 5.3 Upload Fichiers S3

**Process** :
1. Frontend demande presign URL (`POST /uploads/presign`)
2. Backend génère signed URL (exp: 2h)
3. Frontend upload direct S3 (PUT, progress tracking)
4. Retry automatique (3 tentatives, backoff exponentiel)
5. Compression images (JPEG, max 900KB)

**Sécurité** :
- Presign limité aux types `face_photo` / `palm_photo`
- Validation Content-Type côté backend
- URLs signées avec expiration courte
- Accès lecture via presign sécurisé (vérification Orders complétées)

### 5.4 Expert Desk

**Fonctions** :
- Login expert (JWT séparé)
- Liste commandes pending
- Génération contenus (archétype, lecture, rituels)
- Upload fichiers générés (PDF, audio, mandala SVG)
- Validation/rejet commandes
- Statistiques (commandes traitées, en attente)

---

## 6. SÉCURITÉ

### 6.1 Points Forts ✅

1. **JWT avec types distincts**
   - `sanctuaire_access` pour clients
   - `expert_access` pour experts
   - Expiration 24h
   
2. **Passwords hashés** (Bcrypt, 10 rounds)

3. **Validation stricte**
   - Express-validator sur tous endpoints
   - Sanitization email, trim strings
   
4. **Helmet.js** activé (headers sécurité HTTP)

5. **CORS configuré** avec whitelist

6. **S3 presign** avec vérification ownership Orders

7. **Webhook Stripe** avec signature vérifiée

### 6.2 Vulnérabilités Potentielles ⚠️

1. **Secrets en dur**
   - `JWT_SECRET` fallback présent dans code
   - ❌ Risque : Si env var manquante, secret faible utilisé
   
2. **Rate limiting incomplet**
   - Présent uniquement sur certains endpoints
   - ❌ Risque : Brute force auth
   
3. **Pas de rotation tokens**
   - JWT 24h sans refresh
   - ❌ Risque : Token volé = accès prolongé
   
4. **Logs verbeux**
   - Console.log avec données sensibles
   - ❌ Risque : Exposition emails, metadata

5. **MongoDB injection**
   - Mongoose protège partiellement
   - ⚠️ Vérifier sanitization sur requêtes $where

### 6.3 Conformité RGPD

**À implémenter** :
- [ ] Consentement cookies explicite
- [ ] Export données utilisateur
- [ ] Droit à l'oubli (suppression compte)
- [ ] Notification breach 72h
- [ ] DPO désigné
- [ ] Privacy policy complète

---

## 7. PERFORMANCE

### 7.1 Frontend

**Optimisations existantes** ✅ :
- Vite bundling (rapide)
- Lazy loading routes (`React.lazy()`)
- Suspense avec fallback SphereSkeleton
- Animations CSS + Framer Motion optimisées
- Tailwind purge CSS

**Métriques build** :
```
Bundle size: ~594KB (gzippé)
Modules: 1994
Build time: ~15-30s
```

**Améliorations possibles** :
- [ ] Code splitting plus agressif
- [ ] Image lazy loading (mandalas lourds)
- [ ] Service Worker (cache API calls)
- [ ] Preload fonts critiques

### 7.2 Backend

**Optimisations existantes** ✅ :
- Index MongoDB sur champs critiques
- Chargement parallèle (`Promise.all`)
- Timeouts sur checks ready (5s max)
- Compression réponses (gzip)

**Problèmes détectés** ⚠️ :
- Pas de cache Redis
- Requêtes N+1 potentielles (populate)
- Logs synchrones (bloquants)

**Métriques observées** :
```
Auth endpoint: ~200-400ms
Entitlements: ~150-300ms
Webhook process: ~500-800ms
```

### 7.3 Base de Données

**Index MongoDB** :
```javascript
User:
  - { email: 1 } unique
  - { stripeCustomerId: 1 }

Order:
  - { userId: 1, status: 1 }
  - { userEmail: 1, status: 1 }
  - { paymentIntentId: 1 } unique
  - { orderNumber: 1 } unique

ProductOrder:
  - { paymentIntentId: 1 } unique
  - { customerEmail: 1, status: 1 }
```

**Optimisations suggérées** :
- [ ] Index composites pour requêtes fréquentes
- [ ] TTL index pour sessions expirées
- [ ] Archivage Orders anciennes (> 2 ans)

---

## 8. QUALITÉ DU CODE

### 8.1 TypeScript

**Couverture** : ~85% du code typé

**Points forts** ✅ :
- Interfaces claires (User, Order, Product)
- Types stricts sur services
- Enums pour statuts

**Points faibles** ⚠️ :
- Plusieurs `any` dans webhooks
- Type assertions `as any` dans helpers
- Typage DOM manquant (`new Image()`)

### 8.2 Architecture Code

**Patterns utilisés** :
- ✅ Context API (SanctuaireProvider)
- ✅ Custom Hooks (useOrderStatus, useSanctuaire)
- ✅ Service Layer (sanctuaire.ts, productOrder.ts)
- ✅ Middleware pattern (auth, validation)
- ✅ Repository-like (Mongoose models)

**Dette technique** :
- Routes legacy multiples (`CommandeTemple`, `SanctuaireSimple`)
- Fichiers `-OLD.tsx` non supprimés
- Duplication logique auth (v1 + v2)
- Commentaires TODO non traités

### 8.3 Tests

**Coverage actuel** :
```
Backend:
  - Tests unitaires: ~15% (Jest)
  - Tests E2E: Payment flow (Playwright)
  
Frontend:
  - Tests unitaires: 0%
  - Tests E2E: 0%
```

**Fichiers de tests existants** :
- `qa-tests/playwright/payment-flow.spec.ts`
- `apps/api-backend/src/__tests__/ready.test.ts`

**Gaps critiques** ❌ :
- Pas de tests OnboardingForm
- Pas de tests SanctuaireContext
- Pas de tests webhook Stripe
- Pas de tests entitlements

---

## 9. POINTS FORTS

### 9.1 Architecture

✅ **Monorepo bien structuré**  
✅ **Séparation claire Frontend/Backend**  
✅ **SanctuaireContext comme source unique** (évite fragmentation état)  
✅ **Système entitlements élégant** avec héritage hiérarchique  
✅ **Webhook Stripe idempotent**  

### 9.2 UX/Design

✅ **Design cohérent** (palette stellaire celeste)  
✅ **Animations fluides** (Framer Motion)  
✅ **Onboarding progressif** (4 étapes claires)  
✅ **Upload S3 avec progress** (retry automatique)  
✅ **Messages d'erreur contextuels**  

### 9.3 Développement

✅ **TypeScript partout**  
✅ **Vite pour builds rapides**  
✅ **Hot reload fonctionnel**  
✅ **Scripts npm cohérents**  
✅ **Docker Compose prêt**  

---

## 10. POINTS FAIBLES

### 10.1 Critiques ❌

1. **Pas de tests suffisants** (coverage < 20%)
2. **Secrets non externalisés** (fallback hardcodé)
3. **Logs non structurés** (console.log partout)
4. **Pas de monitoring** (APM, Sentry, metrics)
5. **RGPD non conforme** (manque consentement, export données)

### 10.2 Moyens ⚠️

1. **Dette technique** (fichiers -OLD, routes legacy)
2. **Documentation API manquante** (pas de Swagger/OpenAPI)
3. **Pas de rate limiting global**
4. **Typage TS incomplet** (plusieurs `any`)
5. **Pas de CI/CD automatisé** (scripts manuels)

### 10.3 Mineurs 🔶

1. **Bundle size élevé** (594KB)
2. **Pas de lazy images**
3. **Animations non réduites** (prefers-reduced-motion)
4. **Accessibilité partielle** (manque aria-labels)

---

## 11. RECOMMANDATIONS

### 11.1 Priorité CRITIQUE (Sprint 1)

**🔴 P0 - Sécurité**

1. **Externaliser secrets**
   ```bash
   # Supprimer fallbacks
   const JWT_SECRET = process.env.JWT_SECRET!;
   if (!JWT_SECRET) throw new Error('JWT_SECRET required');
   ```

2. **Ajouter rate limiting global**
   ```typescript
   import rateLimit from 'express-rate-limit';
   app.use('/api/', rateLimit({ windowMs: 15*60*1000, max: 100 }));
   ```

3. **Nettoyer logs sensibles**
   ```typescript
   // Remplacer console.log par Winston
   logger.info('User authenticated', { userId: sanitize(user._id) });
   ```

4. **Corriger typage TS**
   ```typescript
   // OnboardingForm.tsx L219
   const img = document.createElement('img'); // au lieu de new Image()
   ```

### 11.2 Priorité HAUTE (Sprint 2)

**🟠 P1 - Qualité & Monitoring**

1. **Tests essentiels**
   - [ ] Tests E2E complet parcours achat
   - [ ] Tests unitaires SanctuaireContext
   - [ ] Tests webhook Stripe (idempotence)
   - [ ] Tests entitlements (héritage)

2. **Monitoring**
   - [ ] Sentry pour erreurs frontend
   - [ ] APM backend (New Relic / Datadog)
   - [ ] Metrics Stripe webhooks (succès/échecs)
   - [ ] Healthcheck avancé (`/ready` déjà bon)

3. **Documentation**
   - [ ] OpenAPI/Swagger pour API
   - [ ] README mis à jour (architecture, setup)
   - [ ] Runbook incidents (403, crash contextuel)

### 11.3 Priorité MOYENNE (Sprint 3)

**🟡 P2 - Performance & UX**

1. **Performance**
   - [ ] Redis cache pour entitlements
   - [ ] Lazy loading images mandalas
   - [ ] Code splitting agressif (< 300KB bundle)
   - [ ] Service Worker (cache API)

2. **Accessibilité**
   - [ ] Audit WCAG 2.1 AA
   - [ ] Aria-labels sur composants clés
   - [ ] Focus management (keyboard nav)
   - [ ] Contraste couleurs validé

3. **Dette technique**
   - [ ] Supprimer fichiers -OLD
   - [ ] Unifier auth v1/v2 (garder v2 seul)
   - [ ] Nettoyer routes legacy
   - [ ] Refactor duplications

### 11.4 Priorité BASSE (Backlog)

**🟢 P3 - Nice to have**

1. **RGPD complet**
   - [ ] Consentement cookies
   - [ ] Export données GDPR
   - [ ] Droit à l'oubli
   - [ ] Privacy policy

2. **CI/CD automatisé**
   - [ ] GitHub Actions
   - [ ] Tests auto sur PR
   - [ ] Deploy preview Vercel/Netlify

3. **Améliorations UX**
   - [ ] Dark mode toggle
   - [ ] Animations réduites (prefers-reduced-motion)
   - [ ] PWA (install prompt)
   - [ ] Notifications push

---

## 📊 SCORES GLOBAUX

| Critère | Note | Commentaire |
|---------|------|-------------|
| **Architecture** | 8.5/10 | Excellente structure monorepo, contexte unifié |
| **Sécurité** | 6.5/10 | Bonnes bases mais gaps critiques (secrets, rate limit) |
| **Performance** | 7/10 | Acceptable, optimisations possibles (cache, bundle) |
| **Qualité Code** | 7.5/10 | TS bien utilisé, mais dette technique |
| **Tests** | 3/10 | Coverage très faible, risque régression |
| **Documentation** | 4/10 | Manque doc API et guides setup |
| **UX/Design** | 8/10 | Design cohérent, animations fluides |
| **Accessibilité** | 5/10 | Bases présentes, manque aria et contraste |

**SCORE GLOBAL** : **6.8/10**

---

## 🎯 CONCLUSION

### Forces
L'application est **bien architecturée** avec une séparation claire des responsabilités, un design cohérent et un système d'entitlements élégant. Le parcours utilisateur est fluide et les animations apportent une vraie valeur.

### Faiblesses
Les **tests insuffisants**, les **secrets non externalisés** et le **manque de monitoring** sont des risques majeurs en production. La **dette technique** ralentit l'évolution.

### Recommandation Prioritaire
**Commencer par la sécurité** (secrets, rate limiting, logs) avant d'enrichir les fonctionnalités. Investir dans les tests pour sécuriser les évolutions futures.

---

**Prochaines étapes suggérées** :
1. Sprint 1 : Sécurité (secrets, rate limit, logs propres)
2. Sprint 2 : Tests (E2E, unitaires critiques)
3. Sprint 3 : Monitoring (Sentry, APM)

---

*Fin de l'audit technique - Oracle Lumira v1.0.0*
