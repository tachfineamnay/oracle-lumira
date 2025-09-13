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
          stroke="url(#spiritualMandalaGradient)"
          strokeWidth="1"
          strokeDasharray="2,12"
        />
        <defs>
          <linearGradient id="spiritualMandalaGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#E8D5B7" />
            <stop offset="30%" stopColor="#FFE5B4" />
            <stop offset="70%" stopColor="#B8E6E6" />
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
        transition={{ duration: 75, repeat: Infinity, ease: "linear" }}
      >
        <circle
          cx="192"
          cy="192"
          r="120"
          fill="none"
          stroke="url(#harmonyGradient)"
          strokeWidth="1"
          strokeDasharray="1,8"
        />
        <defs>
          <linearGradient id="harmonyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4A6FA5" />
            <stop offset="50%" stopColor="#9CAF88" />
            <stop offset="100%" stopColor="#2D3748" />
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
          stroke="rgba(232, 213, 183, 0.6)"
          strokeWidth="1.5"
          strokeDasharray="0.5,6"
        />
      </motion.svg>

      {/* Central Glow */}
      <motion.div
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full bg-gradient-radial from-mystical-radiance/25 to-transparent blur-2xl"
        animate={{ 
          scale: [1, 1.3, 1],
          opacity: [0.4, 0.7, 0.4],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      
      {/* Ondulations énergétiques concentriques */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 border border-mystical-gold/10 rounded-full"
          style={{
            width: `${120 + i * 40}px`,
            height: `${120 + i * 40}px`,
          }}
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0, 0.3, 0],
          }}
          transition={{
            duration: 4 + i * 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 1.5,
          }}
        />
      ))}
      
      {/* Particules spirituelles flottantes */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-mystical-gold/30 rounded-full"
          style={{
            left: `${45 + Math.cos(i * 45 * Math.PI / 180) * 150}px`,
            top: `${45 + Math.sin(i * 45 * Math.PI / 180) * 150}px`,
          }}
          animate={{
            scale: [0.5, 1.5, 0.5],
            opacity: [0.2, 0.8, 0.2],
            rotate: [0, 360],
          }}
          transition={{
            duration: 6 + i * 0.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.8,
          }}
        />
      ))}
      />
    </div>
  );
};

export default MandalaAnimation;