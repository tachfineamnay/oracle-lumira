import React from 'react';
import { motion } from 'framer-motion';

const MandalaAnimation: React.FC = () => {
  return (
    <div className="relative w-96 h-96 opacity-15">
      {/* Outer Ring */}
      <motion.svg
        width="384"
        height="384"
        viewBox="0 0 384 384"
        className="absolute inset-0"
        animate={{ rotate: 360 }}
        transition={{ duration: 100, repeat: Infinity, ease: "linear" }}
      >
        <circle
          cx="192"
          cy="192"
          r="180"
          fill="none"
          stroke="url(#mandalaGradient)"
          strokeWidth="1"
          strokeDasharray="2,12"
        />
        <defs>
          <linearGradient id="mandalaGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#D4AF37" />
            <stop offset="50%" stopColor="#FFD700" />
            <stop offset="100%" stopColor="#FBBF24" />
          </linearGradient>
        </defs>
      </motion.svg>

      {/* Middle Ring */}
      <motion.svg
        width="384"
        height="384"
        viewBox="0 0 384 384"
        className="absolute inset-0"
        animate={{ rotate: -360 }}
        transition={{ duration: 75, repeat: Infinity, ease: "linear" }}
      >
        <circle
          cx="192"
          cy="192"
          r="120"
          fill="none"
          stroke="url(#purpleGradient)"
          strokeWidth="1"
          strokeDasharray="1,8"
        />
        <defs>
          <linearGradient id="purpleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6B46C1" />
            <stop offset="50%" stopColor="#A78BFA" />
            <stop offset="100%" stopColor="#C084FC" />
          </linearGradient>
        </defs>
      </motion.svg>

      {/* Inner Ring */}
      <motion.svg
        width="384"
        height="384"
        viewBox="0 0 384 384"
        className="absolute inset-0"
        animate={{ rotate: 360 }}
        transition={{ duration: 55, repeat: Infinity, ease: "linear" }}
      >
        <circle
          cx="192"
          cy="192"
          r="60"
          fill="none"
          stroke="rgba(212, 175, 55, 0.6)"
          strokeWidth="1.5"
          strokeDasharray="0.5,6"
        />
      </motion.svg>

      {/* Central Glow */}
      <motion.div
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full bg-gradient-radial from-mystical-gold/25 to-transparent blur-2xl"
        animate={{ 
          scale: [1, 1.3, 1],
          opacity: [0.4, 0.7, 0.4],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
};

export default MandalaAnimation;