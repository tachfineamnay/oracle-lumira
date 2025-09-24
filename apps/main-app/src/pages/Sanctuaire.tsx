import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, Download, Play, Calendar, Home } from 'lucide-react';
import PageLayout from '../components/ui/PageLayout';
import MandalaNav from '../components/mandala/MandalaNav';
import SanctuaireSidebar from '../components/layout/SanctuaireSidebar';
import GlassCard from '../components/ui/GlassCard';
import SanctuaireWelcomeForm from '../components/sanctuaire/SanctuaireWelcomeForm';
import { useAuth } from '../hooks/useAuth';
import { labels } from '../lib/sphereLabels';
import { useUserLevel } from '../contexts/UserLevelContext';

const ContextualHint: React.FC = () => {
  const location = useLocation();
  const path = location.pathname;
  const { userLevel } = useUserLevel();

  // Si on est sur la page principale /sanctuaire, afficher le contenu approprié
  if (path === '/sanctuaire') {
    // Si le profil n'est pas complété, afficher le formulaire
    if (!userLevel.profile?.profileCompleted) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {/* Message de bienvenue */}
          <div className="text-center mb-8">
            <h2 className="font-playfair italic text-3xl font-medium text-amber-400 mb-4">
              Bienvenue dans votre Sanctuaire Spirituel
            </h2>
            <p className="text-white/80 text-lg mb-6">
              Commencez votre voyage en complétant votre profil spirituel
            </p>
          </div>

          {/* Mandala Central - Uniquement sur l'accueil */}
          <div className="mb-12">
            <MandalaNav progress={[0, 0, 0, 0, 0]} effects="minimal" />
          </div>

          {/* Formulaire d'accueil */}
          <SanctuaireWelcomeForm />
        </motion.div>
      );
    }

    // Si le profil est complété, afficher le dashboard
    return (
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        {/* Message de bienvenue personnalisé */}
        <div className="text-center mb-8">
          <h2 className="font-playfair italic text-3xl font-medium text-amber-400 mb-4">
            Votre Sanctuaire Personnel
          </h2>
          <p className="text-white/70 text-lg">
            Explorez votre univers intérieur à travers le mandala sacré
          </p>
        </div>

        {/* Mandala Central */}
        <div className="mb-12">
          <MandalaNav progress={[0, 0, 0, 0, 0]} effects="minimal" />
        </div>

        {/* Dashboard Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {/* Dernière Lecture Card */}
          <div className="bg-gradient-to-br from-green-400/10 to-blue-400/10 backdrop-blur-sm border border-green-400/20 rounded-2xl p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-400/20 rounded-full flex items-center justify-center">
                  <Star className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <h3 className="font-playfair italic text-xl font-medium text-green-400">
                    Dernière Lecture
                  </h3>
                  <p className="font-inter text-sm text-white/60">
                    Niveau Chercheur Cosmique
                  </p>
                </div>
              </div>
              <div className="flex space-x-2">
                <button className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-colors">
                  <Download className="w-4 h-4 text-white/70" />
                </button>
                <button className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-colors">
                  <Play className="w-4 h-4 text-white/70" />
                </button>
              </div>
            </div>
            <p className="font-inter text-sm text-white/80 mb-4 line-clamp-3">
              Une révélation profonde sur votre chemin de vie vous attend dans cette analyse personnalisée de vos énergies cosmiques...
            </p>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-white/50">
                <Calendar className="w-4 h-4" />
                <span className="font-inter text-xs">Reçu le 15 mars 2024</span>
              </div>
            </div>
          </div>

          {/* Coming Soon Card */}
          <div className="bg-gradient-to-br from-amber-400/5 to-purple-400/5 backdrop-blur-sm border border-amber-400/20 rounded-2xl p-6 opacity-60">
            <h3 className="font-playfair italic text-xl font-medium text-gray-300 mb-4">
              Prochaine Lecture
            </h3>
            <p className="font-inter text-sm text-gray-400 mb-6">
              Votre prochain voyage spirituel vous attend. 
              Choisissez un nouveau niveau pour approfondir votre exploration.
            </p>
            <button className="w-full py-3 rounded-lg border border-amber-400/30 text-amber-400 hover:bg-amber-400/10 transition-all duration-300">
              <span className="font-inter text-sm">Explorer les niveaux</span>
            </button>
          </div>
        </motion.div>
      </motion.div>
    );
  }

  // Pour les sous-pages, afficher les hints contextuels
  let hint = '';
  if (path.includes('/path')) hint = labels.emptyPath;
  else if (path.includes('/draws')) hint = labels.emptyDraws;
  else if (path.includes('/synthesis')) hint = 'Explorez vos insights par catégories spirituelles';
  else if (path.includes('/chat')) hint = labels.emptyConv;
  else hint = 'Naviguez dans votre sanctuaire personnel';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
    >
      <GlassCard className="p-6 backdrop-blur-xl bg-white/5 border-white/10">
        <p className="text-sm text-white/70 italic font-light leading-relaxed">{hint}</p>
      </GlassCard>
    </motion.div>
  );
};

