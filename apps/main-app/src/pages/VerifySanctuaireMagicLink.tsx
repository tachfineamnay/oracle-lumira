import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2, CheckCircle2, AlertCircle, LogIn } from 'lucide-react';
import PageLayout from '../components/ui/PageLayout';
import GlassCard from '../components/ui/GlassCard';
import { useSanctuaire } from '../contexts/SanctuaireContext';

type VerifyState = 'verifying' | 'success' | 'error' | 'missing';

/**
 * /sanctuaire/verify?token=...
 *
 * Seule porte d'entrée d'une session Sanctuaire : le jeton reçu par email est
 * échangé contre une session côté serveur (usage unique, courte durée).
 */
const VerifySanctuaireMagicLink: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { verifyMagicLink } = useSanctuaire();

  const [state, setState] = useState<VerifyState>('verifying');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      setState('missing');
      setError("Ce lien de connexion est incomplet. Demandez un nouveau lien.");
      return;
    }

    let cancelled = false;

    const run = async () => {
      try {
        await verifyMagicLink(token);
        if (cancelled) return;
        setState('success');
        window.setTimeout(() => {
          try {
            navigate('/sanctuaire', { replace: true });
          } catch {
            window.location.href = '/sanctuaire';
          }
        }, 800);
      } catch (err) {
        if (cancelled) return;
        const message = err instanceof Error ? err.message : 'Lien de connexion invalide ou expiré.';
        setError(message);
        setState('error');
      }
    };

    run();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  return (
    <PageLayout variant="dark">
      <div className="min-h-screen flex items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-md w-full">
          <GlassCard className="p-8 text-center space-y-5">
            {state === 'verifying' && (
              <>
                <Loader2 className="w-12 h-12 text-amber-400 animate-spin mx-auto" />
                <h1 className="text-xl font-semibold text-white">Vérification de votre lien...</h1>
                <p className="text-sm text-white/60">Nous confirmons que cette adresse email vous appartient.</p>
              </>
            )}

            {state === 'success' && (
              <>
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                <h1 className="text-xl font-semibold text-white">Adresse email vérifiée</h1>
                <p className="text-sm text-white/60">Ouverture de votre Sanctuaire...</p>
              </>
            )}

            {(state === 'error' || state === 'missing') && (
              <>
                <AlertCircle className="w-12 h-12 text-red-400 mx-auto" />
                <h1 className="text-xl font-semibold text-white">Lien expiré ou déjà utilisé</h1>
                <p className="text-sm text-white/70" role="alert">
                  {error || 'Ce lien de connexion est invalide, expiré ou déjà utilisé.'}
                </p>
                <p className="text-xs text-white/50">
                  Chaque lien ne peut servir qu'une seule fois et expire rapidement (sécurité).
                </p>
                <button
                  onClick={() => navigate('/sanctuaire/login', { replace: true })}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-amber-400 text-mystical-900 font-semibold hover:bg-amber-300 transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                  Demander un nouveau lien
                </button>
              </>
            )}
          </GlassCard>
        </motion.div>
      </div>
    </PageLayout>
  );
};

export default VerifySanctuaireMagicLink;
