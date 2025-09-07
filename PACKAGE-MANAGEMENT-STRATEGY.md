# Oracle Lumira - Package Management Strategy

## 📦 Configuration Actuelle

**Structure**: Monorepo avec npm workspaces

```
oracle-lumira/
├── package.json              # 🏗️  Root workspace
├── package-lock.json         # 🔒  SEUL lockfile à garder  
└── apps/
    ├── main-app/
    │   └── package.json       # 📋  App frontend
    ├── api-backend/ 
    │   └── package.json       # 📋  API backend
    ├── expert-desk/
    │   └── package.json       # 📋  Expert desk
    └── shared/                # 📚  Shared components
```

## ✅ Résolution du Conflit VSCode

**Problème**: Multiple lockfiles détectés
```
✅ GARDÉ: /package-lock.json
❌ SUPPRIMÉ: /apps/main-app/package-lock.json  
❌ SUPPRIMÉ: /apps/api-backend/package-lock.json
```

**Configuration .gitignore**:
```gitignore
# Ignore lockfiles in sub-apps (npm workspaces)
apps/*/package-lock.json
apps/*/yarn.lock  
apps/*/pnpm-lock.yaml
```

## 📋 Commandes Standard

### Installation
```bash
# Racine - installe toutes les dépendances
npm install

# App spécifique
npm install --workspace=apps/main-app
npm install --workspace=apps/api-backend
```

### Build
```bash
# Frontend
npm run build:main

# Expert desk  
npm run build:desk

# Tout
npm run build:all
```

### Development
```bash
# Frontend
npm run dev:main

# Expert desk
npm run dev:desk
```

## 🔧 Maintenance

### Ajouter une dépendance
```bash
# À une app spécifique
npm install --workspace=apps/main-app package-name

# À la racine (devDependencies)
npm install -D package-name
```

### Audit de sécurité
```bash
npm audit fix
```

## 🚀 Docker Impact

Le Dockerfile utilise npm workspaces correctement :
```dockerfile
# Copy package files
COPY package*.json ./
COPY apps/main-app/package*.json ./apps/main-app/

# Install from root
RUN npm ci --frozen-lockfile
```

## ⚡ Benefits

- ✅ **Single lockfile**: Pas de conflits de versions
- ✅ **Shared deps**: Dépendances communes optimisées
- ✅ **VSCode happy**: Plus de warning lockfiles
- ✅ **Docker optimized**: Build cache efficace
- ✅ **CI/CD simple**: Une seule installation

---

**Status**: ✅ **RÉSOLU** - Configuration npm workspaces propre
