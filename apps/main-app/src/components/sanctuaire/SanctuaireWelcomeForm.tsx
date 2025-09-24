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
  X
} from 'lucide-react';
import { useUserLevel } from '../../contexts/UserLevelContext';
import GlassCard from '../ui/GlassCard';

interface FormData {
  email: string;
  phone: string;
  birthDate: string;
  birthTime: string;
  objective: string;
  additionalInfo: string;
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
    additionalInfo: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Simuler soumission vers backend
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simulation API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mettre à jour le profil utilisateur
      updateUserProfile({
        email: formData.email,
        phone: formData.phone,
        birthDate: formData.birthDate,
        birthTime: formData.birthTime,
        objective: formData.objective,
        additionalInfo: formData.additionalInfo,
        profileCompleted: true,
        submittedAt: new Date()
      });

      setFormState('submitted');
      setShowConfirmation(true);
      
    } catch (error) {
      console.error('Erreur soumission:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, updateUserProfile]);

  const handleEdit = () => {
    setFormState('active');
    setShowConfirmation(false);
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const isFormValid = formData.email && formData.birthDate && formData.objective;
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
        <GlassCard className={`p-8 ${isReadOnly ? 'bg-white/5 border-white/10' : 'bg-gradient-to-br from-mystical-gold/10 to-mystical-purple/10 border-mystical-gold/30'}`}>
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-mystical-gold/30 to-mystical-purple/20 flex items-center justify-center"
            >
              <User className="w-10 h-10 text-mystical-gold" />
            </motion.div>
            
            <h2 className="font-playfair italic text-3xl font-medium text-mystical-gold mb-4">
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
                      : 'bg-white/5 border-mystical-gold/30 text-white placeholder-white/50 focus:border-mystical-gold focus:ring-2 focus:ring-mystical-gold/20'
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
                      : 'bg-white/5 border-mystical-gold/30 text-white placeholder-white/50 focus:border-mystical-gold focus:ring-2 focus:ring-mystical-gold/20'
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
                      : 'bg-white/5 border-mystical-gold/30 text-white focus:border-mystical-gold focus:ring-2 focus:ring-mystical-gold/20'
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
                      : 'bg-white/5 border-mystical-gold/30 text-white focus:border-mystical-gold focus:ring-2 focus:ring-mystical-gold/20'
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
                    : 'bg-white/5 border-mystical-gold/30 text-white placeholder-white/50 focus:border-mystical-gold focus:ring-2 focus:ring-mystical-gold/20'
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
                    : 'bg-white/5 border-mystical-gold/30 text-white placeholder-white/50 focus:border-mystical-gold focus:ring-2 focus:ring-mystical-gold/20'
                }`}
                placeholder="Partagez vos expériences, vos questions ou tout ce que vous souhaitez que l'Oracle connaisse sur votre chemin..."
              />
            </div>

            {/* Boutons d'action */}
            {!isReadOnly && (
              <div className="text-center pt-6">
                <motion.button
                  type="submit"
                  disabled={!isFormValid || isSubmitting}
                  className={`px-8 py-4 rounded-xl font-medium transition-all duration-300 ${
                    isFormValid && !isSubmitting
                      ? 'bg-gradient-to-r from-mystical-gold to-mystical-gold-light text-mystical-abyss hover:shadow-lg hover:shadow-mystical-gold/30'
                      : 'bg-white/10 text-white/50 cursor-not-allowed'
                  }`}
                  whileHover={isFormValid && !isSubmitting ? { scale: 1.05 } : {}}
                  whileTap={isFormValid && !isSubmitting ? { scale: 0.95 } : {}}
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 border-2 border-mystical-abyss/30 border-t-mystical-abyss rounded-full animate-spin" />
                      Transmission en cours...
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <Upload className="w-5 h-5" />
                      Transmettre à l'Oracle
                    </div>
                  )}
                </motion.button>
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