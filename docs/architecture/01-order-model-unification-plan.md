# Plan d'Unification des Modèles Order et ProductOrder

## Vue d'Ensemble

Ce document planifie l'unification des deux modèles de commandes actuellement présents dans l'application Lumira :
- `Order` (modèle principal et complexe)
- `ProductOrder` (modèle simplifié pour les paiements)

Cette unification vise à éliminer la dette technique, réduire la complexité et éviter les incohérences de données.

## 1. Analyse Comparative des Modèles

### 1.1. Modèle Order (Principal - `apps/api-backend/src/models/Order.ts`)

**Points Forts :**
- Modèle riche et complet avec tous les champs métier nécessaires
- Support complet du workflow Lumira (formData, clientInputs, expertValidation)
- Gestion des fichiers S3 avec métadonnées complètes
- Système de révision et validation expert intégré
- Tracking complet du cycle de vie (pending → processing → awaiting_validation → completed)
- Intégration Stripe avancée avec métadonnées

**Champs Spécifiques :**
```typescript
- orderNumber: string (unique, auto-généré)
- level: 1|2|3|4 & levelName: enum
- formData: {firstName, lastName, email, phone, dateOfBirth, specificQuestion, preferences}
- files: Array<{name, url, key, contentType, size, type, uploadedAt}>
- clientInputs: {birthTime, birthPlace, specificContext, lifeQuestion}
- expertPrompt, expertInstructions: string
- generatedContent: {archetype, reading, audioUrl, pdfUrl, mandalaSvg, ritual, blockagesAnalysis, soulProfile}
- expertReview & expertValidation: validation workflow complet
- revisionCount: number
- deliveredAt, deliveryMethod: string
```

### 1.2. Modèle ProductOrder (Simplifié - `apps/api-backend/src/models/ProductOrder.ts`)

**Points Forts :**
- Simple et focalisé sur les transactions de paiement
- Interface claire pour le système de paiement Stripe
- Statuts orientés transaction (pending → processing → completed)

**Champs Spécifiques :**
```typescript
- productId: string (référence au produit)
- customerId?: string (Stripe customer ID optionnel)
- customerEmail?: string (email client)
- amount, currency: transaction basique
- status: ProductOrderStatus (5 états)
- paymentIntentId: string (unique, Stripe)
- completedAt?: Date
- metadata?: Record<string, any>
```

### 1.3. Champs Communs

| Champ | Order | ProductOrder | Notes |
|-------|--------|--------------|-------|
| `_id` | ✓ | ✓ | MongoDB ObjectId |
| `amount` | ✓ | ✓ | Montant en centimes |
| `currency` | ✓ | ✓ | Code devise (default: 'eur') |
| `status` | ✓ | ✓ | États différents mais compatibles |
| `paymentIntentId` | ✓ (optionnel) | ✓ (requis) | Stripe PaymentIntent |
| `createdAt/updatedAt` | ✓ | ✓ | Timestamps automatiques |

## 2. Modèle Unifié Proposé

### 2.1. Stratégie d'Unification

**Approche recommandée :** Étendre le modèle `Order` existant pour absorber les fonctionnalités de `ProductOrder`.

**Justifications :**
1. `Order` est plus récent et plus riche fonctionnellement
2. `Order` contient déjà tous les champs nécessaires pour le workflow complet
3. La plupart des fonctionnalités critiques sont dans `Order`
4. Migration plus simple : étendre `Order` plutôt que refactoriser tout

### 2.2. Schema Mongoose Unifié Final

