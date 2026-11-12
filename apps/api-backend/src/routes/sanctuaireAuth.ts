import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { User } from '../models/User';
import { Order } from '../models/Order';
import { ProductOrder } from '../models/ProductOrder';
import {
  MAGIC_LINK_RESEND_COOLDOWN_SECONDS,
  MAGIC_LINK_TTL_MINUTES,
  consumeMagicLink,
  getResendCooldownMs,
  isValidEmail,
  issueMagicLink,
  normalizeEmail,
} from '../services/magicLink';
import { buildMagicLinkUrl, sendMagicLinkEmail } from '../services/magicLinkMailer';
import { authenticateSanctuaire, signSanctuaireToken } from '../middleware/sanctuaireAuth';
import { computeEntitlements } from '../services/sanctuaireEntitlements';

const router = Router();

/**
 * Oracle Lumira - Sanctuaire authentication (magic link)
 *
 * Principles enforced here:
 * 1. Proof of payment ≠ proof of account ownership. Paying never mints a session.
 * 2. A session is only created after the client proved control of the mailbox
 *    holding the purchase (single-use, short-lived magic link).
 * 3. Requesting a link always answers identically, whether or not an account or
 *    an order exists (no account / entitlement enumeration).
 * 4. Buyers without any order are still allowed to verify their email: their
 *    session simply exposes no entitlement until a purchase is recorded.
 */

const envNumber = (name: string, fallback: number): number => {
  const raw = Number(process.env[name]);
  return Number.isFinite(raw) && raw > 0 ? Math.floor(raw) : fallback;
};

const requestLinkLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  // Configurable so automated tests can exercise the flow; production default is strict.
  max: envNumber('MAGIC_LINK_REQUEST_RATE_LIMIT', 10),
  message: { error: "Trop de demandes de lien. Réessayez dans quelques minutes." },
  standardHeaders: true,
  legacyHeaders: false,
});

const verifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: envNumber('MAGIC_LINK_VERIFY_RATE_LIMIT', 30),
  message: { error: 'Trop de tentatives de vérification. Réessayez dans quelques minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * POST /api/users/auth/magic-link/request
 * Ask for a verification link. Always answers 202 with the same body shape.
 */
router.post('/auth/magic-link/request', requestLinkLimiter, async (req: any, res: any) => {
  const rawEmail = req.body?.email;
  const email = normalizeEmail(rawEmail);
  const orderReference =
    typeof req.body?.orderId === 'string' && req.body.orderId.trim()
      ? req.body.orderId.trim()
      : undefined;

  if (!email || !isValidEmail(email)) {
    return res.status(400).json({ error: 'Adresse email invalide' });
  }

  const genericAccepted = {
    success: true,
    message:
      'Si cette adresse est associée à une commande, un lien de connexion vient de lui être envoyé. Le lien est valable '
      + `${MAGIC_LINK_TTL_MINUTES} minutes et ne peut être utilisé qu'une seule fois.`,
    expiresInMinutes: MAGIC_LINK_TTL_MINUTES,
    resendAfterSeconds: MAGIC_LINK_RESEND_COOLDOWN_SECONDS,
  };

  try {
    const cooldownMs = await getResendCooldownMs(email);
    if (cooldownMs > 0) {
      // Same status/body as a successful request: the cooldown alone must not
      // reveal whether the mailbox matches a customer.
      res.set('Retry-After', String(Math.ceil(cooldownMs / 1000)));
      return res.status(202).json({
        ...genericAccepted,
        resendAfterSeconds: Math.ceil(cooldownMs / 1000),
      });
    }

    const { token } = await issueMagicLink({
      email,
      purpose: 'sanctuaire_login',
      orderReference,
      ip: req.ip,
    });

    const url = buildMagicLinkUrl(token);
    const delivery = await sendMagicLinkEmail({ email, url });

    if (!delivery.delivered) {
      // Do not leave an unusable token behind: the client will be told clearly
      // that the email could not be sent and can retry once the transport is back.
      await consumeMagicLink(token).catch(() => null);
      return res.status(503).json({
        success: false,
        code: 'MAGIC_LINK_DELIVERY_UNAVAILABLE',
        error: "L'envoi de l'email de vérification est momentanément indisponible.",
        message:
          "Votre paiement est bien enregistré. Réessayez la connexion dans quelques instants : "
          + "aucune nouvelle demande ne sera nécessaire de votre côté.",
      });
    }

    return res.status(202).json(genericAccepted);
  } catch (error) {
    console.error('[magic-link] request failed', {
      message: error instanceof Error ? error.message : 'unknown error',
    });
    return res.status(500).json({ error: 'Impossible de traiter la demande de connexion.' });
  }
});

/**
 * POST /api/users/auth/magic-link/verify
 * Exchange a valid, unused, unexpired link token for a Sanctuaire session.
 */
router.post('/auth/magic-link/verify', verifyLimiter, async (req: any, res: any) => {
  const rawToken = req.body?.token;
  if (!rawToken || typeof rawToken !== 'string') {
    return res.status(400).json({ error: 'Jeton de vérification manquant' });
  }

  try {
    const consumed = await consumeMagicLink(rawToken, 'sanctuaire_login');
    if (!consumed) {
      return res.status(401).json({
        code: 'MAGIC_LINK_INVALID',
        error: 'Ce lien de connexion est invalide, expiré ou déjà utilisé.',
        message: 'Demandez un nouveau lien de connexion pour accéder à votre Sanctuaire.',
      });
    }

    const email = consumed.email;
    let user = await User.findOne({ email });
    if (!user) {
      // The mailbox is verified: creating the account here is safe and lets new
      // buyers reach the Sanctuaire to complete their profile.
      user = await User.create({
        email,
        firstName: email.split('@')[0]?.slice(0, 40) || 'Client',
        lastName: 'Lumira',
      });
    }

    const entitlements = await computeEntitlements(user._id, email);
    const token = signSanctuaireToken(user);

    return res.json({
      success: true,
      token,
      emailVerified: true,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone || undefined,
        level: entitlements.highestLevelNumber,
      },
      products: entitlements.products,
      highestLevel: entitlements.highestLevel,
      levelMetadata: entitlements.levelMetadata,
      orderCount: entitlements.orderCount,
    });
  } catch (error) {
    console.error('[magic-link] verify failed', {
      message: error instanceof Error ? error.message : 'unknown error',
    });
    return res.status(500).json({ error: 'Impossible de vérifier le lien de connexion.' });
  }
});

