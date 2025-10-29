# 🚀 FIX DÉPLOIEMENT COOLIFY : Problème de Cache Docker/Vite

## 🔍 Diagnostic du Problème

### Symptômes
- ✅ Code modifié committé et pushé sur GitHub
- ❌ Version déployée sur Coolify affiche toujours l'ancienne version
- ❌ `console.log('[Profile] BUILD VERSION: 80051b6')` absent dans la console navigateur en production
- ❌ Le `health.json` ne contient pas de métadonnées de version

### Causes Racines Identifiées

#### 1. **Cache Docker Layer sur Coolify**
- Docker réutilise les layers intermédiaires même après `rm -rf dist .vite`
- Le cache `.vite` de Vite persiste dans les layers Docker
- Coolify ne rebuild pas systématiquement sans invalidation explicite

#### 2. **Cache Nginx/Navigateur trop agressif**
- `Cache-Control: no-cache` seul ne suffit pas pour les SPA modernes
- Les navigateurs utilisent les ETags pour ignorer le `no-cache`
- Sans ETag off, l'index.html reste en cache

#### 3. **Absence de traçabilité de build**
- Impossible de savoir quel commit est déployé
- Pas de hash de commit dans `health.json`
- Pas de timestamp de build visible

---

## ✅ Solution Implémentée

### Modifications Apportées

#### 1. **Dockerfile Racine** (`Dockerfile`)
```dockerfile
# AVANT
ARG VITE_API_BASE_URL
ARG VITE_APP_DOMAIN

# APRÈS
ARG VITE_API_BASE_URL
ARG VITE_APP_DOMAIN
ARG BUILD_VERSION=unknown
ARG BUILD_TIMESTAMP=unknown

ENV VITE_BUILD_VERSION=$BUILD_VERSION
ENV VITE_BUILD_TIMESTAMP=$BUILD_TIMESTAMP

RUN echo "Building version: $BUILD_VERSION at $BUILD_TIMESTAMP" && \
    cd apps/main-app && npm run build
```

**Pourquoi ?**
- `BUILD_VERSION` change à chaque build → invalide le cache Docker
- Les logs affichent la version buildée pour debugging

#### 2. **Dockerfile apps/main-app** (`apps/main-app/Dockerfile`)
```dockerfile
# Ajout des ARG BUILD_VERSION/BUILD_TIMESTAMP
# Suppression du cache node_modules/.cache en plus de .vite
RUN cd apps/main-app \
 && echo "Building version: $BUILD_VERSION at $BUILD_TIMESTAMP" \
 && rm -rf dist .vite node_modules/.vite node_modules/.cache \
 && npm run build
```

#### 3. **health.json avec métadonnées**
```dockerfile
ARG BUILD_VERSION=unknown
ARG BUILD_TIMESTAMP=unknown
RUN echo '{"status":"healthy","service":"oracle-lumira-frontend","version":"'$BUILD_VERSION'","buildTimestamp":"'$BUILD_TIMESTAMP'","deployTimestamp":"'$(date -Iseconds)'","port":80}' > /usr/share/nginx/html/health.json
```

**Exemple de sortie :**
```json
{
  "status": "healthy",
  "service": "oracle-lumira-frontend",
  "version": "80051b6",
  "buildTimestamp": "2025-10-28T14:32:10Z",
  "deployTimestamp": "2025-10-28T14:35:42Z",
  "port": 80
}
```

#### 4. **Nginx Anti-Cache Renforcé** (`nginx-frontend.conf`)
```nginx
location / {
  add_header Cache-Control "no-cache, no-store, must-revalidate, max-age=0" always;
  add_header Pragma "no-cache" always;
  add_header Expires "0" always;
  add_header Last-Modified "" always;
  if_modified_since off;
  etag off;
  try_files $uri $uri/ /index.html;
}

location = /health.json {
  add_header Cache-Control "no-cache, no-store, must-revalidate" always;
  add_header Pragma "no-cache" always;
  add_header Expires "0" always;
  etag off;
  try_files /health.json =200;
}
```

