import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LandingTempleRefonte from './pages/LandingTempleRefonte';
import CommandeTempleSPA from './pages/CommandeTempleSPA';
import ConfirmationTempleSPA from './pages/ConfirmationTempleSPA';
import ConfirmationPage from './pages/ConfirmationPage';
import PaymentSuccessRedirect from './pages/PaymentSuccessRedirect';
import SanctuairePage from './pages/SanctuairePage';
import SanctuaireUnified from './pages/SanctuaireUnified';
import LoginSanctuaireSimple from './pages/LoginSanctuaireSimple';
import LoginSanctuaire from './pages/LoginSanctuaire';
import MentionsLegales from './pages/MentionsLegales';
import ExpertDeskPage from './expert/ExpertDesk';
import { SanctuaireProvider } from './contexts/SanctuaireContext';

const AppRoutes: React.FC = () => (
  <Routes>
    <Route path="/" element={<LandingTempleRefonte />} />
    <Route path="/commande" element={<CommandeTempleSPA />} />
    <Route path="/confirmation" element={<ConfirmationTempleSPA />} />
    <Route path="/payment-success" element={<PaymentSuccessRedirect />} />
    <Route path="/payment-confirmation" element={<ConfirmationPage />} />
    <Route path="/upload-sanctuaire" element={<SanctuairePage />} />
    
    {/* ROUTE PRINCIPALE SANCTUAIRE - HARMONISÉE AVEC ONBOARDING UNIFIÉ */}
    {/* ✅ UTILISE SanctuaireUnified avec formulaire enrichi pour tous niveaux (Initié/Mystique/Profond/Intégrale) */}
    <Route
      path="/sanctuaire/*"
      element={
        <SanctuaireProvider>
          <SanctuaireUnified />
        </SanctuaireProvider>
      }
    />
    <Route path="/sanctuaire/login" element={<LoginSanctuaireSimple />} />
    
    <Route path="/mentions-legales" element={<MentionsLegales />} />
    <Route path="/login" element={<LoginSanctuaire />} />
    <Route path="/expert" element={<ExpertDeskPage />} />
  </Routes>
);

export default AppRoutes;

