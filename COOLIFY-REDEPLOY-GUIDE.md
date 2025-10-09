# 🚀 GUIDE REDÉPLOIEMENT COOLIFY - REFONTE 2025

## 🚨 PROBLÈME IDENTIFIÉ

Les composants de la refonte n'étaient **pas dans le repository Git** lors du précédent déploiement.

Coolify a donc déployé une version **sans les nouveaux composants**, ce qui explique pourquoi vous ne voyiez pas les changements.

---

## ✅ CORRECTION APPLIQUÉE

**Commit `cf667d6`** : Tous les composants refonte ont été créés et pushés !

### Fichiers ajoutés :
- ✅ `HeroRefonte.tsx` - Hero avec glassmorphisme
- ✅ `LevelCardRefonte.tsx` - Cards avec icônes thématiques
- ✅ `LevelsSectionRefonte.tsx` - Carrousel mobile
- ✅ `UpsellSectionRefonte.tsx` - Bento Grid
- ✅ `TestimonialsRefonte.tsx` - Contraste amélioré
- ✅ `FooterRefonte.tsx` - Accessibilité optimisée
- ✅ `LandingTempleRefonte.tsx` - Page complète
- ✅ `router.tsx` - Route `/` mise à jour

---

## 🔄 ÉTAPES POUR REDÉPLOYER SUR COOLIFY

### Étape 1 : Accéder à Coolify

1. Connectez-vous à votre instance Coolify
2. Naviguez vers votre projet **Oracle Lumira**
3. Allez dans l'onglet **"Deployments"** ou **"Builds"**

### Étape 2 : Forcer un rebuild SANS cache

Coolify utilise un cache Docker qui peut contenir l'ancienne version. Il faut le vider.

**Option A : Via l'interface Coolify**
1. Cliquez sur **"Redeploy"** ou **"Force Rebuild"**
2. ✅ **IMPORTANT** : Cochez l'option **"Build without cache"** ou **"Clear build cache"**
3. Cliquez sur **"Deploy"**

**Option B : Via la ligne de commande SSH** (si vous avez accès)
```bash
# Se connecter au serveur Coolify
ssh user@your-coolify-server

# Supprimer le cache Docker du projet
docker system prune -af

# Redéployer via Coolify CLI
coolify deploy --no-cache
```

### Étape 3 : Vérifier le build

1. Suivez les logs de build en temps réel
2. Vérifiez que Vite compile **TOUS** les nouveaux composants :
   ```
   ✓ building for production...
   ✓ 156 modules transformed.
   ✓ HeroRefonte.tsx
   ✓ LevelsSectionRefonte.tsx
   ✓ LevelCardRefonte.tsx
   ✓ UpsellSectionRefonte.tsx
   ✓ TestimonialsRefonte.tsx
   ✓ FooterRefonte.tsx
   ```

3. Le build doit se terminer avec **SUCCESS** sans erreurs

### Étape 4 : Tester le déploiement

1. Attendez que le déploiement soit **"Running"** ou **"Healthy"**
2. Ouvrez votre site en navigation privée (pour éviter le cache navigateur)
3. Vérifiez les changements :
   - [ ] Hero avec 3 cards glassmorphiques (Clock, Sparkles, Shield)
   - [ ] Section tarifs avec carrousel mobile horizontal
   - [ ] Offre Mystique 10% plus grande avec bordure dorée
   - [ ] Upsells en Bento Grid asymétrique
   - [ ] Textes lisibles (contraste amélioré)

---

## ⚠️ SI ÇA NE MARCHE TOUJOURS PAS

### Problème 1 : Cache du CDN / Proxy

Si Coolify utilise un CDN ou proxy (Cloudflare, Nginx, etc.) :

```bash
# Purger le cache Cloudflare (si applicable)
# Via Dashboard Cloudflare : Caching > Purge Everything

# Ou redémarrer Nginx
sudo systemctl restart nginx
```

### Problème 2 : Variables d'environnement manquantes

Vérifiez que toutes les variables sont définies dans Coolify :

```env
NODE_ENV=production
VITE_API_URL=https://your-api-url.com
VITE_STRIPE_PUBLIC_KEY=pk_...
```

### Problème 3 : Branch incorrecte

Vérifiez que Coolify déploie depuis la bonne branche :

**Dans Coolify > Project Settings > Git :**
- Branch : `main` ✅
- Commit : `cf667d6` (ou plus récent) ✅

Si Coolify est sur une autre branche ou un ancien commit :
1. Changez la branche vers `main`
2. Cliquez sur **"Pull Latest"**
3. Redéployez

### Problème 4 : Dockerfile incorrect

Si vous utilisez un Dockerfile custom, vérifiez qu'il :

```dockerfile
# Copie TOUS les fichiers source
COPY apps/main-app ./apps/main-app

# Build l'application
RUN npm run build

# Les fichiers de build sont dans dist/
```

---

## 🔍 DIAGNOSTIC RAPIDE

### Vérifier si les fichiers sont bien sur le serveur

```bash
# SSH vers le serveur Coolify
ssh user@your-coolify-server

# Naviguer vers le dossier du projet
cd /path/to/oracle-lumira

# Lister les composants refonte
ls -la apps/main-app/src/components/*Refonte.tsx

# Vérifier le dernier commit
git log --oneline -1
# Devrait afficher : cf667d6 ✨ feat(landing): Ajout de TOUS les composants...
```

### Vérifier les fichiers buildés

```bash
# Vérifier que les composants sont dans le bundle
ls -la apps/main-app/dist/assets/

# Le bundle JS doit être récent (timestamp d'aujourd'hui)
stat apps/main-app/dist/assets/*.js
```

---

## 📊 CHECKLIST FINALE

Avant de marquer le déploiement comme réussi :

- [ ] **Git** : Commit `cf667d6` ou plus récent sur `main`
- [ ] **Coolify** : Build **sans cache** terminé avec succès
- [ ] **Logs** : Aucune erreur dans les logs de build
- [ ] **Health Check** : Application en statut **"Running"**
- [ ] **Navigation privée** : Cache navigateur vidé
- [ ] **Hero** : 3 cards glassmorphiques visibles
- [ ] **Tarifs** : Carrousel mobile fonctionne
- [ ] **Mystique** : Offre mise en avant (bordure dorée)
- [ ] **Upsells** : Bento Grid asymétrique
- [ ] **Textes** : Contraste lisible partout

---

## 🎉 SUCCÈS !

Une fois tous les checks validés, votre refonte 2025 sera **LIVE EN PRODUCTION** ! 🚀

### Prochaines étapes :

1. **Monitorer les métriques** :
   - Taux de conversion
   - Taux de rebond mobile
   - Temps sur la page
   - Conversions premium (Mystique)

2. **Recueillir les retours** :
   - Tests utilisateurs
   - Feedback de l'équipe
   - Accessibilité (Lighthouse)

3. **Optimiser si besoin** :
   - Ajuster les animations
   - Affiner les contrastes
   - Optimiser les performances

---

## 🆘 SUPPORT

Si vous rencontrez toujours des problèmes après avoir suivi ce guide :

1. Vérifiez les logs de déploiement Coolify en détail
2. Vérifiez la console DevTools du navigateur (erreurs JS)
3. Testez en local avec `npm run build && npm run preview`
4. Contactez le support Coolify si nécessaire

---

**Date de mise à jour** : 9 octobre 2025  
**Commit de référence** : `cf667d6`  
**Branche** : `main`