**Pourquoi ?**
- `etag off` : Empêche le navigateur d'utiliser les ETags pour bypass le `no-cache`
- `if_modified_since off` : Force le reload même si le timestamp est identique
- `max-age=0` : Directive explicite pour les caches CDN

---

## 🛠️ Instructions Coolify

### Configuration BUILD_VERSION sur Coolify

1. **Aller dans Settings → Build**
2. **Ajouter les Build Arguments :**
   ```bash
   BUILD_VERSION=$(git rev-parse --short HEAD)
   BUILD_TIMESTAMP=$(date -Iseconds)
   ```

3. **OU dans docker-compose.yml Coolify :**
   ```yaml
   services:
     frontend:
       build:
         context: .
         dockerfile: Dockerfile
         args:
           - VITE_STRIPE_PUBLISHABLE_KEY=${VITE_STRIPE_PUBLISHABLE_KEY}
           - VITE_API_BASE_URL=${VITE_API_BASE_URL}
           - VITE_APP_DOMAIN=${VITE_APP_DOMAIN}
           - BUILD_VERSION=${GITHUB_SHA:-unknown}
           - BUILD_TIMESTAMP=$(date -Iseconds)
   ```

4. **Forcer le Rebuild sans cache :**
   - Dans Coolify UI : Activer **"Rebuild without cache"**
   - Ou via CLI :
     ```bash
     docker build --no-cache \
       --build-arg BUILD_VERSION=$(git rev-parse --short HEAD) \
       --build-arg BUILD_TIMESTAMP=$(date -Iseconds) \
       -t oracle-lumira-frontend .
     ```

---

## 🧪 Validation du Déploiement

### 1. Vérifier la version déployée
```bash
curl https://oraclelumira.com/health.json | jq
```

**Sortie attendue :**
```json
{
  "status": "healthy",
  "service": "oracle-lumira-frontend",
  "version": "80051b6",  // Hash du commit actuel
  "buildTimestamp": "2025-10-28T14:32:10Z",
  "deployTimestamp": "2025-10-28T14:35:42Z"
}
```

### 2. Vérifier les logs de build Coolify
Rechercher la ligne :
```
Building version: 80051b6 at 2025-10-28T14:32:10Z
```

### 3. Vérifier dans la console navigateur (DevTools)
```
[Profile] BUILD VERSION: 80051b6 - Refonte UX/UI active
```

### 4. Tester le cache navigateur
1. Ouvrir DevTools → Network
2. Recharger la page (Ctrl+Shift+R)
3. Vérifier que `index.html` retourne `200` (pas `304 Not Modified`)
4. Vérifier les headers de réponse :
   ```
   Cache-Control: no-cache, no-store, must-revalidate, max-age=0
   Pragma: no-cache
   Expires: 0
   ```

---

## 🔄 Procédure de Déploiement Post-Fix

### Étapes à suivre après chaque modification frontend

1. **Commit + Push**
   ```bash
   git add .
   git commit -m "FEAT(PROFILE): Message descriptif"
   git push origin main
   ```

2. **Vérifier le commit SHA**
   ```bash
   git rev-parse --short HEAD
   # Exemple : 80051b6
   ```

3. **Déclencher le redéploiement Coolify**
   - Aller sur Coolify UI → Project → Redeploy
   - **Activer "Rebuild without cache"** (première fois)
   - Lancer le build

4. **Attendre la fin du build (5-10 min)**

5. **Valider le déploiement**
   ```bash
   # Vérifier la version
   curl https://oraclelumira.com/health.json | jq .version
   
   # Doit retourner : "80051b6"
   ```

