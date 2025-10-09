import React from 'react';
import { Clock, Sparkles, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * HeroRefonte - Hero section modernisée avec glassmorphisme
 * 
 * CHANGEMENTS vs version originale :
 * ✅ Points de réassurance transformés en cards glassmorphiques
 * ✅ Contraste optimisé (text-white/90 au lieu de text-cosmic-ethereal)
 * ✅ Icônes thématiques (Clock, Sparkles, Shield)
 * ✅ Responsive : text-xl → text-3xl sur mobile
 */
const HeroRefonte: React.FC = () => {
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
          
          {/* Points lumineux animés */}
          <div className="absolute top-0 left-1/2 w-3 h-3 bg-cosmic-gold rounded-full transform -translate-x-1/2 animate-glow-pulse"></div>
          <div className="absolute bottom-0 left-1/2 w-3 h-3 bg-cosmic-violet rounded-full transform -translate-x-1/2 animate-glow-pulse" style={{animationDelay: '1s'}}></div>
          <div className="absolute left-0 top-1/2 w-3 h-3 bg-cosmic-star rounded-full transform -translate-y-1/2 animate-glow-pulse" style={{animationDelay: '2s'}}></div>
          <div className="absolute right-0 top-1/2 w-3 h-3 bg-cosmic-aurora rounded-full transform -translate-y-1/2 animate-glow-pulse" style={{animationDelay: '3s'}}></div>
        </motion.div>
      </div>

      {/* Contenu principal */}
      <div className="relative z-10 text-center max-w-5xl mx-auto">
        {/* Badge premium */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-block mb-8 px-6 py-2 bg-cosmic-gold/10 border border-cosmic-gold/30 rounded-full"
        >
          <span className="text-cosmic-gold text-sm font-medium uppercase tracking-wider">
            Oracle de Numérologie Premium
          </span>
        </motion.div>

        {/* Titre principal */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-5xl sm:text-6xl md:text-7xl font-bold mb-6 leading-tight"
        >
          <span className="bg-gradient-to-r from-cosmic-gold via-cosmic-aurora to-cosmic-violet bg-clip-text text-transparent">
            Oracle Lumira
          </span>
        </motion.h1>

        {/* Sous-titre */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-xl sm:text-2xl md:text-3xl text-white/90 mb-8 leading-relaxed max-w-3xl mx-auto"
        >
          Découvre ton chemin de vie à travers les mystères de la numérologie sacrée
        </motion.p>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-base sm:text-lg text-white/80 mb-12 max-w-2xl mx-auto"
        >
          Une analyse complète et personnalisée de ton thème numérologique pour révéler tes dons cachés, 
          tes défis karmiques et ton potentiel spirituel authentique.
        </motion.p>

        {/* CTA Principal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mb-16"
        >
          <a
            href="#levels"
            className="inline-block px-10 py-5 bg-gradient-to-r from-cosmic-gold to-cosmic-aurora text-cosmic-void font-semibold text-lg rounded-full hover:shadow-stellar transition-all duration-300 hover:scale-105"
          >
            Découvrir les Niveaux d'Oracle
          </a>
        </motion.div>

        {/* Points de réassurance - REFONTE : Cards glassmorphiques avec icônes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto"
        >
          {/* Card 1 : Livraison rapide */}
          <motion.div
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            className="p-5 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 hover:border-cosmic-gold/30 transition-all duration-300"
          >
            <Clock className="w-6 h-6 text-cosmic-gold mb-3 mx-auto" />
            <p className="text-base text-white/90 font-medium">Analyse sous 24h</p>
          </motion.div>

          {/* Card 2 : Pack complet */}
          <motion.div
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            className="p-5 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 hover:border-cosmic-gold/30 transition-all duration-300"
          >
            <Sparkles className="w-6 h-6 text-cosmic-gold mb-3 mx-auto" />
            <p className="text-base text-white/90 font-medium">Pack Complet Inclus</p>
          </motion.div>

          {/* Card 3 : Sécurité */}
          <motion.div
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            className="p-5 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 hover:border-cosmic-gold/30 transition-all duration-300"
          >
            <Shield className="w-6 h-6 text-cosmic-gold mb-3 mx-auto" />
            <p className="text-base text-white/90 font-medium">100% Sécurisé</p>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <a href="#levels" className="text-cosmic-gold/60 hover:text-cosmic-gold transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </a>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default HeroRefonte;
