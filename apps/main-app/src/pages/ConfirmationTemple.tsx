import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowRight, Home } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const ConfirmationTemple: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const success = searchParams.get('success') === 'true';

  if (!success) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 sm:py-16 lg:py-20 px-4">
        <div className="text-center">
          <p className="font-inter text-gray-400 text-sm sm:text-base">Accès non autorisé</p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 px-4 sm:px-6 py-2 sm:py-3 rounded-full border border-mystical-gold/30 text-mystical-gold hover:bg-mystical-gold/10 transition-all duration-300 text-sm sm:text-base"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 sm:py-16 lg:py-20 px-4 sm:px-6">
      <div className="container mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          {/* Success Icon - RESPONSIVE */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-r from-green-400 to-green-600 flex items-center justify-center mx-auto mb-6 sm:mb-8"
          >
            <CheckCircle className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
          </motion.div>

          {/* Title - RESPONSIVE */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="font-playfair italic text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-medium mb-4 sm:mb-6 bg-gradient-to-r from-mystical-gold via-mystical-gold-light to-mystical-gold bg-clip-text text-transparent leading-tight px-2"
          >
            Commande confirmée ! ✨
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="font-inter font-light text-base sm:text-lg md:text-xl text-gray-300 mb-8 sm:mb-12 max-w-2xl mx-auto leading-relaxed px-2"
          >
            Votre lecture vibratoire est en cours de préparation. Vous recevrez votre révélation dans les 24 prochaines heures.
          </motion.p>

          {/* Timeline - RESPONSIVE */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            className="bg-gradient-to-br from-mystical-gold/10 to-mystical-purple/10 backdrop-blur-sm border border-mystical-gold/30 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 mb-8 sm:mb-12"
          >
            <h3 className="font-playfair italic text-lg sm:text-xl md:text-2xl font-medium text-mystical-gold mb-6 sm:mb-8 px-2">
              Votre voyage spirituel commence
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
              <div className="text-center">
                <div className="w-8 h-8 rounded-full bg-mystical-gold text-mystical-abyss font-semibold flex items-center justify-center mx-auto mb-3 text-sm">
                  1
                </div>
                <h4 className="font-inter font-medium text-white mb-2 text-sm sm:text-base">Canalisation</h4>
                <p className="font-inter text-xs sm:text-sm text-gray-400">Notre Oracle se connecte à votre énergie</p>
              </div>
              
              <div className="text-center">
                <div className="w-8 h-8 rounded-full bg-mystical-gold/50 text-white font-semibold flex items-center justify-center mx-auto mb-3 text-sm">
                  2
                </div>
                <h4 className="font-inter font-medium text-white mb-2 text-sm sm:text-base">Création</h4>
                <p className="font-inter text-xs sm:text-sm text-gray-400">Génération de votre lecture personnalisée</p>
              </div>
              
              <div className="text-center">
                <div className="w-8 h-8 rounded-full bg-mystical-gold/30 text-gray-400 font-semibold flex items-center justify-center mx-auto mb-3 text-sm">
                  3
                </div>
                <h4 className="font-inter font-medium text-gray-300 mb-2 text-sm sm:text-base">Livraison</h4>
                <p className="font-inter text-xs sm:text-sm text-gray-400">Réception par email sous 24h</p>
              </div>
            </div>
          </motion.div>

          {/* Actions - RESPONSIVE */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.1 }}
            className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4 sm:px-0"
          >
            <motion.button
              onClick={() => navigate('/sanctuaire')}
              className="px-6 sm:px-8 py-3 rounded-full bg-gradient-to-r from-mystical-gold to-mystical-gold-light text-mystical-abyss font-inter font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-mystical-gold/30 flex items-center justify-center gap-2 text-sm sm:text-base"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="hidden sm:inline">Entrer dans le Sanctuaire</span>
              <span className="sm:hidden">Sanctuaire</span>
              <ArrowRight className="w-4 h-4" />
            </motion.button>
            
            <motion.button
              onClick={() => navigate('/')}
              className="px-6 sm:px-8 py-3 rounded-full border border-mystical-gold/30 text-mystical-gold hover:bg-mystical-gold/10 transition-all duration-300 flex items-center justify-center gap-2 text-sm sm:text-base"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline">Retour à l'accueil</span>
              <span className="sm:hidden">Accueil</span>
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default ConfirmationTemple;

