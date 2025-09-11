import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
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
  // Conserver un ordre stable par niveau
  const sorted = [...products].sort(
    (a, b) => levelOrder.indexOf(a.level) - levelOrder.indexOf(b.level)
  );

  const gradients = [
    "from-mystical-gold/20 to-mystical-amber/20",
    "from-mystical-purple/20 to-mystical-gold/20",
    "from-mystical-amber/20 to-mystical-purple/20",
    "from-mystical-gold/30 to-mystical-purple/30",
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
    <section id="levels" className="py-24 relative">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 className="font-playfair italic text-5xl md:text-6xl font-medium mb-6 bg-gradient-to-r from-mystical-gold via-mystical-gold-light to-mystical-amber bg-clip-text text-transparent">
            Choisis ton niveau d'�veil
          </h2>
          <p className="font-inter font-light text-xl text-gray-300 max-w-3xl mx-auto">
            Chaque niveau r�v�le une couche plus profonde de ton essence spirituelle
          </p>
        </motion.div>

        {/* Loading */}
        {!levels && !error && (
          <div className="text-center text-gray-400">Chargement du catalogue...</div>
        )}

        {/* Error */}
        {error && (
          <div className="text-center text-red-400">{error}</div>
        )}

        {/* Grid */}
        {levels && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
            {levels.map((level, index) => (
              <motion.div
                key={level.productId || level.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
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

