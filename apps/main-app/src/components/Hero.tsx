import React from 'react';
import { ArrowDown, Sparkles } from 'lucide-react';

const Hero: React.FC = () => {
  return (
    <section className="min-h-screen flex flex-col items-center justify-center relative px-6 bg-gradient-to-br from-mystical-black via-mystical-midnight to-mystical-deep-blue overflow-hidden">
      {/* Mandala central simplifié */}
      <div className="absolute inset-0 flex items-center justify-center opacity-10">
        <div className="w-96 h-96 relative">
          {/* Cercle extérieur */}
          <div className="absolute inset-0 border border-mystical-moonlight/30 rounded-full"></div>
          {/* Cercle moyen */}
          <div className="absolute inset-8 border border-mystical-moonlight/20 rounded-full"></div>
          {/* Cercle intérieur */}
          <div className="absolute inset-16 border border-mystical-moonlight/15 rounded-full"></div>
          {/* Centre lumineux */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-mystical-moonlight/20 rounded-full blur-xl"></div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="text-center z-10 relative max-w-4xl mx-auto">
        <div className="mb-8">
          <Sparkles className="w-12 h-12 text-mystical-moonlight mx-auto mb-6 opacity-80" />
          <h1 className="font-playfair text-6xl md:text-8xl font-bold mb-8 text-mystical-starlight">
            Oracle Lumira
          </h1>
          <p className="font-inter text-xl md:text-2xl text-mystical-silver max-w-3xl mx-auto leading-relaxed">
            Révèle ton archétype spirituel à travers des lectures vibratoires personnalisées
          </p>
        </div>

        <div className="space-y-6">
          <button
            className="px-12 py-5 rounded-full bg-mystical-midnight border border-mystical-moonlight/30 text-mystical-starlight font-inter font-semibold text-lg shadow-moonlight hover:bg-mystical-deep-blue transition-all duration-500"
            onClick={() => {
              const levelsSection = document.getElementById('levels');
              levelsSection?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            Commencer mon tirage
          </button>

          <p className="font-inter text-sm text-mystical-silver">
            🔮 Livraison en 24h • PDF + Audio + Mandala personnalisé
          </p>
        </div>
      </div>

      {/* Indicateur de scroll */}
      <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2">
        <div className="flex flex-col items-center text-mystical-moonlight opacity-60">
          <span className="font-inter text-sm mb-3">Découvrir</span>
          <ArrowDown className="w-5 h-5" />
        </div>
      </div>
    </section>
  );
};

export default Hero;