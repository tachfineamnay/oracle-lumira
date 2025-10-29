# 🔍 DIAGNOSTIC COMPLET - PROFIL SANCTUAIRE NON MIS À JOUR

## 📊 ÉTAT ACTUEL (Confirmé par logs)

### ✅ Ce qui fonctionne
- Frontend déployé avec BUILD VERSION 80051b6 (refonte active)
- SanctuaireProvider charge correctement les données (Token, Profil, Orders, Entitlements)
- Backend API répond correctement (healthz, presign S3)
- Authentification sanctuaire fonctionne

### ❌ Ce qui ne fonctionne PAS
- Les miniatures des photos uploadées ne s'affichent pas
- Les nom/prénom affichés sont incorrects ("Client" / "Oracle" au lieu des vraies valeurs)
- Les modifications du profil ne sont pas visibles après sauvegarde

---

## 🎯 HYPOTHÈSES À VÉRIFIER

### Hypothèse 1: Les PATCH API ne sont jamais appelés
**Symptôme**: Aucune trace de PATCH /api/users/profile ou /api/users/me dans les logs backend

**Tests à effectuer**:
1. Ouvrir DevTools → Network
2. Cliquer "Modifier" sur le profil
3. Changer Prénom/Nom
4. Cliquer "Sauvegarder"
5. Vérifier si les requêtes apparaissent:
   - `PATCH /api/users/me` (attendu: 200)
   - `PATCH /api/users/profile` (attendu: 200)

**Si les requêtes n'apparaissent PAS**:
→ Problème frontend: les event handlers ne sont pas déclenchés
→ Solution: Vérifier les console errors JavaScript

**Si les requêtes apparaissent avec erreur 401/403**:
→ Problème: Token manquant ou expiré
→ Solution: Réauthentifier (logout/login)

**Si les requêtes apparaissent avec 200**:
→ Backend OK, mais frontend ne refresh pas
→ Solution: Vérifier que refresh() est bien appelé

---

### Hypothèse 2: Le token est expiré ou invalide
**Tests à effectuer**:
```bash
# Récupérer le token depuis DevTools → Application → Local Storage
# Clé: sanctuaire_token

# Tester GET profil
curl "https://oraclelumira.com/api/users/profile" \
  -H "Authorization: Bearer VOTRE_TOKEN_ICI"

# Tester GET utilisateur
curl "https://oraclelumira.com/api/users/me" \
  -H "Authorization: Bearer VOTRE_TOKEN_ICI"
```

**Réponses attendues**:
- Si 401: Token expiré → Réauthentifier
- Si 200 avec données correctes: Backend OK → Problème frontend
- Si 200 avec données incorrectes: Problème de données en BDD

---

### Hypothèse 3: Les données sont en BDD mais pas récupérées
**Tests à effectuer**:
```bash
# 1. Lire le profil actuel
curl "https://oraclelumira.com/api/users/profile" \
  -H "Authorization: Bearer VOTRE_TOKEN"

# 2. Mettre à jour le prénom/nom
curl -X PATCH "https://oraclelumira.com/api/users/me" \
  -H "Authorization: Bearer VOTRE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Jean","lastName":"Dupont"}'

# 3. Relire pour confirmer
curl "https://oraclelumira.com/api/users/me" \
  -H "Authorization: Bearer VOTRE_TOKEN"

# 4. Mettre à jour une photo
curl -X PATCH "https://oraclelumira.com/api/users/profile" \
  -H "Authorization: Bearer VOTRE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"facePhotoUrl":"https://oracle-lumira-uploads-tachfine-1983.s3.eu-west-3.amazonaws.com/uploads/2025/10/test.jpg"}'

# 5. Relire le profil
curl "https://oraclelumira.com/api/users/profile" \
  -H "Authorization: Bearer VOTRE_TOKEN"
```

**Si les PATCH retournent 200 et les GET montrent les nouvelles valeurs**:
→ Backend 100% fonctionnel
→ Problème: Frontend ne refresh pas après save OU affiche de mauvaises données

**Si les PATCH échouent**:
→ Voir le message d'erreur pour débugger

---

### Hypothèse 4: Le frontend affiche les mauvaises données sources
**Code à vérifier dans Profile.tsx**:

```typescript
// Ligne ~52-60 : Données utilisateur
const email = user?.email || '';
const phone = user?.phone || '';

// Ligne ~194-206 : Champs éditables
{
  key: 'firstName',
  label: 'Prénom',
  type: 'text',
  icon: <User className="w-4 h-4" />,
  value: isEditing ? editData.firstName : (user?.firstName || 'Non renseigné')
},
```

**Vérification**:
1. Ouvrir la console navigateur
2. Taper: `localStorage.getItem('sanctuaire_token')`
3. Décoder le JWT (jwt.io) pour voir l'email/userId
4. Vérifier que l'email correspond bien à votre compte
5. Dans React DevTools → Components → SanctuaireProvider:
   - Vérifier `user.firstName`, `user.lastName`, `user.email`
   - Vérifier `profile.facePhotoUrl`, `profile.palmPhotoUrl`