/**
 * GET /api/users/session
 * Lets the frontend know whether the stored session is still valid and whether
 * the email behind it was verified.
 */
router.get('/session', authenticateSanctuaire, async (req: any, res: any) => {
  try {
    const entitlements = await computeEntitlements(req.user._id, req.user.email);
    res.json({
      authenticated: true,
      emailVerified: req.auth?.emailVerified === true,
      user: {
        id: req.user._id,
        email: req.user.email,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        phone: req.user.phone || undefined,
        level: entitlements.highestLevelNumber,
      },
      products: entitlements.products,
      highestLevel: entitlements.highestLevel,
      levelMetadata: entitlements.levelMetadata,
      orderCount: entitlements.orderCount,
    });
  } catch (error) {
    console.error('[session] failed', {
      message: error instanceof Error ? error.message : 'unknown error',
    });
    res.status(500).json({ error: 'Impossible de lire la session' });
  }
});

/**
 * GET /api/users/session/order-context?orderId=...
 * Authenticated post-purchase context: only the verified owner of the mailbox
 * gets the customer details needed to prefill the onboarding form.
 */
router.get('/session/order-context', authenticateSanctuaire, async (req: any, res: any) => {
  try {
    const { orderId } = req.query as { orderId?: string };
    if (!orderId || typeof orderId !== 'string') {
      return res.status(400).json({ error: 'orderId requis' });
    }

    const email = normalizeEmail(req.user.email);
    const productOrder = await ProductOrder.findOne({ paymentIntentId: orderId });
    const legacyOrder = productOrder ? null : await Order.findOne({ paymentIntentId: orderId });

    const orderEmail = normalizeEmail(
      (productOrder as any)?.customerEmail || (legacyOrder as any)?.userEmail || ''
    );

    if (!productOrder && !legacyOrder) {
      return res.status(404).json({ error: 'Commande introuvable' });
    }

    if (orderEmail !== email) {
      return res.status(403).json({ error: 'Cette commande est rattachée à une autre adresse email.' });
    }

    const metadata = ((productOrder as any)?.metadata || {}) as Record<string, any>;
    const formData = ((legacyOrder as any)?.formData || {}) as Record<string, any>;

    res.json({
      orderId,
      productId: (productOrder as any)?.productId || undefined,
      status: (productOrder as any)?.status || (legacyOrder as any)?.status,
      customer: {
        email,
        firstName: metadata.customerFirstName || formData.firstName || '',
        lastName: metadata.customerLastName || formData.lastName || '',
        phone: metadata.customerPhone || formData.phone || '',
      },
    });
  } catch (error) {
    console.error('[session/order-context] failed', {
      message: error instanceof Error ? error.message : 'unknown error',
    });
    res.status(500).json({ error: 'Impossible de lire le contexte de commande' });
  }
});

export { router as sanctuaireAuthRoutes };
export default router;
