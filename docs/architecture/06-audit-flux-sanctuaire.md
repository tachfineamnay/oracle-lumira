# 🔍 AUDIT COMPLET : Flux Commande → Sanctuaire → Formulaire

**Date** : 2025-10-16  
**Objectif** : Refonte du formulaire d'onboarding pour pré-remplissage automatique des données de paiement

---

## 📊 ANALYSE DU FLUX ACTUEL

### 1️⃣ ÉTAPE PAIEMENT (`CommandeTempleSPA.tsx`)

**État actuel** :
```
Utilisateur remplit :
- Email ✅
- Téléphone ✅
- Prénom ✅
- Nom ✅

→ createPaymentIntent(productId, email, name, phone)
→ PaymentIntent créé avec metadata Stripe
→ Paiement réussi
→ Redirect vers /payment-success?orderId=X&email=Y
```

**Données capturées** :
- `customerEmail` → Metadata Stripe
- `customerName` → Metadata Stripe (firstName + lastName concaténé)
- `customerPhone` → Metadata Stripe

**Point de transfert** :
```typescript
handlePaymentSuccess(orderId, email) {
  navigate(`/payment-success?orderId=${orderId}&email=${encodeURIComponent(email)}`);
}
```

---

### 2️⃣ ÉTAPE CONFIRMATION (`ConfirmationTempleSPA.tsx`)

**État actuel** :
```
Reçoit : ?order_id=X&email=Y
→ Polling useOrderStatus(orderId)
→ Attend status === 'completed' && accessGranted === true
→ Redirect vers /sanctuaire?email=Y&order_id=X&payment_intent=Z
```

**Données transmises** :
- `email` (passé en URL)
- `order_id` (paymentIntentId)
- `payment_intent` (de orderData.paymentIntentId)

**Stockage** :
```typescript
localStorage.setItem('oraclelumira_last_payment_intent_id', paymentIntentId);
```

---

### 3️⃣ ÉTAPE SANCTUAIRE (`Sanctuaire.tsx`)

**État actuel** :
```
Route /sanctuaire/* → SanctuaireProvider
→ Vérifie token dans localStorage
→ Si PAS de token : mode non-authentifié
→ Affiche OnboardingForm (si !profileCompleted)
```

**Problème identifié** :
❌ **Aucune authentification automatique après paiement**
❌ **useSanctuaire() retourne user = null car pas de token**
❌ **OnboardingForm ne peut pas pré-remplir les données**

---

### 4️⃣ ÉTAPE FORMULAIRE (`OnboardingForm.tsx`)

**État actuel** :

**Structure actuelle (3 étapes)** :
1. **Naissance** : Date, heure, lieu
2. **Intention** : Question spirituelle, objectif
3. **Photos** : Face + Palm upload

**Données utilisateur attendues** :
```typescript
const { user } = useSanctuaire(); // ❌ NULL car pas de token

// Tentative de fallback
const [customerData, setCustomerData] = useState({
  email, phone, firstName, lastName
});

// Chargement depuis ProductOrder
useEffect(() => {
  fetch(`/api/orders/${paymentIntentId}`)
    .then(data => {
      const metadata = data.order.metadata;
      setCustomerData({
        email: metadata.customerEmail,
        phone: metadata.customerPhone,
        firstName: metadata.customerName.split(' ')[0],
        lastName: metadata.customerName.split(' ').slice(1).join(' ')
      });
    });
}, [paymentIntentId]);
```

**Soumission** :
```typescript
const jsonData = {
  email: user?.email || customerData.email,
  phone: customerData.phone,
  firstName: user?.firstName || customerData.firstName,
  lastName: user?.lastName || customerData.lastName,
  dateOfBirth, birthTime, birthPlace,
  specificQuestion, objective
};

fetch(`/api/orders/by-payment-intent/${paymentIntentId}/client-submit`, {
  method: 'POST',
  body: FormData (jsonData + photos)
});
```

---

## 🚨 PROBLÈMES IDENTIFIÉS

### Problème 1 : Absence d'authentification automatique
**Impact** : `user = null` → Impossible de pré-remplir via `useSanctuaire()`  
**Cause** : Aucun token créé automatiquement après paiement  
**Solution requise** : Auto-authentification avec email du paiement

