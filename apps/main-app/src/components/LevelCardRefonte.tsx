import React from 'react';
import { motion } from 'framer-motion';
import { Star, Sparkles, Crown, Music, Eye, Heart, Infinity, Zap, Check } from 'lucide-react';
import type { ProductWithUpload } from '../hooks/useProductsSimple';

interface LevelCardProps {
  level: ProductWithUpload;
  index: number;
}

/**
 * LevelCardRefonte - Carte de tarif avec hiérarchie visuelle améliorée
 * 
 * CHANGEMENTS vs version originale :
 * ✅ Offre Mystique (level 2) 10% plus grande avec bordure dorée
 * ✅ Icônes thématiques par niveau (Star, Crown, Eye, Infinity)
 * ✅ Contraste optimisé (text-white/90 au lieu de text-cosmic-ethereal)
 * ✅ Badge "LE PLUS POPULAIRE" agrandi et plus visible
 * ✅ Box-shadow cosmic pour profondeur
 */
const LevelCardRefonte: React.FC<LevelCardProps> = ({ level, index }) => {
  // Déterminer si c'est l'offre recommandée (Mystique = level 2)
  const isRecommended = level.recommended || level.id === 2;

  // Mapping des icônes par niveau
  const getLevelIcons = (levelId: number) => {
    switch (levelId) {
      case 1: // Initié
        return [Star, Sparkles];
      case 2: // Mystique
        return [Crown, Music];
      case 3: // Profond
        return [Eye, Heart];
      case 4: // Intégrale
        return [Infinity, Zap];
      default:
        return [Star, Sparkles];
    }
  };

  const [Icon1, Icon2] = getLevelIcons(level.id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      whileHover={{ y: -8, transition: { duration: 0.3 } }}
      className={`relative flex flex-col h-full rounded-3xl overflow-hidden transition-all duration-300 ${
        isRecommended 
          ? 'scale-100 sm:scale-105 border-2 border-cosmic-gold/80 shadow-stellar bg-gradient-to-b from-cosmic-void/95 via-cosmic-void to-cosmic-deep' 
          : 'border border-cosmic-ethereal/20 shadow-cosmic bg-cosmic-void/80 backdrop-blur-sm'
      }`}
    >
      {/* Badge recommandé - REFONTE : Plus imposant */}
      {isRecommended && (
        <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-cosmic-gold via-cosmic-aurora to-cosmic-gold py-3 text-center z-10">
          <span className="text-cosmic-void font-bold text-sm uppercase tracking-wider">
            ⭐ LE PLUS POPULAIRE ⭐
          </span>
        </div>
      )}

      {/* Contenu de la carte */}
      <div className={`flex flex-col flex-1 p-8 ${isRecommended ? 'pt-16' : 'pt-8'}`}>
        {/* Header avec icônes */}
        <div className="mb-6 text-center">
          <div className="flex justify-center items-center gap-3 mb-4">
            <Icon1 className={`w-8 h-8 ${isRecommended ? 'text-cosmic-gold' : 'text-cosmic-ethereal'}`} />
            <Icon2 className={`w-8 h-8 ${isRecommended ? 'text-cosmic-gold' : 'text-cosmic-ethereal'}`} />
          </div>
          
          <h3 className={`text-3xl font-bold mb-2 ${
            isRecommended ? 'text-cosmic-gold' : 'text-cosmic-ethereal'
          }`}>
            {level.name}
          </h3>
          
          <p className="text-white/80 text-sm mb-4">{level.description}</p>
        </div>

        {/* Prix - REFONTE : Taille augmentée pour offre recommandée */}
        <div className="mb-8 text-center">
          <div className="flex items-baseline justify-center gap-2">
            <span className={`font-bold ${
              isRecommended ? 'text-6xl text-cosmic-gold' : 'text-5xl text-white'
            }`}>
              {level.price}€
            </span>
          </div>
          <p className="text-white/60 text-sm mt-2">Paiement unique</p>
        </div>

        {/* Liste des fonctionnalités - REFONTE : Contraste amélioré */}
        <ul className="space-y-4 mb-8 flex-1">
          {level.features.map((feature, idx) => (
            <li key={idx} className="flex items-start gap-3">
              <Check className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                isRecommended ? 'text-cosmic-gold' : 'text-cosmic-ethereal'
              }`} />
              <span className="text-white/90 text-sm leading-relaxed">{feature}</span>
            </li>
          ))}
        </ul>

        {/* CTA Button */}
        <a
          href={`/commande?level=${level.id}`}
          className={`block w-full py-4 rounded-xl text-center font-semibold transition-all duration-300 ${
            isRecommended
              ? 'bg-gradient-to-r from-cosmic-gold to-cosmic-aurora text-cosmic-void hover:shadow-stellar hover:scale-105'
              : 'bg-cosmic-ethereal/10 border border-cosmic-ethereal/30 text-cosmic-ethereal hover:bg-cosmic-ethereal/20 hover:border-cosmic-ethereal/50'
          }`}
        >
          {isRecommended ? '✨ Choisir cette offre ✨' : 'Choisir cette offre'}
        </a>
      </div>

      {/* Effet de lueur pour l'offre recommandée */}
      {isRecommended && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-t from-cosmic-gold/10 via-transparent to-transparent opacity-50"></div>
        </div>
      )}
    </motion.div>
  );
};

export default LevelCardRefonte;
