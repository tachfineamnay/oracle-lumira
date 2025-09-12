import React from 'react';
import { motion } from 'framer-motion';

const GoldenMist: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      {/* Aurora Layer 1 - Doux et lumineux */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-tr from-mystical-aurora/20 via-transparent to-mystical-water/15"
        animate={{
          opacity: [0.4, 0.7, 0.4],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Brume naturelle Layer 2 */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-bl from-transparent via-mystical-sage/10 to-mystical-champagne/15"
        animate={{
          opacity: [0.3, 0.6, 0.3],
          scale: [1.1, 1, 1.1],
        }}
        transition={{
          duration: 16,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
      />

      {/* Halo lumineux fluide */}
      <motion.div
        className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-mystical-gold/8 via-transparent to-mystical-constellation/8"
        animate={{
          x: ['-100%', '100%'],
          opacity: [0, 0.4, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear",
        }}
      />
      
      {/* Texture organique - Cercles doux */}
      <motion.div
        className="absolute top-1/4 right-1/4 w-96 h-96 bg-gradient-radial from-mystical-water/10 to-transparent rounded-full"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </div>
  );
};

export default GoldenMist;