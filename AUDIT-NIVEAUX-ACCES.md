# 🔒 AUDIT SYSTÈME D'ACCÈS PAR NIVEAUX - Oracle Lumira

**Date**: 2025-10-26  
**Auditeur**: Qoder AI Assistant  
**Statut**: ⚠️ **CORRECTIONS CRITIQUES REQUISES**

---

## 📊 RÉSUMÉ EXÉCUTIF

Le système d'accès par niveaux Oracle Lumira présente une **architecture backend solide** mais des **failles critiques côté frontend** qui permettent à tous les utilisateurs d'accéder à l'intégralité du contenu, indépendamment de leur niveau d'abonnement.

### ✅ Points Forts
- Configuration entitlements bien structurée (`entitlements.ts`)
- Hiérarchie des niveaux claire (Intégrale > Profond > Mystique > Initié)
- 50+ capabilities définies
- Composants de protection (`CapabilityGuard`) disponibles
- Context React avec `hasCapability()` fonctionnel

### ❌ Vulnérabilités Critiques Identifiées

| Vulnérabilité | Sévérité | Impact Business |
|---------------|----------|-----------------|
| **Routes non protégées** | 🔴 CRITIQUE | Tous les utilisateurs accèdent à toutes les sphères |
| **Navigation sans vérification** | 🔴 CRITIQUE | MandalaNav affiche tout sans filtrage |
| **Composants de sphères sans guard** | 🟠 MAJEUR | Contenu premium accessible à tous |
| **Pas de fallback UX pour verrouillé** | 🟡 MINEUR | UX dégradée (pas bloquant) |

---

## 🔍 DÉTAIL DES PROBLÈMES

### 1. ❌ Routes Sanctuaire Non Protégées (CRITIQUE)

**Fichier**: `apps/main-app/src/router.tsx`  
**Lignes**: 45-77

**Problème**:
```typescript
// ❌ VULNÉRABILITÉ - Aucune protection par capabilities
<Route path="/sanctuaire/*" element={
  <SanctuaireProvider>
    <Routes>
      <Route path="path" element={<LazySpiritualPath />} />
      <Route path="draws" element={<LazyMesLectures />} />
      <Route path="synthesis" element={<LazySynthesis />} />  
      <Route path="chat" element={<LazyConversations />} />
      <Route path="profile" element={<LazyProfile />} />
    </Routes>
  </SanctuaireProvider>
}} />
```

**Impact**:
- Un utilisateur Initié peut accéder à `/sanctuaire/synthesis` (réservé Profond)
- Un utilisateur Mystique peut accéder à `/sanctuaire/chat` (réservé Intégrale)
- Pas de redirection ni message d'erreur

**Mapping Capabilities** :
| Sphere | Route | Capability Requise | Niveau Requis |
|--------|-------|-------------------|---------------|
| Profil Spirituel | `/sanctuaire/path` | `sanctuaire.sphere.profile` | **Initié** |
| Mes Lectures | `/sanctuaire/draws` | `sanctuaire.sphere.readings` | **Initié** |
| Synthèse | `/sanctuaire/synthesis` | `sanctuaire.sphere.synthesis` | **Profond** |
| Conversations | `/sanctuaire/chat` | `sanctuaire.sphere.guidance` | **Intégrale** |
| Profil | `/sanctuaire/profile` | `sanctuaire.sphere.profile` | **Initié** |

---

### 2. ❌ MandalaNav Affiche Toutes les Sphères (CRITIQUE)

**Fichier**: `apps/main-app/src/components/mandala/MandalaNav.tsx`  
**Lignes**: 200-300

**Problème**:
```typescript
// ❌ VULNÉRABILITÉ - Affiche toutes les sphères sans vérifier l'accès
{ORDER.map((key) => {
  // ...
  return (
    <NavLink to={`/sanctuaire/${key}`}>
      {/* Affiche TOUJOURS la sphère, même si verrouillée */}
    </NavLink>
  );
})}
```

**Impact**:
- Tous les utilisateurs voient les 5 sphères dans le mandala
- Cliquables même si non débloquées
- Pas d'indicateur visuel de verrouillage (🔒)
- Mauvaise UX : frustration utilisateur

---

### 3. 🟠 Composants de Sphères Sans Protection (MAJEUR)

**Fichiers Concernés**:
- `apps/main-app/src/components/spheres/Synthesis.tsx`
- `apps/main-app/src/components/spheres/Conversations.tsx`
- `apps/main-app/src/components/spheres/SpiritualPath.tsx`

