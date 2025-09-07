# 🚀 Déployer Oracle Lumira sur Coolify v4

## 📋 Prérequis

- ✅ Coolify v4 installé et configuré
- ✅ Repository GitHub/GitLab accessible
- ✅ Domaines DNS configurés (A records pointant vers Coolify)
- ✅ Certificats SSL Let's Encrypt activés

## 🔧 Configuration Coolify

### 1. Connexion Repository

```bash
1. Dans Coolify UI : Projects > New Project > "Oracle Lumira"
2. Resources > New Resource > Git Repository
3. Repository: https://github.com/votre-username/oracle-lumira
4. Branch: main
5. Build Pack: Docker Compose
6. Docker Compose Location: ./docker-compose.yml
```

### 2. Variables d'Environnement OBLIGATOIRES

```bash
# Base de Données
MONGODB_URI=mongodb://root:VOTRE_PASSWORD_MONGO@mongo:27017/lumira-mvp?authSource=admin
MONGO_ROOT_PASSWORD=VotrePasswordMongoSecurise2024

# Sécurité
JWT_SECRET=VotreJWTSecretDe32CaracteresOuPlus123456
CORS_ORIGIN=https://oraclelumira.com,https://desk.oraclelumira.com

# Stripe (OBLIGATOIRE pour paiements)
STRIPE_SECRET_KEY=sk_live_VotreCleStripeSecrete
STRIPE_WEBHOOK_SECRET=whsec_VotreWebhookSecret
VITE_STRIPE_PUBLIC_KEY=pk_live_VotreCleStripePublique

# URLs & Domaines
FRONTEND_URL=https://oraclelumira.com
API_BASE_URL=https://oraclelumira.com/api
DESK_HOSTNAME=desk.oraclelumira.com
```

### 3. Variables Optionnelles

```bash
# Email (recommandé)
SENDGRID_API_KEY=SG.VotreCleApiSendGrid
FROM_EMAIL=oracle@oraclelumira.com

# Stockage Fichiers
AWS_S3_BUCKET=oracle-lumira-prod
AWS_ACCESS_KEY_ID=VotreCleAccesAWS
AWS_SECRET_ACCESS_KEY=VotreCleSecreteAWS
AWS_REGION=eu-west-3

# CRM Dolibarr
MYSQL_ROOT_PASSWORD=VotreMySQLRootPassword
MYSQL_PASSWORD=VotreDolibarrPassword
VITE_DOLIBARR_URL=https://crm.oraclelumira.com
VITE_DOLIBARR_API_KEY=VotreCleApiDolibarr

# N8N Automation
N8N_WEBHOOK_URL=https://n8n.oraclelumira.com/webhook/lumira-assistant
N8N_TOKEN=VotreTokenN8N
OPENAI_API_KEY=sk-VotreCleOpenAI

# Performance
LOG_LEVEL=info
RATE_LIMIT_MAX_REQUESTS=100
```

## 🌐 Configuration Domaines

### Services à Exposer

```yaml
# Application Principale
Domain: oraclelumira.com
Service: main-app
Port: 80

# Interface Expert
Domain: desk.oraclelumira.com  
Service: expert-desk
Port: 80

# API (optionnel, généralement via proxy)
Domain: api.oraclelumira.com
Service: api
Port: 3001

# CRM Dolibarr (si activé)
Domain: crm.oraclelumira.com
Service: dolibarr
Port: 80
```

### Configuration SSL & Sécurité

- ✅ **Force HTTPS Redirect**: Activé
- ✅ **Let's Encrypt SSL**: Activé  
- ✅ **HSTS Headers**: Activé
- ✅ **Security Headers**: Configurés dans nginx

## 🔄 Preview Deployments

```bash
# Configuration Coolify
Enable Preview Deployments: ✅
Preview Domain Pattern: pr-{PR_ID}.oraclelumira.com
Environment Variables: Hériter de production (sauf secrets)
```

## 📊 Monitoring & Healthchecks

### Endpoints de Surveillance

```bash
# API Backend
GET https://oraclelumira.com/api/health
Response: {"status":"healthy","uptime":3600,"services":{"database":"connected"}}

# Frontend Main
GET https://oraclelumira.com/health.json  
Response: {"status":"healthy","service":"main-app"}

# Expert Desk
GET https://desk.oraclelumira.com/health.json
Response: {"status":"healthy","service":"expert-desk"}
```

### Alertes Recommandées

- 🚨 **API /health non-2xx** → Alerte critique
- 🚨 **Database disconnected** → Alerte critique  
- ⚠️ **Memory > 80%** → Alerte warning
- ⚠️ **Response time > 5s** → Alerte performance

## 🔧 Build & Déploiement

### Processus de Build

1. **Git Push** → Webhook Coolify
2. **Docker Compose Build**:
   - `api`: Build TypeScript → Node.js production
   - `main-app`: Build React/Vite → Nginx static
   - `expert-desk`: Build React/Vite → Nginx static  
   - `mongo`: Image officielle MongoDB 7.0

### Temps de Build Attendus

- ⏱️ **API Backend**: 2-3 minutes
- ⏱️ **Frontend Apps**: 1-2 minutes chacune
- ⏱️ **Total**: 5-7 minutes

## 🐛 Troubleshooting

### Problèmes Courants

```bash
# 1. Build échoue - Dependencies
docker-compose build --no-cache

# 2. MongoDB connection timeout  
Vérifier: MONGODB_URI et MONGO_ROOT_PASSWORD

# 3. Stripe webhook fails
Vérifier: STRIPE_WEBHOOK_SECRET et endpoint /api/payments/webhook

# 4. CORS errors
Vérifier: CORS_ORIGIN contient tous les domaines

# 5. 502 Bad Gateway
Vérifier: healthchecks passent, ports corrects
```

### Logs Debugging

```bash
# Via Coolify UI
Services > [service] > Logs > Real-time

# Commandes utiles
docker-compose logs api
docker-compose logs main-app  
docker-compose logs mongo
```

## 🔄 Rollback Procedure

### Rollback Rapide (< 2min)

```bash
1. Coolify UI > Deployments
2. Sélectionner commit stable précédent
3. "Redeploy" > Confirmer
4. Vérifier healthchecks ✅
```

### Rollback Avancé

```bash
# Si problème de données
1. Arrêter services
2. Restaurer backup MongoDB
3. Redéployer version stable
4. Vérifier intégrité données
```

## 🚀 Checklist Go-Live

- [ ] Variables d'environnement configurées
- [ ] Domaines DNS configurés + SSL
- [ ] Tests Stripe en mode live
- [ ] Backup MongoDB configuré
- [ ] Monitoring/alertes configurés  
- [ ] Tests de charge validés
- [ ] Rollback testé

---

**📞 Support**
- Documentation technique: README.md
- Checklist pre-prod: PRE-PRODUCTION-CHECKLIST.md
- Issues: GitHub Issues
