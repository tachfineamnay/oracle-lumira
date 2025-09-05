import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Import pages
import LandingTemple from './pages/LandingTemple';
import CommandeTemple from './pages/CommandeTemple';
import ConfirmationTemple from './pages/ConfirmationTemple';
import DashboardSanctuaire from './pages/DashboardSanctuaire';
import MentionsLegales from './pages/MentionsLegales';
import ExpertDeskPage from './expert/ExpertDesk';

// Import background components
import ParticleSystem from './components/ParticleSystem';
import GoldenMist from './components/GoldenMist';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-mystical-dark text-white overflow-x-hidden">
      {/* Background Effects */}
      <ParticleSystem />
      <GoldenMist />
      
      {/* Main Content */}
      <div className="relative z-10">
        <Router>
          <Routes>
            <Route path="/" element={<LandingTemple />} />
            <Route path="/commande" element={<CommandeTemple />} />
            <Route path="/confirmation" element={<ConfirmationTemple />} />
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
