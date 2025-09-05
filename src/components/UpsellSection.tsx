import React from 'react';
import { motion } from 'framer-motion';
import { Crown, Music, Zap, Package } from 'lucide-react';

interface Upsell {
  id: string;
  title: string;
  price: string;
  description: string;
  icon: React.ComponentType<any>;
  gradient: string;
}

const upsells: Upsell[] = [
  {
    id: 'mandala',
    title: 'Mandala HD',
    price: '19 €',
    description: 'Votre mandala personnel en haute définition, prêt à imprimer',
    icon: Crown,
    gradient: 'from-mystical-gold/20 to-mystical-amber/20'
  },
  {
    id: 'audio',
    title: 'Audio Mystique',
    price: '14 €',
    description: 'Lecture audio complète avec musique sacrée',
    icon: Music,
    gradient: 'from-mystical-purple/20 to-mystical-gold/20'
  },
  {
    id: 'ritual',
    title: 'Rituel Personnalisé',
    price: '22 €',
    description: 'Cérémonie sur-mesure pour activer votre archétype',
    icon: Zap,
    gradient: 'from-mystical-amber/20 to-mystical-purple/20'
  },
  {
    id: 'complete',
    title: 'Pack Complet',
    price: '49 €',
    description: 'Tous les extras inclus + suivi personnalisé',
    icon: Package,
    gradient: 'from-mystical-gold/30 to-mystical-purple/30'
  }
];

const UpsellSection: React.FC = () => {
  return (
    <section className="py-16 relative">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h3 className="font-playfair italic text-3xl font-medium text-mystical-gold mb-4">
            Enrichissez votre expérience
          </h3>
          <p className="font-inter font-light text-gray-400">
            Des compléments pour approfondir votre voyage intérieur
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {upsells.map((upsell, index) => (
            <motion.div
              key={upsell.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className={`p-6 rounded-xl bg-gradient-to-br ${upsell.gradient} border border-mystical-gold/30 hover:border-mystical-gold/60 transition-all duration-300 cursor-pointer group hover:scale-105`}
            >
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-mystical-gold/30 flex items-center justify-center mx-auto mb-4 group-hover:bg-mystical-gold/50 transition-colors duration-300">
                  <upsell.icon className="w-6 h-6 text-mystical-gold" />
                </div>
                
                <h4 className="font-inter font-medium text-white mb-2">{upsell.title}</h4>
                <div className="text-2xl font-semibold text-mystical-gold mb-3">{upsell.price}</div>
                <p className="font-inter text-sm text-gray-400 leading-relaxed">
                  {upsell.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default UpsellSection;