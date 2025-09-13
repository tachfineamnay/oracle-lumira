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

  return (
    <div
      className={`relative p-8 rounded-2xl bg-gradient-to-br ${level.gradient} backdrop-blur-sm border border-mystical-moonlight/20 shadow-forest hover:shadow-moonlight transition-all duration-500 cursor-pointer group h-full flex flex-col overflow-hidden`}
      onClick={handleChooseLevel}
    >
      {/* Badge recommandé */}
      {level.recommended && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-mystical-moonlight text-mystical-black px-4 py-1 rounded-full text-sm font-semibold">
          ⭐ Populaire
        </div>
      )}

      <div className="relative z-10 flex flex-col h-full">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-full bg-mystical-moonlight/10 border border-mystical-moonlight/30 flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl font-playfair text-mystical-moonlight font-bold">
              {level.id}
            </span>
          </div>
          
          <h3 className="font-playfair text-2xl font-bold text-mystical-starlight mb-2">
            {level.title}
          </h3>
          <p className="font-inter text-sm text-mystical-silver mb-4">{level.subtitle}</p>
          
          <div className="flex items-baseline justify-center gap-2 mb-2">
            <span className="text-3xl font-bold text-mystical-moonlight">{level.price}</span>
            <span className="text-sm text-mystical-silver">• {level.duration}</span>
          </div>
        </div>

        {/* Description */}
        <p className="font-inter text-sm text-mystical-silver leading-relaxed mb-6 flex-grow">
          {level.description}
        </p>

        {/* Includes */}
        <div className="space-y-2 mb-8">
          {level.includes.map((item, index) => (
            <div key={index} className="flex items-center gap-3">
              <Check className="w-4 h-4 text-mystical-moonlight flex-shrink-0" />
              <span className="font-inter text-sm text-mystical-silver">{item}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <button
          onClick={handleChooseLevel}
          className="w-full py-4 rounded-xl bg-mystical-moonlight/10 border border-mystical-moonlight/30 text-mystical-starlight font-inter font-semibold hover:bg-mystical-moonlight/20 hover:border-mystical-moonlight/50 transition-all duration-500"
        >
          Choisir ce niveau
        </button>
      </div>
    </div>
  );
};

export default LevelCard;