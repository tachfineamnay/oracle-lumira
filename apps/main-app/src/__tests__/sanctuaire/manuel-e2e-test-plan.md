# 🎯 PLAN DE TEST MANUEL E2E - Migration Onboarding Refonte 2025

## ✅ ÉTAPE 1 : Préparation de l'environnement

### 1.1 Serveurs démarrés
- [x] Frontend Vite : http://localhost:5173/
- [ ] Backend API : http://localhost:5000/ (en attente)

### 1.2 Outils requis
- [ ] Navigateur en mode Incognito/Privé (session propre)
- [ ] DevTools ouvert (Console + Network)
- [ ] Carte de test Stripe : 4242 4242 4242 4242

---

## 🚀 ÉTAPE 2 : Test du Flux Nouveau Client Complet

### 2.1 Page de Commande `/commande?product=mystique`

**Actions** :
1. Ouvrir : http://localhost:5173/commande?product=mystique
2. Vérifier l'affichage du produit "Mystique"
3. Remplir le formulaire :
   - **Email** : test-migration@lumira.com
   - **Téléphone** : +33 6 12 34 56 78
   - **Prénom** : Jean
   - **Nom** : Dupont

**Vérifications Console** :
```
🚀 [UnifiedCheckout] Creating PaymentIntent with customer data:
✅ [UnifiedCheckout] PaymentIntent created: pi_xxxxx
```

**Checklist** :
- [ ] Produit "Mystique" affiché avec prix 47€
- [ ] Formulaire unifié visible
- [ ] Validation temps réel des champs (email, téléphone)
- [ ] PaymentElement Stripe chargé (onglets Carte/iDEAL/etc.)
- [ ] Bouton "Payer 47.00 €" actif après remplissage

### 2.2 Paiement avec Stripe

**Actions** :
1. Saisir les informations de carte test :
   - **Numéro** : 4242 4242 4242 4242
   - **Date** : 12/26
   - **CVC** : 123
   - **Code postal** : 75001

2. Cliquer sur "Payer 47.00 €"

**Vérifications Console** :
```
👳 [CheckoutFormInner] Confirming payment with customer data already in Stripe metadata
```

**Checklist** :
- [ ] Bouton affiche "Paiement en cours..." avec spinner
- [ ] Pas d'erreur dans la console
- [ ] Redirection automatique après quelques secondes

### 2.3 Page de Confirmation `/confirmation?payment_intent=pi_xxx`

**URL attendue** : `http://localhost:5173/confirmation?payment_intent=pi_xxxxxxxx&email=test-migration@lumira.com`

**Vérifications visibles** :
- [ ] Icône de succès (check vert)
- [ ] Titre : "🎉 Paiement réussi !"
- [ ] Message : "Votre accès mystique est activé"
- [ ] Compteur de redirection : "Redirection automatique dans X secondes..."
- [ ] Bouton "Entrer dans le Sanctuaire"

**Vérifications Console** :
```
[ConfirmationTempleSPA] Polling PaymentIntent status...
[ConfirmationTempleSPA] PaymentIntent succeeded
```

**Vérifications Storage** :
- [ ] `localStorage.getItem('last_payment_intent_id')` contient `pi_xxxxxxxx`
- [ ] `sessionStorage.getItem('first_visit')` contient `true`

**Checklist** :
- [ ] Redirection automatique après 3 secondes vers `/sanctuaire?payment_intent=pi_xxx&email=...`

### 2.4 Page Sanctuaire - Affichage du Formulaire d'Onboarding

**URL attendue** : `http://localhost:5173/sanctuaire?payment_intent=pi_xxx&email=test-migration@lumira.com`

**Vérifications visibles** :
- [ ] Overlay noir semi-transparent (z-50, backdrop-blur)
- [ ] GlassCard centré avec formulaire OnboardingForm
- [ ] Titre : "Complétez votre Profil"
- [ ] Sous-titre : "Étape 1 sur 4"
- [ ] Progress bar avec 4 étapes (1 active en doré, 2-3-4 gris)

