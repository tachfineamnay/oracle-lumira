# Guide de Déploiement - Correction EACCES Oracle Lumira

## Vue d'Ensemble

Ce guide documente les procédures de déploiement pour corriger l'erreur EACCES dans Oracle Lumira. Il inclut deux solutions alternatives et les procédures de rollback.

## ⚠️ Prérequis de Déploiement

### Validation Pré-Déploiement

```bash
# 1. Vérifier que Docker est installé et fonctionnel
docker --version
docker compose --version

# 2. Vérifier l'accès aux volumes Coolify
ls -la /app/uploads /app/logs /app/generated

# 3. Sauvegarder les configurations actuelles
cp Dockerfile Dockerfile.backup
cp entrypoint.sh entrypoint.sh.backup
```

### Environnement de Test

```bash
# Créer un environnement de test isolé
git checkout -b fix/eacces-permissions-test
```

## 🔧 Solution 1 : Correction Entrypoint (Recommandée)

### Description
Modification du script `entrypoint.sh` pour synchroniser les permissions avec l'utilisateur `nodejs`.

### Procédure de Déploiement

#### Étape 1 : Modification des Fichiers

Les fichiers suivants ont été modifiés :
- `apps/api-backend/entrypoint.sh` - Correction des permissions dynamiques
- `apps/api-backend/Dockerfile` - Ajout de su-exec et configuration entrypoint

#### Étape 2 : Test Local

```bash
# Exécuter le script de test
./test-permissions-fix.sh

# Vérifier les logs de test
./test-upload-validation.sh
```

#### Étape 3 : Build et Test

```bash
cd apps/api-backend

# Build de l'image
docker build -t oracle-api-fixed .

# Test avec volumes locaux
docker run -d \
  --name oracle-test \
  -p 3001:3000 \
  -v $(pwd)/test-uploads:/app/uploads \
  -v $(pwd)/test-logs:/app/logs \
  -v $(pwd)/test-generated:/app/generated \
  oracle-api-fixed

# Vérifier les logs
docker logs oracle-test

# Test d'upload
curl -X POST \
  -F "facePhoto=@test-image.jpg" \
  -F "formData={\"email\":\"test@test.com\"}" \
  http://localhost:3001/api/orders/by-payment-intent/test/client-submit
```

#### Étape 4 : Déploiement Coolify

```bash
# Push des modifications
git add .
git commit -m "fix: résolution erreur EACCES avec entrypoint dynamique"
git push origin fix/eacces-permissions-test

# Merge vers main après validation
git checkout main
git merge fix/eacces-permissions-test
git push origin main
```

### Points de Validation

- ✅ Les logs montrent les UID/GID corrects
- ✅ Aucune erreur EACCES dans les logs
- ✅ Les uploads de fichiers fonctionnent
- ✅ Les permissions des volumes sont correctes

## 🔧 Solution 2 : Dockerfile Alternative

### Description
Utilisation de l'utilisateur `node` natif sans script entrypoint.

### Procédure de Déploiement

```bash
# Utiliser le Dockerfile alternatif
cp Dockerfile.alternative Dockerfile

# Build et test
docker build -t oracle-api-alternative .

# Test identique à la Solution 1
./test-permissions-fix.sh
```

### Avantages/Inconvénients

**Solution 1 (Entrypoint) :**
- ✅ Permissions dynamiques adaptées au runtime
- ✅ Compatible avec différentes configurations Coolify
- ❌ Légèrement plus complexe

**Solution 2 (Dockerfile) :**
- ✅ Plus simple, moins de scripts
- ✅ Utilisateur fixe, plus prévisible
- ❌ Peut nécessiter ajustements selon environnement

## 🔄 Procédures de Rollback

### Rollback Rapide