**Si user.firstName/lastName sont vides**:
→ Problème: GET /api/users/me ne renvoie pas les bonnes données
→ Vérifier directement avec curl

**Si profile.facePhotoUrl/palmPhotoUrl sont vides**:
→ Problème: Les photos n'ont jamais été enregistrées en BDD
→ Tester le PATCH avec curl pour les ajouter

---

## 🛠️ PLAN DE CORRECTION SELON LE DIAGNOSTIC

### Scénario A: Les PATCH ne partent jamais
**Cause**: Event handlers bloqués ou erreur JavaScript
**Solution**:
1. Vérifier les erreurs console JavaScript
2. Ajouter des console.log dans handleSave() et handleReplacePhoto()
3. Si exception silencieuse: ajouter try/catch avec alert

### Scénario B: Les PATCH échouent (401/403)
**Cause**: Token expiré ou manquant
**Solution**:
1. Déconnecter/reconnecter depuis /sanctuaire/login
2. Vérifier que le token est bien dans localStorage
3. Vérifier que Authorization header est bien envoyé

### Scénario C: Les PATCH réussissent mais UI ne refresh pas
**Cause**: refresh() non appelé ou state non synchronisé
**Solution**:
1. Vérifier que handleSave() appelle bien refresh() (ligne ~131)
2. Vérifier que SanctuaireProvider.refresh() recharge bien user/profile
3. Forcer un hard refresh navigateur (Ctrl+Shift+R)

### Scénario D: Les données sont en BDD mais mal affichées
**Cause**: Mapping incorrect user/profile dans le composant
**Solution**:
1. Vérifier que Profile.tsx lit bien user.firstName (pas profile.firstName)
2. Vérifier que les photos lisent bien profile.facePhotoUrl
3. Vérifier le useEffect ligne 63 qui synchronise editData

---

## 📋 CHECKLIST DE VALIDATION

### Backend
- [ ] GET /api/users/me retourne firstName/lastName corrects
- [ ] GET /api/users/profile retourne facePhotoUrl/palmPhotoUrl
- [ ] PATCH /api/users/me met à jour firstName/lastName
- [ ] PATCH /api/users/profile met à jour facePhotoUrl/palmPhotoUrl
- [ ] Les logs backend montrent les PATCH avec status 200

### Frontend
- [ ] console.log '[Profile] BUILD VERSION: 80051b6' présent
- [ ] SanctuaireProvider charge user avec firstName/lastName
- [ ] SanctuaireProvider charge profile avec facePhotoUrl/palmPhotoUrl
- [ ] Bouton "Sauvegarder" déclenche PATCH visible dans Network
- [ ] Bouton "Remplacer" déclenche presign puis PATCH puis refresh
- [ ] Après save, refresh() est appelé et les nouvelles données apparaissent

### Affichage
- [ ] Section "Informations Personnelles" affiche les bonnes valeurs
- [ ] Section "Photos Uploadées" apparaît si facePhotoUrl/palmPhotoUrl existent
- [ ] Les miniatures s'affichent avec les bonnes URLs S3
- [ ] Après modification + save, les valeurs changent sans reload page

---

## 🚀 COMMANDES DE TEST RAPIDE

```bash
# Variables
TOKEN="COLLER_VOTRE_TOKEN_ICI"
API="https://oraclelumira.com/api"

# 1. Lire profil actuel
curl "$API/users/profile" -H "Authorization: Bearer $TOKEN"

# 2. Lire utilisateur actuel
curl "$API/users/me" -H "Authorization: Bearer $TOKEN"

# 3. Mettre à jour nom/prénom
curl -X PATCH "$API/users/me" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Test","lastName":"Utilisateur"}'

# 4. Mettre à jour photo visage
curl -X PATCH "$API/users/profile" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"facePhotoUrl":"https://oracle-lumira-uploads-tachfine-1983.s3.eu-west-3.amazonaws.com/uploads/2025/10/test-face.jpg"}'

# 5. Relire pour confirmer
curl "$API/users/profile" -H "Authorization: Bearer $TOKEN"
curl "$API/users/me" -H "Authorization: Bearer $TOKEN"
```

---

## 📞 PROCHAINES ÉTAPES

1. **Exécuter les 5 commandes curl ci-dessus** avec votre token
2. **Me partager les résultats** (copier-coller la sortie)
3. **Ouvrir DevTools → Network** et cliquer "Sauvegarder" sur le profil
4. **Me partager** ce que vous voyez dans l'onglet Network (requêtes PATCH)
5. **Selon les résultats**, je fournirai la correction ciblée exacte

---

**Date**: 2025-10-29  
**Version du diagnostic**: 1.0  
**Commit actuel**: 497dc49
