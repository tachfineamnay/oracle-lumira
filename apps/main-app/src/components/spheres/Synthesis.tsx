import React, { useEffect, useState, useRef } from 'react';
import GlassCard from '../ui/GlassCard';
import EmptyState from '../ui/EmptyState';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { PrimaryButton, TertiaryButton } from '../ui/Buttons';
import { X, Award } from 'lucide-react';
import { useSanctuaire } from '../../contexts/SanctuaireContext';
import { useNavigate } from 'react-router-dom';

type CategoryKey = 'Relations' | 'Travail' | 'Santé' | 'Spirituel' | 'Finance' | 'Créativité' | 'Emotions' | 'Mission';

type Insight = {
  id: string;
  category: CategoryKey;
  short: string; // 2-line summary
  full: string; // full insight
  updatedAt: string; // ISO
};

// Catégories réorganisées pour un layout plus intuitif
const categoriesInOrder: CategoryKey[] = [
  'Spirituel', 'Relations', 'Mission', 'Créativité',
  'Emotions', 'Travail', 'Santé', 'Finance'
];

const LAST_SEEN_KEY = 'synthesis_last_seen_v1';

const formatDate = (iso?: string) => (iso ? new Date(iso).toLocaleString() : '');

const Synthesis: React.FC = () => {
  const navigate = useNavigate();
  const [insights, setInsights] = useState<Record<CategoryKey, Insight | null>>(() => {
    const map: Record<CategoryKey, Insight | null> = {
      Relations: null,
      Travail: null,
      Santé: null,
      Spirituel: null,
      Finance: null,
      Créativité: null,
      Emotions: null,
      Mission: null,
    };
    return map;
  });

  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Insight | null>(null);
  const [activeSection, setActiveSection] = useState<string>('spirituel');
  const { levelMetadata, user } = useSanctuaire();
  const levelName = (levelMetadata?.name as string) || 'Initié';
  const levelColor = (levelMetadata?.color as string) || 'amber';

  // Références pour sections
  const spirituelRef = useRef<HTMLDivElement>(null);
  const relationsRef = useRef<HTMLDivElement>(null);
  const missionRef = useRef<HTMLDivElement>(null);
  const creativiteRef = useRef<HTMLDivElement>(null);
  const emotionsRef = useRef<HTMLDivElement>(null);
  const travailRef = useRef<HTMLDivElement>(null);
  const santeRef = useRef<HTMLDivElement>(null);
  const financeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    axios
      .get<Insight[]>('/api/insights/synthesis')
      .then((res) => {
        if (!mounted) return;
        const byCat = res.data.reduce((acc: Record<string, Insight | null>, it) => {
          acc[it.category] = acc[it.category] ? (new Date(it.updatedAt) > new Date(acc[it.category]!.updatedAt) ? it : acc[it.category]) : it;
          return acc;
        }, {} as Record<string, Insight | null>);
        const copy: Record<CategoryKey, Insight | null> = { ...insights };
        categoriesInOrder.forEach((c) => {
          copy[c] = (byCat[c] as Insight) || null;
        });
        setInsights(copy);
      })
      .catch((err) => {
        // Endpoint pas encore implémenté (404) ou autre erreur → affichage vide gracieux
        console.log('[Synthesis] Endpoint /api/insights/synthesis non disponible (normal si pas encore implémenté)');
        if (mounted) setInsights((s) => s);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const lastSeenRaw = localStorage.getItem(LAST_SEEN_KEY);
  const lastSeen = lastSeenRaw ? JSON.parse(lastSeenRaw) : ({} as Record<string, string>);

  const markSeen = (cat: CategoryKey, time?: string) => {
    const next = { ...(lastSeen || {}), [cat]: time || new Date().toISOString() };
    localStorage.setItem(LAST_SEEN_KEY, JSON.stringify(next));
  };

  const handleCreateRitual = async (insight: Insight) => {
    try {
      await axios.post('/api/rituals', { insightId: insight.id });
      alert('Rituel créé');
      markSeen(insight.category, new Date().toISOString());
      setSelected(null);
    } catch (e) {
      alert('Erreur lors de la création du rituel');
    }
  };

  // Observer les sections pour navigation active
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { threshold: 0.3, rootMargin: '-100px 0px -50% 0px' }
    );

    const sections = [
      spirituelRef.current,
      relationsRef.current,
      missionRef.current,
      creativiteRef.current,
      emotionsRef.current,
      travailRef.current,
      santeRef.current,
      financeRef.current
    ];

    sections.forEach((section) => {
      if (section) observer.observe(section);
    });

    return () => {
      sections.forEach((section) => {
        if (section) observer.unobserve(section);
      });
    };
  }, []);

  // Scroll vers une section
  const scrollToSection = (sectionId: string) => {
    const refs: Record<string, React.RefObject<HTMLDivElement>> = {
      spirituel: spirituelRef,
      relations: relationsRef,
      mission: missionRef,
      creativite: creativiteRef,
      emotions: emotionsRef,
      travail: travailRef,
      sante: santeRef,
      finance: financeRef
    };
    
    const ref = refs[sectionId];
    if (ref?.current) {
      const yOffset = -100;
      const y = ref.current.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <GlassCard key={i} className="h-48 p-6">
                  <div className="space-y-4">
                    <div className="h-5 bg-amber-400/20 rounded-full animate-pulse w-1/2" />
                    <div className="h-3 bg-white/10 rounded-full animate-pulse w-3/4" />
                    <div className="h-3 bg-white/10 rounded-full animate-pulse w-1/2" />
                    <div className="flex justify-between items-center mt-6">
                      <div className="h-3 bg-white/5 rounded animate-pulse w-20" />
                      <div className="h-8 bg-amber-400/20 rounded animate-pulse w-16" />
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Contenu Principal */}
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-5xl mx-auto space-y-6">

          {/* Header aligné Profil */}
          <div className="text-center space-y-3">
            <div className="flex items-center justify-center gap-3">
              <Award className={`w-6 h-6 text-${levelColor}-400`} />
              <h1 className="text-3xl font-bold text-white">Synthèse</h1>
            </div>
            <p className="text-white/60">
              Niveau actuel : <span className={`text-${levelColor}-400 font-medium`}>{levelName}</span>
            </p>
          </div>

          {/* Grille 2 colonnes existante */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {categoriesInOrder.map((cat) => {
          const insight = insights[cat];
          const isNew = insight && new Date(insight.updatedAt) > new Date(lastSeen[cat] || 0);
          const sectionId = cat.toLowerCase().replace(/é/g, 'e');
          const refs: Record<string, React.RefObject<HTMLDivElement>> = {
            spirituel: spirituelRef,
            relations: relationsRef,
            mission: missionRef,
            creativite: creativiteRef,
            emotions: emotionsRef,
            travail: travailRef,
            sante: santeRef,
            finance: financeRef
          };

          return (
            <motion.div 
              key={cat}
              id={sectionId}
              ref={refs[sectionId]}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: categoriesInOrder.indexOf(cat) * 0.1 }}
            >
              <GlassCard className="h-48 border border-mystical-500/40 flex flex-col justify-between p-6 hover:border-amber-400/40 transition-all duration-300">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-4">
                    <div className="font-playfair italic text-lg font-medium text-amber-400">{cat}</div>
                    {isNew && (
                      <div className="px-3 py-1 rounded-full bg-green-400/20 border border-green-400/40 text-green-400 text-xs font-medium">
                        Nouveau
                      </div>
                    )}
                  </div>

                  <div className="text-sm text-white/80 line-clamp-3 leading-relaxed">
                    {insight?.short ?? 'Aucun insight pour le moment. L\'Oracle analyse vos énergies dans cette dimension.'}
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4">
                  <div className="text-xs text-white/50">
                    {insight ? formatDate(insight.updatedAt) : ''}
                  </div>
                  {insight && (
                    <PrimaryButton
                      size="sm"
                      onClick={() => {
                        setSelected(insight);
                        markSeen(cat, insight.updatedAt);
                      }}
                      className="px-4 py-2"
                    >
                      Explorer
                    </PrimaryButton>
                  )}
                </div>
              </GlassCard>
            </motion.div>
          );
        })}
          </div>

          {/* Modal détaillée (inchangée) */}
          <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div 
              className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
              onClick={() => setSelected(null)} 
            />
            
            <motion.div
              initial={{ scale: 0.9, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 50 }}
              className="relative w-full max-w-2xl"
            >
              <GlassCard className="p-8 bg-gradient-to-br from-mystical-900/95 to-mystical-800/95 border-amber-400/30">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="font-playfair italic text-2xl text-amber-400 mb-2">
                      {selected.category}
                    </h2>
                    <div className="text-sm text-white/70">
                      Mis à jour le {formatDate(selected.updatedAt)}
                    </div>
                  </div>
                  <TertiaryButton 
                    onClick={() => setSelected(null)}
                    className="p-2"
                  >
                    <X className="w-5 h-5" />
                  </TertiaryButton>
                </div>

                <div className="text-white/90 leading-relaxed mb-8 text-lg">
                  {selected.full}
                </div>

                <div className="flex gap-3 justify-end">
                  <TertiaryButton onClick={() => setSelected(null)}>
                    Fermer
                  </TertiaryButton>
                  <PrimaryButton onClick={() => handleCreateRitual(selected)}>
                    Créer un rituel
                  </PrimaryButton>
                </div>
              </GlassCard>
            </motion.div>
          </motion.div>
        )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Synthesis;