**Vérifications Console** :
```
[OnboardingForm] PaymentIntentId trouvé: pi_xxxxxxxx
🔍 [OnboardingForm] Chargement depuis ProductOrder: pi_xxxxxxxx
✅ [OnboardingForm] Données chargées: { email: ..., phone: ..., name: ... }
```

**Vérifications Storage** :
- [ ] `sessionStorage.getItem('first_visit')` === `"true"`
- [ ] `localStorage.getItem('last_payment_intent_id')` === `"pi_xxxxxxxx"`

**Checklist** :
- [ ] Formulaire OnboardingForm affiché en overlay
- [ ] Mandala du Sanctuaire visible en arrière-plan (flouté)
- [ ] Impossible de cliquer sur le fond (overlay bloque)

---

### 2.5 Étape 0 : Bienvenue

**Vérifications visibles** :
- [ ] Titre : "Complétez votre Profil"
- [ ] Message de bienvenue
- [ ] Icône étoile dorée
- [ ] Données PRÉ-REMPLIES :
  - [ ] Email : test-migration@lumira.com
  - [ ] Téléphone : +33 6 12 34 56 78
  - [ ] Prénom : Jean
  - [ ] Nom : Dupont

**Vérifications Console** :
```
✅ [OnboardingForm] Données depuis ProductOrder metadata
```

**Checklist** :
- [ ] Bouton "Suivant" cliquable (pas disabled)
- [ ] Cliquer "Suivant" → Passage à l'étape 1

---

### 2.6 Étape 1 : Naissance

**Actions** :
1. Saisir **Date de naissance** : 01/01/1990
2. Saisir **Heure de naissance** : 14:30
3. Saisir **Lieu de naissance** : Paris, France
4. Cliquer "Suivant"

**Vérifications visibles** :
- [ ] Titre : "Étape 2 sur 4"
- [ ] Progress bar : étape 1 complétée (check), étape 2 active (doré)
- [ ] Champs avec validation (bordure rouge si vide)
- [ ] Bouton "Suivant" disabled tant que tous les champs ne sont pas remplis

**Checklist** :
- [ ] Bouton "Retour" visible et fonctionnel
- [ ] Bouton "Suivant" devient actif après remplissage
- [ ] Passage fluide à l'étape 2 (animation)

---

### 2.7 Étape 2 : Intention

**Actions** :
1. Saisir **Question spécifique** : "Quelle est ma mission de vie ?"
2. Saisir **Objectif** : "Clarté et direction spirituelle"
3. Cliquer "Suivant"

**Vérifications visibles** :
- [ ] Titre : "Étape 3 sur 4"
- [ ] Progress bar : étapes 1-2 complétées, étape 3 active
- [ ] Textarea avec placeholder
- [ ] Compteur de caractères (optionnel)

**Checklist** :
- [ ] Bouton "Retour" ramène à l'étape 1 (données conservées)
- [ ] Bouton "Suivant" actif après remplissage
- [ ] Passage à l'étape 3

---

### 2.8 Étape 3 : Photos

**Actions** :
1. **Upload photo visage** :
   - Cliquer "Choisir un fichier"
   - Sélectionner une image de visage (face.jpg)
   - Vérifier l'aperçu

2. **Upload photo paume** :
   - Cliquer "Choisir un fichier"
   - Sélectionner une image de paume (palm.jpg)
   - Vérifier l'aperçu

3. Cliquer "Finaliser"

**Vérifications visibles** :
- [ ] Titre : "Étape 4 sur 4"
- [ ] Progress bar : toutes les étapes actives
- [ ] Zones de drop pour les photos
- [ ] Aperçu des images après upload
- [ ] Icône de suppression pour chaque photo (X)
- [ ] Bouton "Finaliser" disabled tant que les 2 photos ne sont pas uploadées

**Vérifications Console** :
```
[OnboardingForm] Début soumission vers client-submit
[OnboardingForm] FormData construit: { facePhoto: true, palmPhoto: true, jsonData: {...} }
```

**Checklist** :
- [ ] Bouton "Finaliser" devient actif après upload des 2 photos
- [ ] Bouton affiche "Envoi..." avec spinner pendant soumission

---

### 2.9 Soumission et Marquage profileCompleted

