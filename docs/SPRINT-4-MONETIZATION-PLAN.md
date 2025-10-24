# 🎯 SPRINT 4 : ACTIVATION DE LA MONÉTISATION (GATING)

**Date de création** : 24 Octobre 2025  
**Architecte** : Système d'Intelligence Artificielle  
**Statut** : ✅ Préparé - En attente de validation

---

## 📋 CONTEXTE

Suite à la **Phase d'Unification** (Sprints 2 & 3) qui a établi :
- ✅ Source unique de vérité ([`SanctuaireContext`](../apps/main-app/src/contexts/SanctuaireContext.tsx))
- ✅ Endpoints `/api/users/profile` (GET/PATCH)
- ✅ Design system celeste/violet unifié
- ✅ Suppression de 476 lignes de dette technique

Le **Sprint 4** vise à **activer la monétisation** en implémentant le système de **gating** (verrouillage conditionnel) basé sur les niveaux d'accès.

---

## 🎯 OBJECTIF PRINCIPAL

**Transformer les hooks et composants préparés en système de monétisation opérationnel**

### Résultat attendu
Un système où :
1. Les utilisateurs **FREE** voient les cadenas sur les fonctionnalités Premium
2. Les pages Premium affichent un **AccessGate** élégant avec CTA vers upgrade
3. Le **stepper de l'onboarding** reflète le niveau actuel et les paliers disponibles
4. La **navigation sidebar** indique clairement les accès bloqués/débloqués

---

## 🔍 AUDIT INITIAL : ÉTAT DES LIEUX

### ✅ COMPOSANTS DÉJÀ PRÊTS (Non utilisés)

| Composant | Fichier | État | Utilisation actuelle |
|-----------|---------|------|---------------------|
| `useSanctuaryAccess()` | `hooks/useSanctuaryAccess.ts` | ✅ Prêt | **NON UTILISÉ** |
| `AccessGate` | `components/ui/AccessGate.tsx` | ✅ Prêt | **NON UTILISÉ** |
| `ACCESS_MATRIX` | `config/sanctuary-access.ts` | ✅ Prêt | Référencé par les hooks |
| `CapabilityGuard` | `components/auth/CapabilityGuard.tsx` | ✅ En production | Utilisé dans `MesLectures` |

### 🔧 COMPOSANTS À MODIFIER

| Composant | Fichier | Problème identifié | Action requise |
|-----------|---------|-------------------|----------------|
| `SanctuaireSidebar` | `components/layout/SanctuaireSidebar.tsx` | Utilise `useSanctuaryAccess()` mais **seulement pour rawDraws** | Étendre à toutes les pages Premium |
| `MesLectures` | `components/spheres/MesLectures.tsx` | Affiche `AccessGate` si `!canAccess('oracle.viewHistory')` | ✅ **DÉJÀ CONFORME** |
| `Synthesis` | `components/spheres/Synthesis.tsx` | **Aucun gating** actuellement | Ajouter `AccessGate` |
| `SpiritualPath` | `components/spheres/SpiritualPath.tsx` | **Aucun gating** actuellement | Ajouter `AccessGate` |
| `OnboardingForm` | `components/sanctuaire/OnboardingForm.tsx` | Stepper statique (1-4) | Rendre dynamique selon niveau acheté |

### ⚠️ PROBLÈME MAJEUR DÉTECTÉ

**Le hook `useSanctuaryAccess()` utilise un mapping TEMPORAIRE :**

```typescript
// ❌ CODE ACTUEL (ligne 101-110 de useSanctuaryAccess.ts)
const userLevel = useMemo<SanctuaryLevel>(() => {
  if (!user) return SanctuaryLevel.FREE;
  
  const orderCount = user.level || 0;
  
  // Mapping temporaire basé sur le nombre de commandes
  if (orderCount === 0) return SanctuaryLevel.FREE;
  if (orderCount <= 5) return SanctuaryLevel.PROFOND;
  if (orderCount <= 15) return SanctuaryLevel.MYSTIQUE;
  return SanctuaryLevel.INTEGRAL;
}, [user]);
```

**🚨 PROBLÈME** : Ce mapping est **INCOMPATIBLE** avec notre système actuel où :
- `user.level` = 1, 2, 3, ou 4 (niveau de la commande)
- `highestLevel` vient de `useSanctuaire()` et représente le niveau le plus élevé acheté

**✅ SOLUTION** : Remplacer le mapping temporaire par l'utilisation directe de `highestLevel` du `SanctuaireContext`.

---

## 📐 ARCHITECTURE CIBLE

### Flux de données

