import React from 'react';
import { motion } from 'framer-motion';
import { Crown, Download, Play, Star, Calendar } from 'lucide-react';
import PageLayout from '../components/ui/PageLayout';
import GlassCard from '../components/ui/GlassCard';
import SectionHeader from '../components/ui/SectionHeader';

const DashboardSanctuaire: React.FC = () => {
  return (
    <PageLayout variant="dark" className="py-12">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <SectionHeader
            title="Votre Sanctuaire"
            subtitle="Bienvenue, âme lumineuse — vos révélations vous attendent"
            icon={<Crown className="w-8 h-8 text-mystical-gold" />}
          />
        </motion.div>
        {/* Progress Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="bg-gradient-to-br from-mystical-gold/10 to-mystical-purple/10 backdrop-blur-sm border border-mystical-gold/30 rounded-3xl p-8 mb-12"
        >
          <h2 className="font-playfair italic text-2xl font-medium text-mystical-gold mb-8 text-center">
            Votre Évolution Spirituelle
          </h2>
          
          <div className="grid md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((level, index) => (
              <div key={level} className="text-center">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                  index <= 1 ? 'bg-mystical-gold text-mystical-abyss' : 'bg-mystical-gold/20 text-mystical-gold'
                }`}>
                  <span className="font-semibold">{level}</span>
                </div>
                <h3 className="font-inter font-medium text-white mb-2">Niveau {level}</h3>
                <p className="font-inter text-xs text-gray-400">
                  {index <= 1 ? 'Complété' : 'À venir'}
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Readings Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="grid md:grid-cols-2 gap-8"
        >
          {/* Reading Card */}
          <div className="bg-gradient-to-br from-mystical-purple/10 to-mystical-gold/10 backdrop-blur-sm border border-mystical-gold/30 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-playfair italic text-xl font-medium text-white">
                Votre Lecture Niveau 2
              </h3>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-mystical-gold fill-current" />
                ))}
              </div>
            </div>
            
            <p className="font-inter text-sm text-gray-300 mb-6">
              Archétype révélé : <span className="text-mystical-gold font-medium">L'Exploratrice Mystique</span>
            </p>
            
            <div className="space-y-3 mb-6">
              <button className="w-full flex items-center gap-3 p-3 rounded-lg bg-mystical-gold/20 hover:bg-mystical-gold/30 transition-colors duration-300">
                <Download className="w-4 h-4 text-mystical-gold" />
                <span className="font-inter text-sm text-white">Télécharger PDF (2.3 MB)</span>
              </button>
              
              <button className="w-full flex items-center gap-3 p-3 rounded-lg bg-mystical-purple/20 hover:bg-mystical-purple/30 transition-colors duration-300">
                <Play className="w-4 h-4 text-mystical-purple" />
                <span className="font-inter text-sm text-white">Écouter Audio (25 min)</span>
              </button>
              
              <button className="w-full flex items-center gap-3 p-3 rounded-lg bg-mystical-gold/20 hover:bg-mystical-gold/30 transition-colors duration-300">
                <Download className="w-4 h-4 text-mystical-gold" />
                <span className="font-inter text-sm text-white">Mandala HD (1920x1920)</span>
              </button>
            </div>
            
            <div className="flex items-center gap-2 text-gray-400">
              <Calendar className="w-4 h-4" />
              <span className="font-inter text-xs">Reçu le 15 mars 2024</span>
            </div>
          </div>

          {/* Coming Soon Card */}
          <div className="bg-gradient-to-br from-mystical-gold/5 to-mystical-purple/5 backdrop-blur-sm border border-mystical-gold/20 rounded-2xl p-6 opacity-60">
            <h3 className="font-playfair italic text-xl font-medium text-gray-300 mb-4">
              Prochaine Lecture
            </h3>
            <p className="font-inter text-sm text-gray-400 mb-6">
              Votre prochain voyage spirituel vous attend. 
              Choisissez un nouveau niveau pour approfondir votre exploration.
            </p>
            <button className="w-full py-3 rounded-lg border border-mystical-gold/30 text-mystical-gold hover:bg-mystical-gold/10 transition-all duration-300">
              <span className="font-inter text-sm">Explorer les niveaux</span>
            </button>
          </div>
        </motion.div>
      </div>
    </PageLayout>
  );
};

export default DashboardSanctuaire;


