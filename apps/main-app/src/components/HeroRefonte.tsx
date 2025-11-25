import React from 'react';
import { Clock, Sparkles, Shield, LogIn } from 'lucide-react';

/**
 * HeroRefonte - Hero section modernisée avec glassmorphisme
 * VERSION SANS FRAMER MOTION pour compatibilité build
 */
const HeroRefonte: React.FC = () => {
  return (
    <section className="min-h-screen flex flex-col items-center justify-center relative px-6 overflow-hidden">
      {/* Bouton Flottant "Déjà client ?" */}
      <div className="absolute top-6 right-6 z-50">
        <a
          href="/sanctuaire/login"
          className="group flex items-center gap-2 px-4 py-2.5 bg-white/5 backdrop-blur-md border border-white/10 hover:border-cosmic-gold/40 rounded-full transition-all duration-300 hover:bg-white/10 hover:scale-105"
        >
          <LogIn className="w-4 h-4 text-cosmic-gold/80 group-hover:text-cosmic-gold transition-colors" />
          <span className="text-sm font-medium text-white/70 group-hover:text-white transition-colors">
            Déjà client ?
          </span>
          <div className="w-1.5 h-1.5 bg-cosmic-gold rounded-full animate-pulse" />
        </a>
      </div>

      {/* Mandala cosmique premium en arrière-plan */}
      <div className="absolute inset-0 flex items-center justify-center opacity-15">
        <div className="relative w-[500px] h-[500px] animate-spin" style={{animationDuration: '60s'}}>
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
        </div>
      </div>

      {/* Contenu principal */}
      <div className="relative z-10 text-center max-w-5xl mx-auto">
        {/* Titre principal */}
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold mb-6 leading-tight">
          <span className="bg-gradient-to-r from-cosmic-gold via-cosmic-aurora to-cosmic-violet bg-clip-text text-transparent">
            Oracle Lumira
          </span>
        </h1>

        {/* Sous-titre */}
        <p className="text-xl sm:text-2xl md:text-3xl text-white/90 mb-8 leading-relaxed max-w-3xl mx-auto">
          Explore les lois cachées de ton identité cosmique
        </p>

        {/* Description */}
        <p className="text-base sm:text-lg text-white/80 mb-12 max-w-2xl mx-auto">
          Grâce à une cartographie vibratoire personnalisée, Oracle Lumira décrypte les trames subtiles de ton archétype spirituel. 
          Entre analyse fractale, algorithmes mystiques et résonances stellaires, reçois une lecture unique de ton code originel.
        </p>

        {/* CTA Principal */}
        <div className="mb-8">
          <a
            href="#levels"
            className="inline-block px-10 py-5 bg-gradient-to-r from-cosmic-gold to-cosmic-aurora text-cosmic-void font-semibold text-lg rounded-full hover:shadow-stellar transition-all duration-300 hover:scale-105"
          >
            Lancer mon exploration cosmique
          </a>
        </div>

        {/* Badges sous le CTA */}
        <p className="text-sm text-cosmic-gold/80 mb-16 flex items-center justify-center gap-2 flex-wrap">
          <span className="flex items-center gap-1">
            <Sparkles className="w-4 h-4" />
            Analyse sous 24h
          </span>
          <span>•</span>
          <span>PDF initiatique + Audio 432Hz + Mandala fractal</span>
          <span className="flex items-center gap-1">
            <Sparkles className="w-4 h-4" />
          </span>
        </p>

        {/* Points de réassurance - Cards glassmorphiques */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
          {/* Card 1 : Livraison rapide */}
          <div className="p-5 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 hover:border-cosmic-gold/30 transition-all duration-300 hover:-translate-y-1">
            <Clock className="w-6 h-6 text-cosmic-gold mb-3 mx-auto" />
            <p className="text-base text-white/90 font-medium">Analyse sous 24h</p>
          </div>

          {/* Card 2 : Pack complet */}
          <div className="p-5 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 hover:border-cosmic-gold/30 transition-all duration-300 hover:-translate-y-1">
            <Sparkles className="w-6 h-6 text-cosmic-gold mb-3 mx-auto" />
            <p className="text-base text-white/90 font-medium">Pack Complet Inclus</p>
          </div>

          {/* Card 3 : Sécurité */}
          <div className="p-5 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 hover:border-cosmic-gold/30 transition-all duration-300 hover:-translate-y-1">
            <Shield className="w-6 h-6 text-cosmic-gold mb-3 mx-auto" />
            <p className="text-base text-white/90 font-medium">100% Sécurisé</p>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
        <a href="#levels" className="text-cosmic-gold/60 hover:text-cosmic-gold transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </a>
      </div>
    </section>
  );
};

export default HeroRefonte;
