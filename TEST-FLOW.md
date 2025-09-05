# 🧪 Test Flow Oracle Lumira

## ✅ Tests Manuel Complets

### 1. Landing Temple (/)
- [ ] Hero s'affiche avec animation mandala
- [ ] Particules réagissent au survol souris
- [ ] Bouton "Commencer mon tirage" scroll vers sections niveaux
- [ ] 4 cartes niveau s'affichent correctement
- [ ] Boutons "Choisir ce niveau" redirigent vers `/commande?level=X`
- [ ] Formulaire dynamique adapte les champs selon niveau sélectionné
- [ ] Footer avec liens fonctionnels

### 2. Page Commande (/commande?level=2)
- [ ] URL param `level` récupéré et affiché
- [ ] Récap prix niveau + upsells calculé dynamiquement
- [ ] Formulaire questions rituelles adapté au niveau
- [ ] Toggle upsells fonctionne et met à jour total
- [ ] Validation required champs avant paiement
- [ ] Bouton "Procéder au paiement" simule processus (2s)
- [ ] Redirection vers `/confirmation?success=true`

### 3. Confirmation (/confirmation?success=true)
- [ ] Animation checkmark
- [ ] Message confirmation personnalisé
- [ ] Timeline étapes 1-2-3 claire
- [ ] Bouton "Entrer dans le Sanctuaire" → `/sanctuaire`
- [ ] Bouton "Retour accueil" → `/`

### 4. Sanctuaire Client (/sanctuaire)
- [ ] Header avec nom utilisateur mock
- [ ] Progress circulaire niveau (25/50/75/100%)
- [ ] Section "Mes Lectures" avec cartes mockées
- [ ] Boutons téléchargement PDF/Audio/Mandala
- [ ] Timeline vibratoire avec 4 étapes
- [ ] Quote inspirante en bas

### 5. Expert Desk (/expert)
- [ ] Interface 3 colonnes responsive
- [ ] File d'attente orders pending (vide au départ)
- [ ] Prompt editor avec templates par niveau
- [ ] Bouton "Envoyer à l'Oracle" → génération 3s
- [ ] Preview texte + audio mockés
- [ ] Bouton "Valider & Livrer" met à jour order

### 6. Navigation & UX
- [ ] Toutes les routes accessibles
- [ ] Boutons retour fonctionnels
- [ ] Animations Framer Motion fluides
- [ ] Responsive mobile/desktop
- [ ] Pas d'erreurs console

## 🔧 Tests API Mock

### MongoDB Mock
```javascript
// Ouvrir DevTools → Console
import { createUser, createOrder, getAllMockData } from './src/api/mongodb.ts';

// Test création user
const user = await createUser({
  email: 'test@example.com',
  firstName: 'Sarah',
  dateNaissance: '1990-05-15'
});

// Test création order
const order = await createOrder({
  userId: user._id,
  level: 2,
  upsells: { audio: true, mandala: false },
  answers: { intention: 'Trouver ma voie' }
});

// Vérifier données
console.log(getAllMockData());
```

### Stripe Mock
- [ ] createPaymentSession() retourne sessionId mock
- [ ] verifyPayment() simule vérification 500ms
- [ ] Logs console détaillés

### Dolibarr Mock  
- [ ] createThirdparty() génère ID unique
- [ ] addTag() et addLevelTag() fonctionnent
- [ ] uploadDocument() retourne URL mock
- [ ] Console logs complets

## 🚀 Tests Build & Deploy

### Build Vite
```bash
npm run build
# ✅ dist/ généré sans erreurs
# ✅ assets optimisés (CSS ~27KB, JS ~345KB)
```

### Docker Build
```bash
docker build -t oracle-lumira:test .
docker run -p 3000:80 oracle-lumira:test
# ✅ Container démarre
# ✅ http://localhost:3000 accessible
```

### Docker Compose
```bash
docker-compose up --build
# ✅ Services : app + mongo + n8n
# ✅ Réseaux internes fonctionnels
```

## 📊 Performance Checks

### Lighthouse Scores Attendus
- Performance : 85+
- Accessibilité : 90+  
- Best Practices : 95+
- SEO : 80+

### Bundle Analysis
```bash
npm run build -- --analyze
# Vérifier tailles chunks
# React/Router : ~100KB
# Framer Motion : ~50KB  
# App code : ~30KB
```

## 🐛 Debug Checklist

### Erreurs Fréquentes
- [ ] Variables d'env VITE_ préfixées
- [ ] React Router basename si sous-répertoire
- [ ] CORS si appels API externes
- [ ] MongoDB URI format correct
- [ ] Stripe keys test vs prod

### Console Warnings
- [ ] Pas de warnings React hydration
- [ ] Pas d'erreurs Tailwind/CSS
- [ ] TypeScript strict mode OK
- [ ] ESLint warnings résolues

## 📝 Validation Finale

Avant mise en production :

1. [ ] Toutes les routes testées manuellement
2. [ ] Workflow complet A→Z validé  
3. [ ] Mock data cohérentes et réalistes
4. [ ] Build production sans warnings
5. [ ] Docker deployment functional
6. [ ] Variables d'env prod configurées
7. [ ] DNS + SSL configurés pour oraclelumira.com
8. [ ] Monitoring & logs en place

## 💡 Next Steps Production

Après validation test :

1. **Vraies intégrations** : Stripe live, MongoDB Atlas, Dolibarr prod
2. **n8n workflows** : GPT prompts + TTS Elevenlabs + PDF generation  
3. **Email service** : SendGrid templates + confirmations
4. **File storage** : AWS S3 ou équivalent
5. **Analytics** : Tracking conversions niveaux 1→2→3→4
6. **Support client** : Chat widget, FAQ, tickets

---
*Test Flow v1.0 - Oracle Lumira MVP* 🔮
