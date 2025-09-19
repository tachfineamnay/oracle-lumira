import React from 'react';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  Shield, 
  Clock, 
  Star, 
  Plus,
  ArrowRight,
  Check
} from 'lucide-react';
import { PrimaryButton, SecondaryButton } from '../ui/Buttons';

export interface UpsellFeature {
  icon: React.ReactNode;
  text: string;
}

export interface DimensionalUpsell {
  id: string;
  title: string;
  subtitle: string;
  price: string;
  originalPrice?: string;
  badge?: string;
  description: string;
  features: UpsellFeature[];
  ctaLabel: string;
  popular?: boolean;
  urgency?: string;
  type: 'premium' | 'extended' | 'protection' | 'priority';
}

export interface DimensionalUpsellsProps {
  title: string;
  subtitle: string;
  upsells: DimensionalUpsell[];
  onSelectUpsell: (upsellId: string) => void;
  className?: string;
}

const typeStyles = {
  premium: {
    gradient: 'from-amber-400/20 to-yellow-500/20',
    border: 'border-amber-400/30',
    accent: 'text-amber-400',
    glow: 'shadow-amber-400/20'
  },
  extended: {
    gradient: 'from-emerald-400/20 to-green-500/20',
    border: 'border-emerald-400/30',
    accent: 'text-emerald-400',
    glow: 'shadow-emerald-400/20'
  },
  protection: {
    gradient: 'from-blue-400/20 to-cyan-500/20',
    border: 'border-blue-400/30',
    accent: 'text-blue-400',
    glow: 'shadow-blue-400/20'
  },
  priority: {
    gradient: 'from-purple-400/20 to-pink-500/20',
    border: 'border-purple-400/30',
    accent: 'text-purple-400',
    glow: 'shadow-purple-400/20'
  }
};

const typeIcons = {
  premium: <Star className="w-6 h-6" />,
  extended: <Clock className="w-6 h-6" />,
  protection: <Shield className="w-6 h-6" />,
  priority: <Sparkles className="w-6 h-6" />
};

const DimensionalUpsells: React.FC<DimensionalUpsellsProps> = ({
  title,
  subtitle,
  upsells,
  onSelectUpsell,
  className = ''
}) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  return (
    <section className={`py-16 sm:py-20 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-cinzel font-light text-white mb-4">
            {title}
          </h2>
          <p className="text-lg text-white/70 max-w-3xl mx-auto">
            {subtitle}
          </p>
        </motion.div>

        {/* Upsells Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {upsells.map((upsell) => {
            const style = typeStyles[upsell.type];
            const icon = typeIcons[upsell.type];

            return (
              <motion.div
                key={upsell.id}
                variants={cardVariants}
                whileHover={{ 
                  scale: 1.03, 
                  y: -8,
                  transition: { duration: 0.3 }
                }}
                className={`relative rounded-3xl backdrop-blur-xl bg-gradient-to-br ${style.gradient} border ${style.border} ${upsell.popular ? `ring-2 ring-amber-400/50 ${style.glow} shadow-2xl` : 'shadow-xl'} overflow-hidden group`}
              >
                {/* Popular Badge */}
                {upsell.popular && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                    className="absolute -top-3 left-1/2 -translate-x-1/2 z-10"
                  >
                    <div className="bg-gradient-to-r from-amber-400 to-amber-500 text-mystical-900 px-4 py-1 rounded-full text-sm font-semibold shadow-lg">
                      Plus populaire
                    </div>
                  </motion.div>
                )}

                {/* Badge */}
                {upsell.badge && !upsell.popular && (
                  <div className="absolute top-4 right-4 z-10">
                    <div className={`${style.accent} bg-white/10 px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm border border-white/20`}>
                      {upsell.badge}
                    </div>
                  </div>
                )}

                <div className="p-6">
                  {/* Icon & Title */}
                  <div className="text-center mb-6">
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${style.gradient} border ${style.border} flex items-center justify-center ${style.accent}`}
                    >
                      {icon}
                    </motion.div>
                    
                    <h3 className="text-xl font-cinzel font-medium text-white mb-2">
                      {upsell.title}
                    </h3>
                    <p className="text-white/60 text-sm">
                      {upsell.subtitle}
                    </p>
                  </div>

                  {/* Pricing */}
                  <div className="text-center mb-6">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <span className={`text-3xl font-bold ${style.accent}`}>
                        {upsell.price}
                      </span>
                      {upsell.originalPrice && (
                        <span className="text-lg text-white/40 line-through">
                          {upsell.originalPrice}
                        </span>
                      )}
                    </div>
                    
                    {upsell.urgency && (
                      <motion.div
                        animate={{ opacity: [0.7, 1, 0.7] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="text-xs text-amber-400 font-medium"
                      >
                        {upsell.urgency}
                      </motion.div>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-white/70 text-sm mb-6 leading-relaxed">
                    {upsell.description}
                  </p>

                  {/* Features */}
                  <div className="space-y-3 mb-8">
                    {upsell.features.map((feature, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 + index * 0.1 }}
                        className="flex items-start gap-3"
                      >
                        <div className={`${style.accent} mt-0.5 flex-shrink-0`}>
                          {feature.icon}
                        </div>
                        <span className="text-white/80 text-sm">
                          {feature.text}
                        </span>
                      </motion.div>
                    ))}
                  </div>

                  {/* CTA */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {upsell.popular ? (
                      <PrimaryButton
                        onClick={() => onSelectUpsell(upsell.id)}
                        className="w-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-mystical-900 font-semibold py-3 shadow-lg shadow-amber-400/30"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        {upsell.ctaLabel}
                      </PrimaryButton>
                    ) : (
                      <SecondaryButton
                        onClick={() => onSelectUpsell(upsell.id)}
                        className={`w-full border-2 ${style.border} ${style.accent} hover:bg-white/5 py-3 group`}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        {upsell.ctaLabel}
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </SecondaryButton>
                    )}
                  </motion.div>
                </div>

                {/* Hover Glow Effect */}
                <motion.div
                  className={`absolute inset-0 bg-gradient-to-br ${style.gradient} opacity-0 group-hover:opacity-30 transition-opacity duration-300 pointer-events-none`}
                />
              </motion.div>
            );
          })}
        </motion.div>

        {/* Trust Banner */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="mt-12 text-center"
        >
          <div className="inline-flex items-center gap-4 px-6 py-3 rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10">
            <Shield className="w-5 h-5 text-emerald-400" />
            <span className="text-white/80 text-sm">
              Garantie de satisfaction 30 jours • Support prioritaire inclus
            </span>
            <div className="flex items-center gap-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="w-4 h-4 text-amber-400 fill-current" />
              ))}
              <span className="text-white/60 text-sm ml-2">4.9/5 • 2,847 avis</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default DimensionalUpsells;