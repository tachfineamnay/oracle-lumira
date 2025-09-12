import React from 'react';
import { motion } from 'framer-motion';
import { Check, Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Level {
  id: number;
  title: string;
  subtitle: string;
  price: string;
  duration: string;
  description: string;
  includes: string[];
  gradient: string;
  recommended: boolean;
  productId?: string; // Map to product catalog
}

interface LevelCardProps {
  level: Level;
}

const LevelCard: React.FC<LevelCardProps> = ({ level }) => {
  const navigate = useNavigate();

  const handleChooseLevel = () => {
    // Map level ID to product ID for the new SPA checkout
    const productIdMap: Record<number, string> = {
      1: 'initie',
      2: 'mystique',
      3: 'profond',
      4: 'integrale'
    };
    
    const productId = productIdMap[level.id] || level.productId;
    
    if (productId) {
      // Navigate to the new SPA product checkout
      navigate(`/commande?product=${productId}`);
    } else {
      // Fallback to old system
      navigate(`/commande?level=${level.id}`);
    }
  };

  return (
    <motion.div
      className={`relative p-8 rounded-3xl bg-white/80 backdrop-blur-sm border border-lumira-gold-soft/30 shadow-soft transition-all duration-500 hover:shadow-aurora hover:scale-105 cursor-pointer group h-full flex flex-col`}
      whileHover={{ y: -10 }}
      onClick={handleChooseLevel}
    >
      {/* Recommended Badge */}
      {level.recommended && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-lumira-gold-soft to-lumira-champagne text-lumira-night px-4 py-1 rounded-full text-sm font-semibold shadow-soft">
          ⭐ Populaire
        </div>
      )}

      {/* Glow Effect */}
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-lumira-aurora/30 to-lumira-water/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl" />
      
      {/* Organic Background Pattern */}
      <div className="absolute inset-0 rounded-3xl overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-lumira-constellation/10 rounded-full blur-2xl"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-lumira-sage/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 flex flex-col h-full">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-lumira-gold-soft/20 to-lumira-champagne/30 flex items-center justify-center mx-auto mb-4 group-hover:from-lumira-gold-soft/40 group-hover:to-lumira-champagne/50 transition-all duration-300 shadow-constellation">
            <span className="text-2xl font-playfair italic text-lumira-night/80 font-medium">
              {['I', 'II', 'III', 'IV'][level.id - 1]}
            </span>
          </div>
          
          <h3 className="font-playfair italic text-2xl font-medium text-lumira-night mb-1">
            {level.title}
          </h3>
          <p className="font-inter text-sm text-lumira-constellation mb-4">{level.subtitle}</p>
          
          <div className="flex items-baseline justify-center gap-2 mb-2">
            <span className="text-3xl font-semibold text-lumira-copper">{level.price}</span>
            <span className="text-sm text-lumira-night/60">• {level.duration}</span>
          </div>
        </div>

        {/* Description */}
        <p className="font-inter text-sm text-lumira-night/70 leading-relaxed mb-6 flex-grow">
          {level.description}
        </p>

        {/* Includes */}
        <div className="space-y-2 mb-8">
          {level.includes.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-lumira-sage flex-shrink-0"></div>
              <span className="font-inter text-sm text-lumira-night/80">{item}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <motion.button
          onClick={handleChooseLevel}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-lumira-gold-soft to-lumira-champagne text-lumira-night font-inter font-semibold transition-all duration-300 hover:shadow-aurora hover:from-lumira-copper hover:to-lumira-gold-soft"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Entrer dans cette étape
        </motion.button>
      </div>
    </motion.div>
  );
};

export default LevelCard;