6. **Tester en navigation privée**
   - Ouvrir Chrome/Firefox en mode navigation privée
   - Accéder à https://oraclelumira.com/sanctuaire/profile
   - Ouvrir DevTools → Console
   - Chercher : `[Profile] BUILD VERSION: 80051b6`

---

## 🚨 Troubleshooting

### Problème : La version n'est toujours pas à jour après rebuild

**Solutions :**
1. **Forcer le rebuild sans cache sur Coolify**
   - Coolify UI → Settings → "Rebuild without cache"
   
2. **Vider le cache Docker sur le serveur**
   ```bash
   # SSH sur le serveur Coolify
   docker system prune -af --volumes
   ```

3. **Vérifier que BUILD_VERSION est bien passé**
   ```bash
   # Voir les logs de build Coolify
   # Chercher : "Building version: XXXXXX"
   ```

### Problème : health.json ne contient pas la version

**Cause :** Les ARG ne sont pas passés au stage de production dans le Dockerfile multi-stage

**Solution :** Vérifier que les ARG sont redéclarés dans le stage production :
```dockerfile
# Stage 2: Production
FROM nginx:alpine AS production

# ⚠️ IMPORTANT : Redéclarer les ARG pour le stage production
ARG BUILD_VERSION=unknown
ARG BUILD_TIMESTAMP=unknown

RUN echo '{"version":"'$BUILD_VERSION'"}' > /usr/share/nginx/html/health.json
```

### Problème : Le navigateur cache toujours index.html

**Solution :**
1. **Hard reload dans le navigateur :**
   - Chrome/Edge : `Ctrl+Shift+R` (Windows) / `Cmd+Shift+R` (Mac)
   - Firefox : `Ctrl+F5`

2. **Vider le cache Application :**
   - DevTools → Application → Storage → Clear Site Data

3. **Tester en mode navigation privée**

---

## 📋 Checklist Avant Chaque Déploiement

- [ ] Code committé avec message structuré selon la norme du projet
- [ ] Tests locaux passés (`npm run build` sans erreurs)
- [ ] Hash commit récupéré (`git rev-parse --short HEAD`)
- [ ] Coolify configuré avec BUILD_VERSION en Build Args
- [ ] "Rebuild without cache" activé (si modifications Dockerfile)
- [ ] Logs de build surveillés pour "Building version: XXXXX"
- [ ] health.json validé après déploiement (`curl /health.json`)
- [ ] Console navigateur vérifiée (BUILD_VERSION présent)
- [ ] Test en navigation privée effectué

---

## 🎯 Résumé des Corrections

| Problème | Solution | Fichier modifié |
|----------|----------|-----------------|
| Cache Docker layer | Ajout ARG BUILD_VERSION pour invalidation | `Dockerfile`, `apps/main-app/Dockerfile` |
| Cache Vite persistant | `rm -rf node_modules/.cache` en plus de `.vite` | `Dockerfile`, `apps/main-app/Dockerfile` |
| Pas de traçabilité | health.json avec version/timestamps | `Dockerfile`, `apps/main-app/Dockerfile` |
| Cache navigateur ETag | `etag off`, `if_modified_since off` dans Nginx | `nginx-frontend.conf`, `apps/main-app/Dockerfile` |
| Cache navigateur agressif | Headers `max-age=0`, `Pragma: no-cache` | `nginx-frontend.conf` |

---

## 🔗 Ressources

- [Documentation Vite - Build Caching](https://vitejs.dev/guide/build.html#caching)
- [Docker Multi-Stage Build Args](https://docs.docker.com/build/guide/build-args/)
- [Nginx Cache Control Headers](https://www.nginx.com/blog/nginx-caching-guide/)
- [Coolify Deployment Best Practices](https://coolify.io/docs/deployments)

---

**Date de création :** 2025-10-29  
**Dernière mise à jour :** 2025-10-29  
**Version du fix :** 1.0  
**Auteur :** Qoder AI - Analyse complète du problème de cache Coolify/Docker