```mermaid
graph TB
    A[SanctuaireContext] -->|highestLevel 1-4| B[useSanctuaryAccess]
    B -->|Mapping vers SanctuaryLevel| C[ACCESS_MATRIX]
    C -->|AccessRights| D[Composants UI]
    D -->|canAccess| E{Vérification}
    E -->|true| F[Affichage contenu]
    E -->|false| G[AccessGate]
    G -->|CTA| H[/commande]
```

### Mapping des niveaux

| Backend (`user.level`) | Enum Frontend | Nom commercial | Accès |
|------------------------|---------------|----------------|-------|
| 0 (aucune commande) | `SanctuaryLevel.FREE` | Gratuit | Limité |
| 1 | `SanctuaryLevel.PROFOND` | Niveau Profond ✨ | 3 tirages/jour, Historique |
| 2 | `SanctuaryLevel.MYSTIQUE` | Niveau Mystique 🔮 | Tirages illimités, Synthèse PDF |
| 3 | `SanctuaryLevel.PROFOND` | Niveau Profond (Alt) | Équivalent niveau 1 |
| 4 | `SanctuaryLevel.INTEGRAL` | Niveau Intégral 👑 | Tout illimité + IA |

---

## 🗓️ PLAN D'EXÉCUTION DÉTAILLÉ

### **PHASE A : Correction du Hook d'Accès** ⏱️ 15 min

**Fichier** : `apps/main-app/src/hooks/useSanctuaryAccess.ts`

**Modifications** :

1. **Importer `useSanctuaire`** pour accéder à `highestLevel`
2. **Remplacer le mapping temporaire** par une logique basée sur `highestLevel`
3. **Mapper les niveaux 1-4 vers les enums `SanctuaryLevel`**

**Code à modifier** (ligne 101-110) :

```typescript
// ❌ AVANT
const userLevel = useMemo<SanctuaryLevel>(() => {
  if (!user) return SanctuaryLevel.FREE;
  const orderCount = user.level || 0;
  if (orderCount === 0) return SanctuaryLevel.FREE;
  if (orderCount <= 5) return SanctuaryLevel.PROFOND;
  if (orderCount <= 15) return SanctuaryLevel.MYSTIQUE;
  return SanctuaryLevel.INTEGRAL;
}, [user]);

// ✅ APRÈS
const { highestLevel } = useSanctuaire();

const userLevel = useMemo<SanctuaryLevel>(() => {
  if (!highestLevel) return SanctuaryLevel.FREE;
  
  // Mapping direct niveau backend → enum frontend
  switch (highestLevel) {
    case 1:
    case 3: // Niveau Profond (ancien niveau 3)
      return SanctuaryLevel.PROFOND;
    case 2:
      return SanctuaryLevel.MYSTIQUE;
    case 4:
      return SanctuaryLevel.INTEGRAL;
    default:
      return SanctuaryLevel.FREE;
  }
}, [highestLevel]);
```

**Tests de validation** :
- [ ] User avec `highestLevel = null` → `SanctuaryLevel.FREE`
- [ ] User avec `highestLevel = 1` → `SanctuaryLevel.PROFOND`
- [ ] User avec `highestLevel = 2` → `SanctuaryLevel.MYSTIQUE`
- [ ] User avec `highestLevel = 4` → `SanctuaryLevel.INTEGRAL`

---

### **PHASE B : Activation du Gating sur Synthesis** ⏱️ 10 min

**Fichier** : `apps/main-app/src/components/spheres/Synthesis.tsx`

**Modifications** :

1. **Importer le hook et le composant**
2. **Ajouter la vérification d'accès**
3. **Afficher `AccessGate` si accès refusé**

**Code à ajouter** (après les imports, ligne 8) :

```typescript
import { useSanctuaryAccess } from '../../hooks/useSanctuaryAccess';
import AccessGate from '../ui/AccessGate';
import { SanctuaryLevel } from '../../config/sanctuary-access';
```

**Code à ajouter** (dans le composant, ligne 38) :

```typescript
const { canAccess } = useSanctuaryAccess();

// Vérification d'accès
if (!canAccess('synthesis.view')) {
  return (
    <div className="max-w-3xl mx-auto">
      <AccessGate
        feature="Synthèse Spirituelle"
        requiredLevel={SanctuaryLevel.PROFOND}
        customMessage="La synthèse de vos tirages Oracle est réservée aux niveaux Profond et supérieurs"
      />
    </div>
  );
}
```

**Tests de validation** :
- [ ] User FREE → Affiche `AccessGate` avec message et CTA
- [ ] User PROFOND+ → Affiche la grille de synthèse
- [ ] CTA "Découvrir les niveaux" redirige vers `/commande`

---

### **PHASE C : Activation du Gating sur SpiritualPath** ⏱️ 10 min

**Fichier** : `apps/main-app/src/components/spheres/SpiritualPath.tsx`

**Modifications** : Identiques à la Phase B

**Code à ajouter** (après les imports) :

