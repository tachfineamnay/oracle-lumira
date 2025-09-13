import React, { useEffect, useState } from 'react';
import { Loader, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import LevelCard from './LevelCard';
import type { Product } from '../types/products';
import ProductOrderService from '../services/productOrder';

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

const levelOrder = ['initie', 'mystique', 'profond', 'integrale'] as const;

function mapProductsToLevels(products: Product[]): LevelCardData[] {
  const sorted = [...products].sort(
    (a, b) => levelOrder.indexOf(a.level) - levelOrder.indexOf(b.level)
  );

  const gradients = [
    'from-cosmic-deep/80 via-cosmic-nebula/60 to-cosmic-galaxy/40',
    'from-cosmic-violet/60 via-cosmic-aurora/40 to-cosmic-nebula/60',
    'from-cosmic-galaxy/70 via-cosmic-stardust/50 to-cosmic-celestial/30',
    'from-cosmic-aurora/80 via-cosmic-violet/60 to-cosmic-magenta/40',
  ];

  return sorted.map((p, idx) => ({
    id: idx + 1,
    title: p.name,
    subtitle: p.level,
    price: ProductOrderService.formatPrice(p.amountCents, p.currency),
    duration: p.metadata?.duration || '',
    description: p.description,
    includes: p.features || [],
    gradient: gradients[idx % gradients.length],
    recommended: p.level === 'mystique' || idx === 1,
    productId: p.id,
  }));
}

const LevelsSection: React.FC = () => {
  const [levels, setLevels] = useState<LevelCardData[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const catalog = await ProductOrderService.getCatalog();
        if (!mounted) return;
        setLevels(mapProductsToLevels(catalog));
      } catch (e) {
        console.error('Failed to load product catalog:', e);
        if (!mounted) return;
        setError('Impossible de charger le catalogue produits');
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <section id="levels" className="py-32 relative overflow-hidden">
      {/* Nébuleuse de section */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cosmic-nebula/10 to-transparent"></div>
      
      <div className="container mx-auto px-6 relative z-10">
        <motion.div 
          className="text-center mb-24"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
        >
          <motion.h2 
            className="font-playfair italic text-6xl md:text-7xl font-bold mb-8 text-cosmic-divine"
            style={{
              textShadow: '0 0 30px rgba(255, 215, 0, 0.4)',
            }}
          >
            Choisis ton niveau d'éveil
          </motion.h2>
          <motion.p 
            className="font-inter font-light text-xl md:text-2xl text-cosmic-ethereal max-w-4xl mx-auto leading-relaxed"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
            viewport={{ once: true }}
          >
            Chaque niveau révèle une couche plus profonde de ton essence cosmique
          </motion.p>
        </motion.div>

        {/* Loading */}
        {!levels && !error && (
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
            <p className="font-inter font-light">Chargement du catalogue cosmique...</p>
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
            <p className="font-inter font-light">{error}</p>
          </motion.div>
        )}

        {/* Grid des niveaux */}
        {levels && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
            {levels.map((level, index) => (
              <motion.div 
                key={level.productId || level.id}
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ 
                  duration: 0.8, 
                  delay: index * 0.2,
                  ease: "easeOut"
                }}
                viewport={{ once: true }}
                whileHover={{ 
                  y: -10,
                  transition: { duration: 0.3 }
                }}
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