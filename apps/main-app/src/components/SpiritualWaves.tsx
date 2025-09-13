import React from 'react';
import { motion } from 'framer-motion';

const SpiritualWaves: React.FC = () => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Vague cosmique principale */}
      <motion.div
        className="absolute inset-0"
        animate={{
          background: [
            'linear-gradient(45deg, rgba(139, 123, 216, 0.1) 0%, transparent 50%, rgba(255, 215, 0, 0.05) 100%)',
            'linear-gradient(45deg, rgba(255, 215, 0, 0.1) 0%, transparent 50%, rgba(139, 123, 216, 0.05) 100%)',
            'linear-gradient(45deg, rgba(168, 85, 247, 0.1) 0%, transparent 50%, rgba(255, 215, 0, 0.05) 100%)',
            'linear-gradient(45deg, rgba(139, 123, 216, 0.1) 0%, transparent 50%, rgba(255, 215, 0, 0.05) 100%)',
          ],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Vagues ondulantes */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="waveGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFD700" stopOpacity="0.1" />
            <stop offset="50%" stopColor="#8B7BD8" stopOpacity="0.05" />
            <stop offset="100%" stopColor="#A855F7" stopOpacity="0.1" />
          </linearGradient>
          <linearGradient id="waveGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#A855F7" stopOpacity="0.08" />
            <stop offset="50%" stopColor="#FFD700" stopOpacity="0.04" />
            <stop offset="100%" stopColor="#8B7BD8" stopOpacity="0.08" />
          </linearGradient>
        </defs>
        
        {/* Première vague */}
        <motion.path
          d="M0,400 Q300,300 600,400 T1200,400 L1200,800 L0,800 Z"
          fill="url(#waveGradient1)"
          animate={{
            d: [
              "M0,400 Q300,300 600,400 T1200,400 L1200,800 L0,800 Z",
              "M0,420 Q300,320 600,420 T1200,420 L1200,800 L0,800 Z",
              "M0,380 Q300,280 600,380 T1200,380 L1200,800 L0,800 Z",
              "M0,400 Q300,300 600,400 T1200,400 L1200,800 L0,800 Z",
            ],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        
        {/* Deuxième vague */}
        <motion.path
          d="M0,500 Q400,400 800,500 T1200,500 L1200,800 L0,800 Z"
          fill="url(#waveGradient2)"
          animate={{
            d: [
              "M0,500 Q400,400 800,500 T1200,500 L1200,800 L0,800 Z",
              "M0,480 Q400,380 800,480 T1200,480 L1200,800 L0,800 Z",
              "M0,520 Q400,420 800,520 T1200,520 L1200,800 L0,800 Z",
              "M0,500 Q400,400 800,500 T1200,500 L1200,800 L0,800 Z",
            ],
          }}
          transition={{
            duration: 16,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
        />
      </svg>

      {/* Rayons cosmiques */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-px h-32 bg-gradient-to-b from-cosmic-star/60 via-cosmic-gold/40 to-transparent"
          style={{
            left: `${20 + i * 15}%`,
            top: `${10 + i * 5}%`,
            transformOrigin: 'bottom',
          }}
          animate={{
            scaleY: [0, 1, 0],
            opacity: [0, 0.8, 0],
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            delay: i * 0.8,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};

export default SpiritualWaves;