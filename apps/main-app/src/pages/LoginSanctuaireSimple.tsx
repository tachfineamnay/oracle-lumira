import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, LogIn, Loader2, Star } from 'lucide-react';
import PageLayout from '../components/ui/PageLayout';
import GlassCard from '../components/ui/GlassCard';
import { useSanctuaire } from '../contexts/SanctuaireContext';

const LoginSanctuaireSimple: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { authenticateWithEmail } = useSanctuaire();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError('Veuillez saisir votre adresse email');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      await authenticateWithEmail(email.trim());
      navigate('/sanctuaire');
    } catch (err: unknown) {
      const error = err as { message?: string };
      setError(error?.message || 'Erreur de connexion. Vérifiez votre email.');
    } finally {
      setLoading(false);
    }
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
          {/* Logo/Icon */}
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

          {/* Formulaire de connexion */}
          <GlassCard className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label 
                  htmlFor="email" 
                  className="block text-sm font-medium text-white/80 mb-2"
                >
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
                    <span>Connexion...</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-5 h-5" />
                    <span>Accéder au Sanctuaire</span>
                  </>
                )}
              </button>
            </form>

            {/* Info complémentaire */}
            <div className="mt-6 pt-6 border-t border-white/10">
              <p className="text-center text-sm text-white/60">
                Utilisez l'adresse email de votre commande pour accéder à vos lectures
              </p>
            </div>
          </GlassCard>

          {/* Lien retour */}
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