```typescript
export interface IUnifiedOrder extends Document {
  _id: mongoose.Types.ObjectId;
  
  // Identifiants et références
  orderNumber: string; // Auto-généré unique (LU240112001)
  userId: mongoose.Types.ObjectId; // Référence User
  userEmail: string; // Email client (index)
  userName?: string; // Nom utilisateur
  
  // Produit et niveau (fusion Order + ProductOrder)
  productId?: string; // Hérité de ProductOrder pour compatibilité
  level: 1 | 2 | 3 | 4; // Niveau Lumira
  levelName: 'Simple' | 'Intuitive' | 'Alchimique' | 'Intégrale';
  
  // Transaction et paiement
  amount: number; // Montant en centimes
  currency: string; // Code devise
  paymentIntentId: string; // Stripe PaymentIntent (requis, unique)
  stripeSessionId?: string; // Session Stripe Checkout
  customerId?: string; // Hérité de ProductOrder - Stripe Customer ID
  
  // États et workflow
  status: 'pending' | 'paid' | 'processing' | 'awaiting_validation' | 'completed' | 'failed' | 'refunded' | 'cancelled';
  paidAt?: Date;
  completedAt?: Date; // Hérité de ProductOrder
  
  // Données client et formulaire
  formData: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    dateOfBirth?: Date;
    specificQuestion?: string;
    preferences?: {
      audioVoice?: 'masculine' | 'feminine';
      deliveryFormat?: 'email' | 'whatsapp';
    };
  };
  
  // Fichiers clients (photos de visage et paume)
  files?: Array<{
    name: string;
    url: string;
    key: string;
    contentType: string;
    size: number;
    type: 'face_photo' | 'palm_photo';
    uploadedAt: Date;
  }>;
  
  // Inputs clients additionnels
  clientInputs?: {
    birthTime?: string;
    birthPlace?: string;
    specificContext?: string;
    lifeQuestion?: string;
  };
  
  // Traitement expert
  expertPrompt?: string;
  expertInstructions?: string;
  expertId?: string; // Expert assigné
  service?: string; // Type de service
  duration?: number; // Durée en minutes
  
  // Contenu généré par IA
  generatedContent?: {
    archetype?: string;
    reading?: string;
    audioUrl?: string;
    pdfUrl?: string;
    mandalaSvg?: string;
    ritual?: string;
    blockagesAnalysis?: string;
    soulProfile?: string;
  };
  
  // Validation expert
  expertReview?: {
    expertId?: string;
    expertName?: string;
    assignedAt?: Date;
    status: 'pending' | 'approved' | 'rejected' | 'revision_needed';
    notes?: string;
    reviewedAt?: Date;
  };
  
  expertValidation?: {
    validatorId?: string;
    validatorName?: string;
    validationStatus: 'pending' | 'approved' | 'rejected';
    validationNotes?: string;
    validatedAt?: Date;
    rejectionReason?: string;
  };
  
  // Révisions et erreurs
  revisionCount: number; // Default: 0
  errorLog?: string;
  
  // Livraison
  deliveredAt?: Date;
  deliveryMethod?: 'email' | 'whatsapp';
  
  // Métadonnées et extension
  metadata?: Record<string, any>; // Hérité de ProductOrder pour flexibilité
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}
```

### 2.3. Changements d'État Unifiés

```
Workflow Unifié :
pending → paid → processing → awaiting_validation → completed
    ↓       ↓         ↓              ↓
  failed  failed   failed        rejected → processing (révision)
    ↓       ↓         ↓
cancelled refunded cancelled
```

## 3. Plan de Refactoring Détaillé

### 3.1. Fichiers API Backend Impactés

#### Routes à Modifier (`apps/api-backend/src/routes/`)

1. **`orders.ts`** (Impact: MAJEUR)
   - Route principale utilisant massivement le modèle Order
   - Modifications nécessaires : Aucune (déjà compatible)
   - Tests requis : Validation complète du workflow client-submit

2. **`expert.ts`** (Impact: MAJEUR)  
   - Gestion complète du workflow expert
   - Modifications nécessaires : Aucune (déjà compatible)
   - Tests requis : Validation queue, process-order, validate-content

3. **`products.ts`** (Impact: CRITIQUE)
   - Utilise actuellement ProductOrder pour les achats
   - **Action requise :** Remplacer `ProductOrder` par `UnifiedOrder`
   - **Mappings requis :**
     ```typescript
     // Ancien ProductOrder
     productId → productId (conservation)
     customerId → customerId (conservation) 
     customerEmail → userEmail (renommage)
     amount → amount (conservation)
     paymentIntentId → paymentIntentId (conservation)
     
     // Nouveaux champs requis
     + orderNumber (auto-généré)
     + level (déterminé par productId)
     + levelName (mapping depuis level)
     + userId (recherche/création depuis customerEmail)
     ```

