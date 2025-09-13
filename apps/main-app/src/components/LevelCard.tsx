import React from 'react';
import { Check, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

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

  const romanNumerals = ['I', 'II', 'III', 'IV'];

  return (
    <motion.div
      className={`relative p-8 rounded-2xl bg-gradient-to-br ${level.gradient} backdrop-blur-lg border border-cosmic-gold/30 shadow-cosmic hover:shadow-aurora transition-all duration-500 cursor-pointer group h-full flex flex-col overflow-hidden`}
      onClick={handleChooseLevel}
      whileHover={{ 
        scale: 1.02,
        boxShadow: '0 0 80px rgba(168, 85, 247, 0.4)',
      }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Badge recommandé premium */}
      {level.recommended && (
        <motion.div 
          className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-cosmic-gold to-cosmic-gold-warm text-cosmic-void px-6 py-2 rounded-full text-sm font-bold shadow-stellar"
          animate={{ 
            y: [0, -2, 0],
            boxShadow: [
              '0 0 20px rgba(255, 215, 0, 0.4)',
              '0 0 30px rgba(255, 215, 0, 0.6)',
              '0 0 20px rgba(255, 215, 0, 0.4)',
            ]
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <span className="flex items-center gap-2">
            <Star className="w-4 h-4 fill-current" />
            Populaire
            <Star className="w-4 h-4 fill-current" />
          </span>
        </motion.div>
      )}

      {/* Effet de particules subtiles au survol */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-cosmic-star rounded-full"
            style={{
              left: `${20 + i * 12}%`,
              top: `${20 + (i % 3) * 20}%`,
            }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0, 1.5, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.2,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 flex flex-col h-full">
        {/* Header premium */}
        <div className="text-center mb-6">
          <motion.div 
            className="w-20 h-20 rounded-full bg-gradient-to-br from-cosmic-gold/30 to-cosmic-violet/20 border-2 border-cosmic-gold/50 flex items-center justify-center mx-auto mb-6 relative"
            animate={{ 
              boxShadow: [
                '0 0 20px rgba(255, 215, 0, 0.3)',
                '0 0 40px rgba(255, 215, 0, 0.5)',
                '0 0 20px rgba(255, 215, 0, 0.3)',
              ]
            }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <span className="text-3xl font-playfair italic text-cosmic-gold font-bold">
              {romanNumerals[level.id - 1]}
            </span>
            {/* Cercle orbital subtil */}
            <motion.div
              className="absolute inset-0 border border-cosmic-gold/20 rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
            />
          </motion.div>
          
          <h3 className="font-playfair italic text-2xl font-bold text-cosmic-divine mb-2">
            {level.title}
          </h3>
          <p className="font-inter font-light text-sm text-cosmic-celestial mb-4 capitalize">{level.subtitle}</p>
          
          <div className="flex items-baseline justify-center gap-3 mb-2">
            <motion.span 
              className="text-4xl font-bold text-cosmic-gold"
              animate={{ 
                textShadow: [
                  '0 0 10px rgba(255, 215, 0, 0.5)',
                  '0 0 20px rgba(255, 215, 0, 0.8)',
                  '0 0 10px rgba(255, 215, 0, 0.5)',
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {level.price}
            </motion.span>
            <span className="text-sm text-cosmic-silver">• {level.duration}</span>
          </div>
        </div>

        {/* Description */}
        <p className="font-inter font-light text-sm text-cosmic-ethereal leading-relaxed mb-6 flex-grow">
          {level.description}
        </p>

        {/* Includes avec animations subtiles */}
        <div className="space-y-3 mb-8">
          {level.includes.map((item, index) => (
            <motion.div 
              key={index} 
              className="flex items-center gap-3"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                }}
                transition={{ 
                  duration: 3, 
                  repeat: Infinity,
                  delay: index * 0.3,
                }}
              >
                <Check className="w-4 h-4 text-cosmic-gold flex-shrink-0" />
              </motion.div>
              <span className="font-inter font-light text-sm text-cosmic-ethereal">{item}</span>
            </motion.div>
          ))}
        </div>

        {/* CTA premium avec effet cosmique */}
        <motion.button
          onClick={handleChooseLevel}
          className="w-full py-4 rounded-xl bg-gradient-to-r from-cosmic-gold/20 via-cosmic-gold-warm/30 to-cosmic-gold/20 border border-cosmic-gold/50 text-cosmic-divine font-inter font-medium hover:from-cosmic-gold/30 hover:via-cosmic-gold-warm/40 hover:to-cosmic-gold/30 hover:border-cosmic-gold/70 transition-all duration-500 relative overflow-hidden group"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {/* Effet de vague lumineuse premium */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cosmic-star/20 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
          <span className="relative z-10">Entrer dans cette dimension</span>
        </motion.button>
      </div>
    </motion.div>
  );
};

export default LevelCard;