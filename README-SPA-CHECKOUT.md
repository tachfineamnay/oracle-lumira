# Oracle Lumira - Guide SPA Checkout Complet

## 🎯 **Vue d'ensemble**

Ce guide détaille l'implémentation du tunnel de commande SPA (Single Page Application) pour Oracle Lumira, remplaçant les popups externes par un flux intégré : Landing → Commande → Paiement → Confirmation → Sanctuaire.

## 📋 **Architecture**

### **Backend (apps/api-backend)**
- **Catalogue centralisé** : `src/catalog.ts` - Source de vérité des produits/prix
- **Service Stripe** : `src/services/stripe.ts` - Gestion des PaymentIntents et webhooks
- **API Routes** : `src/routes/products.ts` - Endpoints RESTful sécurisés
- **Types** : `src/types/payments.ts` - Interfaces TypeScript

### **Frontend (apps/main-app)**
- **Types** : `src/types/products.ts` - Interfaces produits frontend
- **Service API** : `src/services/productOrder.ts` - Client API avec gestion d'erreurs
- **Pages SPA** : 
  - `src/pages/CommandeTempleSPA.tsx` - Checkout avec Stripe Elements
  - `src/pages/ConfirmationTempleSPA.tsx` - Confirmation et redirection
- **Composant mis à jour** : `src/components/LevelCard.tsx` - Navigation vers le nouveau tunnel

---

## 🔧 **Variables d'environnement**

### **Backend (.env)**
```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Database
MONGODB_URI=mongodb://localhost:27017/oracle-lumira

# Server
PORT=3000
NODE_ENV=production
API_URL=https://api.oraclelumira.com

# CORS Origins
CORS_ORIGINS=https://oraclelumira.com,https://desk.oraclelumira.com
```

### **Frontend (.env)**
```bash
# API Configuration
VITE_API_URL=https://api.oraclelumira.com/api
VITE_APP_URL=https://oraclelumira.com

# Stripe Public Key
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here

# Environment
VITE_NODE_ENV=production
```

---

## 📡 **Endpoints API**

### **POST /api/products/create-payment-intent**
Crée un PaymentIntent Stripe pour un produit.

**Request:**
```json
{
  "productId": "profond",
  "customerEmail": "user@example.com"
}
```

**Response:**
```json
{
  "clientSecret": "pi_xxx_secret_xxx",
  "orderId": "pi_1234567890",
  "amount": 19900,
  "currency": "eur",
  "productName": "Niveau Profond"
}
```

### **GET /api/products/order/:orderId**
Récupère le statut d'une commande.

**Response:**
```json
{
  "order": {
    "id": "pi_1234567890",
    "productId": "profond",
    "status": "completed",
    "amount": 19900,
    "currency": "eur"
  },
  "product": {
    "id": "profond",
    "name": "Niveau Profond",
    "level": "profond"
  },
  "accessGranted": true,
  "sanctuaryUrl": "/sanctuaire"
}
```

### **POST /api/products/webhook**
Webhook Stripe pour traiter les événements de paiement.

**Events supportés:**
- `payment_intent.succeeded` - Paiement réussi
- `payment_intent.payment_failed` - Paiement échoué
- `payment_intent.canceled` - Paiement annulé

---

## 🧪 **Tests à réaliser**

### **1. Tests Locaux**

#### **Backend**
```bash
cd apps/api-backend

# Install dependencies
npm install

# Build
npm run build

# Start server
npm run dev

# Test endpoints
curl -X POST http://localhost:3000/api/products/create-payment-intent \
  -H "Content-Type: application/json" \
  -d '{"productId":"initie","customerEmail":"test@example.com"}'

curl http://localhost:3000/api/products/order/pi_test_12345
```

#### **Frontend**
```bash
cd apps/main-app

# Install dependencies
npm install

# Start dev server
npm run dev

# Test flow
# 1. Navigate to http://localhost:5173
# 2. Click on a level card
# 3. Fill checkout form
# 4. Test with Stripe test cards
```

### **2. Tests Stripe**

#### **Cartes de test**
```bash
# Paiement réussi
4242424242424242

# Paiement échoué
4000000000000002

# 3D Secure (SCA)
4000000000003220

# Paiement différé
4000000000000077
```

#### **Test du webhook**
```bash
# Install Stripe CLI
stripe listen --forward-to localhost:3000/api/products/webhook

# Test webhook
stripe trigger payment_intent.succeeded
```

### **3. Tests End-to-End**

#### **Flux complet**
1. **Landing** : Cliquer sur "Niveau Profond"
2. **Commande** : 
   - Vérifier affichage produit correct
   - Tester PaymentElement
   - Tester Payment Request Button (Apple/Google Pay)