```bash
# 1. Restaurer les fichiers sauvegardés
cp Dockerfile.backup Dockerfile
cp entrypoint.sh.backup entrypoint.sh

# 2. Rebuild et redéploiement
docker build -t oracle-api-rollback .

# 3. Push du rollback
git add .
git commit -m "rollback: retour configuration EACCES précédente"
git push origin main
```

### Rollback via Git

```bash
# Identifier le commit précédent
git log --oneline -5

# Rollback vers le commit précédent
git revert <commit-hash>
git push origin main
```

### Rollback Coolify

```bash
# Via l'interface Coolify
1. Accéder à la section Deployments
2. Sélectionner le déploiement précédent stable
3. Cliquer sur "Redeploy"

# Via CLI Coolify (si disponible)
coolify deployment rollback --service=oracle-api --version=previous
```

## 🔍 Diagnostic et Monitoring

### Commandes de Diagnostic

```bash
# Vérifier les permissions dans le conteneur
docker exec -it <container-id> ls -la /app/
docker exec -it <container-id> id

# Vérifier les logs en temps réel
docker logs -f <container-id> | grep -E "(EACCES|permission|UPLOAD|CLIENT-SUBMIT)"

# Test d'écriture manuel
docker exec -it <container-id> sh -c 'echo "test" > /app/uploads/test.txt'

# Vérifier les volumes Coolify
docker inspect <container-id> | jq '.[0].Mounts'
```

### Métriques à Surveiller

```bash
# Taux d'erreur uploads
curl -s "http://localhost:3001/api/health" | jq '.uploadErrors'

# Espace disque volumes
df -h /app/uploads /app/logs /app/generated

# Statut des permissions
stat /app/uploads /app/logs /app/generated
```

## 🚨 Points d'Attention Critiques

### Avant Déploiement

1. **Sauvegarde Obligatoire** : Toujours sauvegarder les configurations actuelles
2. **Test Isolé** : Tester sur environnement de staging avant production
3. **Volumes Coolify** : Vérifier que les volumes persistent après redémarrage

### Pendant Déploiement

1. **Logs en Temps Réel** : Surveiller les logs pendant le déploiement
2. **Sanity Check** : Tester un upload immédiatement après déploiement
3. **Rollback Prêt** : Avoir la procédure de rollback prête à exécuter

### Après Déploiement

1. **Monitoring Continu** : Surveiller les erreurs EACCES pendant 24h
2. **Tests Fonctionnels** : Valider tous les flux d'upload
3. **Performance** : Vérifier que les corrections n'impactent pas les performances

## 📋 Checklist de Déploiement

### Pré-Déploiement
- [ ] Sauvegarde des fichiers critiques
- [ ] Tests locaux validés avec `test-permissions-fix.sh`
- [ ] Tests d'upload validés avec `test-upload-validation.sh`
- [ ] Branche de test créée et testée
- [ ] Documentation à jour

### Déploiement
- [ ] Build Docker réussi
- [ ] Tests de permissions validés
- [ ] Logs de démarrage propres
- [ ] Endpoint de santé accessible
- [ ] Test d'upload fonctionnel

### Post-Déploiement
- [ ] Monitoring des erreurs EACCES (0 erreur)
- [ ] Tests fonctionnels end-to-end
- [ ] Performance satisfaisante
- [ ] Documentation mise à jour
- [ ] Équipe informée du succès

## 🔗 Liens Utiles

- [Script de Test Permissions](./test-permissions-fix.sh)
- [Script de Test Upload](./test-upload-validation.sh)
- [Dockerfile Alternative](./apps/api-backend/Dockerfile.alternative)
- [Logs Troubleshooting](#diagnostic-et-monitoring)

## 📞 Support

En cas de problème pendant le déploiement :

1. **Rollback Immédiat** : Utiliser les procédures de rollback
2. **Collecte de Logs** : Sauvegarder tous les logs d'erreur
3. **Analyse Post-Mortem** : Identifier la cause racine
4. **Documentation** : Mettre à jour ce guide avec les leçons apprises