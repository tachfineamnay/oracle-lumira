import React from 'react';
import { motion } from 'framer-motion';

interface SpiritualWavesProps {
  intensity?: 'subtle' | 'medium' | 'strong';
  className?: string;
}

const SpiritualWaves: React.FC<SpiritualWavesProps> = ({ 
  intensity = 'subtle', 
  className = '' 
}) => {
  const getIntensityConfig = () => {
    switch (intensity) {
      case 'medium':
        return {
          opacity: 'opacity-20',
          scale: 1.2,
          duration: 10
        };
      case 'strong':
        return {
          opacity: 'opacity-30',
          scale: 1.5,
          duration: 8
        };
      default:
        return {
          opacity: 'opacity-10',
          scale: 1,
          duration: 12
        };
    }
  };

  const config = getIntensityConfig();

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {/* Ondulation principale - très subtile */}
      <motion.div
        className={`absolute inset-0 ${config.opacity}`}
        animate={{
          background: [
            'radial-gradient(circle at 20% 20%, rgba(232, 213, 183, 0.08) 0%, transparent 40%)',
            'radial-gradient(circle at 80% 60%, rgba(184, 230, 230, 0.06) 0%, transparent 40%)',
            'radial-gradient(circle at 40% 80%, rgba(156, 175, 136, 0.05) 0%, transparent 40%)',
            'radial-gradient(circle at 60% 30%, rgba(244, 228, 188, 0.07) 0%, transparent 40%)',
            'radial-gradient(circle at 20% 20%, rgba(232, 213, 183, 0.08) 0%, transparent 40%)',
          ],
        }}
        transition={{
          duration: config.duration,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Ondulation secondaire - effet de profondeur */}
      <motion.div
        className={`absolute inset-0 ${config.opacity}`}
        animate={{
          background: [
            'linear-gradient(45deg, rgba(232, 213, 183, 0.03) 0%, transparent 30%, rgba(184, 230, 230, 0.02) 70%, transparent 100%)',
            'linear-gradient(135deg, rgba(156, 175, 136, 0.02) 0%, transparent 30%, rgba(244, 228, 188, 0.03) 70%, transparent 100%)',
            'linear-gradient(225deg, rgba(184, 230, 230, 0.02) 0%, transparent 30%, rgba(232, 213, 183, 0.03) 70%, transparent 100%)',
            'linear-gradient(315deg, rgba(244, 228, 188, 0.02) 0%, transparent 30%, rgba(156, 175, 136, 0.02) 70%, transparent 100%)',
            'linear-gradient(45deg, rgba(232, 213, 183, 0.03) 0%, transparent 30%, rgba(184, 230, 230, 0.02) 70%, transparent 100%)',
          ],
        }}
        transition={{
          duration: config.duration + 4,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
      />

      {/* Particules énergétiques flottantes */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-mystical-gold/20 rounded-full"
          style={{
            left: `${20 + i * 15}%`,
            top: `${30 + (i % 3) * 20}%`,
          }}
          animate={{
            y: [-10, 10, -10],
            x: [-5, 5, -5],
            opacity: [0.1, 0.3, 0.1],
            scale: [0.8, 1.2, 0.8],
          }}
          transition={{
            duration: 8 + i * 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 1.5,
          }}
        />
      ))}

      {/* Vagues énergétiques - effet très subtil */}
      <motion.div
        className="absolute inset-0 opacity-5"
        style={{
          background: `repeating-linear-gradient(
            90deg,
            transparent,
            transparent 20px,
            rgba(232, 213, 183, 0.1) 20px,
            rgba(232, 213, 183, 0.1) 22px
          )`,
        }}
        animate={{
          x: ['-100%', '100%'],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "linear",
        }}
      />
    </div>
  );
};

export default SpiritualWaves;