**Vérifications Console CRITIQUES** :
```
✅ [OnboardingForm] Soumission réussie
✨ [OnboardingForm] profileCompleted marqué à true dans UserLevelContext
```

**Vérifications Storage** :
- [ ] `sessionStorage.getItem('first_visit')` === `null` (supprimé)
- [ ] `localStorage.getItem('last_payment_intent_id')` === `null` (supprimé)
- [ ] `localStorage.getItem('oraclelumira_user_level')` existe avec :
  ```json
  {
    "profile": {
      "email": "test-migration@lumira.com",
      "phone": "+33612345678",
      "birthDate": "1990-01-01",
      "birthTime": "14:30",
      "profileCompleted": true,
      "submittedAt": "2025-01-15T..."
    }
  }
  ```

**Vérifications Backend** (logs serveur dans terminal) :
```
[CLIENT-SUBMIT] Réception données client pour PI: pi_xxxxxxxx
[CLIENT-SUBMIT] Photos reçues: face=true, palm=true
[CLIENT-SUBMIT] Upload Cloudinary: OK
[CLIENT-SUBMIT] ProductOrder mis à jour avec clientFormData
[CLIENT-SUBMIT] Statut: payment_confirmed
```

**Checklist** :
- [ ] Overlay formulaire se ferme (disparaît avec animation)
- [ ] Dashboard du Sanctuaire s'affiche
- [ ] Mandala central visible
- [ ] Message "Votre Sanctuaire Personnel"
- [ ] Badge de niveau visible (en haut à droite)

---

### 2.10 Dashboard Sanctuaire Débloqué

**Vérifications visibles** :
- [ ] Titre : "Votre Sanctuaire Personnel"
- [ ] Mandala central interactif
- [ ] Message de confirmation : "✨ Votre demande a été transmise avec succès"
- [ ] Délai de traitement : "24h"
- [ ] Icône profil en haut à droite avec prénom "Jean"
- [ ] Dropdown menu du profil fonctionnel

**Vérifications Console** :
```
[SanctuaireProvider] Token détecté, chargement des données...
[SanctuaireProvider] Entitlements chargés: { capabilities: [...], products: [...] }
```

**Checklist** :
- [ ] OnboardingForm NE s'affiche PLUS (profileCompleted === true)
- [ ] Navigation dans le Mandala fonctionnelle (clic sur sphères)
- [ ] Menu déroulant "Gérer mon profil" / "Mes lectures" fonctionnel

---

## ✅ ÉTAPE 3 : Test du Flux Client Existant (Régression)

### 3.1 Simuler un client existant avec profil complété

**Actions dans la Console du navigateur** :
```javascript
// Supprimer les données de test précédentes
localStorage.clear();
sessionStorage.clear();

// Simuler un client existant avec profileCompleted: true
localStorage.setItem('oraclelumira_user_level', JSON.stringify({
  currentLevel: 'mystique',
  profile: {
    email: 'existing@lumira.com',
    phone: '+33698765432',
    firstName: 'Marie',
    lastName: 'Martin',
    birthDate: '1985-06-15',
    birthTime: '09:00',
    birthPlace: 'Lyon, France',
    profileCompleted: true,
    submittedAt: new Date('2025-01-10T12:00:00Z')
  }
}));

// Simuler un token d'authentification
localStorage.setItem('sanctuaire_token', 'fake-token-for-testing');

// Recharger la page
window.location.href = '/sanctuaire';
```

### 3.2 Vérification Accès Direct Dashboard

**URL** : `http://localhost:5173/sanctuaire`

**Vérifications visibles** :
- [ ] **OnboardingForm NE s'affiche PAS** (pas d'overlay)
- [ ] Dashboard directement visible
- [ ] Mandala central affiché
- [ ] Message "Votre Sanctuaire Personnel"
- [ ] Icône profil affiche "Marie" (prénom du profil simulé)

**Vérifications Console** :
```
[Sanctuaire] userLevel.profile.profileCompleted === true
[Sanctuaire] OnboardingForm skipped, showing dashboard
```

**Checklist** :
- [ ] Pas de formulaire affiché
- [ ] Accès immédiat au dashboard
- [ ] Navigation dans les sphères fonctionnelle
- [ ] Profil affiche les bonnes données

