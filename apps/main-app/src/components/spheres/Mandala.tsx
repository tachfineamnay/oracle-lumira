import React from 'react';
import { motion } from 'framer-motion';
import { Crown, Lock, Download, Sparkles } from 'lucide-react';
import { useSanctuaire } from '../../contexts/SanctuaireContext';
import GlassCard from '../ui/GlassCard';
import { useNavigate } from 'react-router-dom';

const Mandala: React.FC = () => {
  const { hasCapability, hasProduct } = useSanctuaire();
  const navigate = useNavigate();

  const hasAccess = hasProduct('profond') || hasCapability('sanctuaire.sphere.mandala');

  if (!hasAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl w-full"
        >
          <GlassCard className="p-8 text-center bg-gradient-to-br from-blue-400/10 to-purple-400/10 border-blue-400/20">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-blue-400/20 flex items-center justify-center">
              <Lock className="w-10 h-10 text-blue-400" />
            </div>
            <h2 className="text-2xl font-playfair italic text-blue-400 mb-4">
              Mandala Personnel HD - Niveau Profond
            </h2>
            <p className="text-white/80 mb-6">
              Accédez à votre mandala personnalisé en haute définition, créé spécifiquement pour votre énergie unique, en passant au niveau Profond.
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => navigate('/commande?product=profond')}
                className="px-6 py-3 bg-gradient-to-r from-blue-400 to-purple-400 text-white font-medium rounded-xl hover:from-blue-500 hover:to-purple-500 transition-all"
              >
                Débloquer le niveau Profond
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
          <h1 className="text-4xl font-playfair italic text-blue-400 mb-4 flex items-center justify-center gap-3">
            <Crown className="w-10 h-10" />
            Votre Mandala Personnel
          </h1>
          <p className="text-white/70 text-lg">
            Symbole sacré unique créé pour votre énergie
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <GlassCard className="p-8 bg-gradient-to-br from-blue-400/10 to-purple-400/10 border-blue-400/20">
            <div className="aspect-square max-w-2xl mx-auto bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 via-purple-400/10 to-pink-400/10 animate-pulse" />
              <div className="relative z-10 text-center">
                <Sparkles className="w-20 h-20 text-blue-400 mx-auto mb-4" />
                <p className="text-white/60 text-lg">
                  Votre mandala personnalisé sera généré<br />après analyse de votre lecture spirituelle
                </p>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <GlassCard className="p-6">
              <h3 className="text-xl font-playfair italic text-blue-400 mb-4">
                Symbolisme Personnel
              </h3>
              <p className="text-white/70 text-sm mb-4">
                Votre mandala intègre des symboles et couleurs alignés avec votre carte natale, votre question spirituelle et votre énergie unique.
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-400" />
                  <span className="text-white/60 text-sm">Géométrie sacrée personnalisée</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-purple-400" />
                  <span className="text-white/60 text-sm">Palette de couleurs énergétique</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-pink-400" />
                  <span className="text-white/60 text-sm">Symboles astrologiques intégrés</span>
                </div>
              </div>
            </GlassCard>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <GlassCard className="p-6">
              <h3 className="text-xl font-playfair italic text-purple-400 mb-4">
                Utilisation & Méditation
              </h3>
              <p className="text-white/70 text-sm mb-4">
                Utilisez votre mandala comme support de méditation quotidienne pour renforcer votre connexion spirituelle.
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-amber-400" />
                  <span className="text-white/60 text-sm">Méditation guidée incluse</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-400" />
                  <span className="text-white/60 text-sm">Format HD téléchargeable</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-400" />
                  <span className="text-white/60 text-sm">Version imprimable</span>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-center"
        >
          <button
            disabled
            className="px-8 py-3 bg-gradient-to-r from-blue-400/20 to-purple-400/20 text-white/40 border border-blue-400/20 rounded-xl cursor-not-allowed flex items-center gap-2 mx-auto"
          >
            <Download className="w-5 h-5" />
            Télécharger (disponible après génération)
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Mandala;