### Problème 2 : Formulaire trop verbeux
**Impact** : UX lourde, beaucoup de champs à remplir  
**Cause** : Formulaire monolithique, pas assez compact  
**Solution requise** : Refonte multi-steps compacte

### Problème 3 : Données de base demandées 2 fois
**Impact** : Frustration utilisateur (re-saisie email, téléphone, nom, prénom)  
**Cause** : Pas de pré-remplissage effectif  
**Solution requise** : Affichage read-only ou masquage total si déjà capturées

### Problème 4 : Dépendance stricte à SanctuaireProvider
**Impact** : Si provider échoue, tout le formulaire échoue  
**Cause** : Architecture trop couplée  
**Solution requise** : Fallback robuste sur ProductOrder metadata

---

## ✅ PLAN D'ACTION : REFONTE DU FORMULAIRE

### 🎯 Objectifs

1. **Formulaire compact multi-steps** (4 étapes max)
2. **Pré-remplissage automatique** des données de paiement
3. **Affichage read-only** ou **masquage** des champs déjà remplis
4. **Validation progressive** avec feedback visuel
5. **Conserv visuel stellar/celeste**

---

### 📐 NOUVELLE ARCHITECTURE

#### Étape 0 : BIENVENUE (nouveau)
**Affichage** :
```
┌─────────────────────────────────────────┐
│  ✨ Bienvenue, [Prénom] [Nom] !         │
│                                          │
│  Email : [email]@example.com ✅          │
│  Téléphone : +33 6 12 34 56 78 ✅        │
│                                          │
│  Vos informations sont enregistrées ✨   │
│                                          │
│  [Continuer →]                           │
└─────────────────────────────────────────┘
```

**Fonctionnalité** :
- Affiche nom, email, téléphone en **read-only**
- Message de confirmation
- Bouton "Continuer" pour passer aux données spirituelles

---

#### Étape 1 : NAISSANCE (compact)
```
┌─────────────────────────────────────────┐
│  📅 Votre Carte Natale                  │
│                                          │
│  Date : [__/__/____]                     │
│  Heure : [__:__]                         │
│  Lieu : [Ville, Pays__________]          │
│                                          │
│  [← Retour]  [Suivant →]                 │
└─────────────────────────────────────────┘
```

---

#### Étape 2 : INTENTION (compact)
```
┌─────────────────────────────────────────┐
│  💫 Votre Intention Spirituelle          │
│                                          │
│  Question :                              │
│  [_________________________________]     │
│  [_________________________________]     │
│                                          │
│  Objectif :                              │
│  [_________________________________]     │
│  [_________________________________]     │
│                                          │
│  [← Retour]  [Suivant →]                 │
└─────────────────────────────────────────┘
```

---

#### Étape 3 : PHOTOS (final)
```
┌─────────────────────────────────────────┐
│  📸 Vos Photos Personnelles             │
│                                          │
│  [📷 Visage]     [🖐️ Paume]            │
│  [Upload]        [Upload]                │
│                                          │
│  [← Retour]  [✨ Finaliser]              │
└─────────────────────────────────────────┘
```

---

### 🔧 MODIFICATIONS TECHNIQUES

#### 1. Ajout d'une étape 0 (Bienvenue)

**Nouveau composant** : `Step0Welcome`

```typescript
const Step0Welcome = ({ userData }) => (
  <motion.div className="space-y-6">
    <h3 className="text-2xl font-playfair text-amber-400">
      Bienvenue, {userData.firstName} {userData.lastName} !
    </h3>
    
    <div className="space-y-3 bg-white/5 p-4 rounded-lg">
      <div className="flex items-center gap-2">
        <Mail className="w-5 h-5 text-green-400" />
        <span className="text-white/80">{userData.email}</span>
        <Check className="w-4 h-4 text-green-400 ml-auto" />
      </div>
      
      <div className="flex items-center gap-2">
        <Phone className="w-5 h-5 text-green-400" />
        <span className="text-white/80">{userData.phone}</span>
        <Check className="w-4 h-4 text-green-400 ml-auto" />
      </div>
    </div>
    
    <p className="text-sm text-white/60 text-center">
      Vos informations de base sont enregistrées ✨
    </p>
  </motion.div>
);
```

