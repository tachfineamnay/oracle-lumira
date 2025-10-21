# 🔐 Fondations Système de Permissions - Oracle Lumira

## 📋 Résumé de la Mission

**Date :** 21 Octobre 2025  
**Objectif :** Créer l'infrastructure technique pour gérer les niveaux d'accès du Sanctuaire  
**Statut :** ✅ COMPLÉTÉ  
**Impact :** ⚠️ AUCUN (fichiers non utilisés pour le moment)

---

## 🎯 Ce qui a été créé

### 1️⃣ **Matrice des Permissions** (`sanctuary-access.ts`)

**Localisation :** `apps/main-app/src/config/sanctuary-access.ts`

```typescript
// 4 niveaux d'abonnement définis
enum SanctuaryLevel {
  FREE = 'free',
  PROFOND = 'profond',
  MYSTIQUE = 'mystique',
  INTEGRAL = 'integral'
}

// Configuration complète exportée
const ACCESS_MATRIX: Record<SanctuaryLevel, AccessRights>
```

**Contenu de la matrice :**

| Niveau | Oracle | Profil | Sanctuaire | Synthèse | Conversations | Prix/mois |
|--------|--------|--------|------------|----------|---------------|-----------|
| **FREE** | 1 tirage/jour<br>Délai 48h<br>Pas d'historique | Infos de base | Pas d'accès | Pas d'accès | 0 messages | 0 € |
| **PROFOND** | 3 tirages/jour<br>Délai 24h<br>Historique | Upload photos<br>Objectif spirituel | Accès + outils | Vue synthèse | 5 messages/jour | 29,99 € |
| **MYSTIQUE** | Tirages illimités<br>Délai 12h<br>Tous types | Upload photos<br>Objectif spirituel | Accès + perso<br>Assistant IA | PDF + recommandations | 20 messages/jour<br>Support prioritaire | 59,99 € |
| **INTÉGRAL** | Tirages illimités<br>Immédiat<br>Perso inclus | Upload photos<br>Objectif spirituel | Accès complet | Tout débloqué | Messages illimités<br>Garantie réponse | 99,99 € |

**Fonctionnalités exportées :**
- `ACCESS_MATRIX` : Configuration complète
- `LEVEL_NAMES` : Noms conviviaux (ex: "Niveau Profond")
- `LEVEL_COLORS` : Couleurs UI pour chaque niveau
- `isLevelHigherOrEqual()` : Comparer deux niveaux

---

### 2️⃣ **Hook de Permissions** (`useSanctuaryAccess`)

**Localisation :** `apps/main-app/src/hooks/useSanctuaryAccess.ts`

**API du Hook :**

```typescript
const {
  // État actuel
  userLevel,        // SanctuaryLevel de l'utilisateur
  levelName,        // Nom convivial du niveau
  accessRights,     // Droits complets de l'utilisateur
  
  // Vérifications
  canAccess,        // (feature) => boolean
  checkAccess,      // (feature) => { allowed, reason, upgradeRequired }
  
  // Quotas
  canDrawToday,     // () => boolean
  getRemainingDraws,// () => number
  canSendMessage,   // () => boolean
  getRemainingMessages, // () => number
  
  // Helpers
  needsUpgrade,     // (feature) => SanctuaryLevel | null
  isUnlimited       // ('draws' | 'messages') => boolean
} = useSanctuaryAccess();
```

**Exemples d'utilisation :**

```typescript
// Vérification simple
if (canAccess('oracle.viewHistory')) {
  return <HistoryComponent />;
}

// Vérification avec message d'erreur
const historyAccess = checkAccess('oracle.viewHistory');
if (!historyAccess.allowed) {
  toast.error(historyAccess.reason); // "Nécessite le Niveau Profond"
}

// Afficher quotas
const remaining = getRemainingDraws();
console.log(`Tirages restants: ${isUnlimited('draws') ? '∞' : remaining}`);
```

**Features disponibles :**

```typescript
type FeaturePath = 
  // Oracle
  | 'oracle.dailyDraws'
  | 'oracle.viewHistory'
  | 'oracle.detailedInterpretation'
  | 'oracle.drawType.simple'
  | 'oracle.drawType.trois_cartes'
  | 'oracle.drawType.croix_celtique'
  | 'oracle.drawType.personnalise'
  
  // Profile
  | 'profile.editBasicInfo'
  | 'profile.uploadPhotos'
  | 'profile.spiritualObjective'
  
  // Sanctuary
  | 'sanctuary.access'
  | 'sanctuary.customization'
  | 'sanctuary.meditationTools'
  | 'sanctuary.aiAssistant'
  
  // Synthesis
  | 'synthesis.view'
  | 'synthesis.downloadPDF'
  | 'synthesis.personalizedRecommendations'
  | 'synthesis.aiAnalysis'
  
  // Conversations
  | 'conversations.messageOracle'
  | 'conversations.responseGuarantee'
  | 'conversations.prioritySupport';
```

