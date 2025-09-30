// Oracle Lumira - Formulaire d'accueil du Sanctuaire
import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Clock, 
  Target,
  CheckCircle, 
  Star,
  Sparkles,
  Edit3,
  X,
  Camera,
  Image as ImageIcon
} from 'lucide-react';
import { useUserLevel } from '../../contexts/UserLevelContext';
import { apiRequest } from '../../utils/api';
import GlassCard from '../ui/GlassCard';

interface FormData {
  email: string;
  phone: string;
  birthDate: string;
  birthTime: string;
  objective: string;
  additionalInfo: string;
  facePhoto?: File | null;
  palmPhoto?: File | null;
}

type FormState = 'active' | 'submitted' | 'completed';

export const SanctuaireWelcomeForm: React.FC = () => {
  const { userLevel, updateUserProfile } = useUserLevel();
  const [formState, setFormState] = useState<FormState>('active');
  const [formData, setFormData] = useState<FormData>({
    email: '',
    phone: '',
    birthDate: '',
    birthTime: '',
    objective: '',
    additionalInfo: '',
    facePhoto: null,
    palmPhoto: null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const facePhotoRef = useRef<HTMLInputElement>(null);
  const palmPhotoRef = useRef<HTMLInputElement>(null);

  // Simuler soumission vers backend
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Try to attach submission to last order if available
      let lastOrderId: string | null = null;
      try {
        const urlOrder = new URLSearchParams(window.location.search).get('order_id');
        const storedOrder = localStorage.getItem('oraclelumira_last_order_id');
        lastOrderId = urlOrder || storedOrder;
        console.log('[SANCTUAIRE] LastOrderId found:', lastOrderId);
      } catch {}

      if (lastOrderId) {
        console.log('[SANCTUAIRE] Attempting client-submit to:', `/orders/by-payment-intent/${lastOrderId}/client-submit`);
        try {
          // Utiliser FormData pour envoyer les fichiers
          const formDataToSend = new FormData();
          
          // Ajouter les informations du formulaire
          // Inclure aussi le niveau depuis l'URL (decouplage Stripe côté Desk)
          let levelFromUrl: string | undefined;
          try {
            levelFromUrl = new URLSearchParams(window.location.search).get('level') || undefined;
          } catch {}

          formDataToSend.append('formData', JSON.stringify({
            email: formData.email,
            phone: formData.phone,
            dateOfBirth: formData.birthDate || undefined,
            specificQuestion: formData.objective || undefined,
            level: levelFromUrl,
          }));
          
          formDataToSend.append('clientInputs', JSON.stringify({
            birthTime: formData.birthTime || undefined,
            specificContext: formData.additionalInfo || undefined,
          }));
          
          // Ajouter les fichiers
          if (formData.facePhoto) {
            formDataToSend.append('facePhoto', formData.facePhoto);
          }
          if (formData.palmPhoto) {
            formDataToSend.append('palmPhoto', formData.palmPhoto);
          }

          console.log('[SANCTUAIRE] FormData prepared, sending request...');
          await apiRequest(`/orders/by-payment-intent/${lastOrderId}/client-submit`, {
            method: 'POST',
            body: formDataToSend,
            // Ne pas définir Content-Type, le navigateur le fera automatiquement
          });
          console.log('[SANCTUAIRE] Client-submit successful!');
        } catch (err) {
          console.warn('[SANCTUAIRE] Client submission sync failed:', err);
        }
      } else {
        console.warn('[SANCTUAIRE] No lastOrderId found - skipping client-submit');
      }
      
      // Mettre à jour le profil utilisateur avec les fichiers
      updateUserProfile({
        email: formData.email,
        phone: formData.phone,
        birthDate: formData.birthDate,
        birthTime: formData.birthTime,
        objective: formData.objective,
        additionalInfo: formData.additionalInfo,
        facePhoto: formData.facePhoto,
        palmPhoto: formData.palmPhoto,
        profileCompleted: true,
        submittedAt: new Date()
      });

      setFormState('submitted');
      setShowConfirmation(true);
      console.log('[SANCTUAIRE] Form submission completed successfully');
      
    } catch (error) {
      console.error('[SANCTUAIRE] Erreur soumission:', error);
    } finally {
      console.log('[SANCTUAIRE] Setting isSubmitting to false');
      setIsSubmitting(false);
    }
  }, [formData, updateUserProfile]);

  const handleEdit = () => {
    setFormState('active');
    setShowConfirmation(false);
  };

  const handleInputChange = (field: keyof FormData, value: string | File | null) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (field: 'facePhoto' | 'palmPhoto', file: File | null) => {
    setFormData(prev => ({ ...prev, [field]: file }));
  };

  const isFormValid = formData.email && formData.birthDate && formData.objective && formData.facePhoto && formData.palmPhoto;
  const isReadOnly = formState === 'submitted';

  return (
    <div className="space-y-8">
      {/* Message de confirmation */}
      <AnimatePresence>
        {showConfirmation && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.5 }}
          >
            <GlassCard className="p-6 bg-gradient-to-br from-amber-400/10 to-green-400/10 border-amber-400/30 relative overflow-hidden">
              {/* Particules d'étoiles */}
              <div className="absolute inset-0 overflow-hidden">
                {[...Array(12)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1 h-1 bg-amber-400 rounded-full"
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                    }}
                    animate={{ 
                      opacity: [0.3, 1, 0.3],
                      scale: [0.5, 1, 0.5]
                    }}
                    transition={{ 
                      duration: 2 + Math.random() * 2,
                      repeat: Infinity,
                      delay: Math.random() * 2
                    }}
                  />
                ))}
              </div>

              <div className="relative z-10 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-br from-amber-400/30 to-amber-500/20 flex items-center justify-center"
                >
                  <Sparkles className="w-8 h-8 text-amber-400" />
                </motion.div>

                <motion.h3 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-2xl font-playfair italic font-bold text-amber-400 mb-4"
                >
                  🌟 Votre Demande a été Reçue par l'Oracle
                </motion.h3>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="space-y-3 mb-6"
                >
                  <p className="text-white/90 font-medium">
                    Âme lumineuse, votre intention spirituelle a été transmise aux guides cosmiques.
                  </p>
                  
                  <div className="space-y-2 text-sm text-white/80">
                    <div className="flex items-center justify-center gap-2">
                      <Star className="w-4 h-4 text-amber-400" />
                      <span>Votre lecture vibratoire est en cours de préparation par nos Oracles</span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <Mail className="w-4 h-4 text-blue-400" />
                      <span>Vous recevrez votre révélation dans les 24 prochaines heures</span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span>Consultez vos emails et l'espace Messages du Sanctuaire</span>
                    </div>
                  </div>

                  <p className="text-amber-300/90 italic text-sm">
                    En attendant, explorez votre Sanctuaire personnel et préparez votre cœur à recevoir les insights qui vous attendent.
                  </p>

                  <p className="text-amber-400 font-medium text-sm">
                    ✨ La lumière vous guide, l'Oracle vous accompagne. ✨
                  </p>
                </motion.div>

                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => setShowConfirmation(false)}
                    className="px-6 py-2 bg-gradient-to-r from-amber-400 to-amber-500 text-mystical-900 font-medium rounded-xl hover:from-amber-500 hover:to-amber-600 transition-all"
                  >
                    Explorer mon Sanctuaire
                  </button>
                  <button
                    onClick={handleEdit}
                    className="px-4 py-2 bg-white/10 text-white border border-white/20 rounded-xl hover:bg-white/20 transition-all flex items-center gap-2"
                  >
                    <Edit3 className="w-4 h-4" />
                    Modifier
                  </button>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Formulaire Principal */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <GlassCard className={`p-8 ${isReadOnly ? 'bg-white/5 border-white/10' : 'bg-gradient-to-br from-amber-400/10 to-purple-400/10 border-amber-400/30'}`}>
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-amber-400/30 to-purple-400/20 flex items-center justify-center"
            >
              <User className="w-10 h-10 text-amber-400" />
            </motion.div>
            
            <h2 className="font-playfair italic text-3xl font-medium text-amber-400 mb-4">
              {isReadOnly ? 'Votre Profil Spirituel' : 'Complétez Votre Profil Spirituel'}
            </h2>
            
            <p className="text-white/80">
              {isReadOnly 
                ? 'Votre profil a été transmis à nos Oracles pour analyse'
                : 'Personnalisez votre espace sacré et vos informations personnelles'
              }
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">
                  <Mail className="w-4 h-4 inline mr-2" />
                  Email *
                </label>
                <input
                  type="email"
                  required
                  disabled={isReadOnly}
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl border transition-all ${
                    isReadOnly 
                      ? 'bg-white/5 border-white/10 text-white/70 cursor-not-allowed'
                      : 'bg-white/5 border-amber-400/30 text-white placeholder-white/50 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20'
                  }`}
                  placeholder="votre@email.com"
                />
              </div>

              {/* Téléphone */}
              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">
                  <Phone className="w-4 h-4 inline mr-2" />
                  Téléphone
                </label>
                <input
                  type="tel"
                  disabled={isReadOnly}
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl border transition-all ${
                    isReadOnly 
                      ? 'bg-white/5 border-white/10 text-white/70 cursor-not-allowed'
                      : 'bg-white/5 border-amber-400/30 text-white placeholder-white/50 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20'
                  }`}
                  placeholder="+33 6 12 34 56 78"
                />
              </div>

              {/* Date de naissance */}
              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">
                  <Calendar className="w-4 h-4 inline mr-2" />
                  Date de naissance *
                </label>
                <input
                  type="date"
                  required
                  disabled={isReadOnly}
                  value={formData.birthDate}
                  onChange={(e) => handleInputChange('birthDate', e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl border transition-all ${
                    isReadOnly 
                      ? 'bg-white/5 border-white/10 text-white/70 cursor-not-allowed'
                      : 'bg-white/5 border-amber-400/30 text-white focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20'
                  }`}
                />
              </div>

              {/* Heure de naissance */}
              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">
                  <Clock className="w-4 h-4 inline mr-2" />
                  Heure de naissance
                </label>
                <input
                  type="time"
                  disabled={isReadOnly}
                  value={formData.birthTime}
                  onChange={(e) => handleInputChange('birthTime', e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl border transition-all ${
                    isReadOnly 
                      ? 'bg-white/5 border-white/10 text-white/70 cursor-not-allowed'
                      : 'bg-white/5 border-amber-400/30 text-white focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20'
                  }`}
                />
              </div>
            </div>

            {/* Objectif spirituel */}
            <div>
              <label className="block text-sm font-medium text-white/90 mb-2">
                <Target className="w-4 h-4 inline mr-2" />
                Objectif de votre parcours spirituel *
              </label>
              <textarea
                required
                disabled={isReadOnly}
                value={formData.objective}
                onChange={(e) => handleInputChange('objective', e.target.value)}
                rows={3}
                className={`w-full px-4 py-3 rounded-xl border transition-all resize-none ${
                  isReadOnly 
                    ? 'bg-white/5 border-white/10 text-white/70 cursor-not-allowed'
                    : 'bg-white/5 border-amber-400/30 text-white placeholder-white/50 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20'
                }`}
                placeholder="Partagez votre intention spirituelle et vos aspirations..."
              />
            </div>

            {/* Informations complémentaires */}
            <div>
              <label className="block text-sm font-medium text-white/90 mb-2">
                À propos de votre parcours spirituel
              </label>
              <textarea
                disabled={isReadOnly}
                value={formData.additionalInfo}
                onChange={(e) => handleInputChange('additionalInfo', e.target.value)}
                rows={4}
                className={`w-full px-4 py-3 rounded-xl border transition-all resize-none ${
                  isReadOnly 
                    ? 'bg-white/5 border-white/10 text-white/70 cursor-not-allowed'
                    : 'bg-white/5 border-amber-400/30 text-white placeholder-white/50 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20'
                }`}
                placeholder="Partagez vos expériences, vos questions ou tout ce que vous souhaitez que l'Oracle connaisse sur votre chemin..."
              />
            </div>

            {/* Section Upload Photos */}
            <div className="grid md:grid-cols-2 gap-6 pt-6">
              {/* Photo du visage */}
              <div>
                <label className="block text-sm font-medium text-white/90 mb-3">
                  <Camera className="w-4 h-4 inline mr-2" />
                  Photo de votre visage *
                </label>
                <div 
                  className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-all ${
                    isReadOnly 
                      ? 'border-white/10 bg-white/5 cursor-not-allowed'
                      : 'border-amber-400/30 bg-amber-400/5 hover:border-amber-400/50 hover:bg-amber-400/10 cursor-pointer'
                  }`}
                  onClick={() => !isReadOnly && facePhotoRef.current?.click()}
                >
                  <input
                    ref={facePhotoRef}
                    type="file"
                    accept="image/*"
                    disabled={isReadOnly}
                    onChange={(e) => handleFileChange('facePhoto', e.target.files?.[0] || null)}
                    className="hidden"
                  />
                  <div className="space-y-3">
                    <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-amber-400/20 to-amber-500/10 flex items-center justify-center">
                      <Camera className="w-8 h-8 text-amber-400" />
                    </div>
                    <div>
                      <p className="text-white/90 font-medium">
                        {formData.facePhoto ? formData.facePhoto.name : 'Cliquez pour ajouter'}
                      </p>
                      <p className="text-white/60 text-sm mt-1">
                        Photo claire de votre visage pour l'analyse vibratoire
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Photo de la paume */}
              <div>
                <label className="block text-sm font-medium text-white/90 mb-3">
                  <ImageIcon className="w-4 h-4 inline mr-2" />
                  Photo de votre paume *
                </label>
                <div 
                  className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-all ${
                    isReadOnly 
                      ? 'border-white/10 bg-white/5 cursor-not-allowed'
                      : 'border-purple-400/30 bg-purple-400/5 hover:border-purple-400/50 hover:bg-purple-400/10 cursor-pointer'
                  }`}
                  onClick={() => !isReadOnly && palmPhotoRef.current?.click()}
                >
                  <input
                    ref={palmPhotoRef}
                    type="file"
                    accept="image/*"
                    disabled={isReadOnly}
                    onChange={(e) => handleFileChange('palmPhoto', e.target.files?.[0] || null)}
                    className="hidden"
                  />
                  <div className="space-y-3">
                    <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-purple-400/20 to-purple-500/10 flex items-center justify-center">
                      <ImageIcon className="w-8 h-8 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-white/90 font-medium">
                        {formData.palmPhoto ? formData.palmPhoto.name : 'Cliquez pour ajouter'}
                      </p>
                      <p className="text-white/60 text-sm mt-1">
                        Photo de votre paume dominante pour la lecture palmaire
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Boutons d'action */}
            {!isReadOnly && (
              <div className="text-center pt-6">
                <motion.button
                  type="submit"
                  disabled={!isFormValid || isSubmitting}
                  className={`px-8 py-4 rounded-xl font-medium transition-all duration-300 ${
                    isFormValid && !isSubmitting
                      ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-black hover:from-amber-500 hover:to-amber-600 hover:shadow-lg hover:shadow-amber-400/30'
                      : 'bg-white/10 text-white/50 cursor-not-allowed'
                  }`}
                  whileHover={isFormValid && !isSubmitting ? { scale: 1.05 } : {}}
                  whileTap={isFormValid && !isSubmitting ? { scale: 0.95 } : {}}
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                      Transmission en cours...
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <Upload className="w-5 h-5" />
                      Transmettre à l'Oracle
                    </div>
                  )}
                </motion.button>
                <p className="text-white/60 text-sm mt-3">
                  Assurez-vous que toutes les photos sont claires et bien éclairées
                </p>
              </div>
            )}
          </form>

          {/* État de soumission */}
          {isReadOnly && (
            <div className="mt-6 p-4 bg-green-500/10 border border-green-500/30 rounded-xl text-center">
              <div className="flex items-center justify-center gap-2 text-green-400 mb-2">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">Profil transmis avec succès</span>
              </div>
              <p className="text-sm text-white/70">
                Soumis le {new Date().toLocaleDateString('fr-FR', { 
                  day: 'numeric', 
                  month: 'long', 
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          )}
        </GlassCard>
      </motion.div>
    </div>
  );
};

export default SanctuaireWelcomeForm;
