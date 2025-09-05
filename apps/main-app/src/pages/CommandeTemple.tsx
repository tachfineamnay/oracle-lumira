import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ShoppingBag } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const CommandeTemple: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const level = searchParams.get('level') || '1';

  return (
    <div className="min-h-screen py-20">
      <div className="container mx-auto px-6 max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 text-mystical-gold hover:text-mystical-gold-light transition-colors duration-300 mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="font-inter text-sm">Retour à l'accueil</span>
          </button>
          
          <h1 className="font-playfair italic text-4xl md:text-5xl font-medium mb-4 bg-gradient-to-r from-mystical-gold via-mystical-gold-light to-mystical-amber bg-clip-text text-transparent">
            Finalise ton voyage
          </h1>
          <p className="font-inter font-light text-xl text-gray-300">
            Niveau {level} sélectionné • Prêt pour la transformation
          </p>
        </motion.div>

        {/* Order Summary */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="bg-gradient-to-br from-mystical-gold/10 to-mystical-purple/10 backdrop-blur-sm border border-mystical-gold/30 rounded-3xl p-8 mb-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <ShoppingBag className="w-6 h-6 text-mystical-gold" />
            <h2 className="font-playfair italic text-2xl font-medium text-white">
              Récapitulatif de commande
            </h2>
          </div>

          <div className="text-center py-12">
            <p className="font-inter text-gray-400 mb-6">
              Page de commande en cours de développement
            </p>
            <motion.button
              onClick={() => navigate('/confirmation?success=true')}
              className="px-8 py-3 rounded-full bg-gradient-to-r from-mystical-gold to-mystical-gold-light text-mystical-dark font-inter font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-mystical-gold/30"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Simuler le paiement
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CommandeTemple;
