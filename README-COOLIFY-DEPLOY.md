# 🚀 Oracle Lumira - Déploiement Coolify Production

## 🎯 **Configuration Coolify Complète**

### **Variables d'Environnement - Build Time (Build Args)**

```bash
# ⚡ FRONTEND BUILD VARIABLES
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_51...votre_clé_publique_stripe
VITE_API_BASE_URL=/api  # Optionnel - utilise des chemins relatifs par défaut
```

### **Variables d'Environnement - Runtime**

```bash
# 🔐 BACKEND RUNTIME VARIABLES
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb://...votre_uri_mongodb
STRIPE_SECRET_KEY=sk_live_51...votre_clé_secrète_stripe
STRIPE_WEBHOOK_SECRET=whsec_...votre_secret_webhook_stripe

# 📧 OPTIONNEL - Email & autres services
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

---

## 🏗️ **Configuration Coolify**

### **1. Projet**
- **Repository:** `tachfineamnay/oracle-lumira`
- **Branch:** `main`
- **Build Pack:** `Dockerfile`
- **Port:** `8080` (nginx frontend + proxy API)

### **2. Build Command**
```bash
docker build \
  --build-arg VITE_STRIPE_PUBLISHABLE_KEY=$VITE_STRIPE_PUBLISHABLE_KEY \
  --build-arg VITE_API_BASE_URL=$VITE_API_BASE_URL \
  -t oracle-lumira .
```

### **3. Healthcheck**
- **URL:** `/health.json`
- **Interval:** `30s`
- **Timeout:** `10s`
- **Retries:** `3`

---

## ✅ **Checklist de Déploiement**

### **Avant Déploiement:**

- [ ] ✅ Variables Build configurées dans Coolify (VITE_STRIPE_PUBLISHABLE_KEY)
- [ ] ✅ Variables Runtime configurées (STRIPE_SECRET_KEY, MONGODB_URI, etc.)
- [ ] ✅ Domaine pointé vers Coolify (https://oraclelumira.com)
- [ ] ✅ SSL/TLS activé sur Coolify
- [ ] ✅ MongoDB accessible depuis Coolify

### **Après Déploiement:**

- [ ] ✅ Test healthcheck: `curl https://oraclelumira.com/health.json`
- [ ] ✅ Test API: `curl https://oraclelumira.com/api/healthz`
- [ ] ✅ Test pages: https://oraclelumira.com/commande?product=mystique
- [ ] ✅ **CRITICAL:** Configurer webhook Stripe Dashboard

---

## 🔗 **Configuration Webhook Stripe**

### **URL Webhook à configurer:**
```
https://oraclelumira.com/api/payments/webhook
```

### **Events à écouter:**
- `payment_intent.succeeded`
- `payment_intent.payment_failed` 
- `payment_intent.canceled`

### **Test Webhook:**
Depuis Stripe Dashboard → Webhooks → Send test event

---

## 🧪 **Tests de Validation**

### **1. Test Frontend**
```bash
curl -I https://oraclelumira.com
# Expected: 200 OK + HTML content
```

### **2. Test API**
```bash
curl https://oraclelumira.com/api/healthz
# Expected: {"status":"healthy","timestamp":"..."}
```

### **3. Test Paiement Complet**
1. Aller sur: `https://oraclelumira.com/commande?product=mystique`
2. Remplir formulaire de paiement
3. Utiliser carte test: `4242 4242 4242 4242`
4. Vérifier redirection vers page confirmation
5. Vérifier logs webhook dans Stripe Dashboard

### **4. Test CORS**
```bash
curl -X OPTIONS -H "Origin: https://oraclelumira.com" \
  https://oraclelumira.com/api/products/create-payment-intent
# Expected: 204 No Content
```

---

## 🐛 **Dépannage**

### **Frontend ne charge pas:**
- Vérifier `VITE_STRIPE_PUBLISHABLE_KEY` dans Build Args
- Vérifier logs nginx: `/nginx-health`

### **API inaccessible:**
- Vérifier variables runtime dans Coolify
- Vérifier logs PM2: `docker exec -it container pm2 logs`

### **Erreurs Stripe:**
- Vérifier clés Stripe (test vs live)
- Vérifier webhook secret dans variables runtime
- Vérifier signature webhook dans logs API

### **Base de données:**
- Tester connexion: `docker exec -it container node -e "require('mongoose').connect('$MONGODB_URI').then(() => console.log('OK'))"`

---

## 📊 **Monitoring**

### **URLs de Santé:**
- **Nginx:** https://oraclelumira.com/nginx-health
- **Frontend:** https://oraclelumira.com/health.json  
- **API Backend:** https://oraclelumira.com/api/healthz

### **Logs:**
```bash
# Container logs
docker logs -f <container_id>

# PM2 logs  
docker exec -it <container_id> pm2 logs

# Nginx logs
docker exec -it <container_id> cat /dev/stdout
```

---

## 🎯 **Critère de Succès**

> **✅ Déploiement réussi quand:**
> 1. Page `/commande?product=mystique` charge sans erreur console
> 2. Paiement avec `4242 4242 4242 4242` fonctionne 
> 3. Webhook reçu et traité (visible dans Stripe Dashboard)
> 4. Redirection vers `/confirmation` après paiement

---

## 🚨 **Support**

En cas de problème:
1. Vérifier logs Coolify
2. Tester endpoints de santé
3. Vérifier configuration Stripe Dashboard
4. Valider variables d'environnement

**Architecture:** `nginx:8080 → proxy:/api → node:3000 → MongoDB + Stripe API`
