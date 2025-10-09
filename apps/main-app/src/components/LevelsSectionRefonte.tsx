import React from 'react';
import { Loader, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import LevelCardRefonte from './LevelCardRefonte';
import { useProducts } from '../hooks/useProductsSimple';
import type { ProductWithUpload } from '../hooks/useProductsSimple';

/**
 * LevelsSectionRefonte - Section tarifs avec carrousel mobile
 * 
 * CHANGEMENTS vs version originale :
 * ✅ MOBILE : Carrousel horizontal avec snap scroll (au lieu de scroll vertical)
 * ✅ DESKTOP : Grille 4 colonnes classique
 * ✅ Indicateurs de scroll visuels
 * ✅ Hint text pour guider le swipe mobile
 * ✅ Cards 320px de largeur fixe sur mobile
 */
const LevelsSectionRefonte: React.FC = () => {
  const { products, loading, error } = useProducts();

  if (loading) {
    return (
      <section id="levels" className="py-24 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <Loader className="w-12 h-12 text-cosmic-gold animate-spin mx-auto" />
          <p className="text-cosmic-ethereal mt-4">Chargement des oracles...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="levels" className="py-24 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-red-400">{error}</p>
        </div>
      </section>
    );
  }

  return (
    <section id="levels" className="py-24 px-6 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cosmic-gold rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cosmic-violet rounded-full filter blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-cosmic-gold via-cosmic-aurora to-cosmic-violet bg-clip-text text-transparent">
              Choisis ton Niveau d'Oracle
            </span>
          </h2>
          <p className="text-xl text-white/80 max-w-3xl mx-auto">
            Quatre niveaux d'analyse pour révéler les secrets de ton chemin de vie
          </p>
        </motion.div>

        {/* DESKTOP : Grille classique 4 colonnes */}
        <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product, index) => (
            <LevelCardRefonte key={product.id} level={product} index={index} />
          ))}
        </div>

        {/* MOBILE : Carrousel horizontal avec snap scroll - REFONTE MAJEURE */}
        <div className="sm:hidden">
          {/* Hint text pour guider l'utilisateur */}
          <div className="text-center mb-4">
            <p className="text-white/60 text-sm">
              👈 Glissez pour découvrir tous les niveaux 👉
            </p>
          </div>

          {/* Container avec scroll horizontal */}
          <div className="overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-8">
            <div className="flex gap-4 px-4" style={{ width: 'max-content' }}>
              {products.map((product, index) => (
                <div
                  key={product.id}
                  className="snap-center"
                  style={{ width: '320px', minWidth: '320px' }}
                >
                  <LevelCardRefonte level={product} index={index} />
                </div>
              ))}
            </div>
          </div>

          {/* Indicateurs de scroll (dots) */}
          <div className="flex justify-center gap-2 mt-6">
            {products.map((product, index) => (
              <div
                key={product.id}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === 0 ? 'bg-cosmic-gold w-8' : 'bg-white/30'
                }`}
              ></div>
            ))}
          </div>
        </div>

        {/* Note en bas */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="text-center mt-16"
        >
          <p className="text-white/60 text-sm">
            ✨ Toutes les analyses incluent une consultation personnalisée avec nos experts ✨
          </p>
        </motion.div>
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  );
};

export default LevelsSectionRefonte;
