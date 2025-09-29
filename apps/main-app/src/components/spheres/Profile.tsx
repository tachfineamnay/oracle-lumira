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
import { useAuth } from '../../hooks/useAuth';
import { useUserLevel } from '../../contexts/UserLevelContext';
import GlassCard from '../ui/GlassCard';

interface EditableField {
  key: string;
  label: string;
  type: 'text' | 'email' | 'tel' | 'date' | 'time' | 'textarea';
  icon: React.ReactNode;
  value: string;
}

const Profile: React.FC = () => {
  const { user } = useAuth();
  const { userLevel, updateUserProfile } = useUserLevel();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    email: userLevel.profile?.email || '',
    phone: userLevel.profile?.phone || '',
    birthDate: userLevel.profile?.birthDate || '',
    birthTime: userLevel.profile?.birthTime || '',
    objective: userLevel.profile?.objective || '',
    additionalInfo: userLevel.profile?.additionalInfo || ''
  });

  const profile = userLevel.profile;
  const hasCompletedProfile = profile?.profileCompleted;

  const handleSave = () => {
    updateUserProfile({
      ...editData,
      profileCompleted: true
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditData({
      email: profile?.email || '',
      phone: profile?.phone || '',
      birthDate: profile?.birthDate || '',
      birthTime: profile?.birthTime || '',
      objective: profile?.objective || '',
      additionalInfo: profile?.additionalInfo || ''
    });
    setIsEditing(false);
  };

  const editableFields: EditableField[] = [
    {
      key: 'email',
      label: 'Email',
      type: 'email',
      icon: <Mail className="w-4 h-4" />,
      value: isEditing ? editData.email : (profile?.email || 'Non renseigné')
    },
    {
      key: 'phone',
      label: 'Téléphone',
      type: 'tel',
      icon: <Phone className="w-4 h-4" />,
      value: isEditing ? editData.phone : (profile?.phone || 'Non renseigné')
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
      key: 'objective',
      label: 'Objectif spirituel',
      type: 'textarea',
      icon: <Target className="w-4 h-4" />,
      value: isEditing ? editData.objective : (profile?.objective || 'Non renseigné')
    },
    {
      key: 'additionalInfo',
      label: 'Informations complémentaires',
      type: 'textarea',
      icon: <User className="w-4 h-4" />,
      value: isEditing ? editData.additionalInfo : (profile?.additionalInfo || 'Non renseignées')
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
            onClick={() => window.location.href = '/sanctuaire'}
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
      {(profile?.facePhoto || profile?.palmPhoto) && (
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
              {profile?.facePhoto && (
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
                      {profile.facePhoto.name || 'Photo de visage'}
                    </p>
                    <p className="text-white/60 text-xs mt-1">
                      Uploadée avec succès
                    </p>
                  </div>
                </div>
              )}
              
              {/* Photo de paume */}
              {profile?.palmPhoto && (
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
                      {profile.palmPhoto.name || 'Photo de paume'}
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
              onClick={() => window.location.href = '/sanctuaire'}
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
    </div>
  );
};

export default Profile;