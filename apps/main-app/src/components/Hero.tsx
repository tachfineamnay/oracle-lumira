import React from 'react';
import { ArrowDown, Sparkles, Star } from 'lucide-react';
import { motion } from 'framer-motion';

const Hero: React.FC = () => {
  return (
    <section className="min-h-screen flex flex-col items-center justify-center relative px-6 overflow-hidden">
      {/* Mandala cosmique premium en arrière-plan */}
      <div className="absolute inset-0 flex items-center justify-center opacity-15">
        <motion.div 
          className="relative w-[500px] h-[500px]"
          animate={{ rotate: 360 }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
        >
          {/* Cercles concentriques du mandala premium */}
          <div className="absolute inset-0 border border-cosmic-gold/30 rounded-full"></div>
          <div className="absolute inset-12 border border-cosmic-violet/25 rounded-full"></div>
          <div className="absolute inset-24 border border-cosmic-star/20 rounded-full"></div>
          <div className="absolute inset-36 border border-cosmic-gold/25 rounded-full"></div>
          <div className="absolute inset-48 border border-cosmic-aurora/20 rounded-full"></div>
          
          {/* Motifs géométriques sacrés */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-40 h-40 border border-cosmic-gold/20 rotate-45"></div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 border border-cosmic-violet/15 rotate-12"></div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-24 h-24 border border-cosmic-aurora/15 rotate-30"></div>
          </div>
          
          {/* Points cardinaux lumineux */}
          <div className="absolute top-0 left-1/2 w-3 h-3 bg-cosmic-gold rounded-full transform -translate-x-1/2 animate-glow-pulse"></div>
          <div className="absolute bottom-0 left-1/2 w-3 h-3 bg-cosmic-violet rounded-full transform -translate-x-1/2 animate-glow-pulse" style={{animationDelay: '1s'}}></div>
          <div className="absolute left-0 top-1/2 w-3 h-3 bg-cosmic-star rounded-full transform -translate-y-1/2 animate-glow-pulse" style={{animationDelay: '2s'}}></div>
          <div className="absolute right-0 top-1/2 w-3 h-3 bg-cosmic-aurora rounded-full transform -translate-y-1/2 animate-glow-pulse" style={{animationDelay: '3s'}}></div>
          
          {/* Centre lumineux pulsant */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-cosmic-gold rounded-full blur-sm animate-glow-pulse"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-cosmic-star rounded-full animate-twinkle"></div>
        </motion.div>
      </div>

      {/* Contenu principal premium */}
      <div className="text-center z-10 relative max-w-5xl mx-auto">
        <motion.div 
          className="mb-12"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        >
          <motion.div
            animate={{ 
              rotate: [0, 5, -5, 0],
              scale: [1, 1.05, 1],
            }}
            transition={{ 
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <Sparkles className="w-20 h-20 text-cosmic-gold mx-auto mb-8 opacity-90" />
          </motion.div>
          
          <motion.h1 
            className="font-playfair italic text-7xl md:text-9xl font-bold mb-8 text-cosmic-divine leading-tight"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.5, delay: 0.3 }}
            style={{
              textShadow: '0 0 40px rgba(255, 215, 0, 0.6), 0 0 80px rgba(139, 123, 216, 0.4)',
            }}
          >
            Oracle Lumira
          </motion.h1>
          
          <motion.p 
            className="font-inter font-light text-xl md:text-2xl text-cosmic-ethereal max-w-4xl mx-auto leading-relaxed mb-12"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6 }}
          >
            Révèle ton archétype spirituel à travers des lectures vibratoires personnalisées sous la voûte céleste
          </motion.p>
        </motion.div>

        <motion.div 
          className="space-y-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.9 }}
        >
          <motion.button
            className="px-16 py-6 rounded-full bg-gradient-to-r from-cosmic-gold via-cosmic-gold-warm to-cosmic-gold text-cosmic-void font-inter font-semibold text-lg shadow-stellar hover:shadow-aurora transition-all duration-500 relative overflow-hidden group"
            onClick={() => {
              const levelsSection = document.getElementById('levels');
              levelsSection?.scrollIntoView({ behavior: 'smooth' });
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {/* Effet de brillance premium au survol */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
            <span className="relative z-10 flex items-center gap-3">
              <Star className="w-6 h-6" />
              Commencer mon tirage cosmique
              <Star className="w-6 h-6" />
            </span>
          </motion.button>

          <motion.p 
            className="font-inter font-light text-sm text-cosmic-silver"
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            ✨ Livraison en 24h • PDF + Audio + Mandala personnalisé ✨
          </motion.p>
        </motion.div>
      </div>

      {/* Indicateur de scroll premium */}
      <motion.div 
        className="absolute bottom-12 left-1/2 transform -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="flex flex-col items-center text-cosmic-gold opacity-80">
          <span className="font-inter font-light text-sm mb-3">Découvrir les mystères</span>
          <motion.div
            animate={{ 
              boxShadow: [
                '0 0 10px rgba(255, 215, 0, 0.3)',
                '0 0 20px rgba(255, 215, 0, 0.6)',
                '0 0 10px rgba(255, 215, 0, 0.3)',
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="p-2 rounded-full border border-cosmic-gold/50"
          >
            <ArrowDown className="w-5 h-5" />
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
};

export default Hero;