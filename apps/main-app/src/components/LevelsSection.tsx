import React from 'react';
import { Loader, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import LevelCard from './LevelCard';
import { useProducts } from '../hooks/useProductsSimple';
import type { ProductWithUpload } from '../hooks/useProductsSimple';

interface LevelCardData {
  id: number;
  title: string;
  subtitle: string;
  price: string;
  duration: string;
  description: string;
  includes: string[];
  gradient: string;
  recommended: boolean;
  productId?: string;
}

// Suppression de la variable levelOrder non utilisée
// const levelOrder = ['initie', 'mystique', 'profond', 'integrale'] as const;

function mapProductsToLevels(products: ProductWithUpload[]): LevelCardData[] {
  const gradients = [
    'from-cosmic-deep/80 via-cosmic-nebula/60 to-cosmic-galaxy/40',
    'from-cosmic-violet/60 via-cosmic-aurora/40 to-cosmic-nebula/60',
    'from-cosmic-galaxy/70 via-cosmic-stardust/50 to-cosmic-celestial/30',
    'from-cosmic-aurora/80 via-cosmic-violet/60 to-cosmic-magenta/40',
  ];

  return products.map((product, idx) => ({
    id: idx + 1,
    title: product.title,
    subtitle: product.id,
    price: new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(product.price),
    duration: `${product.uploadConfig.maxFiles} documents max`,
    description: `Analyse karmique ${product.title.toLowerCase()}`,
    includes: product.features || [],
    gradient: gradients[idx % gradients.length],
    recommended: product.badge === 'Populaire',
    productId: product.id,
  }));
}

const LevelsSection: React.FC = () => {
  const { products, isLoading, error } = useProducts();

  // Transformation pour compatibilité avec LevelCard existant
  const levels = products ? mapProductsToLevels(products) : null;

  return (
    <section id="levels" className="py-12 sm:py-16 lg:py-24 xl:py-32 relative overflow-hidden">
      {/* Nébuleuse de section - RESPONSIVE */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cosmic-nebula/8 sm:via-cosmic-nebula/10 to-transparent"></div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div 
          className="text-center mb-12 sm:mb-16 lg:mb-20 xl:mb-24"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
        >
          <motion.h2 
            className="font-playfair italic text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-6 sm:mb-8 text-cosmic-divine leading-tight px-2"
            style={{
              textShadow: '0 0 30px rgba(255, 215, 0, 0.4)',
            }}
          >
            L'Ascension des Niveaux d'Éveil
          </motion.h2>
          <motion.p 
            className="font-inter font-light text-base sm:text-lg md:text-xl lg:text-2xl text-cosmic-ethereal max-w-4xl mx-auto leading-relaxed px-4 mb-4"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
            viewport={{ once: true }}
          >
            Tu n'achètes pas un produit. Tu ouvres une porte.
          </motion.p>
          <motion.p 
            className="font-inter font-light text-lg text-cosmic-gold max-w-4xl mx-auto leading-relaxed px-4"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            viewport={{ once: true }}
          >
            Chaque niveau est une clef vibratoire pour franchir les couches profondes de ta conscience.
          </motion.p>
        </motion.div>

        {/* Loading */}
        {isLoading && (
          <motion.div 
            className="text-center text-cosmic-ethereal py-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <Loader className="w-8 h-8 mx-auto mb-4 text-cosmic-gold" />
            </motion.div>
            <p className="font-inter font-light">Synchronisation des niveaux cosmiques...</p>
          </motion.div>
        )}

        {/* Error */}
        {error && (
          <motion.div 
            className="text-center text-red-400 bg-red-900/20 backdrop-blur-sm p-6 rounded-2xl border border-red-500/30 max-w-md mx-auto"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <AlertCircle className="w-8 h-8 mx-auto mb-3" />
            <p className="font-inter font-light">
              {error instanceof Error ? error.message : 'Impossible de charger le catalogue produits'}
            </p>
          </motion.div>
        )}

        {/* Grid des niveaux - RESPONSIVE OPTIMISÉ */}
        {levels && (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 max-w-8xl mx-auto">
            {levels.map((level, index) => (
              <motion.div 
                key={level.productId || level.id}
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ 
                  duration: 0.8, 
                  delay: index * 0.15,
                  ease: "easeOut"
                }}
                viewport={{ once: true }}
                whileHover={{ 
                  y: -8,
                  transition: { duration: 0.3 }
                }}
                className="h-full"
              >
                <LevelCard level={level} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default LevelsSection;