4. **`payments.ts`** (Impact: MODÉRÉ)
   - Utilise Order pour gestion des paiements
   - Modifications nécessaires : Validation des nouveaux champs optionnels
   - Tests requis : Webhooks Stripe, PaymentIntent validation

5. **`stripe.ts`** (Impact: MODÉRÉ)
   - Intégration Stripe avec Order
   - Modifications nécessaires : Support des champs ProductOrder intégrés
   - Tests requis : Création PaymentIntent, webhook handling

6. **`users.ts`** (Impact: MODÉRÉ)
   - Importe Order ET ProductOrder actuellement
   - **Action requise :** Supprimer import ProductOrder, utiliser UnifiedOrder uniquement
   - Tests requis : Entitlements, user orders history

#### Modèles à Modifier (`apps/api-backend/src/models/`)

1. **Créer `UnifiedOrder.ts`** 
   - Nouveau modèle unifié basé sur Order.ts actuel
   - Ajouter champs ProductOrder (productId, customerId, completedAt, metadata)
   - Conserver tous les champs Order existants

2. **Migrer `Order.ts`** 
   - Renommer vers `LegacyOrder.ts` (temporaire)
   - Ou directement remplacer par UnifiedOrder

3. **Supprimer `ProductOrder.ts`**
   - Après migration complète des données

#### Services Impactés (`apps/api-backend/src/services/`)

1. **`stripe.ts`** (Impact: MODÉRÉ)
   - Type imports depuis `../types/payments` 
   - **Action :** Vérifier compatibilité types Order

### 3.2. Fichiers Frontend Impactés

#### Applications Frontend (`apps/main-app/`, `apps/expert-desk/`)

1. **`apps/main-app/src/services/productOrder.ts`** (Impact: CRITIQUE)
   - Service frontend pour ProductOrder
   - **Action requise :** Adapter pour utiliser l'API unifiée
   - **Changements :**
     ```typescript
     // Ancien endpoint
     POST /api/products/purchase → POST /api/orders/create-from-product
     
     // Nouveaux champs response
     + orderNumber, level, levelName
     + formData structure complète
     ```

2. **`apps/main-app/src/hooks/useProducts.ts`** (Impact: MODÉRÉ)
   - Utilise ProductOrderService
   - **Action :** Adapter pour nouveaux types et endpoints

3. **`apps/expert-desk/src/types/Order.ts`** (Impact: MINEUR)
   - Interface Order frontend (déjà compatible)
   - **Action :** Ajouter champs ProductOrder si nécessaire

4. **`apps/main-app/src/hooks/useSanctuaire.ts`** (Impact: MINEUR)
   - Service sanctuaire utilisant CompletedOrder
   - **Action :** Vérifier compatibilité avec nouveaux champs

### 3.3. Types et Interfaces (`apps/api-backend/src/types/`)

1. **`payments.ts`** (Impact: MODÉRÉ)
   - Contient interface Order simplifiée
   - **Action :** Unifier avec IUnifiedOrder ou supprimer doublon

## 4. Stratégie de Migration des Données

### 4.1. Migration MongoDB

#### Phase 1 : Préparation (Sans Interruption)
```javascript
// Script de migration : migrate-orders.js
db.orders.updateMany(
  { productId: { $exists: false } },
  { 
    $set: { 
      productId: null,
      customerId: null,
      completedAt: null,
      metadata: {},
      revisionCount: 0
    } 
  }
);
```

