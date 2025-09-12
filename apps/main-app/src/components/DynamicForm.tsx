import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Calendar, User, Heart, Zap } from 'lucide-react';
import CircularProgress from './CircularProgress';

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
    <section className="py-24 relative bg-gradient-to-b from-lumira-pearl to-lumira-dawn">
      <div className="container mx-auto px-6 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-playfair italic text-5xl md:text-6xl font-medium mb-6 bg-gradient-to-r from-lumira-copper via-lumira-gold-soft to-lumira-bronze bg-clip-text text-transparent">
            Commence ton voyage
          </h2>
          <p className="font-inter font-light text-xl text-lumira-night/70">
            Quelques informations pour personnaliser ta lecture
          </p>
        </motion.div>

        {/* Level Selection */}
        <div className="mb-12">
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {[1, 2, 3, 4].map((level) => (
              <motion.button
                key={level}
                onClick={() => {
                  setSelectedLevel(level);
                  setCurrentStep(0);
                }}
                className={`px-6 py-3 rounded-full font-inter font-medium transition-all duration-300 ${
                  selectedLevel === level
                    ? 'bg-gradient-to-r from-lumira-gold-soft to-lumira-champagne text-lumira-night shadow-soft'
                    : 'bg-white/60 text-lumira-constellation border border-lumira-gold-soft/30 hover:bg-lumira-aurora/30'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Niveau {level}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Form Container */}
        <div className="relative">
          <div className="bg-white/80 backdrop-blur-sm border border-lumira-gold-soft/30 rounded-3xl p-8 md:p-12 shadow-aurora">
            {/* Progress */}
            <div className="flex items-center justify-center mb-12">
              <CircularProgress progress={progress} />
            </div>

            {/* Form Steps */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="min-h-[300px] flex flex-col justify-center"
              >
                {renderStep(steps[currentStep], formData, setFormData)}
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex justify-between items-center mt-12">
              <motion.button
                onClick={handlePrevious}
                disabled={currentStep === 0}
                className={`px-6 py-3 rounded-full font-inter font-medium transition-all duration-300 ${
                  currentStep === 0
                    ? 'opacity-50 cursor-not-allowed text-gray-500'
                    : 'text-mystical-gold border border-mystical-gold/30 hover:bg-mystical-gold/20'
                }`}
                whileHover={currentStep > 0 ? { scale: 1.05 } : {}}
              >
                Précédent
              </motion.button>

              <motion.button
                onClick={currentStep === steps.length - 1 ? () => {} : handleNext}
                className="px-8 py-3 rounded-full bg-gradient-to-r from-mystical-gold to-mystical-gold-light text-mystical-dark font-inter font-medium transition-all duration-300 hover:shadow-lg hover:shadow-mystical-gold/30 flex items-center gap-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {currentStep === steps.length - 1 ? 'Obtenir ma lecture' : 'Suivant'}
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
        <div className="w-16 h-16 rounded-full bg-gradient-to-r from-mystical-gold to-mystical-gold-light flex items-center justify-center mx-auto mb-4">
          <Icon className="w-8 h-8 text-mystical-dark" />
        </div>
        <h3 className="font-playfair italic text-3xl font-medium text-white mb-4">
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
            className="w-full px-6 py-4 rounded-xl bg-mystical-dark/50 border border-mystical-gold/30 text-white placeholder-gray-400 font-inter focus:outline-none focus:border-mystical-gold focus:ring-2 focus:ring-mystical-gold/20 transition-all duration-300"
          />
        )}

        {step.id === 'birth' && (
          <input
            type="date"
            value={formData.birthDate}
            onChange={(e) => setFormData(prev => ({ ...prev, birthDate: e.target.value }))}
            className="w-full px-6 py-4 rounded-xl bg-mystical-dark/50 border border-mystical-gold/30 text-white font-inter focus:outline-none focus:border-mystical-gold focus:ring-2 focus:ring-mystical-gold/20 transition-all duration-300"
          />
        )}

        {step.id === 'intention' && (
          <textarea
            placeholder="Quelle est votre intention pour cette lecture..."
            value={formData.intention}
            onChange={(e) => setFormData(prev => ({ ...prev, intention: e.target.value }))}
            rows={4}
            className="w-full px-6 py-4 rounded-xl bg-mystical-dark/50 border border-mystical-gold/30 text-white placeholder-gray-400 font-inter focus:outline-none focus:border-mystical-gold focus:ring-2 focus:ring-mystical-gold/20 transition-all duration-300 resize-none"
          />
        )}

        {step.id === 'blockages' && (
          <textarea
            placeholder="Décrivez les blocages que vous ressentez..."
            value={formData.blockages}
            onChange={(e) => setFormData(prev => ({ ...prev, blockages: e.target.value }))}
            rows={4}
            className="w-full px-6 py-4 rounded-xl bg-mystical-dark/50 border border-mystical-gold/30 text-white placeholder-gray-400 font-inter focus:outline-none focus:border-mystical-gold focus:ring-2 focus:ring-mystical-gold/20 transition-all duration-300 resize-none"
          />
        )}

        {step.id === 'family' && (
          <textarea
            placeholder="Partagez l'histoire énergétique de votre lignée (optionnel)..."
            value={formData.familyHistory}
            onChange={(e) => setFormData(prev => ({ ...prev, familyHistory: e.target.value }))}
            rows={4}
            className="w-full px-6 py-4 rounded-xl bg-mystical-dark/50 border border-mystical-gold/30 text-white placeholder-gray-400 font-inter focus:outline-none focus:border-mystical-gold focus:ring-2 focus:ring-mystical-gold/20 transition-all duration-300 resize-none"
          />
        )}
      </div>
    </div>
  );
};

export default DynamicForm;