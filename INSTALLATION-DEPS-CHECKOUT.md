# 📦 INSTALLATION DES DÉPENDANCES - CHECKOUT REFONTE 2025

## ⚠️ ÉTAPE OBLIGATOIRE AVANT TESTS

Les nouveaux composants nécessitent 2 packages NPM supplémentaires pour la fonction `cn()` (merge de classes Tailwind).

## 🔧 Installation

```bash
cd apps/main-app
npm install clsx tailwind-merge
```

### Packages installés

| Package | Version | Usage |
|---------|---------|-------|
| **clsx** | ^2.x | Conditional className construction |
| **tailwind-merge** | ^2.x | Merge et dédupliquer classes Tailwind |

### Fonction `cn()` créée

**Fichier**: `apps/main-app/src/lib/utils.ts`

```typescript
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

**Utilisée dans**:
- `FloatingInput.tsx` - Merge des styles conditionnels (error, valid, focus)
- `UnifiedCheckoutForm.tsx` - Classes dynamiques submit button
- Tous les composants checkout

## ✅ Vérification

Après installation, vérifier que le build fonctionne:

```bash
npm run build
```

**Expected output**: Pas d'erreur `Cannot find module 'clsx'`

## 🚀 Prêt à tester

Une fois les dépendances installées:

1. Lancer le dev server: `npm run dev`
2. Naviguer vers: `http://localhost:5173/commande-temple-v2?productId=XXXX`
3. Tester le nouveau checkout

---

**Note**: Si vous voyez encore des erreurs après installation, essayez:

```bash
rm -rf node_modules package-lock.json
npm install
```
