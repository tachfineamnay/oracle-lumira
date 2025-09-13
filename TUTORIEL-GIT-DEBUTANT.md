# 🚀 Tutoriel Git pour Débutant - Oracle Lumira

## 📋 **Objectif**
Transférer le nouveau design "forêt mystique" depuis WebContainer vers votre repository GitHub local.

---

## 🛠️ **Étape 1 : Préparer votre environnement local**

### **A. Ouvrir le terminal/invite de commande**
- **Windows** : Appuyez sur `Win + R`, tapez `cmd`, puis Entrée
- **Mac** : Appuyez sur `Cmd + Espace`, tapez `Terminal`, puis Entrée
- **Linux** : `Ctrl + Alt + T`

### **B. Naviguer vers votre projet**
```bash
# Remplacez par le chemin vers votre projet
cd C:\Users\VotreNom\Desktop\oracle-lumira
# ou sur Mac/Linux :
cd ~/Desktop/oracle-lumira
```

### **C. Vérifier que vous êtes dans le bon dossier**
```bash
# Cette commande doit afficher les dossiers apps/, README.md, etc.
ls
# ou sur Windows :
dir
```

---

## 📥 **Étape 2 : Récupérer les fichiers modifiés**

### **A. Créer une nouvelle branche pour les changements**
```bash
# Créer et basculer sur une nouvelle branche
git checkout -b design/foret-mystique

# Vérifier que vous êtes sur la bonne branche
git branch
```

### **B. Copier les fichiers depuis WebContainer**

**🔥 IMPORTANT** : Vous devez copier manuellement le contenu des fichiers suivants depuis cette interface WebContainer vers votre éditeur local (VS Code, Notepad++, etc.) :

#### **1. Configuration Tailwind**
- **Fichier** : `apps/main-app/tailwind.config.js`
- **Action** : Remplacer complètement le contenu

#### **2. Composant principal**
- **Fichier** : `apps/main-app/src/App.tsx`
- **Action** : Remplacer complètement le contenu

#### **3. Composants de design**
- **Fichier** : `apps/main-app/src/components/Hero.tsx`
- **Fichier** : `apps/main-app/src/components/LevelsSection.tsx`
- **Fichier** : `apps/main-app/src/components/LevelCard.tsx`
- **Fichier** : `apps/main-app/src/components/Footer.tsx`
- **Fichier** : `apps/main-app/src/components/Testimonials.tsx`
- **Fichier** : `apps/main-app/src/components/UpsellSection.tsx`
- **Fichier** : `apps/main-app/src/components/DynamicForm.tsx`
- **Fichier** : `apps/main-app/src/components/CircularProgress.tsx`
- **Action** : Remplacer complètement le contenu de chaque fichier

### **C. Méthode de copie recommandée**

1. **Ouvrir le fichier dans WebContainer** (cliquer sur le nom du fichier dans la liste)
2. **Sélectionner tout le contenu** (`Ctrl+A` ou `Cmd+A`)
3. **Copier** (`Ctrl+C` ou `Cmd+C`)
4. **Ouvrir le même fichier dans votre éditeur local**
5. **Sélectionner tout** (`Ctrl+A` ou `Cmd+A`)
6. **Coller** (`Ctrl+V` ou `Cmd+V`)
7. **Sauvegarder** (`Ctrl+S` ou `Cmd+S`)

---

## ⚙️ **Étape 3 : Configurer les variables d'environnement**

### **A. Backend (.env)**
```bash
# Créer le fichier
cp apps/api-backend/.env.example apps/api-backend/.env

# Éditer avec vos vraies valeurs
# Ouvrir apps/api-backend/.env dans votre éditeur et modifier :
```

```env
# Database
MONGODB_URI=mongodb://localhost:27017/oracle-lumira
# ou votre vraie URI MongoDB

# Stripe (remplacez par vos vraies clés)
STRIPE_SECRET_KEY=sk_test_votre_vraie_cle_secrete
STRIPE_WEBHOOK_SECRET=whsec_votre_vrai_secret

# Security
JWT_SECRET=votre-secret-jwt-32-caracteres-minimum
```

