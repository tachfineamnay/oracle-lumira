import { MAGIC_LINK_TTL_MINUTES } from './magicLink';

/**
 * Oracle Lumira - Magic link delivery
 *
 * No transactional email provider is bundled with this API, so delivery is
 * pluggable through an HTTP endpoint (n8n workflow, transactional provider
 * proxy, ...). When no provider is configured:
 *  - development/test: the link is written to the server log (never in production)
 *  - production: delivery fails explicitly so the API can answer with a clear
 *    "verification email unavailable" message instead of pretending to work.
 */

export type MagicLinkChannel = 'webhook' | 'log' | 'unavailable';

export interface MagicLinkDeliveryResult {
  delivered: boolean;
  channel: MagicLinkChannel;
}

export function buildMagicLinkUrl(rawToken: string): string {
  const explicitBase = process.env.MAGIC_LINK_REDIRECT_URL;
  const frontend = process.env.FRONTEND_URL || 'http://localhost:5173';
  const base = (explicitBase || `${frontend.replace(/\/+$/, '')}/sanctuaire/verify`).trim();
  const separator = base.includes('?') ? '&' : '?';
  return `${base}${separator}token=${encodeURIComponent(rawToken)}`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function buildMagicLinkMessage(email: string, url: string): {
  subject: string;
  text: string;
  html: string;
} {
  const subject = 'Votre lien de connexion au Sanctuaire Oracle Lumira';
  const text = [
    'Bonjour,',
    '',
    'Vous avez demandé un lien de connexion sécurisé au Sanctuaire Oracle Lumira.',
    `Ouvrez ce lien pour confirmer que cette adresse email vous appartient : ${url}`,
    '',
    `Ce lien est valable ${MAGIC_LINK_TTL_MINUTES} minutes et ne peut être utilisé qu'une seule fois.`,
    "Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet email.",
  ].join('\n');

  const html = `<p>Bonjour,</p>
<p>Vous avez demandé un lien de connexion sécurisé au Sanctuaire Oracle Lumira.</p>
<p><a href="${escapeHtml(url)}">Confirmer mon adresse email et accéder au Sanctuaire</a></p>
<p>Ce lien est valable ${MAGIC_LINK_TTL_MINUTES} minutes et ne peut être utilisé qu'une seule fois.</p>
<p>Si vous n'êtes pas à l'origine de cette demande (adresse : ${escapeHtml(email)}), vous pouvez ignorer cet email.</p>`;

  return { subject, text, html };
}

export async function sendMagicLinkEmail(params: {
  email: string;
  url: string;
}): Promise<MagicLinkDeliveryResult> {
  const { email, url } = params;
  const message = buildMagicLinkMessage(email, url);
  const deliveryUrl = process.env.MAGIC_LINK_DELIVERY_URL;

  if (deliveryUrl) {
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (process.env.MAGIC_LINK_DELIVERY_TOKEN) {
        headers.Authorization = `Bearer ${process.env.MAGIC_LINK_DELIVERY_TOKEN}`;
      }

      const response = await fetch(deliveryUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          to: email,
          subject: message.subject,
          text: message.text,
          html: message.html,
          template: 'sanctuaire_magic_link',
        }),
      });

      if (!response.ok) {
        console.error('[magic-link] delivery endpoint rejected the message', {
          status: response.status,
        });
        return { delivered: false, channel: 'webhook' };
      }

      return { delivered: true, channel: 'webhook' };
    } catch (error) {
      console.error('[magic-link] delivery endpoint unreachable', {
        message: error instanceof Error ? error.message : 'unknown error',
      });
      return { delivered: false, channel: 'webhook' };
    }
  }

  // Development escape hatch: make the flow testable without an email provider.
  // Never enabled in production, and never logs the link outside local/dev runs.
  if (process.env.NODE_ENV !== 'production' && process.env.MAGIC_LINK_LOG_DELIVERY !== 'false') {
    console.log('[magic-link] (dev transport, no provider configured)', {
      to: email,
      url,
      expiresInMinutes: MAGIC_LINK_TTL_MINUTES,
    });
    return { delivered: true, channel: 'log' };
  }

  console.error('[magic-link] no delivery transport configured (MAGIC_LINK_DELIVERY_URL missing)');
  return { delivered: false, channel: 'unavailable' };
}
