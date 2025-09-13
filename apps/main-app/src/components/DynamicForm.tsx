import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Calendar, User, Heart, Zap } from 'lucide-react';
import CircularProgress from './CircularProgress';
import SpiritualWaves from './SpiritualWaves';

interface FormData {
  level: number;
  firstName: string;
  birthDate: string;
  intention: string;
  blockages: string;
  familyHistory: string;
}

const DynamicForm: React.FC = () => {
  const [selectedLevel, setSelectedLevel] = useState<number>(1);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [formData, setFormData] = useState<FormData>({
    level: 1,
    firstName: '',
    birthDate: '',
    intention: '',
    blockages: '',
    familyHistory: '',
  });

  const getStepsForLevel = (level: number) => {
    const baseSteps = [
      { id: 'name', title: 'Prénom', icon: User, required: true },
      { id: 'birth', title: 'Date de naissance', icon: Calendar, required: true },
    ];

    if (level >= 2) {
      baseSteps.push({ id: 'intention', title: 'Intention', icon: Heart, required: true });
    }
    if (level >= 3) {
      baseSteps.push({ id: 'blockages', title: 'Blocages', icon: Zap, required: true });
    }
    if (level >= 4) {
      baseSteps.push({ id: 'family', title: 'Histoire familiale', icon: Heart, required: false });
    }

    return baseSteps;
  };

  const steps = getStepsForLevel(selectedLevel);
  const progress = ((currentStep + 1) / steps.length) * 100;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <section className="py-32 relative bg-gradient-to-b from-mystical-pearl via-mystical-serenity to-mystical-dawn overflow-hidden">
      {/* Ondulations spirituelles */}
      <SpiritualWaves intensity="medium" />
      
      <div className="container mx-auto px-6 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
          className="text-center mb-20 relative z-10"
        >
          <h2 className="font-playfair italic text-5xl md:text-6xl font-medium mb-8 bg-gradient-to-r from-mystical-copper via-mystical-gold to-mystical-radiance bg-clip-text text-transparent drop-shadow-sm">
            Commence ton voyage
          </h2>
          <p className="font-inter font-light text-xl md:text-2xl text-mystical-night/80 tracking-wide">
            Quelques informations pour personnaliser ta lecture
          </p>
        </motion.div>

        {/* Level Selection */}
        <div className="mb-16 relative z-10">
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {[1, 2, 3, 4].map((level) => (
              <motion.button
                key={level}
                onClick={() => {
                  setSelectedLevel(level);
                  setCurrentStep(0);
                }}
                className={`px-8 py-4 rounded-full font-inter font-medium transition-all duration-500 relative overflow-hidden group ${
                  selectedLevel === level
                    ? 'bg-gradient-to-r from-mystical-gold to-mystical-radiance text-mystical-night shadow-spiritual'
                    : 'bg-white/65 text-mystical-constellation border border-mystical-gold/40 hover:bg-mystical-aurora/25 shadow-serenity'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {/* Effet d'ondulation pour bouton sélectionné */}
                {selectedLevel === level && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-mystical-luminous/30 to-mystical-gold/30 rounded-full"
                    animate={{
                      scale: [1, 1.1, 1],
                      opacity: [0.3, 0.6, 0.3],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                )}
                <span className="relative z-10 tracking-wide">
                Niveau {level}
                </span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Form Container */}
        <div className="relative z-10">
          <div className="bg-white/85 backdrop-blur-md border border-mystical-gold/40 rounded-3xl p-8 md:p-12 shadow-spiritual relative overflow-hidden">
            {/* Ondulation de formulaire */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-mystical-gold/3 to-mystical-water/3 rounded-3xl"
              animate={{
                opacity: [0, 0.5, 0],
                scale: [1, 1.02, 1],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            
            {/* Progress */}
            <div className="flex items-center justify-center mb-16 relative z-10">
              <CircularProgress progress={progress} />
            </div>

            {/* Form Steps */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.5 }}
                className="min-h-[300px] flex flex-col justify-center relative z-10"
              >
                {renderStep(steps[currentStep], formData, setFormData)}
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex justify-between items-center mt-16 relative z-10">
              <motion.button
                onClick={handlePrevious}
                disabled={currentStep === 0}
                className={`px-8 py-4 rounded-full font-inter font-medium transition-all duration-500 tracking-wide ${
                  currentStep === 0
                    ? 'opacity-50 cursor-not-allowed text-gray-500'
                    : 'text-mystical-copper/90 border border-mystical-copper/40 hover:bg-mystical-copper/10 shadow-serenity'
                }`}
                whileHover={currentStep > 0 ? { scale: 1.05 } : {}}
              >
                Précédent
              </motion.button>

              <motion.button
                onClick={currentStep === steps.length - 1 ? () => {} : handleNext}
                className="px-10 py-4 rounded-full bg-gradient-to-r from-mystical-gold via-mystical-radiance to-mystical-champagne text-mystical-night font-inter font-medium transition-all duration-500 hover:shadow-energy hover:from-mystical-copper hover:to-mystical-luminous flex items-center gap-2 relative overflow-hidden group tracking-wide"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {/* Effet d'ondulation au survol */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-mystical-luminous/30 to-mystical-gold/30 rounded-full"
                  initial={{ scale: 0, opacity: 0 }}
                  whileHover={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.4 }}
                />
                <span className="relative z-10">
                {currentStep === steps.length - 1 ? 'Recevoir ma lecture' : 'Suivant'}
                </span>
                <ChevronRight className="w-4 h-4" />
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const renderStep = (step: any, formData: FormData, setFormData: React.Dispatch<React.SetStateAction<FormData>>) => {
  const Icon = step.icon;

  return (
    <div className="text-center">
      <div className="mb-8">
        <div className="w-16 h-16 rounded-full bg-gradient-to-r from-mystical-gold/30 to-mystical-champagne/40 flex items-center justify-center mx-auto mb-4 shadow-constellation">
          <Icon className="w-8 h-8 text-mystical-night/80" />
        </div>
        <h3 className="font-playfair italic text-3xl font-medium text-mystical-night mb-4">
          {step.title}
        </h3>
      </div>

      <div className="max-w-md mx-auto">
        {step.id === 'name' && (
          <input
            type="text"
            placeholder="Votre prénom..."
            value={formData.firstName}
            onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
            className="w-full px-6 py-4 rounded-xl bg-white/70 border border-mystical-gold/30 text-mystical-night placeholder-mystical-night/50 font-inter focus:outline-none focus:border-mystical-copper focus:ring-2 focus:ring-mystical-copper/20 transition-all duration-300"
          />
        )}

        {step.id === 'birth' && (
          <input
            type="date"
            value={formData.birthDate}
            onChange={(e) => setFormData(prev => ({ ...prev, birthDate: e.target.value }))}
            className="w-full px-6 py-4 rounded-xl bg-white/70 border border-mystical-gold/30 text-mystical-night font-inter focus:outline-none focus:border-mystical-copper focus:ring-2 focus:ring-mystical-copper/20 transition-all duration-300"
          />
        )}

        {step.id === 'intention' && (
          <textarea
            placeholder="Quelle est votre intention pour cette lecture..."
            value={formData.intention}
            onChange={(e) => setFormData(prev => ({ ...prev, intention: e.target.value }))}
            rows={4}
            className="w-full px-6 py-4 rounded-xl bg-white/70 border border-mystical-gold/30 text-mystical-night placeholder-mystical-night/50 font-inter focus:outline-none focus:border-mystical-copper focus:ring-2 focus:ring-mystical-copper/20 transition-all duration-300 resize-none"
          />
        )}

        {step.id === 'blockages' && (
          <textarea
            placeholder="Décrivez les blocages que vous ressentez..."
            value={formData.blockages}
            onChange={(e) => setFormData(prev => ({ ...prev, blockages: e.target.value }))}
            rows={4}
            className="w-full px-6 py-4 rounded-xl bg-white/70 border border-mystical-gold/30 text-mystical-night placeholder-mystical-night/50 font-inter focus:outline-none focus:border-mystical-copper focus:ring-2 focus:ring-mystical-copper/20 transition-all duration-300 resize-none"
          />
        )}

        {step.id === 'family' && (
          <textarea
            placeholder="Partagez l'histoire énergétique de votre lignée (optionnel)..."
            value={formData.familyHistory}
            onChange={(e) => setFormData(prev => ({ ...prev, familyHistory: e.target.value }))}
            rows={4}
            className="w-full px-6 py-4 rounded-xl bg-white/70 border border-mystical-gold/30 text-mystical-night placeholder-mystical-night/50 font-inter focus:outline-none focus:border-mystical-copper focus:ring-2 focus:ring-mystical-copper/20 transition-all duration-300 resize-none"
          />
        )}
      </div>
    </div>
  );
};

export default DynamicForm;