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
      <div className="min-h-screen flex items-center justify-center py-20">
        <div className="text-center">
          <p className="font-inter text-gray-400">Accès non autorisé</p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 px-6 py-2 rounded-full border border-mystical-gold/30 text-mystical-gold hover:bg-mystical-gold/10 transition-all duration-300"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-20">
      <div className="container mx-auto px-6 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          {/* Success Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="w-24 h-24 rounded-full bg-gradient-to-r from-green-400 to-green-600 flex items-center justify-center mx-auto mb-8"
          >
            <CheckCircle className="w-12 h-12 text-white" />
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="font-playfair italic text-4xl md:text-5xl font-medium mb-6 bg-gradient-to-r from-mystical-gold via-mystical-gold-light to-mystical-amber bg-clip-text text-transparent"
          >
            Commande confirmée ! 🎉
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="font-inter font-light text-xl text-gray-300 mb-12 max-w-2xl mx-auto"
          >
            Votre lecture vibratoire est en cours de préparation. 
            Vous recevrez votre révélation dans les 24 prochaines heures.
          </motion.p>

          {/* Timeline */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            className="bg-gradient-to-br from-mystical-gold/10 to-mystical-purple/10 backdrop-blur-sm border border-mystical-gold/30 rounded-3xl p-8 mb-12"
          >
            <h3 className="font-playfair italic text-2xl font-medium text-mystical-gold mb-8">
              Votre voyage spirituel commence
            </h3>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-8 h-8 rounded-full bg-mystical-gold text-mystical-dark font-semibold flex items-center justify-center mx-auto mb-3">
                  1
                </div>
                <h4 className="font-inter font-medium text-white mb-2">Canalisation</h4>
                <p className="font-inter text-sm text-gray-400">Notre Oracle se connecte à votre énergie</p>
              </div>
              
              <div className="text-center">
                <div className="w-8 h-8 rounded-full bg-mystical-gold/50 text-white font-semibold flex items-center justify-center mx-auto mb-3">
                  2
                </div>
                <h4 className="font-inter font-medium text-white mb-2">Création</h4>
                <p className="font-inter text-sm text-gray-400">Génération de votre lecture personnalisée</p>
              </div>
              
              <div className="text-center">
                <div className="w-8 h-8 rounded-full bg-mystical-gold/30 text-gray-400 font-semibold flex items-center justify-center mx-auto mb-3">
                  3
                </div>
                <h4 className="font-inter font-medium text-gray-300 mb-2">Livraison</h4>
                <p className="font-inter text-sm text-gray-400">Réception par email sous 24h</p>
              </div>
            </div>
          </motion.div>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.1 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <motion.button
              onClick={() => navigate('/sanctuaire')}
              className="px-8 py-3 rounded-full bg-gradient-to-r from-mystical-gold to-mystical-gold-light text-mystical-dark font-inter font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-mystical-gold/30 flex items-center justify-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Entrer dans le Sanctuaire
              <ArrowRight className="w-4 h-4" />
            </motion.button>
            
            <motion.button
              onClick={() => navigate('/')}
              className="px-8 py-3 rounded-full border border-mystical-gold/30 text-mystical-gold hover:bg-mystical-gold/10 transition-all duration-300 flex items-center justify-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Home className="w-4 h-4" />
              Retour à l'accueil
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default ConfirmationTemple;