---

#### 2. Réduction de la verbosité

**Avant** :
```typescript
// 3 étapes : Naissance, Intention, Photos
currentStep: 1 | 2 | 3
```

**Après** :
```typescript
// 4 étapes : Bienvenue, Naissance, Intention, Photos
currentStep: 0 | 1 | 2 | 3
```

---

#### 3. Chargement automatique des données

**Amélioration du useEffect** :

```typescript
useEffect(() => {
  const loadUserData = async () => {
    // 1. Tenter useSanctuaire() d'abord
    if (user?.email) {
      setUserData({
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: '' // Pas dans SanctuaireUser
      });
      return;
    }
    
    // 2. Fallback : charger depuis ProductOrder metadata
    if (paymentIntentId) {
      const response = await fetch(`/api/orders/${paymentIntentId}`);
      const data = await response.json();
      const metadata = data.order.metadata;
      
      const nameParts = (metadata.customerName || '').split(' ');
      setUserData({
        email: metadata.customerEmail || '',
        phone: metadata.customerPhone || '',
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || ''
      });
    }
  };
  
  loadUserData();
}, [user, paymentIntentId]);
```

---

#### 4. Validation progressive

**Ajout de validation par étape** :

```typescript
const canProceedToStep = (step: number): boolean => {
  switch(step) {
    case 0: return true; // Bienvenue, toujours OK
    case 1: return formData.birthDate && formData.birthTime && formData.birthPlace;
    case 2: return formData.specificQuestion && formData.objective;
    case 3: return formData.facePhoto && formData.palmPhoto;
    default: return false;
  }
};
```

---

### 🎨 DESIGN COMPACT

**Principes** :
- **Hauteur fixe** : max-h-[600px] pour éviter scroll excessif
- **Espacement réduit** : gap-4 au lieu de gap-6
- **Labels intégrés** : Floating labels ou placeholders clairs
- **Icônes parlantes** : Visuel immédiat de chaque étape
- **Progress bar** : 4 cercles au lieu de 3

**Code Progress Bar** :
```typescript
<div className="flex items-center justify-center gap-2 mb-6">
  {[0, 1, 2, 3].map((step) => (
    <div key={step} className="flex items-center">
      <div className={cn(
        "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all",
        step === currentStep 
          ? "bg-amber-400 text-mystical-900 scale-110"
          : step < currentStep
          ? "bg-amber-400/50 text-white"
          : "bg-white/10 text-white/40"
      )}>
        {step < currentStep ? <Check className="w-4 h-4" /> : step}
      </div>
      {step < 3 && (
        <div className={cn(
          "w-10 h-0.5 mx-1",
          step < currentStep ? "bg-amber-400/50" : "bg-white/10"
        )} />
      )}
    </div>
  ))}
</div>
```

---

### 📝 RÉSUMÉ DES CHANGEMENTS

| Fichier | Type | Description |
|---------|------|-------------|
| `OnboardingForm.tsx` | Refonte | Ajout étape 0, champs compact, pré-remplissage robuste |
| `Sanctuaire.tsx` | Minimal | Vérifier affichage OnboardingForm |
| `ConfirmationTempleSPA.tsx` | OK | Déjà transmet email + paymentIntent |
| `CommandeTempleSPA.tsx` | OK | Déjà envoie metadata correctement |

---

### ✅ CHECKLIST DE VALIDATION

- [ ] Étape 0 affiche nom, email, téléphone en read-only
- [ ] Étape 1 (Naissance) compact et claire
- [ ] Étape 2 (Intention) textareas optimisées
- [ ] Étape 3 (Photos) upload simple et visuel
- [ ] Progress bar 4 steps fonctionnelle
- [ ] Validation progressive bloque navigation
- [ ] Fallback ProductOrder metadata fonctionne
- [ ] Soumission finale envoie toutes les données
- [ ] Design celeste/stellar préservé
- [ ] Mobile responsive (max-w-2xl)

---

## 🚀 IMPLÉMENTATION

Fichier cible : `apps/main-app/src/components/sanctuaire/OnboardingForm.tsx`

Stratégie :
1. Backup actuel
2. Refonte complète avec nouvelle structure
3. Test manuel complet
4. Commit avec message descriptif
