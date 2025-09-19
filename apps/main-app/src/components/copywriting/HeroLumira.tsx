import React from 'react';
import { motion } from 'framer-motion';
import { Star, Sparkles } from 'lucide-react';
import { PrimaryButton } from '../ui/Buttons';
import GlassCard from '../ui/GlassCard';

export interface HeroLumiraProps {
  title: string;
  subTitle: string;
  ctaLabel: string;
  perks: string[];
  onCTAClick?: () => void;
  className?: string;
}

const HeroLumira: React.FC<HeroLumiraProps> = ({
  title,
  subTitle,
  ctaLabel,
  perks,
  onCTAClick,
  className = ''
}) => {
  return (
    <section className={`relative overflow-hidden ${className}`}>
      {/* Cosmic background */}
      <div className="absolute inset-0 bg-gradient-to-br from-mystical-900 via-mystical-800 to-mystical-900">
        <div className="absolute inset-0 opacity-30">
          {/* ux: cosmic dots pattern */}
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
            <defs>
              <pattern id="cosmic-dots" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
                <circle cx="5" cy="5" r="0.5" fill="#fbbf24" opacity="0.1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#cosmic-dots)" />
          </svg>
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          {/* Sacred symbol */}
          <motion.div 
            className="flex justify-center mb-8"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-400/20 to-mystical-600/20 flex items-center justify-center border border-amber-400/30">
                <Star className="w-12 h-12 text-amber-400" />
              </div>
              <motion.div
                className="absolute -top-2 -right-2"
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="w-6 h-6 text-amber-300" />
              </motion.div>
            </div>
          </motion.div>

          {/* Title */}
          <motion.h1 
            className="text-4xl sm:text-5xl lg:text-6xl font-cinzel font-light text-white mb-6 tracking-wide"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <span className="bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 bg-clip-text text-transparent">
              {title}
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p 
            className="text-xl sm:text-2xl text-white/80 mb-12 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            {subTitle}
          </motion.p>

          {/* CTA */}
          <motion.div 
            className="mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <PrimaryButton
              onClick={onCTAClick}
              className="bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-lg px-8 py-4 shadow-lg shadow-amber-400/30 hover:shadow-amber-400/50 transition-all duration-300"
            >
              {ctaLabel}
            </PrimaryButton>
          </motion.div>

          {/* Perks */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <GlassCard className="max-w-4xl mx-auto backdrop-blur-xl bg-white/5 border-white/10">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 p-8">
                {perks.map((perk, index) => (
                  <motion.div
                    key={index}
                    className="text-center"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.7 + index * 0.1 }}
                  >
                    <p className="text-white/90 font-medium leading-relaxed">
                      {perk}
                    </p>
                  </motion.div>
                ))}
              </div>
            </GlassCard>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroLumira;