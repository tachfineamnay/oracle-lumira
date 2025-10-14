# 🔧 CORRECTIF TACTIQUE - PLAN DE TEST ET VALIDATION

## Vue d'Ensemble

**Problème Résolu :** L'endpoint `GET /api/orders/:id` retournait 404 après un paiement car il cherchait uniquement dans la collection `Order`, alors que seule `ProductOrder` existe à ce stade.

**Solution Implémentée :** Logique de fallback intelligente qui cherche d'abord dans `Order`, puis dans `ProductOrder` si non trouvé, et construit une réponse compatible pour le frontend.

---

## Modifications Apportées

### Fichier : `apps/api-backend/src/routes/orders.ts`

**Ligne 1-8 :** Import de `ProductOrder`
```typescript
import { ProductOrder } from '../models/ProductOrder';
```

**Ligne 576-659 :** Logique de recherche étendue
```typescript
// Strategy 1: Chercher dans Order
const order = await Order.findOne({ paymentIntentId: id });

// Strategy 2: Fallback vers ProductOrder
if (!order) {
  const productOrder = await ProductOrder.findOne({ paymentIntentId: id });
  
  if (productOrder) {
    // Construire réponse compatible
    const compatibleResponse = {
      status: productOrder.status === 'completed' ? 'paid' : 'pending',
      accessGranted: productOrder.status === 'completed',
      sanctuaryUrl: '/sanctuaire',
      _source: 'ProductOrder' // Flag de débogage
    };
    return res.json(compatibleResponse);
  }
}
```

**Mappings de Statuts :**
| ProductOrder Status | Order Status | Access Granted |
|---------------------|--------------|----------------|
| pending | pending | ❌ |
| processing | processing | ❌ |
| completed | paid | ✅ |
| failed | failed | ❌ |
| cancelled | refunded | ❌ |

---

## Plan de Test Détaillé

### 📋 Test 1 : POST-PAYMENT (ProductOrder existe, Order n'existe pas)

**Contexte :** L'utilisateur vient de payer avec Stripe, le webhook a créé une `ProductOrder`.

**Étapes :**
1. Accéder à `/commander` (page produits)
2. Sélectionner un produit (ex: Niveau Initié)
3. Compléter le paiement Stripe (test mode)
4. Noter le `paymentIntentId` (format `pi_xxx`) depuis les logs ou l'URL de confirmation
5. Exécuter la requête :
   ```bash
   curl -X GET http://localhost:3000/api/orders/{paymentIntentId}
   ```

**Résultat Attendu :**
```json
{
  "_id": "...",
  "orderNumber": "TEMP-12345678",
  "paymentIntentId": "pi_xxx",
  "status": "paid",
  "amount": 2700,
  "currency": "eur",
  "userEmail": "test@example.com",
  "productId": "initie",
  "accessGranted": true,
  "sanctuaryUrl": "/sanctuaire",
  "message": "Payment successful. Please complete your Sanctuaire profile.",
  "_source": "ProductOrder"
}
```

**Validation :**
- ✅ Status HTTP : 200
- ✅ Champ `_source: 'ProductOrder'` présent
- ✅ `accessGranted: true` si payment succeeded
- ✅ `sanctuaryUrl: '/sanctuaire'` présent
- ✅ Pas d'erreur 404

**Logs Console Attendus :**
```
[GET-ORDER] Recherche commande avec ID: pi_xxx
[GET-ORDER] Détection PaymentIntent ID, recherche par paymentIntentId...
[GET-ORDER] Résultat Order.findOne: NON TROUVÉ
[GET-ORDER] Order not found, searching in ProductOrder collection...
[GET-ORDER] Résultat ProductOrder.findOne: TROUVÉ
[GET-ORDER] ProductOrder trouvée, construction réponse compatible
[GET-ORDER] SUCCESS - ProductOrder mappée en réponse compatible
```

---

### 📋 Test 2 : POST-SANCTUAIRE-SUBMIT (Order complète existe)

**Contexte :** L'utilisateur a soumis le formulaire du Sanctuaire, une `Order` complète a été créée.

