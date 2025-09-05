import React from 'react';
import { motion } from 'framer-motion';

const GoldenMist: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      {/* Mist Layer 1 */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-tr from-mystical-gold/5 via-transparent to-mystical-purple/5"
        animate={{
          opacity: [0.3, 0.6, 0.3],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Mist Layer 2 */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-bl from-transparent via-mystical-amber/5 to-mystical-gold/5"
        animate={{
          opacity: [0.2, 0.5, 0.2],
          scale: [1.1, 1, 1.1],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
      />

      {/* Flowing Mist */}
      <motion.div
        className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-mystical-gold/10 via-transparent to-mystical-purple/10"
        animate={{
          x: ['-100%', '100%'],
          opacity: [0, 0.3, 0],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "linear",
        }}
      />
    </div>
  );
};

export default GoldenMist;