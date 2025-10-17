# 🚀 Guide de Démarrage Rapide - Post Migration

> **Date** : 15 Janvier 2025  
> **Version** : Onboarding Refonte 2025

---

## ⚡ Démarrage en 3 Commandes

### 1️⃣ Installation (si nécessaire)

```bash
cd c:\Users\hp\Desktop\LumiraV1-MVP
npm install
```

### 2️⃣ Configuration Backend MongoDB

**Vérifier le fichier** : `apps/api-backend/.env`

```env
# MongoDB Atlas Connection String
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority

# Stripe Keys
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# Cloudinary (pour upload photos)
CLOUDINARY_CLOUD_NAME=xxxxx
CLOUDINARY_API_KEY=xxxxx
CLOUDINARY_API_SECRET=xxxxx

# JWT Secret
JWT_SECRET=your-jwt-secret-key-here
```

⚠️ **Erreur actuelle** : `getaddrinfo ENOTFOUND c4kcoss04wgo80c4wow8k4w4`  
**Cause** : MongoDB connection string invalide ou réseau non accessible.

**Solution** :
1. Vérifier que `MONGODB_URI` est correct
2. Tester la connexion depuis MongoDB Compass
3. Vérifier que l'IP est whitelistée dans MongoDB Atlas

### 3️⃣ Lancer le Projet

```bash
npm run dev
```

**Résultat attendu** :
```
[0] ? [API] server.ts - MongoDB connected successfully
[1] VITE v5.4.19  ready in 2956 ms
[1] ➜  Local:   http://localhost:5173/
```

---

## 🧪 Tests Manuels Rapides

### Test 1 : Flux Nouveau Client (5 minutes)

1. **Ouvrir** : http://localhost:5173/commande?product=mystique
2. **Remplir** :
   - Email : test@lumira.com
   - Téléphone : +33 6 12 34 56 78
   - Prénom : Jean
   - Nom : Dupont
3. **Payer** :
   - Carte : 4242 4242 4242 4242
   - Date : 12/26
   - CVC : 123
4. **Vérifier** :
   - ✅ Redirection vers `/confirmation`
   - ✅ Redirection vers `/sanctuaire?payment_intent=pi_xxx`
   - ✅ Formulaire OnboardingForm s'affiche
   - ✅ Données pré-remplies (email, téléphone, prénom, nom)
5. **Compléter** :
   - Étape 1 : Date naissance, heure, lieu
   - Étape 2 : Question spirituelle, objectif
   - Étape 3 : Upload 2 photos
6. **Finaliser** :
   - ✅ Console : `profileCompleted marqué à true`
   - ✅ Dashboard s'affiche
   - ✅ Mandala visible

### Test 2 : Flux Client Existant (2 minutes)

1. **Console navigateur** :
```javascript
// Simuler un client existant
localStorage.setItem('oraclelumira_user_level', JSON.stringify({
  currentLevel: 'mystique',
  profile: {
    email: 'existing@lumira.com',
    profileCompleted: true,
    submittedAt: new Date('2025-01-10')
  }
}));

// Recharger
window.location.href = '/sanctuaire';
```

2. **Vérifier** :
   - ✅ OnboardingForm **NE s'affiche PAS**
   - ✅ Dashboard visible directement
   - ✅ Navigation dans les sphères fonctionnelle

---

## 📊 Checklist de Validation

### Backend

