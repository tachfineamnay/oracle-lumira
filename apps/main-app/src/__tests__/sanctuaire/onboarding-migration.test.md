# 🔬 Tests Chirurgicaux - Migration Onboarding Refonte 2025

> **Objectif** : Garantir que la migration du formulaire d'onboarding ne casse AUCUN système critique (paiement, onboarding, dashboard).

## ✅ TEST 1 : Intégrité des Imports/Exports

### 1.1 Vérifier l'export de OnboardingForm
**Fichier** : `apps/main-app/src/components/sanctuaire/OnboardingForm.tsx`

- [x] Export nommé : `export const OnboardingForm: React.FC<OnboardingFormProps>`
- [x] Export par défaut : `export default OnboardingForm;`
- [x] Les deux exports sont présents (compatibilité legacy)

### 1.2 Vérifier l'import dans Sanctuaire.tsx
**Fichier** : `apps/main-app/src/pages/Sanctuaire.tsx`

- [x] Import nommé correct : `import { OnboardingForm } from '../components/sanctuaire/OnboardingForm';`
- [x] Utilisation dans JSX : `<OnboardingForm />` (ligne 146)
- [x] Import de l'ancien formulaire supprimé : `SanctuaireWelcomeForm` non utilisé

### 1.3 Vérifier l'import de useUserLevel
**Fichier** : `apps/main-app/src/components/sanctuaire/OnboardingForm.tsx`

- [x] Import présent : `import { useUserLevel } from '../../contexts/UserLevelContext';`
- [x] Extraction du hook : `const { updateUserProfile } = useUserLevel();`
- [x] Appel après soumission : `updateUserProfile({ profileCompleted: true, ... })`

### 1.4 Vérifier la compilation TypeScript
**Commande** : `npm run type-check` ou vérifier dans l'IDE

- [x] Aucune erreur de compilation détectée
- [x] Tous les types sont bien inférés

**RÉSULTAT TEST 1** : ✅ **RÉUSSI** - Tous les imports/exports sont corrects

---

## ✅ TEST 2 : Flux Nouveau Client (Paiement → Onboarding → Dashboard)

### 2.1 Test du flux de paiement
**Page de départ** : `/commande?product=mystique`

**Étapes** :
1. Remplir le formulaire :
   - Email : test@lumira.com
   - Téléphone : +33612345678
   - Prénom : Jean
   - Nom : Dupont
   - Carte test : 4242 4242 4242 4242
   - Date : 12/26
   - CVC : 123

2. Cliquer sur "Payer" → **Vérifier** :
   - [ ] Redirection vers `/confirmation?payment_intent=pi_xxx`
   - [ ] Message de succès affiché
   - [ ] PaymentIntentId stocké dans localStorage : `last_payment_intent_id`

### 2.2 Test de la redirection automatique
**Page** : `/confirmation?payment_intent=pi_xxx`

**Vérifications** :
- [ ] Redirection automatique après 3 secondes vers `/sanctuaire?payment_intent=pi_xxx`
- [ ] Marqueur `first_visit=true` dans sessionStorage
- [ ] URL contient le paymentIntentId

### 2.3 Test de l'affichage du formulaire d'onboarding
**Page** : `/sanctuaire?payment_intent=pi_xxx`

**Vérifications** :
- [ ] OnboardingForm s'affiche en overlay (position fixed, z-50)
- [ ] Étape 0 affichée : "Complétez votre Profil"
- [ ] Données pré-remplies visibles :
  - [ ] Email : test@lumira.com
  - [ ] Téléphone : +33612345678
  - [ ] Prénom : Jean
  - [ ] Nom : Dupont
- [ ] Bouton "Suivant" cliquable

### 2.4 Test de la navigation multi-étapes
**Étapes à compléter** :

**Étape 1 - Naissance** :
- [ ] Saisir date de naissance : 01/01/1990
- [ ] Saisir heure de naissance : 14:30
- [ ] Saisir lieu de naissance : Paris, France
- [ ] Bouton "Suivant" devient actif
- [ ] Cliquer "Suivant" → Passage à l'étape 2

**Étape 2 - Intention** :
- [ ] Saisir question spécifique : "Quelle est ma mission de vie ?"
- [ ] Saisir objectif : "Clarté et direction"
- [ ] Bouton "Suivant" devient actif
- [ ] Cliquer "Suivant" → Passage à l'étape 3