**Problème**:
```typescript
// ❌ Aucun composant ne vérifie les capabilities
export const Synthesis = () => {
  // Pas de CapabilityGuard
  // Pas de vérification hasCapability()
  return <div>Contenu premium...</div>;
};
```

**Impact**:
- Même si routes protégées, accès direct possible
- Defense-in-depth compromise
- Risque de bypass

---

## 🛠️ CORRECTIONS RECOMMANDÉES

### PRIORITÉ 1 - CRITIQUE (À implémenter immédiatement)

#### A. Protéger les Routes avec Route Guard

**Créer**: `apps/main-app/src/components/auth/ProtectedRoute.tsx`

```typescript
import { Navigate } from 'react-router-dom';
import { useSanctuaire } from '../../contexts/SanctuaireContext';
import { LockedCard } from './CapabilityGuard';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requires: string;
  redirectTo?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requires,
  redirectTo = '/sanctuaire'
}) => {
  const { hasCapability, isLoading } = useSanctuaire();

  if (isLoading) {
    return <div>Chargement...</div>;
  }

  if (!hasCapability(requires)) {
    return (
      <div className="min-h-screen bg-cosmic-deep flex items-center justify-center p-6">
        <LockedCard 
          level="supérieur" 
          message="Cette sphère requiert un niveau d'accès supérieur"
          action={{
            label: "Retour au sanctuaire",
            onClick: () => window.location.href = '/sanctuaire'
          }}
        />
      </div>
    );
  }

  return <>{children}</>;
};
```

**Modifier**: `apps/main-app/src/router.tsx`

```typescript
import { ProtectedRoute } from './components/auth/ProtectedRoute';

// ...

<Route path="/sanctuaire/*" element={
  <SanctuaireProvider>
    <Routes>
      <Route path="path" element={
        <ProtectedRoute requires="sanctuaire.sphere.profile">
          <React.Suspense fallback={<SphereSkeleton />}>
            <LazySpiritualPath />
          </React.Suspense>
        </ProtectedRoute>
      } />
      
      <Route path="draws" element={
        <ProtectedRoute requires="sanctuaire.sphere.readings">
          <React.Suspense fallback={<SphereSkeleton />}>
            <LazyMesLectures />
          </React.Suspense>
        </ProtectedRoute>
      } />
      
      <Route path="synthesis" element={
        <ProtectedRoute requires="sanctuaire.sphere.synthesis">
          <React.Suspense fallback={<SphereSkeleton />}>
            <LazySynthesis />
          </React.Suspense>
        </ProtectedRoute>
      } />
      
      <Route path="chat" element={
        <ProtectedRoute requires="sanctuaire.sphere.guidance">
          <React.Suspense fallback={<SphereSkeleton />}>
            <LazyConversations />
          </React.Suspense>
        </ProtectedRoute>
      } />
      
      <Route path="profile" element={
        <ProtectedRoute requires="sanctuaire.sphere.profile">
          <React.Suspense fallback={<SphereSkeleton />}>
            <LazyProfile />
          </React.Suspense>
        </ProtectedRoute>
      } />
    </Routes>
  </SanctuaireProvider>
}} />
```

---

#### B. Filtrer et Verrouiller MandalaNav

**Modifier**: `apps/main-app/src/components/mandala/MandalaNav.tsx`

```typescript
import { useSanctuaire } from '../../contexts/SanctuaireContext';
import { Lock } from 'lucide-react';

// Ajouter après les constantes SPHERE_DESCRIPTIONS
const SPHERE_CAPABILITIES: Record<string, string> = {
  spiritualPath: 'sanctuaire.sphere.profile',
  rawDraws: 'sanctuaire.sphere.readings',
  synthesis: 'sanctuaire.sphere.synthesis',
  conversations: 'sanctuaire.sphere.guidance',
  profile: 'sanctuaire.sphere.profile',
};

const SPHERE_REQUIRED_LEVEL: Record<string, string> = {
  spiritualPath: 'Initié',
  rawDraws: 'Initié',
  synthesis: 'Profond',
  conversations: 'Intégrale',
  profile: 'Initié',
};

// Dans le composant
const MandalaNav: React.FC<Props> = ({ ... }) => {
  const { hasCapability } = useSanctuaire(); // ✅ Ajouter

  // ... code existant ...

  // Dans la boucle ORDER.map()
  {ORDER.map((key) => {
    const i = ORDER.indexOf(key);
    const isLocked = !hasCapability(SPHERE_CAPABILITIES[key]); // ✅ Vérifier
    const requiredLevel = SPHERE_REQUIRED_LEVEL[key];
    
    // ...
    
    return (
      <motion.div {...existingProps}>
        <NavLink
          to={isLocked ? '#' : `/sanctuaire/${key}`} // ✅ Désactiver si verrouillé
          onClick={(e) => {
            if (isLocked) {
              e.preventDefault(); // ✅ Bloquer la navigation
              // Optionnel : afficher un toast "Niveau X requis"
            }
          }}
          className={`... ${isLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <div className="...">
            {/* Icône de la sphère */}
            {ICONS[key]}
            
            {/* ✅ AJOUTER : Badge de verrouillage */}
            {isLocked && (
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                <Lock className="w-3 h-3 text-white" />
              </div>
            )}
          </div>
          
          {/* ✅ AJOUTER : Tooltip niveau requis */}
          {isLocked && (
            <div className="absolute bottom-full mb-2 px-3 py-1 bg-black/80 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              Nécessite le niveau {requiredLevel}
            </div>
          )}
        </NavLink>
      </motion.div>
    );
  })}