---

### 3️⃣ **Composant Gardien** (`AccessGate`)

**Localisation :** `apps/main-app/src/components/ui/AccessGate.tsx`

**Props du composant :**

```typescript
interface AccessGateProps {
  feature: string;              // "Historique des tirages"
  requiredLevel: SanctuaryLevel;// Niveau minimum requis
  customMessage?: string;       // Message personnalisé
  variant?: 'card' | 'inline' | 'modal'; // Style d'affichage
  size?: 'sm' | 'md' | 'lg';   // Taille
  onDiscoverClick?: () => void; // Callback sur clic "Découvrir"
}
```

**3 variantes d'affichage :**

1. **Card (défaut)** : Bloc complet avec icône, titre, badge niveau, bouton
2. **Inline** : Bannière compacte sur une ligne
3. **Modal** : Popup plein écran avec backdrop blur

**Exemples d'utilisation :**

```tsx
// Remplacement conditionnel
{canAccess('oracle.viewHistory') ? (
  <HistoryComponent />
) : (
  <AccessGate 
    feature="Historique des tirages"
    requiredLevel={SanctuaryLevel.PROFOND}
  />
)}

// Bannière inline
<AccessGate 
  feature="Synthèse PDF"
  requiredLevel={SanctuaryLevel.MYSTIQUE}
  variant="inline"
  size="sm"
/>

// Modal avec navigation
<AccessGate 
  feature="Assistant IA"
  requiredLevel={SanctuaryLevel.INTEGRAL}
  variant="modal"
  onDiscoverClick={() => navigate('/sanctuaire/levels')}
/>
```

**Animations incluses :**
- ✨ Cadenas qui tremble au hover
- 💫 Sparkles qui pulsent en boucle
- 🌈 Couleurs dynamiques selon le niveau requis
- 🎭 Transitions fluides Framer Motion

---

## 🔗 Architecture du Système

```
┌─────────────────────────────────────────────────────────────┐
│                     SANCTUAIRE CONTEXT                       │
│                  (user.level: 0, 5, 15, 30)                 │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│               useSanctuaryAccess() HOOK                      │
│  1. Lit user.level depuis SanctuaireContext                 │
│  2. Mappe vers SanctuaryLevel (FREE/PROFOND/MYSTIQUE/INTEGRAL)│
│  3. Récupère AccessRights depuis ACCESS_MATRIX              │
│  4. Expose fonctions de vérification                        │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                 COMPOSANTS APPLICATIFS                       │
│  - Profile.tsx : Upload photos (PROFOND+)                   │
│  - MesLectures.tsx : Historique (PROFOND+)                  │
│  - Synthesis.tsx : PDF download (MYSTIQUE+)                 │
│  - OracleChat.tsx : Assistant IA (MYSTIQUE+)                │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    AccessGate COMPONENT                      │
│       (Affiché quand canAccess() retourne false)           │
└─────────────────────────────────────────────────────────────┘
```

---

## ⚠️ Important : Travail Non Intégré

### Ce qui a été fait :
✅ Matrice de permissions complète  
✅ Hook React fonctionnel  
✅ Composant UI prêt à l'emploi  
✅ TypeScript 100% typé  
✅ Animations & UX polish  
✅ Documentation & exemples  

### Ce qui N'a PAS été fait :
❌ Aucune intégration dans les composants existants  
❌ Aucun champ `subscriptionLevel` dans le modèle User (backend)  
❌ Pas de logique de comptage quotidien (tirages/messages)  
❌ Pas de page `/sanctuaire/levels` pour upgrade  
❌ Pas de système de paiement/abonnement  

### Impact sur l'existant :
**AUCUN.** Ces fichiers sont complètement isolés. L'application fonctionne exactement comme avant. Tous les utilisateurs ont actuellement accès à toutes les fonctionnalités.

---

## 🚀 Prochaines Étapes (Futures Missions)

### Phase 1 : Backend (Base de données)
```typescript
// apps/api-backend/src/models/User.ts
interface User {
  // ... champs existants
  subscriptionLevel: 'free' | 'profond' | 'mystique' | 'integral';
  subscriptionExpiry?: Date;
  dailyQuotas: {
    draws: { count: number; resetDate: Date };
    messages: { count: number; resetDate: Date };
  };
}
```

### Phase 2 : Intégration Frontend
```tsx
// apps/main-app/src/components/spheres/MesLectures.tsx
import { useSanctuaryAccess } from '@/hooks/useSanctuaryAccess';
import AccessGate from '@/components/ui/AccessGate';

const { canAccess } = useSanctuaryAccess();

return (
  <div>
    {canAccess('oracle.viewHistory') ? (
      <LecturesHistory lectures={lectures} />
    ) : (
      <AccessGate 
        feature="Historique des tirages"
        requiredLevel={SanctuaryLevel.PROFOND}
      />
    )}
  </div>
);
```

