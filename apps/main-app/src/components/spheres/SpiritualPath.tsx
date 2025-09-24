import React, { useRef, useMemo, useEffect, useState } from 'react';
import GlassCard from '../ui/GlassCard';
import EmptyState from '../ui/EmptyState';
import { PrimaryButton } from '../ui/Buttons';
import axios from 'axios';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import labels from '../../lib/sphereLabels';
import { useNavigate } from 'react-router-dom';

type Props = {
  level?: 1 | 2 | 3 | 4;
  completed?: number;
  total?: number;
};

const SpiritualPath: React.FC<Props> = ({ level = 1, completed = 0, total = 4 }) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const prefersReduced = useReducedMotion();
  const inView = useInView(ref, { once: true });
  const navigate = useNavigate();

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
      <div className="space-y-4">
        {[...Array(2)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
          >
            <GlassCard className="p-6 bg-gradient-to-br from-white/5 to-white/10 border-white/10">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-amber-400/20 to-amber-500/10 rounded-full animate-pulse" />
                <div className="space-y-3 flex-1">
                  <div className="h-5 bg-amber-400/20 rounded-full animate-pulse w-3/4" />
                  <div className="h-3 bg-white/10 rounded-full animate-pulse w-1/2" />
                  <div className="h-3 bg-white/10 rounded-full animate-pulse w-2/3" />
                </div>
                <div className="w-20 h-8 bg-amber-400/20 rounded animate-pulse" />
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>
    );
  }

  if (!data) {
    return (
      <EmptyState 
        type="spiritualPath"
        action={{
          label: "Commencer mon éveil spirituel",
          onClick: () => navigate('/commande')
        }}
      />
    );
  }

  const teachings = data?.teachings ?? [];
  if (!teachings || teachings.length === 0) {
    return (
      <EmptyState 
        type="spiritualPath"
        title="Vos Enseignements arrivent"
        message="L'Oracle prépare vos leçons spirituelles personnalisées. Votre parcours initiatique commence bientôt."
        action={{
          label: "Découvrir mon chemin",
          onClick: () => navigate('/commande')
        }}
      />
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

