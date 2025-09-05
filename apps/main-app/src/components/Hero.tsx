import React from 'react';
import { motion } from 'framer-motion';
import { ArrowDown, Sparkles } from 'lucide-react';
import MandalaAnimation from './MandalaAnimation';

const Hero: React.FC = () => {
  return (
    <section className="min-h-screen flex flex-col items-center justify-center relative px-6">
      {/* Central Mandala */}
      <div className="absolute inset-0 flex items-center justify-center">
        <MandalaAnimation />
      </div>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, delay: 0.5 }}
        className="text-center z-10 relative"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mb-8"
        >
          <Sparkles className="w-12 h-12 text-mystical-gold mx-auto mb-4 animate-pulse-glow" />
          <h1 className="font-playfair italic text-6xl md:text-8xl font-medium mb-6 bg-gradient-to-r from-mystical-gold via-mystical-gold-light to-mystical-amber bg-clip-text text-transparent">
            Oracle Lumira
          </h1>
          <p className="font-inter font-light text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Révèle ton archétype spirituel à travers des lectures vibratoires personnalisées
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="space-y-6"
        >
          <motion.button
            className="px-12 py-4 rounded-full bg-gradient-to-r from-mystical-gold to-mystical-gold-light text-mystical-dark font-inter font-semibold text-lg shadow-lg shadow-mystical-gold/30 hover:shadow-mystical-gold/50 transition-all duration-300"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              const levelsSection = document.getElementById('levels');
              levelsSection?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            Commencer mon tirage
          </motion.button>

          <p className="font-inter text-sm text-gray-400">
            🔮 Livraison en 24h • PDF + Audio + Mandala personnalisé
          </p>
        </motion.div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-12 left-1/2 transform -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="flex flex-col items-center text-mystical-gold/60"
        >
          <span className="font-inter text-sm mb-2">Découvrir</span>
          <ArrowDown className="w-5 h-5" />
        </motion.div>
      </motion.div>
    </section>
  );
};

export default Hero;