```typescript
import { useSanctuaryAccess } from '../../hooks/useSanctuaryAccess';
import AccessGate from '../ui/AccessGate';
import { SanctuaryLevel } from '../../config/sanctuary-access';
```

**Code à ajouter** (dans le composant, ligne 23) :

```typescript
const { canAccess } = useSanctuaryAccess();

// Vérification d'accès
if (!canAccess('sanctuary.meditationTools')) {
  return (
    <div className="max-w-3xl mx-auto">
      <AccessGate
        feature="Chemin Spirituel Personnalisé"
        requiredLevel={SanctuaryLevel.PROFOND}
        customMessage="Votre parcours initiatique personnalisé est réservé aux niveaux Profond et supérieurs"
      />
    </div>
  );
}
```

---

### **PHASE D : Extension du Gating dans la Sidebar** ⏱️ 20 min

**Fichier** : `apps/main-app/src/components/layout/SanctuaireSidebar.tsx`

**Objectif** : Afficher des cadenas sur **toutes** les pages Premium, pas seulement `rawDraws`.

**Modifications** :

1. **Définir les règles d'accès par page**
2. **Afficher le cadenas si `!canAccess(featurePath)`**

**Code à modifier** (ligne 79-112) :

```typescript
// ❌ AVANT
const isLocked = item.key === 'rawDraws' && !isHistoryAccessible;

// ✅ APRÈS
// Mapping des clés de navigation vers les FeaturePath
const accessRules: Record<string, string> = {
  home: 'sanctuary.access',           // Toujours accessible
  rawDraws: 'oracle.viewHistory',     // Niveau Profond+
  spiritualPath: 'sanctuary.meditationTools', // Niveau Profond+
  synthesis: 'synthesis.view',        // Niveau Profond+
  conversations: 'conversations.messageOracle' // Niveau Profond+
};

const featurePath = accessRules[item.key];
const isLocked = featurePath ? !canAccess(featurePath as any) : false;
```

**Amélioration visuelle** : Ajouter un tooltip explicatif

```typescript
title={isLocked 
  ? `${item.label} réservé aux niveaux supérieurs` 
  : undefined
}
```

**Tests de validation** :
- [ ] User FREE → Cadenas sur rawDraws, spiritualPath, synthesis, conversations
- [ ] User PROFOND → Accès à rawDraws, spiritualPath, synthesis (cadenas sur conversations si limité)
- [ ] User MYSTIQUE+ → Tout débloqué

---

### **PHASE E : Stepper Dynamique dans l'Onboarding** ⏱️ 25 min

**Fichier** : `apps/main-app/src/components/sanctuaire/OnboardingForm.tsx`

**Objectif** : Afficher le stepper avec **4 étapes** pour tous les niveaux, mais indiquer visuellement le niveau acheté.

**Problème actuel** : Le stepper affiche "Étape X sur 4" mais ne montre pas le niveau acheté.

**Solution** : Ajouter un badge de niveau au-dessus du stepper.

**Code à ajouter** (ligne 610, avant le titre) :

```typescript
const { highestLevel, levelMetadata } = useSanctuaire();

// ... dans le JSX, avant le titre

{highestLevel && levelMetadata && (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    className="mb-4"
  >
    <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-400/20 to-blue-400/20 border border-purple-400/30 rounded-full">
      <span className="text-lg">{levelMetadata.icon}</span>
      <span className="text-sm font-medium text-purple-400">
        {levelMetadata.name}
      </span>
    </div>
  </motion.div>
)}
```

**Tests de validation** :
- [ ] User niveau 1 → Badge "Niveau Profond ✨"
- [ ] User niveau 2 → Badge "Niveau Mystique 🔮"
- [ ] User niveau 4 → Badge "Niveau Intégral 👑"
- [ ] Badge centré au-dessus du titre "Complétez votre Profil"

---

### **PHASE F : Tests End-to-End** ⏱️ 30 min

**Scénarios de test complets** :

#### Scénario 1 : User FREE (aucune commande)
1. [ ] Login au Sanctuaire
2. [ ] Sidebar : Cadenas sur rawDraws, spiritualPath, synthesis, conversations
3. [ ] Cliquer "Tirages & Lectures" → Affiche `AccessGate`
4. [ ] Cliquer "Synthèse" → Affiche `AccessGate`
5. [ ] Cliquer "Chemin Spirituel" → Affiche `AccessGate`
6. [ ] Cliquer "Découvrir les niveaux" → Redirige vers `/commande`

#### Scénario 2 : User PROFOND (level = 1)
1. [ ] Login au Sanctuaire
2. [ ] Sidebar : Aucun cadenas sauf conversations (si limité)
3. [ ] Cliquer "Tirages & Lectures" → Affiche la bibliothèque
4. [ ] Cliquer "Synthèse" → Affiche la grille de synthèse
5. [ ] Cliquer "Chemin Spirituel" → Affiche le chemin (ou EmptyState)
6. [ ] OnboardingForm : Badge "Niveau Profond ✨" visible

