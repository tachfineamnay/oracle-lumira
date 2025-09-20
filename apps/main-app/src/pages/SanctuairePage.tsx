// Oracle Lumira - Page Sanctuaire avec upload par niveau
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Star, Upload, Lock, CheckCircle, AlertTriangle } from 'lucide-react';
import { useUserLevel } from '../contexts/UserLevelContext';
import { LevelUpload } from '../components/sanctuaire/LevelUpload';

const SanctuairePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { userLevel, checkAccess } = useUserLevel();
  const [activeTab, setActiveTab] = useState<'upload' | 'content' | 'progress'>('upload');

  const levelFromUrl = searchParams.get('level');
  const orderId = searchParams.get('order_id');

  useEffect(() => {
    // Vérification d'accès
    if (!userLevel.hasAccess || !userLevel.currentLevel) {
      // Redirection vers l'accueil si pas d'accès
      navigate('/', { replace: true });
      return;
    }

    // Synchronisation avec l'URL si nécessaire
    if (levelFromUrl && levelFromUrl !== userLevel.currentLevel) {
      console.warn('Niveau URL différent du niveau utilisateur');
    }
  }, [userLevel, levelFromUrl, navigate]);

  const getLevelDisplayName = (level: string): string => {
    const names = {
      'initie': 'Initié',
      'mystique': 'Mystique', 
      'profond': 'Profond',
      'integrale': 'Intégral',
    };
    return names[level as keyof typeof names] || level;
  };

  const getUploadProgress = () => {
    if (!userLevel.currentLevel) return 0;
    
    const requiredFiles = {
      'initie': 1,
      'mystique': 2,
      'profond': 3,
      'integrale': 4,
    };
    
    const required = requiredFiles[userLevel.currentLevel as keyof typeof requiredFiles] || 1;
    const uploaded = userLevel.uploadedFiles.length;
    
    return Math.min((uploaded / required) * 100, 100);
  };

  const isUploadComplete = () => {
    return userLevel.uploadStatus === 'completed' || getUploadProgress() === 100;
  };

  if (!userLevel.hasAccess || !userLevel.currentLevel) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cosmic-void via-cosmic-deep to-cosmic-galaxy flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-6 max-w-md"
        >
          <Lock className="w-16 h-16 text-cosmic-gold mx-auto" />
          <div>
            <h2 className="text-2xl font-bold text-cosmic-divine mb-2">Accès Restreint</h2>
            <p className="text-cosmic-ethereal">
              Vous devez effectuer un achat pour accéder au Sanctuaire.
            </p>
          </div>
          <button
            onClick={() => navigate('/')}
            className="px-8 py-3 bg-gradient-to-r from-cosmic-gold to-cosmic-gold-warm text-cosmic-void font-bold rounded-xl hover:shadow-stellar transition-all duration-300"
          >
            Retour à l'accueil
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cosmic-void via-cosmic-deep to-cosmic-galaxy">
      {/* Header Sanctuaire */}
      <div className="bg-cosmic-deep/60 backdrop-blur-md border-b border-cosmic-gold/30">
        <div className="container mx-auto px-6 py-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0"
          >
            <div className="text-center md:text-left">
              <h1 className="font-playfair italic text-3xl md:text-4xl font-bold text-cosmic-divine mb-2">
                Sanctuaire Oracle Lumira
              </h1>
              <div className="flex items-center justify-center md:justify-start space-x-3">
                <Star className="w-6 h-6 text-cosmic-gold" />
                <span className="text-cosmic-gold font-bold text-xl">
                  Niveau {getLevelDisplayName(userLevel.currentLevel)}
                </span>
                <Star className="w-6 h-6 text-cosmic-gold" />
              </div>
            </div>

            <div className="text-center">
              <div className="text-sm text-cosmic-ethereal mb-2">Upload Progress</div>
              <div className="flex items-center space-x-3">
                <div className="w-32 h-2 bg-cosmic-deep rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-cosmic-gold to-cosmic-gold-warm"
                    style={{ width: `${getUploadProgress()}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                <span className="text-cosmic-gold font-bold text-sm">
                  {Math.round(getUploadProgress())}%
                </span>
              </div>
              <div className="text-xs text-cosmic-ethereal mt-1">
                {userLevel.uploadedFiles.length} / {userLevel.currentLevel === 'initie' ? 1 : userLevel.currentLevel === 'mystique' ? 2 : userLevel.currentLevel === 'profond' ? 3 : 4} fichiers
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="container mx-auto px-6 py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex justify-center space-x-1 bg-cosmic-deep/40 rounded-xl p-1"
        >
          {[
            { id: 'upload', label: 'Upload Fichiers', icon: Upload },
            { id: 'content', label: 'Contenu Niveau', icon: Star },
            { id: 'progress', label: 'Progression', icon: CheckCircle },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-cosmic-gold text-cosmic-void'
                    : 'text-cosmic-ethereal hover:bg-cosmic-gold/20'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </motion.div>
      </div>

      {/* Tab Content */}
      <div className="container mx-auto px-6 pb-12">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'upload' && (
            <div>
              <LevelUpload />
            </div>
          )}

          {activeTab === 'content' && (
            <div className="max-w-4xl mx-auto">
              {isUploadComplete() ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-cosmic-deep/60 backdrop-blur-md border border-cosmic-gold/40 rounded-2xl p-8 text-center"
                >
                  <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-6" />
                  <h2 className="font-playfair italic text-3xl font-bold text-cosmic-divine mb-4">
                    Contenu Niveau {getLevelDisplayName(userLevel.currentLevel)} Activé
                  </h2>
                  <p className="text-cosmic-ethereal mb-8">
                    Félicitations ! Vous avez complété l'upload de vos fichiers. 
                    Votre analyse cosmique personnalisée sera disponible sous 24h.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {userLevel.availableFeatures.map((feature, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center space-x-3 text-left"
                      >
                        <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                        <span className="text-cosmic-ethereal">{feature}</span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-cosmic-deep/60 backdrop-blur-md border border-yellow-500/40 rounded-2xl p-8 text-center"
                >
                  <AlertTriangle className="w-16 h-16 text-yellow-400 mx-auto mb-6" />
                  <h2 className="font-playfair italic text-3xl font-bold text-cosmic-divine mb-4">
                    Upload Requis
                  </h2>
                  <p className="text-cosmic-ethereal">
                    Veuillez d'abord compléter l'upload de vos fichiers dans l'onglet "Upload Fichiers" 
                    pour débloquer le contenu de votre niveau.
                  </p>
                </motion.div>
              )}
            </div>
          )}

          {activeTab === 'progress' && (
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="bg-cosmic-deep/60 backdrop-blur-md border border-cosmic-gold/40 rounded-2xl p-8">
                <h2 className="font-playfair italic text-2xl font-bold text-cosmic-divine mb-6 text-center">
                  Votre Progression Cosmique
                </h2>
                
                <div className="space-y-6">
                  {/* Statut Achat */}
                  <div className="flex items-center justify-between p-4 bg-green-500/20 rounded-xl border border-green-500/30">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-6 h-6 text-green-400" />
                      <div>
                        <h3 className="font-bold text-green-400">Achat Validé</h3>
                        <p className="text-sm text-cosmic-ethereal">
                          Niveau {getLevelDisplayName(userLevel.currentLevel)} acquis le{' '}
                          {userLevel.purchasedDate?.toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Statut Upload */}
                  <div className={`flex items-center justify-between p-4 rounded-xl border ${
                    isUploadComplete() 
                      ? 'bg-green-500/20 border-green-500/30' 
                      : 'bg-yellow-500/20 border-yellow-500/30'
                  }`}>
                    <div className="flex items-center space-x-3">
                      {isUploadComplete() ? (
                        <CheckCircle className="w-6 h-6 text-green-400" />
                      ) : (
                        <Upload className="w-6 h-6 text-yellow-400" />
                      )}
                      <div>
                        <h3 className={`font-bold ${isUploadComplete() ? 'text-green-400' : 'text-yellow-400'}`}>
                          Upload de Fichiers
                        </h3>
                        <p className="text-sm text-cosmic-ethereal">
                          {userLevel.uploadedFiles.length} fichier(s) uploadé(s) - {Math.round(getUploadProgress())}% complété
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Fichiers uploadés */}
                  {userLevel.uploadedFiles.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-bold text-cosmic-gold">Fichiers uploadés :</h4>
                      {userLevel.uploadedFiles.map((file, index) => (
                        <div key={file.id} className="flex items-center space-x-3 p-3 bg-cosmic-deep/40 rounded-lg">
                          <CheckCircle className="w-5 h-5 text-green-400" />
                          <div className="flex-1">
                            <p className="font-medium text-cosmic-divine">{file.name}</p>
                            <p className="text-xs text-cosmic-ethereal">
                              {file.category} • {(file.size / (1024 * 1024)).toFixed(2)} MB • {file.uploadedAt.toLocaleDateString('fr-FR')}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default SanctuairePage;