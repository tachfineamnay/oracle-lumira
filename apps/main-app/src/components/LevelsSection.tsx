import React from 'react';
import { motion } from 'framer-motion';
import LevelCard from './LevelCard';

const levels = [
  {
    id: 1,
    title: 'Éveil Simple',
    subtitle: 'L\'Essence',
    price: '27€',
    duration: '15 min',
    description: 'Découvre ton archétype principal et ta phrase vibratoire personnalisée.',
    includes: ['Archétype principal', 'Phrase vibratoire', 'Conseil immédiat'],
    gradient: 'from-mystical-gold/20 to-mystical-amber/20',
    recommended: false
  },
  {
    id: 2,
    title: 'Éveil Profond',
    subtitle: 'L\'Exploration',
    price: '47€',
    duration: '25 min',
    description: 'Plonge dans ton profil d\'âme complet avec un domaine de vie ciblé.',
    includes: ['Profil d\'âme complet', 'Domaine ciblé', 'Rituel symbolique', 'Audio 432 Hz'],
    gradient: 'from-mystical-purple/20 to-mystical-gold/20',
    recommended: true
  },
  {
    id: 3,
    title: 'Éveil Alchimique',
    subtitle: 'La Transformation',
    price: '67€',
    duration: '35 min',
    description: 'Transmute tes blocages en force avec une approche thérapeutique profonde.',
    includes: ['Analyse des blocages', 'Transmutation énergétique', 'Mantra personnel', 'Plan d\'action 7 jours', 'Mandala HD'],
    gradient: 'from-mystical-amber/20 to-mystical-purple/20',
    recommended: false
  },
  {
    id: 4,
    title: 'Éveil Intégral',
    subtitle: 'La Maîtrise',
    price: '97€',
    duration: '45 min',
    description: 'L\'expérience complète : mission d\'âme, ligne karmique et guidance multidimensionnelle.',
    includes: ['Mission d\'âme', 'Ligne karmique', 'Cycles de vie', 'Audio complet', 'Mandala personnalisé', 'Suivi 30 jours'],
    gradient: 'from-mystical-gold/30 to-mystical-purple/30',
    recommended: false
  }
];

const LevelsSection: React.FC = () => {
  return (
    <section id="levels" className="py-24 relative">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 className="font-playfair italic text-5xl md:text-6xl font-medium mb-6 bg-gradient-to-r from-mystical-gold via-mystical-gold-light to-mystical-amber bg-clip-text text-transparent">
            Choisis ton niveau d'éveil
          </h2>
          <p className="font-inter font-light text-xl text-gray-300 max-w-3xl mx-auto">
            Chaque niveau révèle une couche plus profonde de ton essence spirituelle
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {levels.map((level, index) => (
            <motion.div
              key={level.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <LevelCard level={level} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LevelsSection;
