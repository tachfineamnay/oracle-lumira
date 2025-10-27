import { motion } from 'framer-motion';
import { CheckCircle, Sparkles } from 'lucide-react';

interface ProductSummaryHeaderProps {
  name: string;
  amount: number;
  features: string[];
  limitedOffer?: string;  // PASSAGE 26: Message offre limitee
}

/**
 * ProductSummaryHeader - Résumé compact du produit
 * 
 * Design 2025:
 * - Compact mais informatif
 * - Icons animées pour attirer l'attention sur les features
 * - Prix visible et clair
 * - Pas de distraction excessive
 */
export const ProductSummaryHeader = ({
  name,
  amount,
  features,
  limitedOffer,  // PASSAGE 26
}: ProductSummaryHeaderProps) => {
  const formattedPrice = amount === 0 ? 'Gratuit' : `${(amount / 100).toFixed(2)} €`;  // PASSAGE 26

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="mb-8 bg-gradient-to-br from-mystical-purple/30 to-mystical-night/50 backdrop-blur-md border border-mystical-gold/30 rounded-2xl p-6 shadow-spiritual relative overflow-hidden"
    >
      {/* Background Subtle Animation */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-mystical-gold/5 to-transparent"
        animate={{
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      <div className="relative z-10">
        {/* Header avec Prix */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-white/95 tracking-wide mb-1 flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-mystical-gold" />
              {name}
            </h2>
            <p className="text-sm text-gray-400/90 tracking-wide">
              Lecture karmique personnalisée
            </p>
          </div>
          
          <div className="text-right">
            <div className="text-3xl font-bold text-mystical-gold tracking-tight">
              {formattedPrice}
            </div>
            {amount === 0 ? (
              <p className="text-xs text-mystical-gold/80 mt-1 font-medium">
                {limitedOffer || '✨ Offre spéciale'}
              </p>
            ) : (
              <p className="text-xs text-gray-400 mt-0.5">TTC</p>
            )}
          </div>
        </div>

        {/* Features List (Compact) */}
        {features && features.length > 0 && (
          <div className="mt-4 space-y-2">
            {features.slice(0, 3).map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="flex items-center gap-2"
              >
                <motion.div
                  animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.8, 1, 0.8],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: index * 0.3,
                  }}
                >
                  <CheckCircle className="w-4 h-4 text-mystical-gold/90 flex-shrink-0" />
                </motion.div>
                <span className="text-sm text-gray-300/90 tracking-wide">
                  {feature}
                </span>
              </motion.div>
            ))}
            
            {features.length > 3 && (
              <p className="text-xs text-gray-500 pl-6">
                + {features.length - 3} autres avantages
              </p>
            )}
          </div>
        )}
      </div>

      {/* Decorative Corner Elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-mystical-gold/5 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-mystical-purple/10 rounded-full blur-2xl -z-10" />
    </motion.div>
  );
};

export default ProductSummaryHeader;
