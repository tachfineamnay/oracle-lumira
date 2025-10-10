import React, { useState, useEffect } from 'react';
import { Mail, LogIn, CheckCircle2, Loader2 } from 'lucide-react';
import { sanctuaireService } from '../../services/sanctuaire';
import { useNavigate } from 'react-router-dom';

const ExistingClientLoginBar: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const e = params.get('email');
    if (e) setEmail(e);
  }, []);

  if (sanctuaireService.isAuthenticated()) return null;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return;
    try {
      setLoading(true);
      await sanctuaireService.authenticateWithEmail(email.trim());
      setSuccess(true);
      // Rediriger directement vers les lectures disponibles
      navigate('/sanctuaire/draws');
    } catch (err) {
      setSuccess(false);
      // Fallback: rester sur place, l'UI affiche l'erreur minimale via disabled states
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-4">
      <div className="bg-white/5 border border-white/10 rounded-xl p-3">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center gap-2 text-white/80">
            <LogIn className="w-4 h-4" />
            <span className="text-sm">Déjà client ? Retrouver mes lectures</span>
          </div>
          <form onSubmit={onSubmit} className="flex-1 flex items-center gap-2">
            <div className="relative flex-1">
              <Mail className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Votre email"
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-white/10 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-amber-400"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-3 py-2 rounded-lg bg-amber-400 text-mystical-900 font-medium hover:bg-amber-300 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Se connecter'}
            </button>
            {success && (
              <span className="flex items-center gap-1 text-green-400 text-sm">
                <CheckCircle2 className="w-4 h-4" /> OK
              </span>
            )}
          </form>
          <button
            onClick={() => navigate('/login')}
            className="text-xs text-white/60 hover:text-white"
          >
            Page de connexion
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExistingClientLoginBar;

