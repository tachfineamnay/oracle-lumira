import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Music, BookOpen, Package } from 'lucide-react';

/**
 * UpsellSectionRefonte - Design MINIMALISTE et ÉLÉGANT
 * 
 * 🎨 INSPIRATION :
 * ✅ Notion (spacing généreux, clarté)
 * ✅ Vercel (noir/blanc, typographie impeccable)
 * ✅ Figma (focus contenu, pas de fioritures)
 * ✅ Linear (minimalisme élégant)
 * 
 * 🎯 PRINCIPES :
 * - Pas de badges promo agressifs
 * - Pas de prix barrés
 * - Focus sur la VALEUR client
 * - Hover subtils et élégants
 * - Typographie claire
 */
const UpsellSectionRefonte: React.FC = () => {
  const upsells = [
    {
      id: 'mandala',
      title: 'Mandala HD Fractal',
      description: 'Support visuel pour tes méditations quotidiennes',
      details: ['Image 4K haute définition', 'Format téléchargeable', 'Utilisable à vie'],
      icon: Sparkles,
      price: '19',
      image: 'https://images.pexels.com/photos/4940756/pexels-photo-4940756.jpeg?auto=compress&cs=tinysrgb&w=800',
      gridArea: { desktop: '1 / 1 / 3 / 3', tablet: '1 / 1 / 2 / 2' }
    },
    {
      id: 'audio',
      title: 'Audio 432 Hz',
      description: 'Fréquence vibratoire pour ton alignement énergétique',
      details: ['Fichier MP3 20 minutes', 'Calibré sur ton profil', 'Écoute illimitée'],
      icon: Music,
      price: '14',
      image: 'https://images.pexels.com/photos/3771115/pexels-photo-3771115.jpeg?auto=compress&cs=tinysrgb&w=800',
      gridArea: { desktop: '1 / 3 / 2 / 5', tablet: '1 / 2 / 2 / 3' }
    },
    {
      id: 'rituel',
      title: 'Rituel sur mesure',
      description: 'Protocole personnalisé selon ta signature vibratoire',
      details: ['Guide PDF détaillé', 'Exercices pratiques', 'Suivi 7 jours'],
      icon: BookOpen,
      price: '22',
      image: 'https://images.pexels.com/photos/3879072/pexels-photo-3879072.jpeg?auto=compress&cs=tinysrgb&w=800',
      gridArea: { desktop: '2 / 3 / 3 / 5', tablet: '2 / 1 / 3 / 2' }
    },
    {
      id: 'pack',
      title: 'Pack Intégration Totale',
      description: 'L\'ensemble complet pour une transformation profonde',
      details: ['Mandala HD + Audio 432Hz + Rituel', 'Suivi personnalisé 15 jours', 'Accès communauté privée'],
      icon: Package,
      price: '49',
      recommended: true,
      image: 'https://images.pexels.com/photos/3618162/pexels-photo-3618162.jpeg?auto=compress&cs=tinysrgb&w=800',
      gridArea: { desktop: '3 / 1 / 4 / 5', tablet: '2 / 2 / 3 / 3' }
    }
  ];

  return (
    <section className="py-24 px-6 relative overflow-hidden bg-gradient-to-b from-cosmic-void via-cosmic-void/95 to-cosmic-void">
      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header minimaliste */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-white">
            Compléments dimensionnels
          </h2>
          <p className="text-lg text-white/60 max-w-2xl mx-auto">
            Approfondis ton exploration avec ces outils soigneusement conçus
          </p>
        </motion.div>

        {/* MOBILE : Stack vertical simple */}
        <div className="grid grid-cols-1 gap-6 md:hidden">
          {upsells.map((upsell, index) => (
            <UpsellCard key={upsell.id} upsell={upsell} index={index} />
          ))}
        </div>

        {/* TABLET : Grille 2x2 standard */}
        <div className="hidden md:grid lg:hidden grid-cols-2 gap-6">
          {upsells.map((upsell, index) => (
            <UpsellCard key={upsell.id} upsell={upsell} index={index} />
          ))}
        </div>

        {/* DESKTOP : Bento Grid asymétrique - Design minimaliste */}
        <div className="hidden lg:grid gap-6" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gridTemplateRows: 'repeat(3, 200px)',
          gridAutoFlow: 'dense'
        }}>
          {upsells.map((upsell, index) => (
            <div
              key={upsell.id}
              style={{ gridArea: upsell.gridArea.desktop }}
            >
              <UpsellCard upsell={upsell} index={index} fullHeight />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Composant de carte MINIMALISTE et ÉLÉGANT
interface UpsellCardProps {
  upsell: {
    id: string;
    title: string;
    description: string;
    details: string[];
    icon: React.ElementType;
    price: string;
    recommended?: boolean;
    image: string;
  };
  index: number;
  fullHeight?: boolean;
}

const UpsellCard: React.FC<UpsellCardProps> = ({ upsell, index, fullHeight }) => {
  const Icon = upsell.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className={`relative group ${fullHeight ? 'h-full' : ''}`}
    >
      {/* Card container simple */}
      <div className="relative h-full bg-white/[0.03] border border-white/10 rounded-2xl backdrop-blur-sm transition-all duration-300 hover:bg-white/[0.05] hover:border-white/20 overflow-hidden">
        
        {/* Badge "Recommandé" discret */}
        {upsell.recommended && (
          <div className="absolute top-4 right-4 z-10">
            <span className="text-xs font-medium text-cosmic-gold/90 px-3 py-1 bg-cosmic-gold/10 rounded-full border border-cosmic-gold/20">
              Recommandé
            </span>
          </div>
        )}

        {/* Image de fond très subtile */}
        <div className="absolute inset-0 opacity-[0.08]">
          <img
            src={upsell.image}
            alt={upsell.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-cosmic-void via-cosmic-void/80 to-cosmic-void/60"></div>
        </div>

        {/* Contenu */}
        <div className="relative z-10 p-8 flex flex-col h-full">
          
          {/* Icône minimaliste */}
          <div className="mb-6">
            <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-white/[0.08] group-hover:border-white/20 transition-all duration-300">
              <Icon className="w-5 h-5 text-white/80" />
            </div>
          </div>

          {/* Titre */}
          <h3 className="text-xl font-semibold text-white mb-2 leading-tight">
            {upsell.title}
          </h3>
          
          {/* Description */}
          <p className="text-sm text-white/60 mb-6 leading-relaxed">
            {upsell.description}
          </p>

          {/* Liste de détails */}
          <ul className="space-y-2.5 mb-auto">
            {upsell.details.map((detail, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-white/50">
                <span className="text-cosmic-gold/60 mt-0.5">•</span>
                <span>{detail}</span>
              </li>
            ))}
          </ul>

          {/* Footer avec prix et CTA */}
          <div className="mt-8 pt-6 border-t border-white/10">
            {/* Prix simple */}
            <div className="mb-4">
              <span className="text-3xl font-bold text-white">
                {upsell.price}€
              </span>
            </div>

            {/* CTA minimaliste */}
            <motion.a
              href={`/commande?upsell=${upsell.id}`}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="block w-full py-3 px-4 bg-white/[0.08] hover:bg-white/[0.12] border border-white/20 hover:border-white/30 rounded-xl text-center text-sm font-medium text-white transition-all duration-200"
            >
              Ajouter
            </motion.a>
          </div>
        </div>

        {/* Hover glow très subtil */}
        <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-gradient-to-br from-white/[0.02] via-transparent to-transparent"></div>
      </div>
    </motion.div>
  );
};

export default UpsellSectionRefonte;
