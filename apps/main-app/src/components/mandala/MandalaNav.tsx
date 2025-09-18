import React, { useRef, useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import GlassCard from '../ui/GlassCard';
import { Star, Book, Layers, MessageCircle, Wrench } from 'lucide-react';
import labels from '../../lib/sphereLabels';
import type { SphereKey } from '../../lib/sphereLabels';

type Props = {
  active?: string;
  onSelect?: (k: string) => void;
  progress?: number[]; // length 5
};

const ORDER: string[] = ['spiritualPath', 'rawDraws', 'synthesis', 'conversations', 'tools'];

const ICONS: Record<string, React.ReactNode> = {
  spiritualPath: <Star className="w-5 h-5" />,
  rawDraws: <Book className="w-5 h-5" />,
  synthesis: <Layers className="w-5 h-5" />,
  conversations: <MessageCircle className="w-5 h-5" />,
  tools: <Wrench className="w-5 h-5" />,
};

const MandalaNav: React.FC<Props> = ({ active, onSelect, progress = [0, 0, 0, 0, 0] }) => {
  const shouldReduce = useReducedMotion();
  const [focusIndex, setFocusIndex] = useState(0);
  const refs = useRef<Array<HTMLAnchorElement | null>>([]);

  useEffect(() => {
    // ensure focus follows focusIndex
    const el = refs.current[focusIndex];
    if (el) el.focus();
  }, [focusIndex]);

  const handleKey = (e: React.KeyboardEvent) => {
    const max = ORDER.length;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusIndex((i) => (i + 1) % max);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusIndex((i) => (i - 1 + max) % max);
    }
  };

  // pentagon positions (absolute) precomputed
  const positions = ORDER.map((_, i) => {
    const angle = (i / ORDER.length) * Math.PI * 2 - Math.PI / 2;
    const r = 90; // radius
    return { left: `calc(50% + ${Math.round(Math.cos(angle) * r)}px)`, top: `calc(50% + ${Math.round(Math.sin(angle) * r)}px)` };
  });

  const circumference = 2 * Math.PI * 18; // for progress circle radius 18

  return (
    <GlassCard className="w-full max-w-3xl mx-auto">
      {/* Desktop / large: pentagon mandala */}
      <div className="relative w-full h-72 hidden lg:block" onKeyDown={handleKey} role="navigation" aria-label="Mandala navigation">
        <motion.div
          aria-hidden
          animate={shouldReduce ? undefined : { rotate: 360 }}
          transition={shouldReduce ? undefined : { repeat: Infinity, duration: 60, ease: 'linear' }}
          className="absolute w-64 h-64 rounded-full border border-mystical-gold/10 left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2"
        />

        {/* center */}
        <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-mystical-gold/10 to-mystical-purple/10 flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-mystical-gold/10 flex items-center justify-center text-mystical-gold">
              <Star className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-2 text-sm font-inter text-white">{labels['spiritualPath']}</div>
        </div>

        {ORDER.map((key) => {
          const i = ORDER.indexOf(key);
          const isActive = active === key;
          const prog = Math.max(0, Math.min(100, progress[i] ?? 0));
          const dash = circumference - (circumference * prog) / 100;

          return (
            <NavLink
                to={`/sanctuaire/${key === 'spiritualPath' ? 'path' : key === 'rawDraws' ? 'draws' : key}`}
              key={key}
              ref={(el: HTMLAnchorElement | null) => (refs.current[i] = el)}
              onClick={() => {
                setFocusIndex(i);
                onSelect?.(key);
              }}
              aria-current={isActive ? 'page' : undefined}
              tabIndex={focusIndex === i ? 0 : -1}
              className={`absolute z-30 w-14 h-14 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-mystical-gold ${
                isActive ? 'ring-2 ring-amber-400' : 'bg-mystical-gold/10'
              }`}
              style={{ left: positions[i].left, top: positions[i].top }}
            >
              {/* radial progress SVG */}
              <svg className="absolute inset-0" width="44" height="44" viewBox="0 0 44 44" aria-hidden>
                <circle cx="22" cy="22" r="18" strokeWidth="3" stroke="rgba(255,255,255,0.06)" fill="none" />
                <circle
                  cx="22"
                  cy="22"
                  r="18"
                  strokeWidth="3"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeDasharray={`${circumference}`}
                  strokeDashoffset={dash}
                  style={{ color: isActive ? undefined : 'rgba(255,215,0,0.6)' }}
                  className="text-mystical-gold"
                />
              </svg>

              <span className="relative z-10 text-white">{ICONS[key]}</span>

              <span className="sr-only">{labels[key as SphereKey]}</span>
            </NavLink>
          );
        })}
      </div>

      {/* Mobile bottom nav */}
      <div className="lg:hidden fixed left-0 right-0 bottom-4 z-50 pb-[env(safe-area-inset-bottom,0)]">
        <div className="mx-4 backdrop-blur-md bg-mystical-900/80 border border-white/10 rounded-2xl p-2">
          <nav className="flex justify-between" role="navigation" aria-label="Mandala bottom navigation">
            {ORDER.map((key) => {
              const isActive = active === key;
              return (
                <NavLink
                  key={key}
                  to={`/sanctuaire/${key === 'spiritualPath' ? 'path' : key === 'rawDraws' ? 'draws' : key}`}
                  onClick={() => onSelect?.(key)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`flex-1 flex items-center justify-center py-2 rounded-md ${isActive ? 'ring-2 ring-amber-400' : ''}`}
                >
                  <span className="text-mystical-gold">{ICONS[key]}</span>
                  <span className="sr-only">{labels[key as SphereKey]}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>
      </div>
    </GlassCard>
  );
};

export default MandalaNav;