**Étape 3 - Photos** :
- [ ] Upload photo visage (face.jpg)
- [ ] Upload photo paume (palm.jpg)
- [ ] Aperçu des deux photos visible
- [ ] Bouton "Finaliser" devient actif

### 2.5 Test de la soumission finale
**Action** : Cliquer sur "Finaliser"

**Vérifications Console** :
- [ ] Log : `[OnboardingForm] Début soumission vers client-submit`
- [ ] Log : `[OnboardingForm] FormData construit:`
- [ ] Log : `✅ [OnboardingForm] Soumission réussie`
- [ ] Log : `✨ [OnboardingForm] profileCompleted marqué à true dans UserLevelContext`

**Vérifications localStorage** :
- [ ] Clé `oraclelumira_user_level` existe
- [ ] Contient `{ profile: { profileCompleted: true, ... } }`
- [ ] Clé `last_payment_intent_id` supprimée

**Vérifications sessionStorage** :
- [ ] Clé `first_visit` supprimée

**Vérifications UI** :
- [ ] Formulaire se ferme (overlay disparaît)
- [ ] Dashboard du Sanctuaire s'affiche
- [ ] Mandala central visible
- [ ] Message "Votre Sanctuaire Personnel"

**RÉSULTAT TEST 2** : [ ] **EN ATTENTE** - Test manuel requis

---

## ✅ TEST 3 : Flux Client Existant (Accès Direct Dashboard)

### 3.1 Simuler un profil déjà complété
**Action** : Modifier localStorage pour simuler un client existant

```javascript
// Console du navigateur
localStorage.setItem('oraclelumira_user_level', JSON.stringify({
  currentLevel: 'mystique',
  profile: {
    email: 'existing@lumira.com',
    phone: '+33698765432',
    birthDate: '1985-06-15',
    birthTime: '09:00',
    profileCompleted: true,
    submittedAt: new Date('2025-01-10')
  }
}));

// Recharger la page
window.location.reload();
```

### 3.2 Test d'accès direct au dashboard
**Page** : `/sanctuaire`

**Vérifications** :
- [ ] OnboardingForm NE s'affiche PAS
- [ ] Dashboard visible immédiatement
- [ ] Mandala central affiché
- [ ] Message "Votre Sanctuaire Personnel"
- [ ] Badge de niveau visible (si entitlements)

### 3.3 Test de navigation dans les sphères
**Actions** :
- [ ] Cliquer sur sphère "Profil" → Redirection `/sanctuaire/profile`
- [ ] Cliquer sur sphère "Mes Lectures" → Redirection `/sanctuaire/draws`
- [ ] Vérifier aucun formulaire ne s'affiche

**RÉSULTAT TEST 3** : [ ] **EN ATTENTE** - Test manuel requis

---

## ✅ TEST 4 : Validation Endpoint Backend

### 4.1 Test de l'endpoint client-submit
**URL** : `POST /api/orders/by-payment-intent/:id/client-submit`

**Payload** : FormData multipart avec :
- `facePhoto` : File
- `palmPhoto` : File
- `formData` : JSON string avec :
  ```json
  {
    "email": "test@lumira.com",
    "phone": "+33612345678",
    "firstName": "Jean",
    "lastName": "Dupont",
    "dateOfBirth": "1990-01-01",
    "birthTime": "14:30",
    "birthPlace": "Paris, France",
    "specificQuestion": "Quelle est ma mission ?",
    "objective": "Clarté"
  }
  ```

**Vérifications Backend** (logs serveur) :
- [ ] Log : `[CLIENT-SUBMIT] Réception données client pour PI: pi_xxx`
- [ ] Log : `[CLIENT-SUBMIT] Photos reçues: face=true, palm=true`
- [ ] Log : `[CLIENT-SUBMIT] Upload Cloudinary: OK`
- [ ] Log : `[CLIENT-SUBMIT] ProductOrder mis à jour avec clientFormData`
- [ ] Log : `[CLIENT-SUBMIT] Statut: payment_confirmed`
- [ ] Réponse HTTP : 200 avec `{ success: true, order: {...} }`

**Test d'erreur 404** :
- [ ] Tester avec un PI inexistant → HTTP 404 : "Order not found"

**Test de validation** :
- [ ] Tester sans photos → HTTP 400 : "Photos requises"

**RÉSULTAT TEST 4** : [ ] **EN ATTENTE** - Test API requis

---

## ✅ TEST 5 : Persistance profileCompleted

### 5.1 Test de sauvegarde automatique
**Actions** :
1. Compléter l'onboarding normalement
2. Ouvrir DevTools → Application → Local Storage
3. Chercher clé `oraclelumira_user_level`

