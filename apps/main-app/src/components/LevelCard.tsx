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
  productId?: string;
}

interface LevelCardProps {
  level: Level;
}

const LevelCard: React.FC<LevelCardProps> = ({ level }) => {
  const navigate = useNavigate();

  const handleChooseLevel = () => {
    const productIdMap: Record<number, string> = {
      1: 'initie',
      2: 'mystique',
      3: 'profond',
      4: 'integrale'
    };
    
    const productId = productIdMap[level.id] || level.productId;
    
    if (productId) {
      navigate(`/commande?product=${productId}`);
    } else {
      navigate(`/commande?level=${level.id}`);
    }
  };

  return (
    <motion.div
      className={`relative p-8 rounded-3xl bg-gradient-to-br from-mystical-dark/50 to-mystical-purple/30 backdrop-blur-sm border border-mystical-gold/30 shadow-lg transition-all duration-500 hover:shadow-mystical-gold/50 hover:scale-105 cursor-pointer group h-full flex flex-col overflow-hidden`}
      whileHover={{ y: -10 }}
      onClick={handleChooseLevel}
    >
      {/* Recommended Badge */}
      {level.recommended && (
        <motion.div
          className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-mystical-gold to-mystical-gold-light text-mystical-dark px-5 py-2 rounded-full text-sm font-semibold shadow-lg"
          animate={{
            scale: [1, 1.05, 1],
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

      <div className="relative z-10 flex flex-col h-full">
        {/* Header */}
        <div className="text-center mb-6">
          <motion.div 
            className="w-16 h-16 rounded-full bg-mystical-gold/20 flex items-center justify-center mx-auto mb-4 group-hover:bg-mystical-gold/30 transition-all duration-500"
          >
            <span className="text-2xl font-playfair text-mystical-gold font-bold">
              {['I', 'II', 'III', 'IV'][level.id - 1]}
            </span>
          </motion.div>
          
          <h3 className="font-playfair text-2xl font-bold text-white mb-2">
            {level.title}
          </h3>
          <p className="font-inter text-sm text-gray-400 mb-4">{level.subtitle}</p>
          
          <div className="flex items-baseline justify-center gap-2 mb-2">
            <span className="text-3xl font-bold text-mystical-gold">{level.price}</span>
            <span className="text-sm text-gray-400">• {level.duration}</span>
          </div>
        </div>

        {/* Description */}
        <p className="font-inter text-sm text-gray-300 leading-relaxed mb-6 flex-grow">
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
              <Check className="w-4 h-4 text-mystical-gold flex-shrink-0" />
              <span className="font-inter text-sm text-gray-300">{item}</span>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.button
          onClick={handleChooseLevel}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-mystical-gold to-mystical-gold-light text-mystical-dark font-inter font-semibold transition-all duration-500 hover:shadow-mystical-gold/50 hover:shadow-lg relative overflow-hidden group"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <span className="relative z-10">
            Choisir ce niveau
          </span>
        </motion.button>
      </div>
    </motion.div>
  );
};

export default LevelCard;