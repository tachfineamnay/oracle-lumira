import React, { useEffect, useState } from 'react';
import axios from 'axios';
import GlassCard from '../ui/GlassCard';
import { Wand2 } from 'lucide-react';

type Tool = {
  id: string;
  title: string;
  duration?: number; // seconds
  thumbnail?: string; // optional image url
  recommended?: boolean;
  mandala?: boolean;
  ritual?: boolean;
  audioUrl?: string;
  downloadUrl?: string;
};

const FILTERS = ['Tout', 'Mandala', 'Rituel', 'Audio', 'Recommandé'] as const;

const USER_RITUALS_KEY = 'userRituals_v1';

const Tools: React.FC = () => {
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<(typeof FILTERS)[number]>('Tout');
  const [userRituals, setUserRituals] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(USER_RITUALS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    axios
      .get<Tool[]>('/api/tools?recommended=true')
      .then((res) => {
        if (!mounted) return;
        setTools(res.data || []);
      })
      .catch(() => {
        if (mounted) setTools([]);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const addToRitual = (id: string) => {
    const next = Array.from(new Set([...userRituals, id]));
    setUserRituals(next);
    localStorage.setItem(USER_RITUALS_KEY, JSON.stringify(next));
  };

  const filterTool = (t: Tool) => {
    switch (activeFilter) {
      case 'Mandala':
        return !!t.mandala;
      case 'Rituel':
        return !!t.ritual;
      case 'Audio':
        return !!t.audioUrl;
      case 'Recommandé':
        return !!t.recommended;
      default:
        return true;
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <GlassCard key={i} className="h-28 animate-pulse"> <div className="h-full" /></GlassCard>
        ))}
      </div>
    );
  }

  const list = tools.filter(filterTool);

  if (!list || list.length === 0) {
    return (
      <GlassCard>
        <div className="flex flex-col items-center gap-3 py-6">
          <Wand2 className="w-10 h-10 text-mystical-gold" />
          <div className="font-inter text-sm text-white/90">Aucun outil</div>
        </div>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`px-3 py-1 rounded-full text-sm ${activeFilter === f ? 'bg-mystical-gold text-mystical-dark' : 'bg-mystical-gold/10 text-white'}`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {list.map((t) => (
          <GlassCard key={t.id} className="flex items-center gap-4">
            <div className="w-20 h-20 bg-mystical-gold/10 rounded flex items-center justify-center">
              {/* simple SVG thumbnail fallback */}
              {t.thumbnail ? (
                <img src={t.thumbnail} alt="thumb" className="w-full h-full object-cover rounded" />
              ) : (
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="3" y="3" width="18" height="18" rx="3" fill="currentColor" className="text-amber-200" />
                  <path d="M7 10h10M7 14h6" stroke="currentColor" className="text-amber-700" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              )}
            </div>

            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div className="font-semibold text-white">{t.title}</div>
                {t.recommended && <div className="px-2 py-0.5 rounded-full bg-mystical-gold text-xs text-mystical-dark">Recommandé</div>}
              </div>

              <div className="text-sm text-white/80 mt-2">{t.duration ? `${Math.round(t.duration / 60)} min` : ''}</div>
            </div>

            <div className="flex flex-col gap-2">
              {t.downloadUrl && (
                <a href={t.downloadUrl} target="_blank" rel="noreferrer" className="px-3 py-2 rounded bg-mystical-gold/20">
                  Télécharger
                </a>
              )}

              {t.audioUrl && (
                <a href={t.audioUrl} target="_blank" rel="noreferrer" className="px-3 py-2 rounded bg-mystical-gold/20">
                  Écouter
                </a>
              )}

              <button
                onClick={() => addToRitual(t.id)}
                className="px-3 py-2 rounded bg-amber-200 text-amber-900"
              >
                Ajouter à mon rituel
              </button>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
};

export default Tools;
