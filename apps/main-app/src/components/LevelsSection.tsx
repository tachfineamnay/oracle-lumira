import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Loader, AlertCircle } from 'lucide-react';
import LevelCard from "./LevelCard";
import type { Product } from "../types/products";
import ProductOrderService from "../services/productOrder";

// Type local utilisé par la carte
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

const levelOrder = ["initie", "mystique", "profond", "integrale"] as const;

function mapProductsToLevels(products: Product[]): LevelCardData[] {
  const sorted = [...products].sort(
    (a, b) => levelOrder.indexOf(a.level) - levelOrder.indexOf(b.level)
  );

  const gradients = [
    "from-mystical-purple/20 to-mystical-gold/20",
    "from-mystical-gold/20 to-mystical-purple/20", 
    "from-mystical-dark/30 to-mystical-purple/30",
    "from-mystical-gold/30 to-mystical-dark/20",
  ];

  return sorted.map((p, idx) => ({
    id: idx + 1,
    title: p.name,
    subtitle: p.level,
    price: ProductOrderService.formatPrice(p.amountCents, p.currency),
    duration: p.metadata?.duration || "",
    description: p.description,
    includes: p.features || [],
    gradient: gradients[idx % gradients.length],
    recommended: p.level === "mystique" || idx === 1,
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
        console.error("Failed to load product catalog:", e);
        if (!mounted) return;
        setError("Impossible de charger le catalogue produits");
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <section id="levels" className="py-32 relative bg-gradient-to-br from-mystical-dark via-mystical-purple to-mystical-dark overflow-hidden">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
          className="text-center mb-24 relative z-10"
        >
          <h2 className="font-playfair text-5xl md:text-6xl font-bold mb-8 bg-gradient-to-r from-mystical-gold to-mystical-gold-light bg-clip-text text-transparent">
            Choisis ton niveau d'éveil
          </h2>
          <p className="font-inter text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
            Chaque niveau révèle une couche plus profonde de ton essence spirituelle
          </p>
        </motion.div>

        {/* Loading */}
        {!levels && !error && (
          <motion.div 
            className="text-center text-gray-300 py-16"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Loader className="w-8 h-8 mx-auto mb-4 text-mystical-gold animate-spin" />
            <p className="font-inter">Chargement du catalogue spirituel...</p>
          </motion.div>
        )}

        {/* Error */}
        {error && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center text-red-400 bg-red-900/20 p-6 rounded-2xl border border-red-500/30 max-w-md mx-auto"
          >
            <AlertCircle className="w-8 h-8 mx-auto mb-3" />
            <p className="font-inter">{error}</p>
          </motion.div>
        )}

        {/* Grid */}
        {levels && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto relative z-10">
            {levels.map((level, index) => (
              <motion.div
                key={level.productId || level.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.15 }}
                viewport={{ once: true }}
                whileHover={{ y: -8 }}
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