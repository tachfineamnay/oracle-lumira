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
    <section className="py-16 relative bg-gradient-to-b from-lumira-dawn to-lumira-cream">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h3 className="font-playfair italic text-3xl font-medium text-lumira-copper mb-4">
            Enrichissez votre expérience
          </h3>
          <p className="font-inter font-light text-lumira-night/60">
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
              className="p-6 rounded-2xl bg-white/70 backdrop-blur-sm border border-lumira-gold-soft/30 shadow-soft hover:shadow-aurora transition-all duration-300 cursor-pointer group hover:scale-105"
            >
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-lumira-gold-soft/30 to-lumira-champagne/40 flex items-center justify-center mx-auto mb-4 group-hover:from-lumira-copper/40 group-hover:to-lumira-gold-soft/50 transition-all duration-300 shadow-constellation">
                  <upsell.icon className="w-6 h-6 text-lumira-night/80" />
                </div>
                
                <h4 className="font-inter font-medium text-lumira-night mb-2">{upsell.title}</h4>
                <div className="text-2xl font-semibold text-lumira-copper mb-3">{upsell.price}</div>
                <p className="font-inter text-sm text-lumira-night/70 leading-relaxed">
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