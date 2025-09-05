import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import LevelCard from './LevelCard';

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

const levels: Level[] = [
  {
    id: 1,
    name: "Simple",
    title: "Lecture Simple",
    price: "Gratuit",
    description: "Découvre ton archétype principal avec une première guidance spirituelle",
    features: [
      "1 carte archétypale tirée",
      "1 message personnalisé",
      "PDF de 2 pages",
      "Livraison instantanée"
    ],
    gradient: "from-mystical-gold/20 to-mystical-amber/20"
  },
  {
    id: 2,
    name: "Intuitive",
    title: "Lecture Intuitive",
    price: "14 €",
    description: "Approfondis ta connaissance avec un profil d'âme complet",
    features: [
      "Profil d'âme détaillé",
      "Domaine de vie ciblé",
      "PDF de 4 pages",
      "Audio de guidance (5 min)"
    ],
    gradient: "from-mystical-purple/20 to-mystical-gold/20",
    popular: true
  },
  {
    id: 3,
    name: "Alchimique",
    title: "Lecture Alchimique",
    price: "29 €",
    description: "Transforme tes blocages en forces avec des rituels personnalisés",
    features: [
      "Analyse des blocages énergétiques",
      "Rituel symbolique personnalisé",
      "PDF de 6-8 pages",
      "Audio de transformation (12 min)",
      "Mandala de guérison"
    ],
    gradient: "from-mystical-amber/20 to-mystical-purple/20"
  },
  {
    id: 4,
    name: "Intégrale",
    title: "Lecture Intégrale",
    price: "49-79 €",
    description: "La cartographie complète de ton être multidimensionnel",
    features: [
      "Cartographie multidimensionnelle",
      "Mandala personnalisé haute définition",
      "Audio mystique complet (25 min)",
      "PDF de 15 pages",
      "Guidance de vie intégrée",
      "Accès espace client privé"
    ],
    gradient: "from-mystical-gold/30 to-mystical-purple/30"
  }
];

const LevelsSection: React.FC = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="levels-section" ref={ref} className="py-24 relative">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1 }}
          className="text-center mb-16"
        >
          <h2 className="font-playfair italic text-5xl md:text-6xl font-medium mb-6 bg-gradient-to-r from-mystical-gold via-mystical-gold-light to-mystical-amber bg-clip-text text-transparent">
            Choisis ton voyage
          </h2>
          <p className="font-inter font-light text-xl text-gray-300 max-w-3xl mx-auto">
            Quatre portails vers la connaissance de soi, du plus accessible au plus profond
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {levels.map((level, index) => (
            <motion.div
              key={level.id}
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: index * 0.2 }}
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