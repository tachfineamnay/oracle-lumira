import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, LogIn, Loader2, Star, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import PageLayout from '../components/ui/PageLayout';
import GlassCard from '../components/ui/GlassCard';
import { useSanctuaire } from '../contexts/SanctuaireContext';

type Step = 'request' | 'sent';

/**
 * Connexion Sanctuaire - deux étapes obligatoires.
 *
 * 1. saisie de l'email => envoi d'un lien à usage unique
 * 2. ouverture du lien => `/sanctuaire/verify?token=...` ouvre la session
 *
 * Le paiement ne donne jamais accès à lui seul : il faut prouver la possession
 * de la boîte email associée à la commande.
 */
const LoginSanctuaireSimple: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { requestMagicLink, isAuthenticated } = useSanctuaire();

  const [email, setEmail] = useState('');
  const [step, setStep] = useState<Step>('request');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [canResendAt, setCanResendAt] = useState<number | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [orderId, setOrderId] = useState<string | undefined>(undefined);

  useEffect(() => {
    const prefillEmail = searchParams.get('email');
    if (prefillEmail) setEmail(prefillEmail);
    const prefillOrder = searchParams.get('order_id') || searchParams.get('orderId');
    if (prefillOrder) setOrderId(prefillOrder);
  }, [searchParams]);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/sanctuaire', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (!canResendAt) {
      setRemainingSeconds(0);
      return;
    }
    const tick = () => {
      const left = Math.max(0, Math.ceil((canResendAt - Date.now()) / 1000));
      setRemainingSeconds(left);
    };
    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [canResendAt]);

  const sendLink = async () => {
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Veuillez saisir une adresse email valide');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const result = await requestMagicLink(email.trim(), orderId);
      setStep('sent');
      setNotice(result.message);
      setCanResendAt(Date.now() + Math.max(1, result.resendAfterSeconds || 0) * 1000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "L'envoi de l'email de vérification a échoué.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await sendLink();
  };

  const handleResend = async () => {
    if (remainingSeconds > 0) return;
    await sendLink();
  };

  return (
    <PageLayout variant="dark">
      <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-md w-full"
        >
          <div className="text-center mb-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="w-20 h-20 bg-gradient-to-br from-amber-400/30 to-purple-400/20 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <Star className="w-10 h-10 text-amber-400" />
            </motion.div>
            <h1 className="text-3xl font-playfair italic text-amber-400 mb-2">
              Sanctuaire Oracle
            </h1>
            <p className="text-white/70">
              Accédez à vos lectures spirituelles personnalisées
            </p>
          </div>

          <GlassCard className="p-8">
            {step === 'request' ? (
              <form onSubmit={handleSubmit} className="space-y-6" data-testid="magic-link-request-form">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-white/80 mb-2">
                    Adresse email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="votre@email.com"
                      className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:border-amber-400/50 focus:outline-none focus:ring-2 focus:ring-amber-400/20 transition-all"
                      disabled={loading}
                      autoComplete="email"
                      autoFocus
                    />
                  </div>
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-red-400/10 border border-red-400/20 rounded-lg"
                    role="alert"
                  >
                    <p className="text-red-400 text-sm">{error}</p>
                  </motion.div>
                )}

                <button
                  type="submit"
                  disabled={loading || !email.trim()}
                  className={`w-full flex items-center justify-center gap-3 py-3 px-4 rounded-lg font-medium transition-all ${
                    loading || !email.trim()
                      ? 'bg-white/10 text-white/40 cursor-not-allowed'
                      : 'bg-gradient-to-r from-amber-400 to-amber-500 text-mystical-900 hover:from-amber-500 hover:to-amber-600 shadow-lg hover:shadow-xl'
                  }`}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Envoi du lien...</span>
                    </>
                  ) : (
                    <>
                      <LogIn className="w-5 h-5" />
                      <span>Recevoir mon lien de connexion</span>
                    </>
                  )}
                </button>
              </form>
            ) : (
              <div className="space-y-5" data-testid="magic-link-sent">
                <div className="flex items-start gap-3 p-4 bg-emerald-400/10 border border-emerald-400/20 rounded-lg">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-emerald-100 font-medium">
                      Vérifiez votre boîte email
                    </p>
                    <p className="text-xs text-emerald-100/80 mt-1">
                      Un lien de connexion vient d'être envoyé à <strong>{email.trim()}</strong>.
                      Il est valable quelques minutes et ne peut être utilisé qu'une seule fois.
                    </p>
                  </div>
                </div>

                {notice && <p className="text-xs text-white/60">{notice}</p>}

                <div className="flex items-start gap-3 p-4 bg-white/5 border border-white/10 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-amber-300 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-white/70">
                    Aucun email reçu ? Vérifiez vos spams, puis demandez un nouveau lien.
                    Le lien doit être ouvert sur le même navigateur que celui utilisé pour le paiement.
                  </p>
                </div>

                {error && (
                  <div className="p-3 bg-red-400/10 border border-red-400/20 rounded-lg" role="alert">
                    <p className="text-red-400 text-sm">{error}</p>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleResend}
                  disabled={loading || remainingSeconds > 0}
                  className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-all ${
                    loading || remainingSeconds > 0
                      ? 'bg-white/10 text-white/40 cursor-not-allowed'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                  {remainingSeconds > 0
                    ? `Renvoyer le lien dans ${remainingSeconds}s`
                    : 'Renvoyer le lien de connexion'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setStep('request');
                    setError(null);
                    setNotice(null);
                  }}
                  className="w-full text-sm text-white/60 hover:text-white/80 transition-colors"
                >
                  Utiliser une autre adresse email
                </button>
              </div>
            )}

            <div className="mt-6 pt-6 border-t border-white/10">
              <p className="text-center text-sm text-white/60">
                Utilisez l'adresse email de votre commande : un lien de vérification vous sera envoyé pour confirmer qu'elle vous appartient.
              </p>
            </div>
          </GlassCard>

          <div className="text-center mt-8">
            <button
              onClick={() => navigate('/')}
              className="text-white/60 hover:text-white/80 transition-colors text-sm"
            >
              ← Retour à l'accueil
            </button>
          </div>
        </motion.div>
      </div>
    </PageLayout>
  );
};

export default LoginSanctuaireSimple;
