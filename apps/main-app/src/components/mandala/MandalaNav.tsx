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
    <GlassCard className="w-full max-w-4xl mx-auto backdrop-blur-2xl bg-white/5 border-white/10 shadow-2xl">
      {/* Desktop / large: pentagon mandala */}
      <div className="relative w-full h-80 hidden lg:block p-8" onKeyDown={handleKey} role="navigation" aria-label="Mandala navigation">
        {/* ux: cosmic rings - multiple ethereal circles */}
        <motion.div
          aria-hidden
          animate={shouldReduce ? undefined : { rotate: 360 }}
          transition={shouldReduce ? undefined : { repeat: Infinity, duration: 80, ease: 'linear' }}
          className="absolute w-72 h-72 rounded-full border border-amber-400/20 left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2"
        />
        <motion.div
          aria-hidden
          animate={shouldReduce ? undefined : { rotate: -360 }}
          transition={shouldReduce ? undefined : { repeat: Infinity, duration: 120, ease: 'linear' }}
          className="absolute w-80 h-80 rounded-full border border-mystical-500/10 left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2"
        />

        {/* ux: sacred center - enhanced with glow */}
        <NavLink 
          to="/sanctuaire"
          title="Vue d'ensemble"
          className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center cursor-pointer group"
        >
          <motion.div 
            className="w-28 h-28 rounded-full bg-gradient-to-br from-amber-400/20 via-mystical-600/10 to-mystical-800/20 flex items-center justify-center border border-amber-400/30 shadow-lg group-hover:shadow-amber-400/30 transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400/30 to-amber-500/20 flex items-center justify-center text-amber-400 group-hover:text-amber-300 transition-colors">
              <Star className="w-8 h-8" />
            </div>
          </motion.div>
          <div className="mt-3 text-sm font-inter text-white/80 group-hover:text-white transition-colors">{labels['spiritualPath']}</div>
        </NavLink>

        {ORDER.map((key) => {
          const i = ORDER.indexOf(key);
          const isActive = active === key;
          const prog = Math.max(0, Math.min(100, progress[i] ?? 0));
          const dash = circumference - (circumference * prog) / 100;
          const pos = positions[i];

          return (
            <motion.div
              key={key}
              className="absolute z-30 -translate-x-1/2 -translate-y-1/2"
              style={{ left: pos.left, top: pos.top }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              whileHover={{ scale: 1.1 }}
            >
              <NavLink
                to={`/sanctuaire/${key === 'spiritualPath' ? 'path' : key === 'rawDraws' ? 'draws' : key}`}
                ref={(el: HTMLAnchorElement | null) => (refs.current[i] = el)}
                onClick={() => {
                  setFocusIndex(i);
                  onSelect?.(key);
                }}
                aria-current={isActive ? 'page' : undefined}
                tabIndex={focusIndex === i ? 0 : -1}
                className={`block w-16 h-16 flex items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all duration-300 ${
                  isActive 
                    ? 'ring-2 ring-amber-400 bg-amber-400/20 shadow-lg shadow-amber-400/30' 
                    : 'bg-white/5 hover:bg-white/10 border border-white/20 hover:border-amber-400/40'
                }`}
              >
                {/* ux: enhanced radial progress */}
                <svg className="absolute inset-0" width="64" height="64" viewBox="0 0 64 64" aria-hidden>
                  <circle cx="32" cy="32" r="26" strokeWidth="2" stroke="rgba(255,255,255,0.1)" fill="none" />
                  <circle
                    cx="32"
                    cy="32"
                    r="26"
                    strokeWidth="2"
                    stroke={isActive ? "rgb(251, 191, 36)" : "rgba(251, 191, 36, 0.6)"}
                    strokeLinecap="round"
                    strokeDasharray={`${circumference * 1.44}`}
                    strokeDashoffset={dash * 1.44}
                    fill="none"
                    className="transition-all duration-500"
                  />
                </svg>

                <span className={`relative z-10 transition-colors duration-300 ${
                  isActive ? 'text-amber-400' : 'text-white/70 group-hover:text-amber-400'
                }`}>
                  {ICONS[key]}
                </span>

                <span className="sr-only">{labels[key as SphereKey]}</span>
              </NavLink>
            </motion.div>
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
