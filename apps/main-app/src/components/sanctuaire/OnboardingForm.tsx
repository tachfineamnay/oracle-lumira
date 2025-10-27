/**
 * OnboardingForm - Formulaire d'Onboarding Refonte 2025
 * 
 * Architecture 4 étapes compacte :
 * 0. BIENVENUE : Affiche données pré-remplies (email, nom, téléphone) en read-only
 * 1. NAISSANCE : Date, heure, lieu (compact)
 * 2. INTENTION : Question spirituelle, objectif (compact)
 * 3. PHOTOS : Upload visage + paume
 * 
 * Fonctionnalités :
 * ✅ Pré-remplissage automatique depuis metadata Stripe
 * ✅ Fallback robuste si useSanctuaire() échoue
 * ✅ Validation progressive par étape
 * ✅ Design compact celeste/stellar
 * ✅ Progress bar 4 steps
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Star, ChevronRight, ChevronLeft, Upload, Calendar, 
  Clock, MapPin, Sparkles, Image, Hand, Check, Loader2,
  Mail, Phone, User
} from 'lucide-react';
import { useSanctuaire } from '../../contexts/SanctuaireContext';
import GlassCard from '../ui/GlassCard';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

// =================== TYPES ===================

interface UserData {
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
}

interface FormData {
  birthDate: string;
  birthTime: string;
  birthPlace: string;
  specificQuestion: string;
  objective: string;
  facePhoto: File | null;
  palmPhoto: File | null;
}

interface OnboardingFormProps {
  onComplete?: () => void;
}

// =================== COMPOSANT PRINCIPAL ===================

export const OnboardingForm: React.FC<OnboardingFormProps> = ({ onComplete }) => {
  const { user, updateProfile, refresh } = useSanctuaire(); // ✅ PASSAGE 11 - Ajouter refresh
  
  // État utilisateur (pré-rempli)
  const [userData, setUserData] = useState<UserData>({
    email: '',
    phone: '',
    firstName: '',
    lastName: ''
  });
  
  const [isLoadingUserData, setIsLoadingUserData] = useState(true);
  
  // État formulaire spirituel
  // CORRECTION CRITIQUE : Démarrer à l'étape 1 si les infos de base sont déjà remplies
  const [currentStep, setCurrentStep] = useState<0 | 1 | 2 | 3>(0);
  const [initialStepSet, setInitialStepSet] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    birthDate: '',
    birthTime: '',
    birthPlace: '',
    specificQuestion: '',
    objective: '',
    facePhoto: null,
    palmPhoto: null,
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  const [uploading, setUploading] = useState<null | 'face' | 'palm'>(null);
  const [uploadedKeys, setUploadedKeys] = useState<{ facePhotoKey?: string; palmPhotoKey?: string }>({});
  const [useDirectUpload, setUseDirectUpload] = useState(true);
  const [uploadProgress, setUploadProgress] = useState<{ face?: number; palm?: number }>({});
  const autoSubmittedRef = useRef(false);
  
  // =================== IMAGE COMPRESSION UTILS ===================
  const readFileAsDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  /**
   * Upload file to S3 using XMLHttpRequest with progress tracking
   * @returns { success: boolean, error?: string }
   */
  const uploadWithProgress = (
    uploadUrl: string,
    file: File,
    onProgress: (percentage: number) => void
  ): Promise<{ success: boolean; error?: string }> => {
    return new Promise((resolve) => {
      const xhr = new XMLHttpRequest();

      // Track upload progress
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percentage = Math.round((e.loaded / e.total) * 100);
          onProgress(percentage);
        }
      });

      // Handle completion
      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve({ success: true });
        } else {
          resolve({ success: false, error: `S3 upload failed (${xhr.status})` });
        }
      });

      // Handle network errors
      xhr.addEventListener('error', () => {
        resolve({ success: false, error: 'Network error during upload' });
      });

      // Handle timeout
      xhr.addEventListener('timeout', () => {
        resolve({ success: false, error: 'Upload timeout' });
      });

      // Configure and send
      xhr.open('PUT', uploadUrl, true);
      xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream');
      xhr.timeout = 120000; // 2 minutes timeout
      xhr.send(file);
    });
  };

  /**
   * Retry wrapper with exponential backoff for upload
   * Retries on network/timeout errors, not on auth/permission errors
   */
  const uploadWithRetry = async (
    uploadUrl: string,
    file: File,
    onProgress: (percentage: number, attempt?: number, maxAttempts?: number) => void
  ): Promise<{ success: boolean; error?: string }> => {
    const maxAttempts = 3;
    const delays = [1000, 2000, 4000]; // Exponential backoff in ms

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      console.log(`[uploadWithRetry] Attempt ${attempt}/${maxAttempts}`);
      
      // Reset progress to 0 on retry attempts
      if (attempt > 1) {
        onProgress(0, attempt, maxAttempts);
      }

      const result = await uploadWithProgress(
        uploadUrl,
        file,
        (percentage) => onProgress(percentage, attempt, maxAttempts)
      );

      // Success - return immediately
      if (result.success) {
        console.log(`[uploadWithRetry] Success on attempt ${attempt}`);
        return result;
      }

      // Check if error is retryable
      const isRetryable = result.error?.includes('Network error') || 
                          result.error?.includes('timeout');

      // Non-retryable error (CORS, 403, etc.) - fail immediately
      if (!isRetryable) {
        console.error(`[uploadWithRetry] Non-retryable error:`, result.error);
        return result;
      }

      // Last attempt failed - return error
      if (attempt === maxAttempts) {
        console.error(`[uploadWithRetry] All ${maxAttempts} attempts failed`);
        return { success: false, error: `Upload failed after ${maxAttempts} attempts: ${result.error}` };
      }

      // Wait before retry with exponential backoff
      const delay = delays[attempt - 1];
      console.log(`[uploadWithRetry] Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }

    return { success: false, error: 'Upload failed (unexpected)' };
  };

  const compressImage = async (
    file: File,
    opts: { maxDimension?: number; quality?: number; targetKB?: number } = {}
  ): Promise<File> => {
    try {
      const isSupportedType = /^(image\/jpeg|image\/png)$/.test(file.type);
      if (!isSupportedType) return file;

      let maxDimension = opts.maxDimension ?? 1400; // px
      let quality = opts.quality ?? 0.8; // JPEG quality
      const targetBytes = Math.max(200, (opts.targetKB ?? 900)) * 1024; // par défaut 900KB

      // Skip compression for small files (< 3MB)
      if (file.size <= 3 * 1024 * 1024) return file;

      const dataUrl = await readFileAsDataURL(file);
      const img = new Image();
      const loaded: Promise<void> = new Promise((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Image load error'));
      });
      img.src = dataUrl;
      await loaded;

      const { width, height } = img;
      const scale0 = Math.min(1, maxDimension / Math.max(width, height));
      let targetW = Math.max(1, Math.round(width * scale0));
      let targetH = Math.max(1, Math.round(height * scale0));

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return file;

      const encode = async (): Promise<Blob | null> => new Promise((resolve) => {
        canvas.toBlob((b) => resolve(b), 'image/jpeg', quality);
      });

      // Toujours sortir en JPEG (photos), plus compact que PNG
      let attempt = 0;
      let blob: Blob | null = null;
      while (attempt < 6) {
        canvas.width = targetW;
        canvas.height = targetH;
        ctx.clearRect(0, 0, targetW, targetH);
        ctx.drawImage(img, 0, 0, targetW, targetH);
        blob = await encode();
        if (!blob) break;
        if (blob.size <= targetBytes) break;

        // Réduire progressivement la qualité, puis la taille si nécessaire
        if (quality > 0.55) {
          quality -= 0.1;
        } else if (Math.max(targetW, targetH) > 900) {
          targetW = Math.round(targetW * 0.9);
          targetH = Math.round(targetH * 0.9);
        } else {
          break;
        }
        attempt++;
      }

      if (!blob) return file;

      let name = file.name.replace(/\.(png)$/i, '.jpg');
      if (!/\.(jpe?g)$/i.test(name)) name = `${name}.jpg`;
      return new File([blob], name, { type: 'image/jpeg', lastModified: Date.now() });
    } catch {
      return file; // fail-safe
    }
  };
  
  // =================== CHARGEMENT PAYMENT INTENT ===================
  // PASSAGE 6 - P0 : CORRECTION CLÉ LOCALSTORAGE
  // La clé doit correspondre à celle définie dans ConfirmationTempleSPA.tsx ligne 102
  
  useEffect(() => {
    // 1. Priorité : localStorage (défini par ConfirmationTempleSPA)
    const storedPI = localStorage.getItem('oraclelumira_last_payment_intent_id');
    if (storedPI) {
      console.log('✅ [OnboardingForm] PaymentIntentId chargé depuis localStorage:', storedPI);
      setPaymentIntentId(storedPI);
      return;
    }
    
    // 2. Fallback : URL params
    const urlParams = new URLSearchParams(window.location.search);
    const urlPI = urlParams.get('payment_intent');
    if (urlPI) {
      console.log('✅ [OnboardingForm] PaymentIntentId chargé depuis URL:', urlPI);
      setPaymentIntentId(urlPI);
      return;
    }
    
    // 3. Dernier fallback : sessionStorage (ancien code)
    const sessionPI = sessionStorage.getItem('sanctuaire_email');
    if (sessionPI) {
      console.log('⚠️ [OnboardingForm] PaymentIntentId depuis sessionStorage (legacy):', sessionPI);
      // Note: ceci ne devrait pas arriver car sessionStorage stocke l'email, pas le PI
    } else {
      console.warn('❌ [OnboardingForm] Aucun PaymentIntentId trouvé !');
    }
  }, []);
  
  // =================== CHARGEMENT DONNÉES UTILISATEUR ===================
  
  useEffect(() => {
    const loadUserData = async () => {
      try {
        // 1️⃣ Tenter useSanctuaire() d'abord
        if (user?.email) {
          console.log('✅ [OnboardingForm] Données depuis useSanctuaire()');
          setUserData({
            email: user.email,
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            phone: user.phone || ''
          });
          setIsLoadingUserData(false);
          return;
        }
        
        // 2️⃣ Fallback : ProductOrder metadata
        if (paymentIntentId) {
          console.log('🔍 [OnboardingForm] Chargement depuis ProductOrder:', paymentIntentId);
          
          const response = await fetch(`${API_BASE}/orders/${paymentIntentId}`);
          if (!response.ok) throw new Error('Order not found');
          
          const data = await response.json();
          console.log('📦 [OnboardingForm] Réponse API reçue:', data);
          
          // Vérifier la structure de la réponse
          const order = data.order || data;
          const metadata = order?.metadata || {};
          
          console.log('📋 [OnboardingForm] Metadata extraite:', metadata);
          
          const customerName = metadata.customerName || '';
          const nameParts = customerName.split(' ');
          
          setUserData({
            email: metadata.customerEmail || '',
            phone: metadata.customerPhone || '',
            firstName: nameParts[0] || '',
            lastName: nameParts.slice(1).join(' ') || ''
          });
          
          console.log('✅ [OnboardingForm] Données chargées:', {
            email: metadata.customerEmail,
            phone: metadata.customerPhone,
            name: customerName
          });
        }
      } catch (err) {
        console.error('❌ [OnboardingForm] Erreur chargement données:', err);
      } finally {
        setIsLoadingUserData(false);
      }
    };
    
    loadUserData();
  }, [user, paymentIntentId]);
  
  // =================== AJUSTEMENT STEPPER (POST-CHECKOUT) ===================
  
  useEffect(() => {
    if (!isLoadingUserData && !initialStepSet) {
      // LOGIQUE CORRIGÉE : Détecter les étapes complétées pour positionner le Stepper correctement
      const hasBasicInfo = !!(userData.email && userData.firstName);
      const hasBirthInfo = !!(formData.birthDate && formData.birthTime && formData.birthPlace);
      const hasIntentionInfo = !!(formData.specificQuestion && formData.objective);
      
      // PASSAGE 13 - P0 : Logs de debug pour diagnostic
      console.log('🔍 [OnboardingForm] Ajustement stepper:', {
        hasBasicInfo,
        hasBirthInfo,
        hasIntentionInfo,
        userData,
        formData: {
          birthDate: formData.birthDate,
          birthTime: formData.birthTime,
          birthPlace: formData.birthPlace,
          specificQuestion: formData.specificQuestion,
          objective: formData.objective
        }
      });
      
      // Déterminer l'étape de démarrage en fonction des données complétées
      let startStep: 0 | 1 | 2 | 3 = 0;
      
      if (hasBasicInfo) {
        startStep = 1; // Sauter Bienvenue, commencer à Naissance (Étape 2/4)
        console.log('✨ [OnboardingForm] Infos de base présentes → Démarrage à l\'Étape 2/4 (Naissance)');
      }
      
      if (hasBasicInfo && hasBirthInfo) {
        startStep = 2; // Commencer à Intention (Étape 3/4)
        console.log('✨ [OnboardingForm] Naissance complétée → Démarrage à l\'Étape 3/4 (Intention)');
      }
      
      if (hasBasicInfo && hasBirthInfo && hasIntentionInfo) {
        startStep = 3; // Commencer à Photos (Étape 4/4)
        console.log('✨ [OnboardingForm] Intention complétée → Démarrage à l\'Étape 4/4 (Photos)');
      }
      
      if (!hasBasicInfo) {
        console.log('ℹ️ [OnboardingForm] Profil vide → Démarrage à l\'Étape 1/4 (Bienvenue)');
      }
      
      setCurrentStep(startStep);
      setInitialStepSet(true);
    }
  }, [isLoadingUserData, userData, formData.birthDate, formData.birthTime, formData.birthPlace, formData.specificQuestion, formData.objective, initialStepSet]);
  // PASSAGE 13 - P0 : userData déjà dans les dépendances (ligne 400), ajout logs debug
  
  // =================== VALIDATION PAR ÉTAPE ===================
  
  const canProceed = (): boolean => {
    switch (currentStep) {
      case 0: return true; // Bienvenue, toujours OK
      case 1: return !!(formData.birthDate && formData.birthTime && formData.birthPlace);
      case 2: return !!(formData.specificQuestion && formData.objective);
      case 3: return !!(formData.facePhoto && formData.palmPhoto);
      default: return false;
    }
  };
  
  // =================== NAVIGATION ===================
  
  const handleNext = () => {
    if (!canProceed()) {
      setError('Veuillez compléter tous les champs requis');
      return;
    }
    setError(null);
    setCurrentStep((prev) => Math.min(prev + 1, 3) as 0 | 1 | 2 | 3);
  };
  
  const handleBack = () => {
    setError(null);
    setCurrentStep((prev) => Math.max(prev - 1, 0) as 0 | 1 | 2 | 3);
  };
  
  // =================== SOUMISSION ===================
  
  const handleSubmit = async () => {
    if (!canProceed()) {
      setError('Veuillez uploader les deux photos');
      return;
    }
    
    if (!paymentIntentId) {
      setError('PaymentIntentId manquant. Impossible de soumettre.');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      const jsonData = {
        email: userData.email,
        phone: userData.phone,
        firstName: userData.firstName,
        lastName: userData.lastName,
        dateOfBirth: formData.birthDate,
        birthTime: formData.birthTime,
        birthPlace: formData.birthPlace,
        specificQuestion: formData.specificQuestion,
        objective: formData.objective,
      };
      const hasS3Keys = useDirectUpload && uploadedKeys.facePhotoKey && uploadedKeys.palmPhotoKey;
      let response: Response;

      if (hasS3Keys) {
        const payload = { formData: jsonData, uploadedKeys };
        response = await fetch(
          `${API_BASE}/orders/by-payment-intent/${paymentIntentId}/client-submit`,
          { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }
        );
      } else {
        const submitFormData = new FormData();
        if (formData.facePhoto) submitFormData.append('facePhoto', formData.facePhoto);
        if (formData.palmPhoto) submitFormData.append('palmPhoto', formData.palmPhoto);
        submitFormData.append('formData', JSON.stringify(jsonData));
        response = await fetch(
          `${API_BASE}/orders/by-payment-intent/${paymentIntentId}/client-submit`,
          { method: 'POST', body: submitFormData }
        );
      }
      
      if (!response.ok) {
        if (response.status === 413) {
          setError('Vos fichiers sont trop volumineux (max 1GB). Compressez vos photos puis réessayez.');
          return;
        }
        const errorData = await response.json().catch(() => ({ error: `Erreur serveur (HTTP ${response.status})` }));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }
      
      console.log('✅ [OnboardingForm] Soumission réussie');
      
      // ✨ CRITIQUE : Marquer le profil comme complété dans SanctuaireContext
      await updateProfile({
        birthDate: formData.birthDate,
        birthTime: formData.birthTime,
        birthPlace: formData.birthPlace,
        specificQuestion: formData.specificQuestion,
        objective: formData.objective,
        profileCompleted: true,
        submittedAt: new Date(),
      });
      
      console.log('✨ [OnboardingForm] profileCompleted marqué à true dans SanctuaireContext');
      
      // PASSAGE 11 - P0 CRITIQUE : Forcer rafraîchissement pour afficher dashboard
      console.log('🔄 [OnboardingForm] Rafraîchissement du profil...');
      await refresh(); // ✅ Recharger profile depuis l'API
      console.log('✅ [OnboardingForm] Profil rafraîchi avec succès');
      
      sessionStorage.removeItem('first_visit');
      localStorage.removeItem('last_payment_intent_id');
      
      if (onComplete) onComplete();
      
    } catch (err: any) {
      console.error('❌ [OnboardingForm] Erreur:', err);
      setError(err.message || 'Erreur lors de la soumission');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Déduire un content-type fiable selon file/type/extension
  const deriveContentType = (file: File): string => {
    if (file.type) return file.type;
    const name = (file as any)?.name ? String((file as any).name).toLowerCase() : '';
    if (name.endsWith('.jpg') || name.endsWith('.jpeg')) return 'image/jpeg';
    if (name.endsWith('.png')) return 'image/png';
    if (name.endsWith('.webp')) return 'image/webp';
    if (name.endsWith('.gif')) return 'image/gif';
    if (name.endsWith('.heic')) return 'image/heic';
    if (name.endsWith('.heif')) return 'image/heif';
    if (name.endsWith('.tif') || name.endsWith('.tiff')) return 'image/tiff';
    if (name.endsWith('.bmp')) return 'image/bmp';
    return 'application/octet-stream';
  };

  // Helper: upload un fichier vers S3 et retourne la clé
  const uploadToS3 = async (file: File, logicalType: 'face_photo' | 'palm_photo'): Promise<string> => {
    const contentType = deriveContentType(file);
    const originalName = ((file as any)?.name) || `${logicalType}.bin`;

    const presign = await fetch(`${API_BASE}/uploads/presign`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: logicalType, contentType, originalName })
    });
    if (!presign.ok) {
      const err = await presign.json().catch(() => ({}));
      throw new Error(err.error || `Presign failed (${presign.status})`);
    }
    const { uploadUrl, key } = await presign.json();

    const putRes = await fetch(uploadUrl, {
      method: 'PUT',
      headers: { 'Content-Type': contentType },
      body: file
    });
    if (!putRes.ok) {
      throw new Error(`S3 upload failed (${putRes.status})`);
    }
    return key as string;
  };

  // Orchestration: garantir deux uploads puis soumettre au backend
  const handleFinalize = async () => {
    const faceFile = formData.facePhoto;
    const palmFile = formData.palmPhoto;
    if (!faceFile || !palmFile) {
      console.error('[OnboardingForm] Tentative de soumission sans les deux photos.');
      setError('Veuillez sélectionner vos deux photos (visage et paume).');
      return;
    }

    if (!paymentIntentId) {
      setError('PaymentIntentId manquant. Impossible de soumettre.');
      return;
    }

    setIsSubmitting(true);
    try {
      console.log('[OnboardingForm] Démarrage de la soumission... Upload des deux photos en parallèle.');

      // Si des clés existent déjà (uploads déjà faits), on ne ré-upload pas
      let faceKey = uploadedKeys.facePhotoKey;
      let palmKey = uploadedKeys.palmPhotoKey;

      const tasks: Promise<void>[] = [];
      if (!faceKey) {
        tasks.push(uploadToS3(faceFile, 'face_photo').then(k => { faceKey = k; }));
      }
      if (!palmKey) {
        tasks.push(uploadToS3(palmFile, 'palm_photo').then(k => { palmKey = k; }));
      }
      if (tasks.length > 0) {
        await Promise.all(tasks);
      }

      if (!faceKey || !palmKey) {
        throw new Error('Impossible de récupérer les clés S3 des photos.');
      }

      // Construire la charge utile finale
      const jsonData = {
        email: userData.email,
        phone: userData.phone,
        firstName: userData.firstName,
        lastName: userData.lastName,
        dateOfBirth: formData.birthDate,
        birthTime: formData.birthTime,
        birthPlace: formData.birthPlace,
        specificQuestion: formData.specificQuestion,
        objective: formData.objective,
      };
      const payload = {
        formData: jsonData,
        uploadedKeys: { facePhotoKey: faceKey, palmPhotoKey: palmKey }
      };

      console.log('[OnboardingForm] Envoi des données finales au backend...');
      const response = await fetch(
        `${API_BASE}/orders/by-payment-intent/${paymentIntentId}/client-submit`,
        { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: `Erreur serveur (HTTP ${response.status})` }));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      console.log('✅ [OnboardingForm] Flux complet terminé avec succès !');

      // Success path : marquer le profil comme complété
      await updateProfile({
        birthDate: formData.birthDate,
        birthTime: formData.birthTime,
        birthPlace: formData.birthPlace,
        specificQuestion: formData.specificQuestion,
        objective: formData.objective,
        profileCompleted: true,
        submittedAt: new Date(),
      });
      
      // PASSAGE 11 - P0 CRITIQUE : Forcer rafraîchissement pour afficher dashboard
      console.log('🔄 [OnboardingForm] Rafraîchissement du profil...');
      await refresh(); // ✅ Recharger profile depuis l'API
      console.log('✅ [OnboardingForm] Profil rafraîchi avec succès');
      
      sessionStorage.removeItem('first_visit');
      // PASSAGE 6 - P0 : Nettoyer la CLÉ CORRECTE du localStorage
      localStorage.removeItem('oraclelumira_last_payment_intent_id');
      if (onComplete) onComplete();
    } catch (e: any) {
      console.error('❌ [OnboardingForm] Une erreur est survenue durant le processus de soumission final:', e);
      setError(e?.message || 'Erreur lors de la soumission finale');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Soumission désormais déclenchée explicitement par l'utilisateur via le bouton "Finaliser".
  
  // =================== RENDU ===================
  
  if (isLoadingUserData) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
      </div>
    );
  }
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
    >
      <GlassCard className="w-full max-w-2xl bg-cosmic-deep/95 border-purple-400/30 p-6 max-h-[90vh] overflow-y-auto">
        
        {/* En-tête */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-6"
        >
          <div className="w-12 h-12 bg-gradient-to-br from-purple-400/30 to-blue-400/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <Star className="w-6 h-6 text-purple-400" />
          </div>
          <h2 className="text-2xl font-playfair italic text-purple-400 mb-1">
            Complétez votre Profil
          </h2>
          <p className="text-sm text-white/60">
            Étape {currentStep + 1} sur 4
          </p>
        </motion.div>

        {/* Progress Bar */}
        <div className="flex items-center justify-center gap-1 mb-6">
          {[0, 1, 2, 3].map((step) => (
            <div key={step} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                step === currentStep
                  ? 'bg-purple-400 text-white scale-110'
                  : step < currentStep
                  ? 'bg-purple-400/50 text-white'
                  : 'bg-white/10 text-white/40'
              }`}>
                {step < currentStep ? <Check className="w-4 h-4" /> : step + 1}
              </div>
              {step < 3 && (
                <div className={`w-8 h-0.5 mx-1 ${
                  step < currentStep ? 'bg-purple-400/50' : 'bg-white/10'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Contenu des étapes */}
        <AnimatePresence mode="wait">
          {currentStep === 0 && (
            <Step0Welcome key="step0" userData={userData} />
          )}
          {currentStep === 1 && (
            <Step1Naissance key="step1" formData={formData} setFormData={setFormData} />
          )}
          {currentStep === 2 && (
            <Step2Intention key="step2" formData={formData} setFormData={setFormData} />
          )}
          {currentStep === 3 && (
            <Step3Photos
              key="step3"
              formData={formData}
              uploadProgress={uploadProgress}
              uploading={uploading}
              onFileChange={async (field, file) => {
                if (!file) {
                  setFormData(prev => ({ ...prev, [field]: null }));
            setUploadedKeys(prev => ({ ...prev, [field === 'facePhoto' ? 'facePhotoKey' : 'palmPhotoKey']: undefined }));
            return;
          }
          // Tenter une compression quand supporté (JPEG/PNG); sinon garder le fichier tel quel
          const compressed = await compressImage(file, { maxDimension: 1600, quality: 0.8, targetKB: 900 });
          setFormData(prev => ({ ...prev, [field]: compressed }));
          if (!useDirectUpload) {
            setUploadedKeys(prev => ({ ...prev, [field === 'facePhoto' ? 'facePhotoKey' : 'palmPhotoKey']: undefined }));
            return;
          }
          try {
            const type = field === 'facePhoto' ? 'face_photo' : 'palm_photo';
            const uploadType = field === 'facePhoto' ? 'face' : 'palm';
            setUploading(uploadType);
            setUploadProgress(prev => ({ ...prev, [uploadType]: 0 }));
            
            // Ensure we always send a solid contentType (some browsers may omit file.type)
            const nameHint = (compressed as any)?.name || (file as any)?.name || '';
            const extLower = String(nameHint).toLowerCase();
            const guessContentType = () => {
              if (compressed.type) return compressed.type;
              if (file.type) return file.type;
              if (extLower.endsWith('.jpg') || extLower.endsWith('.jpeg')) return 'image/jpeg';
              if (extLower.endsWith('.png')) return 'image/png';
              if (extLower.endsWith('.webp')) return 'image/webp';
              if (extLower.endsWith('.gif')) return 'image/gif';
              if (extLower.endsWith('.heic')) return 'image/heic';
              if (extLower.endsWith('.heif')) return 'image/heif';
              if (extLower.endsWith('.tif') || extLower.endsWith('.tiff')) return 'image/tiff';
              if (extLower.endsWith('.bmp')) return 'image/bmp';
              return 'application/octet-stream';
            };
            const contentType = guessContentType();

            const presign = await fetch(`${API_BASE}/uploads/presign`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ type, contentType, originalName: nameHint })
            });
            if (!presign.ok) {
              const err = await presign.json().catch(() => ({}));
              throw new Error(err.error || `Presign failed (${presign.status})`);
            }
            const { uploadUrl, key } = await presign.json();
            
            // Upload with progress tracking and retry logic using XHR
            const uploadResult = await uploadWithRetry(
              uploadUrl,
              compressed,
              (percentage, attempt, maxAttempts) => {
                setUploadProgress(prev => ({ ...prev, [uploadType]: percentage }));
                
                // Show retry attempt in console for debugging
                if (attempt && attempt > 1) {
                  console.log(`[OnboardingForm] Upload retry ${attempt}/${maxAttempts} - ${percentage}%`);
                }
              }
            );
            
            if (!uploadResult.success) {
              throw new Error(uploadResult.error || 'Upload failed');
            }
            
            setUploadedKeys(prev => ({ ...prev, [field === 'facePhoto' ? 'facePhotoKey' : 'palmPhotoKey']: key }));
            setUploadProgress(prev => ({ ...prev, [uploadType]: 100 }));
          } catch (e: any) {
            console.error('[OnboardingForm] S3 upload error:', e);
            setUploadedKeys(prev => ({ ...prev, [field === 'facePhoto' ? 'facePhotoKey' : 'palmPhotoKey']: undefined }));
            setUploadProgress(prev => ({ ...prev, [field === 'facePhoto' ? 'face' : 'palm']: undefined }));
            setUseDirectUpload(false);
            setError('Upload S3 indisponible (CORS). Vos fichiers seront envoyés via nos serveurs.');
          } finally {
            setUploading(null);
          }
        }}
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

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6">
          {currentStep > 0 ? (
            <button
              onClick={handleBack}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-4 py-2 text-white/70 hover:text-white transition-colors disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Retour</span>
            </button>
          ) : <div />}

          {currentStep < 3 ? (
            <button
              onClick={handleNext}
              disabled={!canProceed()}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-purple-500 to-purple-600 text-white font-semibold rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed focus:ring-2 focus:ring-purple-400/50 focus:outline-none"
            >
              <span>Suivant</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
            onClick={handleFinalize}
              disabled={!canProceed() || isSubmitting}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-purple-500 to-purple-600 text-white font-semibold rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed focus:ring-2 focus:ring-purple-400/50 focus:outline-none"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Envoi...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
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

// =================== ÉTAPE 0 : BIENVENUE ===================

const Step0Welcome: React.FC<{ userData: UserData }> = ({ userData }) => (
  <motion.div
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    className="space-y-4"
  >
    <h3 className="text-xl font-semibold text-amber-400 text-center mb-4">
      Bienvenue, {userData.firstName} {userData.lastName} !
    </h3>

    <div className="space-y-3 bg-white/5 border border-white/10 rounded-lg p-4">
      <div className="flex items-center gap-3">
        <Mail className="w-5 h-5 text-green-400 flex-shrink-0" />
        <span className="text-white/80 text-sm flex-1 truncate">{userData.email}</span>
        <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
      </div>
      
      {userData.phone && (
        <div className="flex items-center gap-3">
          <Phone className="w-5 h-5 text-green-400 flex-shrink-0" />
          <span className="text-white/80 text-sm">{userData.phone}</span>
          <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
        </div>
      )}
      
      <div className="flex items-center gap-3">
        <User className="w-5 h-5 text-green-400 flex-shrink-0" />
        <span className="text-white/80 text-sm">{userData.firstName} {userData.lastName}</span>
        <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
      </div>
    </div>

    <p className="text-xs text-center text-white/50 pt-2">
      ✨ Vos informations de base sont enregistrées
    </p>
  </motion.div>
);

// =================== ÉTAPE 1 : NAISSANCE ===================

interface StepProps {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
}

const Step1Naissance: React.FC<StepProps> = ({ formData, setFormData }) => (
  <motion.div
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    className="space-y-4"
  >
    <h3 className="text-lg font-semibold text-amber-400 flex items-center gap-2 mb-4">
      <Calendar className="w-5 h-5" />
      Votre Carte Natale
    </h3>

    <div className="space-y-3">
      <div>
        <label className="block text-xs text-white/60 mb-1.5">Date de naissance</label>
        <input
          type="date"
          value={formData.birthDate}
          onChange={(e) => setFormData(prev => ({ ...prev, birthDate: e.target.value }))}
          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:border-amber-400 transition-colors"
          required
        />
      </div>

      <div>
        <label className="block text-xs text-white/60 mb-1.5">Heure de naissance</label>
        <div className="relative">
          <Clock className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="time"
            value={formData.birthTime}
            onChange={(e) => setFormData(prev => ({ ...prev, birthTime: e.target.value }))}
            className="w-full pl-10 pr-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:border-amber-400 transition-colors"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-xs text-white/60 mb-1.5">Lieu de naissance</label>
        <div className="relative">
          <MapPin className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={formData.birthPlace}
            onChange={(e) => setFormData(prev => ({ ...prev, birthPlace: e.target.value }))}
            placeholder="Ex: Paris, France"
            className="w-full pl-10 pr-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm placeholder-white/40 focus:outline-none focus:border-amber-400 transition-colors"
            required
          />
        </div>
      </div>
    </div>
  </motion.div>
);

// =================== ÉTAPE 2 : INTENTION ===================

const Step2Intention: React.FC<StepProps> = ({ formData, setFormData }) => (
  <motion.div
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    className="space-y-4"
  >
    <h3 className="text-lg font-semibold text-amber-400 flex items-center gap-2 mb-4">
      <Sparkles className="w-5 h-5" />
      Votre Intention Spirituelle
    </h3>

    <div className="space-y-3">
      <div>
        <label className="block text-xs text-white/60 mb-1.5">
          Quelle question vous guide ?
        </label>
        <textarea
          value={formData.specificQuestion}
          onChange={(e) => setFormData(prev => ({ ...prev, specificQuestion: e.target.value }))}
          placeholder="Ex: Comment aligner ma vie professionnelle avec mon chemin spirituel ?"
          rows={3}
          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm placeholder-white/40 focus:outline-none focus:border-amber-400 transition-colors resize-none"
          required
        />
      </div>

      <div>
        <label className="block text-xs text-white/60 mb-1.5">
          Quel est votre objectif spirituel ?
        </label>
        <textarea
          value={formData.objective}
          onChange={(e) => setFormData(prev => ({ ...prev, objective: e.target.value }))}
          placeholder="Ex: Développer mon intuition, trouver ma mission de vie..."
          rows={3}
          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm placeholder-white/40 focus:outline-none focus:border-amber-400 transition-colors resize-none"
          required
        />
      </div>
    </div>
  </motion.div>
);

// =================== ÉTAPE 3 : PHOTOS ===================

interface Step3Props {
  formData: FormData;
  uploadProgress: { face?: number; palm?: number };
  uploading: 'face' | 'palm' | null;
  onFileChange: (field: 'facePhoto' | 'palmPhoto', file: File | null) => void;
}

const Step3Photos: React.FC<Step3Props> = ({ formData, uploadProgress, uploading, onFileChange }) => (
  <motion.div
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    className="space-y-4"
  >
    <h3 className="text-lg font-semibold text-amber-400 flex items-center gap-2 mb-4">
      <Upload className="w-5 h-5" />
      Vos Photos
    </h3>

    <div className="grid grid-cols-2 gap-3">
      <PhotoUpload
        label="Visage"
        icon={<Image className="w-6 h-6" />}
        file={formData.facePhoto}
        progress={uploadProgress.face}
        isUploading={uploading === 'face'}
        onChange={(file) => onFileChange('facePhoto', file)}
      />
      <PhotoUpload
        label="Paume"
        icon={<Hand className="w-6 h-6" />}
        file={formData.palmPhoto}
        progress={uploadProgress.palm}
        isUploading={uploading === 'palm'}
        onChange={(file) => onFileChange('palmPhoto', file)}
      />
    </div>

    <p className="text-xs text-white/50 text-center pt-2">
      Ces photos personnalisent votre lecture spirituelle
    </p>
  </motion.div>
);

// =================== COMPOSANT PHOTO ===================

const PhotoUpload: React.FC<{
  label: string;
  icon: React.ReactNode;
  file: File | null;
  progress?: number;
  isUploading?: boolean;
  onChange: (file: File | null) => void;
}> = ({ label, icon, file, progress, isUploading, onChange }) => (
  <div className="relative">
    <input
      type="file"
      accept="image/*"
      onChange={(e) => onChange(e.target.files?.[0] || null)}
      className="hidden"
      id={`upload-${label}`}
      disabled={isUploading}
    />
    <label
      htmlFor={`upload-${label}`}
      className={`block cursor-pointer p-4 border-2 border-dashed rounded-lg transition-all ${
        file
          ? 'border-amber-400/50 bg-amber-400/10'
          : 'border-white/20 bg-white/5 hover:border-amber-400/30'
      } ${isUploading ? 'cursor-wait opacity-70' : ''}`}
    >
      <div className="flex flex-col items-center gap-2">
        <div className={file ? 'text-amber-400' : 'text-white/40'}>
          {icon}
        </div>
        <p className="text-xs font-medium text-white/80">{label}</p>
        
        {/* Show upload progress */}
        {isUploading && progress !== undefined && (
          <div className="w-full">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-amber-400">{progress}%</span>
            </div>
            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
                className="h-full bg-gradient-to-r from-amber-400 to-amber-500"
              />
            </div>
          </div>
        )}
        
        {/* Show checkmark when complete */}
        {file && !isUploading && (
          <p className="text-xs text-amber-400 flex items-center gap-1">
            <Check className="w-3 h-3" />
            OK
          </p>
        )}
        
        {/* Show loader when uploading but no progress yet */}
        {isUploading && progress === undefined && (
          <Loader2 className="w-4 h-4 text-amber-400 animate-spin" />
        )}
      </div>
    </label>
  </div>
);

export default OnboardingForm;
