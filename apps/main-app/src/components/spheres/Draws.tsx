/**
 * Draws - Page principale des Lectures Oracle (MVP)
 * 
 * LOGIQUE MVP:
 * - Niveau 1 (Initié): GRATUIT (0€), PDF uniquement
 * - Niveau 2 (Mystique): 47€, PDF + Audio
 * - Niveau 3 (Profond): 67€, PDF + Audio + Mandala
 * - Niveau 4 (Intégral): GRISÉ "Bientôt disponible"
 * 
 * FEATURES:
 * - Grille d'assets avec états (Disponible/Verrouillé/En cours)
 * - Cartes d'upgrade contextuelles (N1→2/3, N2→3, N3→aucune)
 * - Messages clairs pour chaque état
 * - Zero friction, zero pression commerciale
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, Headphones, Image as ImageIcon, Lock, Download, 
  Play, Eye, Calendar, Sparkles, Star, ArrowRight, Check,
  Clock, AlertCircle, Crown, Zap, MapPin, Target, HelpCircle
} from 'lucide-react';
import { useSanctuaire } from '../../contexts/SanctuaireContext';
import GlassCard from '../ui/GlassCard';
import { AudioPlayerProvider, useAudioPlayer } from '../../contexts/AudioPlayerContext';
import { sanctuaireService } from '../../services/sanctuaire';
import AssetsModal from '../sanctuaire/AssetsModal';
import { getLevelNameSafely } from '../../utils/orderUtils';

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
  // Contexte onboarding
  question?: string;
  objective?: string;
  dateOfBirth?: string;
  birthTime?: string;
  birthPlace?: string;
  status?: string;
}

interface Asset {
  id: string;
  name: string;
  icon: React.ReactNode;
  available: boolean;
  url?: string;
  type: 'pdf' | 'audio' | 'mandala' | 'ritual';
  lockedMessage?: string;
  requiredLevel?: number;
}

interface UpgradeOption {
  level: number;
  name: string;
  price: string;
  features: string[];
  ctaText: string;
  isComingSoon?: boolean;
}

// =================== CONFIGURATION NIVEAUX ===================

const LEVEL_CONFIG = {
  1: {
    name: 'Initié',
    color: { bg: 'from-blue-400/10 to-blue-500/5', text: 'text-blue-400', border: 'border-blue-400/30' },
    assets: ['pdf'],
    upgrades: [2, 3], // Peut upgrader vers 2 et 3
  },
  2: {
    name: 'Mystique',
    color: { bg: 'from-purple-400/10 to-purple-500/5', text: 'text-purple-400', border: 'border-purple-400/30' },
    assets: ['pdf', 'audio'],
    upgrades: [3], // Peut upgrader vers 3 uniquement
  },
  3: {
    name: 'Profond',
    color: { bg: 'from-amber-400/10 to-amber-500/5', text: 'text-amber-400', border: 'border-amber-400/30' },
    assets: ['pdf', 'audio', 'mandala'],
    upgrades: [], // Aucun upgrade (niveau 4 bientôt disponible)
  },
  4: {
    name: 'Intégral',
    color: { bg: 'from-emerald-400/10 to-emerald-500/5', text: 'text-emerald-400', border: 'border-emerald-400/30' },
    assets: ['pdf', 'audio', 'mandala', 'ritual'],
    upgrades: [],
  },
};

const UPGRADE_OPTIONS: Record<number, UpgradeOption> = {
  2: {
    level: 2,
    name: 'Niveau Mystique',
    price: '47€',
    features: [
      'Lecture PDF complète',
      'Lecture Audio (voix sacrée)',
      'Guidance approfondie',
      'Support prioritaire',
    ],
    ctaText: 'Débloquer le niveau Mystique',
  },
  3: {
    level: 3,
    name: 'Niveau Profond',
    price: '67€',
    features: [
      'Tout le contenu Mystique',
      'Mandala personnalisé HD',
      'Support visuel pour méditation',
      'Guide d\'activation du Mandala',
    ],
    ctaText: 'Débloquer le niveau Profond',
  },
  4: {
    level: 4,
    name: 'Niveau Intégral',
    price: 'Bientôt',
    features: [
      'Tout le contenu Profond',
      'Rituels personnalisés audio/vidéo',
      'Protocoles d\'activation',
      'Suivi personnalisé 30 jours',
    ],
    ctaText: 'Bientôt disponible',
    isComingSoon: true,
  },
};

// =================== COMPOSANT PRINCIPAL ===================

const DrawsContent: React.FC = () => {
  const navigate = useNavigate();
  const { orders, isLoading, user, profile } = useSanctuaire();
  const { play, setTrack } = useAudioPlayer();
  
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [selectedLecture, setSelectedLecture] = useState<Lecture | null>(null);
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
        // Contexte onboarding (formData + clientInputs)
        question: order.formData?.specificQuestion || order.clientInputs?.lifeQuestion,
        objective: order.formData?.objective || order.clientInputs?.specificContext,
        dateOfBirth: order.formData?.dateOfBirth,
        birthTime: order.clientInputs?.birthTime,
        birthPlace: order.clientInputs?.birthPlace,
        status: order.status,
      }));
      
      // Trier par date de livraison (plus récent en premier)
      const sorted = mapped.sort((a, b) => {
        const dateA = new Date(a.deliveredAt || a.createdAt).getTime();
        const dateB = new Date(b.deliveredAt || b.createdAt).getTime();
        return dateB - dateA;
      });
      
      setLectures(sorted);
      
      // Sélectionner la première lecture par défaut
      if (sorted.length > 0 && !selectedLecture) {
        setSelectedLecture(sorted[0]);
      }
    }
  }, [orders]);

  // =================== SKELETON LOADING ===================

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-amber-400/20 rounded-lg animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <GlassCard className="p-6">
              <div className="space-y-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-24 bg-white/10 rounded-lg animate-pulse" />
                ))}
              </div>
            </GlassCard>
          </div>
          <div>
            <GlassCard className="p-6">
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-32 bg-white/10 rounded-lg animate-pulse" />
                ))}
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    );
  }

  // =================== EMPTY STATE ===================

  if (!lectures || lectures.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="w-24 h-24 mx-auto bg-gradient-to-br from-amber-400/20 to-purple-400/20 rounded-full flex items-center justify-center">
            <Clock className="w-12 h-12 text-amber-400" />
          </div>
          <h2 className="text-2xl font-bold text-white">Votre lecture est en préparation</h2>
          <p className="text-white/70">Vous serez notifié par email dès qu'elle sera prête</p>
          <button
            onClick={() => navigate('/sanctuaire')}
            className="px-6 py-3 bg-gradient-to-r from-amber-400 to-amber-500 text-mystical-900 font-bold rounded-xl hover:from-amber-500 hover:to-amber-600 transition-all shadow-xl"
          >
            Retour au Sanctuaire
          </button>
        </motion.div>
      </div>
    );
  }

  // =================== RENDU PRINCIPAL ===================

  return (
    <div className="space-y-8">

      {/* Hero avec bienvenue + mandala tournant - COMPACT */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-950/80 via-purple-950/80 to-indigo-950/80 backdrop-blur-xl border border-white/20 p-6 shadow-2xl"
      >
        {/* Mandala tournant en arrière-plan */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
          className="absolute -right-16 -top-16 w-48 h-48 opacity-15"
        >
          <svg viewBox="0 0 200 200" className="w-full h-full">
            <circle cx="100" cy="100" r="80" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-amber-400" />
            <circle cx="100" cy="100" r="60" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-purple-400" />
            <circle cx="100" cy="100" r="40" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-blue-400" />
            {[...Array(12)].map((_, i) => {
              const angle = (i * 30 * Math.PI) / 180;
              const x1 = 100 + 40 * Math.cos(angle);
              const y1 = 100 + 40 * Math.sin(angle);
              const x2 = 100 + 80 * Math.cos(angle);
              const y2 = 100 + 80 * Math.sin(angle);
              return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="currentColor" strokeWidth="0.3" className="text-amber-400" />;
            })}
          </svg>
        </motion.div>

        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            >
              <Sparkles className="w-8 h-8 text-amber-300 drop-shadow-xl" />
            </motion.div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white drop-shadow-2xl">
                Bienvenue, {user?.firstName || 'Âme Lumineuse'}
              </h1>
              <p className="text-white/80 text-sm font-medium">
                Tes lectures sacrées t'attendent
              </p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/commande')}
            className="px-5 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 text-mystical-900 font-bold rounded-xl hover:from-amber-500 hover:to-amber-600 transition-all shadow-xl text-sm"
          >
            Nouvelle lecture
          </motion.button>
        </div>
      </motion.div>

      {/* Layout principal - RÉORGANISÉ */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* Colonne gauche: Liste des lectures (sidebar secondaire) */}
        <div className="xl:col-span-3">
          <GlassCard className="p-4 bg-white/5 border-white/20 backdrop-blur-xl sticky top-6">
            <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-400" />
              Mes lectures
            </h3>
            <div className="space-y-2 max-h-[calc(100vh-300px)] overflow-y-auto pr-2 -mr-2">
              {lectures.map((lecture) => (
                <button
                  key={lecture.id}
                  onClick={() => setSelectedLecture(lecture)}
                  className={`w-full text-left p-3 rounded-lg transition-all ${
                    selectedLecture?.id === lecture.id
                      ? 'bg-amber-400/25 border-2 border-amber-400/50 shadow-lg'
                      : 'bg-white/10 hover:bg-white/15 border border-white/20'
                  }`}
                >
                  <div className="text-sm font-bold text-white line-clamp-2 mb-2">
                    {lecture.title}
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-white/60 font-medium">
                      {new Date(lecture.deliveredAt || lecture.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                      lecture.level === 1 ? 'bg-blue-400/20 text-blue-300' :
                      lecture.level === 2 ? 'bg-purple-400/20 text-purple-300' :
                      'bg-amber-400/20 text-amber-300'
                    }`}>
                      {lecture.levelName}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* Colonne centrale: Contexte + Assets (pile verticale) */}
        <div className="xl:col-span-6 space-y-4">
          {selectedLecture && (
            <>
              {/* 1. CONTEXTE DE LA LECTURE (en premier) */}
              <LectureContext lecture={selectedLecture} profile={profile} />

              {/* 2. ASSETS DE LA LECTURE */}
              <LectureAssets
                lecture={selectedLecture}
                onOpenPdf={async (pdfUrl: string, title: string) => {
                  try {
                    const signed = await sanctuaireService.getPresignedUrl(pdfUrl);
                    setModal({ open: true, pdfUrl: signed, title });
                  } catch (err) {
                    console.error('[Draws] Erreur PDF:', err);
                  }
                }}
                onPlayAudio={async (audioUrl: string, title: string) => {
                  try {
                    const signed = await sanctuaireService.getPresignedUrl(audioUrl);
                    setTrack({ url: signed, title });
                    play({ url: signed, title });
                  } catch (err) {
                    console.error('[Draws] Erreur Audio:', err);
                  }
                }}
                onOpenMandala={async (mandalaSvg: string, title: string) => {
                  try {
                    const signed = await sanctuaireService.getPresignedUrl(mandalaSvg);
                    setModal({ open: true, mandalaSvg: signed, title });
                  } catch (err) {
                    console.error('[Draws] Erreur Mandala:', err);
                  }
                }}
              />

              {/* 3. TIMELINE DE STATUT */}
              <OrderStatusTimeline status={selectedLecture.status} deliveredAt={selectedLecture.deliveredAt} />
            </>
          )}
        </div>

        {/* Colonne droite: Upgrades */}
        <div className="xl:col-span-3">
          {selectedLecture && (
            <div className="sticky top-6">
              <UpgradeSection level={selectedLecture.level} />
            </div>
          )}
        </div>
      </div>

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

// =================== COMPOSANT: CONTEXTE DE LA LECTURE ===================

interface LectureContextProps {
  lecture: Lecture;
  profile: any | null;
}

const LectureContext: React.FC<LectureContextProps> = ({ lecture, profile }) => {
  const question = lecture.question || profile?.specificQuestion;
  const objective = lecture.objective || profile?.spiritualObjective;
  const dateOfBirth = lecture.dateOfBirth || profile?.birthDate;
  const birthTime = lecture.birthTime || profile?.birthTime;
  const birthPlace = lecture.birthPlace || profile?.birthPlace;

  const hasAny = !!question || !!objective || !!dateOfBirth || !!birthTime || !!birthPlace;

  if (!hasAny) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <GlassCard className="p-4 bg-white/10 border-white/20 backdrop-blur-xl">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            Contexte de la lecture
          </h3>
          <span className="text-[10px] text-white/50 font-medium">
            Préparé à partir de vos informations
          </span>
        </div>

        <div className="space-y-2.5">
          {question && (
            <div className="flex items-start gap-2.5">
              <div className="p-1.5 rounded-lg bg-amber-400/10 flex-shrink-0">
                <HelpCircle className="w-4 h-4 text-amber-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[10px] text-white/60 font-bold uppercase tracking-wide mb-0.5">Question</div>
                <div className="text-sm text-white/90 leading-snug">{question}</div>
              </div>
            </div>
          )}

          {objective && (
            <div className="flex items-start gap-2.5">
              <div className="p-1.5 rounded-lg bg-purple-400/10 flex-shrink-0">
                <Target className="w-4 h-4 text-purple-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[10px] text-white/60 font-bold uppercase tracking-wide mb-0.5">Objectif</div>
                <div className="text-sm text-white/90 leading-snug">{objective}</div>
              </div>
            </div>
          )}

          {(dateOfBirth || birthTime || birthPlace) && (
            <div className="flex items-start gap-2.5">
              <div className="p-1.5 rounded-lg bg-blue-400/10 flex-shrink-0">
                <Calendar className="w-4 h-4 text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[10px] text-white/60 font-bold uppercase tracking-wide mb-0.5">Naissance</div>
                <div className="text-sm text-white/90 flex flex-wrap items-center gap-2">
                  {dateOfBirth && <span>{new Date(dateOfBirth).toLocaleDateString('fr-FR')}</span>}
                  {birthTime && (
                    <span className="flex items-center gap-1 text-white/70 text-xs">
                      <Clock className="w-3 h-3" />
                      {birthTime}
                    </span>
                  )}
                  {birthPlace && (
                    <span className="flex items-center gap-1 text-white/70 text-xs">
                      <MapPin className="w-3 h-3" />
                      {birthPlace}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </GlassCard>
    </motion.div>
  );
};

// =================== COMPOSANT: TIMELINE DE STATUT ===================

interface OrderStatusTimelineProps {
  status?: string;
  deliveredAt?: string;
}

const OrderStatusTimeline: React.FC<OrderStatusTimelineProps> = ({ status, deliveredAt }) => {
  const statuses = [
    { key: 'paid', label: 'Payé', icon: Check },
    { key: 'processing', label: 'En cours', icon: Clock },
    { key: 'awaiting_validation', label: 'Validation', icon: AlertCircle },
    { key: 'completed', label: 'Livré', icon: Check },
  ];

  const currentIndex = status === 'completed' ? 3 : status === 'awaiting_validation' ? 2 : status === 'processing' ? 1 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
    >
      <GlassCard className="p-4 bg-white/5 border-white/10 backdrop-blur-xl">
        <h3 className="text-xs font-bold text-white/80 mb-3 flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-amber-400" />
          Suivi de votre lecture
        </h3>
        <div className="flex items-center justify-between">
          {statuses.map((s, idx) => {
            const isActive = idx <= currentIndex;
            const Icon = s.icon;
            return (
              <React.Fragment key={s.key}>
                <div className="flex flex-col items-center gap-1.5 flex-1">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all ${
                    isActive
                      ? 'bg-gradient-to-br from-amber-400 to-yellow-600 border-amber-400 shadow-lg shadow-amber-400/30'
                      : 'bg-gray-700/30 border-gray-600/50'
                  }`}>
                    <Icon className={`w-3.5 h-3.5 ${
                      isActive ? 'text-white' : 'text-gray-500'
                    }`} />
                  </div>
                  <p className={`text-[10px] font-medium text-center ${
                    isActive ? 'text-amber-400' : 'text-gray-500'
                  }`}>
                    {s.label}
                  </p>
                </div>
                {idx < statuses.length - 1 && (
                  <div className={`h-0.5 flex-1 ${
                    idx < currentIndex ? 'bg-amber-400' : 'bg-gray-600/50'
                  }`} />
                )}
              </React.Fragment>
            );
          })}
        </div>
        {deliveredAt && (
          <div className="mt-3 pt-3 border-t border-white/10 text-center">
            <p className="text-xs text-green-400 font-medium">
              ✓ Livrée le {new Date(deliveredAt).toLocaleDateString('fr-FR')}
            </p>
          </div>
        )}
      </GlassCard>
    </motion.div>
  );
};