#### Phase 2 : Migration ProductOrder → UnifiedOrder
```javascript
// Copier toutes les ProductOrder vers la collection orders
db.productorders.find().forEach(function(productOrder) {
  // Déterminer level depuis productId
  const levelMapping = {
    'simple': { level: 1, levelName: 'Simple' },
    'intuitive': { level: 2, levelName: 'Intuitive' },
    'alchimique': { level: 3, levelName: 'Alchimique' },
    'integrale': { level: 4, levelName: 'Intégrale' }
  };
  
  const productLevel = levelMapping[productOrder.productId] || levelMapping['simple'];
  
  // Rechercher ou créer User depuis customerEmail
  let user = db.users.findOne({ email: productOrder.customerEmail });
  if (!user && productOrder.customerEmail) {
    const local = productOrder.customerEmail.split('@')[0];
    user = {
      _id: new ObjectId(),
      email: productOrder.customerEmail,
      firstName: local.charAt(0).toUpperCase() + local.slice(1),
      lastName: 'Client',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    db.users.insertOne(user);
  }
  
  // Générer orderNumber unique
  const date = new Date(productOrder.createdAt);
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  
  const lastOrder = db.orders.findOne(
    { orderNumber: new RegExp(`^LU${year}${month}${day}`) },
    { sort: { orderNumber: -1 } }
  );
  
  let sequence = 1;
  if (lastOrder) {
    sequence = parseInt(lastOrder.orderNumber.slice(-3)) + 1;
  }
  const orderNumber = `LU${year}${month}${day}${sequence.toString().padStart(3, '0')}`;
  
  // Créer l'order unifié
  const unifiedOrder = {
    _id: new ObjectId(),
    orderNumber: orderNumber,
    userId: user._id,
    userEmail: productOrder.customerEmail || user.email,
    userName: user.firstName + ' ' + user.lastName,
    
    // Champs ProductOrder
    productId: productOrder.productId,
    customerId: productOrder.customerId,
    amount: productOrder.amount,
    currency: productOrder.currency,
    paymentIntentId: productOrder.paymentIntentId,
    completedAt: productOrder.completedAt,
    metadata: productOrder.metadata || {},
    
    // Champs Order (mappés)
    level: productLevel.level,
    levelName: productLevel.levelName,
    status: productOrder.status, // États compatibles
    paidAt: productOrder.status === 'completed' ? productOrder.completedAt : null,
    
    // FormData minimal depuis ProductOrder
    formData: {
      firstName: user.firstName,
      lastName: user.lastName,
      email: productOrder.customerEmail || user.email,
      specificQuestion: '',
      preferences: {
        audioVoice: 'feminine',
        deliveryFormat: 'email'
      }
    },
    
    // Champs Order par défaut
    files: [],
    clientInputs: {},
    revisionCount: 0,
    
    // Timestamps
    createdAt: productOrder.createdAt,
    updatedAt: productOrder.updatedAt
  };
  
  // Insérer dans la collection orders
  db.orders.insertOne(unifiedOrder);
});
```

#### Phase 3 : Validation et Nettoyage
```javascript
// Vérifier intégrité
print("Orders migrées :", db.orders.countDocuments({ productId: { $exists: true } }));
print("ProductOrders originales :", db.productorders.countDocuments({}));

// Sauvegarder ProductOrders → Suppression après validation complète
db.productorders.renameCollection("productorders_backup_" + new Date().getTime());
```

### 4.2. Rollback Strategy

```javascript
// En cas de problème : restauration depuis backup
db.productorders_backup_[TIMESTAMP].renameCollection("productorders");
db.orders.deleteMany({ productId: { $exists: true } });
```

## 5. Tests et Validation

### 5.1. Tests Critiques Requis

#### Tests Backend
```typescript
describe('UnifiedOrder Model', () => {
  it('should create order from ProductOrder data', async () => {
    const productOrderData = {
      productId: 'simple',
      customerEmail: 'test@example.com',
      amount: 2900,
      paymentIntentId: 'pi_test123'
    };
    
    const order = await UnifiedOrder.create({
      ...productOrderData,
      // ... mapping complet
    });
    
    expect(order.level).toBe(1);
    expect(order.levelName).toBe('Simple');
    expect(order.orderNumber).toMatch(/^LU\d{6}\d{3}$/);
  });
  
  it('should maintain Order workflow compatibility', async () => {
    // Tests complets du workflow existant
  });
});
```

#### Tests API Routes
```typescript
describe('Products API with UnifiedOrder', () => {
  it('POST /api/products/purchase should create UnifiedOrder', async () => {
    const response = await request(app)
      .post('/api/products/purchase')
      .send({
        productId: 'intuitive',
        customerEmail: 'test@example.com'
      });
    
    expect(response.body.orderNumber).toBeDefined();
    expect(response.body.level).toBe(2);
  });
});
```

