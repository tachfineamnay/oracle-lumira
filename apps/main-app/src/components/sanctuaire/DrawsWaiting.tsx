import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, Mail, Smartphone, Home, Sparkles, Calendar } from 'lucide-react';
import GlassCard from '../ui/GlassCard';

interface DrawsWaitingProps {
  userEmail?: string;
  userPhone?: string;
  estimatedTime?: string;
}

/**
 * DrawsWaiting - Page d'attente élégante pour les tirages en cours
 * 
 * Affichée lorsque l'utilisateur a payé et soumis son formulaire
 * mais que le résultat n'est pas encore disponible.
 */
const DrawsWaiting: React.FC<DrawsWaitingProps> = ({ 
  userEmail = 'Non renseigné',
  userPhone = 'Non renseigné',
  estimatedTime = '24 heures'
}) => {
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto py-8">
      {/* Animation de l'Oracle */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-8"
      >
        <div className="relative inline-block mb-6">
          {/* Cercles animés */}
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-amber-400/30"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 0.2, 0.5]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-purple-400/30"
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.2, 0.5, 0.2]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1
            }}
          />
          
          {/* Icône centrale */}
          <div className="relative w-32 h-32 bg-gradient-to-br from-amber-400/20 to-purple-400/20 rounded-full flex items-center justify-center backdrop-blur-sm">
            <motion.div
              animate={{
                rotate: [0, 360]
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: "linear"
              }}
            >
              <Sparkles className="w-16 h-16 text-amber-400" />
            </motion.div>
          </div>
        </div>

        {/* Titre principal */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-3xl md:text-4xl font-playfair italic text-amber-400 mb-3"
        >
          Votre tirage est en cours de préparation
        </motion.h1>

        {/* Message secondaire */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-lg text-white/80 max-w-2xl mx-auto leading-relaxed"
        >
          L'Oracle prépare actuellement votre révélation personnalisée.<br />
          Une réponse vous sera envoyée dans les <strong className="text-amber-400">prochaines {estimatedTime}</strong>.
        </motion.p>
      </motion.div>

      {/* Timeline de progression */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mb-8"
      >
        <GlassCard className="p-6">
          <div className="flex items-center justify-between">
            {/* Étape 1 : Demande reçue */}
            <div className="flex flex-col items-center flex-1">
              <div className="w-12 h-12 rounded-full bg-green-400/20 border-2 border-green-400 flex items-center justify-center mb-2">
                <div className="w-6 h-6 rounded-full bg-green-400 flex items-center justify-center">
                  <svg className="w-4 h-4 text-mystical-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <span className="text-sm text-green-400 font-medium">Demande reçue</span>
            </div>

            {/* Ligne de connexion */}
            <div className="flex-1 h-0.5 bg-gradient-to-r from-green-400 via-amber-400 to-amber-400/30 mx-4" />

            {/* Étape 2 : En cours d'analyse */}
            <div className="flex flex-col items-center flex-1">
              <motion.div
                className="w-12 h-12 rounded-full bg-amber-400/20 border-2 border-amber-400 flex items-center justify-center mb-2"
                animate={{
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <Clock className="w-6 h-6 text-amber-400" />
              </motion.div>
              <span className="text-sm text-amber-400 font-medium">En cours d'analyse</span>
            </div>

            {/* Ligne de connexion */}
            <div className="flex-1 h-0.5 bg-gradient-to-r from-amber-400/30 to-white/10 mx-4" />

            {/* Étape 3 : Réponse prête */}
            <div className="flex flex-col items-center flex-1">
              <div className="w-12 h-12 rounded-full bg-white/10 border-2 border-white/30 flex items-center justify-center mb-2">
                <Sparkles className="w-6 h-6 text-white/40" />
              </div>
              <span className="text-sm text-white/50 font-medium">Réponse prête</span>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* Section Notifications */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mb-8"
      >
        <GlassCard className="p-6">
          <h2 className="text-xl font-playfair italic text-amber-400 mb-4 text-center">
            Vous serez notifié par :
          </h2>
          
          <div className="grid md:grid-cols-2 gap-4">
            {/* Notification Email */}
            <div className="flex items-center gap-4 p-4 rounded-lg bg-white/5 border border-white/10">
              <div className="w-12 h-12 rounded-full bg-blue-400/20 flex items-center justify-center flex-shrink-0">
                <Mail className="w-6 h-6 text-blue-400" />
              </div>
              <div className="flex-1">
                <p className="text-white font-medium mb-1">Notification par email</p>
                <p className="text-sm text-white/60">{userEmail}</p>
              </div>
            </div>

            {/* Notification SMS */}
            <div className="flex items-center gap-4 p-4 rounded-lg bg-white/5 border border-white/10">
              <div className="w-12 h-12 rounded-full bg-green-400/20 flex items-center justify-center flex-shrink-0">
                <Smartphone className="w-6 h-6 text-green-400" />
              </div>
              <div className="flex-1">
                <p className="text-white font-medium mb-1">Notification par SMS</p>
                <p className="text-sm text-white/60">{userPhone}</p>
              </div>
            </div>
          </div>

          {/* Informations supplémentaires */}
          <div className="mt-6 p-4 rounded-lg bg-amber-400/10 border border-amber-400/20">
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-white/90 leading-relaxed">
                  <strong className="text-amber-400">Délai de traitement :</strong> Notre équipe d'experts spirituels prépare votre révélation personnalisée. 
                  Vous recevrez vos notifications dès que votre tirage sera prêt.
                </p>
              </div>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="flex flex-col sm:flex-row gap-4 justify-center"
      >
        <button
          onClick={() => navigate('/sanctuaire')}
          className="flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-amber-400 to-amber-500 text-mystical-900 font-medium rounded-xl hover:from-amber-500 hover:to-amber-600 transition-all shadow-lg hover:shadow-xl"
        >
          <Home className="w-5 h-5" />
          <span>Retour à l'accueil du Sanctuaire</span>
        </button>

        <button
          onClick={() => navigate('/sanctuaire/profile')}
          className="flex items-center justify-center gap-3 px-8 py-4 bg-white/10 text-white border border-white/20 font-medium rounded-xl hover:bg-white/20 transition-all"
        >
          <span>Gérer mon profil</span>
        </button>
      </motion.div>

      {/* Message de réassurance */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
        className="mt-8 text-center"
      >
        <p className="text-sm text-white/50 italic">
          "La patience est la clé de la sagesse. Votre révélation arrivera au moment parfait." ✨
        </p>
      </motion.div>
    </div>
  );
};

export default DrawsWaiting;
