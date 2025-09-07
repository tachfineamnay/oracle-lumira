# ✅ PRE-PRODUCTION CHECKLIST - ORACLE LUMIRA

## 🔐 SÉCURITÉ

- [ ] **Variables d'environnement**: Aucune clé en dur dans le code
- [ ] **JWT Secret**: 32+ caractères, généré aléatoirement
- [ ] **MongoDB**: Accessible uniquement via réseau interne Docker
- [ ] **CORS**: Origins spécifiques configurés (pas de wildcard *)
- [ ] **Stripe**: Webhook avec vérification signature activée
- [ ] **Debug Routes**: `ENABLE_DEBUG_ROUTES=false` en production
- [ ] **HTTPS**: Redirection forcée + HSTS headers
- [ ] **Rate Limiting**: Activé sur API endpoints critiques
- [ ] **Helmet**: CSP et security headers configurés

## 🗄️ BASE DE DONNÉES

- [ ] **Connection**: MongoDB accessible via `MONGODB_URI`
- [ ] **Indexes**: Créés sur collections principales (users, orders)
- [ ] **Backup**: Stratégie de sauvegarde automatique configurée
- [ ] **Migration**: Scripts de migration testés si nécessaire
- [ ] **Connection Pooling**: Configuré pour la charge
- [ ] **Monitoring**: Queries lentes identifiées et optimisées

## 🏗️ INFRASTRUCTURE

- [ ] **Docker Images**: < 500MB chacune, optimisées
- [ ] **Healthchecks**: Tous services répondent `/health`
- [ ] **Networks**: Services communicant via réseau interne seulement
- [ ] **Volumes**: Données persistantes montées correctement
- [ ] **Resources**: Limites CPU/RAM définies si nécessaire
- [ ] **Logs**: Centralisés et accessibles via Coolify

## 🌐 DOMAINES & SSL

- [ ] **DNS**: A records configurés pour tous domaines
- [ ] **SSL**: Certificats Let's Encrypt activés et renouvelables
- [ ] **HTTPS Redirect**: Forcé sur tous domaines  
- [ ] **HSTS**: Headers configurés (max-age=31536000)
- [ ] **Subdomain**: desk.oraclelumira.com accessible
- [ ] **API Endpoint**: /api accessible via proxy ou subdomain

## 💳 INTÉGRATION STRIPE

- [ ] **Live Keys**: `sk_live_` et `pk_live_` configurées
- [ ] **Webhook**: Endpoint /api/payments/webhook configuré dans Stripe
- [ ] **Signature**: Vérification `constructEvent()` implémentée  
- [ ] **Idempotence**: Events Stripe traités une seule fois
- [ ] **Error Handling**: Réponses 200 rapides (< 10s)
- [ ] **Test Payment**: Transaction complète testée end-to-end

## 📊 MONITORING & PERFORMANCE

- [ ] **Healthchecks**: Répondent en < 5s avec infos détaillées
- [ ] **Memory Usage**: < 80% en conditions normales
- [ ] **Response Times**: API < 2s, Frontend < 1s
- [ ] **Error Rates**: < 1% sur endpoints critiques
- [ ] **Uptime**: SLA 99.9% visé
- [ ] **Alertes**: Configurées pour métriques critiques

## 🧪 TESTS

- [ ] **Unit Tests**: Tests webhook Stripe passants
- [ ] **Integration**: Tests endpoints critiques (/health, /payments)
- [ ] **Load Testing**: 100+ utilisateurs simultanés supportés
- [ ] **Security**: Scan vulnérabilités passé
- [ ] **Browser Testing**: IE11+, Chrome, Firefox, Safari
- [ ] **Mobile**: Responsive sur iOS/Android

## 🚀 DÉPLOIEMENT

- [ ] **Build Time**: < 10 minutes total
- [ ] **Zero Downtime**: Rolling update configuré
- [ ] **Rollback**: Procédure testée et documentée
- [ ] **Environment**: Variables production vs staging séparées
- [ ] **Secrets**: Gestion sécurisée via Coolify vault
- [ ] **CI/CD**: Pipeline automatisé et testé

## 📧 NOTIFICATIONS & COMMUNICATION

- [ ] **Email**: SendGrid configuré et testé
- [ ] **Error Tracking**: Logs d'erreur centralisés  
- [ ] **User Support**: Système de tickets ou email configuré
- [ ] **Status Page**: Page statut public si nécessaire
- [ ] **Team Alerts**: Slack/Discord/Teams configuré
- [ ] **Escalation**: Procédure incident critique documentée

## 💾 SAUVEGARDE & RÉCUPÉRATION

- [ ] **Database Backup**: Quotidien automatique
- [ ] **Code Backup**: Repository Git sauvegardé
- [ ] **Config Backup**: Variables d'environnement sauvegardées  
- [ ] **Recovery Test**: Restauration testée au moins 1 fois
- [ ] **RTO**: Recovery Time Objective < 4h
- [ ] **RPO**: Recovery Point Objective < 1h

## 📋 DOCUMENTATION

- [ ] **README**: Instructions setup développeur
- [ ] **API Docs**: Endpoints documentés
- [ ] **Deployment Guide**: Procédures Coolify complètes
- [ ] **Troubleshooting**: Guide erreurs communes
- [ ] **Architecture**: Diagrammes et schémas à jour
- [ ] **Runbook**: Procédures opérationnelles courantes

---

## 🚨 VALIDATION FINALE

### Checklist Critique (STOP si non validé)

- [ ] ✅ **Payment Flow**: Paiement Stripe end-to-end validé
- [ ] ✅ **Security Scan**: Aucune vulnérabilité critique  
- [ ] ✅ **Database**: Backup/restore testé
- [ ] ✅ **Performance**: Load test passé (100+ users)
- [ ] ✅ **Rollback**: Procédure testée et < 5min

### Sign-off

- [ ] **Développeur**: ___________________ Date: ___________
- [ ] **DevOps**: ______________________ Date: ___________  
- [ ] **Product Owner**: _______________ Date: ___________

---

**🎯 READY FOR PRODUCTION** ✅

*Toutes les cases cochées = GO LIVE autorisé*
