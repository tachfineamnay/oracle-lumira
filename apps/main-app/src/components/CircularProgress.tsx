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
      {/* Background Circle */}
      <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke="rgba(232, 213, 183, 0.3)"
          strokeWidth="8"
        />
        
        {/* Progress Circle */}
        <motion.circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke="url(#auroraProgressGradient)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={strokeDasharray}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        />
        
        <defs>
          <linearGradient id="auroraProgressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#E8D5B7" />
            <stop offset="50%" stopColor="#B8E6E6" />
            <stop offset="100%" stopColor="#9CAF88" />
          </linearGradient>
        </defs>
      </svg>

      {/* Center Content */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.span
          key={progress}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="font-inter font-semibold text-xl text-mystical-copper"
        >
          {Math.round(progress)}%
        </motion.span>
      </div>

      {/* Outer Glow */}
      <motion.div
        className="absolute inset-0 rounded-full bg-mystical-aurora/30 blur-xl"
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        style={{ opacity: progress / 100 * 0.5 }}
      />
    </div>
  );
};

export default CircularProgress;