**Vérifications** :
- [ ] Clé existe dans localStorage
- [ ] JSON valide avec structure :
  ```json
  {
    "currentLevel": "mystique",
    "profile": {
      "email": "...",
      "phone": "...",
      "profileCompleted": true,
      "submittedAt": "2025-01-15T10:30:00.000Z"
    }
  }
  ```

### 5.2 Test de persistance après rafraîchissement
**Actions** :
1. Recharger la page (F5)
2. Vérifier que le dashboard reste affiché
3. Vérifier que le formulaire ne réapparaît PAS

**Vérifications** :
- [ ] localStorage toujours présent après reload
- [ ] `profileCompleted` toujours `true`
- [ ] Dashboard affiché directement

### 5.3 Test de suppression manuelle
**Actions** :
1. Supprimer `localStorage.removeItem('oraclelumira_user_level')`
2. Recharger la page
3. Vérifier que le formulaire réapparaît

**Vérifications** :
- [ ] Formulaire OnboardingForm affiché
- [ ] Comportement identique à première visite

**RÉSULTAT TEST 5** : [ ] **EN ATTENTE** - Test manuel requis

---

## ✅ TEST 6 : Validation Globale E2E

### 6.1 Scénario complet nouveau client
**Flux** : Paiement → Confirmation → Sanctuaire → Onboarding → Dashboard

**Critères de succès** :
- [ ] Paiement réussi (confirmation Stripe)
- [ ] Redirection automatique correcte
- [ ] Formulaire affiché avec données pré-remplies
- [ ] Navigation multi-étapes fluide
- [ ] Soumission réussie (API 200)
- [ ] profileCompleted marqué à true
- [ ] Dashboard débloqué
- [ ] Pas de régression sur les anciennes fonctionnalités

### 6.2 Scénario régression client existant
**Flux** : Connexion → Sanctuaire → Dashboard direct

**Critères de succès** :
- [ ] Aucun formulaire affiché
- [ ] Accès immédiat au dashboard
- [ ] Navigation dans les sphères fonctionnelle
- [ ] Profil affiche données complètes

### 6.3 Test de sécurité et edge cases
**Scénarios** :
- [ ] PaymentIntentId manquant → Message d'erreur clair
- [ ] PaymentIntentId invalide → HTTP 404 géré gracieusement
- [ ] Photos trop volumineuses → Validation frontend
- [ ] Tentative de skip étapes → Validation empêche
- [ ] Déconnexion pendant onboarding → Sauvegarde partielle ?

**RÉSULTAT TEST 6** : [ ] **EN ATTENTE** - Test E2E complet requis

---

## 📊 Rapport Final

| Test | Status | Résultat | Notes |
|------|--------|----------|-------|
| TEST 1 : Imports/Exports | ✅ RÉUSSI | Aucune erreur | Compilation OK |
| TEST 2 : Flux Nouveau Client | ⏳ EN ATTENTE | - | Test manuel requis |
| TEST 3 : Flux Client Existant | ⏳ EN ATTENTE | - | Test manuel requis |
| TEST 4 : Endpoint Backend | ⏳ EN ATTENTE | - | Test API requis |
| TEST 5 : Persistance localStorage | ⏳ EN ATTENTE | - | Test manuel requis |
| TEST 6 : Validation E2E | ⏳ EN ATTENTE | - | Test complet requis |

### 🔥 Points critiques validés (Code Review)

- ✅ `updateUserProfile()` appelé après soumission
- ✅ `profileCompleted: true` envoyé au contexte
- ✅ `sessionStorage.removeItem('first_visit')` nettoyé
- ✅ Import nommé `{ OnboardingForm }` correct
- ✅ Aucune erreur TypeScript de compilation
- ✅ Logs de débogage ajoutés pour traçabilité

### ⚠️ Prochaines actions recommandées

1. **Démarrer le serveur dev** : `npm run dev`
2. **Exécuter TEST 2** : Simuler un paiement complet
3. **Vérifier logs console** : Rechercher `[OnboardingForm]` et `profileCompleted`
4. **Tester TEST 3** : Simuler un client existant
5. **Valider backend** : Vérifier logs serveur pour `[CLIENT-SUBMIT]`
6. **Rapport final** : Documenter tous les résultats

---

**Date de création** : 2025-01-15  
**Auteur** : Dev Fullstack Chirurgical  
**Version** : Migration Onboarding Refonte 2025
