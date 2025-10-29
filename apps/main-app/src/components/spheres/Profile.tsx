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
  const { user, profile, orders, isLoading: ordersLoading, levelMetadata, updateProfile, updateUser, refresh, hasProduct, hasCapability } = useSanctuaire();
  const { accessRights, levelName } = useSanctuaryAccess();
  const [isEditing, setIsEditing] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [uploadingFace, setUploadingFace] = useState(false);
  const [uploadingPalm, setUploadingPalm] = useState(false);
  
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
    console.log('[Profile] BUILD VERSION: 80051b6 - Refonte UX/UI active');
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
    console.log('🔵 [DEBUG-SAVE] handleSave DÉMARRÉ');
    console.log('🔵 [DEBUG-SAVE] editData:', editData);
    console.log('🔵 [DEBUG-SAVE] user actuel:', user);
    
    try {
      // Mise à jour des informations principales de l'utilisateur (firstName, lastName, phone, email)
      if (editData.firstName !== user?.firstName || 
          editData.lastName !== user?.lastName || 
          editData.phone !== user?.phone || 
          editData.email !== user?.email) {
        
        console.log('🔵 [DEBUG-SAVE] APPEL updateUser avec:', {
          firstName: editData.firstName,
          lastName: editData.lastName,
          phone: editData.phone,
          email: editData.email
        });
        
        await updateUser({
          firstName: editData.firstName,
          lastName: editData.lastName,
          phone: editData.phone,
          email: editData.email
        });
        
        console.log('✅ [DEBUG-SAVE] updateUser TERMINÉ');
      } else {
        console.log('⚠️ [DEBUG-SAVE] Aucune modification user, skip updateUser');
      }
      
      // Mise à jour du profil spirituel (birthDate, birthPlace, etc.)
      console.log('🔵 [DEBUG-SAVE] APPEL updateProfile...');
      await updateProfile({
        birthDate: editData.birthDate,
        birthTime: editData.birthTime,
        birthPlace: editData.birthPlace,
        specificQuestion: editData.specificQuestion,
        objective: editData.objective,
        profileCompleted: true
      });
      console.log('✅ [DEBUG-SAVE] updateProfile TERMINÉ');
      
      setIsEditing(false);
      
      // Recharger toutes les données pour voir les changements
      console.log('🔵 [DEBUG-SAVE] APPEL refresh()...');
      await refresh();
      console.log('✅ [DEBUG-SAVE] refresh() TERMINÉ');
      
      console.log('✅ [Profile] Profil sauvegardé avec succès !');
      alert('✅ Profil sauvegardé avec succès !');
    } catch (err) {
      console.error('❌ [DEBUG-SAVE] ERREUR dans handleSave:', err);
      console.error('❌ [DEBUG-SAVE] Stack:', (err as Error)?.stack);
      alert(`❌ Erreur lors de la sauvegarde: ${(err as Error)?.message || 'Erreur inconnue'}`);
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
    console.log('🟢 [DEBUG-PHOTO] handleReplacePhoto DÉMARRÉ pour type:', type);
    
    try {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = async () => {
        console.log('🟢 [DEBUG-PHOTO] Fichier sélectionné');
        const file = input.files?.[0];
        if (!file) {
          console.log('⚠️ [DEBUG-PHOTO] Aucun fichier sélectionné, abandon');
          return;
        }
        
        console.log('🟢 [DEBUG-PHOTO] Fichier:', file.name, 'Type:', file.type, 'Taille:', file.size);
        const contentType = file.type || 'image/jpeg';

        type === 'face_photo' ? setUploadingFace(true) : setUploadingPalm(true);

        console.log('🟢 [DEBUG-PHOTO] Demande présignature à /api/uploads/presign...');
        const presignRes = await fetch('/api/uploads/presign', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type, contentType, originalName: file.name })
        });
        
        if (!presignRes.ok) {
          const errorText = await presignRes.text();
          console.error('❌ [DEBUG-PHOTO] Présignature échouée:', presignRes.status, errorText);
          throw new Error(`Échec de la présignature upload: ${presignRes.status}`);
        }
        
        const { uploadUrl, publicUrl } = await presignRes.json();
        console.log('✅ [DEBUG-PHOTO] Présignature réussie, publicUrl:', publicUrl);

        console.log('🟢 [DEBUG-PHOTO] Upload vers S3...');
        const putRes = await fetch(uploadUrl, {
          method: 'PUT',
          headers: { 'Content-Type': contentType },
          body: file
        });
        
        if (!putRes.ok) {
          console.error('❌ [DEBUG-PHOTO] Upload S3 échoué:', putRes.status);
          throw new Error(`Échec de l'upload S3: ${putRes.status}`);
        }
        console.log('✅ [DEBUG-PHOTO] Upload S3 réussi');

        const photoField = type === 'face_photo' ? 'facePhotoUrl' : 'palmPhotoUrl';
        console.log(`🟢 [DEBUG-PHOTO] Mise à jour profil: ${photoField} = ${publicUrl}`);
        
        if (type === 'face_photo') {
          await updateProfile({ facePhotoUrl: publicUrl });
          console.log('✅ [DEBUG-PHOTO] updateProfile(facePhotoUrl) TERMINÉ');
          setUploadingFace(false);
        } else {
          await updateProfile({ palmPhotoUrl: publicUrl });
          console.log('✅ [DEBUG-PHOTO] updateProfile(palmPhotoUrl) TERMINÉ');
          setUploadingPalm(false);
        }
        
        console.log('🟢 [DEBUG-PHOTO] Appel refresh()...');
        await refresh();
        console.log('✅ [DEBUG-PHOTO] refresh() TERMINÉ');
        
        alert(`✅ Photo ${type === 'face_photo' ? 'de visage' : 'de paume'} mise à jour avec succès !`);
      };
      input.click();
    } catch (err) {
      console.error('❌ [DEBUG-PHOTO] ERREUR dans handleReplacePhoto:', err);
      console.error('❌ [DEBUG-PHOTO] Stack:', (err as Error)?.stack);
      alert(`❌ Impossible de remplacer la photo: ${(err as Error)?.message || 'Erreur inconnue'}`);
      setUploadingFace(false);
      setUploadingPalm(false);
    }
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

  // Déterminer les états de paiement pour affichage conditionnel
  const isOrderPending = latestOrder && ['pending', 'failed'].includes(latestOrder.status);
  const isOrderPaid = latestOrder && ['paid', 'processing', 'awaiting_validation', 'completed'].includes(latestOrder.status);
  const isOrderFree = latestOrder && latestOrder.amount === 0;
  const canUpdatePayment = isOrderPending && !isOrderFree;

  // Timeline steps basés sur le status
  const getTimelineSteps = () => {
    if (!latestOrder) return [];
    
    const steps = [
      { 
        label: 'Paiement', 
        status: isOrderPaid ? 'completed' : (isOrderPending ? 'pending' : 'current'),
        date: latestOrder.createdAt
      },
      { 
        label: 'Lecture en préparation', 
        status: latestOrder.deliveredAt ? 'completed' : (isOrderPaid ? 'current' : 'pending'),
        date: null
      },
      { 
        label: 'Lecture prête', 
        status: latestOrder.deliveredAt ? 'completed' : 'pending',
        date: latestOrder.deliveredAt
      }
    ];
    
    return steps;
  };

  const timelineSteps = getTimelineSteps();

  return (
    <div className="p-6 space-y-6">
      {/* Statut de votre lecture - REFONTE OPTION C */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
        <GlassCard className="p-6 bg-gradient-to-br from-amber-400/10 to-amber-500/5 border-amber-400/20">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-playfair italic text-amber-400">Statut de votre lecture</h2>
              {latestOrder && (
                <p className="text-sm text-white/60 mt-1">
                  Commande #{latestOrder.orderNumber || latestOrder.id?.slice(0, 8)} • {getLevelNameSafely(latestOrder.level)}
                </p>
              )}
            </div>
            
            {latestOrder && (
              <div className="flex items-center gap-2">
                {latestOrder.deliveredAt ? (
                  <span className="px-3 py-1 bg-green-400/20 border border-green-400/30 rounded-full text-green-400 text-xs font-medium">
                    ✓ Lecture prête
                  </span>
                ) : isOrderPaid ? (
                  <span className="px-3 py-1 bg-amber-400/20 border border-amber-400/30 rounded-full text-amber-400 text-xs font-medium">
                    ⏳ En préparation
                  </span>
                ) : (
                  <span className="px-3 py-1 bg-red-400/20 border border-red-400/30 rounded-full text-red-400 text-xs font-medium">
                    ⚠️ Paiement requis
                  </span>
                )}
              </div>
            )}
          </div>

          {latestOrder ? (
            <div className="space-y-6">
              {/* Timeline de progression */}
              <div className="relative">
                <div className="flex items-center justify-between">
                  {timelineSteps.map((step, idx) => (
                    <div key={idx} className="flex flex-col items-center flex-1">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                        step.status === 'completed' 
                          ? 'bg-green-400/20 border-green-400 text-green-400' 
                          : step.status === 'current'
                          ? 'bg-amber-400/20 border-amber-400 text-amber-400 animate-pulse'
                          : 'bg-white/5 border-white/20 text-white/40'
                      }`}>
                        {step.status === 'completed' ? (
                          <CheckCircle className="w-5 h-5" />
                        ) : step.status === 'current' ? (
                          <Clock className="w-5 h-5" />
                        ) : (
                          <div className="w-2 h-2 rounded-full bg-current" />
                        )}
                      </div>
                      <div className="mt-2 text-center">
                        <p className={`text-xs font-medium ${
                          step.status === 'completed' ? 'text-green-400' :
                          step.status === 'current' ? 'text-amber-400' : 'text-white/40'
                        }`}>
                          {step.label}
                        </p>
                        {step.date && (
                          <p className="text-[10px] text-white/40 mt-0.5">
                            {new Date(step.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                          </p>
                        )}
                      </div>
                      {idx < timelineSteps.length - 1 && (
                        <div className={`absolute top-5 h-0.5 transition-all ${
                          step.status === 'completed' ? 'bg-green-400/50' : 'bg-white/10'
                        }`} style={{
                          left: `${(idx + 1) * (100 / timelineSteps.length)}%`,
                          right: `${100 - ((idx + 2) * (100 / timelineSteps.length))}%`
                        }} />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Message contextuel */}
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                {latestOrder.deliveredAt ? (
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-white font-medium">Votre lecture est prête !</p>
                      <p className="text-white/60 text-sm mt-1">
                        Découvrez votre contenu personnalisé dans l'espace "Mes Lectures".
                      </p>
                    </div>
                    <button 
                      onClick={() => (window.location.href = '/sanctuaire/draws')} 
                      className="px-4 py-2 rounded-lg bg-green-400/20 text-green-400 border border-green-400/30 hover:bg-green-400/30 transition flex-shrink-0"
                    >
                      Voir ma lecture
                    </button>
                  </div>
                ) : isOrderPaid ? (
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-white font-medium">Lecture en cours de préparation</p>
                      <p className="text-white/60 text-sm mt-1">
                        Vous serez notifié par email dès qu'elle sera prête. Délai estimé : 24-48h.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-white font-medium">Paiement en attente</p>
                      <p className="text-white/60 text-sm mt-1">
                        Veuillez finaliser le paiement pour que nous puissions préparer votre lecture.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Gestion du moyen de paiement - CONDITIONNEL */}
              {canUpdatePayment && (
                <div className="p-4 rounded-xl bg-red-400/5 border border-red-400/20">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <CreditCard className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-white font-medium">Problème de paiement</p>
                        <p className="text-white/60 text-sm mt-1">
                          Le paiement n'a pas pu être finalisé. Vous pouvez mettre à jour votre moyen de paiement.
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        // TODO: Implémenter modal Stripe pour update PaymentMethod
                        alert('Fonctionnalité à venir : Mise à jour du moyen de paiement');
                      }}
                      className="px-4 py-2 rounded-lg bg-red-400/20 text-red-400 border border-red-400/30 hover:bg-red-400/30 transition flex-shrink-0 text-sm font-medium"
                    >
                      Modifier la carte
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-white/60">Aucune commande récente</p>
              <button
                onClick={() => (window.location.href = '/sanctuaire/dashboard')}
                className="mt-4 px-6 py-2 rounded-lg bg-white/10 text-white/80 border border-white/20 hover:bg-white/20 transition"
              >
                Retour à l'accueil
              </button>
            </div>
          )}
        </GlassCard>
      </motion.div>

      {/* Aperçu de l'accès par niveau */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <GlassCard className="p-6">
          <h2 className="text-lg font-playfair italic text-white mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-amber-400" />
            Aperçu de l'accès par niveau
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Niveau Initié */}
            <div className={`p-4 rounded-xl border transition-all ${
              currentLevelName === 'Simple' || hasProduct('initie')
                ? 'bg-green-400/10 border-green-400/30'
                : 'bg-white/5 border-white/10'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-white">Initié</h3>
                {(currentLevelName === 'Simple' || hasProduct('initie')) && (
                  <CheckCircle className="w-4 h-4 text-green-400" />
                )}
              </div>
              <ul className="text-xs text-white/70 space-y-1.5">
                <li>✓ Lecture PDF personnalisée</li>
                <li>✓ Accès gratuit (100 premiers)</li>
              </ul>
              <div className="mt-3 pt-3 border-t border-white/10">
                <span className={`text-xs font-medium ${
                  currentLevelName === 'Simple' || hasProduct('initie') ? 'text-green-400' : 'text-white/40'
                }`}>
                  {currentLevelName === 'Simple' || hasProduct('initie') ? 'Disponible' : 'Gratuit'}
                </span>
              </div>
            </div>

            {/* Niveau Mystique */}
            <div className={`p-4 rounded-xl border transition-all ${
              currentLevelName === 'Intuitive' || hasProduct('mystique')
                ? 'bg-purple-400/10 border-purple-400/30'
                : 'bg-white/5 border-white/10'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-white">Mystique</h3>
                {(currentLevelName === 'Intuitive' || hasProduct('mystique')) && (
                  <CheckCircle className="w-4 h-4 text-purple-400" />
                )}
              </div>
              <ul className="text-xs text-white/70 space-y-1.5">
                <li>✓ Lecture PDF + Audio</li>
                <li>✓ Voix personnalisée</li>
              </ul>
              <div className="mt-3 pt-3 border-t border-white/10">
                <span className={`text-xs font-medium ${
                  currentLevelName === 'Intuitive' || hasProduct('mystique') ? 'text-purple-400' : 'text-white/40'
                }`}>
                  {currentLevelName === 'Intuitive' || hasProduct('mystique') ? 'Disponible' : '47€'}
                </span>
              </div>
            </div>

            {/* Niveau Profond */}
            <div className={`p-4 rounded-xl border transition-all ${
              currentLevelName === 'Alchimique' || hasProduct('profond')
                ? 'bg-blue-400/10 border-blue-400/30'
                : 'bg-white/5 border-white/10'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-white">Profond</h3>
                {(currentLevelName === 'Alchimique' || hasProduct('profond')) && (
                  <CheckCircle className="w-4 h-4 text-blue-400" />
                )}
              </div>
              <ul className="text-xs text-white/70 space-y-1.5">
                <li>✓ PDF + Audio + Mandala</li>
                <li>✓ Art sacré personnalisé</li>
              </ul>
              <div className="mt-3 pt-3 border-t border-white/10">
                <span className={`text-xs font-medium ${
                  currentLevelName === 'Alchimique' || hasProduct('profond') ? 'text-blue-400' : 'text-white/40'
                }`}>
                  {currentLevelName === 'Alchimique' || hasProduct('profond') ? 'Disponible' : '67€'}
                </span>
              </div>
            </div>

            {/* Niveau Intégral */}
            <div className="p-4 rounded-xl border bg-white/5 border-white/10 opacity-60">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-white">Intégral</h3>
                <span className="text-xs px-2 py-0.5 bg-amber-400/20 text-amber-400 rounded">Bientôt</span>
              </div>
              <ul className="text-xs text-white/70 space-y-1.5">
                <li>✓ Tout + Rituel personnalisé</li>
                <li>✓ Suivi 30 jours</li>
              </ul>
              <div className="mt-3 pt-3 border-t border-white/10">
                <span className="text-xs font-medium text-white/40">
                  🔒 Bientôt disponible
                </span>
              </div>
            </div>
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
                  <div className="w-full px-4 py-3 rounded-xl border bg-white/5 border-white/10 text-white/90 whitespace-pre-wrap">
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
                  <div className="relative bg-white/5 border border-amber-400/20 rounded-xl p-4">
                    <img src={profile?.facePhotoUrl || ''} alt="Photo de visage" className="w-full h-48 object-cover rounded-lg mb-3" />
                    <div className="flex items-center justify-between">
                      <p className="text-white/80 text-xs">Aperçu</p>
                      <button
                        onClick={() => handleReplacePhoto('face_photo')}
                        disabled={uploadingFace}
                        className="px-3 py-2 rounded-lg bg-amber-400/20 text-amber-400 border border-amber-400/30 hover:bg-amber-400/30 transition text-xs"
                      >
                        {uploadingFace ? 'Envoi...' : 'Remplacer'}
                      </button>
                    </div>
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
                  <div className="relative bg-white/5 border border-purple-400/20 rounded-xl p-4">
                    <img src={profile?.palmPhotoUrl || ''} alt="Photo de paume" className="w-full h-48 object-cover rounded-lg mb-3" />
                    <div className="flex items-center justify-between">
                      <p className="text-white/80 text-xs">Aperçu</p>
                      <button
                        onClick={() => handleReplacePhoto('palm_photo')}
                        disabled={uploadingPalm}
                        className="px-3 py-2 rounded-lg bg-purple-400/20 text-purple-400 border border-purple-400/30 hover:bg-purple-400/30 transition text-xs"
                      >
                        {uploadingPalm ? 'Envoi...' : 'Remplacer'}
                      </button>
                    </div>
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
          
          <div className="grid md:grid-cols-4 gap-4">
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
              onClick={() => window.location.href = '/sanctuaire/synthesis'}
              className="flex items-center gap-3 p-4 bg-amber-400/10 border border-amber-400/20 rounded-xl text-amber-400 hover:bg-amber-400/20 transition-all"
            >
              <Target className="w-5 h-5" />
              <div className="text-left">
                <div className="font-medium">Synthèse</div>
                <div className="text-xs text-white/60">Accéder à votre synthèse</div>
              </div>
            </button>
            
            {(hasProduct('mystique') || hasCapability('sanctuaire.sphere.rituals')) && (
              <button 
                onClick={() => window.location.href = '/sanctuaire/rituals'}
                className="flex items-center gap-3 p-4 bg-purple-400/10 border border-purple-400/20 rounded-xl text-purple-400 hover:bg-purple-400/20 transition-all"
              >
                <Target className="w-5 h-5" />
                <div className="text-left">
                  <div className="font-medium">Rituels</div>
                  <div className="text-xs text-white/60">Pratiques personnalisées</div>
                </div>
              </button>
            )}
            
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