// =================== COMPOSANT: ASSETS D'UNE LECTURE ===================

interface LectureAssetsProps {
  lecture: Lecture;
  onOpenPdf: (pdfUrl: string, title: string) => void;
  onPlayAudio: (audioUrl: string, title: string) => void;
  onOpenMandala: (mandalaSvg: string, title: string) => void;
}

const LectureAssets: React.FC<LectureAssetsProps> = ({
  lecture,
  onOpenPdf,
  onPlayAudio,
  onOpenMandala
}) => {
  const [activeTab, setActiveTab] = useState<'pdf' | 'audio' | 'mandala'>('pdf');
  const levelConfig = LEVEL_CONFIG[lecture.level as keyof typeof LEVEL_CONFIG] || LEVEL_CONFIG[1];
  const availableAssets = levelConfig.assets;

  // Construire la liste des assets
  const assets: Asset[] = [
    {
      id: 'pdf',
      name: 'Lecture PDF',
      icon: <FileText className="w-5 h-5" />,
      available: availableAssets.includes('pdf'),
      url: lecture.pdfUrl,
      type: 'pdf',
      lockedMessage: 'Disponible dès le niveau Initié',
      requiredLevel: 1,
    },
    {
      id: 'audio',
      name: 'Lecture Audio',
      icon: <Headphones className="w-5 h-5" />,
      available: availableAssets.includes('audio'),
      url: lecture.audioUrl,
      type: 'audio',
      lockedMessage: 'Débloqué au niveau Mystique',
      requiredLevel: 2,
    },
    {
      id: 'mandala',
      name: 'Mandala HD',
      icon: <ImageIcon className="w-5 h-5" />,
      available: availableAssets.includes('mandala'),
      url: lecture.mandalaSvg,
      type: 'mandala',
      lockedMessage: 'Débloqué au niveau Profond',
      requiredLevel: 3,
    },
    {
      id: 'ritual',
      name: 'Rituels personnalisés',
      icon: <Sparkles className="w-5 h-5" />,
      available: availableAssets.includes('ritual'),
      url: undefined,
      type: 'ritual',
      lockedMessage: 'Bientôt disponible (Niveau Intégral)',
      requiredLevel: 4,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.05 }}
    >
      <GlassCard className={`bg-gradient-to-br ${levelConfig.color.bg} border ${levelConfig.color.border}`}>
        <div className="p-5 space-y-4">
        
        {/* En-tête COMPACT */}
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h3 className={`text-xl font-bold ${levelConfig.color.text} line-clamp-2 mb-2`}>
                {lecture.title}
              </h3>
              <div className="flex flex-wrap items-center gap-3 text-sm text-white/70">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  {new Date(lecture.deliveredAt || lecture.createdAt).toLocaleDateString('fr-FR')}
                </div>
                <span className="text-white/40">•</span>
                <span className="text-white/50 font-mono text-xs">#{lecture.orderNumber}</span>
              </div>
            </div>

            {/* Badge niveau COMPACT */}
            <div className={`px-3 py-1.5 rounded-full ${levelConfig.color.bg} border ${levelConfig.color.border} shadow-lg flex-shrink-0`}>
              <div className="flex items-center gap-1.5">
                <Star className={`w-4 h-4 ${levelConfig.color.text}`} />
                <span className={`text-sm font-bold ${levelConfig.color.text}`}>
                  {levelConfig.name}
                </span>
              </div>
            </div>
          </div>

          {/* Segmented Control - Tabs pour basculer entre assets */}
          <div className="flex items-center gap-1 p-1 bg-white/5 rounded-lg border border-white/10">
            {[
              { id: 'pdf' as const, label: 'PDF', icon: FileText },
              { id: 'audio' as const, label: 'Audio', icon: Headphones },
              { id: 'mandala' as const, label: 'Mandala', icon: ImageIcon },
            ].map((tab) => {
              const asset = assets.find(a => a.type === tab.id);
              const isAvailable = asset?.available;
              const isActive = activeTab === tab.id;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => isAvailable && setActiveTab(tab.id)}
                  disabled={!isAvailable}
                  className={`flex-1 px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    isActive && isAvailable
                      ? 'bg-amber-400/25 text-amber-300 shadow-lg border border-amber-400/30'
                      : isAvailable
                      ? 'text-white/70 hover:text-white hover:bg-white/10'
                      : 'text-gray-500 cursor-not-allowed opacity-50'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {tab.label}
                  {!isAvailable && <Lock className="w-3 h-3" />}
                </button>
              );
            })}
          </div>

          {/* Ligne de progression cosmique (4 étoiles) - COMPACT */}
          <div className="flex items-center justify-center gap-2 py-2.5 border-y border-white/10">
            {[1, 2, 3, 4].map((lvl) => {
              const isUnlocked = lvl <= lecture.level;
              const levelNames = ['Initié', 'Mystique', 'Profond', 'Intégral'];
              return (
                <div key={lvl} className="flex items-center">
                  <div className="text-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.1 + lvl * 0.05 }}
                      className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                        isUnlocked
                          ? 'bg-gradient-to-br from-amber-400 to-yellow-600 border-amber-400 shadow-lg shadow-amber-400/30'
                          : 'bg-gray-700/30 border-gray-600/50'
                      }`}
                    >
                      {isUnlocked ? (
                        <Star className="w-4 h-4 text-white fill-white" />
                      ) : (
                        <span className="text-gray-500 text-xs font-bold">{lvl}</span>
                      )}
                    </motion.div>
                    <p className={`text-[10px] mt-1 ${
                      isUnlocked ? 'text-amber-400 font-medium' : 'text-gray-500'
                    }`}>
                      {levelNames[lvl - 1]}
                    </p>
                  </div>
                  {lvl < 4 && (
                    <div className={`w-4 h-0.5 ${
                      lvl < lecture.level ? 'bg-amber-400' : 'bg-gray-600/50'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Asset actif (basé sur le tab sélectionné) */}
        <AnimatePresence mode="wait">
          {assets
            .filter((asset) => asset.type === activeTab)
            .map((asset) => (
              <motion.div
                key={asset.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
              >
                <AssetTileLarge
                  asset={asset}
                  onOpen={() => {
                    if (!asset.available || !asset.url) return;
                    if (asset.type === 'pdf') onOpenPdf(asset.url, lecture.title);
                    if (asset.type === 'audio') onPlayAudio(asset.url, lecture.title);
                    if (asset.type === 'mandala') onOpenMandala(asset.url, lecture.title);
                  }}
                />
              </motion.div>
            ))}
        </AnimatePresence>

      </div>
    </GlassCard>
    </motion.div>
  );
};

// =================== COMPOSANT: TUILE ASSET LARGE ===================

interface AssetTileLargeProps {
  asset: Asset;
  onOpen: () => void;
}

const AssetTileLarge: React.FC<AssetTileLargeProps> = ({ asset, onOpen }) => {
  const isReady = asset.available && asset.url;
  const isLocked = !asset.available;
  const isInProgress = asset.available && !asset.url;

  return (
    <div className={`p-4 rounded-xl border transition-all ${
      isReady
        ? 'bg-white/10 border-white/20'
        : isLocked
        ? 'bg-gray-600/10 border-gray-600/25'
        : 'bg-amber-400/10 border-amber-400/25'
    }`}>
      <div className="flex items-start gap-3 mb-3">
        <div className={`p-2.5 rounded-lg flex-shrink-0 ${
          isReady ? 'bg-amber-400/25 text-amber-300' :
          isLocked ? 'bg-gray-700/30 text-gray-400' :
          'bg-amber-400/25 text-amber-300'
        }`}>
          {isLocked ? <Lock className="w-6 h-6" /> : React.cloneElement(asset.icon as React.ReactElement, { className: 'w-6 h-6' })}
        </div>

        <div className="flex-1 min-w-0">
          <div className={`font-bold text-base ${
            isLocked ? 'text-gray-300' : 'text-white'
          }`}>
            {asset.name}
          </div>
          
          {isReady && (
            <div className="text-xs text-green-300 flex items-center gap-1 mt-1 font-medium">
              <Check className="w-3.5 h-3.5" />
              Prêt à consulter
            </div>
          )}
          
          {isLocked && (
            <div className="text-xs text-gray-400 mt-1">
              {asset.lockedMessage}
            </div>
          )}
          
          {isInProgress && (
            <div className="text-xs text-amber-300 flex items-center gap-1 mt-1 font-medium">
              <Clock className="w-3.5 h-3.5 animate-spin" />
              Génération en cours...
            </div>
          )}
        </div>
      </div>

      {isReady && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onOpen}
          className="w-full py-2.5 rounded-lg bg-gradient-to-r from-amber-400/20 to-amber-500/10 text-amber-300 border border-amber-400/30 hover:from-amber-400/30 hover:to-amber-500/20 transition-all font-bold text-sm flex items-center justify-center gap-2"
        >
          {asset.type === 'pdf' && <><Eye className="w-4 h-4" /> Voir le PDF</>
          }
          {asset.type === 'audio' && <><Play className="w-4 h-4" /> Écouter l'audio</>
          }
          {asset.type === 'mandala' && <><Eye className="w-4 h-4" /> Voir le Mandala</>
          }
        </motion.button>
      )}

      {isLocked && (
        <div className="w-full py-2.5 rounded-lg bg-gray-600/25 text-gray-400 border border-gray-600/40 font-medium text-sm flex items-center justify-center gap-2 cursor-not-allowed">
          <Lock className="w-4 h-4" />
          Niveau {asset.requiredLevel} requis
        </div>
      )}
    </div>
  );
};

// =================== COMPOSANT: SECTION UPGRADES ===================

interface UpgradeSectionProps {
  level: number;
}

const UpgradeSection: React.FC<UpgradeSectionProps> = ({ level }) => {
  const navigate = useNavigate();
  const levelConfig = LEVEL_CONFIG[level as keyof typeof LEVEL_CONFIG] || LEVEL_CONFIG[1];
  const availableUpgrades = levelConfig.upgrades;

  // Toujours afficher niveau 4 (grisé)
  const upgradeOptions = [...availableUpgrades, 4];

  if (upgradeOptions.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-bold text-white/90 flex items-center gap-2">
        <Zap className="w-4 h-4 text-amber-400" />
        Débloquer plus
      </h3>
      
      {upgradeOptions.map((upgradeLevel) => {
        const option = UPGRADE_OPTIONS[upgradeLevel];
        if (!option) return null;

        const isComingSoon = option.isComingSoon;

        return (
          <motion.div
            key={upgradeLevel}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: upgradeLevel * 0.1 }}
          >
            <GlassCard className={`${
              isComingSoon 
                ? 'bg-gray-600/15 border-gray-600/25' 
                : 'bg-white/5 hover:bg-white/10 border-white/10 hover:border-amber-400/30 transition-all cursor-pointer'
            }`}>
              <div className="p-3 space-y-2.5">
                
                {/* En-tête COMPACT */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2 flex-1 min-w-0">
                    {isComingSoon ? (
                      <div className="p-1.5 rounded-lg bg-gray-700/30 flex-shrink-0">
                        <Crown className="w-4 h-4 text-gray-400" />
                      </div>
                    ) : (
                      <div className="p-1.5 rounded-lg bg-gradient-to-br from-amber-400/25 to-amber-500/15 flex-shrink-0">
                        <Zap className="w-4 h-4 text-amber-300" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className={`font-bold text-sm ${
                        isComingSoon ? 'text-gray-300' : 'text-white'
                      } line-clamp-1`}>
                        {option.name}
                      </div>
                      <div className={`text-xs font-bold ${
                        isComingSoon ? 'text-gray-400' : 'text-amber-300'
                      }`}>
                        {option.price}
                      </div>
                    </div>
                  </div>

                  {isComingSoon && (
                    <div className="px-1.5 py-0.5 rounded-full bg-gray-600/25 border border-gray-600/40 flex-shrink-0">
                      <span className="text-[10px] text-gray-400 font-medium">Bientôt</span>
                    </div>
                  )}
                </div>

                {/* Features COMPACT */}
                <ul className="space-y-0.5">
                  {option.features.slice(0, 2).map((feature, index) => (
                    <li key={index} className={`text-xs flex items-start gap-1.5 ${
                      isComingSoon ? 'text-gray-400' : 'text-white/70'
                    }`}>
                      <Check className="w-3 h-3 mt-0.5 flex-shrink-0 text-amber-400" />
                      <span className="line-clamp-1">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA COMPACT */}
                <button
                  onClick={() => !isComingSoon && navigate('/commande')}
                  disabled={isComingSoon}
                  className={`w-full py-1.5 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1.5 ${
                    isComingSoon
                      ? 'bg-gray-600/25 text-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-amber-400/20 to-amber-500/10 text-amber-400 border border-amber-400/30 hover:from-amber-400/30 hover:to-amber-500/20'
                  }`}
                >
                  {!isComingSoon && <ArrowRight className="w-3 h-3" />}
                  {option.ctaText}
                </button>
              </div>
            </GlassCard>
          </motion.div>
        );
      })}
    </div>
  );
};

// =================== WRAPPER AVEC AUDIO PROVIDER ===================

const Draws: React.FC = () => (
  <AudioPlayerProvider>
    <DrawsContent />
  </AudioPlayerProvider>
);

export default Draws;
