import React, { useState, useEffect } from 'react';
import PageLayout from '../components/ui/PageLayout';
import GlassCard from '../components/ui/GlassCard';
import { Mail, LogIn, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { requestSanctuaireMagicLink } from '../services/sanctuaireAuth';

/**
 * Connexion Sanctuaire (route /login).
 *
 * L'email saisi ne connecte plus: il déclenche l'envoi d'un lien de vérification
 * à usage unique. La session n'est ouverte qu'après ouverture de ce lien
 * (/sanctuaire/verify?token=...).
 */
const LoginSanctuaire: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [canResendAt, setCanResendAt] = useState<number | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState(0);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const e = params.get('email');
    if (e) setEmail(e);
  }, []);

  useEffect(() => {
    if (!canResendAt) {
      setRemainingSeconds(0);
      return;
    }
    const tick = () => setRemainingSeconds(Math.max(0, Math.ceil((canResendAt - Date.now()) / 1000)));
    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [canResendAt]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Veuillez saisir une adresse email valide');
      return;
    }

    try {
      setLoading(true);
      const result = await requestSanctuaireMagicLink(email.trim());
      setSent(true);
      setCanResendAt(Date.now() + Math.max(1, result.resendAfterSeconds || 0) * 1000);
    } catch (err: any) {
      setSent(false);
      setError(err?.message || "L'envoi de l'email de vérification a échoué");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageLayout variant="dark">
      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <GlassCard className="p-6 bg-white/5 border-white/10">
          <div className="flex items-center gap-2 mb-4">
            <LogIn className="w-5 h-5 text-amber-400" />
            <h1 className="text-xl font-semibold">Connexion Sanctuaire</h1>
          </div>
          <p className="text-sm text-white/70 mb-6">
            Entrez l'adresse email utilisée lors de l'achat : un lien de vérification à usage unique vous sera envoyé.
            Il confirme que cette adresse vous appartient avant d'ouvrir votre Sanctuaire.
          </p>

          <form onSubmit={onSubmit} className="space-y-4">
            <div className="relative">
              <Mail className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre@email.com"
                className="w-full pl-9 pr-3 py-3 rounded-lg bg-white/10 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-amber-400"
                required
              />
            </div>

            {error && (
              <div className="flex items-start gap-2 text-sm text-red-400" role="alert">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || remainingSeconds > 0}
              className="w-full py-3 rounded-lg bg-amber-400 text-mystical-900 font-semibold hover:bg-amber-300 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
              {loading
                ? 'Envoi...'
                : remainingSeconds > 0
                  ? `Renvoyer le lien dans ${remainingSeconds}s`
                  : 'Recevoir mon lien de connexion'}
            </button>

            {sent && (
              <div className="flex items-start gap-2 text-emerald-400 text-sm" role="status">
                <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>
                  Lien envoyé. Ouvrez l'email reçu à l'adresse {email.trim()} pour accéder au Sanctuaire.
                  Pensez à vérifier vos spams.
                </span>
              </div>
            )}
          </form>

          <div className="mt-5 pt-5 border-t border-white/10">
            <button
              onClick={() => navigate('/sanctuaire/login')}
              className="text-sm text-white/60 hover:text-white/80 transition-colors"
            >
              Ouvrir la page de connexion du Sanctuaire →
            </button>
          </div>
        </GlassCard>
      </div>
    </PageLayout>
  );
};

export default LoginSanctuaire;
