import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

interface LoadingScreenProps {
  type?: 'cosmic' | 'simple';
  message?: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  type = 'cosmic', 
  message = 'Chargement...' 
}) => {
  if (type === 'simple') {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-cosmic-deep/50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center space-y-6"
      >
        {/* Mandala Spinner Cosmique */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="relative w-24 h-24 mx-auto"
        >
          {/* Cercles concentriques */}
          <div className="absolute inset-0 border-2 border-purple-400/30 rounded-full" />
          <div className="absolute inset-3 border-2 border-blue-400/30 rounded-full" />
          <div className="absolute inset-6 border-2 border-purple-400/30 rounded-full" />
          
          {/* Centre lumineux */}
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.6, 1, 0.6],
            }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-purple-400 rounded-full"
          />
        </motion.div>

        {/* Message */}
        <motion.p
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-lg font-medium text-white/80"
        >
          {message}
        </motion.p>

        {/* Points de chargement */}
        <div className="flex items-center justify-center gap-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.3, 1, 0.3],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.2,
              }}
              className="w-2 h-2 bg-purple-400 rounded-full"
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default LoadingScreen;
