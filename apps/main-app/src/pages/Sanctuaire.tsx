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
            <h2 className="font-playfair italic text-3xl font-medium text-mystical-gold mb-4">
              Bienvenue dans votre Sanctuaire Spirituel
            </h2>
            <p className="text-white/80 text-lg mb-6">
              Commencez votre voyage en complétant votre profil spirituel
            </p>
          </div>

          {/* Mandala Central - Uniquement sur l'accueil */}
          <div className="mb-12">
            <MandalaNav progress={[0, 0, 0, 0, 0]} effects="subtle" />
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
          <MandalaNav progress={[0, 0, 0, 0, 0]} effects="subtle" />
        </div>

        {/* Progress Section stellaire */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="bg-gradient-to-br from-mystical-gold/10 to-mystical-purple/10 backdrop-blur-sm border border-mystical-gold/30 rounded-3xl p-8 mb-12"
        >
          <h2 className="font-playfair italic text-2xl font-medium text-mystical-gold mb-8 text-center">
            Votre Évolution Spirituelle
          </h2>
          
          <div className="grid md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((level, index) => (
              <div key={level} className="text-center">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                  index <= 1 ? 'bg-mystical-gold text-mystical-abyss' : 'bg-mystical-gold/20 text-mystical-gold'
                }`}>
                  <span className="font-semibold">{level}</span>
                </div>
                <h3 className="font-inter font-medium text-white mb-2">Niveau {level}</h3>
                <p className="font-inter text-xs text-gray-400">
                  {index <= 1 ? 'Complété' : 'À venir'}
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Readings Section stellaire */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="grid md:grid-cols-2 gap-8"
        >
          {/* Reading Card */}
          <div className="bg-gradient-to-br from-mystical-purple/10 to-mystical-gold/10 backdrop-blur-sm border border-mystical-gold/30 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-playfair italic text-xl font-medium text-white">
                Votre Lecture Niveau 2
              </h3>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-mystical-gold fill-current" />
                ))}
              </div>
            </div>
            
            <p className="font-inter text-sm text-gray-300 mb-6">
              Archétype révélé : <span className="text-mystical-gold font-medium">L'Exploratrice Mystique</span>
            </p>
            
            <div className="space-y-3 mb-6">
              <button className="w-full flex items-center gap-3 p-3 rounded-lg bg-mystical-gold/20 hover:bg-mystical-gold/30 transition-colors duration-300">
                <Download className="w-4 h-4 text-mystical-gold" />
                <span className="font-inter text-sm text-white">Télécharger PDF (2.3 MB)</span>
              </button>
              
              <button className="w-full flex items-center gap-3 p-3 rounded-lg bg-mystical-purple/20 hover:bg-mystical-purple/30 transition-colors duration-300">
                <Play className="w-4 h-4 text-mystical-purple" />
                <span className="font-inter text-sm text-white">Écouter Audio (25 min)</span>
              </button>
              
              <button className="w-full flex items-center gap-3 p-3 rounded-lg bg-mystical-gold/20 hover:bg-mystical-gold/30 transition-colors duration-300">
                <Download className="w-4 h-4 text-mystical-gold" />
                <span className="font-inter text-sm text-white">Mandala HD (1920x1920)</span>
              </button>
            </div>
            
            <div className="flex items-center gap-2 text-gray-400">
              <Calendar className="w-4 h-4" />
              <span className="font-inter text-xs">Reçu le 15 mars 2024</span>
            </div>
          </div>

          {/* Coming Soon Card */}
          <div className="bg-gradient-to-br from-mystical-gold/5 to-mystical-purple/5 backdrop-blur-sm border border-mystical-gold/20 rounded-2xl p-6 opacity-60">
            <h3 className="font-playfair italic text-xl font-medium text-gray-300 mb-4">
              Prochaine Lecture
            </h3>
            <p className="font-inter text-sm text-gray-400 mb-6">
              Votre prochain voyage spirituel vous attend. 
              Choisissez un nouveau niveau pour approfondir votre exploration.
            </p>
            <button className="w-full py-3 rounded-lg border border-mystical-gold/30 text-mystical-gold hover:bg-mystical-gold/10 transition-all duration-300">
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

  const progress = Math.round(((user?.level || 1) / 4) * 100);

  // Compute upload progress from UserLevel context to surface in UI + mandala
  const uploadProgress = (() => {
    if (!userLevel?.currentLevel) return 0;
    const requiredFilesMap: Record<string, number> = {
      initie: 1,
      mystique: 2,
      profond: 3,
      integrale: 4,
    };
    const required = requiredFilesMap[userLevel.currentLevel] ?? 1;
    const uploaded = userLevel.uploadedFiles?.length ?? 0;
    return Math.min(Math.round((uploaded / required) * 100), 100);
  })();

  return (
    <PageLayout variant="dark">
      {/* Sidebar pour les sous-pages */}
      <SanctuaireSidebar progress={[uploadProgress, 0, 0, 0]} />
      
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

            {/* Upload Callout - Uniquement si le profil est complété mais upload pas fini */}
            {userLevel?.hasAccess && userLevel?.profile?.profileCompleted && userLevel?.uploadStatus !== 'completed' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.25 }}
              >
                <GlassCard className="p-5 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/5 border-white/10">
                  <div>
                    <div className="text-sm text-white/80 mb-1">Progression d'upload</div>
                    <div className="flex items-center gap-3">
                      <div className="w-40 h-2 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-amber-400 to-amber-500"
                          initial={{ width: 0 }}
                          animate={{ width: `${uploadProgress}%` }}
                          transition={{ duration: 0.6 }}
                        />
                      </div>
                      <span className="text-amber-400 text-sm font-medium">{uploadProgress}%</span>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate(`/upload-sanctuaire?level=${userLevel.currentLevel ?? ''}`)}
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-mystical-900 font-medium hover:from-amber-500 hover:to-amber-600 transition-colors"
                  >
                    Compléter mes fichiers
                  </button>
                </GlassCard>
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