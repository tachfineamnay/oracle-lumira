import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, Crown, Sparkles } from 'lucide-react';

interface Level {
  id: number;
  name: string;
  title: string;
  price: string;
  description: string;
  features: string[];
  gradient: string;
  popular?: boolean;
}

interface LevelCardProps {
  level: Level;
}

const LevelCard: React.FC<LevelCardProps> = ({ level }) => {
  const navigate = useNavigate();

  const handleLevelSelect = () => {
    navigate(`/commande?level=${level.id}`);
  };

  return (
    <motion.div
      className={`relative p-8 rounded-2xl backdrop-blur-sm border border-mystical-gold/30 bg-gradient-to-br ${level.gradient} group cursor-pointer transition-all duration-500 hover:scale-105 hover:border-mystical-gold/60`}
      whileHover={{ y: -10 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      {/* Popular Badge */}
      {level.popular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <div className="bg-gradient-to-r from-mystical-gold to-mystical-gold-light px-4 py-1 rounded-full text-mystical-dark text-sm font-medium flex items-center gap-1">
            <Crown className="w-4 h-4" />
            Populaire
          </div>
        </div>
      )}

      {/* Glow Effect */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-mystical-gold/10 to-mystical-purple/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl" />

      <div className="relative z-10">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center mb-2">
            <Sparkles className="w-5 h-5 text-mystical-gold mr-2" />
            <span className="font-inter text-sm uppercase tracking-wider text-mystical-gold font-medium">
              Niveau {level.id}
            </span>
            <Sparkles className="w-5 h-5 text-mystical-gold ml-2" />
          </div>
          
          <h3 className="font-playfair italic text-2xl font-medium mb-2 text-white">
            {level.title}
          </h3>
          
          <div className="text-3xl font-inter font-semibold text-mystical-gold-light mb-3">
            {level.price}
          </div>
          
          <p className="font-inter font-light text-gray-300 text-sm leading-relaxed">
            {level.description}
          </p>
        </div>

        {/* Features */}
        <div className="space-y-3 mb-8">
          {level.features.map((feature, index) => (
            <motion.div
              key={index}
              className="flex items-center text-sm"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Check className="w-4 h-4 text-mystical-gold mr-3 flex-shrink-0" />
              <span className="font-inter text-gray-200">{feature}</span>
            </motion.div>
          ))}
        </div>

        {/* CTA Button */}
        <motion.button
          onClick={handleLevelSelect}
          className="w-full py-3 rounded-lg bg-gradient-to-r from-mystical-gold/80 to-mystical-gold-light/80 text-mystical-dark font-inter font-medium transition-all duration-300 hover:from-mystical-gold hover:to-mystical-gold-light hover:shadow-lg hover:shadow-mystical-gold/30"
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