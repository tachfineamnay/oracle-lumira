import React from 'react';
import EmptyState from '../ui/EmptyState';
import { useNavigate } from 'react-router-dom';
import { useSanctuaire } from '../../contexts/SanctuaireContext';
import GlassCard from '../ui/GlassCard';
import { Loader2, Home, Award, Compass } from 'lucide-react';

type Props = {
  level?: 1 | 2 | 3 | 4;
  completed?: number;
  total?: number;
};

/**
 * SpiritualPath Component
 * 
 * Affiche le chemin spirituel de l'utilisateur.
 * 
 * NOTE: Ce composant était auparavant connecté à un endpoint /api/users/me
 * qui n'existe pas côté backend. L'implémentation complète du chemin spirituel
 * sera ajoutée dans une future version. Pour le moment, on affiche un état vide élégant.
 */
const SpiritualPath: React.FC<Props> = () => {
  const navigate = useNavigate();
  const { isLoading, user, profile, levelMetadata } = useSanctuaire();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-mystical-950 via-mystical-900 to-mystical-950">
        <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
      </div>
    );
  }

  const levelName = (levelMetadata?.name as string) || 'Initié';
  const levelColor = (levelMetadata?.color as string) || 'amber';

  return (
    <div className="min-h-screen bg-gradient-to-br from-mystical-950 via-mystical-900 to-mystical-950">
      {/* Sidebar minimal avec retour Sanctuaire */}
      <aside className="fixed left-0 top-0 h-screen w-56 bg-white/5 backdrop-blur-xl border-r border-white/10 z-40 hidden lg:block">
        <div className="p-6 border-b border-white/10">
          <button
            onClick={() => navigate('/sanctuaire')}
            className="flex items-center gap-3 text-white/80 hover:text-white transition-all group w-full"
          >
            <div className="p-2 bg-amber-400/10 rounded-lg group-hover:bg-amber-400/20 transition-all">
              <Home className="w-5 h-5 text-amber-400" />
            </div>
            <div className="text-left">
              <p className="text-sm font-medium">Retour au</p>
              <p className="text-xs text-white/60">Sanctuaire</p>
            </div>
          </button>
        </div>
        <div className="p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-gradient-to-br from-amber-400/20 to-purple-400/20 rounded-full">
              <Award className="w-5 h-5 text-amber-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-medium truncate">
                {user?.firstName || 'Client'} {user?.lastName || 'Oracle'}
              </p>
              <p className="text-xs text-white/60 truncate">{user?.email}</p>
            </div>
          </div>
          <div className={`flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-${levelColor}-400/10 to-purple-400/10 rounded-lg border border-${levelColor}-400/20`}>
            <Award className={`w-4 h-4 text-${levelColor}-400`} />
            <span className="text-sm text-white/80">{levelName}</span>
          </div>
        </div>
      </aside>

      {/* Contenu principal */}
      <div className="lg:ml-56 p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="text-center space-y-3">
            <div className="flex items-center justify-center gap-3">
              <Compass className={`w-6 h-6 text-${levelColor}-400`} />
              <h1 className="text-3xl font-bold text-white">Chemin Spirituel</h1>
            </div>
            <p className="text-white/60">
              Niveau actuel : <span className={`text-${levelColor}-400 font-medium`}>{levelName}</span>
            </p>
          </div>

          {/* Bannière "Bientôt disponible" + incitation profil */}
          <GlassCard className="p-6">
            {!profile?.profileCompleted ? (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-white">Complétez votre profil pour ouvrir la voie</h2>
                <p className="text-white/70">
                  Renseignez vos informations spirituelles (naissance, question, objectif). Votre parcours initiatique sera alors préparé.
                </p>
                <div>
                  <button
                    onClick={() => navigate('/sanctuaire/profile')}
                    className="px-4 py-2 bg-amber-400/20 hover:bg-amber-400/30 text-amber-400 border border-amber-400/30 rounded-lg transition-all"
                  >
                    Compléter mon profil
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-white">Bientôt disponible</h2>
                <p className="text-white/70">
                  L'Oracle harmonise votre parcours. La cartographie de votre chemin spirituel sera révélée prochainement.
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => navigate('/sanctuaire')}
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white/80 border border-white/10 rounded-lg transition-all"
                  >
                    Explorer le Sanctuaire
                  </button>
                </div>
              </div>
            )}
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default SpiritualPath;

