import React, { useEffect, useState } from 'react';
import GlassCard from '../ui/GlassCard';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { PrimaryButton } from '../ui/Buttons';

type CategoryKey = 'Relations' | 'Travail' | 'Santé' | 'Spirituel' | 'Finance' | 'Créativité' | 'Emotions' | 'Mission';

type Insight = {
  id: string;
  category: CategoryKey;
  short: string; // 2-line summary
  full: string; // full insight
  updatedAt: string; // ISO
};

const CATS: CategoryKey[] = ['Relations', 'Travail', 'Santé', 'Spirituel', 'Finance', 'Créativité', 'Emotions', 'Mission'];

const LAST_SEEN_KEY = 'synthesis_last_seen_v1';

const formatDate = (iso?: string) => (iso ? new Date(iso).toLocaleString() : '');

const Synthesis: React.FC = () => {
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
        CATS.forEach((c) => {
          copy[c] = (byCat[c] as Insight) || null;
        });
        setInsights(copy);
      })
      .catch(() => {
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

  if (loading) {
    return (
      <div className="grid grid-cols-3 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <GlassCard key={i} className="h-28 animate-pulse"> 
            <div className="h-full" />
          </GlassCard>
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-3 gap-4">
        {/* layout 3x3 with center empty */}
        {CATS.map((cat) => {
          return (
            <div key={cat} className="col-span-1">
              <GlassCard className="h-36 border border-mystical-500/40 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <div className="font-semibold text-white">{cat}</div>
                    {insights[cat] && new Date(insights[cat]!.updatedAt) > new Date(lastSeen[cat] || 0) ? (
                      <div className="px-2 py-0.5 rounded-full bg-turquoise-400 text-turquoise-900 text-xs">Nouveau</div>
                    ) : null}
                  </div>

                  <div className="mt-2 text-sm text-white/80 line-clamp-2">{insights[cat]?.short ?? 'Aucun insight pour le moment'}</div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-xs text-white/60">{insights[cat] ? formatDate(insights[cat]!.updatedAt) : ''}</div>
                  <PrimaryButton
                    onClick={() => {
                      if (insights[cat]) {
                        setSelected(insights[cat]);
                        markSeen(cat, insights[cat]!.updatedAt);
                      }
                    }}
                  >
                    Voir
                  </PrimaryButton>
                </div>
              </GlassCard>
            </div>
          );
        })}

        {/* center empty */}
        <div className="col-span-1" />
      </div>

      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed left-0 right-0 bottom-0 z-50"
          >
            <div className="p-4">
              <GlassCard>
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-playfair italic text-lg text-mystical-gold">{selected.category}</div>
                      <div className="text-sm text-white/80">{formatDate(selected.updatedAt)}</div>
                    </div>
                    <div>
                      <button className="text-white/60" onClick={() => setSelected(null)}>
                        Fermer
                      </button>
                    </div>
                  </div>

                  <div className="text-white/90">{selected.full}</div>

                  <div className="flex justify-end">
                    <PrimaryButton onClick={() => handleCreateRitual(selected)}>Créer un rituel</PrimaryButton>
                  </div>
                </div>
              </GlassCard>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Synthesis;
