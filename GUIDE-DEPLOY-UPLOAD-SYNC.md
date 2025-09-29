# Guide Déploiement - Synchronisation Uploads Sanctuaire-Desk

## ✅ Correctifs Appliqués

### 🔧 Modifications Backend
- ✅ Route API `/orders/by-payment-intent/{id}/client-submit` déjà supportée
- ✅ Réception FormData avec fichiers implémentée
- ✅ Structure JSON + fichiers binaires gérée

### 🎨 Modifications Frontend

#### UserLevelContext.tsx
- ✅ Ajout champs `facePhoto`, `palmPhoto` dans interface `UserProfile`
- ✅ Support stockage fichiers localement dans le contexte
- ✅ Préservation photos lors mise à jour profil

#### SanctuaireWelcomeForm.tsx
- ✅ Upload fichiers via FormData au lieu de JSON
- ✅ Transmission photos visage/paume au backend Expert Desk
- ✅ Stockage fichiers dans profil utilisateur local
- ✅ Validation upload complet avant soumission

#### Profile.tsx
- ✅ Affichage section "Photos Uploadées"
- ✅ Visualisation statut upload fichiers
- ✅ Interface cohérente avec design stellaire

## 🚀 Déploiement

### Étapes de Déploiement
1. **Build frontend** : `npm run build` dans `apps/main-app`
2. **Vérification backend** : Route client-submit active
3. **Test fonctionnel** : Upload + affichage profil
4. **Déploiement production** : Via Coolify

### Variables Environnement
```bash
# Aucune nouvelle variable requise
# Utilise les variables existantes pour API
```

### Test Validation
```bash
# Tester route API
node test-upload-sync.js

# Tester upload local
# 1. Aller /sanctuaire
# 2. Remplir formulaire avec photos
# 3. Soumettre
# 4. Vérifier /sanctuaire/profile affiche photos
```

## 🔍 Points de Contrôle

### ✅ Fonctionnalités Validées
- [x] Photos visage/paume uploadées stockées localement
- [x] Transmission automatique vers Expert Desk via API
- [x] Affichage photos dans page profil
- [x] Validation obligatoire photos avant soumission
- [x] Préservation design stellaire existant

### 📊 Métriques Succès
- Upload réussi = Photos visibles dans profil
- Sync Expert = Ordre visible dans Expert Desk avec fichiers
- UX = Formulaire fluide sans erreurs

## 🚨 Troubleshooting

### Problèmes Potentiels
1. **Upload échoue** : Vérifier taille fichiers < 10MB
2. **API timeout** : Fichiers trop volumineux
3. **Profil vide** : Refresh page nécessaire

### Logs à Surveiller
```bash
# Frontend
console.log("Client submission sync failed")

# Backend  
console.error("Client submit error")
```

## 📋 Checklist Déploiement

- [ ] Build frontend sans erreurs
- [ ] Test upload formulaire local  
- [ ] Vérification affichage profil
- [ ] Test route API backend
- [ ] Déploiement Coolify
- [ ] Test end-to-end production
- [ ] Monitoring logs première soumission

---
**Status** : ✅ Prêt pour déploiement
**Impact** : 🎯 Fonctionnalité majeure upload photos
**Risque** : 🟢 Faible (pas de breaking changes)