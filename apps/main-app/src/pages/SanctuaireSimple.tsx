import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
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
  Clock
} from 'lucide-react';
import PageLayout from '../components/ui/PageLayout';
import GlassCard from '../components/ui/GlassCard';
import { useSanctuaire } from '../contexts/SanctuaireContext';

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

const SanctuaireSimple: React.FC = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedReading, setSelectedReading] = useState<string | null>(null);
  
  const { 
    isAuthenticated, 
    user, 
    orders, 
    loading, 
    error,
    logout,
    getOrderContent,
    downloadFile 
  } = useSanctuaire();

  // Redirection si non authentifié
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/sanctuaire/login');
    }
  }, [isAuthenticated, loading, navigate]);

  // Mapping des commandes vers les cartes de lecture
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
        // Ouvrir l'audio dans un nouvel onglet pour l'instant
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

  if (error) {
    return (
      <PageLayout variant="dark">
        <div className="flex items-center justify-center min-h-screen">
          <GlassCard className="p-8 text-center">
            <p className="text-red-400 mb-4">{error}</p>
            <button 
              onClick={() => navigate('/sanctuaire/login')}
              className="px-6 py-2 bg-amber-400 text-mystical-900 rounded-lg hover:bg-amber-500 transition-all"
            >
              Retour à la connexion
            </button>
          </GlassCard>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout variant="dark">
      {/* Header Simple */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-mystical-900/95 backdrop-blur-lg border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Logo + Menu */}
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

              {/* User Info */}
              <div className="flex items-center gap-4">
                <span className="text-white/70 text-sm">{user?.email}</span>
                <button
                  onClick={logout}
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
      <div className={`fixed inset-y-0 left-0 z-40 transform transition-transform duration-300 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="w-64 h-full bg-mystical-900/95 backdrop-blur-lg border-r border-white/10">
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
              <div className="p-3 bg-amber-400/10 rounded-lg border border-amber-400/20">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-amber-400" />
                  <span className="text-amber-400 font-medium">Mes Lectures</span>
                </div>
              </div>

              <button
                onClick={() => {
                  setSidebarOpen(false);
                  setSelectedReading('profile');
                }}
                className="w-full flex items-center gap-3 p-3 text-white/70 hover:text-white hover:bg-white/5 rounded-lg transition-all text-left"
              >
                <User className="w-5 h-5" />
                <span>Mon Profil</span>
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
            </nav>
          </div>
        </div>

        {/* Overlay */}
        <div 
          className="fixed inset-0 bg-black/50 -z-10"
          onClick={() => setSidebarOpen(false)}
        />
      </div>

      {/* Contenu Principal */}
      <main className="pt-16 min-h-screen">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Vue Profile */}
          {selectedReading === 'profile' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-2xl mx-auto"
            >
              <div className="mb-6">
                <button
                  onClick={() => setSelectedReading(null)}
                  className="text-amber-400 hover:text-amber-300 transition-colors mb-4"
                >
                  ← Retour aux lectures
                </button>
                <h2 className="text-2xl font-playfair italic text-amber-400">Mon Profil</h2>
              </div>

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

          {/* Vue Lectures */}
          {!selectedReading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="text-center mb-8">
                <h2 className="text-3xl font-playfair italic text-amber-400 mb-2">
                  Mes Lectures Spirituelles
                </h2>
                <p className="text-white/70">
                  Retrouvez toutes vos révélations personnalisées
                </p>
              </div>

              {/* État vide */}
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
                      Commander ma première lecture
                    </button>
                  </GlassCard>
                </motion.div>
              )}

              {/* Grille des lectures */}
              {readings.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {readings.map((reading, index) => (
                    <motion.div
                      key={reading.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                    >
                      <GlassCard className="p-6 h-full flex flex-col">
                        {/* En-tête */}
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
                            {reading.status === 'completed' ? 'Complété' : 'En cours'}
                          </div>
                        </div>

                        {/* Aperçu */}
                        <div className="flex-1 mb-4">
                          <p className="text-white/70 text-sm line-clamp-3">
                            {reading.preview}
                          </p>
                        </div>

                        {/* Actions */}
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
                            <span>Analyse en cours...</span>
                          </div>
                        )}
                      </GlassCard>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* CTA Nouvelle lecture */}
              {readings.length > 0 && (
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
              )}
            </motion.div>
          )}
        </div>
      </main>
    </PageLayout>
  );
};

export default SanctuaireSimple;
