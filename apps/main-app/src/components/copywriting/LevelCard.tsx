import React from 'react';
import { motion } from 'framer-motion';
import { Crown, Star, Sparkles, Check } from 'lucide-react';
import { PrimaryButton, SecondaryButton } from '../ui/Buttons';
import GlassCard from '../ui/GlassCard';

export interface LevelCardProps {
  level: 1 | 2 | 3 | 4;
  title: string;
  price: string;
  duration: string;
  features: string[];
  ctaLabel: string;
  color?: 'amber' | 'emerald' | 'purple' | 'gold';
  popular?: boolean;
  onSelect?: () => void;
  className?: string;
}

const LevelCard: React.FC<LevelCardProps> = ({
  level,
  title,
  price,
  duration,
  features,
  ctaLabel,
  color = 'amber',
  popular = false,
  onSelect,
  className = ''
}) => {
  const colorVariants = {
    amber: {
      accent: 'text-amber-400',
      gradient: 'from-amber-400 to-amber-500',
      border: 'border-amber-400/30',
      glow: 'shadow-amber-400/20',
      bg: 'bg-amber-400/10'
    },
    emerald: {
      accent: 'text-emerald-400', 
      gradient: 'from-emerald-400 to-emerald-500',
      border: 'border-emerald-400/30',
      glow: 'shadow-emerald-400/20',
      bg: 'bg-emerald-400/10'
    },
    purple: {
      accent: 'text-mystical-400',
      gradient: 'from-mystical-400 to-mystical-500', 
      border: 'border-mystical-400/30',
      glow: 'shadow-mystical-400/20',
      bg: 'bg-mystical-400/10'
    },
    gold: {
      accent: 'text-yellow-400',
      gradient: 'from-yellow-400 to-yellow-500',
      border: 'border-yellow-400/30', 
      glow: 'shadow-yellow-400/20',
      bg: 'bg-yellow-400/10'
    }
  };

  const variant = colorVariants[color];
  const isHighTier = level >= 3;

  const LevelIcon = level === 4 ? Crown : level === 3 ? Sparkles : Star;

  return (
    <motion.div
      className={`relative ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: level * 0.1 }}
      whileHover={{ y: -8 }}
    >
      {popular && (
        <motion.div 
          className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-20"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <div className={`px-4 py-1 rounded-full text-sm font-medium text-white ${variant.bg} border ${variant.border}`}>
            ✨ Plus Populaire
          </div>
        </motion.div>
      )}

      <GlassCard className={`h-full backdrop-blur-xl bg-white/5 border-white/10 ${popular ? 'ring-2 ring-amber-400/30' : ''} hover:${variant.glow} transition-all duration-300`}>
        <div className="p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div 
              className="flex justify-center mb-4"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ duration: 0.3 }}
            >
              <div className={`w-16 h-16 rounded-full ${variant.bg} border ${variant.border} flex items-center justify-center`}>
                <LevelIcon className={`w-8 h-8 ${variant.accent}`} />
              </div>
            </motion.div>

            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-sm text-white/60 font-medium">NIVEAU {level}</span>
              {isHighTier && <Crown className="w-4 h-4 text-amber-400" />}
            </div>

            <h3 className="text-2xl font-cinzel font-light text-white mb-4">
              {title}
            </h3>

            <div className="mb-6">
              <div className={`text-4xl font-bold ${variant.accent} mb-2`}>
                {price}
              </div>
              <div className="text-white/60 text-sm">
                Session de {duration}
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="space-y-4 mb-8">
            {features.map((feature, index) => (
              <motion.div 
                key={index}
                className="flex items-start gap-3"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
              >
                <div className={`w-5 h-5 rounded-full ${variant.bg} border ${variant.border} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                  <Check className={`w-3 h-3 ${variant.accent}`} />
                </div>
                <span className="text-white/90 text-sm leading-relaxed">
                  {feature}
                </span>
              </motion.div>
            ))}
          </div>

          {/* CTA */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {popular ? (
              <PrimaryButton
                onClick={onSelect}
                className={`w-full bg-gradient-to-r ${variant.gradient} hover:scale-105 transition-all duration-300 shadow-lg ${variant.glow}`}
              >
                {ctaLabel}
              </PrimaryButton>
            ) : (
              <SecondaryButton
                onClick={onSelect}
                className={`w-full border ${variant.border} text-white hover:${variant.bg} hover:border-white/30 transition-all duration-300`}
              >
                {ctaLabel}
              </SecondaryButton>
            )}
          </motion.div>
        </div>
      </GlassCard>
    </motion.div>
  );
};

export default LevelCard;