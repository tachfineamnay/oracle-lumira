// Oracle Lumira - Composant EmptyState unifié pour toutes les sections
import React from 'react';
import { motion } from 'framer-motion';
import GlassCard from './GlassCard';
import { PrimaryButton } from './Buttons';

export type EmptyStateType = 'spiritualPath' | 'draws' | 'synthesis' | 'conversations' | 'profile';

interface EmptyStateAction {
  label: string;
  onClick: () => void;
}

interface EmptyStateProps {
  type: EmptyStateType;
  title?: string;
  message?: string;
  action?: EmptyStateAction;
}

// SVG Mandala spirituel unifié
const MandalaIcon: React.FC<{ type: EmptyStateType }> = ({ type }) => {
  const getColor = () => {
    switch (type) {
      case 'spiritualPath': return 'text-amber-400';
      case 'draws': return 'text-purple-400';
      case 'synthesis': return 'text-blue-400';
      case 'conversations': return 'text-green-400';
      case 'profile': return 'text-pink-400';
      default: return 'text-amber-400';
    }
  };

  return (
    <motion.div
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
      className="flex justify-center mb-6"
    >
      <svg width="120" height="120" viewBox="0 0 120 120" className={`${getColor()}/40`}>
        {/* Cercles concentriques */}
        <motion.circle 
          cx="60" cy="60" r="50" 
          fill="none" stroke="currentColor" strokeWidth="1" opacity="0.3"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, delay: 0.2 }}
        />
        <motion.circle 
          cx="60" cy="60" r="35" 
          fill="none" stroke="currentColor" strokeWidth="1" opacity="0.5"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, delay: 0.4 }}
        />
        <motion.circle 
          cx="60" cy="60" r="20" 
          fill="none" stroke="currentColor" strokeWidth="1" opacity="0.7"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, delay: 0.6 }}
        />
        
        {/* Centre lumineux */}
        <motion.circle 
          cx="60" cy="60" r="5" 
          fill="currentColor" opacity="0.9"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        />
        
        {/* Rayons spirituels */}
        {[...Array(8)].map((_, i) => {
          const angle = (i / 8) * Math.PI * 2;
          const x1 = 60 + Math.cos(angle) * 20;
          const y1 = 60 + Math.sin(angle) * 20;
          const x2 = 60 + Math.cos(angle) * 35;
          const y2 = 60 + Math.sin(angle) * 35;
          return (
            <motion.line 
              key={i}
              x1={x1} y1={y1} x2={x2} y2={y2} 
              stroke="currentColor" strokeWidth="1" opacity="0.4"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.8, delay: 0.8 + i * 0.1 }}
            />
          );
        })}
        
        {/* Motifs géométriques */}
        {[...Array(4)].map((_, i) => {
          const angle = (i / 4) * Math.PI * 2;
          const x = 60 + Math.cos(angle) * 45;
          const y = 60 + Math.sin(angle) * 45;
          return (
            <motion.circle
              key={`outer-${i}`}
              cx={x} cy={y} r="3"
              fill="currentColor" opacity="0.6"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3, delay: 1.2 + i * 0.1 }}
            />
          );
        })}
      </svg>
    </motion.div>
  );
};

// Messages spirituels par défaut selon le type
const getDefaultContent = (type: EmptyStateType) => {
  switch (type) {
    case 'spiritualPath':
      return {
        title: "Votre Chemin Spirituel vous attend",
        message: "L'Oracle prépare votre parcours initiatique personnalisé. Chaque étape révélera une nouvelle facette de votre être intérieur."
      };
    case 'draws':
      return {
        title: "Vos Révélations vous attendent",
        message: "L'Oracle prépare vos tirages personnalisés. Chaque révélation vous guidera vers votre vérité intérieure et éclairera votre chemin."
      };
    case 'synthesis':
      return {
        title: "Votre Synthèse Spirituelle se forme",
        message: "Les insights cosmiques s'alignent pour créer votre carte personnalisée. Chaque catégorie révélera une dimension de votre essence."
      };
    case 'conversations':
      return {
        title: "L'Oracle attend vos Questions",
        message: "Votre dialogue spirituel peut commencer. Posez vos questions les plus profondes et recevez la guidance cosmique qui vous attend."
      };
    case 'profile':
      return {
        title: "Votre Essence Spirituelle",
        message: "Complétez votre profil pour que l'Oracle puisse vous guider avec précision sur votre chemin de lumière."
      };
    default:
      return {
        title: "Votre Sanctuaire vous attend",
        message: "L'Oracle prépare votre expérience spirituelle personnalisée. Laissez la magie opérer."
      };
  }
};

const EmptyState: React.FC<EmptyStateProps> = ({ 
  type, 
  title, 
  message, 
  action 
}) => {
  const defaultContent = getDefaultContent(type);
  const finalTitle = title || defaultContent.title;
  const finalMessage = message || defaultContent.message;

  return (
    <GlassCard className="p-8 text-center bg-gradient-to-br from-white/5 to-white/10 border-white/10">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="space-y-6"
      >
        <MandalaIcon type={type} />
        
        <div className="space-y-4">
          <motion.h3 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-xl font-playfair italic text-amber-400 mb-3"
          >
            {finalTitle}
          </motion.h3>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-white/70 leading-relaxed max-w-md mx-auto"
          >
            {finalMessage}
          </motion.p>
        </div>
        
        {action && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <PrimaryButton 
              onClick={action.onClick}
              className="bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-mystical-900 font-medium"
            >
              {action.label}
            </PrimaryButton>
          </motion.div>
        )}
      </motion.div>
    </GlassCard>
  );
};

export default EmptyState;