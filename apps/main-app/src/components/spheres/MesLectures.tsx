/**
 * MesLectures - Page affichant la bibliothèque de lectures spirituelles
 * 
 * Affiche toutes les commandes complétées et validées de l'utilisateur.
 * Chaque lecture est présentée dans une LectureCard avec :
 * - Accès conditionnels basés sur les capabilities (PDF, Audio, Mandala)
 * - Boutons d'action avec CapabilityGuard
 * - Appel API pour générer des URLs pré-signées S3
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FileText, Headphones, Image as ImageIcon, Lock, Download, 
  Play, Eye, Calendar, Sparkles, Star 
} from 'lucide-react';
import { useSanctuaire } from '../../contexts/SanctuaireContext';
import GlassCard from '../ui/GlassCard';
import DrawsWaiting from '../sanctuaire/DrawsWaiting';
import { CapabilityGuard } from '../auth/CapabilityGuard';
import { AudioPlayerProvider, useAudioPlayer } from '../../contexts/AudioPlayerContext';
import { sanctuaireService } from '../../services/sanctuaire';
import AssetsModal from '../sanctuaire/AssetsModal';
import { getLevelNameSafely } from '../../utils/orderUtils';
import { useSanctuaryAccess } from '../../hooks/useSanctuaryAccess';
import AccessGate from '../ui/AccessGate';
import { SanctuaryLevel } from '../../config/sanctuary-access';

// =================== TYPES ===================

interface Lecture {
  id: string;
  orderNumber: string;
  title: string;
  createdAt: string;
  deliveredAt?: string;
  level: number;
  levelName: string;
  pdfUrl?: string;
  audioUrl?: string;
  mandalaSvg?: string;
  reading?: string;
}

// =================== COMPOSANT PRINCIPAL ===================

const MesLecturesContent: React.FC = () => {
  const navigate = useNavigate();
  const { orders, isLoading, user, hasCapability } = useSanctuaire();
  const { play, setTrack } = useAudioPlayer();
  const { canAccess } = useSanctuaryAccess();
  
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [modal, setModal] = useState<{ 
    open: boolean; 
    pdfUrl?: string; 
    mandalaSvg?: string; 
    title?: string 
  }>({ open: false });

  // Mapper les orders vers le format Lecture
  useEffect(() => {
    if (orders && orders.length > 0) {
      const mapped: Lecture[] = orders.map((order: any) => ({
        id: order.id,
        orderNumber: order.orderNumber,
        title: order.formData?.specificQuestion || order.formData?.firstName || 'Lecture spirituelle',
        createdAt: order.createdAt,
        deliveredAt: order.deliveredAt,
        level: order.level,
        levelName: getLevelNameSafely(order.level),
        pdfUrl: order.generatedContent?.pdfUrl,
        audioUrl: order.generatedContent?.audioUrl,
        mandalaSvg: order.generatedContent?.mandalaSvg,
        reading: order.generatedContent?.reading,
      }));
      
      // Trier par date de livraison (plus récent en premier)
      const sorted = mapped.sort((a, b) => {
        const dateA = new Date(a.deliveredAt || a.createdAt).getTime();
        const dateB = new Date(b.deliveredAt || b.createdAt).getTime();
        return dateB - dateA;
      });
      
      setLectures(sorted);
    }
  }, [orders]);

  // =================== SKELETON LOADING ===================

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-8 w-48 bg-amber-400/20 rounded-lg animate-pulse" />
          <div className="h-10 w-32 bg-white/10 rounded-lg animate-pulse" />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <GlassCard key={i} className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="h-6 bg-amber-400/20 rounded-full animate-pulse w-3/4" />
                  <div className="h-8 w-16 bg-white/10 rounded animate-pulse" />
                </div>
                <div className="h-4 bg-white/10 rounded-full animate-pulse w-1/2" />
                <div className="flex gap-2">
                  {[...Array(3)].map((_, j) => (
                    <div key={j} className="h-9 w-24 bg-white/10 rounded-lg animate-pulse" />
                  ))}
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>
    );
  }

  // =================== ACCESS GATE ===================

  if (!canAccess('oracle.viewHistory')) {
    return (
      <div className="max-w-3xl mx-auto">
        <AccessGate
          feature="Historique des tirages"
          requiredLevel={SanctuaryLevel.PROFOND}
        />
      </div>
    );
  }

  // =================== EMPTY STATE ===================

  if (!lectures || lectures.length === 0) {
    return (
      <DrawsWaiting
        userEmail={user?.email}
        userPhone={user?.phone}
        estimatedTime="24 heures"
      />
    );
  }

  // =================== RENDU PRINCIPAL ===================

  return (
    <div className="space-y-6">
      
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h2 className="text-2xl font-playfair italic text-amber-400 flex items-center gap-3">
            <Sparkles className="w-6 h-6" />
            Mes Lectures Oracle
          </h2>
          <p className="text-white/70 mt-1">
            {lectures.length} lecture{lectures.length > 1 ? 's' : ''} disponible{lectures.length > 1 ? 's' : ''}
          </p>
        </motion.div>

        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/commande')}
          className="px-4 py-2 bg-gradient-to-r from-amber-400 to-amber-500 text-mystical-900 font-semibold rounded-lg hover:from-amber-500 hover:to-amber-600 transition-all shadow-lg"
        >
          Nouvelle lecture
        </motion.button>
      </div>

      {/* Grille de lectures */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        {lectures.map((lecture, index) => (
          <LectureCard
            key={lecture.id}
            lecture={lecture}
            index={index}
            hasCapability={hasCapability}
            onOpenPdf={async (pdfUrl: string, title: string) => {
              try {
                const signed = await sanctuaireService.getPresignedUrl(pdfUrl);
                setModal({ open: true, pdfUrl: signed, title });
              } catch (err) {
                console.error('[MesLectures] Erreur PDF:', err);
              }
            }}
            onPlayAudio={async (audioUrl: string, title: string) => {
              try {
                const signed = await sanctuaireService.getPresignedUrl(audioUrl);
                setTrack({ url: signed, title });
                play({ url: signed, title });
              } catch (err) {
                console.error('[MesLectures] Erreur Audio:', err);
              }
            }}
            onOpenMandala={async (mandalaSvg: string, title: string) => {
              try {
                const signed = await sanctuaireService.getPresignedUrl(mandalaSvg);
                setModal({ open: true, mandalaSvg: signed, title });
              } catch (err) {
                console.error('[MesLectures] Erreur Mandala:', err);
              }
            }}
          />
        ))}
      </motion.div>

      {/* Modal pour PDF et Mandala */}
      {modal.open && (
        <AssetsModal
          open={modal.open}
          onClose={() => setModal({ open: false })}
          pdfUrl={modal.pdfUrl}
          mandalaSvg={modal.mandalaSvg}
          title={modal.title}
        />
      )}
    </div>
  );
};