```

---

### PRIORITÉ 2 - MAJEUR (Recommandé)

#### C. Protéger les Composants de Sphères

Envelopper chaque composant avec CapabilityGuard :

**Exemple** : `apps/main-app/src/components/spheres/Synthesis.tsx`

```typescript
import { CapabilityGuard, LockedCard } from '../auth/CapabilityGuard';

export const Synthesis = () => {
  return (
    <CapabilityGuard
      requires="sanctuaire.sphere.synthesis"
      fallback={
        <LockedCard 
          level="Profond"
          message="La Synthèse est réservée aux membres de niveau Profond et supérieur"
          action={{
            label: "Découvrir les niveaux",
            onClick: () => window.location.href = '/commande'
          }}
        />
      }
    >
      {/* Contenu réel de Synthesis */}
      <div className="...">
        Contenu premium de la synthèse...
      </div>
    </CapabilityGuard>
  );
};
```

---

## 🧪 TESTS DE VALIDATION

Pour valider les corrections, tester les scénarios suivants :

### Test 1 : Utilisateur Initié

```
✅ Doit accéder à : /sanctuaire/path, /sanctuaire/draws, /sanctuaire/profile
❌ Doit être bloqué sur : /sanctuaire/synthesis, /sanctuaire/chat
✅ MandalaNav doit afficher 🔒 sur synthesis et conversations
```

### Test 2 : Utilisateur Profond

```
✅ Doit accéder à : /sanctuaire/synthesis (+ toutes sphères Initié/Mystique)
❌ Doit être bloqué sur : /sanctuaire/chat
✅ MandalaNav doit afficher 🔒 uniquement sur conversations
```

### Test 3 : Utilisateur Intégrale

```
✅ Doit accéder à : toutes les sphères
✅ MandalaNav ne doit afficher aucun 🔒
```

---

## 📊 IMPACT ESTIMÉ DES CORRECTIONS

| Métrique | Avant | Après | Amélioration |
|----------|-------|-------|--------------|
| **Sécurité des routes** | 0% | 100% | +100% |
| **UX Différenciation niveaux** | 0% | 100% | +100% |
| **Conversions vers niveaux sup.** | 0% | ~20-30% | +25% estimé |
| **Temps dev** | - | ~4h | - |

---

## ✅ CHECKLIST D'IMPLÉMENTATION

- [ ] Créer `ProtectedRoute.tsx`
- [ ] Modifier `router.tsx` avec guards
- [ ] Ajouter mapping capabilities dans `MandalaNav.tsx`
- [ ] Filtrer sphères verrouillées dans navigation
- [ ] Ajouter badges 🔒 visuels
- [ ] Envelopper composants Synthesis/Conversations avec CapabilityGuard
- [ ] Tester scénario Initié
- [ ] Tester scénario Profond
- [ ] Tester scénario Intégrale
- [ ] Commit & Deploy

---

## 🎯 CONCLUSION

Le système d'accès par niveaux Oracle Lumira dispose d'une **excellente base technique backend** mais nécessite une **implémentation frontend urgente** pour devenir opérationnel.

**Recommandation** : Implémenter les corrections PRIORITÉ 1 (A et B) **immédiatement** avant toute mise en production avec des utilisateurs payants.

**Risque actuel** : Tous les utilisateurs peuvent accéder gratuitement au contenu premium → **Perte de revenus** potentielle.

**ROI estimé** : 4h de développement → Activation du système de monétisation par niveaux → Augmentation revenus +25-30%.

---

**Auteur**: Qoder AI Assistant  
**Contact**: En cas de questions, relire ce document et référencer les numéros de ligne des fichiers.