3. **Paiement** : Utiliser carte test `4242424242424242`
4. **Confirmation** : 
   - Vérifier message de succès
   - Tester redirection automatique vers sanctuaire
5. **Sanctuaire** : Vérifier accès accordé

---

## 🚀 **Procédure de déploiement Coolify**

### **1. Configuration des variables**

Dans Coolify UI > Application > Environment :

```bash
# Backend vars
STRIPE_SECRET_KEY=sk_live_your_production_key
STRIPE_WEBHOOK_SECRET=whsec_your_production_webhook_secret
MONGODB_URI=mongodb://your-production-mongo
CORS_ORIGINS=https://oraclelumira.com

# Frontend vars (build time)
VITE_API_URL=https://api.oraclelumira.com/api
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_your_production_key
```

### **2. Webhook Stripe**

1. **Créer endpoint** dans Stripe Dashboard :
   - URL: `https://api.oraclelumira.com/api/products/webhook`
   - Events: `payment_intent.succeeded`, `payment_intent.payment_failed`, `payment_intent.canceled`

2. **Copier webhook secret** dans variable `STRIPE_WEBHOOK_SECRET`

### **3. Tests de déploiement**

```bash
# Health check
curl https://api.oraclelumira.com/api/health

# Test création PaymentIntent
curl -X POST https://api.oraclelumira.com/api/products/create-payment-intent \
  -H "Content-Type: application/json" \
  -d '{"productId":"mystique","customerEmail":"test@production.com"}'

# Test frontend
curl https://oraclelumira.com/commande?product=profond
```

---

## 🛡️ **Sécurité**

### **Validation côté serveur**
- ✅ Validation des productId via catalogue
- ✅ Validation des emails
- ✅ Vérification des signatures webhook
- ✅ Sanitisation des inputs
- ✅ Rate limiting sur les endpoints sensibles

### **Gestion des erreurs**
- ✅ Messages d'erreur utilisateur-friendly
- ✅ Logging détaillé côté serveur
- ✅ Retry automatique des requests
- ✅ Fallback sur erreurs Stripe

### **Conformité PCI**
- ✅ Aucune donnée bancaire stockée
- ✅ Stripe Elements pour la saisie sécurisée
- ✅ HTTPS obligatoire en production
- ✅ Tokens temporaires uniquement

---

## 🔄 **Évolutions futures**

### **À court terme**
- [ ] Base de données pour orders (remplacer Map temporaire)
- [ ] Emails de confirmation automatiques
- [ ] Dashboard admin pour voir les commandes
- [ ] Gestion des remboursements

### **À moyen terme**
- [ ] Système de coupons/remises
- [ ] Upsells dans le tunnel
- [ ] Intégration CRM Dolibarr
- [ ] Analytics des conversions

### **À long terme**
- [ ] Abonnements récurrents
- [ ] Marketplace multi-vendeurs
- [ ] Programme d'affiliation
- [ ] API publique pour partenaires

---

## 📞 **Support & Debug**

### **Logs importants**
```bash
# Backend logs
docker logs oracle-lumira-api --tail 100 -f

# Frontend build logs
docker logs oracle-lumira-frontend --tail 100 -f

# Stripe webhook logs
stripe logs tail
```

### **Debug commun**
1. **PaymentIntent fails** : Vérifier STRIPE_SECRET_KEY
2. **Webhook fails** : Vérifier STRIPE_WEBHOOK_SECRET et endpoint URL
3. **CORS errors** : Vérifier CORS_ORIGINS includes frontend domain
4. **Product not found** : Vérifier productId dans PRODUCT_CATALOG

### **Monitoring**
- Status page : `https://api.oraclelumira.com/api/health`
- Stripe Dashboard : Paiements, webhooks, erreurs
- Coolify Logs : Performance, erreurs application

---

## ✅ **Checklist déploiement**

### **Pre-déploiement**
- [ ] Tests locaux passés
- [ ] Variables d'environnement configurées
- [ ] Webhook Stripe configuré
- [ ] Backup base de données effectué
- [ ] Code review terminée

### **Déploiement**
- [ ] Build Docker réussi
- [ ] Health checks passent
- [ ] Tests de smoke réussis
- [ ] Monitoring actif
- [ ] Rollback plan prêt

### **Post-déploiement**
- [ ] Flux complet testé
- [ ] Webhooks Stripe fonctionnent
- [ ] Analytics configurées
- [ ] Équipe notifiée
- [ ] Documentation mise à jour

---

**🎯 Le tunnel SPA Oracle Lumira est maintenant prêt pour une expérience de commande fluide et sécurisée !**
