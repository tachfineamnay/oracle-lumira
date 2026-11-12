import jwt from 'jsonwebtoken';
import { User } from '../models/User';

/**
 * Oracle Lumira - Sanctuaire session middleware
 *
 * A Sanctuaire session is only ever minted after the client proved ownership of
 * the mailbox (magic link). `email_verified` is now part of the token payload.
 *
 * Legacy tokens (issued before the magic link exists, without the claim) are
 * still accepted so that legitimate buyers are not logged out mid-session; they
 * expire within 24h and no new token can be issued that way.
 */
export const SANCTUAIRE_TOKEN_TTL = '24h';

export interface SanctuaireTokenPayload {
  userId: string;
  email: string;
  type: 'sanctuaire_access';
  email_verified?: boolean;
  auth_method?: 'magic_link';
}

export function signSanctuaireToken(user: { _id: any; email: string }): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT secret missing');
  }

  return jwt.sign(
    {
      userId: String(user._id),
      email: String(user.email || '').toLowerCase(),
      type: 'sanctuaire_access',
      email_verified: true,
      auth_method: 'magic_link',
    },
    secret,
    { expiresIn: SANCTUAIRE_TOKEN_TTL }
  );
}

export function extractBearerToken(req: any): string | null {
  const header = req.header ? req.header('Authorization') : req.headers?.authorization;
  if (!header || typeof header !== 'string') return null;
  const [scheme, token] = header.split(' ');
  if (!token) return null;
  if (scheme.toLowerCase() !== 'bearer') return null;
  return token.trim() || null;
}

/**
 * Verifies a Sanctuaire access token and loads the bound user.
 * The token email must match the loaded account: a session can never be
 * redirected to another account by editing the database.
 */
export async function authenticateSanctuaire(req: any, res: any, next: any) {
  try {
    const token = extractBearerToken(req);
    if (!token) {
      return res.status(401).json({ error: "Token d'authentification requis" });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return res.status(500).json({ error: 'Server configuration error: JWT secret missing' });
    }

    const decoded = jwt.verify(token, secret) as any;
    if (!decoded || decoded.type !== 'sanctuaire_access' || !decoded.userId) {
      return res.status(401).json({ error: 'Token invalide pour le sanctuaire' });
    }

    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ error: 'Utilisateur introuvable' });
    }

    if (decoded.email && String(user.email || '').toLowerCase() !== String(decoded.email).toLowerCase()) {
      return res.status(401).json({ error: 'Token invalide pour le sanctuaire' });
    }

    req.user = user;
    req.auth = {
      emailVerified: decoded.email_verified === true,
      authMethod: decoded.auth_method || 'legacy_email',
    };
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token invalide' });
  }
}
