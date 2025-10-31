import React, { useEffect, useState } from 'react';
import axios from 'axios';
import GlassCard from '../ui/GlassCard';
import EmptyState from '../ui/EmptyState';
import { SecondaryButton, PrimaryButton, TertiaryButton } from '../ui/Buttons';
import { MessagesSquare, MapPin, Wrench, X, Plus, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSanctuaire } from '../../contexts/SanctuaireContext';

type Q = {
  id: string;
  question: string;
  answer?: string;
  category?: string;
  createdAt: string;
  pinned?: boolean;
  _optimistic?: boolean; // local flag
};

const Conversations: React.FC = () => {
  const { levelMetadata } = useSanctuaire();
  const levelName = (levelMetadata?.name as string) || 'Initié';
  const levelColor = (levelMetadata?.color as string) || 'amber';

  // Mettre la page entière en "Bientôt disponible" pour uniformisation
  return (
    <div className="min-h-screen bg-gradient-to-br from-mystical-950 via-mystical-900 to-mystical-950">
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header aligné Profil */}
          <div className="text-center space-y-3">
            <div className="flex items-center justify-center gap-3">
              <MessagesSquare className={`w-6 h-6 text-${levelColor}-400`} />
              <h1 className="text-3xl font-bold text-white">Dialogue avec l'Oracle</h1>
            </div>
            <p className="text-white/60">
              Niveau actuel : <span className={`text-${levelColor}-400 font-medium`}>{levelName}</span>
            </p>
          </div>

          {/* Bannière Bientôt disponible */}
          <GlassCard className="p-6 border-white/10">
            <h2 className="text-xl font-semibold text-white">Bientôt disponible</h2>
            <p className="text-white/80 mt-2">
              La refonte UX/UI du chat arrive. Cette sphère sera harmonisée avec votre Profil et l'accueil du Sanctuaire.
            </p>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default Conversations;
