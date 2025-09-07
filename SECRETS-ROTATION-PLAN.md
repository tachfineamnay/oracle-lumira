# 🔐 PLAN DE ROTATION DES SECRETS - ORACLE LUMIRA

## 🎯 OBJECTIF
Éliminer tous les secrets du code source et les gérer uniquement via Coolify Secrets UI pour une sécurité maximale.

## 📋 INVENTAIRE DES SECRETS À ROTATIONNER

### Secrets Critiques (Rotation OBLIGATOIRE)
```bash
# 1. JWT_SECRET 
Actuel: À générer
Nouveau: crypto.randomBytes(32).toString('hex')
Impact: Déconnexion utilisateurs (acceptable)

# 2. STRIPE_SECRET_KEY
Actuel: sk_test_... (développement) 
Nouveau: sk_live_... (production depuis Stripe Dashboard)
Impact: Paiements - CRITIQUE

# 3. STRIPE_WEBHOOK_SECRET  
Actuel: whsec_test_...
Nouveau: whsec_live_... (regénérer dans Stripe Dashboard)
Impact: Webhooks - CRITIQUE

# 4. MONGODB_URI avec credentials
Actuel: Credentials développement/test
Nouveau: Production user + password fort
Impact: Database access - CRITIQUE

# 5. MONGO_ROOT_PASSWORD
Actuel: Password par défaut Docker
Nouveau: Password 32+ caractères aléatoires
Impact: Database admin - CRITIQUE
```

### Secrets Optionnels (Rotation si utilisés)
```bash
# 6. SENDGRID_API_KEY
# 7. AWS_ACCESS_KEY_ID + AWS_SECRET_ACCESS_KEY  
# 8. VITE_DOLIBARR_API_KEY
# 9. N8N_TOKEN
# 10. OPENAI_API_KEY
```

## 🔄 PROCÉDURE DE ROTATION

### Phase 1: Génération des Nouveaux Secrets
```bash
# JWT Secret (Node.js)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# MongoDB Password
openssl rand -base64 32

# Stripe - Via Dashboard
1. Login Stripe Dashboard
2. Developers > API Keys > Reveal live keys
3. Developers > Webhooks > Regenerate secret

# AWS - Via Console  
1. IAM > Users > Security credentials > Create access key
2. Minimum permissions (S3 read/write specific bucket)
```

### Phase 2: Configuration Coolify Secrets
```bash
# Dans Coolify UI > Project > Environment Variables
1. Type: "Secret" (pas "Environment Variable")
2. Key: JWT_SECRET, Value: [nouveau secret généré]
3. Key: STRIPE_SECRET_KEY, Value: sk_live_...
4. Key: STRIPE_WEBHOOK_SECRET, Value: whsec_...
5. Key: MONGODB_URI, Value: mongodb://produser:prodpass@...
6. Répéter pour tous les secrets
```

### Phase 3: Validation
```bash
# Tests post-rotation
1. Déploiement staging avec nouveaux secrets
2. Test login JWT (nouveau token généré)
3. Test paiement Stripe end-to-end
4. Test webhook Stripe (voir logs Coolify)
5. Test connexion MongoDB (healthcheck /api/ready)

# Rollback si nécessaire
- Coolify > Environment Variables > Restore previous values
- Redeploy automatique
```

## 📊 MATRICE DE CRITICITÉ

| Secret | Criticité | Impact si compromis | Rotation fréquence |
|---------|-----------|---------------------|-------------------|
| JWT_SECRET | HIGH | Sessions utilisateurs | 90 jours |
| STRIPE_SECRET_KEY | CRITICAL | Accès paiements | 60 jours |
| STRIPE_WEBHOOK_SECRET | CRITICAL | Webhooks falsifiés | 60 jours |
| MONGODB_URI | CRITICAL | Accès base données | 90 jours |
| AWS_SECRET_ACCESS_KEY | MEDIUM | Accès fichiers | 180 jours |
| SENDGRID_API_KEY | LOW | Envoi emails | 365 jours |

## ✅ CHECKLIST POST-ROTATION

- [ ] Aucun secret en clair dans le code source
- [ ] `.env.example` contient uniquement des placeholders
- [ ] Tous les secrets configurés dans Coolify UI
- [ ] Tests de régression passés (paiement, login, DB)
- [ ] Documentation mise à jour
- [ ] Équipe notifiée des nouveaux accès
- [ ] Anciens secrets révoqués côté providers

## 🚨 URGENCE - SECRETS COMPROMIS

```bash
# Procédure d'urgence (< 30min)
1. Révoquer immédiatement côté provider (Stripe, AWS...)
2. Générer nouveaux secrets 
3. Mettre à jour Coolify secrets
4. Redeploy automatique
5. Vérifier logs pour usage malveillant
6. Post-mortem et amélioration process
```

---
**🔒 SÉCURITÉ**: Tous les secrets DOIVENT être gérés via Coolify Secrets UI uniquement.