- [ ] MongoDB connecté (pas d'erreur ENOTFOUND)
- [ ] API démarre sur http://localhost:5000
- [ ] Logs affichent : `MongoDB connected successfully`
- [ ] Webhook Stripe configuré (si en prod)

### Frontend

- [ ] Vite démarre sur http://localhost:5173
- [ ] Page `/commande` charge sans erreur
- [ ] Formulaire de paiement s'affiche
- [ ] Stripe Elements charge correctement

### Système de Paiement

- [ ] Formulaire UnifiedCheckoutForm visible
- [ ] Validation temps réel fonctionne (email, téléphone)
- [ ] PaymentIntent créé après remplissage
- [ ] Redirection vers `/confirmation` après paiement

### Système d'Onboarding

- [ ] OnboardingForm s'affiche après paiement
- [ ] Données pré-remplies correctement
- [ ] Navigation 4 étapes fluide
- [ ] Soumission vers `/api/orders/.../client-submit` réussit
- [ ] Console affiche : `profileCompleted marqué à true`
- [ ] Dashboard se débloque après soumission

### Système Clients Existants

- [ ] Client avec `profileCompleted: true` voit dashboard directement
- [ ] OnboardingForm ne s'affiche pas
- [ ] Navigation sphères fonctionnelle

---

## 🔍 Debugging Rapide

### Problème : Backend ne démarre pas

**Symptôme** : `Error: getaddrinfo ENOTFOUND`

**Solution** :
```bash
# Vérifier .env
cat apps/api-backend/.env | grep MONGODB_URI

# Tester connexion MongoDB
# Installer MongoDB Compass et tester l'URI manuellement
```

### Problème : OnboardingForm ne s'affiche pas

**Vérifier Console** :
```javascript
// Devrait afficher "true" pour nouveau client
console.log(sessionStorage.getItem('first_visit'));

// Devrait afficher false ou undefined pour nouveau client
console.log(JSON.parse(localStorage.getItem('oraclelumira_user_level'))?.profile?.profileCompleted);
```

**Solution** :
```javascript
// Forcer l'affichage du formulaire
sessionStorage.setItem('first_visit', 'true');
localStorage.removeItem('oraclelumira_user_level');
window.location.reload();
```

### Problème : Dashboard ne se débloque pas

**Vérifier Console** :
```
✨ [OnboardingForm] profileCompleted marqué à true
```

**Vérifier localStorage** :
```javascript
console.log(
  JSON.parse(localStorage.getItem('oraclelumira_user_level'))?.profile?.profileCompleted
);
// Doit afficher : true
```

**Solution** :
```javascript
// Recharger la page
window.location.reload();

// Ou marquer manuellement
const userLevel = JSON.parse(localStorage.getItem('oraclelumira_user_level'));
userLevel.profile.profileCompleted = true;
localStorage.setItem('oraclelumira_user_level', JSON.stringify(userLevel));
window.location.reload();
```

### Problème : Données non pré-remplies

**Vérifier Console** :
```
[OnboardingForm] PaymentIntentId trouvé: pi_xxxxx
[OnboardingForm] Chargement depuis ProductOrder: pi_xxxxx
[OnboardingForm] Données chargées: { email: ..., phone: ..., name: ... }
```

**Vérifier localStorage** :
```javascript
console.log(localStorage.getItem('last_payment_intent_id'));
// Doit afficher : pi_xxxxx
```

**Solution** :
```javascript
// Stocker manuellement un PI pour tester
localStorage.setItem('last_payment_intent_id', 'pi_test_12345');
sessionStorage.setItem('first_visit', 'true');
window.location.href = '/sanctuaire';
```

---

## 📞 Support

### Logs à Vérifier

**Console navigateur** :
- `[OnboardingForm]` : Toutes les étapes du formulaire
- `[UnifiedCheckout]` : Création PaymentIntent
- `[SanctuaireProvider]` : Chargement des données

**Terminal backend** :
- `[CLIENT-SUBMIT]` : Réception données client
- `[STRIPE-WEBHOOK]` : Events Stripe
- `MongoDB connected successfully` : Connexion DB

### Fichiers de Test

1. **Plan complet** : [`apps/main-app/src/__tests__/sanctuaire/manuel-e2e-test-plan.md`](file://c:\Users\hp\Desktop\LumiraV1-MVP\apps\main-app\src\__tests__\sanctuaire\manuel-e2e-test-plan.md)
2. **Rapport validation** : [`apps/main-app/src/__tests__/sanctuaire/validation-report.md`](file://c:\Users\hp\Desktop\LumiraV1-MVP\apps\main-app\src\__tests__\sanctuaire\validation-report.md)
3. **Mission accomplie** : [`MISSION-ACCOMPLISHED.md`](file://c:\Users\hp\Desktop\LumiraV1-MVP\MISSION-ACCOMPLISHED.md)

---

## ✅ Checklist Avant Déploiement Production

- [ ] Tests manuels E2E effectués
- [ ] MongoDB connecté et stable
- [ ] Variables d'environnement production configurées
- [ ] Stripe webhooks configurés
- [ ] Cloudinary configuré pour upload photos
- [ ] Logs de monitoring en place
- [ ] Backup de l'ancienne version effectué
- [ ] Rollback plan préparé

---

**Prêt à démarrer !** 🚀

En cas de questions, référez-vous aux fichiers de test détaillés dans `apps/main-app/src/__tests__/sanctuaire/`.
