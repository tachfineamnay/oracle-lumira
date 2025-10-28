import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LandingTempleRefonte from './pages/LandingTempleRefonte';
import CommandeTempleSPA from './pages/CommandeTempleSPA';
import ConfirmationTempleSPA from './pages/ConfirmationTempleSPA';
import ConfirmationPage from './pages/ConfirmationPage';
import PaymentSuccessRedirect from './pages/PaymentSuccessRedirect';
import SanctuairePage from './pages/SanctuairePage';
import CommandeTemple from './pages/CommandeTemple';
import ConfirmationTemple from './pages/ConfirmationTemple';
import SanctuaireUnified from './pages/SanctuaireUnified';
import LoginSanctuaireSimple from './pages/LoginSanctuaireSimple';
import MentionsLegales from './pages/MentionsLegales';
import ExpertDeskPage from './expert/ExpertDesk';
import { SanctuaireProvider } from './contexts/SanctuaireContext';

// Garder l'ancien Sanctuaire pour compatibilité legacy
import Sanctuaire from './pages/Sanctuaire';
import LoginSanctuaire from './pages/LoginSanctuaire';
import SphereSkeleton from './components/ui/SphereSkeleton';

// Lazy imports pour les composants du Sanctuaire
const LazySpiritualPath = React.lazy(() => import('./components/spheres/SpiritualPath'));
const LazyDraws = React.lazy(() => import('./components/spheres/Draws')); // PASSAGE 25: MVP Draws avec upgrades
const LazyMesLectures = React.lazy(() => import('./components/spheres/MesLectures')); // Ancien composant (legacy)
const LazySynthesis = React.lazy(() => import('./components/spheres/Synthesis'));
const LazyConversations = React.lazy(() => import('./components/spheres/Conversations'));
const LazyProfile = React.lazy(() => import('./components/spheres/Profile')); // Composant MIS À JOUR avec données API

// Legacy: RawDraws uniquement pour routes legacy (non utilisé en production)
const LazyRawDraws = React.lazy(() => import('./components/spheres/RawDraws'));

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
    
    {/* ROUTES LEGACY pour compatibilité et tests */}
    <Route path="/sanctuaire-legacy" element={
      <SanctuaireProvider>
        <Sanctuaire />
      </SanctuaireProvider>
    } />

    <Route path="/mentions-legales" element={<MentionsLegales />} />
    <Route path="/login" element={<LoginSanctuaire />} />
    <Route path="/expert" element={<ExpertDeskPage />} />
  </Routes>
);

export default AppRoutes;

