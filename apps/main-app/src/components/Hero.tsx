import React from 'react';
import { motion } from 'framer-motion';
import { ArrowDown, Sparkles } from 'lucide-react';
import MandalaAnimation from './MandalaAnimation';
import SpiritualWaves from './SpiritualWaves';

const Hero: React.FC = () => {
  return (
    <section className="min-h-screen flex flex-col items-center justify-center relative px-6 bg-gradient-to-b from-mystical-serenity via-mystical-whisper to-mystical-pearl overflow-hidden">
      {/* Ondulations spirituelles subtiles */}
      <SpiritualWaves intensity="subtle" />
      
      {/* Central Mandala */}
      <div className="absolute inset-0 flex items-center justify-center">
        <MandalaAnimation />
      </div>

      {/* Organic Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div 
          className="absolute top-20 left-10 w-32 h-32 bg-mystical-water/15 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3],
            x: [0, 10, 0],
            y: [0, -5, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div 
          className="absolute bottom-32 right-16 w-48 h-48 bg-mystical-sage/12 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.2, 0.4, 0.2],
            x: [0, -8, 0],
            y: [0, 8, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
        />
        <motion.div 
          className="absolute top-1/3 right-1/4 w-24 h-24 bg-mystical-champagne/20 rounded-full blur-2xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.25, 0.45, 0.25],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 4,
          }}
        />
      </div>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, delay: 0.5 }}
        className="text-center z-10 relative max-w-4xl mx-auto"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mb-8"
        >
          <motion.div
            animate={{
              rotate: [0, 360],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            <Sparkles className="w-12 h-12 text-mystical-gold mx-auto mb-6 drop-shadow-lg" />
          </motion.div>
          <h1 className="font-playfair italic text-6xl md:text-8xl font-medium mb-8 bg-gradient-to-r from-mystical-copper via-mystical-gold to-mystical-radiance bg-clip-text text-transparent drop-shadow-sm">
            Oracle Lumira
          </h1>
          <p className="font-inter font-light text-xl md:text-2xl text-mystical-night/80 max-w-3xl mx-auto leading-relaxed tracking-wide">
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
            className="px-12 py-5 rounded-full bg-gradient-to-r from-mystical-gold via-mystical-radiance to-mystical-champagne text-mystical-night font-inter font-semibold text-lg shadow-spiritual hover:shadow-energy transition-all duration-500 hover:scale-105 relative overflow-hidden group"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              const levelsSection = document.getElementById('levels');
              levelsSection?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            {/* Effet d'ondulation au survol */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-mystical-luminous/30 to-mystical-gold/30 rounded-full"
              initial={{ scale: 0, opacity: 0 }}
              whileHover={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
            />
            <span className="relative z-10">
            Recevoir ma lecture
            </span>
          </motion.button>

          <p className="font-inter text-sm text-mystical-night/70 tracking-wide">
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
          animate={{ 
            y: [0, 12, 0],
            opacity: [0.6, 1, 0.6]
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="flex flex-col items-center text-mystical-copper/90"
        >
          <span className="font-inter text-sm mb-3 tracking-wider">Découvrir</span>
          <ArrowDown className="w-5 h-5" />
        </motion.div>
      </motion.div>
    </section>
  );
};

export default Hero;