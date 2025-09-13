import React from 'react';
import { Crown, Music, Zap, Package } from 'lucide-react';

interface Upsell {
  id: string;
  title: string;
  price: string;
  description: string;
  icon: React.ComponentType<any>;
}

const upsells: Upsell[] = [
  {
    id: 'mandala',
    title: 'Mandala HD',
    price: '19 €',
    description: 'Votre mandala personnel en haute définition, prêt à imprimer',
    icon: Crown,
  },
  {
    id: 'audio',
    title: 'Audio Mystique',
    price: '14 €',
    description: 'Lecture audio complète avec musique sacrée',
    icon: Music,
  },
  {
    id: 'ritual',
    title: 'Rituel Personnalisé',
    price: '22 €',
    description: 'Cérémonie sur-mesure pour activer votre archétype',
    icon: Zap,
  },
  {
    id: 'complete',
    title: 'Pack Complet',
    price: '49 €',
    description: 'Tous les extras inclus + suivi personnalisé',
    icon: Package,
  }
];

const UpsellSection: React.FC = () => {
  return (
    <section className="py-24 relative bg-gradient-to-b from-mystical-midnight via-mystical-deep-blue to-mystical-black overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16 relative z-10">
          <h3 className="font-playfair text-3xl md:text-4xl font-medium text-mystical-starlight mb-6">
            Enrichissez votre expérience
          </h3>
          <p className="font-inter text-lg text-mystical-silver">
            Des compléments pour approfondir votre voyage intérieur
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
          {upsells.map((upsell, index) => (
            <div
              key={upsell.id}
              className="p-6 rounded-2xl bg-mystical-midnight/60 backdrop-blur-sm border border-mystical-moonlight/20 shadow-forest hover:shadow-moonlight transition-all duration-500 cursor-pointer group overflow-hidden"
            >
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-mystical-moonlight/10 border border-mystical-moonlight/30 flex items-center justify-center mx-auto mb-4">
                  <upsell.icon className="w-6 h-6 text-mystical-moonlight" />
                </div>
                
                <h4 className="font-inter font-medium text-mystical-starlight mb-2">{upsell.title}</h4>
                <div className="text-2xl font-semibold text-mystical-moonlight mb-3">{upsell.price}</div>
                <p className="font-inter text-sm text-mystical-silver leading-relaxed">
                  {upsell.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default UpsellSection;