### Phase 3 : Système d'Abonnement
- Page `/sanctuaire/levels` : Comparatif des niveaux
- Intégration Stripe : Checkout pour upgrade
- Webhooks : Mise à jour du niveau utilisateur
- Email : Confirmation d'abonnement

### Phase 4 : Quotas & Limites
- Middleware backend : Vérifier quotas avant action
- Compteur UI : Afficher tirages/messages restants
- Reset quotidien : Cron job à minuit
- Notifications : Alerte quand quota atteint

---

## 📝 TODO Techniques

### Dans `useSanctuaryAccess.ts` :

```typescript
// TODO ligne 95 : Remplacer mapping temporaire
const userLevel = useMemo<SanctuaryLevel>(() => {
  if (!user) return SanctuaryLevel.FREE;
  
  // ACTUEL (temporaire) : basé sur nombre de commandes
  const orderCount = user.level || 0;
  if (orderCount === 0) return SanctuaryLevel.FREE;
  if (orderCount <= 5) return SanctuaryLevel.PROFOND;
  if (orderCount <= 15) return SanctuaryLevel.MYSTIQUE;
  return SanctuaryLevel.INTEGRAL;
  
  // FUTUR : Lire directement depuis l'API
  // return user.subscriptionLevel || SanctuaryLevel.FREE;
}, [user]);

// TODO ligne 200 : Implémenter comptage quotidien
const getRemainingDraws = (): number => {
  if (accessRights.oracle.dailyDraws === -1) return Infinity;
  
  // ACTUEL : Retourne la limite théorique
  return accessRights.oracle.dailyDraws;
  
  // FUTUR : Lire depuis le compteur backend
  // const today = new Date().toDateString();
  // const usedToday = user.dailyQuotas.draws.resetDate === today 
  //   ? user.dailyQuotas.draws.count 
  //   : 0;
  // return Math.max(0, accessRights.oracle.dailyDraws - usedToday);
};
```

### Dans `AccessGate.tsx` :

```typescript
// TODO ligne 70 : Implémenter navigation
const handleDiscoverClick = () => {
  if (onDiscoverClick) {
    onDiscoverClick();
  } else {
    // ACTUEL : Log console
    console.log('Redirection vers /sanctuaire/levels');
    
    // FUTUR : Navigation React Router
    // navigate('/sanctuaire/levels');
  }
};
```

---

## 🧪 Comment Tester (Quand Intégré)

### 1. Test des niveaux
```tsx
// Dans un composant temporaire :
const TestPermissions = () => {
  const { userLevel, canAccess, getRemainingDraws } = useSanctuaryAccess();
  
  return (
    <div>
      <p>Niveau : {userLevel}</p>
      <p>Historique : {canAccess('oracle.viewHistory') ? '✅' : '❌'}</p>
      <p>Tirages restants : {getRemainingDraws()}</p>
    </div>
  );
};
```

### 2. Test du composant AccessGate
```tsx
// Page de test : /sanctuaire/test-access
<div className="space-y-6 p-6">
  {/* Card variant */}
  <AccessGate 
    feature="Test Card"
    requiredLevel={SanctuaryLevel.PROFOND}
  />
  
  {/* Inline variant */}
  <AccessGate 
    feature="Test Inline"
    requiredLevel={SanctuaryLevel.MYSTIQUE}
    variant="inline"
    size="sm"
  />
</div>
```

---

## 📊 Métriques de la Mission

| Métrique | Valeur |
|----------|--------|
| Fichiers créés | 3 |
| Lignes de code | ~906 |
| Types TypeScript | 8 interfaces + 1 enum |
| Fonctions exportées | 11 |
| Variantes UI | 9 (3 variants × 3 sizes) |
| Niveaux définis | 4 |
| Features configurées | 20+ |
| Temps estimé | 45 minutes |

---

## 🎉 Conclusion

**Mission accomplie !** Les fondations du système de permissions sont en place. Le code est :

- ✅ **Modulaire** : Chaque fichier a une responsabilité unique
- ✅ **Typé** : 100% TypeScript avec types stricts
- ✅ **Documenté** : Commentaires JSDoc + exemples d'usage
- ✅ **Réutilisable** : Composants génériques et configurables
- ✅ **Non invasif** : Aucun impact sur l'existant

**Prêt pour l'intégration** lors de la prochaine mission ! 🚀

---

**Commit :** `7688137` - 🔐 feat(sanctuaire): Fondations système de permissions  
**Auteur :** Agent de Développement Expert  
**Date :** 21 Octobre 2025
