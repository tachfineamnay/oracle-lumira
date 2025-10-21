/**
 * Oracle Lumira - Composant "Gardien" d'Accès
 * 
 * Ce composant s'affiche à la place d'une fonctionnalité bloquée
 * pour informer l'utilisateur qu'un niveau supérieur est requis.
 * 
 * Utilisation :
 * ```tsx
 * {canAccess('oracle.viewHistory') ? (
 *   <HistoryComponent />
 * ) : (
 *   <AccessGate 
 *     feature="Histoire des tirages"
 *     requiredLevel={SanctuaryLevel.PROFOND}
 *   />
 * )}
 * ```
 * 
 * Créé le : 21 Octobre 2025
 * Statut : Prêt à l'emploi (non utilisé pour le moment)
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Lock, Sparkles, ArrowRight, Crown } from 'lucide-react';
import { SanctuaryLevel, LEVEL_NAMES, LEVEL_COLORS } from '../config/sanctuary-access';
import GlassCard from './ui/GlassCard';

// =================== TYPES ===================

export interface AccessGateProps {
  /** Nom de la fonctionnalité bloquée */
  feature: string;
  
  /** Niveau minimum requis */
  requiredLevel: SanctuaryLevel;
  
  /** Message personnalisé (optionnel) */
  customMessage?: string;
  
  /** Variante d'affichage */
  variant?: 'card' | 'inline' | 'modal';
  
  /** Taille du composant */
  size?: 'sm' | 'md' | 'lg';
  
  /** Callback lors du clic sur "Découvrir" */
  onDiscoverClick?: () => void;
}

// =================== COMPOSANT ===================