#### Scénario 3 : User MYSTIQUE (level = 2)
1. [ ] Tout débloqué sauf IA (si niveau 4 uniquement)
2. [ ] OnboardingForm : Badge "Niveau Mystique 🔮" visible
3. [ ] Synthèse : Bouton "Télécharger PDF" visible et fonctionnel

#### Scénario 4 : User INTÉGRAL (level = 4)
1. [ ] Tout débloqué
2. [ ] OnboardingForm : Badge "Niveau Intégral 👑" visible
3. [ ] Aucun cadenas dans la sidebar
4. [ ] Toutes les fonctionnalités accessibles

---

## 🎨 DESIGN SYSTEM : PRÉSERVATION

**✅ CONFIRMÉ** : Toutes les modifications respectent le design celeste/violet :

- `AccessGate` : Utilise `LEVEL_COLORS` avec palette purple/blue/amber
- `OnboardingForm` : Déjà conforme (purple-400, blue-400)
- `Sidebar` : Déjà conforme (amber-400 pour les accents)

**Aucune modification de couleurs requise.**

---

## 📊 MATRICE DE DÉCISION : RÈGLES D'ACCÈS

| Fonctionnalité | FREE | PROFOND | MYSTIQUE | INTÉGRAL | FeaturePath |
|----------------|------|---------|----------|----------|-------------|
| **Tirages quotidiens** | 1 | 3 | ∞ | ∞ | `oracle.dailyDraws` |
| **Historique** | ❌ | ✅ | ✅ | ✅ | `oracle.viewHistory` |
| **Synthèse** | ❌ | ✅ (vue) | ✅ (PDF) | ✅ (IA) | `synthesis.view` |
| **Chemin Spirituel** | ❌ | ✅ | ✅ | ✅ | `sanctuary.meditationTools` |
| **Conversations** | ❌ | ✅ (5/j) | ✅ (20/j) | ✅ (∞) | `conversations.messageOracle` |

---

## 🚀 ROADMAP POST-SPRINT 4

### Améliorations futures (hors scope Sprint 4)

1. **Quotas en temps réel**
   - Compteur de tirages quotidiens dans la sidebar
   - Barre de progression "3/3 tirages utilisés"
   - Reset à minuit (logique backend requise)

2. **Page dédiée aux niveaux**
   - Route `/sanctuaire/levels`
   - Comparaison visuelle des 4 niveaux
   - Boutons CTA par niveau

3. **Upsell contextuel**
   - Bannière "Débloquez la synthèse PDF" dans Synthesis
   - Modal de découverte au 1er clic sur une feature verrouillée

4. **Analytics**
   - Tracking des clics sur `AccessGate`
   - Taux de conversion FREE → PROFOND
   - Features les plus demandées

---

## ✅ CRITÈRES DE SUCCÈS

### Fonctionnels
- [ ] User FREE ne peut **pas** accéder à rawDraws, synthesis, spiritualPath
- [ ] User PROFOND+ peut accéder à toutes ses features sans erreur
- [ ] `AccessGate` affiche le bon niveau requis pour chaque feature
- [ ] CTA "Découvrir les niveaux" redirige vers `/commande`
- [ ] Sidebar affiche les cadenas de manière cohérente

### Techniques
- [ ] Aucune régression sur le design celeste/violet
- [ ] Aucune erreur console lors de la navigation
- [ ] Hook `useSanctuaryAccess()` utilise `highestLevel` du context
- [ ] `ACCESS_MATRIX` correctement mappé

### UX
- [ ] Transitions fluides entre états bloqué/débloqué
- [ ] Messages d'erreur clairs et bienveillants
- [ ] Badge de niveau visible dans l'onboarding
- [ ] Tooltip explicatifs sur les cadenas

---

## 📝 COMMANDES DE DÉPLOIEMENT

```bash
# Vérification avant déploiement
cd apps/main-app
npm run build

# Si succès :
git add .
git commit -m "feat: Sprint 4 - Activation monétisation (gating complet)"
git push origin main
```

---

## 🎯 PROCHAINE ÉTAPE

**En attente de votre validation en production** pour démarrer l'exécution du Sprint 4.

Une fois validé, je procéderai dans l'ordre suivant :
1. Phase A (Hook) → Phase B (Synthesis) → Phase C (SpiritualPath)
2. Phase D (Sidebar) → Phase E (Onboarding)
3. Phase F (Tests E2E complets)

**Temps estimé total** : 2h00 (incluant tests)

---

**Architecte IA** | Oracle Lumira V1-MVP  
24 Octobre 2025
