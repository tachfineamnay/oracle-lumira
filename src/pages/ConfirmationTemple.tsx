import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowRight, Mail } from 'lucide-react';

const ConfirmationTemple: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const urlParams = new URLSearchParams(location.search);
  const success = urlParams.get('success') === 'true';

  if (!success) {
    navigate('/');
    return null;
  }

  return (
    <div className="min-h-screen bg-mystical-dark text-white flex items-center justify-center py-12">
      <div className="container mx-auto px-6 max-w-2xl text-center">
        
        {/* Success Animation */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", duration: 0.8 }}
          className="mb-8"
        >
          <div className="w-24 h-24 mx-auto bg-gradient-to-r from-mystical-gold to-mystical-amber rounded-full flex items-center justify-center mb-6">
            <CheckCircle className="w-12 h-12 text-mystical-dark" />
          </div>
        </motion.div>

        {/* Main Message */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-12"
        >
          <h1 className="font-playfair italic text-4xl md:text-5xl font-medium mb-6">
            Ta demande a été{' '}
            <span className="bg-gradient-to-r from-mystical-gold to-mystical-amber bg-clip-text text-transparent">
              transmise à l'Oracle
            </span>
          </h1>
          
          <div className="bg-gradient-to-br from-mystical-gold/10 to-mystical-purple/10 backdrop-blur-sm border border-mystical-gold/30 rounded-2xl p-8 mb-8">
            <h2 className="font-playfair italic text-2xl font-medium text-mystical-gold mb-4">
              Que va-t-il se passer maintenant ?
            </h2>
            
            <div className="space-y-4 text-left">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-mystical-gold/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-mystical-gold font-bold text-sm">1</span>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Réception & Analyse</h3>
                  <p className="text-gray-300 text-sm">
                    Notre Oracle reçoit tes informations et entre en connexion avec ton énergie vibratoire.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-mystical-gold/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-mystical-gold font-bold text-sm">2</span>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Création de ta lecture</h3>
                  <p className="text-gray-300 text-sm">
                    Génération personnalisée de ton profil, PDF, audio et éventuels bonus sous 24h.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-mystical-gold/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-mystical-gold font-bold text-sm">3</span>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Livraison & Accès</h3>
                  <p className="text-gray-300 text-sm">
                    Tu reçois un email avec tes téléchargements + accès à ton Sanctuaire personnel.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Email Confirmation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-mystical-purple/10 border border-mystical-purple/30 rounded-xl p-6 mb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-3">
            <Mail className="w-5 h-5 text-mystical-purple-light" />
            <h3 className="font-medium text-mystical-purple-light">Email de confirmation envoyé</h3>
          </div>
          <p className="text-sm text-gray-300">
            Vérifie ta boîte mail (et tes spams) pour le récapitulatif de ta commande.
          </p>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <motion.button
            onClick={() => navigate('/sanctuaire')}
            className="px-8 py-4 rounded-lg bg-gradient-to-r from-mystical-gold to-mystical-gold-light text-mystical-dark font-medium text-lg transition-all duration-300 hover:shadow-lg hover:shadow-mystical-gold/30 flex items-center justify-center gap-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowRight className="w-5 h-5" />
            Entrer dans le Sanctuaire
          </motion.button>
          
          <motion.button
            onClick={() => navigate('/')}
            className="px-8 py-4 rounded-lg border border-mystical-gold/30 text-mystical-gold hover:bg-mystical-gold/10 transition-all duration-300 flex items-center justify-center gap-2"
            whileHover={{ scale: 1.05 }}
          >
            Retour à l'accueil
          </motion.button>
        </motion.div>

        {/* Footer Note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="text-sm text-gray-500 mt-12"
        >
          Une question ? Contact : support@oraclelumira.com
        </motion.p>
      </div>
    </div>
  );
};

export default ConfirmationTemple;
