import React from 'react';
import { motion } from 'framer-motion';
import { ArrowDown, Sparkles } from 'lucide-react';
import MandalaAnimation from './MandalaAnimation';

const Hero: React.FC = () => {
  return (
    <section className="min-h-screen flex flex-col items-center justify-center relative px-6 bg-gradient-to-b from-lumira-aurora via-lumira-cream to-lumira-pearl">
      {/* Central Mandala */}
      <div className="absolute inset-0 flex items-center justify-center">
        <MandalaAnimation />
      </div>

      {/* Organic Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-32 h-32 bg-lumira-water/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-32 right-16 w-48 h-48 bg-lumira-sage/15 rounded-full blur-3xl animate-gentle-glow"></div>
        <div className="absolute top-1/3 right-1/4 w-24 h-24 bg-lumira-champagne/25 rounded-full blur-2xl animate-aurora-flow"></div>
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
          <Sparkles className="w-12 h-12 text-lumira-gold-soft mx-auto mb-4 animate-gentle-glow" />
          <h1 className="font-playfair italic text-6xl md:text-8xl font-medium mb-6 bg-gradient-to-r from-mystical-gold via-mystical-gold-light to-mystical-amber bg-clip-text text-transparent">
            Oracle Lumira
          </h1>
          <p className="font-inter font-light text-xl md:text-2xl text-lumira-night/70 max-w-2xl mx-auto leading-relaxed">
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
            className="px-12 py-4 rounded-full bg-gradient-to-r from-lumira-gold-soft to-lumira-champagne text-lumira-night font-inter font-semibold text-lg shadow-soft hover:shadow-aurora transition-all duration-300 hover:scale-105"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              const levelsSection = document.getElementById('levels');
              levelsSection?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            Recevoir ma lecture
          </motion.button>

          <p className="font-inter text-sm text-lumira-night/60">
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
          className="flex flex-col items-center text-lumira-gold-soft/80"
        >
          <span className="font-inter text-sm mb-2">Découvrir</span>
          <ArrowDown className="w-5 h-5" />
        </motion.div>
      </motion.div>
    </section>
  );
};

export default Hero;
