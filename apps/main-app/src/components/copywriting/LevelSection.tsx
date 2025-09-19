import React from 'react';
import { motion } from 'framer-motion';
import LevelCard, { LevelCardProps } from './LevelCard';

export interface LevelSectionProps {
  title?: string;
  subtitle?: string;
  levels: Omit<LevelCardProps, 'onSelect'>[];
  onLevelSelect?: (level: number) => void;
  className?: string;
}

const LevelSection: React.FC<LevelSectionProps> = ({
  title = "Choisissez Votre Chemin Lumineux",
  subtitle = "Chaque niveau vous rapproche de votre véritable essence spirituelle",
  levels,
  onLevelSelect,
  className = ''
}) => {
  return (
    <section className={`py-16 sm:py-20 lg:py-24 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-cinzel font-light text-white mb-6">
            <span className="bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 bg-clip-text text-transparent">
              {title}
            </span>
          </h2>
          <p className="text-xl text-white/80 max-w-3xl mx-auto leading-relaxed">
            {subtitle}
          </p>
        </motion.div>

        {/* Levels Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {levels.map((level, index) => {
            // Auto-assign colors based on level
            const colors: Array<LevelCardProps['color']> = ['amber', 'emerald', 'purple', 'gold'];
            const levelColor = colors[index] || 'amber';

            return (
              <LevelCard
                key={`level-${level.level}`}
                {...level}
                color={levelColor}
                onSelect={() => onLevelSelect?.(level.level)}
                className="h-full"
              />
            );
          })}
        </div>

        {/* Trust Indicators */}
        <motion.div 
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <div className="flex flex-wrap justify-center items-center gap-8 text-white/60 text-sm">
            <div className="flex items-center gap-2">
              <span>🔒</span>
              <span>Paiement 100% sécurisé</span>
            </div>
            <div className="flex items-center gap-2">
              <span>✨</span>
              <span>Guidance spirituelle authentique</span>
            </div>
            <div className="flex items-center gap-2">
              <span>💎</span>
              <span>Satisfaction garantie</span>
            </div>
            <div className="flex items-center gap-2">
              <span>🌟</span>
              <span>Support bienveillant</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default LevelSection;