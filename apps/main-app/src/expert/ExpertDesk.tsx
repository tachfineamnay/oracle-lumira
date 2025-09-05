import React from 'react';
import { motion } from 'framer-motion';
import { Crown, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ExpertDesk: React.FC = () => {
  const navigate = useNavigate();

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
          
          <div className="flex items-center justify-center gap-3 mb-6">
            <Crown className="w-8 h-8 text-mystical-gold" />
            <h1 className="font-playfair italic text-4xl md:text-5xl font-medium bg-gradient-to-r from-mystical-gold via-mystical-gold-light to-mystical-amber bg-clip-text text-transparent">
              Expert Desk
            </h1>
          </div>
          <p className="font-inter font-light text-xl text-gray-300">
            Interface Oracle pour la génération des lectures
          </p>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="bg-gradient-to-br from-mystical-gold/10 to-mystical-purple/10 backdrop-blur-sm border border-mystical-gold/30 rounded-3xl p-8 text-center"
        >
          <Crown className="w-16 h-16 text-mystical-gold mx-auto mb-6" />
          <h2 className="font-playfair italic text-2xl font-medium text-white mb-4">
            Interface Expert en développement
          </h2>
          <p className="font-inter text-gray-400 mb-8">
            L'interface complète pour les Oracles sera déployée prochainement
          </p>
          <div className="text-left max-w-md mx-auto space-y-2">
            <div className="text-sm text-gray-300">• File d'attente des commandes</div>
            <div className="text-sm text-gray-300">• Éditeur de prompts par niveau</div>
            <div className="text-sm text-gray-300">• Génération via n8n + OpenAI</div>
            <div className="text-sm text-gray-300">• Validation et livraison automatique</div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ExpertDesk;
