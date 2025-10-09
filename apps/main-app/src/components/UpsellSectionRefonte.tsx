import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Music, BookOpen, Package } from 'lucide-react';

/**
 * UpsellSectionRefonte - Section upsells en Bento Grid asymétrique
 * 
 * CHANGEMENTS vs version originale :
 * ✅ DESKTOP : Bento Grid asymétrique (Mandala 2x2, autres 1x2, Pack 1x4)
 * ✅ TABLET : Grille 2x2 standard
 * ✅ MOBILE : Stack vertical
 * ✅ Glassmorphism sur chaque carte
 * ✅ Hover effects avec scale
 */
const UpsellSectionRefonte: React.FC = () => {
  const upsells = [
    {
      id: 'mandala',
      title: 'Mandala HD Fractal',
      description: 'Support visuel à haute fréquence pour tes méditations quotidiennes',
      icon: Sparkles,
      price: '19€',
      image: 'https://images.pexels.com/photos/4940756/pexels-photo-4940756.jpeg?auto=compress&cs=tinysrgb&w=800',
      gridArea: { desktop: '1 / 1 / 3 / 3', tablet: '1 / 1 / 2 / 2' } // 2x2 sur desktop
    },
    {
      id: 'audio',
      title: 'Audio 432 Hz Cosmique',
      description: 'Fréquence vibratoire calibrée sur ton code énergétique personnel',
      icon: Music,
      price: '14€',
      image: 'https://images.pexels.com/photos/3771115/pexels-photo-3771115.jpeg?auto=compress&cs=tinysrgb&w=800',
      gridArea: { desktop: '1 / 3 / 2 / 5', tablet: '1 / 2 / 2 / 3' } // 1x2 sur desktop
    },
    {
      id: 'rituel',
      title: 'Rituel sur mesure',
      description: 'Protocole d\'activation énergétique adapté à ta signature vibratoire',
      icon: BookOpen,
      price: '22€',
      image: 'https://images.pexels.com/photos/3879072/pexels-photo-3879072.jpeg?auto=compress&cs=tinysrgb&w=800',
      gridArea: { desktop: '2 / 3 / 3 / 5', tablet: '2 / 1 / 3 / 2' } // 1x2 sur desktop
    },
    {
      id: 'pack',
      title: 'Pack d\'Intégration Totale',
      description: 'Mandala HD + Audio 432Hz + Rituel personnalisé + Suivi 15 jours',
      icon: Package,
      price: '49€',
      discount: 'Économise 6€',
      image: 'https://images.pexels.com/photos/3618162/pexels-photo-3618162.jpeg?auto=compress&cs=tinysrgb&w=800',
      gridArea: { desktop: '3 / 1 / 4 / 5', tablet: '2 / 2 / 3 / 3' } // 1x4 sur desktop (full width)
    }
  ];

  return (
    <section className="py-24 px-6 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-1/3 right-1/3 w-96 h-96 bg-cosmic-aurora rounded-full filter blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-cosmic-aurora via-cosmic-violet to-cosmic-gold bg-clip-text text-transparent">
              Compléments dimensionnels
            </span>
          </h2>
          <p className="text-xl text-white/80 max-w-3xl mx-auto">
            Amplifie ta résonance avec ces outils vibratoires complémentaires
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

        {/* DESKTOP : Bento Grid asymétrique - REFONTE MAJEURE */}
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

// Composant de carte individuelle
interface UpsellCardProps {
  upsell: {
    id: string;
    title: string;
    description: string;
    icon: React.ElementType;
    price: string;
    discount?: string;
    image: string;
  };
  index: number;
  fullHeight?: boolean;
}

const UpsellCard: React.FC<UpsellCardProps> = ({ upsell, index, fullHeight }) => {
  const Icon = upsell.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      whileHover={{ scale: 1.02, transition: { duration: 0.3 } }}
      className={`relative rounded-3xl overflow-hidden border border-white/10 bg-cosmic-void/80 backdrop-blur-sm hover:border-cosmic-gold/30 transition-all duration-300 group ${
        fullHeight ? 'h-full' : ''
      }`}
    >
      {/* Image de fond */}
      <div className="absolute inset-0">
        <img
          src={upsell.image}
          alt={upsell.title}
          className="w-full h-full object-cover opacity-20 group-hover:opacity-30 transition-opacity duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-cosmic-void via-cosmic-void/80 to-transparent"></div>
      </div>

      {/* Contenu */}
      <div className="relative z-10 p-8 flex flex-col h-full justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <Icon className="w-8 h-8 text-cosmic-gold" />
            {upsell.discount && (
              <span className="text-xs bg-cosmic-gold/20 text-cosmic-gold px-3 py-1 rounded-full font-medium">
                {upsell.discount}
              </span>
            )}
          </div>

          <h3 className="text-2xl font-bold text-white mb-3">{upsell.title}</h3>
          <p className="text-white/80 text-sm mb-4">{upsell.description}</p>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-3xl font-bold text-cosmic-gold">{upsell.price}</span>
          <a
            href={`/commande?upsell=${upsell.id}`}
            className="px-6 py-3 bg-white/10 hover:bg-cosmic-gold/20 border border-white/20 hover:border-cosmic-gold/50 rounded-xl text-white font-medium transition-all duration-300"
          >
            Ajouter
          </a>
        </div>
      </div>

      {/* Overlay glassmorphique au survol */}
      <div className="absolute inset-0 bg-white/5 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
    </motion.div>
  );
};

export default UpsellSectionRefonte;
