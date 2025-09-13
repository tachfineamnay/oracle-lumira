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

// Import background components
import ParticleSystem from './components/ParticleSystem';
import GoldenMist from './components/GoldenMist';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-mystical-abyss via-mystical-midnight to-mystical-deep-blue text-mystical-starlight overflow-x-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {/* Effet ondulaire paisible */}
        <div className="absolute inset-0 bg-gradient-to-br from-mystical-abyss via-mystical-midnight to-mystical-black animate-wave-gentle"></div>
        
        {/* Lumière lunaire */}
        <div className="absolute top-10 right-20 w-32 h-32 bg-mystical-moonlight/20 rounded-full blur-3xl animate-gold-pulse"></div>
        <div className="absolute top-32 right-32 w-16 h-16 bg-mystical-moonlight/30 rounded-full blur-2xl animate-gold-pulse" style={{animationDelay: '2s'}}></div>
        
        {/* Étoiles */}
        <div className="absolute top-16 left-20 w-1 h-1 bg-mystical-starlight rounded-full animate-gold-pulse"></div>
        <div className="absolute top-24 left-40 w-1 h-1 bg-mystical-starlight rounded-full animate-gold-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-40 left-60 w-1 h-1 bg-mystical-starlight rounded-full animate-gold-pulse" style={{animationDelay: '3s'}}></div>
        <div className="absolute top-20 right-60 w-1 h-1 bg-mystical-starlight rounded-full animate-gold-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-60 right-40 w-1 h-1 bg-mystical-starlight rounded-full animate-gold-pulse" style={{animationDelay: '4s'}}></div>
        
        {/* Relief de forêt mystique */}
        <div className="absolute bottom-0 left-0 w-full h-40 bg-gradient-to-t from-mystical-forest-deep/40 to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-full h-20 bg-gradient-to-t from-mystical-forest-dark/60 to-transparent"></div>
      
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
    </div>
  );
};

export default App;