#### Tests Frontend
```typescript
describe('ProductOrder Service Migration', () => {
  it('should handle UnifiedOrder responses', async () => {
    const result = await ProductOrderService.createOrder({
      productId: 'alchimique'
    });
    
    expect(result.orderNumber).toBeDefined();
    expect(result.levelName).toBe('Alchimique');
  });
});
```

### 5.2. Validation de Migration

1. **Comptage des enregistrements**
   ```sql
   SELECT COUNT(*) FROM orders; -- Doit inclure anciennes + nouvelles
   SELECT COUNT(*) FROM productorders_backup; -- Sauvegarde
   ```

2. **Intégrité des PaymentIntents**
   ```javascript
   // Vérifier unicité des paymentIntentId
   db.orders.aggregate([
     { $group: { _id: "$paymentIntentId", count: { $sum: 1 } } },
     { $match: { count: { $gt: 1 } } }
   ]); // Doit retourner vide
   ```

3. **Cohérence des montants**
   ```javascript
   // Comparer sommes avant/après migration
   const oldSum = db.productorders_backup.aggregate([
     { $group: { _id: null, total: { $sum: "$amount" } } }
   ]);
   const newSum = db.orders.aggregate([
     { $match: { productId: { $exists: true } } },
     { $group: { _id: null, total: { $sum: "$amount" } } }
   ]);
   ```

## 6. Planning d'Exécution

### Phase 1 : Préparation (1-2 jours)
- [ ] Créer le modèle UnifiedOrder
- [ ] Écrire les scripts de migration
- [ ] Préparer les tests de validation
- [ ] Backup complet de la base de données

### Phase 2 : Migration Backend (2-3 jours)
- [ ] Déployer le nouveau modèle UnifiedOrder
- [ ] Migrer les données ProductOrder → UnifiedOrder
- [ ] Adapter les routes products.ts et users.ts
- [ ] Valider tous les endpoints API
- [ ] Tests de régression complets

### Phase 3 : Migration Frontend (1-2 jours)
- [ ] Adapter ProductOrderService
- [ ] Mettre à jour les hooks et composants
- [ ] Tests end-to-end
- [ ] Validation UX complète

### Phase 4 : Nettoyage et Optimisation (1 jour)
- [ ] Supprimer ProductOrder.ts
- [ ] Nettoyer les imports obsolètes
- [ ] Optimiser les index MongoDB
- [ ] Documentation finale

### Phase 5 : Monitoring Post-Migration (1 semaine)
- [ ] Surveillance des performances
- [ ] Validation continue des données
- [ ] Correction des bugs mineurs
- [ ] Suppression des backups après validation

## 7. Risques et Mitigation

### Risques Identifiés

1. **Perte de données pendant migration**
   - **Mitigation :** Backups complets, migration en mode maintenance
   - **Rollback :** Scripts de restauration prêts

2. **Incompatibilité des types existants**
   - **Mitigation :** Tests exhaustifs, migration progressive
   - **Rollback :** Compatibilité ascendante maintenue

3. **Performance dégradée**
   - **Mitigation :** Index optimisés, monitoring continu
   - **Rollback :** Index de performance sur champs critiques

4. **Interruption de service**
   - **Mitigation :** Migration en heures creuses, déploiement blue-green
   - **Rollback :** Basculement rapide vers version antérieure

### Critères de Succès

1. ✅ Aucune perte de données transactionnelles
2. ✅ Tous les workflows client/expert fonctionnels
3. ✅ Performance maintenue ou améliorée
4. ✅ Code plus maintenable et cohérent
5. ✅ Suppression complète de la duplication Order/ProductOrder

## Conclusion

L'unification des modèles Order et ProductOrder représente une étape cruciale pour la stabilité et la maintenabilité de l'application Lumira. En s'appuyant sur le modèle Order existant (plus riche) et en y intégrant les fonctionnalités essentielles de ProductOrder, nous obtenons un modèle unifié robuste qui supporte l'ensemble des workflows métier.

Cette migration, bien que complexe, permettra d'éliminer une dette technique majeure et de poser les bases d'une architecture plus cohérente pour les développements futurs.

---

**Document créé le :** 12 octobre 2025  
**Statut :** Planification - Prêt pour implémentation  
**Prochaine étape :** Validation par l'équipe technique et démarrage Phase 1