---

## 🎯 ÉTAPE 4 : Tests de Régression et Edge Cases

### 4.1 Test : PaymentIntentId manquant

**Actions** :
```javascript
// Console navigateur
localStorage.clear();
sessionStorage.clear();
sessionStorage.setItem('first_visit', 'true');
window.location.href = '/sanctuaire';
```

**Résultat attendu** :
- [ ] Message d'erreur : "PaymentIntentId manquant"
- [ ] Formulaire ne peut pas être soumis
- [ ] Console affiche warning

### 4.2 Test : PaymentIntentId invalide

**Actions** :
```javascript
localStorage.setItem('last_payment_intent_id', 'pi_invalid_fake_id');
sessionStorage.setItem('first_visit', 'true');
window.location.href = '/sanctuaire';
```

**Résultat attendu** :
- [ ] Erreur 404 lors de la soumission
- [ ] Message : "Order not found"
- [ ] Formulaire reste affiché

### 4.3 Test : Photos manquantes

**Actions** :
1. Compléter étapes 1-2 normalement
2. À l'étape 3, ne pas uploader de photos
3. Tenter de cliquer "Finaliser"

**Résultat attendu** :
- [ ] Bouton "Finaliser" reste disabled
- [ ] Impossible de soumettre

### 4.4 Test : Déconnexion pendant onboarding

**Actions** :
1. Démarrer l'onboarding normalement
2. En étape 2, supprimer le token :
   ```javascript
   localStorage.removeItem('sanctuaire_token');
   ```
3. Tenter de continuer

**Résultat attendu** :
- [ ] Formulaire reste affiché (pas de crash)
- [ ] Soumission échoue avec erreur d'authentification

---

## 📊 ÉTAPE 5 : Validation Backend (Logs Serveur)

### 5.1 Vérifier les logs du terminal backend

**Rechercher dans la sortie du terminal** :
```
[CLIENT-SUBMIT] Réception données client
[CLIENT-SUBMIT] Photos reçues: face=true, palm=true
[CLIENT-SUBMIT] Upload Cloudinary: OK
[CLIENT-SUBMIT] ProductOrder mis à jour
[CLIENT-SUBMIT] Statut: payment_confirmed
```

**Checklist** :
- [ ] Endpoint `/api/orders/by-payment-intent/:id/client-submit` appelé
- [ ] Photos uploadées sur Cloudinary
- [ ] ProductOrder mis à jour avec clientFormData
- [ ] Statut changé en `payment_confirmed`

---

## ✅ ÉTAPE 6 : Rapport Final

### Résumé des Tests

| Test | Statut | Notes |
|------|--------|-------|
| Flux paiement complet | ⏳ | En attente test manuel |
| Affichage OnboardingForm | ⏳ | En attente test manuel |
| Données pré-remplies | ⏳ | En attente test manuel |
| Navigation multi-étapes | ⏳ | En attente test manuel |
| Soumission formulaire | ⏳ | En attente test manuel |
| Marquage profileCompleted | ⏳ | En attente test manuel |
| Dashboard débloqué | ⏳ | En attente test manuel |
| Flux client existant | ⏳ | En attente test manuel |
| Tests edge cases | ⏳ | En attente test manuel |
| Logs backend | ⏳ | En attente vérification |

### Points Critiques Validés (Code Review)

- ✅ Import/Export OnboardingForm corrects
- ✅ updateUserProfile() appelé après soumission
- ✅ profileCompleted: true envoyé
- ✅ sessionStorage nettoyé après soumission
- ✅ Logs de débogage en place
- ✅ Aucune erreur de compilation TypeScript

### Prochaines Actions

1. **Test manuel complet** : Exécuter tous les tests ci-dessus
2. **Capture d'écran** : Documenter chaque étape avec screenshots
3. **Rapport final** : Remplir le tableau de résultats
4. **Validation stakeholder** : Présenter les résultats au client

---

**Date** : 2025-01-15  
**Testeur** : Dev Fullstack Chirurgical  
**Environnement** : Local (localhost:5173 + localhost:5000)
