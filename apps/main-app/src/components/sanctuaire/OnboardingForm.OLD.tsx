/**
 * OnboardingForm - Formulaire d'Onboarding Post-Achat Multi-Étapes
 * 
 * Expérience guidée en 3 étapes pour collecter les données du client :
 * 1. Naissance : Date, heure, lieu de naissance
 * 2. Intention : Question spécifique, objectif spirituel
 * 3. Photos : Upload photo visage et paume de main
 * 
 * Intelligence :
 * - Pré-remplit automatiquement nom, email depuis useSanctuaire()
 * - Affiche un message de bienvenue personnalisé
 * - Soumet vers /api/orders/by-payment-intent/:id/client-submit
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Star, ChevronRight, ChevronLeft, Upload, Calendar, 
  Clock, MapPin, Sparkles, Image, Hand, Check, Loader2 
} from 'lucide-react';
import { useSanctuaire } from '../../contexts/SanctuaireContext';
import GlassCard from '../ui/GlassCard';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

// =================== TYPES ===================

interface OnboardingFormData {
  // Étape 1 : Naissance
  birthDate: string;
  birthTime: string;
  birthPlace: string;
  
  // Étape 2 : Intention
  specificQuestion: string;
  objective: string;
  
  // Étape 3 : Photos
  facePhoto: File | null;
  palmPhoto: File | null;
}

interface OnboardingFormProps {
  onComplete?: () => void;
}

// =================== COMPOSANT PRINCIPAL ===================

export const OnboardingForm: React.FC<OnboardingFormProps> = ({ onComplete }) => {
  const { user, isAuthenticated } = useSanctuaire();
  
  // ✨ NOUVELLE LOGIQUE : Charger les données depuis le webhook/DB si user vide
  const [customerData, setCustomerData] = useState<{
    email?: string;
    phone?: string;
    firstName?: string;
    lastName?: string;
  }>({});
  
  // État du formulaire
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Données accumulées
  const [formData, setFormData] = useState<OnboardingFormData>({
    birthDate: '',
    birthTime: '',
    birthPlace: '',
    specificQuestion: '',
    objective: '',
    facePhoto: null,
    palmPhoto: null,
  });

  // Récupérer le paymentIntentId depuis localStorage ou URL
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  
  useEffect(() => {
    // Chercher dans localStorage (stocké lors du paiement)
    const storedPI = localStorage.getItem('last_payment_intent_id');
    if (storedPI) {
      setPaymentIntentId(storedPI);
      console.log('[OnboardingForm] PaymentIntentId trouvé:', storedPI);
    } else {
      // Fallback : URL params
      const urlParams = new URLSearchParams(window.location.search);
      const urlPI = urlParams.get('payment_intent');
      if (urlPI) {
        setPaymentIntentId(urlPI);
        console.log('[OnboardingForm] PaymentIntentId depuis URL:', urlPI);
      }
    }
  }, []);

  // 🆕 Charger les données client depuis ProductOrder si user vide
  useEffect(() => {
    if (!paymentIntentId || user?.email) return; // Déjà authentifié

    const loadCustomerData = async () => {
      try {
        console.log('🔍 [OnboardingForm] Chargement données client depuis PaymentIntent:', paymentIntentId);
        
        const response = await fetch(`${API_BASE}/orders/${paymentIntentId}`);
        if (!response.ok) throw new Error('Order not found');
        
        const data = await response.json();
        const order = data.order;
        
        console.log('✅ [OnboardingForm] Données commande chargées:', order);
        
        // Extraire customerEmail/Name/Phone depuis metadata ProductOrder
        if (order.metadata) {
          const email = order.metadata.customerEmail || order.customerEmail || '';
          const name = order.metadata.customerName || '';
          const phone = order.metadata.customerPhone || '';
          
          const nameParts = name.split(' ');
          const firstName = nameParts[0] || '';
          const lastName = nameParts.slice(1).join(' ') || '';
          
          setCustomerData({
            email,
            phone,
            firstName,
            lastName
          });
          
          console.log('✨ [OnboardingForm] Données client extraites:', {
            email,
            firstName,
            lastName,
            phone
          });
        }
      } catch (err) {
        console.error('❌ [OnboardingForm] Erreur chargement données client:', err);
      }
    };

    loadCustomerData();
  }, [paymentIntentId, user]);

  // 🆕 Log des données utilisateur pré-remplies
  useEffect(() => {
    if (user || customerData.email) {
      console.log('[OnboardingForm] Données utilisateur pré-remplies:', {
        email: user?.email || customerData.email,
        firstName: user?.firstName || customerData.firstName,
        lastName: user?.lastName || customerData.lastName,
        phone: customerData.phone, // Only in customerData
        source: user ? 'useSanctuaire' : 'ProductOrder metadata'
      });
    }
  }, [user, customerData]);

  // =================== VALIDATION PAR ÉTAPE ===================
  
  const canProceedToStep2 = () => {
    return formData.birthDate && formData.birthTime && formData.birthPlace;
  };

  const canProceedToStep3 = () => {
    return formData.specificQuestion && formData.objective;
  };

  const canSubmit = () => {
    return formData.facePhoto && formData.palmPhoto;
  };

  // =================== HANDLERS ===================

  const handleNext = () => {
    if (currentStep === 1 && !canProceedToStep2()) {
      setError('Veuillez compléter tous les champs de naissance');
      return;
    }
    if (currentStep === 2 && !canProceedToStep3()) {
      setError('Veuillez partager votre intention');
      return;
    }
    
    setError(null);
    setCurrentStep((prev) => Math.min(prev + 1, 3) as 1 | 2 | 3);
  };

  const handleBack = () => {
    setError(null);
    setCurrentStep((prev) => Math.max(prev - 1, 1) as 1 | 2 | 3);
  };

  const handleFileChange = (field: 'facePhoto' | 'palmPhoto', file: File | null) => {
    setFormData((prev) => ({ ...prev, [field]: file }));
  };

  // =================== SOUMISSION FINALE ===================

  const handleSubmit = async () => {
    if (!canSubmit()) {
      setError('Veuillez uploader les deux photos');
      return;
    }

    if (!paymentIntentId) {
      setError('PaymentIntentId introuvable. Impossible de soumettre.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      console.log('[OnboardingForm] Début soumission vers client-submit');

      // Construire le FormData multipart
      const submitFormData = new FormData();
      
      // Ajouter les fichiers
      if (formData.facePhoto) {
        submitFormData.append('facePhoto', formData.facePhoto);
      }
      if (formData.palmPhoto) {
        submitFormData.append('palmPhoto', formData.palmPhoto);
      }

      // Ajouter les données JSON en string
      const jsonData = {
        email: user?.email || customerData.email || '',
        phone: customerData.phone || '', // Phone uniquement dans customerData
        firstName: user?.firstName || customerData.firstName || '',
        lastName: user?.lastName || customerData.lastName || '',
        dateOfBirth: formData.birthDate,
        birthTime: formData.birthTime,
        birthPlace: formData.birthPlace,
        specificQuestion: formData.specificQuestion,
        objective: formData.objective,
      };

      submitFormData.append('formData', JSON.stringify(jsonData));

      console.log('[OnboardingForm] FormData construit:', {
        facePhoto: !!formData.facePhoto,
        palmPhoto: !!formData.palmPhoto,
        jsonData
      });

      // Appel API vers client-submit
      const response = await fetch(
        `${API_BASE}/orders/by-payment-intent/${paymentIntentId}/client-submit`,
        {
          method: 'POST',
          body: submitFormData,
          // Ne pas définir Content-Type : le navigateur le fera automatiquement pour multipart/form-data
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Erreur serveur' }));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const result = await response.json();
      console.log('[OnboardingForm] Soumission réussie:', result);

      // Marquer la première visite comme terminée
      sessionStorage.removeItem('first_visit');
      localStorage.removeItem('last_payment_intent_id');

      // Callback de complétion
      if (onComplete) {
        onComplete();
      }

    } catch (err: any) {
      console.error('[OnboardingForm] Erreur soumission:', err);
      setError(err.message || 'Erreur lors de la soumission');
    } finally {
      setIsSubmitting(false);
    }
  };

  // =================== RENDU CONDITIONNEL ===================

  if (!isAuthenticated || !user) {
    return null;
  }

  // =================== RENDU PRINCIPAL ===================

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
    >
      <GlassCard className="w-full max-w-2xl bg-mystical-deep-blue/90 border-amber-400/30 p-8">
        
        {/* En-tête avec message de bienvenue personnalisé */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-8"
        >
          <div className="w-16 h-16 bg-gradient-to-br from-amber-400/30 to-purple-400/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Star className="w-8 h-8 text-amber-400" />
          </div>
          <h2 className="text-3xl font-playfair italic text-amber-400 mb-2">
            Bienvenue, {user.firstName} !
          </h2>
          <p className="text-white/70">
            Complétons votre profil spirituel
          </p>
          <p className="text-sm text-white/50 mt-2">
            Vos informations de base sont déjà enregistrées ✨
          </p>
        </motion.div>

        {/* Barre de progression */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                  step === currentStep
                    ? 'bg-amber-400 text-mystical-900 scale-110'
                    : step < currentStep
                    ? 'bg-amber-400/50 text-white'
                    : 'bg-white/10 text-white/40'
                }`}
              >
                {step < currentStep ? <Check className="w-5 h-5" /> : step}
              </div>
              {step < 3 && (
                <div
                  className={`w-12 h-1 mx-2 rounded ${
                    step < currentStep ? 'bg-amber-400/50' : 'bg-white/10'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Contenu des étapes */}
        <AnimatePresence mode="wait">
          {currentStep === 1 && (
            <Step1Naissance
              key="step1"
              formData={formData}
              setFormData={setFormData}
            />
          )}
          {currentStep === 2 && (
            <Step2Intention
              key="step2"
              formData={formData}
              setFormData={setFormData}
            />
          )}
          {currentStep === 3 && (
            <Step3Photos
              key="step3"
              formData={formData}
              handleFileChange={handleFileChange}
            />
          )}
        </AnimatePresence>

        {/* Erreur */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-sm"
          >
            {error}
          </motion.div>
        )}

        {/* Boutons de navigation */}
        <div className="flex items-center justify-between mt-8">
          {currentStep > 1 ? (
            <button
              onClick={handleBack}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-4 py-2 text-white/70 hover:text-white transition-colors disabled:opacity-40"
            >
              <ChevronLeft className="w-5 h-5" />
              <span>Retour</span>
            </button>
          ) : (
            <div />
          )}

          {currentStep < 3 ? (
            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-400 to-amber-500 text-mystical-900 font-semibold rounded-lg hover:from-amber-500 hover:to-amber-600 transition-all shadow-lg hover:shadow-xl"
            >
              <span>Suivant</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!canSubmit() || isSubmitting}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white font-semibold rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Envoi en cours...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>Finaliser</span>
                </>
              )}
            </button>
          )}
        </div>
      </GlassCard>
    </motion.div>
  );
};

