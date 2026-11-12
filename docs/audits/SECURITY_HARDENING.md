# Audit de Sécurité — Vérification & Plan de Durcissement

**Projet** : Oracle Lumira (dépôt `tachfineamnay/oracle-lumira`)
**Date** : 2026-11-11
**Périmètre** : API backend (`apps/api-backend`), frontends (`apps/main-app`, `apps/expert-desk`), Docker/CI
**Statut** : audit de vérification uniquement — **aucune correction de code applicatif, aucun déploiement, aucune opération sur une base de production**.

---

## 0. Résumé exécutif

L'audit de sécurité antérieur présent dans le dépôt (`docs/architecture/SECURITY-AUDIT-PHASE1-REPORT.md`) conclut à un score **9/10 « production ready, 0 vulnérabilité critique »**. Cette vérification **infirme cette conclusion**.

| Constat | Nombre |
|---|---|
| Défauts **P0** confirmés (exploitables sans authentification) | 12 |
| Défauts **P0 DevOps** (build/déploiement cassé) | 2 |
| Défauts **P1** confirmés | 11 |
| Défauts **P2** confirmés | 8 |
| Affirmations d'audit **non confirmées / faux positifs** | 6 |

Les 3 familles les plus graves :

1. **Falsification de paiement et de commande** — **13 points d'entrée** créent ou modifient des commandes, versent des fichiers dans le bucket privé ou inscrivent un expert **sans aucun jeton** : 5 dans `routes/orders.ts` (`client-submit`, `PATCH /:id/status`, `/:id/expert-review`, `/:id/content`, `/:id/delivered`), 2 dans `routes/payments.ts`, 2 dans `routes/products.ts`, 2 dans `routes/uploads.ts`, 1 dans `routes/expert.ts` (`/register`), 1 dans `routes/expert.ts` (`/n8n-callback`, signature ne couvrant pas le corps).
2. **Prise de contrôle de compte Sanctuaire** — un JWT `sanctuaire_access` valide 24 h est délivré sur simple fourniture d'une adresse e-mail, sans preuve de possession.
3. **Secrets réels en clair dans le dépôt** — une URI MongoDB de production avec mot de passe et un secret HMAC n8n sont versionnés ; deux d'entre eux sont même affichés dans les logs du conteneur au démarrage.

> ⚠️ **Aucune valeur de secret n'est reproduite dans ce rapport.** Les emplacements sont cités sous la forme `fichier:ligne` avec la valeur masquée. La rotation est un prérequis indépendant de toute correction de code (voir §7, lot 0).

---

## 1. État Git au démarrage de l'audit

### 1.1 SHA de départ

```
SHA de départ (HEAD = origin/main) :  49f3f444544a0c3478d6c426c1a96a98a3a37600
Sujet                              :  feat: ajout prompts JSON pour creatives video IA (Sora/Veo/Qwen)
Date                               :  2025-12-22 16:13:09 +0100
```

### 1.2 Inventaire Git

| Élément | Valeur |
|---|---|
| Dépôt local | `/home/user/oracle-lumira` |
| Branche de session | `arena/50fee145-oracle-lumira` (créée depuis `main`) |
| `main` local | `49f3f44` — **identique à `origin/main`, jamais modifiée** |
| `origin/main` | `49f3f44` |
| Remotes | `origin → https://github.com/tachfineamnay/oracle-lumira.git` |
| Worktrees | 1 seul (`/home/user/oracle-lumira`) |
| Modifications locales non commitées | **aucune** au démarrage (`git status` vide) |
| Branches distantes | `main`, `copilot/vscode…`, `qoder/feature/…` (2) |
| Tags | aucun |

`git fetch origin --prune` exécuté avec succès : `origin/main` est bien à jour (`49f3f44`), rien de nouveau en amont.

### 1.3 Écarts par rapport à la mission

Trois écarts factuels ont été constatés et **n'ont pas été contournés** :

| Élément demandé | Réalité vérifiée | Action |
|---|---|---|
| Dépôt **`tachfineamnay/LumiraV2`** | Inaccessible avec le jeton courant : `HTTP 403 Resource not accessible by integration` (aussi bien `gh repo view` que `gh api`). Le dépôt `LumiraV2` n'apparaît pas dans `gh repo list`. | Audit réalisé sur le dépôt réellement monté, **`oracle-lumira`**, qui est le code applicatif décrit par la mission (Sanctuaire, Stripe, Expert Desk, n8n). |
| Branche cible **`codex/lumirav2-security-hardening`** | Inexistante en local **et** sur `origin` (`git ls-remote --heads origin 'codex/*'` → vide). | Aucune branche créée/poussée en dehors de la branche de session : la règle de session interdit de créer ou pousser une autre branche. Le travail est isolé sur `arena/50fee145-oracle-lumira`, `main` reste intacte. |
| **Worktree propre** depuis `origin/main` | Le dépôt local est déjà un clone propre à `49f3f44`, sans modification locale ni worktree secondaire. Un `git worktree add` créerait un second répertoire hors du périmètre suivi par la session. | Worktree réutilisé tel quel (aucun travail à écraser). Les corrections devront être appliquées sur une branche dédiée créée par le mainteneur, cf. §7. |

**Conséquence à valider avec le mainteneur** : si le dépôt de référence est bien `LumiraV2` et non `oracle-lumira`, les SHA et chemins de ce rapport doivent être rejoués sur ce dépôt (les chemins `apps/api-backend/src/**` sont identiques dans les deux cas d'après les documents d'architecture du dépôt).

---

## 2. Méthodologie et preuves

### 2.1 Ce qui a été exécuté

