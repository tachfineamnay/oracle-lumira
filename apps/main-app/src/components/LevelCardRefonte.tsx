import React from 'react';
import {
  Star,
  Sparkles,
  Crown,
  Music,
  Eye,
  Heart,
  Infinity as InfinityIcon,
  Zap,
  Check,
} from 'lucide-react';
import type { ProductWithUpload } from '../hooks/useProductsSimple';

interface LevelCardProps {
  level: ProductWithUpload;
  index: number;
}

const getLevelIcons = (levelId: ProductWithUpload['id']) => {
  switch (levelId) {
    case 'initie':
      return [Star, Sparkles] as const;
    case 'mystique':
      return [Crown, Music] as const;
    case 'profond':
      return [Eye, Heart] as const;
    case 'integrale':
      return [InfinityIcon, Zap] as const;
    default:
      return [Star, Sparkles] as const;
  }
};

const getLevelCTA = (levelId: ProductWithUpload['id']) => {
  switch (levelId) {
    case 'initie':
      return 'Ouvrir le premier Sceau';
    case 'mystique':
      return 'Passer le Deuxième Portail';
    case 'profond':
      return "Pénétrer l'Ordre Profond";
    case 'integrale':
      return "Activer l'Intelligence Cosmique";
    default:
      return 'Choisir cette offre';
  }
};

const LevelCardRefonte: React.FC<LevelCardProps> = ({ level }) => {
  const isRecommended = level.id === 'mystique';
  const isFree = level.price === 0;
  const isComingSoon = level.comingSoon || level.price === -1;

  const [Icon1, Icon2] = getLevelIcons(level.id);

  const containerClasses = [
    'relative flex flex-col h-full rounded-2xl overflow-hidden',
    'border transition-all duration-300',
    'bg-gradient-to-br from-cosmic-void/90 via-cosmic-void/80 to-cosmic-deep/60',
    'shadow-[0_10px_40px_rgba(0,0,0,0.5)]',
    'hover:border-cosmic-gold/40 hover:-translate-y-2 hover:shadow-[0_0_40px_rgba(255,215,0,0.25)]',
  ];

  if (isRecommended) {
    containerClasses.push(
      'border-2 border-cosmic-gold',
      'bg-gradient-to-br from-cosmic-void/95 via-purple-900/20 to-cosmic-gold/10',
      'shadow-[0_0_40px_rgba(255,215,0,0.4)]',
    );
  } else {
    containerClasses.push('border-white/10');
  }

  const priceLabel = isFree
    ? 'Gratuit'
    : isComingSoon
    ? 'Bientôt'
    : `${level.price}€`;

  const durationLabel = level.duration || 'Accès à vie';

  return (
    <div className={containerClasses.join(' ')}>
      {isRecommended && (
        <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-cosmic-gold via-yellow-300 to-cosmic-gold py-2 text-center">
          <span className="text-cosmic-void font-bold text-xs uppercase tracking-wider">
            LE PLUS POPULAIRE
          </span>
        </div>
      )}

      <div className={`flex flex-col flex-1 p-6 ${isRecommended ? 'pt-12' : 'pt-6'}`}>
        {/* Header */}
        <div className="mb-4 text-center">
          <div className="flex justify-center items-center gap-2 mb-3">
            <Icon1
              className={
                isRecommended
                  ? 'w-7 h-7 text-cosmic-gold'
                  : 'w-7 h-7 text-cosmic-ethereal'
              }
            />
            <Icon2
              className={
                isRecommended
                  ? 'w-7 h-7 text-cosmic-gold'
                  : 'w-7 h-7 text-cosmic-ethereal'
              }
            />
          </div>
          <h3
            className={
              isRecommended
                ? 'text-xl font-bold mb-1 text-cosmic-gold'
                : 'text-xl font-bold mb-1 text-cosmic-ethereal'
            }
          >
            {level.name || level.title}
          </h3>
          <p className="text-white/60 text-[11px] font-medium mb-2">
            {priceLabel} · {durationLabel}
          </p>
          {level.description && (
            <p className="text-white/70 text-xs leading-snug">
              {level.description}
            </p>
          )}
        </div>

        {/* Price badges */}
        <div className="mb-4 text-center">
          {!isComingSoon && (
            <p className="text-white/50 text-[10px] font-medium">
              {isFree ? 'Accès immédiat' : 'Paiement unique'}
            </p>
          )}

          {isFree && (
            <div className="inline-block mt-2 px-3 py-0.5 bg-green-500/20 border border-green-500/50 rounded-full">
              <span className="text-green-400 text-[10px] font-semibold">
                {level.badge || '100 premiers clients'}
              </span>
            </div>
          )}

          {isRecommended && !isFree && (
            <div className="inline-block mt-2 px-3 py-0.5 bg-green-500/20 border border-green-500/50 rounded-full">
              <span className="text-green-400 text-[10px] font-semibold">
                Meilleur rapport qualité/prix
              </span>
            </div>
          )}
        </div>

        {/* Features */}
        <ul className="space-y-2 mb-4 flex-1">
          {level.features.map((feature, idx) => (
            <li key={idx} className="flex items-start gap-2 text-white/80 text-xs">
              <Check className="w-3.5 h-3.5 mt-0.5 text-cosmic-gold flex-shrink-0" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>

        {/* CTA */}
        <div className="mt-auto">
          {isComingSoon ? (
            <div className="w-full py-3 rounded-xl text-center font-semibold text-sm bg-white/5 border border-white/10 text-white/40 cursor-not-allowed">
              Bientôt disponible
            </div>
          ) : (
            <a
              href={`/commande?product=${level.id}`}
              className={[
                'relative block w-full py-3 rounded-xl text-center font-semibold text-sm',
                'transition-all duration-300',
                isFree
                  ? 'bg-gradient-to-r from-green-500 via-green-400 to-green-500 text-white shadow-[0_0_20px_rgba(34,197,94,0.4)] hover:shadow-[0_0_30px_rgba(34,197,94,0.6)]'
                  : isRecommended
                  ? 'bg-gradient-to-r from-cosmic-gold via-yellow-400 to-cosmic-gold text-cosmic-void shadow-[0_0_20px_rgba(255,215,0,0.4)] hover:shadow-[0_0_30px_rgba(255,215,0,0.6)]'
                  : 'bg-white/5 border border-white/20 text-cosmic-ethereal hover:bg-white/10 hover:border-cosmic-ethereal/50',
              ].join(' ')}
            >
              {isFree ? (
                <span className="flex items-center justify-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Obtenir gratuitement
                  <Sparkles className="w-4 h-4" />
                </span>
              ) : (
                getLevelCTA(level.id)
              )}
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default LevelCardRefonte;
