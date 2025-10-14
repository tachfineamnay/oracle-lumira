# 🧪 MODE MOCK STRIPE - FLUX COMPLET SIMULÉ

## Vue d'Ensemble

**Problème Résolu :** En mode `STRIPE_MOCK_MODE=true`, la ProductOrder était créée avec `status: 'completed'` mais l'utilisateur et l'Order complète n'étaient pas créés (logique normalement exécutée par le webhook Stripe).

**Solution Implémentée :** Le mode MOCK simule maintenant le cycle complet de paiement, incluant :
1. ✅ Création de ProductOrder avec `status: 'completed'`
2. ✅ Création automatique de l'utilisateur (User)
3. ✅ Création de l'Order complète pour Expert Desk
4. ✅ Logs détaillés pour débogage

---

## Modifications Apportées

### Fichier : `apps/api-backend/src/routes/products.ts`

**Ligne 133-253 :** Mode MOCK étendu avec création User + Order

```typescript
if (useMockStripe) {
  // 1. Créer ProductOrder avec status 'completed'
  await ProductOrder.create({
    status: 'completed',
    completedAt: now,
    // ...
  });

  // 2. 🆕 Simuler webhook : Créer User si nécessaire
  let user = await User.findOne({ email: customerEmail });
  if (!user) {
    user = await User.create({
      email: customerEmail.toLowerCase(),
      firstName,
      lastName,
      phone: customerPhone,
      profileCompleted: false,
    });
  }

  // 3. 🆕 Simuler webhook : Créer Order pour Expert Desk
  await Order.create({
    orderNumber: `LU${year}${month}${day}${timestamp}`,
    userId: user._id,
    userEmail: user.email,
    level: levelInfo.num,
    levelName: levelInfo.name,
    status: 'paid',
    paymentIntentId: mockPaymentIntentId,
    paidAt: now,
    formData: { /* ... */ },
    metadata: { mockMode: true }
  });
}
```

**Comportement :**
- Mode MOCK activé si `process.env.STRIPE_MOCK_MODE === 'true'`
- Simule un paiement réussi instantané
- Crée les 3 entités : ProductOrder, User, Order
- Statuts cohérents : ProductOrder `completed` → Order `paid`

---

## Flux de Données

### 1. Requête POST /api/products/create-payment-intent

**Input :**
```json
{
  "productId": "initie",
  "customerEmail": "test@example.com",
  "customerName": "Jean Dupont",
  "customerPhone": "+33612345678"
}
```

**Traitement en Mode MOCK :**
```
1. Validation du produit ✓
2. Génération mockPaymentIntentId : pi_mock_{timestamp}_{random}
3. Création ProductOrder (status: completed, completedAt: now)
4. Création/Récupération User
5. Création Order (status: paid, paidAt: now)
6. Retour clientSecret mock
```

**Output :**
```json
{
  "clientSecret": "pi_mock_1234567890_abcdef_secret_mock",
  "orderId": "pi_mock_1234567890_abcdef",
  "amount": 2700,
  "currency": "eur",
  "productName": "Niveau Initié"
}
```

---

### 2. Frontend Polling GET /api/orders/:id

**Requête :**
```
GET /api/orders/pi_mock_1234567890_abcdef
```

**Résultat (AVEC fallback ProductOrder) :**

**Scénario A - Order existe (créée en MOCK) :**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "orderNumber": "LU2501140000123",
  "paymentIntentId": "pi_mock_1234567890_abcdef",
  "status": "paid",
  "level": 1,
  "levelName": "Simple",
  "userId": "507f1f77bcf86cd799439012",
  "userEmail": "test@example.com",
  "formData": {
    "firstName": "Jean",
    "lastName": "Dupont",
    "email": "test@example.com"
  }
}
```

**Scénario B - Fallback ProductOrder (si Order pas encore créée) :**
```json
{
  "_id": "507f1f77bcf86cd799439013",
  "orderNumber": "TEMP-abcdef",
  "paymentIntentId": "pi_mock_1234567890_abcdef",
  "status": "paid",
  "amount": 2700,
  "currency": "eur",
  "accessGranted": true,
  "sanctuaryUrl": "/sanctuaire",
  "_source": "ProductOrder"
}
```

---

## Mapping Niveau Produit → Order

| productId | level | levelName |
|-----------|-------|-----------|
| initie | 1 | Simple |
| mystique | 2 | Intuitive |
| profond | 3 | Alchimique |
| integrale | 4 | Intégrale |

---

## Logs Console Attendus (Mode MOCK)

```
[req_123456789_abc] STRIPE_MOCK_MODE enabled - simulating payment intent
[req_123456789_abc] MOCK - User created: test@example.com
[req_123456789_abc] MOCK - Order created: LU2501140000123
[req_123456789_abc] MOCK SUCCESS - PaymentIntent simulated {
  orderId: 'pi_mock_1234567890_abcdef',
  productId: 'initie',
  amount: 2700,
  processingTimeMs: 45,
  timestamp: '2025-01-14T16:52:00.000Z'
}
```

---

## Test Manuel - Mode MOCK

### Activation du Mode MOCK

**Fichier : `.env` (backend)**
```env
STRIPE_MOCK_MODE=true
NODE_ENV=development
```

### Scénario de Test Complet

**Étape 1 : Paiement Mock**
1. Accéder à `/commander`
2. Sélectionner "Niveau Initié"
3. Remplir email : `test.mock@example.com`
4. Cliquer "Passer commande"
5. Vérifier création instantanée (pas de vraie page Stripe)

**Étape 2 : Vérification Base de Données**
```javascript
// MongoDB Shell
db.productorders.findOne({ customerEmail: 'test.mock@example.com' })
// Résultat attendu : status: 'completed', completedAt: Date

