import React from 'react';
import { Check } from 'lucide-react';
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

  // Numéros romains
  const romanNumerals = ['I', 'II', 'III', 'IV'];

  return (
    <div
      className={`relative p-8 rounded-2xl bg-gradient-to-br ${level.gradient} backdrop-blur-sm border border-mystical-gold/30 shadow-forest hover:shadow-gold-glow transition-all duration-500 cursor-pointer group h-full flex flex-col overflow-hidden`}
      onClick={handleChooseLevel}
    >
      {/* Badge recommandé */}
      {level.recommended && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-mystical-gold text-mystical-abyss px-4 py-1 rounded-full text-sm font-semibold animate-gold-pulse">
          ⭐ Populaire
        </div>
      )}

      <div className="relative z-10 flex flex-col h-full">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-full bg-mystical-gold/20 border border-mystical-gold/50 flex items-center justify-center mx-auto mb-4 animate-gold-pulse">
            <span className="text-2xl font-playfair italic text-mystical-gold font-bold">
              {romanNumerals[level.id - 1]}
            </span>
          </div>
          
          <h3 className="font-playfair italic text-2xl font-bold text-mystical-starlight mb-2">
            {level.title}
          </h3>
          <p className="font-inter font-light text-sm text-mystical-silver mb-4">{level.subtitle}</p>
          
          <div className="flex items-baseline justify-center gap-2 mb-2">
            <span className="text-3xl font-bold text-mystical-gold">{level.price}</span>
            <span className="text-sm text-mystical-silver">• {level.duration}</span>
          </div>
        </div>

        {/* Description */}
        <p className="font-inter font-light text-sm text-mystical-silver leading-relaxed mb-6 flex-grow">
          {level.description}
        </p>

        {/* Includes */}
        <div className="space-y-2 mb-8">
          {level.includes.map((item, index) => (
            <div key={index} className="flex items-center gap-3">
              <Check className="w-4 h-4 text-mystical-gold flex-shrink-0" />
              <span className="font-inter font-light text-sm text-mystical-silver">{item}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <button
          onClick={handleChooseLevel}
          className="w-full py-4 rounded-xl bg-mystical-gold/20 border border-mystical-gold/50 text-mystical-starlight font-inter font-light hover:bg-mystical-gold/30 hover:border-mystical-gold/70 transition-all duration-500 shadow-gold-glow"
        >
          Entrer dans cette étape
        </button>
      </div>
    </div>
  );
};

export default LevelCard;

