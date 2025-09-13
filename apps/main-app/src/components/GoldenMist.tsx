import React from 'react';
import { motion } from 'framer-motion';

const GoldenMist: React.FC = () => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Brume dorée principale */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-96 h-96 bg-cosmic-gold/10 rounded-full blur-3xl"
        animate={{
          x: [0, 50, -30, 0],
          y: [0, -30, 20, 0],
          scale: [1, 1.2, 0.8, 1],
          opacity: [0.3, 0.6, 0.4, 0.3],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Brume violette */}
      <motion.div
        className="absolute top-1/2 right-1/3 w-80 h-80 bg-cosmic-violet/15 rounded-full blur-3xl"
        animate={{
          x: [0, -40, 60, 0],
          y: [0, 40, -20, 0],
          scale: [1, 0.9, 1.3, 1],
          opacity: [0.2, 0.5, 0.3, 0.2],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 5,
        }}
      />

      {/* Brume aurore */}
      <motion.div
        className="absolute bottom-1/3 left-1/2 w-72 h-72 bg-cosmic-aurora/12 rounded-full blur-3xl"
        animate={{
          x: [0, 30, -50, 0],
          y: [0, -25, 35, 0],
          scale: [1, 1.1, 0.9, 1],
          opacity: [0.25, 0.4, 0.35, 0.25],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 10,
        }}
      />

      {/* Particules de brume */}
      {[...Array(15)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-cosmic-gold/20 rounded-full blur-sm"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            x: [0, Math.random() * 100 - 50],
            y: [0, Math.random() * 100 - 50],
            opacity: [0, 0.6, 0],
            scale: [0, 1.5, 0],
          }}
          transition={{
            duration: 8 + Math.random() * 4,
            repeat: Infinity,
            delay: Math.random() * 5,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};

export default GoldenMist;