const AccessGate: React.FC<AccessGateProps> = ({
  feature,
  requiredLevel,
  customMessage,
  variant = 'card',
  size = 'md',
  onDiscoverClick
}) => {
  
  // Récupérer les couleurs du niveau requis
  const colors = LEVEL_COLORS[requiredLevel];
  const levelName = LEVEL_NAMES[requiredLevel];
  
  // Message par défaut
  const defaultMessage = `Cette fonctionnalité nécessite le ${levelName}`;
  const message = customMessage || defaultMessage;
  
  // Gestion du clic sur le bouton
  const handleDiscoverClick = () => {
    if (onDiscoverClick) {
      onDiscoverClick();
    } else {
      // TODO: Naviguer vers la page des niveaux d'abonnement
      console.log('Redirection vers /sanctuaire/levels');
    }
  };
  
  // Variantes de taille
  const sizeClasses = {
    sm: 'p-4 text-sm',
    md: 'p-6 text-base',
    lg: 'p-8 text-lg'
  };
  
  const iconSizes = {
    sm: 20,
    md: 24,
    lg: 32
  };
  
  // Animations
  const containerVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.3,
        ease: 'easeOut'
      }
    }
  };
  
  const lockVariants = {
    locked: { rotate: 0 },
    hover: {
      rotate: [0, -10, 10, -10, 0],
      transition: {
        duration: 0.5,
        ease: 'easeInOut'
      }
    }
  };
  
  const sparkleVariants = {
    initial: { opacity: 0, scale: 0 },
    animate: {
      opacity: [0, 1, 0],
      scale: [0, 1, 0],
      transition: {
        duration: 2,
        repeat: Infinity,
        repeatDelay: 1
      }
    }
  };
  
  // =================== RENDU INLINE ===================
  if (variant === 'inline') {
    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className={`flex items-center gap-3 ${sizeClasses[size]} rounded-lg border ${colors.border} bg-gradient-to-r ${colors.bg} backdrop-blur-sm`}
      >
        <Lock className={`${colors.text}`} size={iconSizes[size]} />
        <div className="flex-1">
          <p className={`${colors.text} font-medium`}>{feature}</p>
          <p className="text-white/60 text-xs mt-0.5">{message}</p>
        </div>
        <button
          onClick={handleDiscoverClick}
          className={`px-3 py-1.5 rounded-md bg-white/5 hover:bg-white/10 transition-colors ${colors.text} text-sm flex items-center gap-2`}
        >
          Débloquer
          <ArrowRight size={14} />
        </button>
      </motion.div>
    );
  }
  
  // =================== RENDU MODAL ===================
  if (variant === 'modal') {
    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={handleDiscoverClick}
      >
        <GlassCard
          variant="frost"
          onClick={(e) => e.stopPropagation()}
          className="max-w-md w-full"
        >
          <div className="text-center space-y-6">
            {/* Icône animée */}
            <motion.div
              className="relative inline-flex"
              initial="locked"
              whileHover="hover"
            >
              <motion.div variants={lockVariants}>
                <Lock className={`${colors.text}`} size={48} />
              </motion.div>
              
              {/* Sparkles */}
              <motion.div
                variants={sparkleVariants}
                initial="initial"
                animate="animate"
                className="absolute -top-2 -right-2"
              >
                <Sparkles className={`${colors.text}`} size={20} />
              </motion.div>
              <motion.div
                variants={sparkleVariants}
                initial="initial"
                animate="animate"
                style={{ animationDelay: '0.5s' }}
                className="absolute -bottom-2 -left-2"
              >
                <Sparkles className={`${colors.text}`} size={16} />
              </motion.div>
            </motion.div>
            
            {/* Titre */}
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">
                {feature}
              </h3>
              <p className="text-white/70">{message}</p>
            </div>
            
            {/* Badge niveau */}
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border ${colors.border} bg-gradient-to-r ${colors.bg}`}>
              <Crown className={colors.text} size={18} />
              <span className={`${colors.text} font-medium`}>{levelName}</span>
            </div>
            
            {/* Bouton */}
            <button
              onClick={handleDiscoverClick}
              className={`w-full px-6 py-3 rounded-lg bg-gradient-to-r ${colors.bg} hover:opacity-80 transition-opacity ${colors.text} font-medium flex items-center justify-center gap-2 border ${colors.border}`}
            >
              Découvrir les niveaux
              <ArrowRight size={18} />
            </button>
          </div>
        </GlassCard>
      </motion.div>
    );
  }
  
  // =================== RENDU CARD (par défaut) ===================
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <GlassCard variant="frost" className={sizeClasses[size]}>
        <div className="text-center space-y-4">
          {/* Icône animée */}
          <motion.div
            className="relative inline-flex mb-2"
            initial="locked"
            whileHover="hover"
          >
            <motion.div variants={lockVariants}>
              <Lock className={`${colors.text}`} size={iconSizes[size] * 1.5} />
            </motion.div>
            
            {/* Sparkles */}
            <motion.div
              variants={sparkleVariants}
              initial="initial"
              animate="animate"
              className="absolute -top-1 -right-1"
            >
              <Sparkles className={`${colors.text}`} size={16} />
            </motion.div>
          </motion.div>
          
          {/* Contenu */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-1">
              {feature}
            </h4>
            <p className="text-white/60 text-sm">{message}</p>
          </div>
          
          {/* Badge niveau */}
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${colors.border} bg-gradient-to-r ${colors.bg}`}>
            <Crown className={colors.text} size={14} />
            <span className={`${colors.text} text-sm font-medium`}>{levelName}</span>
          </div>
          
          {/* Bouton */}
          <button
            onClick={handleDiscoverClick}
            className={`w-full px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors ${colors.text} font-medium flex items-center justify-center gap-2 border border-white/10`}
          >
            Découvrir les niveaux
            <ArrowRight size={16} />
          </button>
        </div>
      </GlassCard>
    </motion.div>
  );
};

export default AccessGate;

/**
 * EXEMPLES D'UTILISATION :
 * 
 * // 1. Card par défaut (bloc complet)
 * <AccessGate 
 *   feature="Historique des tirages"
 *   requiredLevel={SanctuaryLevel.PROFOND}
 * />
 * 
 * // 2. Inline (petite bannière)
 * <AccessGate 
 *   feature="Synthèse PDF"
 *   requiredLevel={SanctuaryLevel.MYSTIQUE}
 *   variant="inline"
 *   size="sm"
 * />
 * 
 * // 3. Modal (popup)
 * {showModal && (
 *   <AccessGate 
 *     feature="Assistant IA"
 *     requiredLevel={SanctuaryLevel.INTEGRAL}
 *     variant="modal"
 *     onDiscoverClick={() => navigate('/sanctuaire/levels')}
 *   />
 * )}
 * 
 * // 4. Message personnalisé
 * <AccessGate 
 *   feature="Tirages illimités"
 *   requiredLevel={SanctuaryLevel.MYSTIQUE}
 *   customMessage="Passez au Niveau Mystique pour des tirages illimités et une réponse en 12h"
 *   size="lg"
 * />
 */
