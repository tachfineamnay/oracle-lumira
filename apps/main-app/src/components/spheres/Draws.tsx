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
  Clock, AlertCircle, Crown, Zap
} from 'lucide-react';
import { useSanctuaire } from '../../contexts/SanctuaireContext';
import GlassCard from '../ui/GlassCard';
import DrawsWaiting from '../sanctuaire/DrawsWaiting';
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
  const { orders, isLoading, user } = useSanctuaire();
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

      {/* Hero avec bienvenue + mandala tournant */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-950/80 via-purple-950/80 to-indigo-950/80 backdrop-blur-xl border border-white/20 p-8 shadow-2xl"
      >
        {/* Mandala tournant en arrière-plan */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
          className="absolute -right-20 -top-20 w-64 h-64 opacity-20"
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

        <div className="relative z-10 text-center space-y-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="inline-block"
          >
            <Sparkles className="w-10 h-10 text-amber-300 mx-auto drop-shadow-xl" />
          </motion.div>
          <h1 className="text-3xl md:text-5xl font-bold text-white drop-shadow-2xl">
            ✨ Bienvenue dans ton Sanctuaire, {user?.firstName || 'Âme Lumineuse'}
          </h1>
          <p className="text-white text-xl font-medium">
            Tes lectures sacrées t'attendent
          </p>
        </div>
      </motion.div>
      
      {/* En-tête */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h2 className="text-2xl font-playfair font-bold text-amber-300 flex items-center gap-3">
            <Sparkles className="w-6 h-6" />
            Mes Lectures Oracle
          </h2>
          <p className="text-white/80 mt-1 font-medium">
            Accédez à vos ressources spirituelles personnalisées
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/commande')}
          className="px-6 py-3 bg-gradient-to-r from-amber-400 to-amber-500 text-mystical-900 font-bold rounded-xl hover:from-amber-500 hover:to-amber-600 transition-all shadow-xl text-lg"
        >
          Nouvelle lecture
        </motion.button>
      </motion.div>

      {/* Layout principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Colonne gauche: Assets de la lecture sélectionnée */}
        <div className="lg:col-span-2">
          {selectedLecture && (
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
          )}
        </div>

        {/* Colonne droite: Liste des lectures + Upgrades */}
        <div className="space-y-6">
          
          {/* Liste des lectures */}
          <GlassCard className="p-5 bg-white/10 border-white/30 backdrop-blur-xl">
            <h3 className="text-lg font-bold text-white mb-4">Mes lectures</h3>
            <div className="space-y-3">
              {lectures.map((lecture) => (
                <button
                  key={lecture.id}
                  onClick={() => setSelectedLecture(lecture)}
                  className={`w-full text-left p-4 rounded-xl transition-all ${
                    selectedLecture?.id === lecture.id
                      ? 'bg-amber-400/30 border-2 border-amber-400/50 shadow-lg'
                      : 'bg-white/15 hover:bg-white/25 border border-white/25'
                  }`}
                >
                  <div className="text-base font-bold text-white line-clamp-1">
                    {lecture.title}
                  </div>
                  <div className="text-sm text-white/80 mt-2 flex items-center gap-2 font-medium">
                    <Calendar className="w-4 h-4" />
                    {new Date(lecture.deliveredAt || lecture.createdAt).toLocaleDateString('fr-FR')}
                  </div>
                </button>
              ))}
            </div>
          </GlassCard>

          {/* Section Upgrades */}
          {selectedLecture && (
            <UpgradeSection level={selectedLecture.level} />
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
    <GlassCard className={`bg-gradient-to-br ${levelConfig.color.bg} border ${levelConfig.color.border}`}>
      <div className="p-6 space-y-6">
        
        {/* En-tête */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className={`text-3xl font-extrabold ${levelConfig.color.text} mb-3`}>
              {lecture.title}
            </h3>
            <div className="flex items-center gap-4 text-base text-white/80 font-bold">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                {new Date(lecture.deliveredAt || lecture.createdAt).toLocaleDateString('fr-FR')}
              </div>
              <div className="text-sm text-white/60 font-bold">
                #{lecture.orderNumber}
              </div>
            </div>
          </div>

          {/* Badge niveau */}
          <div className={`px-5 py-3 rounded-full ${levelConfig.color.bg} border-2 ${levelConfig.color.border} shadow-xl`}>
            <div className="flex items-center gap-2">
              <Star className={`w-6 h-6 ${levelConfig.color.text}`} />
              <span className={`text-xl font-extrabold ${levelConfig.color.text}`}>
                {levelConfig.name}
              </span>
            </div>
          </div>
        </div>

        {/* Grille d'assets */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {assets.map((asset) => (
            <AssetTile
              key={asset.id}
              asset={asset}
              onOpen={() => {
                if (!asset.available || !asset.url) return;
                
                if (asset.type === 'pdf') onOpenPdf(asset.url, lecture.title);
                if (asset.type === 'audio') onPlayAudio(asset.url, lecture.title);
                if (asset.type === 'mandala') onOpenMandala(asset.url, lecture.title);
              }}
            />
          ))}
        </div>

        {/* Ligne de progression cosmique (4 étoiles) */}
        <div className="mt-4 pt-4 border-t border-white/10">
          <div className="flex items-center justify-center gap-3">
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
                      className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                        isUnlocked
                          ? 'bg-gradient-to-br from-amber-400 to-yellow-600 border-amber-400 shadow-lg shadow-amber-400/50'
                          : 'bg-gray-600/20 border-gray-600/50'
                      }`}
                    >
                      {isUnlocked ? (
                        <Star className="w-5 h-5 text-white fill-white" />
                      ) : (
                        <span className="text-gray-500 text-sm font-bold">{lvl}</span>
                      )}
                    </motion.div>
                    <p className={`text-xs mt-1 ${
                      isUnlocked ? 'text-amber-400 font-medium' : 'text-gray-500'
                    }`}>
                      {levelNames[lvl - 1]}
                    </p>
                  </div>
                  {lvl < 4 && (
                    <div className={`w-6 h-0.5 ${
                      lvl < lecture.level ? 'bg-amber-400' : 'bg-gray-600/50'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Statut de la lecture */}
        {lecture.deliveredAt ? (
          <div className="flex items-center gap-2 text-sm text-green-400 bg-green-400/10 border border-green-400/30 rounded-lg p-3">
            <Check className="w-4 h-4" />
            <span>Lecture livrée le {new Date(lecture.deliveredAt).toLocaleDateString('fr-FR')}</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-sm text-amber-400 bg-amber-400/10 border border-amber-400/30 rounded-lg p-3">
            <Clock className="w-4 h-4 animate-spin" />
            <div>
              <div>Lecture en cours de préparation</div>
              <div className="text-xs text-white/60 mt-1">
                Vous serez notifié par email dès qu'elle sera prête
              </div>
            </div>
          </div>
        )}
      </div>
    </GlassCard>
  );
};

// =================== COMPOSANT: TUILE ASSET ===================

interface AssetTileProps {
  asset: Asset;
  onOpen: () => void;
}

const AssetTile: React.FC<AssetTileProps> = ({ asset, onOpen }) => {
  const isReady = asset.available && asset.url;
  const isLocked = !asset.available;
  const isInProgress = asset.available && !asset.url;

  return (
    <motion.button
      whileHover={isReady ? { scale: 1.02 } : {}}
      whileTap={isReady ? { scale: 0.98 } : {}}
      onClick={isReady ? onOpen : undefined}
      disabled={!isReady}
      className={`p-4 rounded-xl border transition-all text-left ${
        isReady
          ? 'bg-white/10 border-white/20 hover:bg-white/20 cursor-pointer'
          : isLocked
          ? 'bg-gray-600/20 border-gray-600/30 cursor-not-allowed'
          : 'bg-amber-400/10 border-amber-400/30 cursor-wait'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className={`p-3 rounded-xl ${
          isReady ? 'bg-amber-400/30 text-amber-300' :
          isLocked ? 'bg-gray-700/40 text-gray-300' :
          'bg-amber-400/30 text-amber-300'
        }`}>
          {isLocked ? <Lock className="w-5 h-5" /> : asset.icon}
        </div>

        <div className="flex-1">
          <div className={`font-bold ${isLocked ? 'text-gray-300' : 'text-white'} text-lg`}>
            {asset.name}
          </div>
          
          {isReady && (
            <div className="text-xs text-green-300 flex items-center gap-1 mt-1 font-semibold">
              <Check className="w-3 h-3" />
              Disponible
            </div>
          )}
          
          {isLocked && (
            <div className="text-xs text-gray-300 mt-1 font-medium">
              {asset.lockedMessage}
            </div>
          )}
          
          {isInProgress && (
            <div className="text-xs text-amber-300 flex items-center gap-1 mt-1 font-semibold">
              <Clock className="w-3 h-3 animate-spin" />
              En cours...
            </div>
          )}
        </div>

        {isReady && (
          <div className="text-amber-400">
            {asset.type === 'pdf' && <Eye className="w-5 h-5" />}
            {asset.type === 'audio' && <Play className="w-5 h-5" />}
            {asset.type === 'mandala' && <Eye className="w-5 h-5" />}
          </div>
        )}
      </div>
    </motion.button>
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
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-white/80">Débloquez plus de ressources</h3>
      
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
                ? 'bg-gray-600/20 border-gray-600/30' 
                : 'bg-white/5 hover:bg-white/10 border-white/10 hover:border-amber-400/30 transition-all'
            }`}>
              <div className="p-4 space-y-3">
                
                {/* En-tête */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {isComingSoon ? (
                      <div className="p-2 rounded-lg bg-gray-700/40">
                        <Crown className="w-5 h-5 text-gray-300" />
                      </div>
                    ) : (
                      <div className="p-2 rounded-lg bg-gradient-to-br from-amber-400/30 to-amber-500/20">
                        <Zap className="w-5 h-5 text-amber-300" />
                      </div>
                    )}
                    <div>
                      <div className={`font-bold ${isComingSoon ? 'text-gray-300' : 'text-white'} text-lg`}>
                        {option.name}
                      </div>
                      <div className={`text-sm ${isComingSoon ? 'text-gray-400' : 'text-white/80'} font-semibold`}>
                        {option.price}
                      </div>
                    </div>
                  </div>

                  {isComingSoon && (
                    <div className="px-2 py-1 rounded-full bg-gray-600/30 border border-gray-600/50">
                      <span className="text-xs text-gray-400">Bientôt</span>
                    </div>
                  )}
                </div>

                {/* Features */}
                <ul className="space-y-1">
                  {option.features.slice(0, 3).map((feature, index) => (
                    <li key={index} className={`text-sm flex items-start gap-2 ${isComingSoon ? 'text-gray-400' : 'text-white/80'} font-medium`}>
                      <Check className="w-4 h-4 mt-0.5 flex-shrink-0 text-amber-400" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <button
                  onClick={() => !isComingSoon && navigate('/commande')}
                  disabled={isComingSoon}
                  className={`w-full py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                    isComingSoon
                      ? 'bg-gray-600/30 text-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-amber-400/20 to-amber-500/10 text-amber-400 border border-amber-400/30 hover:from-amber-400/30 hover:to-amber-500/20'
                  }`}
                >
                  {option.ctaText}
                  {!isComingSoon && <ArrowRight className="w-4 h-4" />}
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
