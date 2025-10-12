import React from 'react';
import { Outlet, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, Download, Play, Calendar, Home, Clock, User, FileText, Settings, CreditCard, Eye } from 'lucide-react';
import PageLayout from '../components/ui/PageLayout';
import MandalaNav from '../components/mandala/MandalaNav';
import SanctuaireSidebar from '../components/layout/SanctuaireSidebar';
import GlassCard from '../components/ui/GlassCard';
import SanctuaireWelcomeForm from '../components/sanctuaire/SanctuaireWelcomeForm';
import { useAuth } from '../hooks/useAuth';
import { labels } from '../lib/sphereLabels';
import { useUserLevel } from '../contexts/UserLevelContext';
import ExistingClientLoginBar from '../components/sanctuaire/ExistingClientLoginBar';
import { AudioPlayerProvider } from '../contexts/AudioPlayerContext';
import MiniAudioPlayer from '../components/sanctuaire/MiniAudioPlayer';
import { useSanctuaire } from '../hooks/useSanctuaire';

const ProfileIcon: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { userLevel } = useUserLevel();

  const hasProfileData = userLevel.profile?.profileCompleted;

  return (
    <div className="fixed top-6 right-6 z-50 flex items-center gap-3">
      {/* Bouton Accueil */}
      <button
        onClick={() => navigate('/sanctuaire')}
        className="flex items-center gap-2 px-3 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-white hover:bg-white/20 transition-all"
        title="Retour à l'accueil"
      >
        <Home className="w-4 h-4" />
      </button>

      {/* Icône Profil avec dropdown */}
      <div className="relative group">
        <button className="flex items-center gap-2 px-3 py-2 bg-amber-400/10 backdrop-blur-md border border-amber-400/20 rounded-lg text-amber-400 hover:bg-amber-400/20 transition-all">
          <User className="w-4 h-4" />
          <span className="text-sm font-medium">
            {user?.firstName || 'Profil'}
          </span>
        </button>

        {/* Dropdown Menu */}
        <div className="absolute right-0 top-full mt-2 w-72 bg-mystical-900/95 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
          <div className="p-4">
            {/* Info utilisateur */}
            <div className="mb-4">
              <h3 className="text-white font-medium">{user?.firstName || 'Âme Lumineuse'}</h3>
              <p className="text-white/60 text-sm">{user?.email || 'Non renseigné'}</p>
            </div>

            {/* Statut du profil */}
            <div className="mb-4 p-3 bg-gradient-to-r from-amber-400/10 to-green-400/10 border border-amber-400/20 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-2 h-2 rounded-full ${hasProfileData ? 'bg-green-400' : 'bg-amber-400'}`} />
                <span className="text-sm font-medium text-white">
                  {hasProfileData ? 'Profil Complété' : 'Profil à compléter'}
                </span>
              </div>
              {hasProfileData && userLevel.profile?.submittedAt && (
                <p className="text-xs text-white/70">
                  Soumis le {new Date(userLevel.profile.submittedAt).toLocaleDateString('fr-FR')}
                </p>
              )}
            </div>

            {/* Actions rapides */}
            <div className="space-y-2">
              <button
                onClick={() => navigate('/sanctuaire/profile')}
                className="w-full flex items-center gap-3 px-3 py-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all text-left"
              >
                <Settings className="w-4 h-4" />
                <span className="text-sm">Gérer mon profil</span>
              </button>

              <button
                onClick={() => navigate('/sanctuaire/draws')}
                className="w-full flex items-center gap-3 px-3 py-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all text-left"
              >
                <Eye className="w-4 h-4" />
                <span className="text-sm">Mes lectures</span>
              </button>

              <button
                onClick={() => navigate('/commande')}
                className="w-full flex items-center gap-3 px-3 py-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all text-left"
              >
                <CreditCard className="w-4 h-4" />
                <span className="text-sm">Nouvelle commande</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ContextualHint: React.FC = () => {
  const location = useLocation();
  const path = location.pathname;
  const { userLevel } = useUserLevel();
  const navigate = useNavigate();

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
      {/* Message de bienvenue simplifié */}
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
        {/* Message de bienvenue personnalisé - Plus compact */}
        <div className="text-center mb-8">
          <h2 className="font-playfair italic text-3xl font-medium text-amber-400 mb-2">
            Votre Sanctuaire Personnel
          </h2>
          <p className="text-white/70">
            Explorez votre univers intérieur à travers le mandala sacré
          </p>
        </div>

        {/* Mandala Central */}
        <div className="mb-12">
          <MandalaNav progress={[0, 0, 0, 0, 0]} effects="minimal" />
        </div>

        {/* Statut de la dernière commande si applicable */}
        {userLevel.profile?.submittedAt && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mb-8"
          >
            <GlassCard className="p-6 bg-gradient-to-br from-green-400/10 to-blue-400/10 border-green-400/20">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-400/20 flex items-center justify-center">
                  <Clock className="w-8 h-8 text-green-400" />
                </div>
                <h3 className="text-xl font-playfair italic text-green-400 mb-2">
                  ✨ Votre demande a été transmise avec succès
                </h3>
                <p className="text-white/80 mb-4">
                  L'Oracle travaille sur votre révélation personnalisée. Vous serez notifié par email et via l'application dès qu'elle sera prête.
                </p>
                <div className="flex items-center justify-center gap-6 text-sm text-white/60">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>Délai de traitement : 24h</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-amber-400" />
                    <span>En cours d'analyse</span>
                  </div>
                </div>
                <div className="mt-4 flex gap-3 justify-center">
                  <button
                    onClick={() => navigate('/sanctuaire/draws')}
                    className="px-4 py-2 bg-green-400/20 text-green-400 border border-green-400/30 rounded-lg hover:bg-green-400/30 transition-all flex items-center gap-2"
                  >
                    <FileText className="w-4 h-4" />
                    Suivre ma commande
                  </button>
                  <button
                    onClick={() => navigate('/commande')}
                    className="px-4 py-2 bg-amber-400/20 text-amber-400 border border-amber-400/30 rounded-lg hover:bg-amber-400/30 transition-all"
                  >
                    Nouvelle lecture
                  </button>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        )}

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

          {/* Actions Rapides Card */}
          <div className="bg-gradient-to-br from-amber-400/10 to-purple-400/10 backdrop-blur-sm border border-amber-400/20 rounded-2xl p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-amber-400/20 rounded-full flex items-center justify-center">
                <Star className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h3 className="font-playfair italic text-xl font-medium text-amber-400">
                  Actions Rapides
                </h3>
                <p className="font-inter text-sm text-white/60">
                  Gérez votre parcours spirituel
                </p>
              </div>
            </div>
            
            <div className="space-y-3">
              <button
                onClick={() => navigate('/sanctuaire/profile')}
                className="w-full flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 rounded-lg transition-all text-left"
              >
                <User className="w-4 h-4 text-white/70" />
                <span className="text-sm text-white/80">Mon profil complet</span>
              </button>
              
              <button
                onClick={() => navigate('/sanctuaire/draws')}
                className="w-full flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 rounded-lg transition-all text-left"
              >
                <FileText className="w-4 h-4 text-white/70" />
                <span className="text-sm text-white/80">Mes lectures et tirages</span>
              </button>
              
              <button
                onClick={() => navigate('/commande')}
                className="w-full flex items-center gap-3 p-3 bg-amber-400/10 hover:bg-amber-400/20 rounded-lg transition-all text-left border border-amber-400/20"
              >
                <CreditCard className="w-4 h-4 text-amber-400" />
                <span className="text-sm text-amber-400 font-medium">Nouvelle lecture</span>
              </button>
            </div>
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
  const [searchParams] = useSearchParams();
  const { isAuthenticated, loading, authenticateWithEmail } = useSanctuaire();

  // Effet 1: Auto-login via email/token depuis l'URL ou session
  React.useEffect(() => {
    const email = searchParams.get('email');
    const token = searchParams.get('token');
    const sessionEmail = sessionStorage.getItem('sanctuaire_email');

    if (email && !isAuthenticated && !loading) {
      sessionStorage.setItem('sanctuaire_email', email);
      if (token?.startsWith('fv_')) {
        sessionStorage.setItem('first_visit', 'true');
      } else {
        authenticateWithEmail(email).catch(console.error);
      }
    } else if (sessionEmail && !isAuthenticated && !loading) {
      const isFirstVisit = sessionStorage.getItem('first_visit') === 'true';
      if (!isFirstVisit) {
        authenticateWithEmail(sessionEmail).catch(console.error);
      }
    }
  }, [searchParams, isAuthenticated, loading, authenticateWithEmail]);

  // Effet 2: Redirection vers /sanctuaire/login si aucune info d'auth disponible
  React.useEffect(() => {
    if (!loading && !isAuthenticated) {
      const sessionEmail = sessionStorage.getItem('sanctuaire_email');
      const hasEmailInUrl = searchParams.get('email');
      const isFirstVisit = sessionStorage.getItem('first_visit') === 'true';

      if (!sessionEmail && !hasEmailInUrl && !isFirstVisit) {
        const t = setTimeout(() => navigate('/sanctuaire/login'), 1000);
        return () => clearTimeout(t);
      }
    }
  }, [isAuthenticated, loading, navigate, searchParams]);

  const progress = Math.round(((Number(userLevel.currentLevel) || 1) / 4) * 100);
  return (
    <PageLayout variant="dark">
      {/* Icône Profil - Toujours visible */}
      <ProfileIcon />
      
      {/* Sidebar pour les sous-pages */}
      <SanctuaireSidebar progress={[progress, 0, 0, 0]} />
      
      {/* Contenu principal avec marge pour sidebar sur sous-pages */}
      <AudioPlayerProvider>
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
                     location.pathname.includes('/chat') ? 'Conversations' :
                     location.pathname.includes('/profile') ? 'Mon Profil' : 'Sanctuaire'}
                  </h1>
                  <p className="text-white/70">
                    Bienvenue {user?.firstName || 'âme lumineuse'}
                  </p>
                </div>
              </motion.div>
            )}

            {/* Cosmic Header - Supprimé car remplacé par l'icône profil et message de confirmation */}

            {/* Contextual Hint */}
            <ExistingClientLoginBar />
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
      <MiniAudioPlayer />
      </AudioPlayerProvider>
    </PageLayout>
  );
};

export default Sanctuaire;
