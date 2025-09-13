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
      className={`relative p-8 rounded-3xl bg-white/85 backdrop-blur-md border border-mystical-gold/40 shadow-spiritual transition-all duration-500 hover:shadow-energy hover:scale-105 cursor-pointer group h-full flex flex-col overflow-hidden`}
      whileHover={{ y: -10 }}
      onClick={handleChooseLevel}
    >
      {/* Recommended Badge */}
      {level.recommended && (
        <motion.div
          className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-mystical-gold to-mystical-radiance text-mystical-night px-5 py-2 rounded-full text-sm font-semibold shadow-spiritual"
          animate={{
            scale: [1, 1.05, 1],
            boxShadow: [
              '0 4px 20px rgba(232, 213, 183, 0.2)',
              '0 6px 25px rgba(232, 213, 183, 0.3)',
              '0 4px 20px rgba(232, 213, 183, 0.2)',
            ],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          ⭐ Populaire
        </motion.div>
      )}

      {/* Glow Effect */}
      <motion.div 
        className="absolute inset-0 rounded-3xl bg-gradient-to-br from-mystical-aurora/25 to-mystical-harmony/15 opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-xl"
        animate={{
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      
      {/* Organic Background Pattern */}
      <div className="absolute inset-0 rounded-3xl overflow-hidden">
        <motion.div 
          className="absolute top-0 right-0 w-24 h-24 bg-mystical-constellation/8 rounded-full blur-2xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div 
          className="absolute bottom-0 left-0 w-32 h-32 bg-mystical-sage/8 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
        />
        
        {/* Ondulation de carte */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-mystical-gold/5 to-mystical-water/5 rounded-3xl"
          animate={{
            opacity: [0, 0.3, 0],
            scale: [1, 1.02, 1],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
        />
      </div>

      <div className="relative z-10 flex flex-col h-full">
        {/* Header */}
        <div className="text-center mb-6">
          <motion.div 
            className="w-16 h-16 rounded-full bg-gradient-to-br from-mystical-gold/25 to-mystical-champagne/35 flex items-center justify-center mx-auto mb-4 group-hover:from-mystical-gold/45 group-hover:to-mystical-radiance/55 transition-all duration-500 shadow-harmony"
            animate={{
              boxShadow: [
                '0 4px 24px rgba(156, 175, 136, 0.08)',
                '0 6px 30px rgba(156, 175, 136, 0.12)',
                '0 4px 24px rgba(156, 175, 136, 0.08)',
              ],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <span className="text-2xl font-playfair italic text-mystical-night/80 font-medium">
              {['I', 'II', 'III', 'IV'][level.id - 1]}
            </span>
          </motion.div>
          
          <h3 className="font-playfair italic text-2xl font-medium text-mystical-night/90 mb-2 tracking-wide">
            {level.title}
          </h3>
          <p className="font-inter text-sm text-mystical-constellation/80 mb-4 tracking-wide">{level.subtitle}</p>
          
          <div className="flex items-baseline justify-center gap-2 mb-2">
            <span className="text-3xl font-semibold text-mystical-copper/90">{level.price}</span>
            <span className="text-sm text-mystical-night/70">• {level.duration}</span>
          </div>
        </div>

        {/* Description */}
        <p className="font-inter text-sm text-mystical-night/80 leading-relaxed mb-6 flex-grow tracking-wide">
          {level.description}
        </p>

        {/* Includes */}
        <div className="space-y-2 mb-8">
          {level.includes.map((item, index) => (
            <motion.div 
              key={index} 
              className="flex items-center gap-3"
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <motion.div 
                className="w-2 h-2 rounded-full bg-mystical-sage/80 flex-shrink-0"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.6, 1, 0.6],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: index * 0.5,
                }}
              />
              <span className="font-inter text-sm text-mystical-night/85 tracking-wide">{item}</span>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.button
          onClick={handleChooseLevel}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-mystical-gold via-mystical-radiance to-mystical-champagne text-mystical-night font-inter font-semibold transition-all duration-500 hover:shadow-energy hover:from-mystical-copper hover:to-mystical-luminous relative overflow-hidden group"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {/* Effet d'ondulation au survol */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-mystical-luminous/20 to-mystical-gold/20 rounded-2xl"
            initial={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4 }}
          />
          <span className="relative z-10">
          Entrer dans cette étape
          </span>
        </motion.button>
      </div>
    </motion.div>
  );
};

export default LevelCard;
