import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useMousePosition } from './hooks/useScrollAnimation';

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
  const mousePosition = useMousePosition();

  return (
    <div className="min-h-screen bg-cosmic-gradient text-cosmic-divine overflow-x-hidden relative">
      {/* Background cosmique premium avec parallaxe souris */}
      <div 
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          transform: `translate(${mousePosition.x * 0.01}px, ${mousePosition.y * 0.01}px)`,
          transition: 'transform 0.1s ease-out'
        }}
      >
        {/* Fond galactique principal */}
        <div className="absolute inset-0 bg-cosmic-gradient"></div>
        
        {/* Voie lactée subtile et réaliste */}
        <div className="absolute inset-0 bg-galaxy-spiral opacity-40 animate-galaxy-swirl"></div>
        
        {/* Aurore boréale premium en haut */}
        <div className="absolute top-0 left-1/2 w-full h-96 bg-gradient-to-b from-cosmic-aurora/15 via-cosmic-violet/8 to-transparent transform -translate-x-1/2 animate-aurora-wave"></div>
        
        {/* Constellation réaliste avec parallaxe souris */}
        <div 
          className="absolute inset-0"
          style={{
            transform: `translate(${mousePosition.x * 0.02}px, ${mousePosition.y * 0.02}px)`,
            transition: 'transform 0.15s ease-out'
          }}
        >
          {/* Étoiles principales - Constellation de la Grande Ourse */}
          <div className="absolute top-20 left-1/4 w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.8)]" style={{opacity: 0.9}}></div>
          <div className="absolute top-16 left-1/3 w-1 h-1 bg-white rounded-full shadow-[0_0_6px_rgba(255,255,255,0.7)]" style={{opacity: 0.8}}></div>
          <div className="absolute top-24 left-[38%] w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.8)]" style={{opacity: 0.9}}></div>
          <div className="absolute top-32 left-[42%] w-1 h-1 bg-white rounded-full shadow-[0_0_6px_rgba(255,255,255,0.7)]" style={{opacity: 0.7}}></div>
          
          {/* Étoiles secondaires dispersées naturellement */}
          <div className="absolute top-40 right-1/4 w-1 h-1 bg-white rounded-full shadow-[0_0_4px_rgba(255,255,255,0.6)]" style={{opacity: 0.6}}></div>
          <div className="absolute top-60 left-1/5 w-0.5 h-0.5 bg-white rounded-full shadow-[0_0_3px_rgba(255,255,255,0.5)]" style={{opacity: 0.5}}></div>
          <div className="absolute top-80 right-1/3 w-0.5 h-0.5 bg-white rounded-full shadow-[0_0_3px_rgba(255,255,255,0.5)]" style={{opacity: 0.4}}></div>
          <div className="absolute top-36 right-1/5 w-1 h-1 bg-white rounded-full shadow-[0_0_5px_rgba(255,255,255,0.6)]" style={{opacity: 0.7}}></div>
          
          {/* Étoile polaire - Plus brillante */}
          <div className="absolute top-12 right-1/2 w-2 h-2 bg-cosmic-gold rounded-full shadow-[0_0_12px_rgba(255,215,0,0.9)]" style={{opacity: 0.95}}></div>
        </div>
        
        {/* Nébuleuses flottantes premium */}
        <div 
          className="absolute top-1/4 left-1/4 w-32 h-32 bg-cosmic-violet/12 rounded-full blur-3xl animate-cosmic-drift"
          style={{
            transform: `translate(${mousePosition.x * 0.005}px, ${mousePosition.y * 0.005}px)`,
            transition: 'transform 0.2s ease-out'
          }}
        ></div>
        <div 
          className="absolute top-3/4 right-1/4 w-40 h-40 bg-cosmic-aurora/8 rounded-full blur-3xl animate-cosmic-drift" 
          style={{
            animationDelay: '5s',
            transform: `translate(${mousePosition.x * -0.003}px, ${mousePosition.y * -0.003}px)`,
            transition: 'transform 0.25s ease-out'
          }}
        ></div>
        
        {/* Horizon cosmique UNIQUE - Corrigé */}
        <div className="absolute bottom-0 left-0 w-full h-24">
          <svg viewBox="0 0 1200 100" className="w-full h-full" preserveAspectRatio="none">
            <defs>
              <linearGradient id="horizonGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="rgba(11, 11, 26, 0)" stopOpacity="0"/>
                <stop offset="30%" stopColor="rgba(26, 27, 58, 0.3)" stopOpacity="0.3"/>
                <stop offset="70%" stopColor="rgba(45, 43, 90, 0.7)" stopOpacity="0.7"/>
                <stop offset="100%" stopColor="rgba(11, 11, 26, 1)" stopOpacity="1"/>
              </linearGradient>
            </defs>
            <path 
              d="M0,100 L0,60 Q100,45 200,50 Q300,55 400,45 Q500,35 600,40 Q700,45 800,35 Q900,25 1000,30 Q1100,35 1200,25 L1200,100 Z" 
              fill="url(#horizonGradient)" 
            />
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