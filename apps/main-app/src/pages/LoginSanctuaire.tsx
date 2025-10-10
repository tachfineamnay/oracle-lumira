import React, { useState, useEffect } from 'react';
import PageLayout from '../components/ui/PageLayout';
import GlassCard from '../components/ui/GlassCard';
import { Mail, LogIn, Loader2, CheckCircle2 } from 'lucide-react';
import { sanctuaireService } from '../services/sanctuaire';
import { useNavigate } from 'react-router-dom';

const LoginSanctuaire: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const e = params.get('email');
    if (e) setEmail(e);
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      setLoading(true);
      await sanctuaireService.authenticateWithEmail(email.trim());
      setSuccess(true);
      navigate('/sanctuaire/draws');
    } catch (err: any) {
      setSuccess(false);
      setError(err?.message || 'Échec de connexion');
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
            Entrez l’adresse email utilisée lors de l’achat pour accéder à vos lectures.
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
            {error && <div className="text-sm text-red-400">{error}</div>}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg bg-amber-400 text-mystical-900 font-semibold hover:bg-amber-300 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
            {success && (
              <div className="flex items-center gap-2 text-green-400 text-sm justify-center">
                <CheckCircle2 className="w-4 h-4" /> Connecté
              </div>
            )}
          </form>
        </GlassCard>
      </div>
    </PageLayout>
  );
};

export default LoginSanctuaire;

