import React from 'react';
import EmptyState from '../ui/EmptyState';
import { useNavigate } from 'react-router-dom';
import { useSanctuaire } from '../../contexts/SanctuaireContext';
import GlassCard from '../ui/GlassCard';
import { Loader2, Compass } from 'lucide-react';

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
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
      </div>
    );
  }

  const levelColor = (levelMetadata?.color as string) || 'amber';
  const levelName = (levelMetadata?.name as string) || 'Initié';

  return (
    <div className="space-y-6">
      {/* Contenu principal */}
      <div className="p-4 sm:p-6 lg:p-8">
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

