import React from 'react';
import { motion } from 'framer-motion';

const MandalaAnimation: React.FC = () => {
  return (
    <div className="relative w-96 h-96 opacity-20">
      {/* Outer Ring */}
      <motion.svg
        width="384"
        height="384"
        viewBox="0 0 384 384"
        className="absolute inset-0"
        animate={{ rotate: 360 }}
        transition={{ duration: 80, repeat: Infinity, ease: "linear" }}
      >
        <circle
          cx="192"
          cy="192"
          r="180"
          fill="none"
          stroke="url(#auroraGradient)"
          strokeWidth="1"
          strokeDasharray="3,8"
        />
        <defs>
          <linearGradient id="auroraGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#E8D5B7" />
            <stop offset="50%" stopColor="#B8E6E6" />
            <stop offset="100%" stopColor="#9CAF88" />
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
        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
      >
        <circle
          cx="192"
          cy="192"
          r="120"
          fill="none"
          stroke="url(#constellationGradient)"
          strokeWidth="1"
          strokeDasharray="2,6"
        />
        <defs>
          <linearGradient id="constellationGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4A6FA5" />
            <stop offset="100%" stopColor="#34495E" />
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
        transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
      >
        <circle
          cx="192"
          cy="192"
          r="60"
          fill="none"
          stroke="#E8D5B7"
          strokeWidth="1.5"
          strokeDasharray="1,4"
        />
      </motion.svg>

      {/* Central Glow */}
      <motion.div
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full bg-gradient-radial from-mystical-champagne/30 to-transparent blur-2xl"
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
};

export default MandalaAnimation;