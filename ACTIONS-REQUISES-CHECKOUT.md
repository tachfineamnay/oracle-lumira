# ⚠️ ACTIONS REQUISES AVANT UTILISATION

## 🚨 ÉTAPES OBLIGATOIRES

### 1. Installation des Dépendances NPM

```bash
cd apps/main-app
npm install clsx tailwind-merge
```

**Pourquoi?** Les nouveaux composants utilisent la fonction `cn()` pour merger les classes Tailwind.

**Vérification**:
```bash
npm run build
# Doit réussir sans "Cannot find module 'clsx'"
```

---

### 2. Vérification des Services

Les composants dépendent de ces services. **Vérifiez qu'ils existent**:

#### ✅ `services/productOrder.service.ts`

Méthodes requises:

```typescript
export class ProductOrderService {
  // ✅ Devrait déjà exister
  static async createOrderWithPaymentIntent(data: {
    productId: string;
    amountCents: number;
    metadata?: Record<string, any>;
  }): Promise<{ clientSecret: string; orderId: string }> {
    // ...
  }

  // ⚠️ À CRÉER si manquant
  static async updateOrderCustomer(
    orderId: string,
    customer: {
      email: string;
      phone: string;
      firstName: string;
      lastName: string;
    }
  ): Promise<void> {
    const response = await fetch(`/api/orders/${orderId}/customer`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(customer),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update customer info');
    }
  }

  // ✅ Devrait déjà exister
  static validateEmail(email: string): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }
}
```

#### ✅ `services/product.service.ts`

Méthode requise:

```typescript
export class ProductService {
  static async getProductById(productId: string): Promise<Product> {
    const response = await fetch(`/api/products/${productId}`);
    if (!response.ok) {
      throw new Error('Product not found');
    }
    return response.json();
  }
}
```

---

### 3. Route Backend (si `updateOrderCustomer` n'existe pas)

Ajouter dans `apps/api-backend/src/routes/orders.ts`:

```typescript
router.patch('/:orderId/customer', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { email, phone, firstName, lastName } = req.body;

    const order = await Order.findByIdAndUpdate(
      orderId,
      {
        customerEmail: email,
        customerPhone: phone,
        customerName: `${firstName} ${lastName}`,
      },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

---

### 4. Variables d'Environnement

**`.env` dans `apps/main-app`**:

```bash
VITE_STRIPE_PUBLIC_KEY=pk_test_xxxxx  # ou pk_live_xxxxx en production
VITE_API_BASE_URL=http://localhost:3000
```

**`.env` dans `apps/api-backend`**:

```bash
STRIPE_SECRET_KEY=sk_test_xxxxx  # ou sk_live_xxxxx en production
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
```

---

## 🧪 TEST RAPIDE

Une fois les étapes 1-4 complétées:

```bash
# Terminal 1: Backend
cd apps/api-backend
npm run dev

# Terminal 2: Frontend
cd apps/main-app
npm run dev
```

**Naviguer vers**:
```
http://localhost:5173/commande-temple-v2?productId=6786dd7a44dd7fc8cd05d94d
```

**Checklist test**:
- [ ] Page charge sans erreur console
- [ ] Product summary s'affiche
- [ ] Express payments section visible (si Apple Pay/Google Pay dispo)
- [ ] Saisir email → Border verte + checkmark après 300ms
- [ ] Saisir téléphone → Format auto (06 12 34 56 78)
- [ ] Labels flottent au focus
- [ ] Stripe PaymentElement s'affiche
- [ ] Submit button disabled si champs invalides

---

## 🚀 ACTIVATION EN PRODUCTION

### Option A: Remplacement Direct

```bash
cd apps/main-app/src/pages
mv CommandeTempleSPA.tsx CommandeTempleSPA-OLD.tsx
mv CommandeTempleSPA-NEW.tsx CommandeTempleSPA.tsx
npm run build
```

### Option B: Test A/B (Recommandé)

```tsx
// apps/main-app/src/App.tsx
import CommandeTempleOld from './pages/CommandeTempleSPA';
import CommandeTempleNew from './pages/CommandeTempleSPA-NEW';

<Route path="/commande-temple" element={<CommandeTempleOld />} />
<Route path="/commande-temple-v2" element={<CommandeTempleNew />} />
```

Tester v2 pendant 1 semaine, comparer conversion rates, puis basculer.

---

## 📊 MONITORING POST-DÉPLOIEMENT

**KPIs à tracker**:
- Conversion rate checkout (objectif: +15-20%)
- Taux d'abandon (objectif: -25-30%)
- Utilisation express payments (objectif: 15-20%)
- Temps moyen sur page (objectif: -20%)

**Outils recommandés**:
- Google Analytics (funnels)
- Hotjar (heatmaps + recordings)
- Stripe Dashboard (payment methods breakdown)
- Sentry (error tracking)

---

## ❓ TROUBLESHOOTING

### Erreur: "Cannot find module 'clsx'"

**Solution**: Étape 1 non faite
```bash
cd apps/main-app
npm install clsx tailwind-merge
```

### Erreur: "ProductOrderService.updateOrderCustomer is not a function"

**Solution**: Étape 2-3 non faite - Ajouter méthode + route backend

### Express Payments ne s'affichent pas

**Causes**:
- Navigateur incompatible (Safari pour Apple Pay, Chrome pour Google Pay)
- HTTPS requis (OK sur localhost en dev)
- Wallet non configuré sur device

**Solution dev**: Tester sur localhost (auto HTTPS) avec wallet configuré

### Validation ne fonctionne pas

**Debug**: Check console pour erreurs validator

**Solution**: Vérifier `useValidationDebounce` hook importé correctement

---

## 📚 DOCUMENTATION COMPLÈTE

Consultez ces fichiers pour plus de détails:

1. **AUDIT-CHECKOUT-REFONTE-2025.md** (800+ lignes)
   - Analyse complète existant
   - Architecture cible détaillée
   - Exemples de code complets

2. **INTEGRATION-CHECKOUT-REFONTE-2025.md** (600+ lignes)
   - Guide d'intégration pas à pas
   - Tests manuels checklist
   - Troubleshooting avancé

3. **REFONTE-CHECKOUT-2025-RESUME.md** (500+ lignes)
   - Récapitulatif complet
   - Impact attendu
   - Démarrage rapide

---

## ✅ CHECKLIST FINALE

Avant de considérer la refonte "prête":

- [ ] Dépendances NPM installées (`clsx`, `tailwind-merge`)
- [ ] Services vérifés (`ProductOrderService`, `ProductService`)
- [ ] Route backend créée (`PATCH /api/orders/:orderId/customer`)
- [ ] Variables d'environnement configurées (`.env`)
- [ ] Build frontend réussi (`npm run build`)
- [ ] Tests manuels passés (checklist ci-dessus)
- [ ] Payment test Stripe réussi (carte `4242...`)
- [ ] Documentation lue (au moins INTEGRATION guide)

---

**Une fois ces étapes complétées, votre checkout refonte 2025 est prêt à convertir ! 🚀**