### **B. Frontend (.env)**
```bash
# Créer le fichier
cp apps/main-app/.env.example apps/main-app/.env

# Éditer avec vos vraies valeurs
# Ouvrir apps/main-app/.env dans votre éditeur et modifier :
```

```env
# API
VITE_API_URL=http://localhost:3001/api

# Stripe (remplacez par votre vraie clé publique)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_votre_vraie_cle_publique
```

---

## 🧪 **Étape 4 : Tester en local**

### **A. Installer les dépendances**
```bash
# Backend
cd apps/api-backend
npm install
npm run build

# Frontend
cd ../main-app
npm install
```

### **B. Démarrer les serveurs**

**Terminal 1 - Backend :**
```bash
cd apps/api-backend
npm run dev
```

**Terminal 2 - Frontend :**
```bash
cd apps/main-app
npm run dev
```

### **C. Vérifier que ça marche**
- Ouvrir `http://localhost:5173`
- Vous devriez voir le nouveau design forêt mystique
- Vérifier que les niveaux se chargent (pas d'erreur 500)

---

## 📤 **Étape 5 : Committer vers GitHub**

### **A. Vérifier les changements**
```bash
# Retourner à la racine du projet
cd ../..

# Voir les fichiers modifiés
git status
```

### **B. Ajouter les fichiers modifiés**
```bash
# Ajouter tous les fichiers modifiés
git add .

# Ou ajouter fichier par fichier si vous préférez
git add apps/main-app/tailwind.config.js
git add apps/main-app/src/App.tsx
git add apps/main-app/src/components/
```

### **C. Créer le commit**
```bash
git commit -m "feat: nouveau design forêt mystique avec lumière lunaire

- Palette noir abyssal + or pulsant + violet astral
- Suppression animations complexes
- Effet ondulaire paisible en arrière-plan
- Relief de forêt mystique avec lumière lunaire
- Étoiles scintillantes dispersées
- Typographie Playfair Display italic + Inter light
- Design épuré et apaisant"
```

### **D. Pousser vers GitHub**
```bash
# Pousser la nouvelle branche
git push origin design/foret-mystique
```

---

## 🔀 **Étape 6 : Créer une Pull Request (optionnel)**

### **A. Sur GitHub.com**
1. Aller sur votre repository
2. Cliquer sur "Compare & pull request"
3. Titre : "Nouveau design forêt mystique"
4. Description : "Transformation complète du design selon la vision forêt mystique"
5. Cliquer "Create pull request"

### **B. Ou merger directement**
```bash
# Basculer sur main
git checkout main

# Merger la branche design
git merge design/foret-mystique

# Pousser vers main
git push origin main
```

---

## ❌ **En cas de problème**

### **Erreur "git not found"**
- Installer Git : https://git-scm.com/downloads

### **Erreur "npm not found"**
- Installer Node.js : https://nodejs.org/

### **Erreur de merge conflict**
```bash
# Annuler le merge
git merge --abort

# Recommencer étape par étape
```

### **Erreur de permissions**
```bash
# Vérifier que vous êtes propriétaire du dossier
# Ou utiliser sudo sur Mac/Linux
```

---

## ✅ **Checklist finale**

- [ ] Tous les fichiers copiés depuis WebContainer
- [ ] Fichiers `.env` créés et configurés
- [ ] Tests locaux réussis (page s'affiche)
- [ ] Changements committés
- [ ] Poussés vers GitHub
- [ ] Design forêt mystique visible en local

---

## 🆘 **Besoin d'aide ?**

Si vous rencontrez des problèmes :

1. **Vérifiez chaque étape** une par une
2. **Copiez-collez les messages d'erreur** exacts
3. **Vérifiez que vous êtes dans le bon dossier** avec `pwd` (Mac/Linux) ou `cd` (Windows)
4. **Assurez-vous que Git et Node.js sont installés**

Le nouveau design forêt mystique sera alors disponible sur votre repository GitHub ! 🌙✨