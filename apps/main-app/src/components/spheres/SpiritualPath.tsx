import React from 'react';
import EmptyState from '../ui/EmptyState';
import { useNavigate } from 'react-router-dom';
import { useSanctuaire } from '../../contexts/SanctuaireContext';

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
  const { isLoading } = useSanctuaire();

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(2)].map((_, i) => (
          <div
            key={i}
            className="p-6 bg-gradient-to-br from-white/5 to-white/10 border border-white/10 rounded-lg"
          >
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-400/20 to-amber-500/10 rounded-full animate-pulse" />
              <div className="space-y-3 flex-1">
                <div className="h-5 bg-amber-400/20 rounded-full animate-pulse w-3/4" />
                <div className="h-3 bg-white/10 rounded-full animate-pulse w-1/2" />
                <div className="h-3 bg-white/10 rounded-full animate-pulse w-2/3" />
              </div>
              <div className="w-20 h-8 bg-amber-400/20 rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // NOTE: Le chemin spirituel n'est pas encore implémenté côté backend
  // Affichons un état vide élégant en attendant
  return (
    <EmptyState 
      type="spiritualPath"
      title="Votre Chemin Spirituel"
      message="L'Oracle prépare vos enseignements personnalisés. Votre parcours initiatique sera bientôt dévoilé."
      action={{
        label: "Explorer le Sanctuaire",
        onClick: () => navigate('/sanctuaire')
      }}
    />
  );
};

export default SpiritualPath;