// =================== ÉTAPE 1 : NAISSANCE ===================

interface Step1Props {
  formData: OnboardingFormData;
  setFormData: React.Dispatch<React.SetStateAction<OnboardingFormData>>;
}

const Step1Naissance: React.FC<Step1Props> = ({ formData, setFormData }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <h3 className="text-xl font-semibold text-amber-400 flex items-center gap-2">
        <Calendar className="w-6 h-6" />
        Votre Naissance
      </h3>

      <div className="space-y-4">
        <div>
          <label className="block text-sm text-white/70 mb-2">
            Date de naissance
          </label>
          <input
            type="date"
            value={formData.birthDate}
            onChange={(e) => setFormData((prev) => ({ ...prev, birthDate: e.target.value }))}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-amber-400 transition-colors"
            required
          />
        </div>

        <div>
          <label className="block text-sm text-white/70 mb-2">
            Heure de naissance
          </label>
          <div className="relative">
            <Clock className="w-5 h-5 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="time"
              value={formData.birthTime}
              onChange={(e) => setFormData((prev) => ({ ...prev, birthTime: e.target.value }))}
              className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-amber-400 transition-colors"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm text-white/70 mb-2">
            Lieu de naissance (Ville, Pays)
          </label>
          <div className="relative">
            <MapPin className="w-5 h-5 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={formData.birthPlace}
              onChange={(e) => setFormData((prev) => ({ ...prev, birthPlace: e.target.value }))}
              placeholder="Ex: Paris, France"
              className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-amber-400 transition-colors"
              required
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// =================== ÉTAPE 2 : INTENTION ===================

const Step2Intention: React.FC<Step1Props> = ({ formData, setFormData }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <h3 className="text-xl font-semibold text-amber-400 flex items-center gap-2">
        <Sparkles className="w-6 h-6" />
        Votre Intention
      </h3>

      <div className="space-y-4">
        <div>
          <label className="block text-sm text-white/70 mb-2">
            Quelle question vous guide aujourd'hui ?
          </label>
          <textarea
            value={formData.specificQuestion}
            onChange={(e) => setFormData((prev) => ({ ...prev, specificQuestion: e.target.value }))}
            placeholder="Ex: Comment puis-je mieux aligner ma vie professionnelle avec mon chemin spirituel ?"
            rows={4}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-amber-400 transition-colors resize-none"
            required
          />
        </div>

        <div>
          <label className="block text-sm text-white/70 mb-2">
            Quel est votre objectif spirituel ?
          </label>
          <textarea
            value={formData.objective}
            onChange={(e) => setFormData((prev) => ({ ...prev, objective: e.target.value }))}
            placeholder="Ex: Développer mon intuition, trouver ma mission de vie, guérir des blessures du passé..."
            rows={4}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-amber-400 transition-colors resize-none"
            required
          />
        </div>
      </div>
    </motion.div>
  );
};

