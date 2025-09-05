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
}

interface LevelCardProps {
  level: Level;
}

const LevelCard: React.FC<LevelCardProps> = ({ level }) => {
  const navigate = useNavigate();

  const handleChooseLevel = () => {
    navigate(`/commande?level=${level.id}`);
  };

  return (
    <motion.div
      className={`relative p-8 rounded-2xl bg-gradient-to-br ${level.gradient} backdrop-blur-sm border border-mystical-gold/30 transition-all duration-500 hover:border-mystical-gold/60 hover:scale-105 cursor-pointer group h-full flex flex-col`}
      whileHover={{ y: -10 }}
      onClick={handleChooseLevel}
    >
      {/* Recommended Badge */}
      {level.recommended && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-mystical-gold to-mystical-gold-light text-mystical-dark px-4 py-1 rounded-full text-sm font-semibold">
          ⭐ Populaire
        </div>
      )}

      {/* Glow Effect */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-mystical-gold/10 to-mystical-purple/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl" />

      <div className="relative z-10 flex flex-col h-full">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-full bg-mystical-gold/30 flex items-center justify-center mx-auto mb-4 group-hover:bg-mystical-gold/50 transition-colors duration-300">
            <Crown className="w-6 h-6 text-mystical-gold" />
          </div>
          
          <h3 className="font-playfair italic text-2xl font-medium text-white mb-1">
            {level.title}
          </h3>
          <p className="font-inter text-sm text-mystical-gold mb-4">{level.subtitle}</p>
          
          <div className="flex items-baseline justify-center gap-2 mb-2">
            <span className="text-3xl font-semibold text-mystical-gold">{level.price}</span>
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
            <div key={index} className="flex items-center gap-2">
              <Check className="w-4 h-4 text-mystical-gold flex-shrink-0" />
              <span className="font-inter text-sm text-gray-200">{item}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <motion.button
          onClick={handleChooseLevel}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-mystical-gold to-mystical-gold-light text-mystical-dark font-inter font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-mystical-gold/30"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Choisir ce niveau
        </motion.button>
      </div>
    </motion.div>
  );
};

export default LevelCard;
