import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Mail,
  Phone,
  Calendar,
  Clock,
  MapPin,
  MessageSquare,
  Target,
  Camera,
  Edit3,
  Save,
  X,
  Loader2,
  Award,
  Eye,
  Download
} from 'lucide-react';
import { useSanctuaire } from '../../contexts/SanctuaireContext';
import GlassCard from '../ui/GlassCard';

// =================== TYPES ===================

interface EditData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  birthDate: string;
  birthTime: string;
  birthPlace: string;
  specificQuestion: string;
  objective: string;
}

// =================== COMPOSANT PRINCIPAL ===================

const Profile: React.FC = () => {
  const {
    user,
    profile,
    levelMetadata,
    updateProfile,
    updateUser,
    refresh,
    isLoading
  } = useSanctuaire();

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [uploadingFace, setUploadingFace] = useState(false);
  const [uploadingPalm, setUploadingPalm] = useState(false);

  const [editData, setEditData] = useState<EditData>({
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

  // Synchroniser editData quand les données arrivent
  useEffect(() => {
    if (user || profile) {
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
    }
  }, [user, profile]);

  // =================== HANDLERS ===================

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Mise à jour des infos personnelles si modifiées
      if (
        editData.firstName !== user?.firstName ||
        editData.lastName !== user?.lastName ||
        editData.phone !== user?.phone ||
        editData.email !== user?.email
      ) {
        await updateUser({
          firstName: editData.firstName,
          lastName: editData.lastName,
          phone: editData.phone,
          email: editData.email
        });
      }

      // Mise à jour du profil spirituel
      await updateProfile({
        birthDate: editData.birthDate,
        birthTime: editData.birthTime,
        birthPlace: editData.birthPlace,
        specificQuestion: editData.specificQuestion,
        objective: editData.objective,
        profileCompleted: true
      });

      await refresh();
      setIsEditing(false);
    } catch (error) {
      console.error('[Profile] Erreur sauvegarde:', error);
      alert('Erreur lors de la sauvegarde. Veuillez réessayer.');
    } finally {
      setIsSaving(false);
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

  const handleReplacePhoto = async (type: 'face_photo' | 'palm_photo') => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;

      const contentType = file.type || 'image/jpeg';
      type === 'face_photo' ? setUploadingFace(true) : setUploadingPalm(true);

      try {
        // 1. Demander une URL présignée
        const presignRes = await fetch('/api/uploads/presign', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type, contentType, originalName: file.name })
        });

        if (!presignRes.ok) throw new Error('Échec de la présignature');
        const { uploadUrl, publicUrl } = await presignRes.json();

        // 2. Upload vers S3
        const putRes = await fetch(uploadUrl, {
          method: 'PUT',
          headers: { 'Content-Type': contentType },
          body: file
        });

        if (!putRes.ok) throw new Error('Échec de l\'upload S3');

        // 3. Mettre à jour le profil
        if (type === 'face_photo') {
          await updateProfile({ facePhotoUrl: publicUrl });
        } else {
          await updateProfile({ palmPhotoUrl: publicUrl });
        }

        await refresh();
      } catch (error) {
        console.error('[Profile] Erreur upload photo:', error);
        alert('Impossible de remplacer la photo. Réessayez.');
      } finally {
        setUploadingFace(false);
        setUploadingPalm(false);
      }
    };
    input.click();
  };

  // =================== RENDER ===================

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
      </div>
    );
  }

  const levelName = (levelMetadata?.name as string) || 'Initié';
  const levelColor = (levelMetadata?.color as string) || 'amber';

  return (
    <div className="min-h-screen bg-gradient-to-br from-mystical-950 via-mystical-900 to-mystical-950 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header avec Niveau */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-3"
        >
          <div className="flex items-center justify-center gap-3">
            <Award className={`w-6 h-6 text-${levelColor}-400`} />
            <h1 className="text-3xl font-bold text-white">Mon Profil</h1>
          </div>
          <p className="text-white/60">
            Niveau actuel : <span className={`text-${levelColor}-400 font-medium`}>{levelName}</span>
          </p>
        </motion.div>

        {/* Actions Édition */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex justify-end gap-3"
        >
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-4 py-2 bg-amber-400/10 hover:bg-amber-400/20 text-amber-400 border border-amber-400/30 rounded-lg transition-all"
            >
              <Edit3 className="w-4 h-4" />
              Modifier
            </button>
          ) : (
            <>
              <button
                onClick={handleCancel}
                disabled={isSaving}
                className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white/70 border border-white/10 rounded-lg transition-all disabled:opacity-50"
              >
                <X className="w-4 h-4" />
                Annuler
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 px-4 py-2 bg-green-400/10 hover:bg-green-400/20 text-green-400 border border-green-400/30 rounded-lg transition-all disabled:opacity-50"
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Sauvegarder
              </button>
            </>
          )}
        </motion.div>

        {/* Photos */}
        {(profile?.facePhotoUrl || profile?.palmPhotoUrl) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <GlassCard className="p-6">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Camera className="w-5 h-5 text-amber-400" />
                Photos Uploadées
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Photo Visage */}
                {profile.facePhotoUrl && (
                  <div className="space-y-3">
                    <p className="text-sm text-white/60">Photo de Visage</p>
                    <div className="relative group">
                      <img
                        src={profile.facePhotoUrl}
                        alt="Visage"
                        className="w-full h-48 object-cover rounded-lg cursor-pointer"
                        onClick={() => setLightboxImage(profile.facePhotoUrl!)}
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 rounded-lg transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <Eye className="w-8 h-8 text-white" />
                      </div>
                    </div>
                    <button
                      onClick={() => handleReplacePhoto('face_photo')}
                      disabled={uploadingFace}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 text-white/70 border border-white/10 rounded-lg transition-all text-sm disabled:opacity-50"
                    >
                      {uploadingFace ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Camera className="w-4 h-4" />
                      )}
                      Remplacer
                    </button>
                  </div>
                )}

                {/* Photo Paume */}
                {profile.palmPhotoUrl && (
                  <div className="space-y-3">
                    <p className="text-sm text-white/60">Photo de Paume</p>
                    <div className="relative group">
                      <img
                        src={profile.palmPhotoUrl}
                        alt="Paume"
                        className="w-full h-48 object-cover rounded-lg cursor-pointer"
                        onClick={() => setLightboxImage(profile.palmPhotoUrl!)}
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 rounded-lg transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <Eye className="w-8 h-8 text-white" />
                      </div>
                    </div>
                    <button
                      onClick={() => handleReplacePhoto('palm_photo')}
                      disabled={uploadingPalm}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 text-white/70 border border-white/10 rounded-lg transition-all text-sm disabled:opacity-50"
                    >
                      {uploadingPalm ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Camera className="w-4 h-4" />
                      )}
                      Remplacer
                    </button>
                  </div>
                )}
              </div>
            </GlassCard>
          </motion.div>
        )}

        {/* Informations Personnelles */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <GlassCard className="p-6">
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <User className="w-5 h-5 text-amber-400" />
              Informations Personnelles
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Prénom */}
              <div className="space-y-2">
                <label className="text-sm text-white/60 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Prénom
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.firstName}
                    onChange={(e) => setEditData({ ...editData, firstName: e.target.value })}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-amber-400/50"
                  />
                ) : (
                  <p className="text-white px-4 py-2">{user?.firstName || 'Non renseigné'}</p>
                )}
              </div>

              {/* Nom */}
              <div className="space-y-2">
                <label className="text-sm text-white/60 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Nom
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.lastName}
                    onChange={(e) => setEditData({ ...editData, lastName: e.target.value })}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-amber-400/50"
                  />
                ) : (
                  <p className="text-white px-4 py-2">{user?.lastName || 'Non renseigné'}</p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="text-sm text-white/60 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    value={editData.email}
                    onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-amber-400/50"
                  />
                ) : (
                  <p className="text-white px-4 py-2">{user?.email || 'Non renseigné'}</p>
                )}
              </div>

              {/* Téléphone */}
              <div className="space-y-2">
                <label className="text-sm text-white/60 flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Téléphone
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={editData.phone}
                    onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-amber-400/50"
                  />
                ) : (
                  <p className="text-white px-4 py-2">{user?.phone || 'Non renseigné'}</p>
                )}
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Informations Spirituelles */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <GlassCard className="p-6">
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-400" />
              Informations Spirituelles
            </h2>
            <div className="space-y-6">
              {/* Naissance */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-sm text-white/60 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Date de naissance
                  </label>
                  {isEditing ? (
                    <input
                      type="date"
                      value={editData.birthDate}
                      onChange={(e) => setEditData({ ...editData, birthDate: e.target.value })}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-400/50"
                    />
                  ) : (
                    <p className="text-white px-4 py-2">{profile?.birthDate || 'Non renseignée'}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-white/60 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Heure
                  </label>
                  {isEditing ? (
                    <input
                      type="time"
                      value={editData.birthTime}
                      onChange={(e) => setEditData({ ...editData, birthTime: e.target.value })}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-400/50"
                    />
                  ) : (
                    <p className="text-white px-4 py-2">{profile?.birthTime || 'Non renseignée'}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-white/60 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Lieu
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editData.birthPlace}
                      onChange={(e) => setEditData({ ...editData, birthPlace: e.target.value })}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-400/50"
                    />
                  ) : (
                    <p className="text-white px-4 py-2">{profile?.birthPlace || 'Non renseigné'}</p>
                  )}
                </div>
              </div>

              {/* Question spécifique */}
              <div className="space-y-2">
                <label className="text-sm text-white/60 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Question Spécifique
                </label>
                {isEditing ? (
                  <textarea
                    value={editData.specificQuestion}
                    onChange={(e) => setEditData({ ...editData, specificQuestion: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-400/50 resize-none"
                  />
                ) : (
                  <p className="text-white px-4 py-2">{profile?.specificQuestion || 'Non renseignée'}</p>
                )}
              </div>

              {/* Objectif spirituel */}
              <div className="space-y-2">
                <label className="text-sm text-white/60 flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Objectif Spirituel
                </label>
                {isEditing ? (
                  <textarea
                    value={editData.objective}
                    onChange={(e) => setEditData({ ...editData, objective: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-400/50 resize-none"
                  />
                ) : (
                  <p className="text-white px-4 py-2">{profile?.objective || 'Non renseigné'}</p>
                )}
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </div>

      {/* Lightbox pour agrandir les photos */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightboxImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <img
              src={lightboxImage}
              alt="Photo agrandie"
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
            />
            <button
              onClick={() => setLightboxImage(null)}
              className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/70 rounded-full transition-all"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
