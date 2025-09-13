import React, { useState } from 'react';
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
    <section className="py-32 relative bg-gradient-to-b from-mystical-abyss via-mystical-midnight to-mystical-deep-blue overflow-hidden">
      <div className="container mx-auto px-6 max-w-4xl">
        <div className="text-center mb-20 relative z-10">
          <h2 className="font-playfair italic text-5xl md:text-6xl font-medium mb-8 text-mystical-starlight">
            Commence ton voyage
          </h2>
          <p className="font-inter font-light text-xl md:text-2xl text-mystical-silver">
            Quelques informations pour personnaliser ta lecture
          </p>
        </div>

        {/* Level Selection */}
        <div className="mb-16 relative z-10">
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {[1, 2, 3, 4].map((level) => (
              <button
                key={level}
                onClick={() => {
                  setSelectedLevel(level);
                  setCurrentStep(0);
                }}
                className={`px-8 py-4 rounded-full font-inter font-light transition-all duration-500 ${
                  selectedLevel === level
                    ? 'bg-mystical-gold text-mystical-abyss shadow-gold-glow'
                    : 'bg-mystical-midnight/60 text-mystical-silver border border-mystical-gold/30 hover:bg-mystical-deep-blue/60'
                }`}
              >
                Niveau {level}
              </button>
            ))}
          </div>
        </div>

        {/* Form Container */}
        <div className="relative z-10">
          <div className="bg-mystical-midnight/60 backdrop-blur-sm border border-mystical-gold/30 rounded-2xl p-8 md:p-12 shadow-forest relative overflow-hidden">
            {/* Progress */}
            <div className="flex items-center justify-center mb-16 relative z-10">
              <CircularProgress progress={progress} />
            </div>

            {/* Form Steps */}
            <div className="min-h-[300px] flex flex-col justify-center relative z-10">
              {renderStep(steps[currentStep], formData, setFormData)}
            </div>

            {/* Navigation */}
            <div className="flex justify-between items-center mt-16 relative z-10">
              <button
                onClick={handlePrevious}
                disabled={currentStep === 0}
                className={`px-8 py-4 rounded-full font-inter font-light transition-all duration-500 ${
                  currentStep === 0
                    ? 'opacity-50 cursor-not-allowed text-mystical-silver/50'
                    : 'text-mystical-silver border border-mystical-gold/30 hover:bg-mystical-deep-blue/30'
                }`}
              >
                Précédent
              </button>

              <button
                onClick={currentStep === steps.length - 1 ? () => {} : handleNext}
                className="px-10 py-4 rounded-full bg-mystical-gold text-mystical-abyss font-inter font-light transition-all duration-500 hover:bg-mystical-gold/80 flex items-center gap-2 shadow-gold-glow"
              >
                <span>
                {currentStep === steps.length - 1 ? 'Recevoir ma lecture' : 'Suivant'}
                </span>
                <ChevronRight className="w-4 h-4" />
              </button>
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
        <div className="w-16 h-16 rounded-full bg-mystical-gold/20 border border-mystical-gold/50 flex items-center justify-center mx-auto mb-4 animate-gold-pulse">
          <Icon className="w-8 h-8 text-mystical-gold" />
        </div>
        <h3 className="font-playfair italic text-3xl font-medium text-mystical-starlight mb-4">
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
            className="w-full px-6 py-4 rounded-xl bg-mystical-midnight/40 border border-mystical-gold/30 text-mystical-starlight placeholder-mystical-silver/50 font-inter font-light focus:outline-none focus:border-mystical-gold focus:ring-2 focus:ring-mystical-gold/20 transition-all duration-300"
          />
        )}

        {step.id === 'birth' && (
          <input
            type="date"
            value={formData.birthDate}
            onChange={(e) => setFormData(prev => ({ ...prev, birthDate: e.target.value }))}
            className="w-full px-6 py-4 rounded-xl bg-mystical-midnight/40 border border-mystical-gold/30 text-mystical-starlight font-inter font-light focus:outline-none focus:border-mystical-gold focus:ring-2 focus:ring-mystical-gold/20 transition-all duration-300"
          />
        )}

        {step.id === 'intention' && (
          <textarea
            placeholder="Quelle est votre intention pour cette lecture..."
            value={formData.intention}
            onChange={(e) => setFormData(prev => ({ ...prev, intention: e.target.value }))}
            rows={4}
            className="w-full px-6 py-4 rounded-xl bg-mystical-midnight/40 border border-mystical-gold/30 text-mystical-starlight placeholder-mystical-silver/50 font-inter font-light focus:outline-none focus:border-mystical-gold focus:ring-2 focus:ring-mystical-gold/20 transition-all duration-300 resize-none"
          />
        )}

        {step.id === 'blockages' && (
          <textarea
            placeholder="Décrivez les blocages que vous ressentez..."
            value={formData.blockages}
            onChange={(e) => setFormData(prev => ({ ...prev, blockages: e.target.value }))}
            rows={4}
            className="w-full px-6 py-4 rounded-xl bg-mystical-midnight/40 border border-mystical-gold/30 text-mystical-starlight placeholder-mystical-silver/50 font-inter font-light focus:outline-none focus:border-mystical-gold focus:ring-2 focus:ring-mystical-gold/20 transition-all duration-300 resize-none"
          />
        )}

        {step.id === 'family' && (
          <textarea
            placeholder="Partagez l'histoire énergétique de votre lignée (optionnel)..."
            value={formData.familyHistory}
            onChange={(e) => setFormData(prev => ({ ...prev, familyHistory: e.target.value }))}
            rows={4}
            className="w-full px-6 py-4 rounded-xl bg-mystical-midnight/40 border border-mystical-gold/30 text-mystical-starlight placeholder-mystical-silver/50 font-inter font-light focus:outline-none focus:border-mystical-gold focus:ring-2 focus:ring-mystical-gold/20 transition-all duration-300 resize-none"
          />
        )}
      </div>
    </div>
  );
};

export default DynamicForm;