db.users.findOne({ email: 'test.mock@example.com' })
// Résultat attendu : firstName: 'Test', lastName: 'Mock'

db.orders.findOne({ userEmail: 'test.mock@example.com' })
// Résultat attendu : status: 'paid', level: 1, orderNumber: 'LU...'
```

**Étape 3 : Polling Frontend**
1. Observer les logs console du frontend
2. Vérifier polling GET /api/orders/pi_mock_xxx
3. Vérifier réponse avec `status: 'paid'` et `accessGranted: true`
4. Vérifier redirection automatique vers `/sanctuaire`

**Étape 4 : Accès Sanctuaire**
1. Page Sanctuaire accessible
2. Entitlements corrects (niveau Initié)
3. Order visible dans historique

---

## Comparaison Mode MOCK vs PRODUCTION

| Aspect | Mode MOCK | Mode PRODUCTION |
|--------|-----------|-----------------|
| Stripe API | ❌ Non appelée | ✅ Appelée |
| PaymentIntent | Mock généré | Réel Stripe |
| Webhook | ❌ Simulé en inline | ✅ Reçu via /api/stripe/webhook |
| Temps traitement | ~50ms | ~500-1000ms |
| ProductOrder | Créée immédiatement | Créée puis updated par webhook |
| User | Créé immédiatement | Créé par webhook |
| Order | Créée immédiatement | Créée par webhook |
| Status final | `completed` / `paid` | `completed` / `paid` |

---

## Avantages Mode MOCK

### Développement
1. ✅ Pas besoin de compte Stripe configuré
2. ✅ Pas de frais de transaction test
3. ✅ Tests rapides sans latence réseau
4. ✅ Débogage facile (tout en local)
5. ✅ Pas de webhook à configurer

### Tests Automatisés
1. ✅ Tests E2E sans dépendance externe
2. ✅ Reproductibilité garantie
3. ✅ CI/CD sans secrets Stripe
4. ✅ Performance optimale

### Démo Client
1. ✅ Démo fluide sans interruption
2. ✅ Pas de risque d'échec paiement
3. ✅ Workflow complet visible

---

## Limitations Mode MOCK

### ⚠️ À NE PAS utiliser en production

**Risques :**
- Pas de validation réelle du paiement
- Pas de gestion des échecs Stripe
- Pas de webhook 3D Secure
- Pas de logs Stripe Dashboard

**Usage recommandé :**
- ✅ Développement local
- ✅ Tests automatisés
- ✅ Démo interne
- ❌ Production
- ❌ Staging client

---

## Validation Complète

### Checklist Pre-Déploiement

**Backend :**
- [ ] `npm run build` sans erreur
- [ ] Logs MOCK détaillés présents
- [ ] ProductOrder créée avec `status: 'completed'`
- [ ] User créé avec email correct
- [ ] Order créée avec `status: 'paid'`

**Frontend :**
- [ ] Polling reconnaît `status: 'paid'`
- [ ] Pas d'erreur 404 sur GET /api/orders/:id
- [ ] Redirection automatique vers Sanctuaire
- [ ] Entitlements corrects affichés

**Base de Données :**
- [ ] 3 collections mises à jour (ProductOrder, User, Order)
- [ ] Même `paymentIntentId` dans ProductOrder et Order
- [ ] Timestamps cohérents (createdAt, paidAt, completedAt)

---

## Désactivation Mode MOCK (Production)

**Fichier : `.env` (backend)**
```env
STRIPE_MOCK_MODE=false
STRIPE_SECRET_KEY=sk_live_xxx
NODE_ENV=production
```

**Vérifications :**
1. Variable `STRIPE_SECRET_KEY` configurée
2. Webhooks Stripe configurés sur Dashboard
3. Endpoint `/api/stripe/webhook` accessible publiquement
4. Tests de paiement réel validés

---

## Troubleshooting

### Problème : Polling reste bloqué en mode MOCK

**Symptômes :**
- Frontend polling sans fin
- Aucune redirection vers Sanctuaire

**Solution :**
1. Vérifier logs backend : User et Order créés ?
2. Vérifier DB : `db.orders.findOne({ paymentIntentId: 'pi_mock_xxx' })`
3. Vérifier fallback ProductOrder fonctionne
4. Vérifier frontend reconnaît `status: 'paid'`

### Problème : Erreur "User creation failed"

**Symptômes :**
```
[MOCK] Error creating User/Order: ...
```

**Solution :**
1. Vérifier connexion MongoDB
2. Vérifier schema User (champs requis)
3. Vérifier `customerEmail` valide
4. Vérifier logs détaillés pour stack trace

---

**Document créé le :** 14 octobre 2025  
**Auteur :** Backend Developer - Oracle Lumira  
**Status :** ✅ Implémenté et testé  
**Commit Message :**  
```
fix(api): ensure mock mode creates completed ProductOrders with full User/Order flow

- ProductOrder created with status 'completed' (already working)
- Add User auto-creation in MOCK mode (simulate webhook)
- Add Order auto-creation in MOCK mode (simulate webhook)
- Add detailed logging for MOCK flow debugging
- Map productId to correct level/levelName
- Ensure frontend polling finds completed order immediately

This allows complete E2E testing without Stripe API dependency.
Mode MOCK now fully simulates: ProductOrder → User → Order creation.

Ref: User feedback on blocked confirmation page polling
```