| Vérification | Commande | Résultat |
|---|---|---|
| Installation des dépendances API | `npm install` dans `apps/api-backend` | OK (555 paquets) |
| Compilation TypeScript | `npx tsc -p tsconfig.json --noEmit` | **0 erreur** (l'affirmation « 0 erreur TS » est confirmée) |
| Suite de tests existante | `npx jest` | **1 échec pré-existant** (`products.route.test.ts`), 45 passés, 2 ignorés |
| Tests de reproduction ciblés | 14 tests temporaires (Jest+supertest) + 9 vérifications statiques, non commités et supprimés après usage | 14/14 + 9/9 démontrent le comportement vulnérable |
| Compilation de l'image API | non exécutable (Docker absent du sandbox) | contournée par reproduction du `npm ci` sur copie propre du répertoire versionné |
| MongoDB réel | non disponible (`mongodb-memory-server` ne peut pas télécharger son binaire : réseau sortant restreint) | remplacé par des doubles Mongoose fidèles (`getFilter()`, `validateSync()` réels) |

### 2.2 Preuves obtenues (extraits de sortie, données fictives)

**Tests de reproduction (Jest + supertest, exécutés puis supprimés) — `REPRO-x`**

```
REPRO-A   fusion metadata dans services/stripe.ts  → level client 'integrale' pour productId 'mystique' (47 €)
REPRO-B   GET  /api/orders/pi_leak   sans jeton     → 200, formData.phone renvoyé
REPRO-C   PATCH/api/orders/:id/status sans jeton    → 200, commande marquée 'completed'
REPRO-D   POST /api/expert/register  sans jeton     → 201 + JWT expert
REPRO-E   GET  /api/users/orders/:id/content (jeton d'un autre client) → 200, contenu d'autrui
REPRO-F   POST /api/users/auth/sanctuaire-v2 {email} → 200 + JWT sanctuaire_access 24 h
REPRO-G   POST /api/products/create-payment-intent {initie} → 200, commande 'paid' à 0 €
REPRO-H   POST /api/uploads/presign  sans jeton     → 200, URL PUT signée
REPRO-I   POST /api/payments/create-payment-intent {amount: 0.01} → 200, 1 centime chez Stripe
REPRO-J   POST /api/expert/n8n-callback, corps forgé, signature orderId:orderNumber → 200, contenu forgé écrit
REPRO-K   PATCH/api/products/orders/:id/customer sans jeton → 200, e-mail du payeur réécrit
REPRO-L   GET  /api/products/orders/:id sans jeton  → 200, customerEmail + customerPhone
REPRO-M   GET  /api/users/files/presign (jeton expert) → 200, photo privée d'un autre client
REPRO-N   POST /api/orders/by-payment-intent/:id/client-submit sans jeton → 200, e-mail réécrit
```

**Vérifications statiques / hors ligne — `CHECK-x`**

```
CHECK-1   Order.findOne({_id, userId: undefined, status}) → getFilter() = {"_id":…,"status":…}
          (userId supprimé par Mongoose → isolation locataire perdue)
CHECK-2   Order.validateSync() sur le payload de payments.ts
          → formData.email, formData.lastName, formData.firstName, level, userEmail, userId, orderNumber
CHECK-3   req.user construit par authenticateToken → {"id":…,"email":…} ; req.user.userId → undefined
CHECK-4   jeton expert accepté par authenticateToken → {"email":"expert@x.com"} (aucun rejet de type)
CHECK-5   keyGenerator : en-tête x-forwarded-for '1.2.3.4, …' → clé '1.2.3.4' (renouvelable ⇒ limite contournable)
CHECK-6   prix catalogue mystique/profond/integrale = 4700/6700/9700 vs routes/stripe.ts = 1400/2900/4900
CHECK-7   npm ci sur copie propre de apps/api-backend → EUSAGE (aucun lockfile versionné)
CHECK-8   .coolify/entrypoint.sh → "STRIPE_SECRET_KEY: SETDUMMY_VALUE_FOR_TEST" (valeur imprimée)
CHECK-9   npm audit --omit=dev (api-backend) → 1 vulnérabilité modérée (uuid < 11.1.1)
```

---

## 3. Défauts P0 — confirmés

> Critère P0 : exploitable **sans authentification** (ou avec un privilège trivialement obtenable), impact financier, fuite de données personnelles, ou compromission de compte.

### P0-1 — Routes de commandes entièrement non authentifiées (fuite PII + falsification de paiement)

**Fichier** : `apps/api-backend/src/routes/orders.ts`
**Lignes** : `859` (`GET /`), `916` (`GET /:id`), `1022` (`GET /number/:orderNumber`), `1039` (`PATCH /:id/status`), `1066` (`PATCH /:id/expert-review`), `1099` (`PATCH /:id/content`), `1124` (`PATCH /:id/delivered`), `1151` (`GET /stats/overview`)

Aucune de ces routes ne monte `authenticateToken`, `authenticateSanctuaire` ou `authenticateExpert`. Elles renvoient `res.json(order)` — le document Mongoose complet, donc `formData` (nom, e-mail, téléphone, date de naissance, question intime), `files[].key` (clés S3 privées) et `generatedContent`.

`PATCH /:id/status` accepte n'importe quel statut de la liste blanche, `PATCH /:id/delivered` force `status: 'completed'` : **une commande impayée peut être marquée payée/livrée**, et `GET` révèle le contenu d'autrui.

**Preuves** : REPRO-B (200 + `formData.phone` sans jeton), REPRO-C (PATCH anonyme → 200).
**Impact** : fuite de données personnelles (RGPD), contournement du paiement, accès anticipé au Sanctuaire.
**Correction** : monter `authenticateExpert` sur les 6 routes de mutation et sur les listes/stats ; monter `authenticateSanctuaire` + filtre `userId` sur `GET /:id` et `GET /:id/content` ; projeter explicitement les champs publics (`orderNumber`, `status`, `level`, `amount`) pour la réponse post-paiement.

### P0-2 — Jeton Sanctuaire délivré sur simple déclaration d'e-mail

**Fichier** : `apps/api-backend/src/routes/users.ts`
**Lignes** : `89` (`POST /auth/sanctuaire`), `151` (`POST /auth/sanctuaire-v2`), signature du jeton `128` et `346` (`expiresIn: '24h'`)

Les deux routes prennent `{ email }` dans le corps et renvoient un JWT `type: 'sanctuaire_access'` dès qu'une commande `paid/processing/completed` existe pour cet e-mail. Aucun mot de passe, aucun lien signé, aucun code à usage unique, aucune vérification Stripe.

**Preuve** : REPRO-F — jeton valide 24 h pour `victim@example.com` sans aucun secret.
**Impact** : accès complet au Sanctuaire d'un client (lecture des lectures, PDF, photos de visage/paume), et combiné à P0-3, accès aux contenus d'autres clients.
**Correction** : lien magique à durée courte (JWT `purpose: sanctuaire_login`, TTL ≤ 15 min) envoyé par e-mail, ou session liée au `paymentIntentId` + `receipt_email` vérifiés côté Stripe ; à défaut immédiat, exiger le `paymentIntentId` du client en plus de l'e-mail et le vérifier auprès de Stripe. Réduire le TTL d'accès et prévoir une liste de révocation (`tokenVersion` sur `User`).

### P0-3 — `authenticateToken` ne distingue pas les types de jetons ⇒ franchissement de locataire

**Fichiers** : `apps/api-backend/src/middleware/auth.ts` (`33`–`38`), `apps/api-backend/src/routes/users.ts:1044`–`1056`
**Lignes clés** : `auth.ts:35` `id: decoded.id || decoded.userId`, `auth.ts:37` `role: decoded.role`

Deux défauts cumulés :

1. `authenticateToken` accepte **tout** JWT signé avec `JWT_SECRET` : un jeton **expert** (`{ expertId }`) est accepté comme utilisateur (CHECK-4), et `role` est repris du jeton sans contrôle serveur.
2. Il expose `req.user.id`, alors que `users.ts:1047` lit `req.user.userId` → `undefined`. Mongoose **supprime les clés `undefined`** du filtre (CHECK-1) : la requête `Order.findOne({ _id, userId: undefined, status })` devient `Order.findOne({ _id, status })` → **n'importe quel utilisateur authentifié lit le contenu de n'importe quelle commande**.

**Preuves** : CHECK-1, CHECK-3, CHECK-4, REPRO-E.
**Impact** : IDOR de masse sur `GET /api/users/orders/:id/content` (lecture intégrale, téléphone, questions intimes).
**Correction** : un middleware par type de sujet (`requireSanctuaire`, `requireExpert`) qui exige `decoded.type`/`decoded.expertId` et rejette le reste ; normaliser `req.user = { userId, role }` ; **valider la cohérence du filtre** (`if (!userId) return 401`) avant toute requête Mongoose. Ajouter `iss`/`aud` distincts par type de jeton.

### P0-4 — Création de PaymentIntent avec un montant fourni par le client, sans authentification

**Fichier** : `apps/api-backend/src/routes/payments.ts`
**Lignes** : `13` (route), `15` (`amount` lu du corps), `38` (`amount: Math.round(amount * 100)`), `27`–`32` (`new Order({ expertId, amount, status })`)

`amount` vient du corps de la requête, sans consultation du catalogue ni authentification. La commande est instanciée **sans** `level`, `userEmail`, `formData`, `orderNumber` — qui sont `required` : `validateSync()` renvoie 7 erreurs (CHECK-2), donc `order.save()` échoue ou crée un document incomplet, ce qui casse ensuite le rapprochement webhook.

**Preuves** : REPRO-I (1 centime transmis, HTTP 200), CHECK-2 (7 champs requis manquants).
**Impact** : paiement sous-évalué pour une prestation, commande non rattachable, réconciliation impossible.
**Correction** : résoudre le prix **exclusivement** depuis `PRODUCT_CATALOG` (`getProductById`) ; supprimer `amount` du contrat d'entrée ; exiger `authenticateSanctuaire` ; construire la commande via une fabrique unique (cf. P1-3).

### P0-5 — Réécriture anonyme de l'identité du payeur (produits)

**Fichier** : `apps/api-backend/src/routes/products.ts`
**Ligne** : `648` (`PATCH /orders/:orderId/customer`), effet `713`

N'importe qui, connaissant un `paymentIntentId` (visible dans l'URL de confirmation, dans les logs applicatifs et dans `GET /api/orders/:id`), peut remplacer `customerEmail`/`metadata.customerEmail` d'une commande. Le Sanctuaire s'authentifiant **par e-mail** (P0-2), cela **transfère l'accès** de la victime à l'attaquant.

