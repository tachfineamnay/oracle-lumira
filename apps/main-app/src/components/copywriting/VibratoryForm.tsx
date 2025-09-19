import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Heart } from 'lucide-react';
import { PrimaryButton } from '../ui/Buttons';
import GlassCard from '../ui/GlassCard';

export interface VibratoryData {
  firstName: string;
  energyLevel?: number;
  intention?: string;
}

export interface VibratoryFormProps {
  title: string;
  nameLabel: string;
  namePlaceholder: string;
  syncLabel: string;
  submitLabel: string;
  description: string;
  onSubmit: (data: VibratoryData) => void;
  className?: string;
}

const VibratoryForm: React.FC<VibratoryFormProps> = ({
  title,
  nameLabel,
  namePlaceholder,
  syncLabel,
  submitLabel,
  description,
  onSubmit,
  className = ''
}) => {
  const [firstName, setFirstName] = useState('');
  const [energyLevel, setEnergyLevel] = useState(5);
  const [intention, setIntention] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim()) return;

    setIsSubmitting(true);
    
    // Simulate vibratory sync animation
    setTimeout(() => {
      onSubmit({
        firstName: firstName.trim(),
        energyLevel,
        intention: intention.trim()
      });
      setIsSubmitting(false);
    }, 2000);
  };

  const vibrationalColors = [
    'bg-red-400/20 border-red-400/30',
    'bg-orange-400/20 border-orange-400/30', 
    'bg-yellow-400/20 border-yellow-400/30',
    'bg-green-400/20 border-green-400/30',
    'bg-blue-400/20 border-blue-400/30',
    'bg-indigo-400/20 border-indigo-400/30',
    'bg-purple-400/20 border-purple-400/30',
    'bg-pink-400/20 border-pink-400/30',
    'bg-amber-400/20 border-amber-400/30',
    'bg-emerald-400/20 border-emerald-400/30'
  ];

  return (
    <section className={`py-16 sm:py-20 ${className}`}>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <GlassCard className="backdrop-blur-xl bg-white/5 border-white/10">
            <div className="p-8">
              {/* Header */}
              <div className="text-center mb-8">
                <motion.div 
                  className="flex justify-center mb-6"
                  animate={isSubmitting ? { scale: [1, 1.2, 1], rotate: [0, 180, 360] } : {}}
                  transition={{ duration: 2, repeat: isSubmitting ? Infinity : 0 }}
                >
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-400/20 to-mystical-600/20 flex items-center justify-center border border-amber-400/30">
                    <Heart className="w-10 h-10 text-amber-400" />
                  </div>
                </motion.div>

                <h3 className="text-2xl sm:text-3xl font-cinzel font-light text-white mb-4">
                  {title}
                </h3>
                <p className="text-white/70 leading-relaxed">
                  {description}
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name Input */}
                <div>
                  <label htmlFor="firstName" className="block text-white/90 font-medium mb-2">
                    {nameLabel}
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder={namePlaceholder}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/20 text-white placeholder-white/50 focus:border-amber-400/50 focus:ring-2 focus:ring-amber-400/20 focus:outline-none transition-all duration-300"
                    required
                  />
                </div>

                {/* Energy Level Slider */}
                <div>
                  <label className="block text-white/90 font-medium mb-4">
                    {syncLabel}
                  </label>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <span className="text-white/60 text-sm min-w-[80px]">Terrestre</span>
                      <div className="flex-1 relative">
                        <input
                          type="range"
                          min="1"
                          max="10"
                          value={energyLevel}
                          onChange={(e) => setEnergyLevel(Number(e.target.value))}
                          className="w-full h-2 rounded-full appearance-none bg-white/10 slider"
                          style={{
                            background: `linear-gradient(to right, rgb(251 191 36 / 0.6) 0%, rgb(251 191 36 / 0.6) ${energyLevel * 10}%, rgb(255 255 255 / 0.1) ${energyLevel * 10}%, rgb(255 255 255 / 0.1) 100%)`
                          }}
                        />
                      </div>
                      <span className="text-white/60 text-sm min-w-[80px] text-right">Cosmique</span>
                    </div>
                    
                    {/* Vibrational visualization */}
                    <div className="flex justify-center gap-1">
                      {Array.from({ length: 10 }).map((_, i) => (
                        <motion.div
                          key={i}
                          className={`w-3 h-8 rounded-full border ${
                            i < energyLevel 
                              ? vibrationalColors[i] || 'bg-amber-400/20 border-amber-400/30'
                              : 'bg-white/5 border-white/10'
                          }`}
                          animate={i < energyLevel ? { scale: [1, 1.2, 1] } : {}}
                          transition={{ duration: 1, repeat: Infinity, delay: i * 0.1 }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Intention (optional) */}
                <div>
                  <label htmlFor="intention" className="block text-white/90 font-medium mb-2">
                    Intention Sacrée <span className="text-white/50 text-sm">(optionnel)</span>
                  </label>
                  <textarea
                    id="intention"
                    value={intention}
                    onChange={(e) => setIntention(e.target.value)}
                    placeholder="Partagez votre intention pour cette guidance spirituelle..."
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/20 text-white placeholder-white/50 focus:border-amber-400/50 focus:ring-2 focus:ring-amber-400/20 focus:outline-none transition-all duration-300 resize-none"
                  />
                </div>

                {/* Submit */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <PrimaryButton
                    type="submit"
                    disabled={!firstName.trim() || isSubmitting}
                    className="w-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-lg py-4 shadow-lg shadow-amber-400/30 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center justify-center gap-3">
                        <Sparkles className="w-5 h-5 animate-spin" />
                        <span>Synchronisation en cours...</span>
                      </div>
                    ) : (
                      submitLabel
                    )}
                  </PrimaryButton>
                </motion.div>
              </form>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </section>
  );
};

export default VibratoryForm;