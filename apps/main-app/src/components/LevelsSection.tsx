import React, { useEffect, useState } from 'react';
import { Loader, AlertCircle } from 'lucide-react';
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
    'from-mystical-midnight/60 to-mystical-deep-blue/40',
    'from-mystical-abyss/60 to-mystical-navy/50',
    'from-mystical-forest-dark/40 to-mystical-forest-deep/30',
    'from-mystical-midnight/60 to-mystical-black/50',
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
    <section id="levels" className="py-32 relative bg-gradient-to-b from-mystical-abyss via-mystical-midnight to-mystical-deep-blue overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="text-center mb-24 relative z-10">
          <h2 className="font-playfair italic text-5xl md:text-6xl font-medium mb-8 text-mystical-starlight">
            Choisis ton niveau d'éveil
          </h2>
          <p className="font-inter font-light text-xl md:text-2xl text-mystical-silver max-w-4xl mx-auto leading-relaxed">
            Chaque niveau révèle une couche plus profonde de ton essence spirituelle
          </p>
        </div>

        {!levels && !error && (
          <div className="text-center text-mystical-silver/80 py-16">
            <Loader className="w-8 h-8 mx-auto mb-4 text-mystical-gold animate-spin" />
            <p className="font-inter">Chargement du catalogue spirituel...</p>
          </div>
        )}

        {error && (
          <div className="text-center text-red-400 bg-red-900/20 backdrop-blur-sm p-6 rounded-2xl border border-red-800/40 max-w-md mx-auto">
            <AlertCircle className="w-8 h-8 mx-auto mb-3 text-red-500" />
            <p className="font-inter">{error}</p>
          </div>
        )}

        {levels && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto relative z-10">
            {levels.map((level) => (
              <div key={level.productId || level.id} className="transition-transform duration-300 hover:-translate-y-2">
                <LevelCard level={level} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default LevelsSection;

