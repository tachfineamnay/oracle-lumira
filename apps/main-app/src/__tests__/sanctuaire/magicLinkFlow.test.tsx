/**
 * Frontend contract tests (P0) — "un paiement n'ouvre jamais une session".
 *
 * These assert the client-side half of the guarantee:
 *  - requesting a link never stores a token
 *  - a session is only created by redeeming the link token
 *  - the login page shows the "check your inbox" + resend UX
 *  - an expired/used link sends the user back to a fresh request
 *
 * The real SanctuaireProvider is used; only the HTTP-facing services are mocked,
 * so the wiring between context, pages and services is exercised too.
 */
import React, { act } from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

const requestMagicLink = vi.fn();
const verifyMagicLink = vi.fn();

vi.mock('../../services/sanctuaireAuth', () => ({
  requestSanctuaireMagicLink: (...args: any[]) => requestMagicLink(...args),
  verifySanctuaireMagicLink: (...args: any[]) => verifyMagicLink(...args),
  fetchSanctuaireSession: vi.fn(),
  fetchOrderContext: vi.fn(),
  getStoredSanctuaireToken: () => localStorage.getItem('sanctuaire_token'),
  storeSanctuaireToken: (token: string) => localStorage.setItem('sanctuaire_token', token),
  clearSanctuaireSession: () => localStorage.removeItem('sanctuaire_token'),
  SanctuaireAuthError: class SanctuaireAuthError extends Error {
    status = 0;
  },
}));

vi.mock('../../services/sanctuaire', () => ({
  sanctuaireService: {
    getStoredToken: () => localStorage.getItem('sanctuaire_token'),
    logout: () => localStorage.removeItem('sanctuaire_token'),
    requestMagicLink: (...args: any[]) => requestMagicLink(...args),
    verifyMagicLink: (...args: any[]) => verifyMagicLink(...args),
    getSession: vi.fn().mockResolvedValue(null),
    getUserCompletedOrders: vi.fn().mockResolvedValue({ orders: [], total: 0, user: null }),
    getSanctuaireStats: vi.fn().mockResolvedValue({}),
    getOrderContent: vi.fn(),
    downloadFile: vi.fn(),
  },
  SanctuaireUser: {},
}));

vi.mock('../../components/ui/PageLayout', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('../../components/ui/GlassCard', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

import { SanctuaireProvider } from '../../contexts/SanctuaireContext';
import LoginSanctuaireSimple from '../../pages/LoginSanctuaireSimple';
import VerifySanctuaireMagicLink from '../../pages/VerifySanctuaireMagicLink';

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <SanctuaireProvider>
        <Routes>
          <Route path="/sanctuaire/login" element={<LoginSanctuaireSimple />} />
          <Route path="/sanctuaire/verify" element={<VerifySanctuaireMagicLink />} />
          <Route path="/sanctuaire" element={<div>sanctuaire-home</div>} />
        </Routes>
      </SanctuaireProvider>
    </MemoryRouter>
  );
}

describe('Connexion Sanctuaire (magic link)', () => {
  beforeEach(() => {
    requestMagicLink.mockReset();
    verifyMagicLink.mockReset();
    localStorage.clear();
  });

  afterEach(() => {
    // React 18 + duplicated module instances: force the DOM back to a clean slate
    // so a stale tree can never answer a query (duplicate input ids).
    cleanup();
    document.body.innerHTML = '';
    vi.clearAllMocks();
  });

  it('demander un lien ne stocke AUCUN jeton de session', async () => {
    requestMagicLink.mockResolvedValue({
      success: true,
      message: 'Si cette adresse est associée à une commande, un lien vient d’être envoyé.',
      expiresInMinutes: 20,
      resendAfterSeconds: 60,
    });

    const user = userEvent.setup();
    renderAt('/sanctuaire/login?email=client@example.com');

    await user.click(screen.getByRole('button', { name: /recevoir mon lien de connexion/i }));

    await waitFor(() => expect(requestMagicLink).toHaveBeenCalled());

    // The verification screen is displayed...
    expect(await screen.findByText(/vérifiez votre boîte email/i)).toBeTruthy();
    // ...and no session token was written.
    expect(localStorage.getItem('sanctuaire_token')).toBeNull();
    expect(screen.queryByText('sanctuaire-home')).toBeNull();
  });

  it('affiche une erreur claire si l’envoi échoue et permet de réessayer', async () => {
    requestMagicLink.mockRejectedValueOnce(
      new Error("L'envoi de l'email de vérification est momentanément indisponible.")
    );

    const user = userEvent.setup();
    renderAt('/sanctuaire/login?email=client@example.com');

    await user.click(screen.getByRole('button', { name: /recevoir mon lien de connexion/i }));

    await waitFor(() => expect(screen.getByRole('alert')).toBeTruthy());
    expect(screen.getByRole('alert').textContent).toMatch(/indisponible/i);
    // Still on the request step: the user can retry immediately.
    expect(screen.getByRole('button', { name: /recevoir mon lien de connexion/i })).toBeTruthy();
    expect(localStorage.getItem('sanctuaire_token')).toBeNull();
  });

  it('le lien reçu ouvre la session et redirige vers le Sanctuaire', async () => {
    verifyMagicLink.mockResolvedValue({
      token: 'jwt-session',
      user: { id: 'u1', email: 'client@example.com', firstName: 'Cl', lastName: 'Ient', level: 2 },
    });

    renderAt('/sanctuaire/verify?token=abcdef0123456789');

    await waitFor(() => expect(verifyMagicLink).toHaveBeenCalledWith('abcdef0123456789'));
    expect(await screen.findByText(/adresse email vérifiée/i)).toBeTruthy();
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    });
    expect(await screen.findByText('sanctuaire-home')).toBeTruthy();
  });

  it('un lien invalide/expiré propose de demander un nouveau lien', async () => {
    verifyMagicLink.mockRejectedValue(
      new Error('Ce lien de connexion est invalide, expiré ou déjà utilisé.')
    );

    renderAt('/sanctuaire/verify?token=deadbeef');

    expect(await screen.findByText(/lien expiré ou déjà utilisé/i)).toBeTruthy();
    expect(screen.getByRole('button', { name: /demander un nouveau lien/i })).toBeTruthy();
    expect(screen.getByRole('alert').textContent).toMatch(/invalide, expiré ou déjà utilisé/i);
  });
});
