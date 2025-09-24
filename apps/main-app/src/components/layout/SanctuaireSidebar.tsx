// Oracle Lumira - Sidebar pour navigation du Sanctuaire
import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Star, Book, Layers, MessageCircle, Home, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import GlassCard from '../ui/GlassCard';

type Props = {
  progress?: number[];
};

const NAVIGATION_ITEMS = [
  { 
    key: 'home', 
    to: '/sanctuaire', 
    icon: <Home className="w-5 h-5" />, 
    label: 'Accueil',
    exact: true 
  },
  { 
    key: 'spiritualPath', 
    to: '/sanctuaire/path', 
    icon: <Star className="w-5 h-5" />, 
    label: 'Chemin Spirituel' 
  },
  { 
    key: 'rawDraws', 
    to: '/sanctuaire/draws', 
    icon: <Book className="w-5 h-5" />, 
    label: 'Tirages & Lectures' 
  },
  { 
    key: 'synthesis', 
    to: '/sanctuaire/synthesis', 
    icon: <Layers className="w-5 h-5" />, 
    label: 'Synthèse' 
  },
  { 
    key: 'conversations', 
    to: '/sanctuaire/chat', 
    icon: <MessageCircle className="w-5 h-5" />, 
    label: 'Conversations' 
  }
];

const SanctuaireSidebar: React.FC<Props> = ({ progress = [] }) => {
  const location = useLocation();
  const navigate = useNavigate();

  // Ne pas afficher la sidebar sur la page d'accueil
  if (location.pathname === '/sanctuaire') {
    return null;
  }

  return (
    <motion.aside 
      className="fixed left-0 top-0 h-full w-64 bg-gradient-to-b from-mystical-900/95 to-mystical-800/95 backdrop-blur-xl border-r border-white/10 z-40"
      initial={{ x: -264 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header Sidebar */}
      <div className="p-6 border-b border-white/10">
        <button
          onClick={() => navigate('/sanctuaire')}
          className="flex items-center gap-3 text-amber-400 hover:text-amber-300 transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400/30 to-amber-500/20 flex items-center justify-center">
            <Star className="w-5 h-5" />
          </div>
          <div>
            <div className="font-semibold text-sm">Sanctuaire</div>
            <div className="text-xs text-white/60">Oracle Lumira</div>
          </div>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6">
        <div className="space-y-2">
          {NAVIGATION_ITEMS.map((item, index) => {
            const isActive = item.exact 
              ? location.pathname === item.to 
              : location.pathname.startsWith(item.to);
            
            const prog = progress[index] || 0;

            return (
              <NavLink
                key={item.key}
                to={item.to}
                className={`group flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 ${
                  isActive 
                    ? 'bg-amber-400/10 text-amber-300 border border-amber-400/20' 
                    : 'text-white/70 hover:bg-white/5 hover:text-white'
                }`}
              >
                <div className="relative">
                  {item.icon}
                  {prog > 0 && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full flex items-center justify-center">
                      <span className="text-xs text-mystical-900 font-bold">{Math.round(prog / 20)}</span>
                    </div>
                  )}
                </div>
                <span className="font-medium text-sm flex-1">{item.label}</span>
                {prog > 0 && (
                  <div className="w-8 h-1 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-amber-400 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(prog, 100)}%` }}
                    />
                  </div>
                )}
              </NavLink>
            );
          })}
        </div>
      </nav>

      {/* Upgrade Section */}
      <div className="p-4 border-t border-white/10">
        <GlassCard className="p-4 bg-gradient-to-br from-amber-400/10 to-amber-500/5 border-amber-400/20">
          <div className="flex items-center gap-3 mb-3">
            <TrendingUp className="w-5 h-5 text-amber-400" />
            <span className="text-sm font-medium text-white">Évoluer</span>
          </div>
          <p className="text-xs text-white/70 mb-3">
            Découvrez les niveaux supérieurs de votre parcours spirituel
          </p>
          <button 
            onClick={() => navigate('/commande')}
            className="w-full py-2 px-3 bg-gradient-to-r from-amber-400 to-amber-500 text-mystical-900 text-sm font-medium rounded-lg hover:from-amber-500 hover:to-amber-600 transition-all"
          >
            Voir les offres
          </button>
        </GlassCard>
      </div>
    </motion.aside>
  );
};

export default SanctuaireSidebar;