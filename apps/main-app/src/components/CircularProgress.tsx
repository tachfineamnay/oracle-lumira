import React from 'react';
import { motion } from 'framer-motion';

interface CircularProgressProps {
  progress: number;
}

const CircularProgress: React.FC<CircularProgressProps> = ({ progress }) => {
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative w-32 h-32">
      {/* Cercle de fond avec effet cosmique */}
      <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
        <defs>
          <linearGradient id="cosmicGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFD700" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#8B5CF6" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#D946EF" stopOpacity="0.4" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* Cercle de fond */}
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke="rgba(255, 215, 0, 0.2)"
          strokeWidth="6"
        />
        
        {/* Cercle de progression avec dégradé cosmique */}
        <motion.circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke="url(#cosmicGradient)"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          filter="url(#glow)"
          style={{ transition: 'stroke-dashoffset 1.5s ease-in-out' }}
          animate={{
            filter: [
              'drop-shadow(0 0 10px rgba(255, 215, 0, 0.5))',
              'drop-shadow(0 0 20px rgba(139, 123, 216, 0.7))',
              'drop-shadow(0 0 10px rgba(255, 215, 0, 0.5))',
            ]
          }}
          transition={{ duration: 3, repeat: Infinity }}
        />
        
        {/* Cercle orbital externe */}
        <motion.circle
          cx="60"
          cy="60"
          r={radius + 8}
          fill="none"
          stroke="rgba(139, 123, 216, 0.3)"
          strokeWidth="1"
          strokeDasharray="4 4"
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        />
      </svg>

      {/* Centre avec pourcentage et étoiles */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div 
          className="text-center"
          animate={{ 
            textShadow: [
              '0 0 10px rgba(255, 215, 0, 0.5)',
              '0 0 20px rgba(255, 215, 0, 0.8)',
              '0 0 10px rgba(255, 215, 0, 0.5)',
            ]
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <span className="font-inter font-bold text-2xl text-cosmic-gold block">
            {Math.round(progress)}%
          </span>
          <motion.div 
            className="flex justify-center gap-1 mt-1"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <div className="w-1 h-1 bg-cosmic-star rounded-full"></div>
            <div className="w-1 h-1 bg-cosmic-gold rounded-full"></div>
            <div className="w-1 h-1 bg-cosmic-star rounded-full"></div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default CircularProgress;