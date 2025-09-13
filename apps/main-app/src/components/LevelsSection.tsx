import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import LevelCard from "./LevelCard";
import type { Product } from "../types/products";
import ProductOrderService from "../services/productOrder";
import SpiritualWaves from "./SpiritualWaves";

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
    "from-mystical-aurora/30 to-mystical-water/20",
    "from-mystical-champagne/40 to-mystical-sage/20", 
    "from-mystical-sand/30 to-mystical-constellation/15",
    "from-mystical-copper/20 to-mystical-aurora/25",
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
    <section id="levels" className="py-32 relative bg-gradient-to-b from-mystical-pearl via-mystical-whisper to-mystical-flow overflow-hidden">
      {/* Ondulations spirituelles */}
      <SpiritualWaves intensity="medium" />
      
      {/* Constellation Background */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute bg-mystical-constellation/30 rounded-full"
            style={{
              width: `${1 + Math.random() * 2}px`,
              height: `${1 + Math.random() * 2}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0.2, 0.6, 0.2],
              scale: [0.8, 1.2, 0.8],
              y: [0, -20, 0],
            }}
            transition={{
              duration: 6 + Math.random() * 4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: Math.random() * 6,
            }}
          />
        ))}
      </div>
      
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
          className="text-center mb-24 relative z-10"
        >
          <h2 className="font-playfair italic text-5xl md:text-6xl font-medium mb-8 bg-gradient-to-r from-mystical-copper via-mystical-gold to-mystical-radiance bg-clip-text text-transparent drop-shadow-sm">
            Choisis ton niveau d'éveil
          </h2>
          <p className="font-inter font-light text-xl md:text-2xl text-mystical-night/80 max-w-4xl mx-auto leading-relaxed tracking-wide">
            Chaque niveau révèle une couche plus profonde de ton essence spirituelle
          </p>
          
          {/* Ligne décorative ondulante */}
          <motion.div
            className="w-32 h-0.5 bg-gradient-to-r from-transparent via-mystical-gold to-transparent mx-auto mt-8"
            animate={{
              scaleX: [1, 1.2, 1],
              opacity: [0.5, 0.8, 0.5],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </motion.div>

        {/* Loading */}
        {!levels && !error && (
          <motion.div 
            className="text-center text-mystical-night/70 py-16"
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
            className="text-center text-red-600 bg-red-50/80 backdrop-blur-sm p-6 rounded-2xl border border-red-200/50 max-w-md mx-auto"
          >
            <AlertCircle className="w-8 h-8 mx-auto mb-3 text-red-500" />
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