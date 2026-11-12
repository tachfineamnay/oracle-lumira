# P0 — Sessions Sanctuaire liées à une identité vérifiée

**Portée** : correction du P0 « un paiement réussi délivre une session Sanctuaire pour l'email saisi au checkout ».
**Branche** : `arena/50fee145-oracle-lumira` (aucun merge, `main` intacte).

## 1. Cause racine corrigée

| Avant | Après |
|---|---|
| `POST /api/users/auth/sanctuaire-v2 { email }` → JWT `sanctuaire_access` 24 h pour **quiconque tape un email** | Endpoint **supprimé**. Deux étapes obligatoires : `POST /auth/magic-link/request` (envoi) puis `POST /auth/magic-link/verify` (session) |
| `POST /api/users/auth/sanctuaire { email }` (même faille, variante v1) | Endpoint **supprimé** |
| Le front appelait l'auto-login depuis `ConfirmationPage`, `ConfirmationTempleSPA`, `Sanctuaire` (URL `?email=`), `LoginSanctuaire*` | Aucun appel automatique. L'email ne sert qu'à **pré-remplir** la demande de lien ; la session naît uniquement de `/sanctuaire/verify?token=…` |
| Faille induite : `POST /api/products/create-payment-intent` avec l'email d'un tiers déclenchait un achat « pour » son compte | L'achat n'ouvre plus aucun accès : il enregistre une commande, l'accès exige la vérification de l'email |

## 2. Ce qui a été ajouté

**Backend**
- `src/models/MagicLinkToken.ts` — jeton **haché** (SHA-256), mono-usage (`usedAt`), TTL (`expiresAt` + index TTL), `purpose` scopé.
- `src/services/magicLink.ts` — émission/consommation atomique (`findOneAndUpdate` conditionnel : usage unique même en concurrence), cooldown de renvoi, TTL configurable.
- `src/services/magicLinkMailer.ts` — livraison pluggable (`MAGIC_LINK_DELIVERY_URL`, ex. n8n/provider) ; en dev, lien loggé ; **en production sans transport, l'API répond 503 explicite** (jamais de faux succès).
- `src/routes/sanctuaireAuth.ts` — `request` (réponse uniforme 202, pas d'énumération de comptes), `verify`, `GET /session`, `GET /session/order-context` (contexte post-achat authentifié).
- `src/middleware/sanctuaireAuth.ts` — middleware partagé, claim `email_verified`, vérification token↔compte.
- `src/services/sanctuaireEntitlements.ts` — source unique des droits : `Order` payé/complété/à valider + `ProductOrder` **completed** uniquement, dédupliqués par `paymentIntentId` (un achat = un droit).

**Frontend**
- `services/sanctuaireAuth.ts` — client des deux étapes + session.
- `pages/VerifySanctuaireMagicLink.tsx` (`/sanctuaire/verify`) — échange du lien, états clair succès/expiré.
- `LoginSanctuaireSimple` / `LoginSanctuaire` — UX 2 étapes, message « vérifiez votre boîte », renvoi avec compte à rebours, message d'erreur explicite si l'envoi échoue.
- `SanctuaireContext` — `requestMagicLink` / `verifyMagicLink` / `emailVerified` ; plus aucun `authenticateWithEmail`.

## 3. Défenses complémentaires livrées avec le P0

- **Confidentialité checkout** : `GET /api/products/orders/:id`, `GET /api/orders/:id`, `GET /api/orders/number/:n`, `GET /api/payments/order/:id` ne renvoient plus email / téléphone / nom / `formData` / fichiers / contenu généré. Les détails passent par `/api/users/session/order-context`, qui exige la session **vérifiée** et compare l'email de la commande (403 sinon).
- **Immutabilité des comptes** : le webhook Stripe ne réécrit plus le nom/téléphone d'un profil existant avec les données saisies au checkout (un tiers ne peut plus altérer un compte via un achat avec son email).
- **OnboardingForm** : pré-remplissage via l'endpoint authentifié (l'endpoint public ne fournissant plus ces données).

## 4. Tests exécutés (résultats réels)

Commande : `cd apps/api-backend && npx jest`

| Suite | Résultat |
|---|---|
`src/__tests__/security/identity-binding.test.ts` | **16 / 16 verts**
Suite backend complète | 61 passés, 2 skipped, **1 rouge préexistant** (`products.route.test.ts › should work without customer email`, déjà rouge sur la base — vérifié par stash)

Couverture des scénarios exigés :

1. **Achat avec l'email d'un autre client** → aucune session (`sanctuaire-v2`/`sanctuaire` en 401/403/404, aucune fuite d'identité ou de droits dans la demande de lien ; un JWT forgé avec un autre userId est rejeté 401).
2. **Achat nouveau compte** → accès seulement après vérification (`GET /session` 401 avant, `emailVerified: true` après, compte créé à la vérification).
3. **Paiement valide** → commande enregistrée (`pending` → `completed` après webhook) et droits accordés après vérification.
4. **Paiement échoué** → `failed`, aucun droit (`products: []`, `highestLevel: null`).
5. **Webhook rejoué** → aucun doublon (1 `ProductOrder`, 1 `Order` Expert Desk), `orderCount` stable à 1.
6. **Lien expiré / déjà utilisé / forgé** → 401 `MAGIC_LINK_INVALID` ; le jeton brut n'est jamais stocké.
7. **Reconnexion légitime** → nouveau lien fonctionnel, droits historiques préservés (héritage des niveaux).
Plus : webhook ne réécrit pas un profil existant ; réponses de commande sans données personnelles.

Frontend : `cd apps/main-app && npx vitest run src/__tests__/sanctuaire/magicLinkFlow.test.tsx --environment jsdom` → **4 / 4 verts** (demande de lien sans jeton stocké, erreur d'envoi claire + renvoi possible, lien valide → session + redirection, lien expiré → nouvelle demande).

Compilation : `npx tsc --noEmit` backend = 0 erreur ; `vite build` (main-app) = succès. Les erreurs `tsc` du main-app sont **préexistantes** (60 après vs 61 avant, aucune nouvelle).

## 5. Variables d'environnement

```env
MAGIC_LINK_DELIVERY_URL=""      # endpoint de livraison (n8n / provider)
MAGIC_LINK_DELIVERY_TOKEN=""    # Bearer éventuel
MAGIC_LINK_TTL_MINUTES="20"     # 5-60
MAGIC_LINK_RESEND_COOLDOWN_SECONDS="60"
MAGIC_LINK_REQUEST_RATE_LIMIT="10"   # optionnel (tests)
MAGIC_LINK_VERIFY_RATE_LIMIT="30"    # optionnel (tests)
```

**Action de déploiement obligatoire** : renseigner `MAGIC_LINK_DELIVERY_URL` en production, sinon la connexion répond 503 « envoi indisponible » (message explicite côté client, aucun accès accordé).

## 6. Hors périmètre (laissé aux lots suivants de l'audit)

`client-submit` non authentifié (P0-2), `PATCH /api/orders/*` sans jeton (P0-3), auto-inscription expert (P0-9), routes debug/`simulate-payment`, presign non authentifié en amont, en-têtes CSP. Ces points restent ouverts et documentés dans `docs/audits/SECURITY_HARDENING.md`.