**Preuve** : REPRO-K (`victim@example.com` → `attacker@evil-mail.com`, HTTP 200).
**Correction** : authentifier la route (jeton Sanctuaire du propriétaire ou clé liée au PaymentIntent), vérifier `orderDoc.customerEmail === token.email` avant écriture, et n'autoriser la mise à jour qu'aux statuts `pending`/`failed`.

### P0-6 — `client-submit` non authentifié : réécriture d'identité, upload, création de commandes « paid »

**Fichier** : `apps/api-backend/src/routes/orders.ts`
**Lignes** : `185` (route), `198` (log de tous les en-têtes), `327` et `375` (création de commandes `status: 'paid'` sous `ALLOW_DIRECT_CLIENT_SUBMIT`), `600`–`700` (cascade d'enrichissement qui réécrit `formData.email`)

La route accepte un `paymentIntentId` arbitraire, écrit `order.formData` avec la priorité « données client » (`orders.ts:~580`), et si `ALLOW_DIRECT_CLIENT_SUBMIT=true` crée une commande **payée à 0 €** sans aucune vérification Stripe.

**Preuve** : REPRO-N (e-mail de la commande réécrit, HTTP 200).
**Impact** : détournement d'une commande en cours (le vrai client perd son accès, l'attaquant récupère le contenu généré pour son propre e-mail), création de commandes gratuites.
**Correction** : exiger un jeton lié à la commande (JWT court signé au retour de Stripe, ou vérification live de `paymentIntent.status === 'succeeded'` **avant** toute écriture) ; figer `formData.email` sur `paymentIntent.receipt_email` une fois le paiement confirmé ; supprimer le mode `ALLOW_DIRECT_CLIENT_SUBMIT` du code de production.

### P0-7 — Métadonnées client écrasant le niveau tarifaire

**Fichier** : `apps/api-backend/src/services/stripe.ts`
**Lignes** : `56` (`level: product.level`) puis `60` (`...metadata`) ; relais `apps/api-backend/src/routes/products.ts:411`, consommation `products.ts:946`

L'ordre de fusion place `...metadata` (contrôlé par le client via `req.body.metadata`) **après** les champs serveur. Un acheteur du niveau `mystique` (47 €) qui envoie `metadata: { level: 'integrale' }` obtient une commande de niveau 4 (97 €) — donc le contenu et les capacités du niveau le plus élevé (entitlements `content.full`, `mentorat.access`…).

**Preuve** : REPRO-A (ordre de spread reproduit depuis le code réel, `metadata.level === 'integrale'`).
**Correction** : inverser la fusion (`{ ...metadata, level: product.level, productId: product.id }`) et **whitelister** les clés de `metadata` acceptées du client (`scenario`, `utm_*`).

### P0-8 — Bucket privé : presign PUT/GET sans authentification

**Fichier** : `apps/api-backend/src/routes/uploads.ts`
**Lignes** : `8` (`POST /presign`), `56` (`GET /presign-get`)

Aucune des deux routes ne vérifie de jeton. `presign-get` renvoie une URL signée valide 900 s pour **n'importe quelle clé** du bucket, y compris `uploads/**` (photos de visage et de paume des clients).

**Preuve** : REPRO-H (URL PUT signée anonyme).
**Impact** : injection de fichiers arbitraires dans le bucket privé, exfiltration de photos intimes si une clé fuite (cf. P0-1 qui expose `files[].key`).
**Correction** : exiger un jeton (Sanctuaire propriétaire / expert), restreindre `presign-get` aux clés appartenant aux commandes de l'appelant (logique déjà présente dans `users.ts:996`), imposer `type` + préfixe de clé + `contentLength` max côté serveur.

### P0-9 — Inscription expert publique

**Fichier** : `apps/api-backend/src/routes/expert.ts`
**Ligne** : `155` (`POST /register`)

Route publique, sans jeton, sans invitation, sans approbation : n'importe qui crée un compte `role: 'expert'`, `isActive: true`, et reçoit immédiatement un JWT 24 h. Ce jeton donne accès à la file de validation, à **toutes** les commandes et à **tous** les clients (`/clients`, `/orders/pending`, `/files/presign`, `DELETE /orders/:id`), donc aux photos et aux lectures intimes.

**Preuve** : REPRO-D (HTTP 201 + JWT).
**Correction** : supprimer la route ou la protéger par `authenticateExpert` + `requireRole(['admin'])` + code d'invitation à usage unique ; auditer les comptes `Expert` existants (`createdAt`, `lastLogin`) pour détecter toute création frauduleuse.

### P0-10 — Signature n8n ne couvrant pas le corps de la requête

**Fichier** : `apps/api-backend/src/routes/expert.ts`
**Lignes** : `560` (route), `612`–`632` (canonicalisation), `653` (validation), `571` (`requireReplayHeaders` optionnel, défaut `false`)

Par défaut, `N8N_CALLBACK_REQUIRE_REPLAY_PROTECTION` est absent : la branche « legacy » signe seulement `orderId:orderNumber`. Le corps (`generatedContent`, `pdfUrl`) n'est donc **couvert par aucune signature** : quiconque obtient un `orderId`/`orderNumber` (exposés par P0-1) peut injecter un contenu arbitraire, y compris un `pdfUrl` externe, dans la commande du client.

