// Oracle Lumira - Sanctuaire auth client (magic link)
//
// Security contract enforced with the backend:
// - the client never receives a session from a payment, a client_secret or a promo code
// - a session is obtained only by redeeming a single-use magic link received by email
import { getApiBaseUrl } from '../lib/apiBase';

const TOKEN_KEY = 'sanctuaire_token';

export interface SanctuaireSessionUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  level?: number | null;
}

export interface SanctuaireSession {
  authenticated: boolean;
  emailVerified: boolean;
  user: SanctuaireSessionUser | null;
  products: string[];
  highestLevel: string | null;
  levelMetadata: { name: string; color: string; icon: string } | null;
  orderCount: number;
}

export interface MagicLinkRequestResult {
  success: boolean;
  message: string;
  expiresInMinutes: number;
  resendAfterSeconds: number;
}

export class SanctuaireAuthError extends Error {
  status: number;
  code?: string;

  constructor(status: number, message: string, code?: string) {
    super(message);
    this.name = 'SanctuaireAuthError';
    this.status = status;
    this.code = code;
  }
}

async function authRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredSanctuaireToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${getApiBaseUrl()}${endpoint}`, { ...options, headers });
  const payload = await response.json().catch(() => ({} as any));

  if (!response.ok) {
    throw new SanctuaireAuthError(
      response.status,
      payload?.error || payload?.message || `HTTP ${response.status}`,
      payload?.code
    );
  }

  return payload as T;
}

export function getStoredSanctuaireToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function storeSanctuaireToken(token: string): void {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {
    /* storage unavailable (private mode) */
  }
}

export function clearSanctuaireSession(): void {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* ignore */
  }
}

/** Step 1: ask for a verification email. Never returns a session. */
export async function requestSanctuaireMagicLink(email: string, orderId?: string): Promise<MagicLinkRequestResult> {
  return authRequest<MagicLinkRequestResult>('/users/auth/magic-link/request', {
    method: 'POST',
    body: JSON.stringify({ email, orderId }),
  });
}

/** Step 2: redeem the link token. This is the only way to obtain a session. */
export async function verifySanctuaireMagicLink(
  token: string
): Promise<{ token: string; user: SanctuaireSessionUser; products: string[]; highestLevel: string | null }> {
  const result = await authRequest<{
    success: boolean;
    token: string;
    user: SanctuaireSessionUser;
    products: string[];
    highestLevel: string | null;
  }>('/users/auth/magic-link/verify', {
    method: 'POST',
    body: JSON.stringify({ token }),
  });

  storeSanctuaireToken(result.token);
  return result;
}

export async function fetchSanctuaireSession(): Promise<SanctuaireSession> {
  return authRequest<SanctuaireSession>('/users/session', { method: 'GET' });
}

export interface OrderContext {
  orderId: string;
  productId?: string;
  status?: string;
  customer: { email: string; firstName: string; lastName: string; phone: string };
}

/** Authenticated post-purchase context (prefill of the onboarding form). */
export async function fetchOrderContext(orderId: string): Promise<OrderContext> {
  return authRequest<OrderContext>(
    `/users/session/order-context?orderId=${encodeURIComponent(orderId)}`,
    { method: 'GET' }
  );
}
