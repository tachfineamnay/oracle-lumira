import React from 'react';
import { motion } from 'framer-motion';

const GoldenMist: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      {/* Aurora Layer 1 - Doux et lumineux */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-tr from-lumira-aurora/20 via-transparent to-lumira-water/15"
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
        className="absolute inset-0 bg-gradient-to-bl from-transparent via-lumira-sage/10 to-lumira-champagne/15"
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
        className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-lumira-gold-soft/8 via-transparent to-lumira-constellation/8"
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
        className="absolute top-1/4 right-1/4 w-96 h-96 bg-gradient-radial from-lumira-water/10 to-transparent rounded-full"
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