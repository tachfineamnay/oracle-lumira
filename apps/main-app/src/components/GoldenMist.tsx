import React from 'react';
import { motion } from 'framer-motion';

const GoldenMist: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      {/* Aurora Layer 1 - Doux et spirituel */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-tr from-mystical-aurora/15 via-transparent to-mystical-flow/12"
        animate={{
          opacity: [0.3, 0.6, 0.3],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Brume spirituelle Layer 2 */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-bl from-transparent via-mystical-sage/8 to-mystical-harmony/12"
        animate={{
          opacity: [0.2, 0.5, 0.2],
          scale: [1.1, 1, 1.1],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
      />

      {/* Flux énergétique spirituel */}
      <motion.div
        className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-mystical-gold/6 via-transparent to-mystical-constellation/6"
        animate={{
          x: ['-100%', '100%'],
          opacity: [0, 0.3, 0],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "linear",
        }}
      />
      
      {/* Ondulations énergétiques multiples */}
      <motion.div
        className="absolute top-1/4 right-1/4 w-96 h-96 bg-gradient-radial from-mystical-water/8 to-transparent rounded-full"
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.2, 0.5, 0.2],
          x: [0, 20, 0],
          y: [0, -15, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      
      {/* Ondulation complémentaire */}
      <motion.div
        className="absolute bottom-1/3 left-1/5 w-64 h-64 bg-gradient-radial from-mystical-sage/6 to-transparent rounded-full"
        animate={{
          scale: [1, 1.4, 1],
          opacity: [0.15, 0.4, 0.15],
          x: [0, -15, 0],
          y: [0, 10, 0],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 5,
        }}
      />
    </div>
  );
};

export default GoldenMist;