// =================== LECTURE CARD ===================

interface LectureCardProps {
  lecture: Lecture;
  index: number;
  hasCapability: (capability: string) => boolean;
  onOpenPdf: (pdfUrl: string, title: string) => void;
  onPlayAudio: (audioUrl: string, title: string) => void;
  onOpenMandala: (mandalaSvg: string, title: string) => void;
}

const LectureCard: React.FC<LectureCardProps> = ({
  lecture,
  index,
  hasCapability,
  onOpenPdf,
  onPlayAudio,
  onOpenMandala
}) => {
  const levelColors: Record<number, { bg: string; text: string; border: string }> = {
    1: { bg: 'from-blue-400/10 to-blue-500/5', text: 'text-blue-400', border: 'border-blue-400/30' },
    2: { bg: 'from-purple-400/10 to-purple-500/5', text: 'text-purple-400', border: 'border-purple-400/30' },
    3: { bg: 'from-amber-400/10 to-amber-500/5', text: 'text-amber-400', border: 'border-amber-400/30' },
    4: { bg: 'from-emerald-400/10 to-emerald-500/5', text: 'text-emerald-400', border: 'border-emerald-400/30' },
  };

  const colors = levelColors[lecture.level] || levelColors[1];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <GlassCard className={`bg-gradient-to-br ${colors.bg} border ${colors.border} hover:scale-[1.02] transition-transform duration-300`}>
        <div className="p-6 space-y-4">
          
          {/* En-tête */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className={`text-lg font-semibold ${colors.text} line-clamp-2 mb-2`}>
                {lecture.title}
              </h3>
              <div className="flex items-center gap-2 text-xs text-white/60">
                <Calendar className="w-3 h-3" />
                <span>
                  {new Date(lecture.deliveredAt || lecture.createdAt).toLocaleDateString('fr-FR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
            </div>

            {/* Badge niveau */}
            <div className={`px-3 py-1 rounded-full ${colors.bg} border ${colors.border}`}>
              <div className="flex items-center gap-1">
                <Star className={`w-3 h-3 ${colors.text}`} />
                <span className={`text-xs font-medium ${colors.text}`}>
                  {lecture.levelName}
                </span>
              </div>
            </div>
          </div>

          {/* Numéro de commande */}
          <div className="text-xs text-white/40">
            Commande #{lecture.orderNumber}
          </div>

          {/* Boutons d'action avec CapabilityGuard */}
          <div className="flex flex-wrap gap-2 pt-2">
            
            {/* Bouton PDF */}
            <CapabilityGuard
              requires="readings.pdf"
              fallback={
                <button
                  disabled
                  className="flex items-center gap-2 px-3 py-2 bg-gray-600/20 text-gray-400 rounded-lg cursor-not-allowed text-sm"
                  title="PDF disponible dès le niveau Initié"
                >
                  <Lock className="w-4 h-4" />
                  <FileText className="w-4 h-4" />
                  <span>PDF</span>
                </button>
              }
            >
              <button
                onClick={() => lecture.pdfUrl && onOpenPdf(lecture.pdfUrl, lecture.title)}
                disabled={!lecture.pdfUrl}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
                  lecture.pdfUrl
                    ? 'bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 border border-blue-400/30'
                    : 'bg-gray-600/20 text-gray-400 cursor-not-allowed'
                }`}
              >
                <Eye className="w-4 h-4" />
                <FileText className="w-4 h-4" />
                <span>PDF</span>
              </button>
            </CapabilityGuard>

            {/* Bouton Audio */}
            <CapabilityGuard
              requires="readings.audio"
              fallback={
                <button
                  disabled
                  className="flex items-center gap-2 px-3 py-2 bg-gray-600/20 text-gray-400 rounded-lg cursor-not-allowed text-sm"
                  title="Audio disponible dès le niveau Mystique"
                >
                  <Lock className="w-4 h-4" />
                  <Headphones className="w-4 h-4" />
                  <span>Audio</span>
                </button>
              }
            >
              <button
                onClick={() => lecture.audioUrl && onPlayAudio(lecture.audioUrl, lecture.title)}
                disabled={!lecture.audioUrl}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
                  lecture.audioUrl
                    ? 'bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 border border-purple-400/30'
                    : 'bg-gray-600/20 text-gray-400 cursor-not-allowed'
                }`}
              >
                <Play className="w-4 h-4" />
                <Headphones className="w-4 h-4" />
                <span>Audio</span>
              </button>
            </CapabilityGuard>

            {/* Bouton Mandala */}
            <CapabilityGuard
              requires="mandala.hd"
              fallback={
                <button
                  disabled
                  className="flex items-center gap-2 px-3 py-2 bg-gray-600/20 text-gray-400 rounded-lg cursor-not-allowed text-sm"
                  title="Mandala HD disponible dès le niveau Profond"
                >
                  <Lock className="w-4 h-4" />
                  <ImageIcon className="w-4 h-4" />
                  <span>Mandala</span>
                </button>
              }
            >
              <button
                onClick={() => lecture.mandalaSvg && onOpenMandala(lecture.mandalaSvg, lecture.title)}
                disabled={!lecture.mandalaSvg}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
                  lecture.mandalaSvg
                    ? 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-400/30'
                    : 'bg-gray-600/20 text-gray-400 cursor-not-allowed'
                }`}
              >
                <Eye className="w-4 h-4" />
                <ImageIcon className="w-4 h-4" />
                <span>Mandala</span>
              </button>
            </CapabilityGuard>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
};

const MesLectures: React.FC = () => (
  <AudioPlayerProvider>
    <MesLecturesContent />
  </AudioPlayerProvider>
);

export default MesLectures;