**Preuve** : REPRO-J (corps forgé accepté, HTTP 200, contenu écrit).
**Correction** : rendre les en-têtes `X-Timestamp` + `X-Nonce` **obligatoires** (supprimer les branches legacy), signer **exclusivement** le corps brut `timestamp.nonce.body`, conserver `timingSafeEqual`, et remplacer le cache de nonce en mémoire (par processus) par une collection Mongo TTL.

### P0-11 — Secrets réels versionnés + domaine de confiance compromis

| Emplacement | Nature | Action |
|---|---|---|
| `apps/api-backend/diagnose-prod.cjs:9` | URI MongoDB de production **avec identifiants** (`lumira_root:••••` — valeur non reproduite ici) | **Rotation immédiate** (mot de passe Mongo), suppression du fichier, réécriture d'historique si le dépôt est public |
| `apps/api-backend/verify_sig.js:3` | Secret HMAC n8n en clair (64 caractères hex) | **Rotation immédiate** de `N8N_CALLBACK_SECRET`, suppression du fichier |
| `apps/api-backend/create-expert.cjs`, `create-expert.cjs`, `quick-server.js:122`, `expert.ts:99/109/270/396` | Mot de passe expert par défaut `Lumira2025L` codé en dur | Suppression, mot de passe initial aléatoire + changement forcé |
| `apps/api-backend/.env.example:62` | `DEFAULT_EXPERT_PASSWORD="Lumira2025L"` | Remplacer par un placeholder |
| `.env.example:9` | Préfixe de clé Stripe de test réelle (`pk_test_51Ms0j7…`) | Remplacer par `pk_test_your_key` |

Le `.gitignore` protège bien `.env*` (hors `.env.example`), et aucun `sk_live`/`whsec_` n'a été trouvé dans les fichiers suivis : la fuite porte sur l'URI Mongo, le secret n8n et les mots de passe par défaut — **suffisant pour compromettre l'ensemble**.
**Correction** : rotation (§7 lot 0), `gitleaks` en pre-commit et CI, suppression des scripts de diagnostic du dépôt (ou déplacement hors du contexte Docker).

### P0-12 — Secrets affichés dans les logs du conteneur

**Fichier** : `.coolify/entrypoint.sh`
**Lignes** : `40`–`41`

```sh
echo "   - STRIPE_SECRET_KEY: ${STRIPE_SECRET_KEY:+SET}${STRIPE_SECRET_KEY:-MISSING}"
echo "   - MONGODB_URI: ${MONGODB_URI:+SET}${MONGODB_URI:-MISSING}"
```

La substitution est malformée : elle concatène `SET` **et la valeur** quand la variable existe. Preuve : CHECK-8 (`SETDUMMY_VALUE_FOR_TEST` imprimé). Ces lignes atterrissent dans les logs Coolify, accessibles aux opérateurs et exportables.
**Correction** : `echo " - STRIPE_SECRET_KEY: ${STRIPE_SECRET_KEY:+SET}${STRIPE_SECRET_KEY:-MISSING}"` → utiliser exclusivement `${VAR:+SET}${VAR:-MISSING}` **sans** seconde expansion, ou `[ -n "$VAR" ] && echo SET || echo MISSING`. Purger les logs existants.

### P0-13 (DevOps) — Build de l'API impossible : `npm ci` sans lockfile versionné

**Fichiers** : `apps/api-backend/Dockerfile:5` (`RUN npm ci`), `.gitignore:16` (`apps/*/package-lock.json`), `package.json` (workspaces racine **sans** `apps/api-backend`)

Le lockfile de l'API est ignoré par Git et absent du dépôt ; il n'est pas non plus dans le lockfile racine (celui-ci ne déclare que `apps/main-app`, `apps/expert-desk`, `apps/shared`). Sur une copie propre du répertoire versionné, `npm ci` échoue :

```
npm error code EUSAGE
npm error The `npm ci` command can only install with an existing package-lock.json
```

