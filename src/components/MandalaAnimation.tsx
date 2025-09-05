import React from 'react';
import { motion } from 'framer-motion';

const MandalaAnimation: React.FC = () => {
  return (
    <div className="relative w-96 h-96 opacity-30">
      {/* Outer Ring */}
      <motion.svg
        width="384"
        height="384"
        viewBox="0 0 384 384"
        className="absolute inset-0"
        animate={{ rotate: 360 }}
        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
      >
        <circle
          cx="192"
          cy="192"
          r="180"
          fill="none"
          stroke="url(#goldenGradient)"
          strokeWidth="1"
          strokeDasharray="5,5"
        />
        <defs>
          <linearGradient id="goldenGradient" x1="0%" y1="0%" x2="100%" y2="100%">
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
        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
      >
        <circle
          cx="192"
          cy="192"
          r="120"
          fill="none"
          stroke="url(#purpleGradient)"
          strokeWidth="1"
          strokeDasharray="3,3"
        />
        <defs>
          <linearGradient id="purpleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#C084FC" />
            <stop offset="100%" stopColor="#A78BFA" />
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
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
      >
        <circle
          cx="192"
          cy="192"
          r="60"
          fill="none"
          stroke="#D4AF37"
          strokeWidth="2"
          strokeDasharray="2,2"
        />
      </motion.svg>

      {/* Central Glow */}
      <motion.div
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full bg-mystical-gold/20 blur-xl"
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 4, repeat: Infinity }}
      />
    </div>
  );
};

export default MandalaAnimation;