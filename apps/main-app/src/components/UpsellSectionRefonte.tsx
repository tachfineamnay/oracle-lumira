import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Music, BookOpen, Package } from 'lucide-react';

/**
 * UpsellSectionRefonte - Section upsells ULTRA-PREMIUM
 * 
 * 🔥 DESIGN INSPIRATION :
 * ✅ Apple Store cards (hover depth, shadows)
 * ✅ Stripe Checkout (CTA magnétique)
 * ✅ Linear (glassmorphism raffiné)
 * ✅ Dribbble Top Shots (micro-interactions)
 */
const UpsellSectionRefonte: React.FC = () => {
  const upsells = [
    {
      id: 'mandala',
      title: 'Mandala HD Fractal',
      description: 'Support visuel haute fréquence',
      highlight: '4K • Téléchargeable',
      icon: Sparkles,
      price: '19',
      originalPrice: '47',
      image: 'https://images.pexels.com/photos/4940756/pexels-photo-4940756.jpeg?auto=compress&cs=tinysrgb&w=800',
      gradient: 'from-amber-500/20 via-orange-500/10 to-transparent',
      iconColor: 'text-amber-400',
      gridArea: { desktop: '1 / 1 / 3 / 3', tablet: '1 / 1 / 2 / 2' }
    },
    {
      id: 'audio',
      title: 'Audio 432 Hz',
      description: 'Fréquence vibratoire calibrée',
      highlight: 'MP3 • Durée 20min',
      icon: Music,
      price: '14',
      originalPrice: '37',
      image: 'https://images.pexels.com/photos/3771115/pexels-photo-3771115.jpeg?auto=compress&cs=tinysrgb&w=800',
      gradient: 'from-purple-500/20 via-violet-500/10 to-transparent',
      iconColor: 'text-purple-400',
      gridArea: { desktop: '1 / 3 / 2 / 5', tablet: '1 / 2 / 2 / 3' }
    },
    {
      id: 'rituel',
      title: 'Rituel sur mesure',
      description: 'Protocole d\'activation personnalisé',
      highlight: 'PDF • Suivi 7 jours',
      icon: BookOpen,
      price: '22',
      originalPrice: '27',
      image: 'https://images.pexels.com/photos/3879072/pexels-photo-3879072.jpeg?auto=compress&cs=tinysrgb&w=800',
      gradient: 'from-blue-500/20 via-cyan-500/10 to-transparent',
      iconColor: 'text-blue-400',
      gridArea: { desktop: '2 / 3 / 3 / 5', tablet: '2 / 1 / 3 / 2' }
    },
    {
      id: 'pack',
      title: 'Pack Intégration Totale',
      description: 'Mandala HD + Audio 432Hz + Rituel + Suivi 15 jours',
      highlight: '✨ BEST VALUE • Économise 6€',
      icon: Package,
      price: '49',
      originalPrice: '97',
      featured: true,
      image: 'https://images.pexels.com/photos/3618162/pexels-photo-3618162.jpeg?auto=compress&cs=tinysrgb&w=800',
      gradient: 'from-cosmic-gold/30 via-cosmic-aurora/20 to-transparent',
      iconColor: 'text-cosmic-gold',
      gridArea: { desktop: '3 / 1 / 4 / 5', tablet: '2 / 2 / 3 / 3' }
    }
  ];

  return (
    <section className="py-20 px-6 relative overflow-hidden">
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
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            <span className="bg-gradient-to-r from-cosmic-aurora via-cosmic-violet to-cosmic-gold bg-clip-text text-transparent">
              Compléments dimensionnels
            </span>
          </h2>
          <p className="text-lg text-white/80 max-w-3xl mx-auto">
            Amplifie ta résonance avec ces outils vibratoires complémentaires
          </p>
        </motion.div>

        {/* MOBILE : Stack vertical simple */}
        <div className="grid grid-cols-1 gap-4 md:hidden">
          {upsells.map((upsell, index) => (
            <UpsellCard key={upsell.id} upsell={upsell} index={index} />
          ))}
        </div>

        {/* TABLET : Grille 2x2 standard */}
        <div className="hidden md:grid lg:hidden grid-cols-2 gap-4">
          {upsells.map((upsell, index) => (
            <UpsellCard key={upsell.id} upsell={upsell} index={index} />
          ))}
        </div>

        {/* DESKTOP : Bento Grid asymétrique - REFONTE MAJEURE */}
        <div className="hidden lg:grid gap-4" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gridTemplateRows: 'repeat(3, 180px)',
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

// Composant de carte individuelle ULTRA-PREMIUM
interface UpsellCardProps {
  upsell: {
    id: string;
    title: string;
    description: string;
    highlight: string;
    icon: React.ElementType;
    price: string;
    originalPrice: string;
    featured?: boolean;
    image: string;
    gradient: string;
    iconColor: string;
  };
  index: number;
  fullHeight?: boolean;
}

const UpsellCard: React.FC<UpsellCardProps> = ({ upsell, index, fullHeight }) => {
  const [isHovered, setIsHovered] = React.useState(false);
  const Icon = upsell.icon;
  
  // Calcul du discount %
  const discountPercent = Math.round(
    ((parseFloat(upsell.originalPrice) - parseFloat(upsell.price)) / parseFloat(upsell.originalPrice)) * 100
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className={`relative rounded-2xl overflow-hidden group ${fullHeight ? 'h-full' : ''}`}
    >
      {/* Container avec border gradient qui s'illumine au hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl blur-sm"></div>
      
      <div className="relative h-full bg-gradient-to-br from-cosmic-void/95 via-cosmic-void/90 to-cosmic-void/95 border border-white/10 group-hover:border-white/20 rounded-2xl backdrop-blur-xl transition-all duration-500 group-hover:shadow-2xl group-hover:shadow-cosmic-gold/10">
        
        {/* Image de fond avec overlay gradient personnalisé */}
        <div className="absolute inset-0 opacity-30">
          <img
            src={upsell.image}
            alt={upsell.title}
            className="w-full h-full object-cover"
          />
          <div className={`absolute inset-0 bg-gradient-to-br ${upsell.gradient}`}></div>
          <div className="absolute inset-0 bg-gradient-to-t from-cosmic-void via-cosmic-void/60 to-transparent"></div>
        </div>

        {/* Badge Featured pour le Pack */}
        {upsell.featured && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="absolute top-4 right-4 z-20"
          >
            <div className="flex items-center gap-1.5 bg-gradient-to-r from-cosmic-gold via-amber-400 to-cosmic-gold px-3 py-1.5 rounded-full border border-cosmic-gold/30 shadow-lg shadow-cosmic-gold/20">
              <Sparkles className="w-3 h-3 text-cosmic-void animate-pulse" />
              <span className="text-[10px] font-bold text-cosmic-void uppercase tracking-wider">Best Value</span>
            </div>
          </motion.div>
        )}

        {/* Discount badge top-left */}
        {discountPercent > 0 && (
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="absolute top-4 left-4 z-20"
          >
            <div className="bg-red-500/90 backdrop-blur-sm px-2.5 py-1 rounded-lg border border-red-400/30">
              <span className="text-xs font-bold text-white">-{discountPercent}%</span>
            </div>
          </motion.div>
        )}

        {/* Contenu principal */}
        <div className="relative z-10 p-6 flex flex-col h-full justify-between">
          
          {/* Header avec icône animée */}
          <div>
            <motion.div
              animate={{
                rotate: isHovered ? [0, -10, 10, 0] : 0,
                scale: isHovered ? 1.1 : 1,
              }}
              transition={{ duration: 0.5 }}
              className="mb-4"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 flex items-center justify-center group-hover:border-white/20 transition-colors duration-300`}>
                <Icon className={`w-6 h-6 ${upsell.iconColor}`} />
              </div>
            </motion.div>

            {/* Titre */}
            <h3 className="text-xl font-bold text-white mb-2 leading-tight group-hover:text-cosmic-gold transition-colors duration-300">
              {upsell.title}
            </h3>
            
            {/* Description */}
            <p className="text-white/70 text-sm leading-relaxed mb-3">
              {upsell.description}
            </p>

            {/* Highlight avec icône */}
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-1 rounded-full bg-cosmic-gold/60"></div>
              <span className="text-xs text-cosmic-gold/90 font-medium">
                {upsell.highlight}
              </span>
            </div>
          </div>

          {/* Footer avec prix et CTA magnétique */}
          <div className="space-y-3">
            {/* Prix */}
            <div className="flex items-baseline gap-2">
              <motion.span
                animate={{ scale: isHovered ? 1.05 : 1 }}
                transition={{ duration: 0.2 }}
                className="text-4xl font-bold bg-gradient-to-r from-cosmic-gold via-amber-300 to-cosmic-gold bg-clip-text text-transparent"
              >
                {upsell.price}€
              </motion.span>
              <span className="text-sm text-white/40 line-through">
                {upsell.originalPrice}€
              </span>
            </div>

            {/* CTA Button - Style Apple/Stripe */}
            <motion.a
              href={`/commande?upsell=${upsell.id}`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="block w-full"
            >
              <div className="relative group/btn overflow-hidden">
                {/* Gradient animé au hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-cosmic-gold via-amber-400 to-cosmic-gold bg-[length:200%_100%] group-hover/btn:animate-[shimmer_2s_linear_infinite]"></div>
                
                {/* Contenu du bouton */}
                <div className="relative px-6 py-3.5 flex items-center justify-center gap-2">
                  <span className="text-sm font-bold text-cosmic-void">
                    Ajouter au panier
                  </span>
                  <motion.div
                    animate={{ x: isHovered ? 4 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Sparkles className="w-4 h-4 text-cosmic-void" />
                  </motion.div>
                </div>
              </div>
            </motion.a>
          </div>
        </div>

        {/* Particules flottantes au hover */}
        {isHovered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 pointer-events-none"
          >
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ 
                  x: Math.random() * 100 + '%', 
                  y: '100%',
                  opacity: 0 
                }}
                animate={{
                  y: '-20%',
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 2 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
                className="absolute w-1 h-1 bg-cosmic-gold/60 rounded-full"
              />
            ))}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default UpsellSectionRefonte;
