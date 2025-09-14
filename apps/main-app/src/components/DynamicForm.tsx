import React, { useState } from 'react';
import { ChevronRight, Calendar, User, Heart, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
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
    <section className="py-12 sm:py-16 lg:py-24 xl:py-32 relative overflow-hidden">
      {/* Aurore cosmique de section - RESPONSIVE */}
      <div className="absolute inset-0 bg-gradient-to-b from-cosmic-aurora/5 via-transparent to-cosmic-violet/5"></div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl relative z-10">
        <motion.div 
          className="text-center mb-12 sm:mb-16 lg:mb-20 xl:mb-24"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
        >
          <motion.h2 
            className="font-playfair italic text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-6 sm:mb-8 text-cosmic-divine leading-tight px-2"
            style={{
              textShadow: '0 0 30px rgba(139, 123, 216, 0.5)',
            }}
          >
            Commence ton voyage
          </motion.h2>
          <p className="font-inter font-light text-base sm:text-lg md:text-xl lg:text-2xl text-cosmic-ethereal max-w-3xl mx-auto leading-relaxed px-4">
            Quelques informations pour personnaliser ta lecture cosmique
          </p>
        </motion.div>

        {/* Level Selection avec effets - RESPONSIVE */}
        <motion.div 
          className="mb-12 sm:mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3 md:gap-4 mb-6 sm:mb-8 px-2">
            {[1, 2, 3, 4].map((level) => (
              <motion.button
                key={level}
                onClick={() => {
                  setSelectedLevel(level);
                  setCurrentStep(0);
                }}
                className={`px-4 sm:px-6 md:px-8 py-3 sm:py-4 rounded-full font-inter font-medium transition-all duration-500 relative overflow-hidden text-sm sm:text-base ${
                  selectedLevel === level
                    ? 'bg-gradient-to-r from-cosmic-gold to-cosmic-gold-warm text-cosmic-void shadow-stellar'
                    : 'bg-cosmic-deep/60 text-cosmic-ethereal border border-cosmic-gold/30 hover:bg-cosmic-nebula/60'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {selectedLevel === level && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-cosmic-star/20 via-cosmic-gold/30 to-cosmic-star/20"
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}
                <span className="relative z-10">Niveau {level}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Form Container cosmique */}
        <motion.div 
          className="relative"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
        >
          <div className="bg-gradient-to-br from-cosmic-deep/80 via-cosmic-nebula/60 to-cosmic-galaxy/40 backdrop-blur-xl border border-cosmic-gold/40 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 lg:p-12 shadow-nebula relative overflow-hidden">
            {/* Effet de nébuleuse en arrière-plan */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-cosmic-violet/10 via-transparent to-cosmic-aurora/10 rounded-3xl"
              animate={{
                opacity: [0.3, 0.6, 0.3],
                scale: [1, 1.02, 1],
              }}
              transition={{ duration: 8, repeat: Infinity }}
            />
            
            {/* Particules flottantes */}
            <div className="absolute inset-0">
              {[...Array(12)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 bg-cosmic-star rounded-full"
                  style={{
                    left: `${10 + i * 7}%`,
                    top: `${15 + (i % 4) * 20}%`,
                  }}
                  animate={{
                    opacity: [0, 1, 0],
                    y: [0, -20, 0],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    delay: i * 0.3,
                  }}
                />
              ))}
            </div>

            {/* Progress cosmique - RESPONSIVE */}
            <motion.div 
              className="flex items-center justify-center mb-8 sm:mb-12 md:mb-16 relative z-10"
              animate={{ 
                filter: [
                  'drop-shadow(0 0 10px rgba(255, 215, 0, 0.3))',
                  'drop-shadow(0 0 20px rgba(255, 215, 0, 0.6))',
                  'drop-shadow(0 0 10px rgba(255, 215, 0, 0.3))',
                ]
              }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <CircularProgress progress={progress} />
            </motion.div>

            {/* Form Steps - RESPONSIVE */}
            <div className="min-h-[250px] sm:min-h-[300px] flex flex-col justify-center relative z-10">
              {renderStep(steps[currentStep], formData, setFormData)}
            </div>

            {/* Navigation cosmique - RESPONSIVE */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-0 mt-8 sm:mt-12 md:mt-16 relative z-10">
              <motion.button
                onClick={handlePrevious}
                disabled={currentStep === 0}
                className={`w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 rounded-full font-inter font-medium transition-all duration-500 text-sm sm:text-base ${
                  currentStep === 0
                    ? 'opacity-50 cursor-not-allowed text-cosmic-silver/50'
                    : 'text-cosmic-ethereal border border-cosmic-gold/30 hover:bg-cosmic-violet/20 hover:border-cosmic-gold/50'
                }`}
                whileHover={currentStep > 0 ? { scale: 1.05 } : {}}
                whileTap={currentStep > 0 ? { scale: 0.95 } : {}}
              >
                Précédent
              </motion.button>

              <motion.button
                onClick={currentStep === steps.length - 1 ? () => {} : handleNext}
                className="w-full sm:w-auto px-8 sm:px-12 py-3 sm:py-4 rounded-full bg-gradient-to-r from-cosmic-gold via-cosmic-gold-warm to-cosmic-gold text-cosmic-void font-inter font-bold transition-all duration-500 hover:shadow-stellar flex items-center justify-center gap-2 sm:gap-3 relative overflow-hidden group text-sm sm:text-base"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {/* Effet de brillance */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                <span className="relative z-10">
                  {currentStep === steps.length - 1 ? 'Recevoir ma révélation' : 'Suivant'}
                </span>
                <ChevronRight className="w-5 h-5 relative z-10" />
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

const renderStep = (step: any, formData: FormData, setFormData: React.Dispatch<React.SetStateAction<FormData>>) => {
  const Icon = step.icon;

  return (
    <motion.div 
      className="text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="mb-6 sm:mb-8">
        <motion.div 
          className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-cosmic-gold/30 to-cosmic-violet/20 border-2 border-cosmic-gold/50 flex items-center justify-center mx-auto mb-4 sm:mb-6"
          animate={{ 
            boxShadow: [
              '0 0 20px rgba(255, 215, 0, 0.3)',
              '0 0 40px rgba(255, 215, 0, 0.5)',
              '0 0 20px rgba(255, 215, 0, 0.3)',
            ]
          }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <Icon className="w-8 h-8 sm:w-10 sm:h-10 text-cosmic-gold" />
        </motion.div>
        <h3 className="font-playfair italic text-xl sm:text-2xl md:text-3xl font-bold text-cosmic-divine mb-3 sm:mb-4 px-2">
          {step.title}
        </h3>
      </div>

      <div className="max-w-md mx-auto px-4 sm:px-0">
        {step.id === 'name' && (
          <motion.input
            type="text"
            placeholder="Votre prénom cosmique..."
            value={formData.firstName}
            onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
            className="w-full px-4 sm:px-6 py-3 sm:py-4 rounded-xl bg-cosmic-deep/60 border border-cosmic-gold/40 text-cosmic-divine placeholder-cosmic-silver/60 font-inter font-light focus:outline-none focus:border-cosmic-gold focus:ring-2 focus:ring-cosmic-gold/30 transition-all duration-500 backdrop-blur-sm text-sm sm:text-base"
            whileFocus={{ scale: 1.02 }}
          />
        )}

        {step.id === 'birth' && (
          <motion.input
            type="date"
            value={formData.birthDate}
            onChange={(e) => setFormData(prev => ({ ...prev, birthDate: e.target.value }))}
            className="w-full px-4 sm:px-6 py-3 sm:py-4 rounded-xl bg-cosmic-deep/60 border border-cosmic-gold/40 text-cosmic-divine font-inter font-light focus:outline-none focus:border-cosmic-gold focus:ring-2 focus:ring-cosmic-gold/30 transition-all duration-500 backdrop-blur-sm text-sm sm:text-base"
            whileFocus={{ scale: 1.02 }}
          />
        )}

        {step.id === 'intention' && (
          <motion.textarea
            placeholder="Quelle est votre intention pour cette lecture cosmique..."
            value={formData.intention}
            onChange={(e) => setFormData(prev => ({ ...prev, intention: e.target.value }))}
            rows={4}
            className="w-full px-4 sm:px-6 py-3 sm:py-4 rounded-xl bg-cosmic-deep/60 border border-cosmic-gold/40 text-cosmic-divine placeholder-cosmic-silver/60 font-inter font-light focus:outline-none focus:border-cosmic-gold focus:ring-2 focus:ring-cosmic-gold/30 transition-all duration-500 resize-none backdrop-blur-sm text-sm sm:text-base"
            whileFocus={{ scale: 1.02 }}
          />
        )}

        {step.id === 'blockages' && (
          <motion.textarea
            placeholder="Décrivez les blocages énergétiques que vous ressentez..."
            value={formData.blockages}
            onChange={(e) => setFormData(prev => ({ ...prev, blockages: e.target.value }))}
            rows={4}
            className="w-full px-6 py-4 rounded-xl bg-cosmic-deep/60 border border-cosmic-gold/40 text-cosmic-divine placeholder-cosmic-silver/60 font-inter font-light focus:outline-none focus:border-cosmic-gold focus:ring-2 focus:ring-cosmic-gold/30 transition-all duration-500 resize-none backdrop-blur-sm"
            whileFocus={{ scale: 1.02 }}
          />
        )}

        {step.id === 'family' && (
          <motion.textarea
            placeholder="Partagez l'histoire énergétique de votre lignée stellaire (optionnel)..."
            value={formData.familyHistory}
            onChange={(e) => setFormData(prev => ({ ...prev, familyHistory: e.target.value }))}
            rows={4}
            className="w-full px-6 py-4 rounded-xl bg-cosmic-deep/60 border border-cosmic-gold/40 text-cosmic-divine placeholder-cosmic-silver/60 font-inter font-light focus:outline-none focus:border-cosmic-gold focus:ring-2 focus:ring-cosmic-gold/30 transition-all duration-500 resize-none backdrop-blur-sm"
            whileFocus={{ scale: 1.02 }}
          />
        )}
      </div>
    </motion.div>
  );
};

export default DynamicForm;