import crypto from 'crypto';
import { MagicLinkToken, MagicLinkPurpose } from '../models/MagicLinkToken';

/**
 * Oracle Lumira - Magic link service (Sanctuaire authentication)
 *
 * The magic link is the *only* proof of email ownership accepted by the
 * Sanctuaire. It is deliberately independent from payments: a successful
 * payment (or a PaymentIntent client_secret) can never mint a session.
 */

const DEFAULT_TTL_MINUTES = 20;
const MIN_TTL_MINUTES = 5;
const MAX_TTL_MINUTES = 60;

export const MAGIC_LINK_TTL_MINUTES = (() => {
  const raw = Number(process.env.MAGIC_LINK_TTL_MINUTES);
  if (!Number.isFinite(raw) || raw <= 0) return DEFAULT_TTL_MINUTES;
  return Math.min(Math.max(Math.floor(raw), MIN_TTL_MINUTES), MAX_TTL_MINUTES);
})();

/** Emails older than this must request a fresh link instead of spamming the inbox. */
export const MAGIC_LINK_RESEND_COOLDOWN_SECONDS = (() => {
  const raw = Number(process.env.MAGIC_LINK_RESEND_COOLDOWN_SECONDS);
  if (!Number.isFinite(raw) || raw < 0) return 60;
  return Math.min(Math.floor(raw), 600);
})();

export function normalizeEmail(email: unknown): string {
  return String(email || '').trim().toLowerCase();
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/** Only the hash is persisted: a database dump cannot be replayed. */
export function hashMagicLinkToken(rawToken: string): string {
  return crypto.createHash('sha256').update(rawToken).digest('hex');
}

/**
 * Issue a new magic link token.
 * Any previously issued unused token for the same email/purpose is invalidated
 * so a mailbox never holds two valid credentials at once.
 */
export async function issueMagicLink(options: {
  email: string;
  purpose?: MagicLinkPurpose;
  orderReference?: string;
  ip?: string;
}): Promise<{ token: string; expiresAt: Date }> {
  const email = normalizeEmail(options.email);
  const purpose: MagicLinkPurpose = options.purpose || 'sanctuaire_login';
  const rawToken = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + MAGIC_LINK_TTL_MINUTES * 60 * 1000);

  await MagicLinkToken.deleteMany({ email, purpose, usedAt: null });

  await MagicLinkToken.create({
    email,
    purpose,
    tokenHash: hashMagicLinkToken(rawToken),
    expiresAt,
    usedAt: null,
    requestedIp: options.ip,
    orderReference: options.orderReference,
  });

  return { token: rawToken, expiresAt };
}

/**
 * Consume a magic link token exactly once.
 *
 * The conditional update is the security boundary: a token is only accepted
 * when it is unused *and* unexpired at the very moment it is redeemed, so
 * concurrent replays cannot both succeed.
 */
export async function consumeMagicLink(
  rawToken: unknown,
  purpose: MagicLinkPurpose = 'sanctuaire_login'
): Promise<{ email: string; orderReference?: string } | null> {
  if (typeof rawToken !== 'string') return null;
  const token = rawToken.trim();
  if (token.length < 32 || token.length > 256) return null;

  const now = new Date();
  const consumed = await MagicLinkToken.findOneAndUpdate(
    {
      tokenHash: hashMagicLinkToken(token),
      purpose,
      usedAt: null,
      expiresAt: { $gt: now },
    },
    { $set: { usedAt: now } },
    { new: true }
  );

  if (!consumed) return null;

  return {
    email: normalizeEmail((consumed as any).email),
    orderReference: (consumed as any).orderReference || undefined,
  };
}

/** Returns the delay (ms) to wait before a new link may be requested, or 0. */
export async function getResendCooldownMs(email: string): Promise<number> {
  if (MAGIC_LINK_RESEND_COOLDOWN_SECONDS <= 0) return 0;

  const last = await MagicLinkToken.findOne({ email: normalizeEmail(email) })
    .sort({ createdAt: -1 })
    .lean();

  const createdAt = (last as any)?.createdAt;
  if (!createdAt) return 0;

  const elapsed = Date.now() - new Date(createdAt).getTime();
  const remaining = MAGIC_LINK_RESEND_COOLDOWN_SECONDS * 1000 - elapsed;
  return remaining > 0 ? remaining : 0;
}
