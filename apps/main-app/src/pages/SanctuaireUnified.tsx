import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  LogOut,
  FileText,
  Calendar,
  Download,
  Play,
  ShoppingCart,
  Menu,
  X,
  Star,
  Clock,
  Sparkles,
  Home
} from 'lucide-react';
import PageLayout from '../components/ui/PageLayout';
import GlassCard from '../components/ui/GlassCard';
import MandalaNav from '../components/mandala/MandalaNav';
import SphereSkeleton from '../components/ui/SphereSkeleton';
import { useSanctuaire } from '../hooks/useSanctuaire';
import SanctuaireWelcomeForm from '../components/sanctuaire/SanctuaireWelcomeForm';
import { useUserLevel } from '../contexts/UserLevelContext';

interface ReadingCard {
  id: string;
  title: string;
  date: string;
  status: 'completed' | 'processing';
  hasAudio: boolean;
  hasPdf: boolean;
  level: number;
  preview: string;
}

const SanctuaireUnified: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedView, setSelectedView] = useState<'readings' | 'profile' | 'synthesis'>('readings');
  const { userLevel } = useUserLevel();

  const {
    isAuthenticated,
    user,
    orders,
    loading,
    error,
    logout,
    getOrderContent,
    downloadFile,
    authenticateWithEmail
  } = useSanctuaire();

  // Lazy-load de la Synthèse (réutilisation du composant legacy)
  const LazySynthesis = useMemo(() => React.lazy(() => import('../components/spheres/Synthesis')), []);

  // Auto-login si email dans URL (nouveau client après paiement)
  useEffect(() => {
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

  // Redirection login si non authentifié et pas de session
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      const sessionEmail = sessionStorage.getItem('sanctuaire_email');
      const hasEmailInUrl = searchParams.get('email');
      const isFirstVisit = sessionStorage.getItem('first_visit') === 'true';

      if (!sessionEmail && !hasEmailInUrl && !isFirstVisit) {
        const timer = setTimeout(() => {
          navigate('/sanctuaire/login');
        }, 1000);
        return () => clearTimeout(timer);
      }
    }
  }, [isAuthenticated, loading, navigate, searchParams]);

  // Détection si nouveau client (première visite ou profil incomplet)
  const hasFirstVisitToken = sessionStorage.getItem('first_visit') === 'true';

  const isNewClient = useMemo(() => {
    const hasIncompleteProfile = userLevel?.profile && !userLevel.profile.profileCompleted;
    const hasNoProfile = !userLevel?.profile || Object.keys(userLevel.profile).length === 0;
    return hasFirstVisitToken || hasIncompleteProfile || hasNoProfile;
  }, [hasFirstVisitToken, userLevel?.profile]);

  // Nettoyer le flag première visite après profil complété
  useEffect(() => {
    if (isAuthenticated && userLevel?.profile?.profileCompleted) {
      sessionStorage.removeItem('first_visit');
    }
  }, [isAuthenticated, userLevel?.profile?.profileCompleted]);

  const handleLogout = () => {
    sessionStorage.removeItem('sanctuaire_email');
    sessionStorage.removeItem('first_visit');
    logout();
    navigate('/sanctuaire/login');
  };

  // Log debug limité
  useEffect(() => {
    console.log('🔎 SanctuaireUnified Debug:', {
      isAuthenticated,
      hasFirstVisitToken,
      isNewClient,
      userLevelProfileCompleted: userLevel?.profile?.profileCompleted,
      sessionEmail: sessionStorage.getItem('sanctuaire_email'),
      urlEmail: searchParams.get('email'),
      urlToken: searchParams.get('token')
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isNewClient]);

  // Mapping des commandes vers cartes UI
  const readings: ReadingCard[] = orders.map(order => {
    const readingText = order.generatedContent?.reading;
    return {
      id: order.id,
      title: order.formData?.specificQuestion || `Lecture Niveau ${order.level}`,
      date: new Date(order.deliveredAt || order.createdAt).toLocaleDateString('fr-FR'),
      status: order.status === 'completed' ? 'completed' : 'processing',
      hasAudio: !!order.generatedContent?.audioUrl,
      hasPdf: !!order.generatedContent?.pdfUrl,
      level: order.level,
      preview: readingText ? readingText.substring(0, 150) + '...' : 'Votre lecture personnalisée vous attend...'
    };
  });

  const handlePlayAudio = async (reading: ReadingCard) => {
    if (!reading.hasAudio) return;
    try {
      const content = await getOrderContent(reading.id);
      if (content.generatedContent?.audioUrl) {
        window.open(content.generatedContent.audioUrl, '_blank');
      }
    } catch (error) {
      console.error('Erreur audio:', error);
    }
  };

  const handleDownloadPdf = async (reading: ReadingCard) => {
    if (!reading.hasPdf) return;
    try {
      const content = await getOrderContent(reading.id);
      if (content.generatedContent?.pdfUrl) {
        downloadFile(content.generatedContent.pdfUrl, `lecture-${reading.id}.pdf`);
      }
    } catch (error) {
      console.error('Erreur téléchargement:', error);
    }
  };

  // Loading
  if (loading) {
    return (
      <PageLayout variant="dark">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white/70">Chargement de votre sanctuaire...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  // Erreur
  if (error) {
    return (
      <PageLayout variant="dark">
        <div className="flex items-center justify-center min-h-screen">
          <GlassCard className="p-8 text-center max-w-md">
            <p className="text-red-400 mb-4">{error}</p>
            <button
              onClick={() => {
                sessionStorage.removeItem('sanctuaire_email');
                navigate('/sanctuaire/login');
              }}
              className="px-6 py-2 bg-amber-400 text-mystical-900 rounded-lg hover:bg-amber-500 transition-all"
            >
              Retour à la connexion
            </button>
          </GlassCard>
        </div>
      </PageLayout>
    );
  }

  // NOUVEAU CLIENT : Formulaire
  if (isNewClient) {
    return (
      <PageLayout variant="dark">
        <div className="min-h-screen py-12 px-4">
          <div className="max-w-4xl mx-auto">
            {/* Header simple */}
            <div className="flex justify-end mb-6">
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-white/70 hover:text-white transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Déconnexion</span>
              </button>
            </div>

            {/* Message de bienvenue */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-12"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="w-20 h-20 bg-gradient-to-br from-amber-400/30 to-purple-400/20 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <Sparkles className="w-10 h-10 text-amber-400" />
              </motion.div>

              <h1 className="text-4xl font-playfair italic text-amber-400 mb-4">
                Bienvenue dans votre Sanctuaire
              </h1>
              <p className="text-white/70 text-lg mb-2">
                Complétez votre profil spirituel pour débuter votre voyage
              </p>
              <p className="text-white/60 text-sm">
                Ces informations permettront à nos Oracles de personnaliser vos lectures
              </p>
            </motion.div>

            {/* Mandala visuel discret */}
            <div className="flex justify-center mb-10">
              <div className="w-56 h-56 opacity-90">
                <MandalaNav progress={[0, 0, 0, 0, 0]} effects="minimal" />
              </div>
            </div>

            {/* Formulaire */}
            <SanctuaireWelcomeForm />
          </div>
        </div>
      </PageLayout>
    );
  }

  // CLIENT EXISTANT : Dashboard
  return (
    <PageLayout variant="dark">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-mystical-900/95 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 text-white/70 hover:text-white transition-colors"
                title="Ouvrir le menu"
              >
                <Menu className="w-5 h-5" />
              </button>
              <h1 className="text-xl font-playfair italic text-amber-400">Sanctuaire</h1>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-white/70 text-sm hidden sm:inline">{user?.email}</span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2 text-white/70 hover:text-white transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Déconnexion</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ x: -264 }}
              animate={{ x: 0 }}
              exit={{ x: -264 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 z-40 w-64 bg-mystical-900/95 backdrop-blur-lg border-r border-white/10"
            >
              <div className="p-4">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-medium text-white">Menu</h2>
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="p-1 text-white/70 hover:text-white transition-colors"
                    title="Fermer le menu"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <nav className="space-y-2">
                  <button
                    onClick={() => {
                      setSelectedView('readings');
                      setSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all text-left ${
                      selectedView === 'readings'
                        ? 'bg-amber-400/10 border border-amber-400/20'
                        : 'hover:bg-white/5'
                    }`}
                  >
                    <FileText className={`w-5 h-5 ${selectedView === 'readings' ? 'text-amber-400' : 'text-white/70'}`} />
                    <span className={selectedView === 'readings' ? 'text-amber-400 font-medium' : 'text-white/70'}>
                      Mes Lectures
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      setSelectedView('profile');
                      setSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all text-left ${
                      selectedView === 'profile'
                        ? 'bg-amber-400/10 border border-amber-400/20'
                        : 'hover:bg-white/5'
                    }`}
                  >
                    <User className={`w-5 h-5 ${selectedView === 'profile' ? 'text-amber-400' : 'text-white/70'}`} />
                    <span className={selectedView === 'profile' ? 'text-amber-400 font-medium' : 'text-white/70'}>
                      Mon Profil
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      setSelectedView('synthesis');
                      setSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all text-left ${
                      selectedView === 'synthesis'
                        ? 'bg-amber-400/10 border border-amber-400/20'
                        : 'hover:bg-white/5'
                    }`}
                  >
                    <Star className={`w-5 h-5 ${selectedView === 'synthesis' ? 'text-amber-400' : 'text-white/70'}`} />
                    <span className={selectedView === 'synthesis' ? 'text-amber-400 font-medium' : 'text-white/70'}>
                      Synthèse
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      setSidebarOpen(false);
                      navigate('/commande');
                    }}
                    className="w-full flex items-center gap-3 p-3 bg-green-400/10 text-green-400 hover:bg-green-400/20 rounded-lg transition-all text-left border border-green-400/20"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    <span>Nouvelle Lecture</span>
                  </button>

                  <a
                    href="/"
                    className="w-full flex items-center gap-3 p-3 hover:bg-white/5 rounded-lg transition-all text-left text-white/70"
                  >
                    <Home className="w-5 h-5" />
                    <span>Retour à l'accueil</span>
                  </a>
                </nav>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black/50 z-30"
            />
          </>
        )}
      </AnimatePresence>

      {/* Contenu */}
      <main className="pt-16 min-h-screen">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Mandala entête */}
          <div className="flex justify-center mb-8">
            <div className="w-64 h-64">
              <MandalaNav progress={[0, 0, 0, 0, 0]} effects="minimal" />
            </div>
          </div>

          {/* Vue Profil */}
          {selectedView === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-2xl mx-auto"
            >
              <h2 className="text-2xl font-playfair italic text-amber-400 mb-6">Mon Profil</h2>
              <GlassCard className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-1">Email</label>
                    <p className="text-white">{user?.email || 'Non renseigné'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-1">Prénom</label>
                    <p className="text-white">{user?.firstName || 'Non renseigné'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-1">Nom</label>
                    <p className="text-white">{user?.lastName || 'Non renseigné'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-1">Téléphone</label>
                    <p className="text-white">{user?.phone || 'Non renseigné'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-1">Niveau</label>
                    <p className="text-amber-400">Niveau {user?.level || 1}</p>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          )}

          {/* Vue Synthèse */}
          {selectedView === 'synthesis' && (
            <motion.div
              key="synthesis"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <React.Suspense fallback={<SphereSkeleton />}>
                <LazySynthesis />
              </React.Suspense>
            </motion.div>
          )}

          {/* Vue Lectures */}
          {selectedView === 'readings' && (
            <motion.div
              key="readings"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="text-center mb-8">
                <h2 className="text-3xl font-playfair italic text-amber-400 mb-2">
                  Mes Lectures Spirituelles
                </h2>
                <p className="text-white/70">
                  Retrouvez toutes vos révélations personnalisées
                </p>
              </div>

              {readings.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-16"
                >
                  <GlassCard className="p-8 max-w-md mx-auto">
                    <div className="w-16 h-16 bg-amber-400/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Star className="w-8 h-8 text-amber-400" />
                    </div>
                    <h3 className="text-xl font-medium text-white mb-2">
                      Votre première lecture vous attend
                    </h3>
                    <p className="text-white/70 mb-6">
                      Commencez votre voyage spirituel avec une lecture personnalisée de l'Oracle.
                    </p>
                    <button
                      onClick={() => navigate('/commande')}
                      className="w-full py-3 bg-gradient-to-r from-amber-400 to-amber-500 text-mystical-900 font-medium rounded-lg hover:from-amber-500 hover:to-amber-600 transition-all"
                    >
                      Commander une nouvelle lecture
                    </button>
                  </GlassCard>
                </motion.div>
              )}

              {readings.length > 0 && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {readings.map((reading, index) => (
                      <motion.div
                        key={reading.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                      >
                        <GlassCard className="p-6 h-full flex flex-col">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <h3 className="text-lg font-medium text-white mb-1 line-clamp-2">
                                {reading.title}
                              </h3>
                              <div className="flex items-center gap-2 text-sm text-white/60">
                                <Calendar className="w-4 h-4" />
                                <span>{reading.date}</span>
                              </div>
                            </div>
                            <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                              reading.status === 'completed'
                                ? 'bg-green-400/20 text-green-400'
                                : 'bg-amber-400/20 text-amber-400'
                            }`}>
                              {reading.status === 'completed' ? 'Disponible' : 'En cours'}
                            </div>
                          </div>

                          <div className="flex-1 mb-4">
                            <p className="text-white/70 text-sm line-clamp-3">
                              {reading.preview}
                            </p>
                          </div>

                          {reading.status === 'completed' && (
                            <div className="flex gap-2">
                              {reading.hasAudio && (
                                <button
                                  onClick={() => handlePlayAudio(reading)}
                                  className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-amber-400/10 text-amber-400 border border-amber-400/20 rounded-lg hover:bg-amber-400/20 transition-all text-sm"
                                >
                                  <Play className="w-4 h-4" />
                                  <span>Écouter</span>
                                </button>
                              )}
                              {reading.hasPdf && (
                                <button
                                  onClick={() => handleDownloadPdf(reading)}
                                  className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-white/5 text-white/70 border border-white/10 rounded-lg hover:bg-white/10 transition-all text-sm"
                                >
                                  <Download className="w-4 h-4" />
                                  <span>PDF</span>
                                </button>
                              )}
                            </div>
                          )}

                          {reading.status === 'processing' && (
                            <div className="flex items-center justify-center gap-2 py-2 text-amber-400 text-sm">
                              <Clock className="w-4 h-4 animate-pulse" />
                              <span>En préparation...</span>
                            </div>
                          )}
                        </GlassCard>
                      </motion.div>
                    ))}
                  </div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="text-center mt-12"
                  >
                    <button
                      onClick={() => navigate('/commande')}
                      className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-amber-400 to-amber-500 text-mystical-900 font-medium rounded-xl hover:from-amber-500 hover:to-amber-600 transition-all shadow-lg hover:shadow-xl"
                    >
                      <ShoppingCart className="w-5 h-5" />
                      <span>Nouvelle Lecture Spirituelle</span>
                    </button>
                  </motion.div>
                </>
              )}
            </motion.div>
          )}
        </div>
      </main>
    </PageLayout>
  );
};

export default SanctuaireUnified;

