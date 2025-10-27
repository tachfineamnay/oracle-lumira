import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Clock, 
  Target, 
  Edit3, 
  Save, 
  X,
  CheckCircle,
  AlertCircle,
  CreditCard,
  History,
  Settings,
  Eye,
  Camera,
  Image as ImageIcon
} from 'lucide-react';

import { useSanctuaire } from '../../contexts/SanctuaireContext';
import { useSanctuaryAccess } from '../../hooks/useSanctuaryAccess';
import GlassCard from '../ui/GlassCard';
import { getLevelNameSafely } from '../../utils/orderUtils';

interface EditableField {
  key: string;
  label: string;
  type: 'text' | 'email' | 'tel' | 'date' | 'time' | 'textarea';
  icon: React.ReactNode;
  value: string;
}

const Profile: React.FC = () => {
  // PASSAGE 22 - DEVOPS : Utiliser UNIQUEMENT useSanctuaire() pour toutes les donnees
  const { user, profile, orders, isLoading: ordersLoading, levelMetadata, updateProfile } = useSanctuaire();
  const { accessRights, levelName } = useSanctuaryAccess();
  const [isEditing, setIsEditing] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  
  // Donnees utilisateur depuis SanctuaireContext
  const email = user?.email || '';
  const phone = user?.phone || '';  // PASSAGE 22 : phone est dans user, pas profile
  
  const [editData, setEditData] = useState({
    firstName: user?.firstName || '',       // PASSAGE 24 : Ajouter firstName modifiable
    lastName: user?.lastName || '',         // PASSAGE 24 : Ajouter lastName modifiable
    email: email,
    phone: phone,
    birthDate: profile?.birthDate || '',
    birthTime: profile?.birthTime || '',
    birthPlace: profile?.birthPlace || '',
    specificQuestion: profile?.specificQuestion || '',
    objective: profile?.objective || ''
  });

  // Synchroniser editData quand les donnees du Sanctuaire arrivent
  React.useEffect(() => {
    if (user) {
      setEditData(prev => ({
        ...prev,
        firstName: user.firstName || prev.firstName,  // PASSAGE 24
        lastName: user.lastName || prev.lastName,     // PASSAGE 24
        email: user.email || prev.email,
        phone: user.phone || prev.phone
      }));
    }
  }, [user]);

  const hasCompletedProfile = profile?.profileCompleted;
  // Determine latest order (most recent by deliveredAt or createdAt)
  const latestOrder = React.useMemo(() => {
    if (!orders || orders.length === 0) return null;
    const withDate = orders.map((o: any) => ({ ...o, _ts: new Date(o.deliveredAt || o.createdAt).getTime() }));
    withDate.sort((a: any, b: any) => b._ts - a._ts);
    return withDate[0];
  }, [orders]);

  const currentLevelName = (levelMetadata && (levelMetadata as any).name) || (latestOrder ? getLevelNameSafely(latestOrder.level) : levelName);

  const handleSave = async () => {
    try {
      // PASSAGE 24 : Mettre à jour firstName/lastName dans User (pas profile)
      if (editData.firstName !== user?.firstName || editData.lastName !== user?.lastName || editData.phone !== user?.phone || editData.email !== user?.email) {
        const token = typeof window !== 'undefined' ? localStorage.getItem('sanctuaire_token') : null;
        if (token) {
          await fetch(`${import.meta.env.VITE_API_URL || '/api'}/users/me`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              firstName: editData.firstName,
              lastName: editData.lastName,
              phone: editData.phone,
              email: editData.email
            })
          });
        }
      }
      
      // Mettre à jour profile (birthDate, birthPlace, etc.)
      await updateProfile({
        birthDate: editData.birthDate,
        birthTime: editData.birthTime,
        birthPlace: editData.birthPlace,
        specificQuestion: editData.specificQuestion,
        objective: editData.objective,
        profileCompleted: true
      });
      
      setIsEditing(false);
      
      // Recharger les données pour voir les changements
      window.location.reload();
    } catch (err) {
      console.error('[Profile] Erreur sauvegarde:', err);
      alert('Erreur lors de la sauvegarde');
    }
  };

  const handleCancel = () => {
    setEditData({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phone: user?.phone || '',
      birthDate: profile?.birthDate || '',
      birthTime: profile?.birthTime || '',
      birthPlace: profile?.birthPlace || '',
      specificQuestion: profile?.specificQuestion || '',
      objective: profile?.objective || ''
    });
    setIsEditing(false);
  };

  const editableFields: EditableField[] = [
    {
      key: 'firstName',
      label: 'Prénom',
      type: 'text',
      icon: <User className="w-4 h-4" />,
      value: isEditing ? editData.firstName : (user?.firstName || 'Non renseigné')  // PASSAGE 24 : Modifiable
    },
    {
      key: 'lastName',
      label: 'Nom',
      type: 'text',
      icon: <User className="w-4 h-4" />,
      value: isEditing ? editData.lastName : (user?.lastName || 'Non renseigné')  // PASSAGE 24 : Modifiable
    },
    {
      key: 'email',
      label: 'Email',
      type: 'email',
      icon: <Mail className="w-4 h-4" />,
      value: isEditing ? editData.email : (email || 'Non renseigné')
    },
    {
      key: 'phone',
      label: 'Téléphone',
      type: 'tel',
      icon: <Phone className="w-4 h-4" />,
      value: isEditing ? editData.phone : (phone || 'Non renseigné')
    },
    {
      key: 'birthDate',
      label: 'Date de naissance',
      type: 'date',
      icon: <Calendar className="w-4 h-4" />,
      value: isEditing ? editData.birthDate : (profile?.birthDate || 'Non renseignée')
    },
    {
      key: 'birthTime',
      label: 'Heure de naissance',
      type: 'time',
      icon: <Clock className="w-4 h-4" />,
      value: isEditing ? editData.birthTime : (profile?.birthTime || 'Non renseignée')
    },
    {
      key: 'birthPlace',
      label: 'Lieu de naissance',
      type: 'text',
      icon: <Calendar className="w-4 h-4" />,
      value: isEditing ? editData.birthPlace : (profile?.birthPlace || 'Non renseigné')
    },
    {
      key: 'specificQuestion',
      label: 'Question spécifique',
      type: 'textarea',
      icon: <Target className="w-4 h-4" />,
      value: isEditing ? editData.specificQuestion : (profile?.specificQuestion || 'Non renseignée')
    },
    {
      key: 'objective',
      label: 'Objectif spirituel',
      type: 'textarea',
      icon: <Target className="w-4 h-4" />,
      value: isEditing ? editData.objective : (profile?.objective || 'Non renseigné')
    }
  ];

  if (!hasCompletedProfile) {
    return (
      <div className="p-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md mx-auto"
        >
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-amber-400/20 flex items-center justify-center">
            <AlertCircle className="w-10 h-10 text-amber-400" />
          </div>
          <h2 className="text-xl font-playfair italic text-amber-400 mb-4">
            Profil Incomplet
          </h2>
          <p className="text-white/80 mb-6">
            Complétez votre profil spirituel dans l'espace d'accueil pour accéder à toutes les fonctionnalités de votre sanctuaire.
          </p>
          <button
            onClick={() => window.location.href = '/sanctuaire/dashboard'}
            className="px-6 py-3 bg-gradient-to-r from-amber-400 to-amber-500 text-mystical-900 font-medium rounded-xl hover:from-amber-500 hover:to-amber-600 transition-all"
          >
            Compléter mon profil
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Acces & Statut de commande */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
        <GlassCard className="p-6 bg-gradient-to-br from-amber-400/10 to-amber-500/5 border-amber-400/20">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="text-sm text-white/60">Votre Niveau</div>
              <div className="text-xl font-playfair italic text-amber-400">{currentLevelName || 'Gratuit'}</div>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <div className="text-sm text-white/60">Tirages / jour</div>
                <div className="text-white font-medium">{accessRights.oracle.dailyDraws === -1 ? 'Illimites' : accessRights.oracle.dailyDraws}</div>
              </div>
              <div>
                <div className="text-sm text-white/60">Temps de reponse</div>
                <div className="text-white font-medium">{accessRights.oracle.responseTime}</div>
              </div>
            </div>
          </div>
          <div className="mt-6 p-4 rounded-xl bg-white/5 border border-white/10">
            {latestOrder ? (
              <div className="flex flex-col gap-3">
                <div>
                  <div className="text-white font-medium">Commande #{latestOrder.orderNumber || (latestOrder.id && latestOrder.id.slice(0,8))}</div>
                  <div className="text-xs text-white/60 mt-1">Passée le {new Date(latestOrder.createdAt).toLocaleDateString('fr-FR')} · {getLevelNameSafely(latestOrder.level)}</div>
                  <div className="text-sm mt-2">
                    {latestOrder.deliveredAt ? (
                      <span className="text-green-400 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        Lecture prête
                      </span>
                    ) : (
                      <div className="space-y-1">
                        <span className="text-amber-400 flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          Lecture en cours de préparation
                        </span>
                        <p className="text-xs text-white/60">
                          Vous serez notifié par email dès qu'elle sera prête
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                {latestOrder.deliveredAt && (
                  <div className="flex justify-end">
                    <button 
                      onClick={() => (window.location.href = '/sanctuaire/draws')} 
                      className="px-4 py-2 rounded-lg bg-green-400/20 text-green-400 border border-green-400/30 hover:bg-green-400/30 transition"
                    >
                      Accéder à mes lectures
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-white/80">Aucune commande récente</div>
            )}
          </div>
        </GlassCard>
      </motion.div>
      {/* Header avec statut */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-playfair italic text-amber-400 mb-2">
            Mon Profil Spirituel
          </h1>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <span className="text-green-400 font-medium">Profil complété</span>
            {profile?.submittedAt && (
              <span className="text-white/60 text-sm">
                • Soumis le {new Date(profile.submittedAt).toLocaleDateString('fr-FR')}
              </span>
            )}
          </div>
        </div>

        <button
          onClick={() => isEditing ? handleSave() : setIsEditing(true)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
            isEditing 
              ? 'bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30'
              : 'bg-amber-400/20 text-amber-400 border border-amber-400/30 hover:bg-amber-400/30'
          }`}
        >
          {isEditing ? (
            <>
              <Save className="w-4 h-4" />
              Sauvegarder
            </>
          ) : (
            <>
              <Edit3 className="w-4 h-4" />
              Modifier
            </>
          )}
        </button>
      </motion.div>

      {/* Bouton Annuler si en mode édition */}
      {isEditing && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex justify-end"
        >
          <button
            onClick={handleCancel}
            className="flex items-center gap-2 px-4 py-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all"
          >
            <X className="w-4 h-4" />
            Annuler
          </button>
        </motion.div>
      )}

      {/* Informations personnelles */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <GlassCard className="p-6">
          <h2 className="text-lg font-playfair italic text-white mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-amber-400" />
            Informations Personnelles
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {editableFields.map((field) => (
              <div key={field.key}>
                <label className="block text-sm font-medium text-white/90 mb-2">
                  {field.icon}
                  <span className="ml-2">{field.label}</span>
                </label>
                
                {isEditing ? (
                  field.type === 'textarea' ? (
                    <textarea
                      value={editData[field.key as keyof typeof editData]}
                      onChange={(e) => setEditData({ ...editData, [field.key]: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl border bg-white/5 border-amber-400/30 text-white placeholder-white/50 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all resize-none"
                    />
                  ) : (
                    <input
                      type={field.type}
                      value={editData[field.key as keyof typeof editData]}
                      onChange={(e) => setEditData({ ...editData, [field.key]: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border bg-white/5 border-amber-400/30 text-white placeholder-white/50 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all"
                    />
                  )
                ) : (
                  <div className="w-full px-4 py-3 rounded-xl border bg-white/5 border-white/10 text-white/90">
                    {field.type === 'date' && field.value !== 'Non renseignée' && field.value
                      ? new Date(field.value).toLocaleDateString('fr-FR')
                      : field.value}
                  </div>
                )}
              </div>
            ))}
          </div>
        </GlassCard>
      </motion.div>

      {/* Section Photos Uploadées */}
      {(profile?.facePhotoUrl || profile?.palmPhotoUrl) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <GlassCard className="p-6">
            <h2 className="text-lg font-playfair italic text-white mb-4 flex items-center gap-2">
              <Camera className="w-5 h-5 text-amber-400" />
              Photos Uploadées
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              {/* Photo de visage */}
              {profile?.facePhotoUrl && (
                <div>
                  <label className="block text-sm font-medium text-white/90 mb-3">
                    <Camera className="w-4 h-4 inline mr-2" />
                    Photo de visage
                  </label>
                  <div className="relative bg-white/5 border border-amber-400/20 rounded-xl p-4 text-center">
                    <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-amber-400/20 flex items-center justify-center">
                      <Camera className="w-8 h-8 text-amber-400" />
                    </div>
                    <p className="text-white/90 font-medium text-sm">
                      Photo de visage
                    </p>
                    <p className="text-white/60 text-xs mt-1">
                      Uploadée avec succès
                    </p>
                  </div>
                </div>
              )}
              
              {/* Photo de paume */}
              {profile?.palmPhotoUrl && (
                <div>
                  <label className="block text-sm font-medium text-white/90 mb-3">
                    <ImageIcon className="w-4 h-4 inline mr-2" />
                    Photo de paume
                  </label>
                  <div className="relative bg-white/5 border border-purple-400/20 rounded-xl p-4 text-center">
                    <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-purple-400/20 flex items-center justify-center">
                      <ImageIcon className="w-8 h-8 text-purple-400" />
                    </div>
                    <p className="text-white/90 font-medium text-sm">
                      Photo de paume
                    </p>
                    <p className="text-white/60 text-xs mt-1">
                      Uploadée avec succès
                    </p>
                  </div>
                </div>
              )}
            </div>
          </GlassCard>
        </motion.div>
      )}

      {/* Actions rapides */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <GlassCard className="p-6">
          <h2 className="text-lg font-playfair italic text-white mb-4 flex items-center gap-2">
            <Settings className="w-5 h-5 text-amber-400" />
            Actions Rapides
          </h2>
          
          <div className="grid md:grid-cols-3 gap-4">
            <button 
              onClick={() => window.location.href = '/sanctuaire/draws'}
              className="flex items-center gap-3 p-4 bg-blue-400/10 border border-blue-400/20 rounded-xl text-blue-400 hover:bg-blue-400/20 transition-all"
            >
              <Eye className="w-5 h-5" />
              <div className="text-left">
                <div className="font-medium">Mes Lectures</div>
                <div className="text-xs text-white/60">Consulter l'historique</div>
              </div>
            </button>
            
            <button 
              onClick={() => window.location.href = '/commande'}
              className="flex items-center gap-3 p-4 bg-amber-400/10 border border-amber-400/20 rounded-xl text-amber-400 hover:bg-amber-400/20 transition-all"
            >
              <CreditCard className="w-5 h-5" />
              <div className="text-left">
                <div className="font-medium">Nouvelle Lecture</div>
                <div className="text-xs text-white/60">Commander maintenant</div>
              </div>
            </button>
            
            <button 
              onClick={() => window.location.href = '/sanctuaire/dashboard'}
              className="flex items-center gap-3 p-4 bg-purple-400/10 border border-purple-400/20 rounded-xl text-purple-400 hover:bg-purple-400/20 transition-all"
            >
              <History className="w-5 h-5" />
              <div className="text-left">
                <div className="font-medium">Retour Accueil</div>
                <div className="text-xs text-white/60">Tableau de bord</div>
              </div>
            </button>
          </div>
        </GlassCard>
      </motion.div>

      {/* Historique des Commandes avec Miniatures Cliquables */}
      {!ordersLoading && orders && orders.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <GlassCard className="p-6">
            <h2 className="text-lg font-playfair italic text-white mb-4 flex items-center gap-2">
              <History className="w-5 h-5 text-amber-400" />
              Historique des Soumissions
            </h2>
            
            <div className="space-y-4">
              {orders.map((order: any) => (
                <div
                  key={order.id}
                  className="p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="text-white font-medium">
                        {order.formData?.specificQuestion || 'Lecture spirituelle'}
                      </div>
                      <div className="text-xs text-white/60 mt-1">
                        Commandée le {new Date(order.createdAt).toLocaleDateString('fr-FR')} • {getLevelNameSafely(order.level)}
                      </div>
                    </div>
                    <div className="px-3 py-1 bg-green-400/20 border border-green-400/30 rounded-full text-green-400 text-xs font-medium">
                      ✓ Livrée
                    </div>
                  </div>
                  
                  {/* Photos miniatures cliquables */}
                  {(order.formData?.facePhotoUrl || order.formData?.palmPhotoUrl) && (
                    <div className="flex gap-3">
                      <div className="text-xs text-white/60 mr-2">Photos uploadées :</div>
                      {order.formData?.facePhotoUrl && (
                        <button
                          onClick={() => setLightboxImage(order.formData.facePhotoUrl)}
                          className="relative w-16 h-16 bg-amber-400/10 border border-amber-400/30 rounded-lg overflow-hidden hover:scale-105 transition-transform group"
                        >
                          <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/60 transition-colors">
                            <Camera className="w-6 h-6 text-amber-400" />
                          </div>
                          <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-[10px] text-center py-0.5">
                            Visage
                          </div>
                        </button>
                      )}
                      {order.formData?.palmPhotoUrl && (
                        <button
                          onClick={() => setLightboxImage(order.formData.palmPhotoUrl)}
                          className="relative w-16 h-16 bg-purple-400/10 border border-purple-400/30 rounded-lg overflow-hidden hover:scale-105 transition-transform group"
                        >
                          <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/60 transition-colors">
                            <ImageIcon className="w-6 h-6 text-purple-400" />
                          </div>
                          <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-[10px] text-center py-0.5">
                            Paume
                          </div>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      )}

      {/* Lightbox pour afficher les images en grand */}
      {lightboxImage && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setLightboxImage(null)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl max-h-[90vh] bg-white/5 border border-white/20 rounded-2xl overflow-hidden"
          >
            <img 
              src={lightboxImage} 
              alt="Photo uploadée" 
              className="w-full h-full object-contain"
            />
            <button
              onClick={() => setLightboxImage(null)}
              className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default Profile;