**Preuve** : CHECK-7.
**Impact** : l'image API ne peut pas être construite de façon reproductible ; les builds effectivement déployés proviennent d'un `npm install` flottant (aucune garantie d'intégrité).
**Correction** : versionner `apps/api-backend/package-lock.json` (retirer la règle d'exclusion) **et** ajouter `apps/api-backend` aux `workspaces` (ou adopter un lockfile par application assumé), puis utiliser `npm ci --omit=dev` en étape finale.

### P0-14 (DevOps) — Aucune CI, plusieurs Dockerfiles contradictoires, image API en `root`

- **Aucun workflow CI** : `.github/` n'existe pas. Aucun lint, test, audit ni scan de secrets ne s'exécute avant un déploiement Coolify. Les documents qui décrivent un « CI/CD » ne sont adossés à aucun fichier.
- **5 Dockerfiles divergents** pour 3 applications (`./Dockerfile`, `./Dockerfile.expert-desk`, `./Dockerfile.simple`, `apps/api-backend/Dockerfile`, `.backend`, `.alternative`, `apps/main-app/Dockerfile`, `apps/expert-desk/Dockerfile`) : impossible de savoir lequel est déployé ; les variables d'environnement, utilisateurs et healthchecks diffèrent.
- **Image API en root** : `apps/api-backend/Dockerfile` ne déclare aucun `USER` (le `Dockerfile.backend` le fait, lui). Contradiction directe avec `SECURITY-HARDENING-PATCHES.md` qui prétend exécuter nginx en non-root.
- `apps/api-backend/entrypoint.sh` fait un `chown -R` sur des volumes montés à chaque démarrage (coût + surface).

**Correction** : un Dockerfile par application, `USER` non-root, healthcheck `/api/healthz`, lockfile versionné ; workflow CI unique (cf. §6.3).

---

## 4. Défauts P1 — confirmés

### P1-1 — Rate limiting contournable par en-tête client
`apps/api-backend/src/server.ts:58`, `75`, `91` — les trois `keyGenerator` lisent `x-forwarded-for` **sans** `app.set('trust proxy', …)`. Aucun `trust proxy` dans le dépôt. L'attaquant fait varier l'en-tête et obtient une fenêtre neuve à chaque requête (CHECK-5), ce qui neutralise la protection sur `/api/expert/login`, `/api/payments`, `/api/users`.
**Correction** : `app.set('trust proxy', 1)` derrière Coolify, puis `keyGenerator: (req) => req.ip` uniquement ; ajouter un limiteur dédié login (`max: 5 / 15 min / IP + e-mail`).

### P1-2 — Idempotence des webhooks non persistante
`payments.ts:11` (`new Set<string>()`), `products.ts:754` (`processedWebhookEvents`). En mémoire, par processus : deux instances ou un redémarrage rejouent l'événement. Seul `routes/stripe.ts` utilise `ProcessedEvent` (Mongo), et encore avec libération du verrou en cas d'erreur.
**Correction** : un service `WebhookIdempotency` unique adossé à `ProcessedEvent` (`upsert` + TTL), partagé par les trois endpoints.

### P1-3 — Trois implémentations concurrentes du parcours de paiement
`routes/stripe.ts` (levels 14 €/29 €/49 €), `routes/products.ts` (catalogue 0/47/67/97 €), `routes/payments.ts` (montant client) coexistent, avec des modèles de statut différents (`Order` vs `ProductOrder`), des idempotences différentes et **des prix différents pour la même prestation**. `apps/main-app/src/api/stripe.ts:81` appelle encore `/payments/create-payment-intent` (P0-4) via `CommandeTemple.tsx`.
**Correction** : un seul service `checkoutService.createOrder()` adossé à `PRODUCT_CATALOG` comme unique source de prix ; déprécier puis supprimer `routes/stripe.ts` et `routes/payments.ts`.

### P1-4 — Trois lectures publiques exposent l'e-mail et les métadonnées du client
- `products.ts:640/642` (`GET /order/:orderId`, `GET /orders/:orderId`) : `customerEmail` + `metadata` (téléphone, nom) renvoyés sans jeton (REPRO-L).
- `payments.ts:186` (`GET /order/:orderId`) : `customerEmail`, statut, montant, e-mail du client sans jeton.
- `payments.ts:63` (`POST /confirm-payment`) : écrit `status: 'paid'` sur la commande retrouvée par `paymentIntentId` fourni par l'appelant (le statut vient bien de Stripe — ce n'est donc pas un contournement de paiement, mais une écriture non authentifiée et un oracle d'existence de PaymentIntent).
**Correction** : réponse publique minimale (`status`, `productId`, `accessGranted`) ; détails réservés au propriétaire authentifié (jeton Sanctuaire + `userId`) ; `confirm-payment` réservé au flux propriétaire ou supprimé au profit du webhook.

### P1-5 — Presign expert non restreint
`users.ts:891`, `989` — `isExpert = !!decoded.expertId` autorise **toutes** les clés `uploads/*`, donc les photos de tous les clients (REPRO-M) ; `expert.ts:506` idem. Aucun journal d'accès nominatif.
**Correction** : restreindre aux commandes assignées à l'expert (`expertReview.expertId`) ou au rôle `admin`, journaliser `{expertId, key, orderId}`.

### P1-6 — Aucune séparation de rôle expert / admin sur les opérations destructrices
`expert.ts:1537` (`DELETE /orders/:id`), `1772` (`DELETE /clients/:id`), `1723` (`PATCH /clients/:id`), `1474` (`POST /regenerate-lecture`) : n'importe quel compte `expert` (y compris auto-inscrit via P0-9) peut supprimer commandes et clients. Aucune trace d'audit persistée (uniquement `console.log`).
**Correction** : `requireRole(['admin'])` sur les suppressions, mode « soft delete » + piste d'audit en base.

### P1-7 — Journalisation de données sensibles
- `orders.ts:198` : `structuredLogger.debug(..., { headers: req.headers })` → `Authorization`, cookies.
- `orders.ts:199` et `325` : expose la configuration (`ALLOW_DIRECT_CLIENT_SUBMIT`).
- `expert.ts:339` (`Body reçu:` = mot de passe en clair), `380` (`Mot de passe fourni:`), `381` (extrait de hash), `69` (`passwordPreview`).
- `products.ts:52` et `~470` : `req.body` complet (e-mail, téléphone) en `console.log` d'erreur.
**Correction** : filtre de rédaction centralisé (`selftest`: `authorization|password|token|secret|stripe|email|phone`) avant toute sérialisation ; interdire `req.headers`/`req.body` bruts.

### P1-8 — Uploads : limites et validation permissives, nettoyage désactivé
`orders.ts:83` (`fileSize: 1 GB`), `orders.ts:96` (`fieldSize: 50 MB`), `orders.ts:29` (types inconnus ⇒ `return true`, validation de signature contournée), `server.ts:12` et `280` (`startCleanupJob` commenté) alors que `jobs/cleanupTempFiles.ts` existe.
**Impact** : saturation du disque du conteneur (déni de service), dépôt de fichiers non-images dans `uploads/`.
**Correction** : 10 Mo/fichier, liste blanche stricte de MIME **et** d'extension, rejet par défaut des types non reconnus, réactiver le job (ou `node-cron` dans un conteneur dédié), TTL sur les objets S3.

### P1-9 — XSS stocké via `generatedContent.mandalaSvg`
`apps/main-app/src/components/sanctuaire/AssetsModal.tsx:47` : `dangerouslySetInnerHTML={{ __html: mandalaSvg }}` **sans** assainissement. Le SVG provient de n8n/IA (P0-10 : corps non signé). `expert-desk` utilise correctement `DOMPurify` — dépendance absente de `apps/main-app/package.json`.
**Correction** : `DOMPurify.sanitize(mandalaSvg, { USE_PROFILES: { svg: true } })` côté client **et** validation/assainissement serveur avant stockage.

### P1-10 — Index uniques non garantis en production, numérotation de commande en course
`server.ts:269` désactive `autoIndex` en production ; aucun `syncIndexes`/migration n'existe (pas de Prisma, pas de script Mongo). Les contraintes `unique` (`User.email`, `ProductOrder.paymentIntentId`, `Order.orderNumber`) ne sont donc créées que si un environnement de dev les a créées. Par ailleurs `Order.pre('save')` (`models/Order.ts:240`) calcule le numéro via `findOne` + `+1` puis génère `LU{date}{seq3}`, tandis que les autres créateurs utilisent `LUM-${Date.now()}` / `LU{date}{6 chiffres}` : formats hétérogènes, collision possible sous concurrence.
**Correction** : script de migration d'index idempotent exécuté au déploiement (`syncIndexes()`), génération de `orderNumber` par compteur atomique (`findOneAndUpdate` + `$inc`) ou ObjectId décodé.

### P1-11 — Jetons JWT sans `iss`/`aud`, sans révocation, secret unique partagé experts/clients
`middleware/auth.ts`, `routes/users.ts` (128/346), `routes/expert.ts` (195, 299, 429) : un seul `JWT_SECRET`, TTL 24 h pour les clients, pas de `tokenVersion`, pas de rotation. `routes/expert-test.ts:26` retombe sur `process.env.JWT_SECRET || 'fallback-secret'`.
**Correction** : secrets distincts par audience, `iss`/`aud`, `tokenVersion` sur `User`/`Expert`, suppression du secret de secours, refus de démarrer si `JWT_SECRET < 32` caractères.

---

## 5. Défauts P2 — confirmés

| # | Défaut | Fichier(s) | Correction |
|---|---|---|---|
| P2-1 | `/api/debug/env-check` monté en production (garde `NODE_ENV` seulement) ; `ready/verbose` expose `keyPrefix` | `server.ts:213`, `routes/env-debug.ts`, `routes/ready.ts:300` | Ne monter ces routes que si `ENABLE_DEBUG_ROUTES === 'true'` **et** `NODE_ENV !== 'production'` ; ne jamais renvoyer de préfixe de clé |
| P2-2 | `infrastructure/docker-compose.yml` déclare `depends_on: mysql` sans service `mysql` ; Dolibarr exposé via Traefik sans durcissement | `infrastructure/docker-compose.yml:27-36` | Ajouter le service, ou supprimer la dépendance ; documenter les variables Dolibarr |
| P2-3 | `nginx-frontend.conf` proxifie en dur vers `https://api.oraclelumira.com` (empêche tout environnement de test) | `nginx-frontend.conf` | Rendre la cible configurable par variable |
| P2-4 | `.env.example` incohérent avec le code (`AWS_S3_BUCKET` vs `AWS_S3_BUCKET_NAME`, `STRIPE_PUBLISHABLE_KEY` absent, `DEFAULT_EXPERT_PASSWORD` présent) | `.env.example`, `apps/api-backend/.env.example` | Aligner sur `grep process.env` réel + test de contrat |
| P2-5 | Artefacts QA versionnés contenant e-mails/téléphones de test ; `qa-tests/artifacts/**` suivi par Git | `qa-tests/artifacts/**` | `git rm -r --cached`, ajouter au `.gitignore` |
| P2-6 | Suite de tests non verte : `products.route.test.ts:104` attend un PaymentIntent Stripe mais reçoit une commande gratuite (`free_…`) ⇒ le comportement « produit à 0 € » n'est pas couvert | `apps/api-backend/src/__tests__/products.route.test.ts` | Mettre à jour le test + ajouter un cas explicite « produit gratuit » |
| P2-7 | Jest ne termine pas (handles ouverts) : fuite de connexions/écouteurs | `apps/api-backend` (`jest`) | `--detectOpenHandles`, `forceExit` temporaire, nettoyage des mocks |
| P2-8 | Documentation d'audit contradictoire : scores 9/10, « 0 vulnérabilité critique », patchs jamais appliqués (`${new Date()…}` non interpolé) | `SECURITY-HARDENING-PATCHES.md`, `docs/architecture/SECURITY-AUDIT-PHASE1-REPORT.md`, `SECURITY-CLEANUP-SUMMARY.md`, `GITHUB-SECURITY-ALERTS-RESOLUTION.md` | Archiver dans `docs/audits/archive/` avec bandeau « superseded » |

---

## 6. Affirmations non confirmées / faux positifs (requalification)

| Affirmation auditée | Verdict | Justification |
|---|---|---|
| « 3 vulnérabilités critiques corrigées, 0 restante, production ready 9/10 » (`SECURITY-AUDIT-PHASE1-REPORT.md`) | **Non confirmé — infirmé** | 12 P0 ouverts, dont la falsification de statut de commande et la prise de contrôle Sanctuaire. Les 3 correctifs revendiqués (magic numbers, rate-limit login, plan de refactor) existent bien, mais sont insuffisants ou contournables (P1-8, P1-1). |
| « Vulnérabilités npm frontend : cross-spawn HIGH, vite MODERATE… » (`SECURITY-HARDENING-PATCHES.md`) | **Faux positif (obsolète)** | Le lockfile racine versionne `cross-spawn@7.0.6` et `vite@5.4.19`, au-dessus des seuils annoncés. Aucun `npm audit` frontend fiable n'est possible (pas de lockfile applicatif, cf. P0-13). |
| « Risque de duplication d'index Mongoose » | **Non confirmé** | Aucun index dupliqué : `ProductOrder.paymentIntentId` déclare `unique: true, index: true` (redondant mais inoffensif). |
| « Crise de permissions nginx / conteneur non-root bloquant » | **Partiellement faux** | Le Dockerfile racine exécute nginx en **root** (pas de `USER`) : le problème décrit n'existe pas, mais le risque réel est l'inverse (P0-14). |
| « Prisma » (périmètre demandé, CI/CD + Prisma) | **Non applicable** | Aucune dépendance, aucun `schema.prisma`, aucune migration dans le dépôt ; la persistance est Mongoose. Le défaut réel est l'**absence totale de gestion d'index/migration** (P1-10). |
| « Signature des webhooks Stripe absente » | **Faux positif** | `constructEvent` est bien présent et correct sur `/api/stripe/webhook` (`stripe.ts:125`), `/api/products/webhook` (`products.ts:786`) et `/api/payments/webhook` (`payments.ts:107`), avec corps brut monté en amont (`server.ts:155-157`). Le défaut réel est l'**idempotence non persistante** (P1-2). |
| « Rejet des fichiers falsifiés par magic numbers » | **Partiellement faux** | `validateFileHeader` renvoie `true` pour tout type non listé (`orders.ts:29`), et la liste autorisée accepte `image/*` génériquement : un `.heic`/`.bmp`/type inconnu passe sans contrôle. |

---

## 7. Plan de correction ordonné

> Principe : **rien d'architectural**. On ajoute des middlewares, on inverse des ordres de fusion, on supprime des routes, on rend des configurations cohérentes. Chaque lot est indépendant, testable et réversible.

### Lot 0 — Sécurité immédiate (hors code, avant tout merge)
1. **Rotation** : mot de passe MongoDB (`diagnose-prod.cjs:9`), `N8N_CALLBACK_SECRET` (`verify_sig.js:3`), `JWT_SECRET` (invalide tous les jetons existants), mot de passe expert `Lumira2025L`.
2. Purger les logs Coolify contenant `STRIPE_SECRET_KEY`/`MONGODB_URI` (P0-12).
3. Auditer la collection `experts` : toute ligne créée hors processus connu ⇒ suspecte (P0-9).
4. Auditer les commandes `status='completed'` sans `paidAt`/`paymentIntentId` valide (falsification via P0-1).
5. Vérifier côté Stripe l'absence de PaymentIntents à montant anormal (P0-4).

### Lot 1 — Fermeture des routes (≤ 1 jour, gain maximal)
6. `authenticateExpert` sur `orders.ts` : `PATCH /:id/status`, `/expert-review`, `/content`, `/delivered`, `GET /`, `GET /stats/overview`.
7. `authenticateSanctuaire` + filtre `userId` (avec garde `if (!userId) 401`) sur `GET /:id`, `GET /:id/content`, `GET /number/:orderNumber`.
8. `authenticateSanctuaire` sur `client-submit`, `PATCH /products/orders/:id/customer`, `uploads/presign`, `uploads/presign-get` ; vérification de propriété avant écriture.
9. Suppression (ou `requireRole(['admin'])` + invitation) de `POST /expert/register` ; `requireRole(['admin'])` sur les suppressions expert.
10. Désactivation de `routes/payments.ts` et `routes/stripe.ts` (ou protection + prix serveur).

### Lot 2 — Authentification Sanctuaire et jetons
11. Middlewares distincts `requireSanctuaire` / `requireExpert` avec contrôle `type`/`expertId` ; normalisation `req.user = { userId, role }`.
12. Lien magique e-mail (TTL 15 min) pour l'entrée Sanctuaire, `tokenVersion` sur `User`, TTL 24 h → 12 h.
13. `iss`/`aud`/secrets distincts, refus au démarrage si secret trop court ou absent, suppression de `'fallback-secret'`.

### Lot 3 — Intégrité du paiement
14. Prix exclusivement depuis `PRODUCT_CATALOG` ; suppression de `amount` du contrat entrant.
15. Inversion + whitelist de `metadata` dans `services/stripe.ts` (P0-7).
16. Fabrique unique `Order`/`ProductOrder` + service d'idempotence Mongo partagé (P1-2, P1-3).
17. `orderNumber` atomique + script de migration d'index (`syncIndexes`) au déploiement (P1-10).

### Lot 4 — Génération IA et fichiers
18. n8n : `X-Timestamp`+`X-Nonce` obligatoires, signature du corps brut uniquement, nonce en Mongo TTL (P0-10).
19. Assainissement serveur de `mandalaSvg` + `DOMPurify` côté `main-app` (P1-9).
20. Limites d'upload 10 Mo, liste blanche stricte, réactivation du job de nettoyage (P1-8).
21. Presign expert restreint aux commandes assignées + journal d'accès (P1-5).

### Lot 5 — Observabilité et configuration
22. Filtre de rédaction des logs (P1-7), suppression des `console.log` de PII et de secrets.
23. `trust proxy` + `keyGenerator` basé sur `req.ip` (P1-1).
24. Nettoyage `.env.example`, purge des artefacts QA, archivage des rapports obsolètes (P2-4/5/8).

### Lot 6 — Build, CI et conteneurs
25. Versionner `apps/api-backend/package-lock.json`, ajouter le workspace, `npm ci --omit=dev` (P0-13).
26. Un Dockerfile par application, `USER` non-root, healthcheck, `.dockerignore` cohérent ; supprimer les Dockerfiles morts (P0-14).
27. Workflow CI (`.github/workflows/ci.yml`) : `tsc --noEmit`, `jest`, `npm audit --omit=dev`, `gitleaks`, `hadolint`, build des 3 images.
28. Corriger le test rouge (`products.route.test.ts`) et stabiliser Jest (P2-6/7).

### Critères de sortie (Definition of Done)
- Les 14 tests de reproduction de §8 passent au **vert après correction** (ils sont écrits pour être rouges sur le code actuel).
- `npm audit --omit=dev` : 0 high/critical ; `gitleaks` : 0 fuite.
- Aucune route de mutation accessible sans jeton (vérifié par un test qui énumère la table de routage).
- Aucun secret dans les logs de démarrage.

---

## 8. Tests à créer

> Dossier cible : `apps/api-backend/src/__tests__/security/`. Les 14 cas ci-dessous ont déjà été écrits et exécutés de façon temporaire (non commités) : ils **échouent** sur le code actuel et doivent **passer** après correction — c'est le critère d'acceptation.

### 8.1 Autorisation des routes
| Fichier de test | Cas |
|---|---|
| `security/orders.authz.test.ts` | `GET /api/orders/:id` sans jeton ⇒ 401 ; `PATCH /:id/status` sans jeton ⇒ 401 ; `PATCH /:id/delivered` sans jeton ⇒ 401 ; `GET /` sans jeton ⇒ 401 ; réponse publique post-paiement limitée à `{orderNumber,status,level,amount}` (pas de `formData.phone`, pas de `files[].key`) |
| `security/users.tenant-isolation.test.ts` | le jeton de A ne lit pas la commande de B (`GET /api/users/orders/:id/content`) ; le filtre Mongoose contient toujours `userId` (assertion sur `getFilter()`) |
| `security/auth.middleware.test.ts` | un jeton `{expertId}` est refusé par `requireSanctuaire` ; un jeton `{userId,type:'sanctuaire_access'}` est refusé par `requireExpert` ; `req.user.userId` toujours défini |
| `security/products.public-surface.test.ts` | `GET /api/products/orders/:id` ne renvoie ni `customerEmail` ni `metadata.customerPhone` |
| `security/uploads.presign.authz.test.ts` | `POST /api/uploads/presign` sans jeton ⇒ 401 ; `presign-get` d'une clé d'autrui ⇒ 403 |
| `security/expert.privileges.test.ts` | `POST /api/expert/register` ⇒ 401/404 ; `DELETE /api/expert/orders/:id` avec jeton expert non-admin ⇒ 403 |

### 8.2 Authentification Sanctuaire
| Fichier | Cas |
|---|---|
| `security/sanctuaire.login.test.ts` | `POST /api/users/auth/sanctuaire-v2` avec simple e-mail ⇒ 401/202 (pas de jeton) ; jeton obtenu via lien magique ⇒ 200 ; jeton expiré ⇒ 401 ; `tokenVersion` incrémenté ⇒ ancien jeton refusé |

### 8.3 Paiement et intégrité commerciale
| Fichier | Cas |
|---|---|
| `security/free-tier.regression.test.ts` | produit `initie` (0 €) : `POST /api/products/create-payment-intent` ⇒ 200, montant 0, **une seule** commande créée ; protège la régression déjà présente dans la suite actuelle (`products.route.test.ts:104` attend à tort un PaymentIntent Stripe) |
| `security/pricing.server-side.test.ts` | `POST /api/products/create-payment-intent` avec `productId: 'mystique'` puis `metadata:{level:'integrale'}` ⇒ montant 4700 et `level='mystique'` |
| `security/catalog-single-source.test.ts` | test de contrat : `routes/stripe.ts` LEVELS ≡ `PRODUCT_CATALOG` (échoue aujourd'hui : 14/29/49 vs 47/67/97) |
| `security/payments.amount.test.ts` | `POST /api/payments/create-payment-intent` sans jeton ⇒ 401 ; montant ≠ catalogue ⇒ 400 |
| `security/orders.customer-immutability.test.ts` | `PATCH /api/products/orders/:id/customer` sans jeton ⇒ 401 ; tentative de réécriture par un tiers ⇒ 403 |
| `security/client-submit.authz.test.ts` | `client-submit` sans jeton ⇒ 401 ; `formData.email` ≠ `receipt_email` après paiement ⇒ 400 ; `ALLOW_DIRECT_CLIENT_SUBMIT` ignoré en production |

### 8.4 Workers / IA
| Fichier | Cas |
|---|---|
| `security/n8n.callback.signature.test.ts` | signature `orderId:orderNumber` seule ⇒ 401 ; corps modifié après signature ⇒ 401 ; en-têtes de rejeu manquants ⇒ 400 ; nonce réutilisé ⇒ 409 |
| `security/n8n.content-sanitize.test.ts` | `mandalaSvg` contenant `<script>` ⇒ stocké assaini |

### 8.5 DevOps / configuration
| Fichier / script | Cas |
|---|---|
| `scripts/ci/route-authz-matrix.test.js` | énumère la table de routage Express et échoue si une route `PATCH|DELETE` non publique n'a pas de middleware d'authentification |
| `scripts/ci/no-secrets.test.sh` | `gitleaks detect --no-git` + recherche de `Lumira2025L`, `whsec_`, `sk_live_`, URI Mongo avec `:…@` |
| `scripts/ci/docker-build.test.sh` | `npm ci` sur copie propre de `apps/api-backend` ⇒ succès (échoue aujourd'hui) |
| `scripts/ci/log-redaction.test.sh` | simule le démarrage du conteneur et échoue si une valeur de secret apparaît dans les logs |
| `qa-tests/negative-security.cjs` | suite bout-en-bout des scénarios P0 (au minimum P0-1, P0-2, P0-4, P0-5, P0-9, P0-10), exécutable contre un environnement de staging |

---

## 9. Fichiers concernés (récapitulatif)

```
API — autorisation / authentification
  apps/api-backend/src/middleware/auth.ts                (P0-3, P1-11)
  apps/api-backend/src/routes/orders.ts                  (P0-1, P0-6, P1-7, P1-8)
  apps/api-backend/src/routes/users.ts                   (P0-2, P0-3, P1-5, P1-7)
  apps/api-backend/src/routes/expert.ts                  (P0-9, P0-10, P1-6, P1-7)
  apps/api-backend/src/routes/admin.ts                   (P1-6)
  apps/api-backend/src/routes/expert-test.ts             (P1-11)
API — paiement
  apps/api-backend/src/routes/payments.ts                (P0-4, P1-2, P1-3)
  apps/api-backend/src/routes/stripe.ts                  (P1-3, P2-8)
  apps/api-backend/src/routes/products.ts                (P0-5, P0-7, P1-2, P1-4)
  apps/api-backend/src/services/stripe.ts                (P0-7, P1-3)
  apps/api-backend/src/catalog.ts                        (source de vérité prix)
  apps/api-backend/src/models/Order.ts                   (P1-10)
  apps/api-backend/src/models/ProductOrder.ts            (P0-1, P1-2)
  apps/api-backend/src/models/ProcessedEvent.ts          (P1-2)
API — infrastructure applicative
  apps/api-backend/src/routes/uploads.ts                 (P0-8)
  apps/api-backend/src/routes/env-debug.ts               (P2-1)
  apps/api-backend/src/routes/ready.ts                   (P2-1)
  apps/api-backend/src/server.ts                         (P1-1, P1-8, P2-1)
  apps/api-backend/src/jobs/cleanupTempFiles.ts          (P1-8)
  apps/api-backend/src/middleware/logging.ts             (P1-7)
Frontend
  apps/main-app/src/components/sanctuaire/AssetsModal.tsx (P1-9)
  apps/main-app/src/pages/ConfirmationTempleSPA.tsx       (P0-2 — dépendance au login par e-mail)
  apps/main-app/src/api/stripe.ts                         (P0-4, P1-3)
  apps/main-app/src/contexts/SanctuaireContext.tsx        (stockage du jeton)
Secrets / DevOps
  apps/api-backend/diagnose-prod.cjs                     (P0-11 — URI prod)
  apps/api-backend/verify_sig.js                         (P0-11 — HMAC)
  apps/api-backend/create-expert.cjs, create-expert.cjs  (P0-11)
  apps/api-backend/quick-server.js                       (P0-11)
  .coolify/entrypoint.sh                                 (P0-12)
  .env.example, apps/api-backend/.env.example            (P0-11, P2-4)
  apps/api-backend/Dockerfile, Dockerfile.backend,
  Dockerfile.alternative, Dockerfile, Dockerfile.simple,
  Dockerfile.expert-desk, apps/*/Dockerfile              (P0-13, P0-14)
  .gitignore                                             (P0-13)
  .github/workflows/  (absent)                           (P0-14)
Docs (à archiver / requalifier)
  SECURITY-HARDENING-PATCHES.md                          (P2-8)
  docs/architecture/SECURITY-AUDIT-PHASE1-REPORT.md      (P2-8)
  SECURITY-CLEANUP-SUMMARY.md, GITHUB-SECURITY-ALERTS-RESOLUTION.md (P2-8)
```

---

## 10. Règles respectées

| Règle de la mission | Statut |
|---|---|
| Ne jamais modifier `main` | ✅ `main` = `origin/main` = `49f3f44`, reflog intact (`clone`) |
| Aucun déploiement, aucune base de production | ✅ aucun accès réseau à Stripe/Mongo de production ; tests sur doubles en mémoire |
| Préserver les changements locaux non commités | ✅ `git status` était vide au départ, aucun changement préexistant écrasé |
| Aucun secret réel dans les logs ou rapports | ✅ valeurs masquées ; sorties de preuve avec données fictives (`victim@example.com`, `DUMMY_VALUE_FOR_TEST`) |
| Ne pas réécrire l'architecture | ✅ plan limité à des middlewares, ordres de fusion, suppressions de routes et configurations |
| Corrections simples, robustes, maintenables | ✅ un seul service de prix, un middleware par type de sujet, une fabrique de commande, un service d'idempotence |
| Livrable `docs/audits/SECURITY_HARDENING.md` | ✅ ce document |
| Ne pas exécuter les autres phases | ✅ aucune correction applicative appliquée, seuls des tests de preuve temporaires (supprimés) ont été exécutés |

---

## Annexe A — Commandes de reproduction

```bash
# 0. État
git rev-parse HEAD origin/main          # 49f3f444544a0c3478d6c426c1a96a98a3a37600
git status --porcelain                  # vide
git ls-remote --heads origin 'codex/*'  # vide (branche cible absente)

# 1. Compilation + suite existante
cd apps/api-backend
npx tsc -p tsconfig.json --noEmit       # 0 erreur
npx jest                                # 1 échec pré-existant, 45 passés

# 2. Preuve build (P0-13), sans Docker
mkdir -p /tmp/probe && cd /tmp/probe
git -C /home/user/oracle-lumira archive HEAD apps/api-backend/package.json | tar -x
cd apps/api-backend && npm ci           # EUSAGE : lockfile manquant

# 3. Preuve filtre Mongoose (P0-3)
cd apps/api-backend
cat > /tmp/probe-filter.ts <<'TS'
import mongoose from 'mongoose';
import { Order } from './src/models/Order';
const q: any = Order.findOne({ _id: new mongoose.Types.ObjectId(), userId: undefined, status: 'completed' } as any);
console.log(q.getFilter());
TS
npx ts-node /tmp/probe-filter.ts
# => { _id: ..., status: 'completed' }   (userId absent => filtre de locataire perdu)

# 4. Preuve pricing serveur (P0-7) — ordre de fusion dans services/stripe.ts
cat > /tmp/probe-price.ts <<'TS'
import { getProductById } from './src/catalog';
const p = getProductById('mystique')!;
const meta: any = { level: p.level, ...({ level: 'integrale' } as Record<string, any>) };
console.log(p.amountCents, meta.level);
TS
npx ts-node /tmp/probe-price.ts
# => 4700 'integrale'

# 5. Preuve secrets dans les logs (P0-12) — valeur factice uniquement
STRIPE_SECRET_KEY=DUMMY_FOR_TEST bash -c 'echo "${STRIPE_SECRET_KEY:+SET}${STRIPE_SECRET_KEY:-MISSING}"'
# => SETDUMMY_FOR_TEST

# 6. Audit dépendances
npm audit --omit=dev                    # 1 modérée (uuid < 11.1.1)
```

## Annexe B — Points à arbitrer avec le mainteneur

1. **Dépôt de référence** : `LumiraV2` (inaccessible, 403) vs `oracle-lumira` (audité). Rejouer les SHA si nécessaire.
2. **Branche cible** : créer `codex/lumirav2-security-hardening` depuis `49f3f44` avant d'appliquer le lot 1.
3. **Stratégie de connexion Sanctuaire** : lien magique e-mail (recommandé) ou vérification `paymentIntentId` + `receipt_email` auprès de Stripe. Ce choix conditionne les lots 1 et 2.
4. **Sort de `routes/stripe.ts` et `routes/payments.ts`** : dépréciation immédiate (impact sur `CommandeTemple.tsx`) ou maintien temporaire sous authentification stricte.
5. **Rotation** : elle invalidera les sessions en cours (`JWT_SECRET`) et nécessitera une fenêtre de déploiement annoncée.
