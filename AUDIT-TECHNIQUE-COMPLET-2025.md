# 🔍 AUDIT TECHNIQUE COMPLET - ORACLE LUMIRA
## Rapport d'Analyse de Stack Full-Stack & Recommandations
**Date:** 18 Octobre 2025  
**Analyste:** Expert Full Stack  
**Version:** 1.0.0  
**Environnement:** Production/Développement

---

## 📋 TABLE DES MATIÈRES

1. [Executive Summary](#executive-summary)
2. [Architecture Générale](#architecture-générale)
3. [Analyse Backend (API)](#analyse-backend-api)
4. [Analyse Frontend (Main App)](#analyse-frontend-main-app)
5. [Analyse Expert Desk](#analyse-expert-desk)
6. [Infrastructure & Déploiement](#infrastructure--déploiement)
7. [Intégrations Tierces](#intégrations-tierces)
8. [Modèles de Données](#modèles-de-données)
9. [Sécurité & Performance](#sécurité--performance)
10. [Tests & Qualité](#tests--qualité)
11. [Problèmes Critiques Identifiés](#problèmes-critiques-identifiés)
12. [Recommandations Prioritaires](#recommandations-prioritaires)
13. [Roadmap Technique](#roadmap-technique)

---

## 🎯 EXECUTIVE SUMMARY

### Vue d'Ensemble
Oracle Lumira est une plateforme de services spirituels SaaS avec:
- **Architecture:** Monorepo (workspaces) + Microservices
- **Stack:** Node.js/Express + React/Vite + MongoDB + Nginx
- **Intégrations:** Stripe (paiements), AWS S3 (fichiers), N8N (automation)
- **Déploiement:** Docker + Coolify

### État Actuel
✅ **Forces:**
- Backend robuste avec validation multicouche
- Upload direct-to-S3 avec fallback multipart
- Structured logging implémenté (partiel)
- Tests E2E automatisés
- Gestion des PaymentIntents Stripe sécurisée

⚠️ **Risques Critiques:**
- Manque de logging global unifié
- Configuration environnement fragmentée (.env multiple)
- Modèles de données dupliqués (Order vs ProductOrder vs EnhancedOrder)
- Erreurs lint/accessibilité frontend non résolues
- Manque de monitoring et observabilité
- Gestion des uploads temporaires non automatisée

### Priorités Immédiates
1. **Unification des modèles Order** (technical debt majeure)
2. **Implémentation logging middleware global** (observabilité)
3. **Nettoyage automatique des uploads temporaires** (storage)
4. **Résolution erreurs accessibilité frontend** (qualité)
5. **Documentation API et flux critiques** (maintenabilité)

---

## 🏗️ ARCHITECTURE GÉNÉRALE

### Structure Monorepo
```
LumiraV1-MVP/
├── apps/
│   ├── main-app/          # Frontend principal (Vite + React)
│   ├── expert-desk/       # Bureau expert (Vite + React)
│   ├── api-backend/       # API Express + TypeScript
│   └── shared/            # Modules partagés
├── qa-tests/              # Tests E2E Playwright
├── docs/                  # Documentation (partielle)
├── nginx-*.conf           # Configurations reverse proxy
├── Dockerfile*            # Images Docker multiples
└── package.json           # Root workspace
```

### Workspaces NPM
- **Root:** `oracle-lumira` - Scripts d'orchestration
- **Apps:** 3 workspaces indépendants (main-app, expert-desk, shared)
- **Problème:** `api-backend` n'est PAS dans workspaces root → gestion deps fragmentée

### Technologies Stack

#### Backend
- **Runtime:** Node.js 18+ (compatible 20.18.1)
- **Framework:** Express 4.18.2
- **Database:** MongoDB (Mongoose 8.0.3)
- **Language:** TypeScript 5.3.3
- **Auth:** JWT (jsonwebtoken 9.0.2)
- **Storage:** AWS SDK S3 3.481.0
- **Payments:** Stripe 16.0.0
- **Logging:** Winston 3.11.0
- **Upload:** Multer 2.0.2

#### Frontend (main-app)
- **Build:** Vite 5.4.2
- **Framework:** React 18.3.1
- **Router:** React Router 7.8.2
- **UI:** Tailwind CSS 3.4.1
- **Animations:** Framer Motion 12.23.12
- **Icons:** Lucide React 0.344.0
- **Payments:** @stripe/react-stripe-js 4.0.0

#### Expert Desk
- **Build:** Vite 5.2.0
- **Framework:** React 18.2.0
- **Router:** React Router 6.26.2
- **UI:** Tailwind CSS 3.4.4 + @tailwindcss/forms
- **Notifications:** React Hot Toast 2.4.1
- **Animations:** Framer Motion 10.12.16

---

## 🔧 ANALYSE BACKEND (API)

### 📂 Structure Backend
```
apps/api-backend/src/
├── server.ts              # Point d'entrée, middleware setup
├── catalog.ts             # Catalogue produits (hardcoded)
├── config/                # Configurations
├── models/                # Schémas MongoDB (⚠️ 3 modèles Order!)
│   ├── Order.ts           # ✅ Modèle principal complet
│   ├── ProductOrder.ts    # ⚠️ Modèle simplifié (legacy)
│   ├── EnhancedOrder.ts   # ⚠️ Modèle expérimental
│   ├── User.ts            # Utilisateurs
│   ├── Expert.ts          # Experts desk
│   └── ProcessedEvent.ts  # Déduplication webhooks
├── routes/                # 11 fichiers routes
│   ├── orders.ts          # 🔥 1083 lignes - CRITIQUE
│   ├── stripe.ts          # Webhooks Stripe
│   ├── payments.ts        # PaymentIntents
│   ├── products.ts        # Gestion produits
│   ├── users.ts           # Auth & entitlements
│   ├── expert.ts          # API expert desk
│   ├── uploads.ts         # Presign S3
│   ├── health.ts          # Healthchecks
│   ├── ready.ts           # Readiness probe
│   ├── expert-test.ts     # Tests debug (dev only)
│   └── env-debug.ts       # Debug env vars
├── services/              # Logique métier
│   ├── stripe.ts          # Wrapper Stripe
│   └── s3.ts              # Service S3/MinIO
├── middleware/            # Middlewares custom
│   ├── auth.ts            # Auth JWT
│   ├── logging.ts         # 🆕 Structured logging
│   └── validation.ts      # Validation requests
├── types/                 # Types TypeScript
└── __tests__/             # Tests unitaires

dist/                      # Build TypeScript (gitignored)
```

### 🔑 Points Clés Backend

#### server.ts - Configuration
```typescript
// ✅ BIEN
- Helmet pour sécurité headers
- CORS configuré dynamiquement (env vars)
- Rate limiting adaptatif (500 req/15min)
- Webhook routes AVANT body parsing (✅ correct)
- Body parsing conditionnel (client-submit)
- Healthcheck /api/healthz pour Coolify

// ⚠️ PROBLÈMES
- Pas de requestId middleware global
- Pas de HTTP logging middleware global
- Pas de error logging middleware global
- Logger Winston pas exporté/réutilisé
```

#### Routes Critiques

##### 1. `/api/orders/by-payment-intent/:id/client-submit` (orders.ts:141)
**Fonction:** Soumission finale du formulaire Sanctuaire avec photos

**Flow:**
1. Accepte JSON (`{formData, uploadedKeys}`) OU multipart/form-data
2. Multer diskStorage (1GB/file, 2 files max) → `/tmp/lumira-uploads`
3. Validation magic numbers (JPEG/PNG/WEBP/GIF) + permissive (HEIC/HEIF/BMP/TIFF)
4. Parse formData (enrichissement avec user email/firstName/lastName)
5. Upload vers S3 via `uploadStream`
6. Save Order avec formData enrichi + URLs S3
7. Structured logging à chaque étape

**Problèmes:**
- ❌ Pas de nettoyage automatique des fichiers temp (`TEMP_DIR`)
- ⚠️ Validation permissive sur formats rares (risque sécurité)
- ⚠️ Logs structurés uniquement ici, pas global
- ⚠️ Pas de retry/resume pour uploads S3 échoués

##### 2. `/api/uploads/presign` (uploads.ts)
**Fonction:** Génération presigned URL pour upload direct S3

**Flow:**
1. Client demande presigned URL (type: face_photo/palm_photo)
2. Génère clé S3 unique avec UUID + timestamp
3. Retourne `{uploadUrl, publicUrl, key, expiresIn: 900s}`
4. Client PUT directement vers S3 (bypass API)

**Bien:**
- ✅ Évite transit via API (performances)
- ✅ Expiration 15min (sécurité)
- ✅ Support MinIO (S3_FORCE_PATH_STYLE)

**Problèmes:**
- ⚠️ Pas de validation contentType côté client
- ⚠️ Pas de cleanup objets S3 orphelins (presign expiré non utilisé)

##### 3. `/api/stripe/webhook` & `/api/payments/webhook`
**Fonction:** Webhooks Stripe pour synchronisation paiements

**Problèmes:**
- ⚠️ 2 endpoints différents (redondance?)
- ⚠️ Pas de structured logging
- ⚠️ Utilise ProcessedEvent pour déduplication mais pas de TTL MongoDB

##### 4. `/api/expert/*` (expert.ts)
**Fonction:** API bureau expert (auth, orders queue, process)

**Flow:**
- Auth JWT via middleware `authenticateExpert`
- CRUD commandes (get, update, validate)
- Intégration N8N pour génération contenu IA

**Problèmes:**
- ⚠️ N8N webhook non vérifié (HMAC?)
- ⚠️ Pas de rate limiting spécifique expert

### 📦 Services

#### S3Service (services/s3.ts)
```typescript
// Configuration
- Support AWS S3 + MinIO (S3_ENDPOINT)
- Mock mode (S3_MOCK_MODE=true pour tests)
- Fallback credentials (AWS_ACCESS_KEY_ID || LUMIRA_ACCESS_KEY)

// Méthodes
✅ uploadFile(buffer, name, type) - Upload multipart
✅ uploadStream(stream, name, type) - Stream upload (⭐ utilisé)
✅ getPresignedUrl(key, expiresIn) - Presign download
✅ generatePresignedUploadUrl(key, contentType) - Presign upload
✅ deleteFile(key) - Suppression
✅ getPublicUrl(key) - URL publique (non-signé)

// Problèmes
⚠️ getPublicUrl assume bucket public (non vérifié)
⚠️ Pas de retry automatique sur erreurs S3
⚠️ Logs console.error pas structurés
```

#### StripeService (services/stripe.ts)
```typescript
// Méthodes
✅ createPaymentIntent(request) - Création PI avec metadata
✅ getPaymentIntent(id) - Récupération PI
✅ constructWebhookEvent(body, sig, secret) - Validation webhook
✅ handlePaymentSuccess(pi) - Création Order

// Problèmes
⚠️ grantProductAccess() est un TODO stub
⚠️ Pas de gestion des refunds/cancellations
⚠️ Logs console pas structurés
```

### 🗄️ Modèles de Données

#### ⚠️ PROBLÈME MAJEUR: 3 Modèles Order Différents

##### 1. Order.ts (PRINCIPAL)
```typescript
interface IOrder {
  orderNumber: string          // LUM-timestamp
  userId: ObjectId             // ref User
  userEmail: string
  level: 1|2|3|4
  levelName: 'Simple'|'Intuitive'|'Alchimique'|'Intégrale'
  amount: number               // centimes
  currency: string
  status: 'pending'|'paid'|'processing'|'awaiting_validation'|'completed'|'failed'|'refunded'
  paymentIntentId: string
  formData: {                  // 🔥 Champs identity requis par schema
    firstName: string
    lastName: string
    email: string
    phone?: string
    dateOfBirth?: Date
    specificQuestion?: string
    preferences: { audioVoice, deliveryFormat }
  }
  clientInputs?: {             // Multi-step form
    birthTime, birthPlace, specificContext
  }
  files?: Array<{              // S3 uploads
    url, key, type, size, uploadedAt
  }>
  generatedContent?: {         // Contenu IA
    archetype, reading, audioUrl, pdfUrl, mandalaSvg, ritual
  }
  expertReview?: {...}         // Validation expert
  expertValidation?: {...}     // Double validation
  revisionCount: number
  paidAt?: Date
  deliveredAt?: Date
}
```

##### 2. ProductOrder.ts (LEGACY)
```typescript
interface IProductOrder {
  productId: string            // initie|mystique|profond|integrale
  customerId?: string
  customerEmail?: string
  amount: number
  currency: string
  status: 'pending'|'processing'|'completed'|'failed'|'cancelled'
  paymentIntentId: string      // unique
  completedAt?: Date
  metadata?: Record<string, any>
}
```

##### 3. EnhancedOrder.ts (EXPÉRIMENTAL)
```typescript
interface IOrder {
  orderNumber: string
  userId?: ObjectId            // ⚠️ Optional (guest orders?)
  userEmail: string
  service: 'basic'|'premium'|'vip'
  level: 1|2|3|4
  expertId?: ObjectId
  duration: number             // minutes
  status: 'pending'|'confirmed'|'paid'|'processing'|'completed'|'failed'|'refunded'|'cancelled'
  paymentStatus: 'pending'|'completed'|'failed'|'refunded'
  stripePaymentIntentId?: string
  notifications: { sms, email, whatsapp }
  metadata: { source, referrer, userAgent, ipAddress }
  // ... + autres champs
}
```

#### 🚨 Conséquences
- ❌ Routes utilisent Order.ts MAIS ProductOrder.ts aussi (routes/products.ts, routes/users.ts)
- ❌ EnhancedOrder.ts jamais utilisé (dead code?)
- ❌ Migrations impossibles sans plan d'unification
- ❌ Queries fragmentées (find Order vs ProductOrder)
- ❌ Risque incohérence données

**📄 Document existant:** `docs/architecture/01-order-model-unification-plan.md`  
**Statut:** Plan écrit, PAS implémenté

#### User.ts (UTILISATEURS)
```typescript
interface IUser {
  email: string (unique)
  firstName: string
  lastName: string
  phone?: string
  dateOfBirth?: Date
  stripeCustomerId?: string (unique, sparse)
  dolibarrCustomerId?: number (unique, sparse)
  subscriptionStatus: 'active'|'inactive'|'trial'
  totalOrders: number
  lastOrderAt?: Date
}
```
✅ Modèle cohérent, indexes optimisés

#### Expert.ts (EXPERTS DESK)
```typescript
interface IExpert {
  email: string (unique)
  password: string (hashed bcrypt)
  name: string
  role: 'expert'|'admin'
  isActive: boolean
  lastLogin?: Date
}
```
✅ Auth bcrypt, pre-save hook hash password

### 🔒 Sécurité Backend

#### ✅ Bien Implémenté
- Helmet avec CSP
- CORS dynamique (env vars)
- Rate limiting adaptatif (IP-based, x-forwarded-for)
- Multer validation multicouche (mimetype + extension + magic numbers)
- JWT auth pour experts
- Stripe webhook signature verification
- Mongoose validation stricte
- Password hashing bcrypt (experts)

#### ⚠️ Problèmes
- ❌ JWT_SECRET en dev = "dev-secret-key..." (FAIBLE)
- ❌ N8N webhook pas vérifié (HMAC missing)
- ⚠️ Validation permissive formats images rares (HEIC/HEIF/BMP/TIFF)
- ⚠️ Pas de sanitization HTML/XSS sur formData
- ⚠️ Pas de protection CSRF (API stateless mais uploads?)
- ⚠️ Logs contiennent emails/noms (GDPR?)

### 📊 Performance Backend

#### ✅ Bonnes Pratiques
- MongoDB autoIndex disabled en production
- Indexes optimisés (Order: paymentIntentId, status, userEmail)
- Multer diskStorage (pas de RAM pour uploads)
- Stream uploads S3 (uploadStream)
- Body parsing limits raisonnables (25MB JSON, 1GB multipart)

#### ⚠️ Problèmes
- ❌ Pas de pagination sur GET /api/orders (risque OOM si 10k+ orders)
- ⚠️ Pas de caching (Redis?) pour queries fréquentes
- ⚠️ Logs Winston en mode `info` (verbose en prod?)
- ⚠️ Pas de connection pooling MongoDB explicite

---

## 🎨 ANALYSE FRONTEND (MAIN APP)

### 📂 Structure Frontend
```
apps/main-app/src/
├── main.tsx                 # Entry point
├── App.tsx                  # Root component
├── router.tsx               # React Router config
├── index.css                # Tailwind base
├── components/
│   ├── HeroRefonte.tsx      # Landing hero ⚠️ 4 erreurs lint
│   ├── sanctuaire/          # 🔥 Flux onboarding critique
│   │   ├── OnboardingForm.tsx      # Multi-step form + S3 upload
│   │   ├── SanctuaireWelcomeForm.tsx  # ⚠️ 6 erreurs accessibilité
│   │   ├── PhotoUpload.tsx
│   │   └── ...
│   ├── checkout/            # Checkout Stripe
│   │   ├── FloatingInput.tsx  # ⚠️ 1 erreur ARIA
│   │   └── ...
│   ├── spheres/             # Modules lazy-loaded
│   ├── ui/                  # Composants réutilisables
│   └── ...
├── pages/                   # Routes pages
│   ├── LandingTempleRefonte.tsx
│   ├── SanctuairePage.tsx
│   ├── SanctuaireUnified.tsx
│   ├── CommandeTempleSPA.tsx
│   ├── ConfirmationTempleSPA.tsx
│   └── ...
├── contexts/
│   └── SanctuaireContext.tsx  # State management onboarding
├── services/
│   └── api.ts               # Axios wrapper API calls
├── hooks/                   # Custom hooks
├── utils/                   # Helpers
└── __tests__/               # Tests (Vitest)
```

### 🚀 Routes Frontend

#### Routing (router.tsx)
```tsx
/ → LandingTempleRefonte (landing page refonte 2025)
/commande → CommandeTempleSPA (checkout Stripe)
/confirmation → ConfirmationTempleSPA (confirmation paiement)
/payment-success → PaymentSuccessRedirect (redirect après Stripe)
/sanctuaire/* → Sanctuaire (espace client)
  /sanctuaire/path → SpiritualPath (lazy)
  /sanctuaire/draws → RawDraws (lazy)
  /sanctuaire/lectures → MesLectures (lazy)
  /sanctuaire/synthesis → Synthesis (lazy)
  /sanctuaire/conversations → Conversations (lazy)
  /sanctuaire/profile → Profile (lazy)
/sanctuaire-unified → SanctuaireUnified (nouveau flux)
/login-sanctuaire → LoginSanctuaire (auth legacy)
/login-sanctuaire-simple → LoginSanctuaireSimple (auth simple)
/upload-sanctuaire → SanctuairePage (upload photos)
/mentions-legales → MentionsLegales
/expert-desk → ExpertDeskPage (desk expert dans main-app?)
```

**⚠️ Problèmes:**
- Routage complexe avec chemins legacy + refonte (confusion)
- `/expert-desk` dans main-app (devrait être app séparée)
- Pas de code splitting manuel (Vite auto?)
- Lazy loading uniquement sur composants spheres

### 🔥 Composant Critique: OnboardingForm.tsx

**Fonction:** Formulaire multi-étapes Sanctuaire avec upload photos

**Flow Upload:**
1. User sélectionne 2 photos (face + palm)
2. **Compression** avec `compressImage()` si > threshold
3. **Upload Primary Path:**
   - POST `/api/uploads/presign` → obtenir presigned URL
   - PUT direct vers S3 (uploadUrl)
   - Stocke `facePhotoKey` et `palmPhotoKey`
4. **Upload Fallback Path:**
   - Si CORS/S3 échoue → POST multipart vers API
   - FormData avec facePhoto + palmPhoto
5. **Submit Final:**
   - Si keys existent → POST JSON `{formData, uploadedKeys}` vers `/api/orders/.../client-submit`
   - Sinon → POST FormData vers `/api/orders/.../client-submit`

**Code:**
```typescript
// Compression intelligente
const compressImage = async (file: File, maxSizeMB = 2): Promise<File> => {
  if (file.size <= maxSizeMB * 1024 * 1024) return file;
  // Compression canvas avec qualité adaptative (0.85 → 0.7 → 0.5)
  // Redimensionne si > 1920px
}

// Upload S3 direct
const uploadToS3 = async (file: File, type: 'face_photo'|'palm_photo') => {
  const presign = await api.post('/api/uploads/presign', { type, contentType: file.type });
  await fetch(presign.uploadUrl, { method: 'PUT', body: file, headers: { 'Content-Type': file.type }});
  return presign.key;
}

// Submit final
const handleSubmit = async () => {
  if (facePhotoKey && palmPhotoKey) {
    // Path JSON (keys-only)
    await api.post(`/api/orders/by-payment-intent/${piId}/client-submit`, {
      formData: { ...formState },
      uploadedKeys: { facePhotoKey, palmPhotoKey }
    });
  } else {
    // Path multipart (fallback)
    const fd = new FormData();
    fd.append('formData', JSON.stringify(formState));
    fd.append('facePhoto', facePhoto!);
    fd.append('palmPhoto', palmPhoto!);
    await api.post(`/api/orders/by-payment-intent/${piId}/client-submit`, fd);
  }
}
```

**✅ Bien:**
- Compression intelligente (évite 413 errors)
- Fallback robuste si S3 échoue
- Progress visual (partiellement)

**⚠️ Problèmes:**
- Pas de retry automatique si S3 PUT échoue
- Pas de progress bar détaillé (demandé dans rapport)
- Pas de validation client-side de magic numbers
- Code dupliqué compression (devrait être dans utils/)

### 🎨 UI/UX Issues

#### Erreurs Lint Détectées (get_errors)

**HeroRefonte.tsx (4 erreurs):**
```tsx
// ❌ Inline styles (animationDelay) → devrait être CSS/Tailwind
<div style={{animationDelay: '1s'}}></div>  // Line 70, 71, 72

// ❌ Lien sans texte discernable
<a href="#levels" className="...">  // Line 191
  {/* Pas de children/aria-label */}
</a>
```

**SanctuaireWelcomeForm.tsx (6 erreurs):**
```tsx
// ❌ Inputs sans labels accessibles
<input type="text" />  // Lines 333, 352, 373, 393
// Manque: <label>, title, placeholder, aria-label
```

**FloatingInput.tsx (1 erreur):**
```tsx
// ❌ ARIA attribute invalide
aria-invalid="{expression}"  // Line 31
// Devrait être: aria-invalid={String(invalid)}
```

**Impact:**
- Accessibilité (WCAG 2.1) non respectée
- SEO dégradé (liens sans texte)
- Maintenance difficile (inline styles)

### 🔧 Configuration Vite

**vite.config.ts:**
```typescript
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: { '/api': { target: 'http://localhost:3000' } }
  },
  optimizeDeps: { exclude: ['lucide-react'] }
})
```

**⚠️ Manquant:**
- Pas de build optimizations (rollupOptions)
- Pas de code splitting manuel
- Pas de compression (vite-plugin-compression)
- Pas de PWA config (offline support?)

### 📦 Dépendances Frontend

**Production:**
- React 18.3.1 ✅
- React Router 7.8.2 ✅ (version récente)
- Framer Motion 12.23.12 ✅
- @stripe/react-stripe-js 4.0.0 ✅
- Axios 1.6.2 ⚠️ (version ancienne, dernière = 1.7.x)
- Lucide React 0.344.0 ⚠️ (version ancienne)

**Problèmes:**
- Axios 1.6.2 a des CVE connues (upgrade recommandé)
- Versions mineures outdated (npm audit?)

---

## 🖥️ ANALYSE EXPERT DESK

### 📂 Structure Expert Desk
```
apps/expert-desk/src/
├── main.tsx
├── App.tsx
├── components/
│   ├── OrdersQueue.tsx      # File d'attente commandes
│   ├── OrderDetail.tsx      # Détail commande
│   ├── ProcessOrder.tsx     # Traitement commande
│   └── ...
├── contexts/
│   └── AuthContext.tsx      # Auth expert JWT
├── services/
│   └── api.ts               # API calls backend
├── types/
│   └── Order.ts             # Types Order (dupliqué du backend!)
└── pages/
    ├── Login.tsx
    ├── Dashboard.tsx
    └── ...
```

### 🔑 Fonctionnalités

**Auth Expert:**
- Login JWT → stockage localStorage
- Middleware axios avec Bearer token
- Route protection via AuthContext

**Queue Commandes:**
- Liste orders status: 'pending', 'paid', 'processing'
- Filtres: level, status
- Tri: date création DESC

**Traitement:**
- Formulaire expert prompt + instructions
- POST `/api/expert/process-order` → N8N trigger
- Update status → 'processing'

**⚠️ Problèmes:**
- ❌ Types Order.ts dupliqués (pas partagé avec backend)
- ⚠️ Pas de real-time updates (polling manual?)
- ⚠️ Pas de gestion optimistic UI
- ⚠️ Auth JWT en localStorage (risque XSS)

### 📦 Dépendances Expert Desk

**Production:**
- React 18.2.0 (vs 18.3.1 main-app) ⚠️ Incohérence
- React Router 6.26.2 (vs 7.8.2 main-app) ⚠️ Versions différentes
- Framer Motion 10.12.16 (vs 12.23.12 main-app) ⚠️
- Axios 1.6.0 (vs 1.6.2 main-app) ⚠️

**Problème:**
- ❌ Versions désynchronisées entre apps
- Risque incompatibilités lors de mise à jour shared components

---

## 🐳 INFRASTRUCTURE & DÉPLOIEMENT

### Docker

**Dockerfile (Root - Frontend Only):**
```dockerfile
# Stage 1: Build frontend
FROM node:20.18.1-alpine AS builder
ARG VITE_STRIPE_PUBLISHABLE_KEY
ARG VITE_API_BASE_URL
ARG VITE_APP_DOMAIN
# Build apps/main-app

# Stage 2: Nginx serve
FROM nginx:1.27-alpine
COPY dist /usr/share/nginx/html
COPY nginx-frontend.conf /etc/nginx/nginx.conf
HEALTHCHECK curl http://localhost/health.json
```

**✅ Bien:**
- Multi-stage (optimise taille image)
- Build-args pour env vars Vite
- Healthcheck intégré
- Nginx officiel Alpine (léger)

**⚠️ Problèmes:**
- Pas de Dockerfile pour API backend (manquant?)
- Pas de docker-compose.yml dans root (développement?)
- Frontend et API déployés séparément (orchestration manuelle?)

### Nginx Configuration

**nginx-fullstack.conf (Reverse Proxy):**
```nginx
http {
  client_max_body_size 1024M;  # ✅ 1GB uploads
  
  server {
    listen 8080;
    root /usr/share/nginx/html;
    
    location /api/ {
      proxy_pass http://127.0.0.1:3000;
      proxy_set_header X-Real-IP $remote_addr;
      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
      client_max_body_size 1024M;  # ✅ Dupliqué ici aussi
    }
    
    location / {
      try_files $uri /index.html;  # SPA fallback
    }
  }
}
```

**✅ Bien:**
- client_max_body_size aligné (1GB)
- Headers X-Forwarded-* pour rate limiting
- SPA fallback

**⚠️ Problèmes:**
- Pas de compression gzip/brotli
- Pas de cache headers (immutable assets)
- Pas de security headers (HSTS, X-Frame-Options)
- Proxy timeout defaults (30s, suffisant pour uploads 1GB?)

**nginx-frontend.conf (SPA Host):**
```nginx
# Minimal config pour apps/main-app/Dockerfile
# ⚠️ Pas client_max_body_size ici (app frontend pure)
```

### Variables d'Environnement

**⚠️ PROBLÈME: Configuration Fragmentée**

**Root .env:**
```env
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:5173
API_BASE_URL=http://localhost:3000/api
JWT_SECRET=dev-secret-key...  # ⚠️ FAIBLE
MONGODB_URI=mongodb://localhost:27017/lumira-dev
STRIPE_SECRET_KEY=sk_test_...
AWS_S3_BUCKET=oracle-lumira-files
AWS_ACCESS_KEY_ID=REPLACE...  # ⚠️ Placeholder
AWS_SECRET_ACCESS_KEY=REPLACE...
AWS_REGION=eu-west-3
N8N_WEBHOOK_URL=https://...
```

**apps/api-backend/.env:**
```env
NODE_ENV=production  # ⚠️ Différent du root!
PORT=3001  # ⚠️ Différent du root!
MONGODB_URI=mongodb://lumira_root:pass@host:27017/lumira?authSource=admin
JWT_SECRET=a8f5e2c7b9d4e6f1...  # ⚠️ Différent du root!
STRIPE_SECRET_KEY=sk_test_...  # Identique
N8N_WEBHOOK_URL=https://n8automate.ialexia.fr/webhook/...
```

**🚨 Conséquences:**
- ❌ Incohérence NODE_ENV (dev vs prod)
- ❌ Deux JWT_SECRET différents (invalidation tokens?)
- ❌ Ports différents (3000 vs 3001)
- ⚠️ Gestion secrets non centralisée (Coolify?)
- ⚠️ Pas de .env.example à jour

**📄 Fichiers .env.example:**
- Root: `.env.example` (complet, outdated)
- Backend: `apps/api-backend/.env.example` (production template)
- Frontend: `apps/main-app/.env.example` (Vite vars)

### Déploiement Coolify

**Documents trouvés:**
- `COOLIFY-DEPLOYMENT-GUIDE.md`
- `COOLIFY-DEPLOYMENT-RUNBOOK.md`
- `COOLIFY-DOCKER-COMPOSE-GUIDE.md`
- `DEPLOYMENT-RUNBOOK-FINAL.md`
- `DEPLOYMENT-STATUS-REPORT.md`

**Statut:** Guides présents mais fragmentés

**⚠️ Problèmes:**
- Pas de .coolify.yaml config file
- Multiples guides (confusion)
- Healthcheck endpoints documentés mais pas standardisés

### Scripts Déploiement

**Root package.json:**
```json
{
  "scripts": {
    "dev": "concurrently \"cd apps/api-backend && npm run dev\" \"cd apps/main-app && npm run dev\"",
    "build": "cd apps/main-app && npm run build",
    "build:all": "npm run build:main && npm run build:desk",
    "docker:build": "docker build -f apps/main-app/Dockerfile -t oracle-main .",
    "docker:run": "docker run -p 3000:80 oracle-main"
  }
}
```

**⚠️ Manquant:**
- Pas de script build backend (`cd apps/api-backend && npm run build`)
- Pas de script docker:build:api
- Pas de docker-compose up/down
- Pas de pre-deploy validation script

---

## 🔗 INTÉGRATIONS TIERCES

### Stripe

**Configuration:**
- Version SDK: 16.0.0 (backend), @stripe/stripe-js 7.9.0 (frontend)
- Mode: Test keys (sk_test_...)
- Webhook secret: whsec_... (dev mock)

**Flux PaymentIntent:**
1. Frontend POST `/api/payments/create-payment-intent` → {clientSecret, piId}
2. @stripe/react-stripe-js Elements → confirmPayment
3. Stripe webhook → POST `/api/stripe/webhook` or `/api/payments/webhook`
4. Backend: constructWebhookEvent → signature verification
5. Handle `payment_intent.succeeded` → Create/Update Order

**✅ Bien:**
- Webhook signature verification
- Idempotency keys (buildStripeOptions)
- Metadata enrichi (productId, level, customerEmail)
- Deduplication avec ProcessedEvent model

**⚠️ Problèmes:**
- ❌ 2 webhooks endpoints (stripe.ts ET payments.ts) - redondant?
- ⚠️ ProcessedEvent sans TTL index (accumulation infinie)
- ⚠️ Refunds/cancellations pas gérés
- ⚠️ Pas de retry automatique si webhook processing échoue

### AWS S3

**Configuration:**
```typescript
AWS_ACCESS_KEY_ID = REPLACE...  // ⚠️ Non configuré
AWS_SECRET_ACCESS_KEY = REPLACE...
AWS_REGION = eu-west-3
AWS_S3_BUCKET_NAME = oracle-lumira-files
S3_ENDPOINT = optional (MinIO)
S3_FORCE_PATH_STYLE = true (MinIO)
S3_MOCK_MODE = true (tests)
```

**Usage:**
- Presigned URLs (upload/download)
- Stream uploads (uploadStream)
- Public URLs generation

**✅ Bien:**
- Support MinIO (S3-compatible)
- Mock mode pour tests
- Stream uploads (performances)

**⚠️ Problèmes:**
- ❌ Credentials REPLACE... (non configurés localement?)
- ⚠️ CORS S3 bucket non vérifié (nécessaire pour presigned upload)
- ⚠️ Pas de lifecycle policy (cleanup old objects)
- ⚠️ Pas de CDN CloudFront (latence?)

**CORS Policy Required:**
```json
{
  "AllowedOrigins": ["https://oraclelumira.com", "http://localhost:5173"],
  "AllowedMethods": ["GET", "PUT", "HEAD"],
  "AllowedHeaders": ["*"],
  "ExposeHeaders": ["ETag"],
  "MaxAgeSeconds": 3000
}
```

### MongoDB

**Configuration:**
```env
MONGODB_URI = mongodb://lumira_root:Lumira2025L@host:27017/lumira?authSource=admin&directConnection=true
```

**Features:**
- Mongoose 8.0.3
- Indexes optimisés (status, email, paymentIntentId)
- autoIndex disabled en production
- Connection retry automatique (Mongoose default)

**✅ Bien:**
- Auth admin (secure)
- Indexes performance-critical
- autoIndex disabled prod

**⚠️ Problèmes:**
- ⚠️ Password hardcoded (devrait être secret Coolify)
- ⚠️ directConnection=true (pas de replica set?)
- ⚠️ Pas de monitoring connexions (poolSize?)
- ⚠️ Pas de backup strategy documenté

### N8N (Automation)

**Configuration:**
```env
N8N_WEBHOOK_URL = https://n8automate.ialexia.fr/webhook/10e13491-...
N8N_TOKEN = (absent?)
```

**Usage:**
- Expert desk → POST ordre vers N8N
- N8N génère contenu IA (archetype, lecture, audio, PDF, mandala)
- Callback → POST `/api/expert/n8n-callback` → Update Order

**⚠️ Problèmes:**
- ❌ Pas de token auth (URL secret seulement)
- ❌ Callback pas vérifié (HMAC missing)
- ⚠️ Pas de retry si N8N down
- ⚠️ Timeout long processing (minutes?) pas géré côté frontend

---

## 📊 TESTS & QUALITÉ

### Tests E2E (Playwright)

**Fichiers:**
- `qa-tests/white-glove-e2e.cjs` (156 lines)
- `qa-tests/initie-backend-e2e.cjs`
- `qa-tests/stripe-webhook-qa.cjs`

**Coverage:**
- ✅ Mock Stripe (STRIPE_MOCK_MODE)
- ✅ Mock S3 (S3_MOCK_MODE)
- ✅ In-memory MongoDB (mongodb-memory-server)
- ✅ Test upload multipart + validation formData identity fields
- ✅ Assertions JSON artifacts (upload-valid-formdata-check.json)

**⚠️ Gaps:**
- Pas de tests direct-to-S3 presigned upload
- Pas de tests error cases (413, 500, validation errors)
- Pas de tests frontend E2E (UI flows)
- Pas de tests performance/load

### Tests Unitaires

**Backend:**
- Framework: Jest (ts-jest)
- Files: `apps/api-backend/src/__tests__/ready.test.ts`
- Config: Jest config dans package.json

**Frontend:**
- Framework: Vitest 3.2.4
- Files: `apps/main-app/src/__tests__/` (présent mais vide?)

**⚠️ Coverage:**
- ❌ Très faible (< 10%?)
- ❌ Pas de tests services (S3Service, StripeService)
- ❌ Pas de tests models (Order, User)
- ❌ Pas de tests middlewares
- ❌ Frontend: 0 tests components

### Linting

**Backend:**
- TypeScript strict mode ✅
- ESLint: absent dans tsconfig.json
- Prettier: absent

**Frontend:**
- ESLint configured ✅
- Erreurs détectées: 11 (4 HeroRefonte + 6 SanctuaireWelcome + 1 FloatingInput)

**⚠️ Problèmes:**
- ❌ Erreurs accessibilité non bloquantes (pas de pre-commit hook)
- ⚠️ Pas de prettier config (formatting inconsistency)
- ⚠️ Pas de husky pre-commit (quality gate)

### Documentation

**Présent:**
- ✅ README.md (root)
- ✅ Multiple guides déploiement (fragmentés)
- ✅ `docs/architecture/01-order-model-unification-plan.md`
- ✅ Multiples rapports audit (AUDIT-*.md, RAPPORT-*.md)

**⚠️ Manquant:**
- ❌ API documentation (OpenAPI/Swagger?)
- ❌ Architecture diagrams (C4, sequence diagrams)
- ❌ Database schema documentation
- ❌ Onboarding guide développeurs
- ❌ Troubleshooting runbook

---

## 🚨 PROBLÈMES CRITIQUES IDENTIFIÉS

### 🔴 P0 - Bloquants Production

#### 1. Modèles Order Dupliqués (Technical Debt Majeure)
**Impact:** ⚠️⚠️⚠️⚠️⚠️ CRITIQUE
- 3 modèles différents (Order, ProductOrder, EnhancedOrder)
- Routes utilisent Order ET ProductOrder inconsistentement
- Migrations impossibles
- Risque perte données / incohérences

**Solution:**
- Implémenter `docs/architecture/01-order-model-unification-plan.md`
- Migration MongoDB guidée
- Tests migration avec backup

**Effort:** 5 jours (1 dev senior)

#### 2. Variables Environnement Fragmentées
**Impact:** ⚠️⚠️⚠️⚠️ MAJEUR
- JWT_SECRET différent root vs backend
- NODE_ENV incohérent
- Secrets hardcodés (MongoDB password)

**Solution:**
- Centraliser .env dans root OU apps/api-backend
- Utiliser Coolify secrets
- Générer JWT_SECRET fort (crypto.randomBytes(64))
- Validator env vars au startup (envalid package)

**Effort:** 1 jour

#### 3. Uploads Temporaires Non Nettoyés
**Impact:** ⚠️⚠️⚠️ IMPORTANT
- UPLOAD_TMP_DIR accumulation (disk full)
- Pas de cron cleanup

**Solution:**
- Cron job daily cleanup fichiers > 24h
- Monitoring disk usage
- Alert si > 80%

**Effort:** 0.5 jour

### 🟠 P1 - Urgents

#### 4. Logging Non Unifié
**Impact:** ⚠️⚠️⚠️ IMPORTANT
- Structured logging uniquement client-submit
- Reste des routes: console.log/error
- Pas de requestId global

**Solution:**
- Wire `requestIdMiddleware`, `httpLoggerMiddleware`, `errorLoggerMiddleware` dans server.ts
- Exporter winston logger instance
- Remplacer tous console.* par structuredLogger

**Effort:** 2 jours

#### 5. Sécurité N8N Callback
**Impact:** ⚠️⚠️⚠️ IMPORTANT
- Callback pas vérifié (HMAC missing)
- N'importe qui peut POST

**Solution:**
- Implémenter HMAC verification (shared secret)
- Ou token auth header
- Reject unauthorized requests

**Effort:** 0.5 jour

#### 6. Erreurs Accessibilité Frontend
**Impact:** ⚠️⚠️ MOYEN
- 11 erreurs lint (WCAG violations)
- SEO impacté

**Solution:**
- Fix inline styles (Tailwind classes)
- Ajouter labels accessibles
- Fix ARIA attributes
- Pre-commit hook ESLint

**Effort:** 1 jour

### 🟡 P2 - Améliorations

#### 7. Dépendances Outdated
- Axios 1.6.2 (CVE?)
- React versions désynchronisées apps
- Lucide React outdated

**Solution:** `npm audit fix` + upgrade majors

#### 8. Tests Coverage Faible
**Solution:** Ajouter tests unitaires services/models (target 70%)

#### 9. Pas de Monitoring/Observability
**Solution:** Implémenter Prometheus metrics + Grafana dashboards

#### 10. Documentation API Manquante
**Solution:** Ajouter OpenAPI spec + Swagger UI

---

## 📈 RECOMMANDATIONS PRIORITAIRES

### Phase 1 - Stabilisation (Semaine 1-2)

#### Action 1: Unification Modèles Order
**Priorité:** 🔴 P0  
**Effort:** 5 jours  
**Owner:** Senior Backend Dev

**Steps:**
1. Review plan unification (`docs/architecture/01-order-model-unification-plan.md`)
2. Créer UnifiedOrder.ts (fusion Order + ProductOrder)
3. Migration script MongoDB
   - Backup production DB
   - Test migration sur staging
   - Rollback plan
4. Update routes (orders.ts, products.ts, users.ts)
5. Deprecate ProductOrder.ts, EnhancedOrder.ts
6. Tests E2E complets

#### Action 2: Centraliser Configuration Env
**Priorité:** 🔴 P0  
**Effort:** 1 jour  
**Owner:** DevOps

**Steps:**
1. Choisir source vérité: `apps/api-backend/.env` (recommandé)
2. Supprimer root `.env` ou le rendre doc-only
3. Générer JWT_SECRET fort (`openssl rand -hex 64`)
4. Externaliser secrets dans Coolify
5. Ajouter validation env vars (package `envalid`)
6. Update documentation

#### Action 3: Implémenter Cleanup Uploads Temp
**Priorité:** 🔴 P0  
**Effort:** 0.5 jour  
**Owner:** Backend Dev

**Steps:**
1. Créer service `CleanupService.ts`
2. Cron job (node-cron) daily 3AM
3. Delete files > 24h dans UPLOAD_TMP_DIR
4. Logging cleanup stats
5. Alert Slack si > 1000 files

### Phase 2 - Observabilité (Semaine 3)

#### Action 4: Logging Global Structuré
**Priorité:** 🟠 P1  
**Effort:** 2 jours

**Steps:**
1. Wire middlewares logging dans server.ts:
   ```typescript
   app.use(requestIdMiddleware);
   app.use(httpLoggerMiddleware);
   // ... routes
   app.use(errorLoggerMiddleware);
   ```
2. Remplacer console.* par structuredLogger.*
3. Configuration Winston:
   - Console transport (JSON format)
   - File transport (erreurs uniquement)
   - Rotation logs (winston-daily-rotate-file)
4. Tests logs correlation (requestId)

#### Action 5: Sécuriser N8N Callback
**Priorité:** 🟠 P1  
**Effort:** 0.5 jour

**Steps:**
1. Générer shared secret (crypto.randomBytes(32))
2. Configure N8N webhook HMAC
3. Middleware verification:
   ```typescript
   const verifyN8NSignature = (req, res, next) => {
     const sig = req.headers['x-n8n-signature'];
     const hash = crypto.createHmac('sha256', N8N_SECRET).update(req.body).digest('hex');
     if (sig !== hash) return res.status(401).json({error: 'Invalid signature'});
     next();
   };
   ```
4. Apply sur `/api/expert/n8n-callback`

#### Action 6: Fix Accessibilité Frontend
**Priorité:** 🟠 P1  
**Effort:** 1 jour

**Steps:**
1. HeroRefonte.tsx: Remplacer inline styles par CSS
2. SanctuaireWelcomeForm.tsx: Ajouter labels/aria-label
3. FloatingInput.tsx: Fix aria-invalid value
4. Pre-commit hook: `npx lint-staged`
5. CI: ESLint check bloquant

### Phase 3 - Performance & Qualité (Semaine 4-5)

#### Action 7: Upgrade Dépendances
**Priorité:** 🟡 P2  
**Effort:** 2 jours

**Steps:**
1. `npm audit` root + apps
2. Upgrade:
   - Axios → 1.7.x
   - Lucide React → latest
   - React versions → align 18.3.1
   - React Router → align 7.8.2
3. Tests regression
4. Update package-lock.json

#### Action 8: Augmenter Tests Coverage
**Priorité:** 🟡 P2  
**Effort:** 5 jours

**Steps:**
1. Backend unit tests (target 70%):
   - S3Service: mock AWS SDK
   - StripeService: mock Stripe client
   - Models: validation tests
   - Middlewares: auth, validation
2. Frontend component tests (target 50%):
   - OnboardingForm.tsx
   - PhotoUpload.tsx
   - CheckoutForm.tsx
3. E2E complets (Playwright):
   - User journey: landing → checkout → payment → sanctuaire
   - Expert journey: login → queue → process order

#### Action 9: Monitoring & Alerting
**Priorité:** 🟡 P2  
**Effort:** 3 jours

**Steps:**
1. Prometheus metrics:
   - HTTP requests (counter, histogram)
   - Order creation (counter)
   - S3 uploads (counter, duration)
   - MongoDB queries (duration)
2. Grafana dashboards:
   - Requests/sec, latency p95/p99
   - Error rate
   - Upload success rate
   - Queue depth (orders pending)
3. Alerts:
   - Error rate > 5%
   - p95 latency > 2s
   - Disk usage > 80%

---

## 🗺️ ROADMAP TECHNIQUE

### Q1 2025 (Janvier-Mars)

**Objectifs:** Stabilisation, Dette Technique

- ✅ Unification modèles Order (5j)
- ✅ Configuration env centralisée (1j)
- ✅ Cleanup uploads temp (0.5j)
- ✅ Logging structuré global (2j)
- ✅ Sécurité N8N callback (0.5j)
- ✅ Fix accessibilité (1j)
- ✅ Upgrade dépendances (2j)
- ⏳ Documentation API OpenAPI (3j)
- ⏳ Tests coverage → 70% backend (5j)

**Total:** 20 jours-dev

### Q2 2025 (Avril-Juin)

**Objectifs:** Performance, Scalabilité

- Monitoring Prometheus + Grafana (3j)
- Caching Redis (orders, products) (4j)
- Pagination API routes (2j)
- Code splitting frontend (2j)
- CDN CloudFront S3 (2j)
- Database replica set MongoDB (3j)
- Load testing (k6) (2j)

**Total:** 18 jours-dev

### Q3 2025 (Juillet-Septembre)

**Objectifs:** Features, Optimisation

- Upload progress + retry frontend (3j)
- Real-time expert desk (WebSockets) (5j)
- PWA support (offline) (4j)
- Automated backups (2j)
- CI/CD pipeline (GitHub Actions) (3j)

**Total:** 17 jours-dev

---

## 📝 ANNEXES

### A. Commandes Utiles

#### Développement Local
```bash
# Install dependencies
npm install  # root
cd apps/main-app && npm install
cd apps/api-backend && npm install
cd apps/expert-desk && npm install

# Dev servers
npm run dev  # concurrent API + main-app
npm run dev:desk  # expert-desk

# Build
npm run build:all  # main-app + expert-desk
cd apps/api-backend && npm run build  # backend

# Tests
npm run test:e2e  # Playwright E2E
cd apps/api-backend && npm test  # Jest backend

# Docker
npm run docker:build  # Build main-app image
npm run docker:run  # Run container
```

#### Production
```bash
# Deploy API
cd apps/api-backend
npm run build
NODE_ENV=production node dist/server.js

# Deploy Frontend (Nginx)
cd apps/main-app
npm run build
# Copy dist/ to Nginx html folder
```

### B. Environnements

#### Développement
- API: http://localhost:3000 (ou 3001)
- Frontend: http://localhost:5173 (Vite)
- Expert Desk: http://localhost:5174 (Vite)
- MongoDB: mongodb://localhost:27017

#### Production (Coolify)
- Frontend: https://oraclelumira.com
- API: https://oraclelumira.com/api (reverse proxy)
- Expert Desk: https://desk.oraclelumira.com
- MongoDB: mongodb://host:27017 (internal)

### C. Contacts & Ressources

**Documentation:**
- Stripe Docs: https://stripe.com/docs/api
- AWS S3 SDK: https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/s3/
- Mongoose: https://mongoosejs.com/docs/guide.html

**Outils:**
- Coolify: https://coolify.io/docs
- N8N: https://docs.n8n.io/

---

## ✅ CHECKLIST IMPLÉMENTATION

### Phase 1 - Stabilisation
- [ ] Unification modèles Order
  - [ ] Créer UnifiedOrder.ts
  - [ ] Script migration MongoDB
  - [ ] Tests migration staging
  - [ ] Backup production
  - [ ] Execute migration
  - [ ] Update routes
  - [ ] Tests E2E
- [ ] Configuration env centralisée
  - [ ] Consolider .env
  - [ ] Générer JWT_SECRET fort
  - [ ] Externaliser secrets Coolify
  - [ ] Validation env vars (envalid)
- [ ] Cleanup uploads temp
  - [ ] CleanupService.ts
  - [ ] Cron job node-cron
  - [ ] Monitoring disk usage
  - [ ] Alerting Slack

### Phase 2 - Observabilité
- [ ] Logging structuré global
  - [ ] requestIdMiddleware
  - [ ] httpLoggerMiddleware
  - [ ] errorLoggerMiddleware
  - [ ] Winston configuration
  - [ ] Remplacer console.*
- [ ] Sécuriser N8N callback
  - [ ] HMAC verification
  - [ ] Middleware auth
- [ ] Fix accessibilité frontend
  - [ ] HeroRefonte styles
  - [ ] SanctuaireWelcomeForm labels
  - [ ] FloatingInput ARIA
  - [ ] Pre-commit hook

### Phase 3 - Performance
- [ ] Upgrade dépendances
- [ ] Tests coverage → 70%
- [ ] Monitoring Prometheus
- [ ] Documentation API

---

## 🎯 CONCLUSION

### État Actuel
Oracle Lumira est une application **fonctionnelle** avec une base technique solide (backend robuste, intégrations Stripe/S3 sécurisées), mais souffre de **dette technique significative** et de **gaps observabilité**.

### Risques Majeurs
1. **Modèles Order dupliqués** → Risque incohérences données
2. **Configuration env fragmentée** → Risque erreurs déploiement
3. **Uploads temp non nettoyés** → Risque disk full production
4. **Logging non unifié** → Debugging difficile incidents production

### Opportunités
- Architecture modulaire (monorepo) facilite refactoring
- Tests E2E existants accélèrent validation
- Documentation partielle bonne base (à compléter)
- Stack moderne (React 18, TypeScript, MongoDB) pérenne

### Recommandation Finale
**Priorité absolue:** Résoudre les 3 problèmes P0 (unification Order, env centralisée, cleanup uploads) **avant** ajout de nouvelles features. Dette technique actuelle ralentira développement futur si non adressée.

**Timeline réaliste:** 4-5 semaines pour stabilisation complète (Phases 1-2).

---

**Rapport généré le:** 18 Octobre 2025  
**Prochaine révision:** Après implémentation Phase 1  
**Contact:** [team-lead@oraclelumira.com](mailto:team-lead@oraclelumira.com)
