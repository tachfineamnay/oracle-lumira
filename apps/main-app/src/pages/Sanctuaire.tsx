import React, { useEffect, useCallback } from 'react';
import { Outlet, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, Download, Play, Calendar, Home, Clock, User, FileText, Settings, CreditCard, Eye, Lock, Crown } from 'lucide-react';
import PageLayout from '../components/ui/PageLayout';
import MandalaNav from '../components/mandala/MandalaNav';
// SanctuaireSidebar retiré pour éviter double sidebar
import GlassCard from '../components/ui/GlassCard';
import SanctuaireWelcomeForm from '../components/sanctuaire/SanctuaireWelcomeForm';
import { OnboardingForm } from '../components/sanctuaire/OnboardingForm';
import { labels } from '../lib/sphereLabels';
import ExistingClientLoginBar from '../components/sanctuaire/ExistingClientLoginBar';
import { AudioPlayerProvider } from '../contexts/AudioPlayerContext';
import MiniAudioPlayer from '../components/sanctuaire/MiniAudioPlayer';
import { useSanctuaire } from '../contexts/SanctuaireContext';
import { CapabilityGuard, LockedCard } from '../components/auth/CapabilityGuard';
import LoadingScreen from '../components/ui/LoadingScreen';

const ProfileIcon: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile, highestLevel, levelMetadata } = useSanctuaire();

  const hasProfileData = profile?.profileCompleted;

  return (
    <div className="fixed top-6 right-6 z-50 flex items-center gap-3">
      {/* Badge de Niveau */}
      {highestLevel && levelMetadata && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="px-4 py-2 bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-md rounded-full border border-blue-400/30"
        >
          <span className="text-sm font-medium text-blue-200">
            {levelMetadata.icon} {levelMetadata.name}
          </span>
        </motion.div>
      )}
      {/* Bouton Accueil */}
      <button
        onClick={() => navigate('/sanctuaire/dashboard')}
        className="flex items-center gap-2 px-3 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-white hover:bg-white/20 transition-all"
        title="Retour à l'accueil"
      >
        <Home className="w-4 h-4" />
      </button>

      {/* Icône Profil avec dropdown */}
      <div className="relative group">
        <button className="flex items-center gap-2 px-3 py-2 bg-purple-400/10 backdrop-blur-md border border-purple-400/20 rounded-lg text-purple-400 hover:bg-purple-400/20 transition-all focus:ring-2 focus:ring-purple-400/50 focus:outline-none">
          <User className="w-4 h-4" />
          <span className="text-sm font-medium">
            {user?.firstName || 'Profil'}
          </span>
        </button>

        {/* Dropdown Menu */}
        <div className="absolute right-0 top-full mt-2 w-72 bg-cosmic-deep/95 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
          <div className="p-4">
            {/* Info utilisateur */}
            <div className="mb-4">
              <h3 className="text-white font-medium">{user?.firstName || 'Âme Lumineuse'}</h3>
              <p className="text-white/60 text-sm">{user?.email || 'Non renseigné'}</p>
            </div>

            {/* Statut du profil */}
            <div className="mb-4 p-3 bg-gradient-to-r from-purple-400/10 to-blue-400/10 border border-purple-400/20 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-2 h-2 rounded-full ${hasProfileData ? 'bg-purple-400' : 'bg-blue-400'}`} />
                <span className="text-sm font-medium text-white">
                  {hasProfileData ? 'Profil Complété' : 'Profil à compléter'}
                </span>
              </div>
              {hasProfileData && profile?.submittedAt && (
                <p className="text-xs text-white/70">
                  Soumis le {new Date(profile.submittedAt).toLocaleDateString('fr-FR')}
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
  const { profile } = useSanctuaire();
  const navigate = useNavigate();

  // Si on est sur la page principale /sanctuaire, afficher le contenu approprié
  if (path === '/sanctuaire' || path === '/sanctuaire/dashboard') {
    // NOUVEAU: Vérifier si le profil contient les données essentielles
    // Au lieu de se fier uniquement à profileCompleted (qui peut être undefined/false même après paiement)
    const hasEssentialData = profile && (
      profile.birthDate ||
      profile.specificQuestion ||
      profile.facePhotoUrl ||
      profile.palmPhotoUrl
    );
    
    // Si le profil manque de données essentielles, afficher un écran d'accueil guidant vers l'onboarding
    // Le formulaire d'onboarding lui-même est géré par l'overlay global (showOnboarding) dans Sanctuaire.tsx
    if (!hasEssentialData) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
      {/* Message de bienvenue simplifié */}
          <div className="text-center mb-8">
            <h2 className="font-playfair italic text-3xl font-medium text-purple-400 mb-4">
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
          <h2 className="font-playfair italic text-3xl font-medium text-purple-400 mb-2">
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
        {profile?.submittedAt && (
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
                    <Star className="w-4 h-4 text-purple-400" />
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
                    className="px-4 py-2 bg-purple-400/20 text-purple-400 border border-purple-400/30 rounded-lg hover:bg-purple-400/30 transition-all focus:ring-2 focus:ring-purple-400/50 focus:outline-none"
                  >
                    Nouvelle lecture
                  </button>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        )}

        {/* Dashboard Cards Modulaire Intelligent */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {/* Carte Mon Profil - Toujours accessible */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-br from-blue-400/10 to-purple-400/10 backdrop-blur-sm border border-blue-400/20 rounded-2xl p-6 cursor-pointer"
            onClick={() => navigate('/sanctuaire/profile')}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-400/20 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="font-playfair italic text-xl font-medium text-blue-400">
                    Mon Profil
                  </h3>
                  <p className="font-inter text-sm text-white/60">
                    Gestion de votre identité spirituelle
                  </p>
                </div>
              </div>
            </div>
            <p className="font-inter text-sm text-white/80 mb-4">
              Consultez et modifiez vos informations personnelles, votre parcours spirituel et vos préférences.
            </p>
          </motion.div>

          {/* Carte Mes Lectures - Protégée par CapabilityGuard */}
          <CapabilityGuard
            requires="sanctuaire.sphere.readings"
            fallback={
              <LockedCard
                level="Initié"
                message="Accédez à vos lectures Oracle personnalisées"
                action={{
                  label: "Débloquer l'accès",
                  onClick: () => navigate('/commande')
                }}
              />
            }
          >
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-br from-green-400/10 to-emerald-400/10 backdrop-blur-sm border border-green-400/20 rounded-2xl p-6 cursor-pointer"
              onClick={() => navigate('/sanctuaire/draws')}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-400/20 rounded-full flex items-center justify-center">
                    <Eye className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <h3 className="font-playfair italic text-xl font-medium text-green-400">
                      Mes Lectures
                    </h3>
                    <p className="font-inter text-sm text-white/60">
                      Vos révélations personnalisées
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
              <p className="font-inter text-sm text-white/80 mb-4">
                Consultez toutes vos lectures Oracle, téléchargez les PDF et écoutez les versions audio.
              </p>
            </motion.div>
          </CapabilityGuard>

          {/* Carte Rituels - Protégée pour niveau Mystique */}
          <CapabilityGuard
            requires="sanctuaire.sphere.rituals"
            fallback={
              <LockedCard
                level="Mystique"
                message="Accédez aux rituels personnalisés et pratiques avancées"
                action={{
                  label: "Passer au niveau Mystique",
                  onClick: () => navigate('/commande?product=mystique')
                }}
              />
            }
          >
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-br from-purple-400/10 to-pink-400/10 backdrop-blur-sm border border-purple-400/20 rounded-2xl p-6 cursor-pointer"
              onClick={() => navigate('/sanctuaire/rituals')}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-400/20 rounded-full flex items-center justify-center">
                    <Star className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="font-playfair italic text-xl font-medium text-purple-400">
                      Rituels Sacrés
                    </h3>
                    <p className="font-inter text-sm text-white/60">
                      Pratiques spirituelles personnalisées
                    </p>
                  </div>
                </div>
              </div>
              <p className="font-inter text-sm text-white/80 mb-4">
                Découvrez vos rituels personnalisés, méditations guidées et pratiques spirituelles avancées.
              </p>
            </motion.div>
          </CapabilityGuard>

          {/* Carte Mandala HD - Protégée pour niveau Profond */}
          <CapabilityGuard
            requires="sanctuaire.sphere.mandala"
            fallback={
              <LockedCard
                level="Profond"
                message="Accédez à votre Mandala personnalisé en haute définition"
                action={{
                  label: "Débloquer le niveau Profond",
                  onClick: () => navigate('/commande?product=profond')
                }}
              />
            }
          >
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-br from-purple-400/10 to-pink-400/10 backdrop-blur-sm border border-purple-400/20 rounded-2xl p-6 cursor-pointer"
              onClick={() => navigate('/sanctuaire/mandala')}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-400/20 rounded-full flex items-center justify-center">
                    <Crown className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="font-playfair italic text-xl font-medium text-purple-400">
                      Mandala Personnel
                    </h3>
                    <p className="font-inter text-sm text-white/60">
                      Votre symbole sacré unique
                    </p>
                  </div>
                </div>
              </div>
              <p className="font-inter text-sm text-white/80 mb-4">
                Contemplez votre mandala personnalisé créé spécifiquement pour votre énergie unique.
              </p>
            </motion.div>
          </CapabilityGuard>

          {/* Carte Synthèse - Protégée pour niveau Profond */}
          <CapabilityGuard
            requires="sanctuaire.sphere.synthesis"
            fallback={
              <LockedCard
                level="Profond"
                message="Accédez à l'analyse synthétique complète de votre parcours"
                action={{
                  label: "Accéder au niveau Profond",
                  onClick: () => navigate('/commande?product=profond')
                }}
              />
            }
          >
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-br from-teal-400/10 to-cyan-400/10 backdrop-blur-sm border border-teal-400/20 rounded-2xl p-6 cursor-pointer"
              onClick={() => navigate('/sanctuaire/synthesis')}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-teal-400/20 rounded-full flex items-center justify-center">
                    <FileText className="w-5 h-5 text-teal-400" />
                  </div>
                  <div>
                    <h3 className="font-playfair italic text-xl font-medium text-teal-400">
                      Synthèse Spirituelle
                    </h3>
                    <p className="font-inter text-sm text-white/60">
                      Analyse complète de votre évolution
                    </p>
                  </div>
                </div>
              </div>
              <p className="font-inter text-sm text-white/80 mb-4">
                Une vision d'ensemble de votre parcours spirituel avec insights et recommandations.
              </p>
            </motion.div>
          </CapabilityGuard>

          {/* Carte Guidance - Protégée pour niveau Intégral */}
          <CapabilityGuard
            requires="sanctuaire.sphere.guidance"
            fallback={
              <LockedCard
                level="Intégral"
                message="Accédez à la guidance personnalisée et au mentorat exclusif"
                action={{
                  label: "Niveau Intégral",
                  onClick: () => navigate('/commande?product=integrale')
                }}
              />
            }
          >
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-br from-indigo-400/10 to-violet-400/10 backdrop-blur-sm border border-indigo-400/20 rounded-2xl p-6 cursor-pointer"
              onClick={() => navigate('/sanctuaire/guidance')}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-indigo-400/20 rounded-full flex items-center justify-center">
                    <Star className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="font-playfair italic text-xl font-medium text-indigo-400">
                      Guidance Sacrée
                    </h3>
                    <p className="font-inter text-sm text-white/60">
                      Mentorat spirituel personnalisé
                    </p>
                  </div>
                </div>
              </div>
              <p className="font-inter text-sm text-white/80 mb-4">
                Bénéficiez d'un accompagnement spirituel personnalisé et d'un suivi de 30 jours.
              </p>
            </motion.div>
          </CapabilityGuard>
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
  const {
    user,
    profile,
    isAuthenticated,
    isLoading,
    authenticateWithEmail,
    authCooldownUntil,
    lastAuthError,
    clearAuthError,
  } = useSanctuaire();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [cooldownRemainingMs, setCooldownRemainingMs] = React.useState(0);
  const [hasInitialLoad, setHasInitialLoad] = React.useState(false);
  const cooldownActive = authCooldownUntil ? authCooldownUntil > Date.now() : false;
  const cooldownSeconds = Math.max(0, Math.ceil(cooldownRemainingMs / 1000));
  
  // État pour afficher l'onboarding
  const [showOnboarding, setShowOnboarding] = React.useState(false);

  React.useEffect(() => {
    if (!authCooldownUntil) {
      setCooldownRemainingMs(0);
      return;
    }

    const update = () => {
      setCooldownRemainingMs(Math.max(0, authCooldownUntil - Date.now()));
    };

    update();
    const timer = window.setInterval(update, 1000);

    return () => window.clearInterval(timer);
  }, [authCooldownUntil]);

  React.useEffect(() => {
    if (isAuthenticated) {
      clearAuthError();
      setCooldownRemainingMs(0);
    }
  }, [isAuthenticated, clearAuthError]);

  // Marquer la fin du premier chargement pour éviter de démonter la page lors des refresh suivants
  React.useEffect(() => {
    if (!isLoading) {
      setHasInitialLoad(true);
    }
  }, [isLoading]);

  const handleRetryAuth = React.useCallback(() => {
    if (cooldownActive) {
      return;
    }
    const storedEmail = typeof window !== 'undefined' ? window.sessionStorage.getItem('sanctuaire_email') : null;
    if (!storedEmail) {
      return;
    }
    clearAuthError();
    authenticateWithEmail(storedEmail).catch((err) => {
      console.error('Erreur lors du retry auth sanctuaire:', err);
    });
  }, [authenticateWithEmail, clearAuthError, cooldownActive]);

  // Détection first_visit pour afficher OnboardingForm
  // PASSAGE 21 - DEVOPS : Masquer onboarding quand le profil contient déjà les données essentielles
  React.useEffect(() => {
    const isFirstVisit = sessionStorage.getItem('first_visit') === 'true';
    
    const hasEssentialData = !!profile && (
      profile.birthDate ||
      profile.specificQuestion ||
      profile.facePhotoUrl ||
      profile.palmPhotoUrl
    );

    const hasCompletedFlag = !!profile?.profileCompleted;
    const needsOnboarding = !hasEssentialData && !hasCompletedFlag;
    
    console.log('[Sanctuaire] Vérification onboarding:', {
      isAuthenticated,
      isFirstVisit,
      hasEssentialData,
      hasCompletedFlag,
      needsOnboarding,
    });
    
    if (isAuthenticated && (isFirstVisit || needsOnboarding)) {
      console.log('[Sanctuaire] ✅ Affichage onboarding');
      setShowOnboarding(true);
    } else {
      // PASSAGE 21 : MASQUER onboarding si profil complété ou déjà renseigné
      console.log('[Sanctuaire] ❌ Masquage onboarding');
      setShowOnboarding(false);
    }
  }, [isAuthenticated, profile]); // ✅ Dépendances optimisées

  const handleOnboardingComplete = useCallback(() => {
    console.log('[Sanctuaire] OnboardingComplete appelé');
    setShowOnboarding(false);
    sessionStorage.removeItem('first_visit');
    // Rediriger explicitement vers l'accueil du sanctuaire
    try {
      // Utiliser la navigation SPA si possible
      navigate('/sanctuaire/dashboard', { replace: true });
    } catch {
      // Fallback dur en cas de problème de routing
      window.location.href = '/sanctuaire/dashboard';
    }
  }, [navigate]);

  // Effet 1: Auto-login via email/token depuis l'URL ou session
  // PASSAGE 5 - P0 : Retry automatique avec backoff pour race condition webhook
  const [retryCount, setRetryCount] = React.useState(0);
  const MAX_RETRIES = 3; // Nombre maximum de tentatives avant redirection
  
  React.useEffect(() => {
    const email = searchParams.get('email');
    const token = searchParams.get('token');
    const sessionEmail = sessionStorage.getItem('sanctuaire_email');

    if (cooldownActive) {
      return;
    }

    if (email && !isAuthenticated && !isLoading) {
      sessionStorage.setItem('sanctuaire_email', email);
      if (token?.startsWith('fv_')) {
        sessionStorage.setItem('first_visit', 'true');
      } else {
        console.log('[Sanctuaire] Tentative auth initiale avec email:', email);
        authenticateWithEmail(email).catch((err) => {
          console.error('[Sanctuaire] Erreur auth initiale:', err);
          setRetryCount(1); // Déclencher le retry
        });
      }
    } else if (sessionEmail && !isAuthenticated && !isLoading && retryCount === 0) {
      const isFirstVisit = sessionStorage.getItem('first_visit') === 'true';
      if (!isFirstVisit) {
        console.log('[Sanctuaire] Tentative auth depuis session email:', sessionEmail);
        authenticateWithEmail(sessionEmail).catch((err) => {
          console.error('[Sanctuaire] Erreur auth session:', err);
          setRetryCount(1); // Déclencher le retry
        });
      }
    }
  }, [searchParams, isAuthenticated, isLoading, authenticateWithEmail, cooldownActive, retryCount]);

  // Effet 2: Retry automatique avec backoff exponentiel (2s, 4s, 8s)
  // PASSAGE 5 - P0 : Gérer race condition webhook avec retries intelligents
  React.useEffect(() => {
    if (retryCount > 0 && retryCount <= MAX_RETRIES && !isAuthenticated && !isLoading && !cooldownActive) {
      const sessionEmail = sessionStorage.getItem('sanctuaire_email');
      if (sessionEmail) {
        const delay = Math.pow(2, retryCount) * 1000; // 2s, 4s, 8s
        console.log(`[Sanctuaire] Retry ${retryCount}/${MAX_RETRIES} dans ${delay}ms pour:`, sessionEmail);
        
        const timer = setTimeout(() => {
          console.log(`[Sanctuaire] Exécution retry ${retryCount}/${MAX_RETRIES}`);
          authenticateWithEmail(sessionEmail).catch((err) => {
            console.error(`[Sanctuaire] Erreur retry ${retryCount}:`, err);
            setRetryCount(prev => prev + 1);
          });
        }, delay);
        
        return () => clearTimeout(timer);
      }
    }
  }, [retryCount, isAuthenticated, isLoading, authenticateWithEmail, cooldownActive]);

  // Effet 3: Redirection vers /sanctuaire/login si TOUTES les tentatives échouent
  // PASSAGE 5 - P0 : Rediriger seulement après MAX_RETRIES dépassé
  React.useEffect(() => {
    if (!isLoading && !isAuthenticated && retryCount > MAX_RETRIES) {
      const sessionEmail = sessionStorage.getItem('sanctuaire_email');
      const hasEmailInUrl = searchParams.get('email');
      const isFirstVisit = sessionStorage.getItem('first_visit') === 'true';

      if (!sessionEmail && !hasEmailInUrl && !isFirstVisit) {
        console.log('[Sanctuaire] Toutes les tentatives échouées, redirection vers /sanctuaire/login');
        const t = setTimeout(() => navigate('/sanctuaire/login'), 2000);
        return () => clearTimeout(t);
      }
    }
  }, [isAuthenticated, isLoading, navigate, searchParams, retryCount]);

  // =================== GARDE DE RECONNEXION P0 ===================
  // Détection token expiré : toast + redirection
  React.useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      const sessionEmail = sessionStorage.getItem('sanctuaire_email');
      const isFirstVisit = sessionStorage.getItem('first_visit') === 'true';
      const hasEmailInUrl = searchParams.get('email');
      
      // Éviter le toast pendant les tentatives de retry ou first visit
      if (sessionEmail && !isFirstVisit && !hasEmailInUrl && retryCount > MAX_RETRIES) {
        console.log('[Sanctuaire] Session expirée détectée, redirection vers login');
        const t = setTimeout(() => navigate('/sanctuaire/login', { replace: true }), 1500);
        return () => clearTimeout(t);
      }
    }
  }, [isLoading, isAuthenticated, navigate, searchParams, retryCount, MAX_RETRIES]);

  // =================== PROTECTION CRITIQUE : ATTENTE DU CONTEXTE ===================
  // Éviter le crash "useSanctuaire doit être utilisé à l'intérieur de SanctuaireProvider"
  // Premier chargement complet : afficher l'écran de loading. Ensuite, ne pas démonter la page pour conserver l'état (ex: onboarding en cours).
  if (!hasInitialLoad && isLoading) {
    return <LoadingScreen type="cosmic" message="Initialisation du Sanctuaire..." />;
  }

  const showOverlayRefresh = hasInitialLoad && isLoading;
  const progress = 0; // Calcul du progrès basé sur le profil
  const isHome = location.pathname === '/sanctuaire' || location.pathname === '/sanctuaire/dashboard';
  return (
    <PageLayout variant="dark">
      {showOverlayRefresh && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <LoadingScreen type="simple" message="Mise à jour du profil..." />
        </div>
      )}
      {/* Onboarding Form en overlay si first_visit ou profil incomplet */}
      {showOnboarding && <OnboardingForm onComplete={handleOnboardingComplete} />}
      
      {/* Icône Profil - Toujours visible */}
      <ProfileIcon />
      
      {/* Contenu principal sans marge gauche */}
      <AudioPlayerProvider>
      <div>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="space-y-8 py-6 sm:py-8 lg:py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, staggerChildren: 0.1 }}
          >
            {/* Header pour les sous-pages uniquement */}
            {!isHome && (
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
            {lastAuthError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <GlassCard className="p-4 mb-4 bg-red-400/10 border border-red-400/30">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div>
                      <p className="text-sm text-red-200 font-medium">{lastAuthError}</p>
                      {cooldownActive && (
                        <p className="text-xs text-red-200/80 mt-1">
                          Réessayez dans {cooldownSeconds}s.
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleRetryAuth}
                        disabled={cooldownActive}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          cooldownActive 
                            ? 'bg-white/10 text-white/40 cursor-not-allowed' 
                            : 'bg-red-400/20 text-red-200 hover:bg-red-400/30'
                        }`}
                      >
                        Réessayer
                      </button>
                      <button
                        onClick={clearAuthError}
                        className="px-4 py-2 rounded-lg text-sm font-medium bg-white/10 text-white/70 hover:bg-white/15 transition-colors"
                      >
                        Fermer
                      </button>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            )}
            {!location.pathname.includes('/draws') && <ContextualHint />}

            {/* Content Area - Uniquement pour les sous-pages */}
            {!isHome && (
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
