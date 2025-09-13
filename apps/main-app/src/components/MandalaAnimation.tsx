import React from 'react';
import { motion } from 'framer-motion';

interface MandalaAnimationProps {
  size?: 'small' | 'medium' | 'large';
  opacity?: number;
}

const MandalaAnimation: React.FC<MandalaAnimationProps> = ({ 
  size = 'medium', 
  opacity = 0.3 
}) => {
  const sizeClasses = {
    small: 'w-32 h-32',
    medium: 'w-64 h-64',
    large: 'w-96 h-96'
  };

  return (
    <div className={`relative ${sizeClasses[size]}`} style={{ opacity }}>
      {/* Mandala principal rotatif */}
      <motion.div
        className="absolute inset-0"
        animate={{ rotate: 360 }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
      >
        {/* Cercles concentriques */}
        <div className="absolute inset-0 border border-cosmic-gold/40 rounded-full"></div>
        <div className="absolute inset-4 border border-cosmic-violet/30 rounded-full"></div>
        <div className="absolute inset-8 border border-cosmic-star/20 rounded-full"></div>
        <div className="absolute inset-12 border border-cosmic-gold/30 rounded-full"></div>
        
        {/* Motifs géométriques */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-1/2 h-1/2 border border-cosmic-gold/30 rotate-45"></div>
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-1/3 h-1/3 border border-cosmic-violet/20 rotate-12"></div>
        </div>
        
        {/* Points cardinaux */}
        <div className="absolute top-0 left-1/2 w-2 h-2 bg-cosmic-gold rounded-full transform -translate-x-1/2"></div>
        <div className="absolute bottom-0 left-1/2 w-2 h-2 bg-cosmic-violet rounded-full transform -translate-x-1/2"></div>
        <div className="absolute left-0 top-1/2 w-2 h-2 bg-cosmic-star rounded-full transform -translate-y-1/2"></div>
        <div className="absolute right-0 top-1/2 w-2 h-2 bg-cosmic-aurora rounded-full transform -translate-y-1/2"></div>
      </motion.div>

      {/* Mandala contre-rotatif */}
      <motion.div
        className="absolute inset-2"
        animate={{ rotate: -360 }}
        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
      >
        <div className="absolute inset-0 border border-cosmic-violet/20 rounded-full"></div>
        <div className="absolute inset-4 border border-cosmic-gold/20 rounded-full"></div>
        
        {/* Triangles */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 border border-cosmic-aurora/30 rotate-0" style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }}></div>
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-6 h-6 border border-cosmic-gold/40 rotate-180" style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }}></div>
        </div>
      </motion.div>

      {/* Centre pulsant */}
      <motion.div
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-cosmic-gold rounded-full"
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.6, 1, 0.6],
          boxShadow: [
            '0 0 10px rgba(255, 215, 0, 0.5)',
            '0 0 30px rgba(255, 215, 0, 0.8)',
            '0 0 10px rgba(255, 215, 0, 0.5)',
          ],
        }}
        transition={{ duration: 3, repeat: Infinity }}
      />

      {/* Orbites de particules */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-cosmic-star rounded-full"
          style={{
            left: '50%',
            top: '50%',
          }}
          animate={{
            rotate: 360,
            x: Math.cos((i * Math.PI * 2) / 8) * (20 + i * 5),
            y: Math.sin((i * Math.PI * 2) / 8) * (20 + i * 5),
            opacity: [0.3, 1, 0.3],
          }}
          transition={{
            duration: 10 + i * 2,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
};

export default MandalaAnimation;