import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Star, Book, Layers, MessageCircle, Wrench } from 'lucide-react';
import GlassCard from '../ui/GlassCard';
import labels from '../../lib/sphereLabels';

type Props = {
  progress?: number[]; // [path, draws, synthesis, conversations, tools]
};

const ORDER: Array<{ key: 'spiritualPath'|'rawDraws'|'synthesis'|'conversations'|'tools'; to: string; icon: React.ReactNode; }>= [
  { key: 'spiritualPath', to: '/sanctuaire/path', icon: <Star className="w-4 h-4" /> },
  { key: 'rawDraws', to: '/sanctuaire/draws', icon: <Book className="w-4 h-4" /> },
  { key: 'synthesis', to: '/sanctuaire/synthesis', icon: <Layers className="w-4 h-4" /> },
  { key: 'conversations', to: '/sanctuaire/chat', icon: <MessageCircle className="w-4 h-4" /> },
  { key: 'tools', to: '/sanctuaire/tools', icon: <Wrench className="w-4 h-4" /> },
];

const circumference = 2 * Math.PI * 12; // r=12 small ring

const MandalaSidebar: React.FC<Props> = ({ progress = [0,0,0,0,0] }) => {
  const location = useLocation();

  return (
    <GlassCard className="hidden lg:block p-3 bg-white/5 border-white/10 sticky top-6">
      <nav aria-label="Navigation latérale sanctuaire" className="space-y-1">
        {ORDER.map((item, i) => {
          const isActive = location.pathname.startsWith(item.to);
          const prog = Math.max(0, Math.min(100, progress[i] ?? 0));
          const dash = circumference - (circumference * prog) / 100;

          return (
            <NavLink
              key={item.key}
              to={item.to}
              className={({ isActive: active }) => `
                flex items-center gap-3 px-3 py-2 rounded-lg transition-colors duration-200
                ${active || isActive ? 'bg-white/10 text-amber-300' : 'text-white/80 hover:bg-white/5 hover:text-white'}
              `}
            >
              <div className="relative w-7 h-7 flex items-center justify-center">
                <svg viewBox="0 0 48 48" className="absolute inset-0" aria-hidden>
                  <circle cx="24" cy="24" r="19" strokeWidth="2" stroke="rgba(255,255,255,0.15)" fill="none" />
                  <circle cx="24" cy="24" r="19" strokeWidth="3" stroke="rgba(251,191,36,0.5)" fill="none"
                          strokeDasharray={circumference} strokeDashoffset={dash} strokeLinecap="round" />
                </svg>
                <span className={isActive ? 'text-amber-300' : 'text-white/80'}>{item.icon}</span>
              </div>
              <span className="text-sm font-medium truncate">{labels[item.key as keyof typeof labels] || item.key}</span>
              <span className="ml-auto text-xs text-white/60">{Math.round(prog)}%</span>
            </NavLink>
          );
        })}
      </nav>
    </GlassCard>
  );
};

export default MandalaSidebar;