// =================== ÉTAPE 3 : PHOTOS ===================

interface Step3Props {
  formData: OnboardingFormData;
  handleFileChange: (field: 'facePhoto' | 'palmPhoto', file: File | null) => void;
}

const Step3Photos: React.FC<Step3Props> = ({ formData, handleFileChange }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <h3 className="text-xl font-semibold text-amber-400 flex items-center gap-2">
        <Upload className="w-6 h-6" />
        Vos Photos
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Photo Visage */}
        <PhotoUpload
          label="Photo de votre visage"
          icon={<Image className="w-8 h-8" />}
          file={formData.facePhoto}
          onChange={(file) => handleFileChange('facePhoto', file)}
        />

        {/* Photo Paume */}
        <PhotoUpload
          label="Photo de votre paume"
          icon={<Hand className="w-8 h-8" />}
          file={formData.palmPhoto}
          onChange={(file) => handleFileChange('palmPhoto', file)}
        />
      </div>

      <p className="text-xs text-white/50 text-center">
        Ces photos nous aideront à personnaliser votre lecture spirituelle
      </p>
    </motion.div>
  );
};

// =================== COMPOSANT PHOTO UPLOAD ===================

interface PhotoUploadProps {
  label: string;
  icon: React.ReactNode;
  file: File | null;
  onChange: (file: File | null) => void;
}

const PhotoUpload: React.FC<PhotoUploadProps> = ({ label, icon, file, onChange }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    onChange(selectedFile);
  };

  return (
    <div className="relative">
      <input
        type="file"
        accept="image/*"
        onChange={handleChange}
        className="hidden"
        id={`upload-${label}`}
      />
      <label
        htmlFor={`upload-${label}`}
        className={`block cursor-pointer p-6 border-2 border-dashed rounded-lg transition-all ${
          file
            ? 'border-amber-400/50 bg-amber-400/10'
            : 'border-white/20 bg-white/5 hover:border-amber-400/30 hover:bg-white/10'
        }`}
      >
        <div className="flex flex-col items-center gap-3">
          <div className={`${file ? 'text-amber-400' : 'text-white/40'}`}>
            {icon}
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-white/80">{label}</p>
            {file ? (
              <p className="text-xs text-amber-400 mt-1 flex items-center justify-center gap-1">
                <Check className="w-3 h-3" />
                {file.name}
              </p>
            ) : (
              <p className="text-xs text-white/40 mt-1">Cliquez pour uploader</p>
            )}
          </div>
        </div>
      </label>
    </div>
  );
};

export default OnboardingForm;