**Étapes :**
1. Sur la page de confirmation, compléter le formulaire d'onboarding :
   - Date de naissance
   - Question de vie
   - Upload photos (visage + paume)
2. Soumettre le formulaire
3. Exécuter la même requête :
   ```bash
   curl -X GET http://localhost:3000/api/orders/{paymentIntentId}
   ```

**Résultat Attendu :**
```json
{
  "_id": "...",
  "orderNumber": "LU2501140001",
  "paymentIntentId": "pi_xxx",
  "status": "processing",
  "level": 1,
  "levelName": "Simple",
  "amount": 2700,
  "currency": "eur",
  "userEmail": "test@example.com",
  "formData": {
    "firstName": "Test",
    "lastName": "User",
    "email": "test@example.com",
    "dateOfBirth": "1990-01-01T00:00:00.000Z",
    "specificQuestion": "My life question"
  },
  "files": [
    {
      "name": "face_photo.jpg",
      "url": "https://...",
      "type": "face_photo"
    }
  ],
  "clientInputs": {
    "birthTime": "14:30",
    "birthPlace": "Paris"
  }
  // ... autres champs Order complets
}
```

**Validation :**
- ✅ Status HTTP : 200
- ✅ Champ `_source` ABSENT (c'est une vraie Order)
- ✅ Tous les champs `Order` présents (formData, files, clientInputs)
- ✅ `orderNumber` au format `LU{date}{séquence}`

**Logs Console Attendus :**
```
[GET-ORDER] Recherche commande avec ID: pi_xxx
[GET-ORDER] Détection PaymentIntent ID, recherche par paymentIntentId...
[GET-ORDER] Résultat Order.findOne: TROUVÉ
[GET-ORDER] SUCCESS - Order trouvée: {MongoDB ObjectId}
```

---

### 📋 Test 3 : COMMANDE INEXISTANTE (404)

**Contexte :** Requête avec un `paymentIntentId` qui n'existe ni dans `Order` ni dans `ProductOrder`.

**Étapes :**
```bash
curl -X GET http://localhost:3000/api/orders/pi_fake_nonexistent_12345
```

**Résultat Attendu :**
```json
{
  "error": "Order not found"
}
```

**Validation :**
- ✅ Status HTTP : 404
- ✅ Message d'erreur clair

**Logs Console Attendus :**
```
[GET-ORDER] Recherche commande avec ID: pi_fake_nonexistent_12345
[GET-ORDER] Détection PaymentIntent ID, recherche par paymentIntentId...
[GET-ORDER] Résultat Order.findOne: NON TROUVÉ
[GET-ORDER] Order not found, searching in ProductOrder collection...
[GET-ORDER] Résultat ProductOrder.findOne: NON TROUVÉ
[GET-ORDER] ERREUR 404 - Commande non trouvée pour ID: pi_fake_nonexistent_12345
```

---

### 📋 Test 4 : RECHERCHE PAR OBJECTID (Compatibilité)

**Contexte :** Requête avec un MongoDB ObjectId (format 24 caractères hex).

**Étapes :**
```bash
curl -X GET http://localhost:3000/api/orders/507f1f77bcf86cd799439011
```

**Résultat Attendu :**
- Si ObjectId existe dans `Order` : Retour de l'Order complète
- Sinon : 404

**Validation :**
- ✅ Pas de recherche dans `ProductOrder` (seulement pour `pi_xxx`)
- ✅ Utilisation de `Order.findById()` directement

**Logs Console Attendus :**
```
[GET-ORDER] Recherche commande avec ID: 507f1f77bcf86cd799439011
[GET-ORDER] Détection ObjectId, recherche par _id...
[GET-ORDER] Résultat findById: NON TROUVÉ / TROUVÉ
```

---

## Test de Régression

### Vérifications Critiques

**1. Webhook Stripe (payment.succeeded)**
- ✅ Crée bien une `ProductOrder` avec status `completed`
- ✅ Email client enregistré dans `customerEmail`
- ✅ `paymentIntentId` unique et indexé

**2. Frontend useOrderStatus Hook**
- ✅ Polling toutes les 3 secondes
- ✅ Reconnaît `status: 'paid'` comme succès
- ✅ Affiche message "Payment successful"
- ✅ Propose accès au Sanctuaire si `accessGranted: true`

**3. Soumission Formulaire Sanctuaire**
- ✅ Crée une `Order` complète depuis la `ProductOrder`
- ✅ Même `paymentIntentId` conservé
- ✅ Données client mappées correctement

---

## Validation en Production (Checklist)

### Avant Déploiement
- [ ] Compiler le backend : `cd apps/api-backend && npm run build`
- [ ] Vérifier aucune erreur TypeScript
- [ ] Tests unitaires passent : `npm test order-fallback.test.ts`

### Après Déploiement
- [ ] Test 1 validé (ProductOrder fallback)
- [ ] Test 2 validé (Order complète)
- [ ] Test 3 validé (404 correct)
- [ ] Test 4 validé (ObjectId search)
- [ ] Logs de production propres (pas d'erreurs 500)
- [ ] Monitoring : Temps de réponse < 500ms

### Surveillance Post-Déploiement (24h)
- [ ] Aucune erreur 404 sur `/api/orders/:id` pour des PaymentIntents valides
- [ ] Aucune régression sur le flow Sanctuaire
- [ ] Métriques Stripe : Taux de conversion maintenu
- [ ] Feedback utilisateurs : Pas de blocage post-paiement

---

## Critères de Succès

### Technique
1. ✅ Aucune erreur 404 pour des commandes valides (ProductOrder OU Order)
2. ✅ Frontend reçoit toujours une réponse exploitable
3. ✅ Mapping de statuts cohérent entre ProductOrder et Order
4. ✅ Performance maintenue (< 500ms par requête)
5. ✅ Logs détaillés pour debugging

### Métier
1. ✅ Utilisateur voit immédiatement confirmation après paiement
2. ✅ Flux de paiement → Sanctuaire fluide et sans erreur
3. ✅ Aucun paiement "perdu" entre ProductOrder et Order
4. ✅ Transition transparente vers le système unifié

---

## Prochaines Étapes (Stratégie Long Terme)

**Une fois ce correctif validé en production :**

1. **Phase 1 : Migration des Données** (1-2 jours)
   - Exécuter le script de migration MongoDB
   - Fusionner toutes les `ProductOrder` dans `Order`
   - Backup complet avant opération

2. **Phase 2 : Refactoring Routes** (2-3 jours)
   - Adapter `products.ts` pour créer directement des `Order`
   - Supprimer les références à `ProductOrder`
   - Tests de régression complets

3. **Phase 3 : Cleanup** (1 jour)
   - Supprimer le modèle `ProductOrder.ts`
   - Supprimer la logique de fallback (devenue inutile)
   - Documentation finale

**Estimation totale unification :** 1 semaine

---

## Rollback Plan

**Si le correctif pose problème en production :**

1. **Rollback Code :**
   ```bash
   git revert {commit_hash}
   cd apps/api-backend && npm run build
   # Redéployer
   ```

2. **Rollback Base de Données :**
   - Aucune modification DB dans ce correctif
   - Pas de rollback nécessaire

3. **Communication :**
   - Notifier l'équipe
   - Analyser les logs d'erreur
   - Préparer hotfix si nécessaire

---

**Document créé le :** 14 octobre 2025  
**Auteur :** Architecte Full Stack - Oracle Lumira  
**Status :** ✅ Prêt pour validation et déploiement  
**Commit Message Suggéré :**  
```
fix(api): implement fallback to ProductOrder on order status check

- Add ProductOrder import to orders.ts route
- Implement intelligent fallback logic in GET /api/orders/:id
- Map ProductOrder statuses to Order-compatible responses
- Add detailed logging for debugging
- Ensure frontend receives valid response in both scenarios

This tactical fix resolves 404 errors on order status polling
immediately after payment, while maintaining compatibility with
the full Order model workflow.

Ref: docs/architecture/01-order-model-unification-plan.md
```
