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

  // Gradients organiques et doux
  const gradients = [
    "from-lumira-aurora/30 to-lumira-water/20",
    "from-lumira-champagne/40 to-lumira-sage/20", 
    "from-lumira-sand/30 to-lumira-constellation/15",
    "from-lumira-copper/20 to-lumira-aurora/25",
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
    <section id="levels" className="py-24 relative bg-gradient-to-b from-lumira-pearl to-lumira-mist">
      {/* Constellation Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/3 w-2 h-2 bg-lumira-constellation/40 rounded-full animate-constellation"></div>
        <div className="absolute top-1/2 right-1/4 w-1 h-1 bg-lumira-constellation/30 rounded-full animate-constellation" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-1/3 left-1/4 w-1.5 h-1.5 bg-lumira-constellation/35 rounded-full animate-constellation" style={{animationDelay: '4s'}}></div>
        <div className="absolute top-3/4 right-1/3 w-1 h-1 bg-lumira-constellation/25 rounded-full animate-constellation" style={{animationDelay: '6s'}}></div>
      </div>
      
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 className="font-playfair italic text-5xl md:text-6xl font-medium mb-6 bg-gradient-to-r from-lumira-copper via-lumira-gold-soft to-lumira-bronze bg-clip-text text-transparent">
            Choisis ton niveau d'�veil
          </h2>
          <p className="font-inter font-light text-xl text-lumira-night/70 max-w-3xl mx-auto">
            Chaque niveau r�v�le une couche plus profonde de ton essence spirituelle
          </p>
        </motion.div>

        {/* Loading */}
        {!levels && !error && (
          <div className="text-center text-lumira-night/60">Chargement du catalogue...</div>
        )}

        {/* Error */}
        {error && (
          <div className="text-center text-red-500/80 bg-red-50 p-4 rounded-2xl">{error}</div>
        )}

        {/* Grid */}
        {levels && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto relative z-10">
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

