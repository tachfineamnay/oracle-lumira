import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Import pages
import LandingTemple from './pages/LandingTemple';
import CommandeTemple from './pages/CommandeTemple';
import CommandeTempleSPA from './pages/CommandeTempleSPA';
import ConfirmationTemple from './pages/ConfirmationTemple';
import ConfirmationTempleSPA from './pages/ConfirmationTempleSPA';
import DashboardSanctuaire from './pages/DashboardSanctuaire';
import MentionsLegales from './pages/MentionsLegales';
import ExpertDeskPage from './expert/ExpertDesk';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-cosmic-gradient text-cosmic-divine overflow-x-hidden relative">
      {/* Background cosmique premium unifié */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {/* Fond galactique principal */}
        <div className="absolute inset-0 bg-cosmic-gradient"></div>
        
        {/* Voie lactée subtile et réaliste */}
        <div className="absolute inset-0 bg-galaxy-spiral opacity-40 animate-galaxy-swirl"></div>
        
        {/* Aurore boréale premium en haut */}
        <div className="absolute top-0 left-1/2 w-full h-96 bg-gradient-to-b from-cosmic-aurora/15 via-cosmic-violet/8 to-transparent transform -translate-x-1/2 animate-aurora-wave"></div>
        
        {/* Champ d'étoiles scintillantes réalistes */}
        <div className="absolute top-16 left-20 w-1 h-1 bg-cosmic-star rounded-full animate-twinkle"></div>
        <div className="absolute top-24 left-40 w-1 h-1 bg-cosmic-star rounded-full animate-twinkle" style={{animationDelay: '0.5s'}}></div>
        <div className="absolute top-40 left-60 w-1 h-1 bg-cosmic-star rounded-full animate-twinkle" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-20 right-60 w-1 h-1 bg-cosmic-star rounded-full animate-twinkle" style={{animationDelay: '1.5s'}}></div>
        <div className="absolute top-60 right-40 w-1 h-1 bg-cosmic-star rounded-full animate-twinkle" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-80 left-80 w-1 h-1 bg-cosmic-star rounded-full animate-twinkle" style={{animationDelay: '2.5s'}}></div>
        <div className="absolute top-96 right-80 w-1 h-1 bg-cosmic-star rounded-full animate-twinkle" style={{animationDelay: '3s'}}></div>
        <div className="absolute top-32 left-96 w-1 h-1 bg-cosmic-star rounded-full animate-twinkle" style={{animationDelay: '3.5s'}}></div>
        
        {/* Étoiles plus grandes pour la profondeur */}
        <div className="absolute top-28 right-32 w-2 h-2 bg-cosmic-gold rounded-full animate-glow-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-72 left-32 w-2 h-2 bg-cosmic-violet rounded-full animate-glow-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-48 right-48 w-2 h-2 bg-cosmic-star rounded-full animate-glow-pulse" style={{animationDelay: '3s'}}></div>
        
        {/* Nébuleuses flottantes premium */}
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-cosmic-violet/15 rounded-full blur-3xl animate-cosmic-drift"></div>
        <div className="absolute top-3/4 right-1/4 w-40 h-40 bg-cosmic-aurora/10 rounded-full blur-3xl animate-cosmic-drift" style={{animationDelay: '5s'}}></div>
        <div className="absolute top-1/2 left-1/2 w-24 h-24 bg-cosmic-gold/8 rounded-full blur-2xl animate-cosmic-drift" style={{animationDelay: '10s'}}></div>
        
        {/* Poussière d'étoiles subtile */}
        <div className="absolute inset-0 opacity-20">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="absolute w-px h-px bg-cosmic-star rounded-full animate-stardust"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 8}s`,
                animationDuration: `${6 + Math.random() * 4}s`,
              }}
            />
          ))}
        </div>
        
        {/* Silhouette de forêt UNIQUE en bas - CORRIGÉ */}
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-cosmic-void via-cosmic-void/90 to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-full h-24">
          <svg viewBox="0 0 1200 120" className="w-full h-full" preserveAspectRatio="none">
            <path 
              d="M0,120 L0,80 Q50,60 100,70 Q150,80 200,65 Q250,50 300,60 Q350,70 400,55 Q450,40 500,50 Q550,60 600,45 Q650,30 700,40 Q750,50 800,35 Q850,20 900,30 Q950,40 1000,25 Q1050,10 1100,20 Q1150,30 1200,15 L1200,120 Z" 
              fill="url(#forestGradient)" 
            />
            <defs>
              <linearGradient id="forestGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#0B0B1A" stopOpacity="1"/>
                <stop offset="50%" stopColor="#1A1B3A" stopOpacity="0.9"/>
                <stop offset="100%" stopColor="#0B0B1A" stopOpacity="1"/>
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10">
        <Router>
          <Routes>
            <Route path="/" element={<LandingTemple />} />
            {/* Product SPA Routes (new system) */}
            <Route path="/commande" element={<CommandeTempleSPA />} />
            <Route path="/confirmation" element={<ConfirmationTempleSPA />} />
            {/* Legacy routes (fallback) */}
            <Route path="/commande-legacy" element={<CommandeTemple />} />
            <Route path="/confirmation-legacy" element={<ConfirmationTemple />} />
            <Route path="/sanctuaire" element={<DashboardSanctuaire />} />
            <Route path="/mentions-legales" element={<MentionsLegales />} />
            <Route path="/expert" element={<ExpertDeskPage />} />
          </Routes>
        </Router>
      </div>
    </div>
  );
};

export default App;