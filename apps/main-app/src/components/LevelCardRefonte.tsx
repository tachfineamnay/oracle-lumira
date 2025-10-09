import React from 'react';
import { motion } from 'framer-motion';
import { 
  Star, 
  Sparkles, 
  Crown, 
  Music, 
  Eye, 
  Heart, 
  Infinity as InfinityIcon, 
  Zap, 
  Check 
} from 'lucide-react';
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
  const isRecommended = level.id === '2' || level.id === 2;

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
        return [InfinityIcon, Zap];
      default:
        return [Star, Sparkles];
    }
  };

  const [Icon1, Icon2] = getLevelIcons(parseInt(level.id as string));

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      whileHover={{ 
        y: -12, 
        scale: 1.02,
        transition: { duration: 0.3, type: "spring", stiffness: 300 } 
      }}
      className={`relative flex flex-col h-full rounded-3xl overflow-hidden transition-all duration-500 group ${
        isRecommended 
          ? 'scale-100 sm:scale-105 border-2 border-cosmic-gold shadow-[0_0_40px_rgba(255,215,0,0.4)] bg-gradient-to-br from-cosmic-void/95 via-purple-900/20 to-cosmic-gold/10' 
          : 'border border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.5)] bg-gradient-to-br from-cosmic-void/90 via-cosmic-void/80 to-cosmic-deep/60 backdrop-blur-sm hover:border-cosmic-gold/40'
      }`}
    >
      {/* Badge recommandé - REFONTE : Plus imposant avec animation */}
      {isRecommended && (
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
          className="absolute top-0 left-0 right-0 z-10"
        >
          <div className="relative overflow-hidden">
            <motion.div
              animate={{ 
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
              }}
              transition={{ 
                duration: 3, 
                repeat: Infinity, 
                ease: "linear" 
              }}
              className="bg-gradient-to-r from-cosmic-gold via-yellow-300 via-cosmic-gold to-yellow-300 bg-[length:200%_100%] py-3 text-center"
            >
              <span className="text-cosmic-void font-bold text-sm uppercase tracking-wider drop-shadow-md">
                ⭐ LE PLUS POPULAIRE ⭐
              </span>
            </motion.div>
            {/* Sparkles effect */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 bg-white rounded-full"
                  style={{
                    left: `${20 + i * 30}%`,
                    top: '50%',
                  }}
                  animate={{
                    opacity: [0, 1, 0],
                    scale: [0, 1.5, 0],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.5,
                  }}
                />
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Animated gradient overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <motion.div
          className={`absolute inset-0 ${
            isRecommended 
              ? 'bg-gradient-to-br from-cosmic-gold/10 via-transparent to-purple-500/10' 
              : 'bg-gradient-to-br from-cosmic-ethereal/5 via-transparent to-cosmic-aurora/5'
          }`}
          animate={{
            backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </div>

      {/* Contenu de la carte */}
      <div className={`flex flex-col flex-1 p-8 ${isRecommended ? 'pt-16' : 'pt-8'}`}>
        {/* Header avec icônes - Amélioré avec animations */}
        <div className="mb-6 text-center relative">
          <motion.div 
            className="flex justify-center items-center gap-3 mb-4"
            whileHover={{ scale: 1.1 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <motion.div
              animate={{ 
                rotate: [0, 5, -5, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                duration: 3, 
                repeat: Infinity,
                repeatDelay: 2 
              }}
            >
              <Icon1 className={`w-10 h-10 ${
                isRecommended 
                  ? 'text-cosmic-gold drop-shadow-[0_0_8px_rgba(255,215,0,0.6)]' 
                  : 'text-cosmic-ethereal'
              }`} />
            </motion.div>
            <motion.div
              animate={{ 
                rotate: [0, -5, 5, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                duration: 3, 
                repeat: Infinity,
                repeatDelay: 2,
                delay: 0.5
              }}
            >
              <Icon2 className={`w-10 h-10 ${
                isRecommended 
                  ? 'text-cosmic-gold drop-shadow-[0_0_8px_rgba(255,215,0,0.6)]' 
                  : 'text-cosmic-ethereal'
              }`} />
            </motion.div>
          </motion.div>
          
          <motion.h3 
            className={`text-3xl font-bold mb-3 ${
              isRecommended 
                ? 'text-cosmic-gold drop-shadow-[0_0_10px_rgba(255,215,0,0.5)]' 
                : 'text-cosmic-ethereal'
            }`}
            whileHover={{ scale: 1.05 }}
          >
            {level.name}
          </motion.h3>
          
          <p className="text-white/80 text-sm mb-4 px-2">{level.description}</p>
          
          {/* Decorative line */}
          <motion.div
            className={`h-px w-24 mx-auto ${
              isRecommended 
                ? 'bg-gradient-to-r from-transparent via-cosmic-gold to-transparent' 
                : 'bg-gradient-to-r from-transparent via-cosmic-ethereal/50 to-transparent'
            }`}
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          />
        </div>

        {/* Prix - REFONTE : Taille augmentée + effet brillant */}
        <div className="mb-8 text-center relative">
          <motion.div 
            className="flex items-baseline justify-center gap-2"
            whileHover={{ scale: 1.08 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <span className={`font-bold relative ${
              isRecommended 
                ? 'text-7xl text-cosmic-gold' 
                : 'text-6xl text-white'
            }`}>
              {level.price}€
              {/* Shine effect pour offre recommandée */}
              {isRecommended && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                  animate={{
                    x: ['-100%', '200%'],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatDelay: 3,
                  }}
                  style={{ clipPath: 'inset(0)' }}
                />
              )}
            </span>
          </motion.div>
          <p className="text-white/60 text-sm mt-2 font-medium">Paiement unique</p>
          
          {/* Économie badge pour offre premium */}
          {isRecommended && (
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
              className="inline-block mt-3 px-4 py-1 bg-green-500/20 border border-green-500/50 rounded-full"
            >
              <span className="text-green-400 text-xs font-semibold">🎁 Meilleur rapport qualité/prix</span>
            </motion.div>
          )}
        </div>

        {/* Liste des fonctionnalités - REFONTE : Animations d'apparition */}
        <ul className="space-y-4 mb-8 flex-1">
          {level.features.map((feature, idx) => (
            <motion.li 
              key={idx} 
              className="flex items-start gap-3"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.4 }}
              whileHover={{ x: 5, transition: { duration: 0.2 } }}
            >
              <motion.div
                whileHover={{ rotate: 360, scale: 1.2 }}
                transition={{ duration: 0.5 }}
              >
                <Check className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                  isRecommended ? 'text-cosmic-gold' : 'text-cosmic-ethereal'
                }`} />
              </motion.div>
              <span className="text-white/90 text-sm leading-relaxed group-hover:text-white transition-colors">
                {feature}
              </span>
            </motion.li>
          ))}
        </ul>

        {/* CTA Button - Amélioré avec effet pulse */}
        <motion.a
          href={`/commande?level=${level.id}`}
          className={`relative block w-full py-4 rounded-xl text-center font-semibold transition-all duration-300 overflow-hidden group/btn ${
            isRecommended
              ? 'bg-gradient-to-r from-cosmic-gold via-yellow-400 to-cosmic-gold bg-[length:200%_100%] text-cosmic-void shadow-[0_0_20px_rgba(255,215,0,0.4)]'
              : 'bg-white/5 border border-white/20 text-cosmic-ethereal hover:bg-white/10 hover:border-cosmic-ethereal/50'
          }`}
          whileHover={{ 
            scale: 1.05,
            boxShadow: isRecommended 
              ? '0 0 30px rgba(255,215,0,0.6)' 
              : '0 0 20px rgba(139,123,216,0.3)'
          }}
          whileTap={{ scale: 0.98 }}
          animate={isRecommended ? {
            backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
          } : {}}
          transition={isRecommended ? {
            backgroundPosition: {
              duration: 3,
              repeat: Infinity,
              ease: "linear"
            }
          } : {}}
        >
          {/* Ripple effect on hover */}
          <motion.div
            className="absolute inset-0 bg-white/20"
            initial={{ scale: 0, opacity: 0.5 }}
            whileHover={{ 
              scale: 2, 
              opacity: 0,
              transition: { duration: 0.6 }
            }}
            style={{ borderRadius: '50%' }}
          />
          
          <span className="relative z-10 flex items-center justify-center gap-2">
            {isRecommended ? (
              <>
                <Sparkles className="w-5 h-5" />
                Choisir cette offre
                <Sparkles className="w-5 h-5" />
              </>
            ) : (
              'Choisir cette offre'
            )}
          </span>
        </motion.a>
      </div>

      {/* Effet de lueur animé pour l'offre recommandée */}
      {isRecommended && (
        <>
          <div className="absolute inset-0 pointer-events-none">
            <motion.div 
              className="absolute inset-0 bg-gradient-to-t from-cosmic-gold/10 via-transparent to-transparent"
              animate={{
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </div>
          
          {/* Particules flottantes */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-cosmic-gold/60 rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  bottom: '0%',
                }}
                animate={{
                  y: [-20, -400],
                  x: [0, (Math.random() - 0.5) * 100],
                  opacity: [0, 1, 0],
                  scale: [0, 1.5, 0],
                }}
                transition={{
                  duration: 4 + Math.random() * 2,
                  repeat: Infinity,
                  delay: i * 0.8,
                  ease: "easeOut"
                }}
              />
            ))}
          </div>
        </>
      )}
    </motion.div>
  );
};

export default LevelCardRefonte;