const Sanctuaire: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { userLevel } = useUserLevel();

  const progress = Math.round(((Number(userLevel.currentLevel) || 1) / 4) * 100);
  return (
    <PageLayout variant="dark">
      {/* Sidebar pour les sous-pages */}
      <SanctuaireSidebar progress={[progress, 0, 0, 0]} />
      
      {/* Contenu principal avec marge pour sidebar sur sous-pages */}
      <div className={location.pathname !== '/sanctuaire' ? 'ml-64' : ''}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="space-y-8 py-6 sm:py-8 lg:py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, staggerChildren: 0.1 }}
          >
            {/* Header pour les sous-pages uniquement */}
            {location.pathname !== '/sanctuaire' && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex items-center justify-between"
              >
                <div>
                  <h1 className="text-2xl font-playfair italic text-amber-400 mb-2">
                    {location.pathname.includes('/path') ? 'Chemin Spirituel' :
                     location.pathname.includes('/draws') ? 'Tirages & Lectures' :
                     location.pathname.includes('/synthesis') ? 'Synthèse' :
                     location.pathname.includes('/chat') ? 'Conversations' : 'Sanctuaire'}
                  </h1>
                  <p className="text-white/70">
                    Bienvenue {user?.firstName || 'âme lumineuse'}
                  </p>
                </div>
                
                {/* Bouton retour à l'accueil facile */}
                <button
                  onClick={() => navigate('/sanctuaire')}
                  className="flex items-center gap-2 px-4 py-2 bg-amber-400/10 border border-amber-400/20 rounded-lg text-amber-400 hover:bg-amber-400/20 transition-all"
                >
                  <Home className="w-4 h-4" />
                  <span className="text-sm">Accueil</span>
                </button>
              </motion.div>
            )}

            {/* Cosmic Header - Uniquement pour l'accueil */}
            {location.pathname === '/sanctuaire' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="relative"
              >
                <div className="relative w-full h-48 sm:h-56 lg:h-60 rounded-3xl overflow-hidden backdrop-blur-2xl bg-gradient-to-br from-mystical-900/40 via-mystical-800/30 to-mystical-700/20 border border-white/10 shadow-2xl">
                  <div className="absolute inset-0 bg-gradient-to-t from-mystical-900/50 via-transparent to-transparent" />
                  
                  <div className="relative z-10 h-full flex flex-col justify-center px-8 sm:px-12">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.4 }}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-32 h-1 bg-white/20 rounded-full overflow-hidden">
                          <motion.div 
                            className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.8, delay: 0.6 }}
                          />
                        </div>
                        <span className="text-sm text-amber-400 font-medium">{progress}%</span>
                      </div>
                      <h1 className="text-3xl sm:text-4xl lg:text-5xl font-cinzel font-light text-amber-400 mb-3 tracking-wide">
                        Bienvenue, âme lumineuse
                      </h1>
                      <p className="text-lg sm:text-xl text-white/80 font-light">
                        {user?.firstName ? `Bonjour ${user.firstName}` : 'Bonjour'}
                      </p>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Contextual Hint */}
            <ContextualHint />

            {/* Content Area - Uniquement pour les sous-pages */}
            {location.pathname !== '/sanctuaire' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <GlassCard className="min-h-[400px] backdrop-blur-xl bg-white/5 border-white/10">
                  <Outlet />
                </GlassCard>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </PageLayout>
  );
};

export default Sanctuaire;