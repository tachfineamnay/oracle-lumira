import React from 'react';
import { Crown, Music, Zap, Package } from 'lucide-react';
import { motion } from 'framer-motion';

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
    title: 'Mandala Cosmique HD',
    price: '19 €',
    description: 'Votre mandala personnel en haute définition, aligné sur les constellations',
    icon: Crown,
  },
  {
    id: 'audio',
    title: 'Audio Galactique',
    price: '14 €',
    description: 'Lecture audio complète avec fréquences 432 Hz et sons cosmiques',
    icon: Music,
  },
  {
    id: 'ritual',
    title: 'Rituel Stellaire',
    price: '22 €',
    description: 'Cérémonie sur-mesure pour activer votre archétype sous les étoiles',
    icon: Zap,
  },
  {
    id: 'complete',
    title: 'Pack Univers Complet',
    price: '49 €',
    description: 'Tous les extras inclus + suivi personnalisé + connexion cosmique',
    icon: Package,
  }
];

const UpsellSection: React.FC = () => {
  return (
    <section className="py-32 relative overflow-hidden">
      {/* Aurore de section subtile */}
      <div className="absolute inset-0 bg-gradient-to-b from-cosmic-aurora/5 via-cosmic-violet/8 to-cosmic-magenta/5"></div>
      
      <div className="container mx-auto px-6 relative z-10">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
        >
          <motion.h3 
            className="font-playfair italic text-4xl md:text-5xl font-bold text-cosmic-divine mb-6"
            style={{
              textShadow: '0 0 30px rgba(212, 175, 55, 0.5)',
            }}
          >
            Enrichissez votre expérience
          </motion.h3>
          <p className="font-inter font-light text-lg text-cosmic-ethereal">
            Des compléments pour approfondir votre voyage dans l'univers
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {upsells.map((upsell, index) => (
            <motion.div
              key={upsell.id}
              className="relative p-6 rounded-2xl bg-gradient-to-br from-cosmic-deep/80 via-cosmic-nebula/60 to-cosmic-galaxy/40 backdrop-blur-xl border border-cosmic-gold/30 shadow-cosmic hover:shadow-aurora transition-all duration-500 cursor-pointer group overflow-hidden"
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ 
                duration: 0.8, 
                delay: index * 0.15,
                ease: "easeOut"
              }}
              viewport={{ once: true }}
              whileHover={{ 
                y: -8,
                scale: 1.02,
                transition: { duration: 0.3 }
              }}
            >
              {/* Effet de nébuleuse subtile au survol */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-cosmic-violet/15 via-transparent to-cosmic-aurora/15 rounded-2xl opacity-0 group-hover:opacity-100"
                transition={{ duration: 0.5 }}
              />

              <div className="text-center relative z-10">
                <motion.div 
                  className="w-16 h-16 rounded-full bg-gradient-to-br from-cosmic-gold/30 to-cosmic-violet/20 border-2 border-cosmic-gold/50 flex items-center justify-center mx-auto mb-6"
                  animate={{ 
                    boxShadow: [
                      '0 0 20px rgba(255, 215, 0, 0.3)',
                      '0 0 40px rgba(255, 215, 0, 0.5)',
                      '0 0 20px rgba(255, 215, 0, 0.3)',
                    ]
                  }}
                  transition={{ duration: 3, repeat: Infinity, delay: index * 0.5 }}
                >
                  <upsell.icon className="w-8 h-8 text-cosmic-gold" />
                </motion.div>
                
                <h4 className="font-inter font-medium text-cosmic-divine mb-3">{upsell.title}</h4>
                <motion.div 
                  className="text-3xl font-bold text-cosmic-gold mb-4"
                  animate={{ 
                    textShadow: [
                      '0 0 10px rgba(255, 215, 0, 0.5)',
                      '0 0 20px rgba(255, 215, 0, 0.8)',
                      '0 0 10px rgba(255, 215, 0, 0.5)',
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity, delay: index * 0.3 }}
                >
                  {upsell.price}
                </motion.div>
                <p className="font-inter font-light text-sm text-cosmic-ethereal leading-relaxed">
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