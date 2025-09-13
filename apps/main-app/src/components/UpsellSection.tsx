import React from 'react';
import { motion } from 'framer-motion';
import { Crown, Music, Zap, Package } from 'lucide-react';
import SpiritualWaves from './SpiritualWaves';

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
    gradient: 'from-mystical-gold/20 to-mystical-champagne/20'
  },
  {
    id: 'audio',
    title: 'Audio Mystique',
    price: '14 €',
    description: 'Lecture audio complète avec musique sacrée',
    icon: Music,
    gradient: 'from-mystical-sage/20 to-mystical-water/20'
  },
  {
    id: 'ritual',
    title: 'Rituel Personnalisé',
    price: '22 €',
    description: 'Cérémonie sur-mesure pour activer votre archétype',
    icon: Zap,
    gradient: 'from-mystical-aurora/20 to-mystical-constellation/20'
  },
  {
    id: 'complete',
    title: 'Pack Complet',
    price: '49 €',
    description: 'Tous les extras inclus + suivi personnalisé',
    icon: Package,
    gradient: 'from-mystical-copper/20 to-mystical-bronze/20'
  }
];

const UpsellSection: React.FC = () => {
  return (
    <section className="py-24 relative bg-gradient-to-b from-mystical-dawn via-mystical-luminous to-mystical-whisper overflow-hidden">
      {/* Ondulations spirituelles */}
      <SpiritualWaves intensity="subtle" />
      
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16 relative z-10"
        >
          <h3 className="font-playfair italic text-3xl md:text-4xl font-medium text-mystical-copper/90 mb-6 tracking-wide">
            Enrichissez votre expérience
          </h3>
          <p className="font-inter font-light text-lg text-mystical-night/75 tracking-wide">
            Des compléments pour approfondir votre voyage intérieur
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
          {upsells.map((upsell, index) => (
            <motion.div
              key={upsell.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.15 }}
              viewport={{ once: true }}
              className="p-6 rounded-2xl bg-white/75 backdrop-blur-md border border-mystical-gold/40 shadow-spiritual hover:shadow-energy transition-all duration-500 cursor-pointer group hover:scale-105 relative overflow-hidden"
              whileHover={{ y: -5 }}
            >
              {/* Ondulation de carte upsell */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-mystical-gold/4 to-mystical-water/4 rounded-2xl"
                animate={{
                  opacity: [0, 0.6, 0],
                  scale: [1, 1.03, 1],
                }}
                transition={{
                  duration: 7,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: index * 1.2,
                }}
              />
              
              <div className="text-center">
                <motion.div 
                  className="w-12 h-12 rounded-full bg-gradient-to-br from-mystical-gold/25 to-mystical-champagne/35 flex items-center justify-center mx-auto mb-4 group-hover:from-mystical-copper/40 group-hover:to-mystical-radiance/50 transition-all duration-500 shadow-harmony relative z-10"
                  animate={{
                    boxShadow: [
                      '0 4px 24px rgba(156, 175, 136, 0.08)',
                      '0 6px 30px rgba(156, 175, 136, 0.12)',
                      '0 4px 24px rgba(156, 175, 136, 0.08)',
                    ],
                  }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <upsell.icon className="w-6 h-6 text-mystical-night/80" />
                </motion.div>
                
                <h4 className="font-inter font-medium text-mystical-night/90 mb-2 tracking-wide relative z-10">{upsell.title}</h4>
                <div className="text-2xl font-semibold text-mystical-copper/90 mb-3 relative z-10">{upsell.price}</div>
                <p className="font-inter text-sm text-mystical-night/80 leading-relaxed tracking-wide relative z-10">
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