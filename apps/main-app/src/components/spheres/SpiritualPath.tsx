import React, { useRef, useMemo, useEffect, useState } from 'react';
import GlassCard from '../ui/GlassCard';
import { PrimaryButton } from '../ui/Buttons';
import axios from 'axios';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import labels from '../../lib/sphereLabels';

type Props = {
  level?: 1 | 2 | 3 | 4;
  completed?: number;
  total?: number;
};

const SpiritualPath: React.FC<Props> = ({ level = 1, completed = 0, total = 4 }) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const prefersReduced = useReducedMotion();
  const inView = useInView(ref, { once: true });

  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setIsLoading(true);
    axios
      .get('/api/users/me')
      .then((res) => {
        if (mounted) setData(res.data);
      })
      .catch(() => {
        if (mounted) setData(null);
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const percent = useMemo(() => (total > 0 ? Math.round((completed / total) * 100) : 0), [completed, total]);
  const circumference = 2 * Math.PI * 24; // r=24
  const dash = circumference - (circumference * percent) / 100;

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="space-y-6">
          {/* ux: cosmic loading skeleton */}
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-amber-400/20 to-mystical-600/20 rounded-full animate-pulse" />
            <div className="space-y-3 flex-1">
              <div className="h-4 bg-white/10 rounded-full animate-pulse w-3/4" />
              <div className="h-3 bg-white/5 rounded-full animate-pulse w-1/2" />
            </div>
          </div>
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 bg-white/5 rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* ux: cosmic empty state with inline mandala SVG */}
          <div className="flex justify-center mb-6">
            <svg width="120" height="120" viewBox="0 0 120 120" className="text-amber-400/30">
              <circle cx="60" cy="60" r="50" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.3"/>
              <circle cx="60" cy="60" r="35" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.5"/>
              <circle cx="60" cy="60" r="20" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.7"/>
              <circle cx="60" cy="60" r="5" fill="currentColor" opacity="0.9"/>
              {[...Array(8)].map((_, i) => {
                const angle = (i / 8) * Math.PI * 2;
                const x1 = 60 + Math.cos(angle) * 20;
                const y1 = 60 + Math.sin(angle) * 20;
                const x2 = 60 + Math.cos(angle) * 35;
                const y2 = 60 + Math.sin(angle) * 35;
                return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="currentColor" strokeWidth="1" opacity="0.4" />;
              })}
            </svg>
          </div>
          <h3 className="text-xl font-cinzel text-amber-400 mb-2">Votre chemin spirituel vous attend</h3>
          <p className="text-white/60 mb-6 leading-relaxed max-w-md mx-auto">
            Votre parcours initiatique n'a pas encore commencé. Laissez l'oracle vous guider vers votre première révélation.
          </p>
          <PrimaryButton className="bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600">
            Commencer mon éveil spirituel
          </PrimaryButton>
        </motion.div>
      </div>
    );
  }

  const teachings = data?.teachings ?? [];
  if (!teachings || teachings.length === 0) {
    return (
      <GlassCard>
        <p className="font-inter text-sm text-white/90">Aucun enseignement pour l’instant</p>
      </GlassCard>
    );
  }

  return (
    <GlassCard>
      <div ref={ref} className="flex flex-col md:flex-row items-start gap-6">
        <div className="flex-1">
          <h3 className="font-playfair italic text-lg text-mystical-gold mb-3">Cheminement Spirituel – Niveau {level}</h3>

          <div className="flex items-center gap-4 mb-4">
            {/* timeline 4 circles */}
            {Array.from({ length: 4 }).map((_, idx) => {
              const step = idx + 1;
              const filled = step <= completed && step <= level;
              return (
                <div key={step} data-testid="sp-circle" className={`w-4 h-4 rounded-full ${filled ? 'bg-amber-400' : 'bg-mystical-gold/10'}`} aria-hidden />
              );
            })}
          </div>

          <p className="font-inter text-sm text-white/90 mb-4">{teachings[0].summary || 'Résumé disponible'}</p>

          <PrimaryButton disabled={level === 4} onClick={() => {}}>
            {labels['spiritualPath']}
          </PrimaryButton>
        </div>

        <div className="w-36 h-36 flex items-center justify-center">
          <motion.svg width="64" height="64" viewBox="0 0 64 64" initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : { opacity: 0 }}>
            <circle cx="32" cy="32" r="24" strokeWidth="4" stroke="currentColor" className="text-white/10" fill="none" />
            <motion.circle
              cx="32"
              cy="32"
              r="24"
              strokeWidth="4"
              stroke="currentColor"
              className="text-mystical-gold-light"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={inView ? dash : circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={inView ? { strokeDashoffset: dash } : { strokeDashoffset: circumference }}
              transition={{ duration: prefersReduced ? 0 : 1.2 }}
            />
            <text x="32" y="36" textAnchor="middle" className="text-sm" fill="white" fontSize={12}>
              {percent}%
            </text>
          </motion.svg>
        </div>
      </div>
    </GlassCard>
  );
};

export default SpiritualPath;

