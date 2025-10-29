import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  Menu,
  ChevronRight,
  Home
} from 'lucide-react';
import { useSanctuaire } from '../../contexts/SanctuaireContext';
import { useNavigate } from 'react-router-dom';
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

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  color: string;
}

// =================== COMPOSANT PRINCIPAL ===================

const Profile: React.FC = () => {
  const navigate = useNavigate();
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
  const [activeSection, setActiveSection] = useState<string>('photos');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Références pour le scroll
  const photosRef = useRef<HTMLDivElement>(null);
  const personalRef = useRef<HTMLDivElement>(null);
  const spiritualRef = useRef<HTMLDivElement>(null);

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

  // Navigation items
  const navigationItems: NavigationItem[] = [
    { id: 'photos', label: 'Photos', icon: <Camera className="w-4 h-4" />, color: 'amber' },
    { id: 'personal', label: 'Informations', icon: <User className="w-4 h-4" />, color: 'amber' },
    { id: 'spiritual', label: 'Spirituel', icon: <Calendar className="w-4 h-4" />, color: 'purple' }
  ];

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
      
      // Log des URLs des photos pour diagnostic
      if (profile?.facePhotoUrl || profile?.palmPhotoUrl) {
        console.log('[Profile] Photos détectées:', {
          facePhotoUrl: profile?.facePhotoUrl,
          palmPhotoUrl: profile?.palmPhotoUrl
        });
      }
    }
  }, [user, profile]);

  // Observer les sections pour mettre à jour la navigation active
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { threshold: 0.3, rootMargin: '-100px 0px -50% 0px' }
    );

    const sections = [photosRef.current, personalRef.current, spiritualRef.current];
    sections.forEach((section) => {
      if (section) observer.observe(section);
    });

    return () => {
      sections.forEach((section) => {
        if (section) observer.unobserve(section);
      });
    };
  }, [profile]);

  // Scroll vers une section
  const scrollToSection = (sectionId: string) => {
    const refs: Record<string, React.RefObject<HTMLDivElement>> = {
      photos: photosRef,
      personal: personalRef,
      spiritual: spiritualRef
    };
    
    const ref = refs[sectionId];
    if (ref?.current) {
      const yOffset = -100;
      const y = ref.current.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
      setSidebarOpen(false);
    }
  };

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
        console.log('[Profile] Démarrage upload photo:', { type, contentType, fileName: file.name });
        
        // 1. Demander une URL présignée
        const presignRes = await fetch('/api/uploads/presign', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type, contentType, originalName: file.name })
        });

        if (!presignRes.ok) {
          const errorData = await presignRes.json();
          console.error('[Profile] Erreur présignature:', errorData);
          throw new Error('Échec de la présignature');
        }
        
        const { uploadUrl, publicUrl } = await presignRes.json();
        console.log('[Profile] URL présignée reçue:', { uploadUrl: uploadUrl.substring(0, 100), publicUrl });

        // 2. Upload vers S3
        const putRes = await fetch(uploadUrl, {
          method: 'PUT',
          headers: { 'Content-Type': contentType },
          body: file
        });

        if (!putRes.ok) {
          console.error('[Profile] Erreur upload S3:', putRes.status, putRes.statusText);
          throw new Error('Échec de l\'upload S3');
        }
        
        console.log('[Profile] Upload S3 réussi, mise à jour du profil avec URL:', publicUrl);

        // 3. Mettre à jour le profil
        if (type === 'face_photo') {
          await updateProfile({ facePhotoUrl: publicUrl });
        } else {
          await updateProfile({ palmPhotoUrl: publicUrl });
        }

        await refresh();
        console.log('[Profile] Photo remplacée avec succès');
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-mystical-950 via-mystical-900 to-mystical-950">
        <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
      </div>
    );
  }

  const levelName = (levelMetadata?.name as string) || 'Initié';
  const levelColor = (levelMetadata?.color as string) || 'amber';

  return (
    <div className="min-h-screen bg-gradient-to-br from-mystical-950 via-mystical-900 to-mystical-950">
      {/* Bouton Menu Mobile */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-white hover:bg-white/20 transition-all shadow-xl"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Sidebar Navigation */}
      <AnimatePresence>
        {(sidebarOpen || typeof window !== 'undefined' && window.innerWidth >= 1024) && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed left-0 top-0 h-screen w-64 bg-white/5 backdrop-blur-xl border-r border-white/10 z-40 overflow-y-auto"
          >
            {/* Header Sidebar */}
            <div className="p-6 border-b border-white/10">
              <button
                onClick={() => navigate('/sanctuaire')}
                className="flex items-center gap-3 text-white/80 hover:text-white transition-all group w-full"
              >
                <div className="p-2 bg-amber-400/10 rounded-lg group-hover:bg-amber-400/20 transition-all">
                  <Home className="w-5 h-5 text-amber-400" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium">Retour au</p>
                  <p className="text-xs text-white/60">Sanctuaire</p>
                </div>
              </button>
            </div>

            {/* Profil Résumé */}
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-gradient-to-br from-amber-400/20 to-purple-400/20 rounded-full">
                  <User className="w-5 h-5 text-amber-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium truncate">
                    {user?.firstName || 'Client'} {user?.lastName || 'Oracle'}
                  </p>
                  <p className="text-xs text-white/60 truncate">{user?.email}</p>
                </div>
              </div>
              <div className={`flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-${levelColor}-400/10 to-purple-400/10 rounded-lg border border-${levelColor}-400/20`}>
                <Award className={`w-4 h-4 text-${levelColor}-400`} />
                <span className="text-sm text-white/80">{levelName}</span>
              </div>
            </div>

            {/* Navigation Sections */}
            <div className="p-4 space-y-1">
              <p className="px-3 py-2 text-xs font-semibold text-white/40 uppercase tracking-wider">
                Navigation
              </p>
              {navigationItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group ${
                    activeSection === item.id
                      ? `bg-${item.color}-400/10 text-${item.color}-400 border border-${item.color}-400/20`
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div className={`p-1.5 rounded-md ${
                    activeSection === item.id
                      ? `bg-${item.color}-400/20`
                      : 'bg-white/5 group-hover:bg-white/10'
                  }`}>
                    {item.icon}
                  </div>
                  <span className="flex-1 text-left text-sm font-medium">{item.label}</span>
                  {activeSection === item.id && (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </button>
              ))}
            </div>

            {/* Actions Quick */}
            <div className="p-4 mt-auto border-t border-white/10">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-400/10 hover:bg-amber-400/20 text-amber-400 border border-amber-400/30 rounded-lg transition-all"
                >
                  <Edit3 className="w-4 h-4" />
                  <span className="text-sm font-medium">Modifier le profil</span>
                </button>
              ) : (
                <div className="space-y-2">
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-green-400/10 hover:bg-green-400/20 text-green-400 border border-green-400/30 rounded-lg transition-all disabled:opacity-50"
                  >
                    {isSaving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    <span className="text-sm font-medium">Sauvegarder</span>
                  </button>
                  <button
                    onClick={handleCancel}
                    disabled={isSaving}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white/70 border border-white/10 rounded-lg transition-all disabled:opacity-50"
                  >
                    <X className="w-4 h-4" />
                    <span className="text-sm font-medium">Annuler</span>
                  </button>
                </div>
              )}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Overlay Mobile */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
        />
      )}

      {/* Contenu Principal */}
      <div className="lg:ml-64 p-4 sm:p-6 lg:p-8">
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

          {/* Photos */}
          {(profile?.facePhotoUrl || profile?.palmPhotoUrl) && (
            <motion.div
              id="photos"
              ref={photosRef}
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
                          onError={(e) => {
                            console.error('[Profile] Erreur chargement image visage:', profile.facePhotoUrl);
                            e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"%3E%3Crect fill="%23374151" width="400" height="300"/%3E%3Ctext fill="%239CA3AF" font-family="sans-serif" font-size="18" dy="10.5" font-weight="bold" x="50%25" y="50%25" text-anchor="middle"%3EImage non disponible%3C/text%3E%3C/svg%3E';
                          }}
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
                          onError={(e) => {
                            console.error('[Profile] Erreur chargement image paume:', profile.palmPhotoUrl);
                            e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"%3E%3Crect fill="%23374151" width="400" height="300"/%3E%3Ctext fill="%239CA3AF" font-family="sans-serif" font-size="18" dy="10.5" font-weight="bold" x="50%25" y="50%25" text-anchor="middle"%3EImage non disponible%3C/text%3E%3C/svg%3E';
                          }}
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
            id="personal"
            ref={personalRef}
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
            id="spiritual"
            ref={spiritualRef}
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
