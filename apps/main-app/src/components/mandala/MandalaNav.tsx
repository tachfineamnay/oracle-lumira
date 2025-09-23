import React, { useRef, useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import GlassCard from '../ui/GlassCard';
import { Star, Book, Layers, MessageCircle, Wrench, Sparkles, User } from 'lucide-react';
import labels from '../../lib/sphereLabels';
import type { SphereKey } from '../../lib/sphereLabels';

type Props = {
  active?: string;
  onSelect?: (k: string) => void;
  progress?: number[]; // length 6
  effects?: 'minimal' | 'none';
};

const ORDER: string[] = ['spiritualPath', 'rawDraws', 'synthesis', 'conversations', 'tools', 'profile'];

const ICONS: Record<string, React.ReactNode> = {
  spiritualPath: <Star className="w-6 h-6" />,
  rawDraws: <Book className="w-6 h-6" />,
  synthesis: <Layers className="w-6 h-6" />,
  conversations: <MessageCircle className="w-6 h-6" />,
  tools: <Wrench className="w-6 h-6" />,
  profile: <User className="w-6 h-6" />,
};

const SPHERE_COLORS: Record<string, { gradient: string; accent: string; shadow: string }> = {
  spiritualPath: { 
    gradient: 'from-amber-400/30 to-yellow-500/20', 
    accent: 'text-amber-400', 
    shadow: 'shadow-amber-400/30' 
  },
  rawDraws: { 
    gradient: 'from-emerald-400/30 to-green-500/20', 
    accent: 'text-emerald-400', 
    shadow: 'shadow-emerald-400/30' 
  },
  synthesis: { 
    gradient: 'from-purple-400/30 to-violet-500/20', 
    accent: 'text-purple-400', 
    shadow: 'shadow-purple-400/30' 
  },
  conversations: { 
    gradient: 'from-blue-400/30 to-cyan-500/20', 
    accent: 'text-blue-400', 
    shadow: 'shadow-blue-400/30' 
  },
  tools: { 
    gradient: 'from-pink-400/30 to-rose-500/20', 
    accent: 'text-pink-400', 
    shadow: 'shadow-pink-400/30' 
  },
  profile: { 
    gradient: 'from-mystical-gold/30 to-mystical-purple/20', 
    accent: 'text-mystical-gold', 
    shadow: 'shadow-mystical-gold/30' 
  },
};

const SPHERE_DESCRIPTIONS: Record<string, string> = {
  spiritualPath: "Explorez votre chemin de croissance spirituelle personnalisé",
  rawDraws: "Consultez vos tirages et lectures énergétiques brutes", 
  synthesis: "Découvrez la synthèse de vos insights spirituels",
  conversations: "Engagez des dialogues sacrés avec votre guide spirituel",
  tools: "Accédez à vos outils de développement personnel",
  profile: "Gérez votre profil et vos préférences spirituelles",
};

const MandalaNav: React.FC<Props> = ({ active, onSelect, progress = [0, 0, 0, 0, 0, 0], effects = 'minimal' }) => {
  const shouldReduce = useReducedMotion();
  const [focusIndex, setFocusIndex] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [showGuidance, setShowGuidance] = useState(false);
  const refs = useRef<Array<HTMLAnchorElement | null>>([]);
  const location = useLocation();

  // Auto-detect active sphere from current route
  const currentSphere = location.pathname.split('/').pop();
  const activeKey = currentSphere === 'path' ? 'spiritualPath' : 
                   currentSphere === 'draws' ? 'rawDraws' : 
                   ORDER.includes(currentSphere || '') ? currentSphere : 
                   active || 'spiritualPath';

  useEffect(() => {
    // ensure focus follows focusIndex
    const el = refs.current[focusIndex];
    if (el) el.focus();
  }, [focusIndex]);

  // Show guidance for first-time users
  useEffect(() => {
    const hasSeenGuidance = localStorage.getItem('mandala-guidance-seen');
    if (!hasSeenGuidance && location.pathname === '/sanctuaire') {
      setTimeout(() => setShowGuidance(true), 1000);
    }
  }, [location.pathname]);

  const handleGuidanceClose = () => {
    setShowGuidance(false);
    localStorage.setItem('mandala-guidance-seen', 'true');
  };

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

  // Enhanced pentagon positions with better spacing
  const positions = ORDER.map((_, i) => {
    const angle = (i / ORDER.length) * Math.PI * 2 - Math.PI / 2;
    const r = 150; // loosen nodes to avoid crowding
    return { 
      left: `calc(50% + ${Math.round(Math.cos(angle) * r)}px)`, 
      top: `calc(50% + ${Math.round(Math.sin(angle) * r)}px)` 
    };
  });

  const circumference = 2 * Math.PI * 20; // increased for better progress visibility

  return (
    <GlassCard className="w-full max-w-5xl mx-auto backdrop-blur-2xl bg-gradient-to-br from-white/10 via-white/5 to-white/10 border border-white/20 shadow-2xl">
      {/* Desktop / large: enhanced pentagon mandala */}
      <div className="relative w-full h-[28rem] hidden lg:block p-8" onKeyDown={handleKey} role="navigation" aria-label="Mandala navigation cosmique">
        
        {/* Background minimal (remove fast stellar animations) */}
        {effects !== 'none' && (
          <div className="absolute inset-0 overflow-hidden rounded-3xl" aria-hidden>
            <div className="absolute w-[32rem] h-[32rem] rounded-full border border-white/10 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute w-[24rem] h-[24rem] rounded-full border border-white/5 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
        )}

        {/* Central sacred hub with enhanced design */}
        <motion.div
          className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <NavLink 
            to="/sanctuaire"
            title="Centre spirituel - Vue d'ensemble"
            className="flex flex-col items-center cursor-pointer group relative"
          >
            <motion.div 
              className="relative w-32 h-32 rounded-full bg-gradient-to-br from-amber-400/30 via-mystical-600/20 to-mystical-800/30 flex items-center justify-center border-2 border-amber-400/40 shadow-lg group-hover:shadow-amber-400/40 transition-all duration-500"
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.95 }}
              animate={effects === 'none' ? undefined : {
                boxShadow: [
                  '0 0 16px rgba(251, 191, 36, 0.25)',
                  '0 0 28px rgba(251, 191, 36, 0.35)',
                  '0 0 16px rgba(251, 191, 36, 0.25)',
                ]
              }}
              transition={effects === 'none' ? undefined : { duration: 6, repeat: Infinity }}
            >
              {/* Inner sacred circle */}
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-400/40 to-amber-500/30 flex items-center justify-center text-amber-400 group-hover:text-amber-300 transition-colors">
                <Star className="w-10 h-10" />
              </div>
              
              {/* Orbiting sparkles */}
              <motion.div
                className="absolute"
                animate={effects === 'none' ? undefined : { rotate: 360 }}
                transition={effects === 'none' ? undefined : { duration: 30, repeat: Infinity, ease: 'linear' }}
              >
                <Sparkles className="w-4 h-4 text-amber-300/60 absolute -top-2 left-1/2 transform -translate-x-1/2" />
              </motion.div>
              <motion.div
                className="absolute"
                animate={effects === 'none' ? undefined : { rotate: -360 }}
                transition={effects === 'none' ? undefined : { duration: 42, repeat: Infinity, ease: 'linear' }}
              >
                <Sparkles className="w-3 h-3 text-amber-400/40 absolute -bottom-1 left-1/2 transform -translate-x-1/2" />
              </motion.div>
            </motion.div>
            
            <motion.div 
              className="mt-4 text-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <div className="text-base font-medium text-white group-hover:text-amber-300 transition-colors">Sanctuaire</div>
              <div className="text-xs text-white/60 group-hover:text-white/80 transition-colors">Centre spirituel</div>
            </motion.div>
          </NavLink>
        </motion.div>

        {/* Enhanced sphere navigation nodes */}
        {ORDER.map((key) => {
          const i = ORDER.indexOf(key);
          const isActive = activeKey === key;
          const prog = Math.max(0, Math.min(100, progress[i] ?? 0));
          const dash = circumference - (circumference * prog) / 100;
          const pos = positions[i];
          const colors = SPHERE_COLORS[key];

          return (
            <motion.div
              key={key}
              className="absolute z-40 -translate-x-1/2 -translate-y-1/2"
              style={{ left: pos.left, top: pos.top }}
              initial={{ opacity: 0, scale: 0.5, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.6, delay: i * 0.12, type: "spring", stiffness: 110 }}
              whileHover={{ scale: 1.08, y: -3 }}
              onHoverStart={() => setHoveredIndex(i)}
              onHoverEnd={() => setHoveredIndex(null)}
            >
              <NavLink
                to={`/sanctuaire/${
                  key === 'spiritualPath'
                    ? 'path'
                    : key === 'rawDraws'
                    ? 'draws'
                    : key === 'conversations'
                    ? 'chat'
                    : key
                }`}
                ref={(el: HTMLAnchorElement | null) => (refs.current[i] = el)}
                onClick={() => {
                  setFocusIndex(i);
                  onSelect?.(key);
                }}
                aria-current={isActive ? 'page' : undefined}
                tabIndex={focusIndex === i ? 0 : -1}
                title={labels[key as SphereKey]}
                className="block group relative"
              >
                {/* Enhanced sphere with multiple layers */}
                <div className={`relative w-20 h-20 rounded-full transition-all duration-500 ${
                  isActive 
                    ? `ring-3 ring-amber-400/60 bg-gradient-to-br ${colors.gradient} ${colors.shadow} shadow-lg` 
                    : 'bg-gradient-to-br from-white/10 to-white/5 border border-white/30 hover:border-amber-400/50 hover:bg-gradient-to-br hover:from-white/20 hover:to-white/10'
                }`}>
                  
                  {/* Progress ring with enhanced visibility */}
                  <svg className="absolute -inset-1 w-22 h-22" viewBox="0 0 88 88" aria-hidden>
                    <circle cx="44" cy="44" r="36" strokeWidth="2" stroke="rgba(255,255,255,0.1)" fill="none" />
                    <motion.circle
                      cx="44"
                      cy="44"
                      r="36"
                      strokeWidth="3"
                      stroke={isActive ? "rgb(251, 191, 36)" : "rgba(251, 191, 36, 0.7)"}
                      strokeLinecap="round"
                      strokeDasharray={circumference}
                      strokeDashoffset={dash}
                      fill="none"
                      className="transition-all duration-700"
                      initial={{ strokeDashoffset: circumference }}
                      animate={{ strokeDashoffset: dash }}
                      transition={{ duration: 1, delay: i * 0.2 }}
                    />
                  </svg>

                  {/* Icon with enhanced styling */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div 
                      className={`transition-all duration-300 ${
                        isActive ? colors.accent : 'text-white/80 group-hover:text-amber-400'
                      }`}
                      animate={isActive ? { scale: [1, 1.1, 1] } : {}}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      {ICONS[key]}
                    </motion.div>
                  </div>

                  {/* Glow effect for active sphere */}
                  {isActive && (
                    <motion.div
                      className="absolute -inset-2 rounded-full bg-amber-400/20 blur-xl -z-10"
                      animate={effects === 'none' ? undefined : { scale: [1, 1.08, 1], opacity: [0.35, 0.55, 0.35] }}
                      transition={effects === 'none' ? undefined : { duration: 4, repeat: Infinity }}
                    />
                  )}

                  {/* Hover particles */}
                  {hoveredIndex === i && (
                    <>
                      {Array.from({ length: 6 }).map((_, pi) => (
                        <motion.div
                          key={pi}
                          className="absolute w-1 h-1 bg-amber-400/60 rounded-full"
                          style={{
                            left: `${20 + Math.random() * 60}%`,
                            top: `${20 + Math.random() * 60}%`,
                          }}
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ 
                            opacity: [0, 1, 0],
                            scale: [0, 1, 0],
                            y: [-10, -30, -50]
                          }}
                          transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            delay: pi * 0.2
                          }}
                        />
                      ))}
                    </>
                  )}
                </div>

                {/* Enhanced label with better typography */}
                <motion.div 
                  className="absolute top-full left-1/2 transform -translate-x-1/2 mt-3 text-center"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 + i * 0.1 }}
                >
                  <div className={`text-sm font-medium transition-colors duration-300 ${
                    isActive ? 'text-amber-400' : 'text-white/90 group-hover:text-amber-300'
                  }`}>
                    {labels[key as SphereKey]}
                  </div>
                  {prog > 0 && (
                    <div className="text-xs text-white/60 mt-1">
                      {prog}% complété
                    </div>
                  )}
                </motion.div>

                {/* Tooltip on hover */}
                {hoveredIndex === i && (
                 <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 10 }}
                    className="absolute top-full left-1/2 transform -translate-x-1/2 mt-20 z-50"
                  >
                    <div className="bg-black/90 backdrop-blur-xl text-white text-xs px-3 py-2 rounded-xl border border-white/20 max-w-48 text-center">
                      {SPHERE_DESCRIPTIONS[key]}
                      <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-black/90 rotate-45 border-l border-t border-white/20"></div>
                    </div>
                  </motion.div>
                )}

                <span className="sr-only">{labels[key as SphereKey]} - {prog}% complété</span>
              </NavLink>
            </motion.div>
          );
        })}

        {/* First-time user guidance overlay */}
        {showGuidance && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm rounded-3xl z-50 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-gradient-to-br from-mystical-800/95 to-mystical-900/95 backdrop-blur-xl border border-amber-400/30 rounded-2xl p-8 max-w-md text-center"
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-amber-400/30 to-amber-500/20 flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-amber-400" />
              </div>
              <h3 className="text-xl font-medium text-white mb-3">Bienvenue dans votre Mandala Spirituel</h3>
              <p className="text-white/80 text-sm mb-6 leading-relaxed">
                Cliquez sur les sphères colorées pour explorer vos différents domaines spirituels. 
                Le cercle central vous ramène toujours à la vue d'ensemble.
              </p>
              <button
                onClick={handleGuidanceClose}
                className="bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-mystical-900 px-6 py-2 rounded-xl font-medium transition-all duration-300"
              >
                Commencer l'exploration
              </button>
            </motion.div>
          </motion.div>
        )}
      </div>

      {/* Enhanced Mobile Navigation */}
      <div className="lg:hidden fixed left-0 right-0 bottom-4 z-50 pb-[env(safe-area-inset-bottom,0)]">
        <div className="mx-4 backdrop-blur-xl bg-gradient-to-r from-mystical-900/90 via-mystical-800/90 to-mystical-900/90 border border-white/20 rounded-3xl p-3 shadow-2xl">
          <nav className="flex justify-between items-center" role="navigation" aria-label="Navigation mobile cosmique">
            {ORDER.map((key) => {
              const isActive = activeKey === key;
              const colors = SPHERE_COLORS[key];
              const prog = Math.max(0, Math.min(100, progress[ORDER.indexOf(key)] ?? 0));
              
              return (
                <NavLink
                  key={key}
                  to={`/sanctuaire/${
                    key === 'spiritualPath'
                      ? 'path'
                      : key === 'rawDraws'
                      ? 'draws'
                      : key === 'conversations'
                      ? 'chat'
                      : key
                  }`}
                  onClick={() => onSelect?.(key)}
                  aria-current={isActive ? 'page' : undefined}
                  className="flex-1 flex flex-col items-center justify-center py-3 px-2 rounded-2xl transition-all duration-300 group relative"
                >
                  {/* Mobile sphere icon */}
                  <motion.div 
                    className={`relative w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                      isActive 
                        ? `bg-gradient-to-br ${colors.gradient} ring-2 ring-amber-400/60 ${colors.shadow}` 
                        : 'bg-white/10 group-hover:bg-white/20'
                    }`}
                    whileTap={{ scale: 0.9 }}
                  >
                    {/* Progress ring for mobile */}
                    <svg className="absolute -inset-1 w-14 h-14" viewBox="0 0 56 56" aria-hidden>
                      <circle cx="28" cy="28" r="24" strokeWidth="2" stroke="rgba(255,255,255,0.1)" fill="none" />
                      <motion.circle
                        cx="28"
                        cy="28"
                        r="24"
                        strokeWidth="2"
                        stroke={isActive ? "rgb(251, 191, 36)" : "rgba(251, 191, 36, 0.6)"}
                        strokeLinecap="round"
                        strokeDasharray={2 * Math.PI * 24}
                        strokeDashoffset={(2 * Math.PI * 24) - ((2 * Math.PI * 24) * prog) / 100}
                        fill="none"
                        className="transition-all duration-500"
                      />
                    </svg>
                    
                    <span className={`relative z-10 transition-colors duration-300 ${
                      isActive ? colors.accent : 'text-white/80 group-hover:text-amber-400'
                    }`}>
                      {React.cloneElement(ICONS[key] as React.ReactElement, { 
                        className: "w-5 h-5" 
                      })}
                    </span>

                    {/* Active indicator */}
                    {isActive && (
                      <motion.div
                        className="absolute -inset-1 rounded-full bg-amber-400/20 blur-sm -z-10"
                        animate={{ 
                          scale: [1, 1.1, 1],
                          opacity: [0.5, 0.8, 0.5]
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                    )}
                  </motion.div>

                  {/* Mobile label */}
                  <motion.div 
                    className={`mt-1 text-xs font-medium transition-colors duration-300 text-center ${
                      isActive ? 'text-amber-400' : 'text-white/70 group-hover:text-white'
                    }`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    {labels[key as SphereKey].split(' ')[0]}
                  </motion.div>

                  <span className="sr-only">{labels[key as SphereKey]} - {prog}% complété</span>
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
