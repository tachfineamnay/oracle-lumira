import React from 'react';
import { motion } from 'framer-motion';
import { Star, Lock, Sparkles, Moon, Sun } from 'lucide-react';
import { useSanctuaire } from '../../contexts/SanctuaireContext';
import GlassCard from '../ui/GlassCard';
import { useNavigate } from 'react-router-dom';

const Rituals: React.FC = () => {
  const { hasCapability, hasProduct } = useSanctuaire();
  const navigate = useNavigate();

  const hasAccess = hasProduct('mystique') || hasCapability('sanctuaire.sphere.rituals');

  if (!hasAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl w-full"
        >
          <GlassCard className="p-8 text-center bg-gradient-to-br from-purple-400/10 to-pink-400/10 border-purple-400/20">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-purple-400/20 flex items-center justify-center">
              <Lock className="w-10 h-10 text-purple-400" />
            </div>
            <h2 className="text-2xl font-playfair italic text-purple-400 mb-4">
              Rituels Sacrés - Niveau Mystique
            </h2>
            <p className="text-white/80 mb-6">
              Accédez aux rituels personnalisés, méditations guidées et pratiques spirituelles avancées en passant au niveau Mystique.
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => navigate('/commande?product=mystique')}
                className="px-6 py-3 bg-gradient-to-r from-purple-400 to-pink-400 text-white font-medium rounded-xl hover:from-purple-500 hover:to-pink-500 transition-all"
              >
                Passer au niveau Mystique
              </button>
              <button
                onClick={() => navigate('/sanctuaire/dashboard')}
                className="px-6 py-3 bg-white/10 text-white border border-white/20 rounded-xl hover:bg-white/20 transition-all"
              >
                Retour à l'accueil
              </button>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto"
      >
        <div className="text-center mb-12">
          <h1 className="text-4xl font-playfair italic text-purple-400 mb-4 flex items-center justify-center gap-3">
            <Star className="w-10 h-10" />
            Rituels Sacrés Personnalisés
          </h1>
          <p className="text-white/70 text-lg">
            Vos pratiques spirituelles sur mesure
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Rituel du Matin */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <GlassCard className="p-6 hover:scale-105 transition-transform cursor-pointer bg-gradient-to-br from-amber-400/10 to-orange-400/10 border-amber-400/20">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-400/20 flex items-center justify-center">
                <Sun className="w-8 h-8 text-amber-400" />
              </div>
              <h3 className="text-xl font-playfair italic text-amber-400 mb-2 text-center">
                Rituel du Matin
              </h3>
              <p className="text-white/70 text-sm text-center mb-4">
                Commencez votre journée avec intention et clarté
              </p>
              <div className="text-center">
                <span className="inline-block px-3 py-1 bg-amber-400/20 rounded-full text-amber-400 text-xs">
                  À venir
                </span>
              </div>
            </GlassCard>
          </motion.div>

          {/* Rituel du Soir */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <GlassCard className="p-6 hover:scale-105 transition-transform cursor-pointer bg-gradient-to-br from-purple-400/10 to-indigo-400/10 border-purple-400/20">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-purple-400/20 flex items-center justify-center">
                <Moon className="w-8 h-8 text-purple-400" />
              </div>
              <h3 className="text-xl font-playfair italic text-purple-400 mb-2 text-center">
                Rituel du Soir
              </h3>
              <p className="text-white/70 text-sm text-center mb-4">
                Clôturez votre journée en harmonie et gratitude
              </p>
              <div className="text-center">
                <span className="inline-block px-3 py-1 bg-purple-400/20 rounded-full text-purple-400 text-xs">
                  À venir
                </span>
              </div>
            </GlassCard>
          </motion.div>

          {/* Méditations Guidées */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <GlassCard className="p-6 hover:scale-105 transition-transform cursor-pointer bg-gradient-to-br from-blue-400/10 to-cyan-400/10 border-blue-400/20">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-400/20 flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-blue-400" />
              </div>
              <h3 className="text-xl font-playfair italic text-blue-400 mb-2 text-center">
                Méditations Guidées
              </h3>
              <p className="text-white/70 text-sm text-center mb-4">
                Pratiques personnalisées selon votre énergie
              </p>
              <div className="text-center">
                <span className="inline-block px-3 py-1 bg-blue-400/20 rounded-full text-blue-400 text-xs">
                  À venir
                </span>
              </div>
            </GlassCard>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-12 text-center"
        >
          <GlassCard className="p-6 bg-gradient-to-br from-purple-400/5 to-pink-400/5 border-purple-400/10">
            <p className="text-white/60 text-sm">
              Vos rituels personnalisés seront générés en fonction de votre lecture spirituelle et de votre parcours unique.
            </p>
          </GlassCard>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Rituals;
