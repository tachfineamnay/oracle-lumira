# 🚀 GUIDE DE DÉPLOIEMENT ET TESTS - SANCTUAIRE ORACLE LUMIRA

## 📋 TABLE DES MATIÈRES

1. [Installation et Setup](#installation-et-setup)
2. [Tests Locaux](#tests-locaux)
3. [Déploiement Production](#déploiement-production)
4. [Validation Post-Déploiement](#validation-post-déploiement)
5. [Troubleshooting](#troubleshooting)

---

## 🛠️ INSTALLATION ET SETUP

### Prérequis

- Node.js 18+ et npm 9+
- MongoDB 6+ (local ou Atlas)
- Compte Stripe (mode test ou live)
- Compte AWS S3 (ou mode mock)

### 1. Cloner et Installer

```powershell
# Cloner le repository
git clone <votre-repo-url>
cd LumiraV1-MVP

# Installer les dépendances backend
cd apps/api-backend
npm install

# Installer les dépendances frontend
cd ../main-app
npm install

# Retour à la racine
cd ../..
```

### 2. Configuration Backend (.env)

Créer `apps/api-backend/.env` :

```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/lumira-dev

# JWT Secret (générer avec: openssl rand -base64 32)
JWT_SECRET=votre_secret_jwt_super_securise

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# AWS S3 (ou mode mock)
AWS_S3_BUCKET_NAME=lumira-uploads
AWS_REGION=eu-west-3
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...

# Modes de test (optionnel)
S3_MOCK_MODE=false
STRIPE_MOCK_MODE=false
ALLOW_DIRECT_CLIENT_SUBMIT=false

# Port
PORT=3001
```

### 3. Configuration Frontend (.env)

Créer `apps/main-app/.env` :

```env
# API Backend URL
VITE_API_URL=http://localhost:3001/api

# Stripe Public Key
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### 4. Démarrage Local

```powershell
# Terminal 1 : Backend
cd apps/api-backend
npm run dev
# → API lancée sur http://localhost:3001

# Terminal 2 : Frontend
cd apps/main-app
npm run dev
# → Frontend lancé sur http://localhost:5173
```

---

## 🧪 TESTS LOCAUX

### Test 1 : Vérification Endpoint Entitlements

```powershell
# 1. Créer un utilisateur test dans MongoDB (via Compass ou shell)
# 2. Obtenir un token JWT sanctuaire

# PowerShell - Authentification
$response = Invoke-RestMethod -Uri "http://localhost:3001/api/users/auth/sanctuaire" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"email":"test@lumira.com"}'

$token = $response.token
Write-Host "Token: $token"

# 3. Tester l'endpoint entitlements
$headers = @{
  "Authorization" = "Bearer $token"
}

$entitlements = Invoke-RestMethod -Uri "http://localhost:3001/api/users/entitlements" `
  -Method GET `
  -Headers $headers

Write-Host "Capabilities:" $entitlements.capabilities
Write-Host "Highest Level:" $entitlements.highestLevel
```

**Résultat attendu :**
```json
{
  "capabilities": ["content.basic", "readings.pdf", ...],
  "products": ["mystique"],
  "highestLevel": "mystique",
  "levelMetadata": {
    "name": "Mystique",
    "color": "#7C3AED",
    "icon": "🔮"
  }
}
```

### Test 2 : Parcours Onboarding Complet

1. **Accéder à** : `http://localhost:5173/sanctuaire?email=test@lumira.com&token=fv_123`
2. **Vérifier** :
   - ✅ `sessionStorage.first_visit === 'true'`
   - ✅ OnboardingForm s'affiche en overlay
3. **Compléter les 3 étapes** :
   - Étape 1 : Remplir date/heure/lieu de naissance
   - Étape 2 : Écrire question et objectif
   - Étape 3 : Uploader 2 photos (JPEG/PNG uniquement)
4. **Soumettre** :
   - ✅ Appel `/api/orders/by-payment-intent/:id/client-submit`
   - ✅ Ordre créé/mis à jour en base
   - ✅ Redirection vers dashboard sanctuaire

### Test 3 : CapabilityGuard par Niveau

#### Niveau Initié (1)

```javascript
// Dans MesLectures.tsx
// Attendu : PDF visible, Audio et Mandala verrouillés
```

**Checklist :**
- [ ] Bouton PDF : ✅ Actif et cliquable
- [ ] Bouton Audio : 🔒 Verrouillé avec icône Lock
- [ ] Bouton Mandala : 🔒 Verrouillé avec icône Lock

#### Niveau Mystique (2)

**Checklist :**
- [ ] Bouton PDF : ✅ Actif
- [ ] Bouton Audio : ✅ Actif et joue l'audio
- [ ] Bouton Mandala : 🔒 Verrouillé

#### Niveau Profond (3)

**Checklist :**
- [ ] Bouton PDF : ✅ Actif
- [ ] Bouton Audio : ✅ Actif
- [ ] Bouton Mandala : ✅ Actif et affiche le SVG

### Test 4 : Script E2E Automatisé

```powershell
# Exécuter le script white-glove
cd qa-tests
node white-glove-e2e.cjs

# Vérifier les artefacts générés
ls artifacts/white-glove/

# Attendu :
# - create-payment-intent-mystique.json
# - upload-valid.json
# - upload-invalid.json
# - order-completed.json
# - entitlements-mystique.json
# - product-order.json
# - expert-pending.json
```

---

## 🌐 DÉPLOIEMENT PRODUCTION

### Étape 1 : Préparation Backend

```powershell
cd apps/api-backend

# Build TypeScript
npm run build

# Vérifier les fichiers compilés
ls dist/

# Attendu : server.js, routes/, models/, etc.
```

### Étape 2 : Configuration Production

Créer `apps/api-backend/.env.production` :

```env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/lumira-prod
JWT_SECRET=<NOUVEAU_SECRET_FORT_GENERE>
STRIPE_SECRET_KEY=sk_live_...
AWS_S3_BUCKET_NAME=lumira-prod-uploads
AWS_REGION=eu-west-3
NODE_ENV=production
PORT=3001
```

### Étape 3 : Déploiement Backend (Options)

#### Option A : VPS (DigitalOcean, Linode, AWS EC2)

```bash
# Sur le serveur
cd /var/www/lumira-api
git pull origin main
npm install --production
npm run build

# PM2 pour process management
pm2 start dist/server.js --name lumira-api
pm2 save
pm2 startup
```

#### Option B : Heroku

```bash
# Depuis local
heroku create lumira-api
heroku config:set MONGODB_URI=...
heroku config:set JWT_SECRET=...
git push heroku main
```

#### Option C : Railway

```bash
# Connecter via GitHub et ajouter variables d'env
# Détection automatique de package.json
```

### Étape 4 : Préparation Frontend

```powershell
cd apps/main-app

# Mise à jour .env.production
VITE_API_URL=https://api.lumira.com/api
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...

# Build Vite
npm run build

# Vérifier dist/
ls dist/
# Attendu : index.html, assets/, etc.
```

### Étape 5 : Déploiement Frontend (Options)

#### Option A : Netlify

```bash
# CLI
netlify deploy --prod --dir=dist

# Ou connecter via GitHub et autodeploy
```

#### Option B : Vercel

```bash
vercel --prod
```

#### Option C : AWS S3 + CloudFront

```bash
aws s3 sync dist/ s3://lumira-frontend --delete
aws cloudfront create-invalidation --distribution-id E123... --paths "/*"
```

### Étape 6 : Reverse Proxy (Nginx)

Si backend et frontend sur même serveur :

```nginx
# /etc/nginx/sites-available/lumira
server {
    listen 80;
    server_name lumira.com www.lumira.com;

    # Frontend
    location / {
        root /var/www/lumira-frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # API Backend
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# SSL avec Let's Encrypt
# certbot --nginx -d lumira.com -d www.lumira.com
```

---

## ✅ VALIDATION POST-DÉPLOIEMENT

### Checklist de Production

#### Backend API

- [ ] `https://api.lumira.com/health` → 200 OK
- [ ] `POST /api/users/auth/sanctuaire` fonctionne avec email valide
- [ ] `GET /api/users/entitlements` retourne capabilities avec JWT
- [ ] MongoDB connecté (vérifier logs)
- [ ] Stripe webhook actif (vérifier dashboard Stripe)
- [ ] S3 uploads fonctionnent (tester avec photo)

#### Frontend

- [ ] `https://lumira.com` charge correctement
- [ ] Page `/sanctuaire` accessible
- [ ] OnboardingForm s'affiche avec `?token=fv_xxx`
- [ ] Navigation mandala fluide
- [ ] Page MesLectures affiche les commandes
- [ ] Boutons PDF/Audio/Mandala fonctionnels selon niveau
- [ ] Page Profil affiche historique avec miniatures

#### Sécurité

- [ ] HTTPS actif avec certificat SSL valide
- [ ] CORS configuré pour origine frontend uniquement
- [ ] JWT secret robuste (32+ caractères)
- [ ] URLs pré-signées S3 expirent après 15 min
- [ ] Pas de secrets dans les logs
- [ ] Headers sécurisés (CSP, X-Frame-Options, etc.)

### Tests Fonctionnels Production

```powershell
# Test 1 : Authentification
$prod_url = "https://api.lumira.com/api"
$auth = Invoke-RestMethod -Uri "$prod_url/users/auth/sanctuaire" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"email":"client@test.com"}'

# Test 2 : Entitlements
$headers = @{ "Authorization" = "Bearer $($auth.token)" }
$ent = Invoke-RestMethod -Uri "$prod_url/users/entitlements" -Headers $headers

Write-Host "✅ Production API fonctionnelle" -ForegroundColor Green
Write-Host "Capabilities:" $ent.capabilities.Count
Write-Host "Highest Level:" $ent.highestLevel
```

---

## 🔧 TROUBLESHOOTING

### Problème 1 : OnboardingForm ne s'affiche pas

**Symptôme :** Page sanctuaire charge mais pas d'overlay onboarding

**Causes possibles :**
1. `first_visit` non présent dans sessionStorage
2. Profil déjà complété (`profileCompleted === true`)
3. `SanctuaireProvider` non enveloppé dans router

**Solution :**
```javascript
// Vérifier dans console navigateur
console.log('first_visit:', sessionStorage.getItem('first_visit'));
console.log('isAuthenticated:', useSanctuaire().isAuthenticated);
console.log('showOnboarding:', showOnboarding);
```

### Problème 2 : "Token invalide" lors de l'appel entitlements

**Symptôme :** Erreur 401 sur `GET /api/users/entitlements`

**Causes possibles :**
1. Token expiré (>24h)
2. JWT_SECRET différent entre build et runtime
3. Type de token incorrect (`type !== 'sanctuaire_access'`)

**Solution :**
```javascript
// Décoder le token JWT (jwt.io)
const token = localStorage.getItem('sanctuaire_token');
// Vérifier :
// - exp : timestamp futur
// - type : 'sanctuaire_access'
// - userId : valide

// Re-générer un nouveau token
localStorage.removeItem('sanctuaire_token');
// Retourner à /sanctuaire/login
```

### Problème 3 : Photos ne s'uploadent pas

**Symptôme :** Erreur 400 "Invalid magic numbers" sur `/client-submit`

**Causes possibles :**
1. Fichier non-image uploadé
2. Extension incorrecte (.gif, .webp non supportés)
3. Header JPEG/PNG corrompu

**Solution :**
```javascript
// Valider MIME type avant upload
const validateFile = (file: File) => {
  const validTypes = ['image/jpeg', 'image/png'];
  if (!validTypes.includes(file.type)) {
    throw new Error('Format non supporté. Utilisez JPEG ou PNG.');
  }
  
  // Vérifier taille (max 10MB)
  if (file.size > 10 * 1024 * 1024) {
    throw new Error('Fichier trop volumineux (max 10MB).');
  }
};
```

### Problème 4 : CapabilityGuard affiche tout verrouillé

**Symptôme :** Tous les boutons affichent lock icon même pour niveau Mystique+

**Causes possibles :**
1. `hasCapability()` retourne toujours false
2. Capabilities vide dans context
3. Endpoint entitlements retourne tableau vide

**Solution :**
```javascript
// Déboguer dans MesLectures.tsx
const { capabilities, hasCapability } = useSanctuaire();
console.log('All capabilities:', capabilities);
console.log('Has PDF?', hasCapability('readings.pdf'));
console.log('Has Audio?', hasCapability('readings.audio'));

// Si vide, recharger entitlements
const { refresh } = useSanctuaire();
await refresh();
```

### Problème 5 : Lightbox ne s'ouvre pas

**Symptôme :** Clic sur miniature dans Profile.tsx ne fait rien

**Causes possibles :**
1. `lightboxImage` state non défini
2. URLs photos invalides ou expirées
3. Modal non rendu (condition)

**Solution :**
```javascript
// Vérifier le state
const [lightboxImage, setLightboxImage] = useState<string | null>(null);

// Ajouter logs
const handlePhotoClick = (url: string) => {
  console.log('Opening lightbox with:', url);
  setLightboxImage(url);
};

// Vérifier le rendu conditionnel
{lightboxImage && (
  <motion.div ...>
    <img src={lightboxImage} alt="..." />
  </motion.div>
)}
```

---

## 📊 MONITORING ET ANALYTICS

### Sentry (Errors)

```javascript
// apps/main-app/src/main.tsx
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "https://xxx@sentry.io/xxx",
  environment: import.meta.env.MODE,
  integrations: [
    new Sentry.BrowserTracing(),
    new Sentry.Replay(),
  ],
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
});
```

### Google Analytics

```javascript
// apps/main-app/index.html
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

### LogRocket (Session Replay)

```javascript
import LogRocket from 'logrocket';
LogRocket.init('app/id');

// Identifier l'utilisateur
const { user } = useSanctuaire();
if (user) {
  LogRocket.identify(user.id, {
    email: user.email,
    level: user.level,
  });
}
```

---

## 🎯 PERFORMANCES

### Optimisations Recommandées

1. **Lazy Loading Images**
```javascript
<img 
  src={photoUrl} 
  loading="lazy" 
  decoding="async"
/>
```

2. **Code Splitting**
```javascript
// Déjà fait avec React.lazy()
const LazyMesLectures = React.lazy(() => import('./MesLectures'));
```

3. **Cache Capabilities**
```javascript
// Dans SanctuaireContext.tsx
const cacheKey = `capabilities_${user?.id}`;
const cached = localStorage.getItem(cacheKey);
if (cached && Date.now() - cached.timestamp < 5 * 60 * 1000) {
  return JSON.parse(cached.data);
}
```

4. **Compression Gzip/Brotli**
```nginx
# nginx.conf
gzip on;
gzip_types text/css application/javascript application/json;
```

---

## 📞 SUPPORT

### Ressources

- **Documentation** : `RAPPORT-REFONTE-SANCTUAIRE.md`
- **Issues GitHub** : <repo-url>/issues
- **Email Support** : dev@lumira.com

### Logs Utiles

```powershell
# Backend logs (PM2)
pm2 logs lumira-api --lines 100

# MongoDB logs
tail -f /var/log/mongodb/mongod.log

# Nginx logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

---

**Version :** 2.0.0  
**Dernière mise à jour :** 2025-10-14  
**Auteur :** Qoder AI
