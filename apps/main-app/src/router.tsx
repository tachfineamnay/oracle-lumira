import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LandingTempleRefonte from './pages/LandingTempleRefonte';
import CommandeTempleSPA from './pages/CommandeTempleSPA';
import ConfirmationTempleSPA from './pages/ConfirmationTempleSPA';
import ConfirmationPage from './pages/ConfirmationPage';
import SanctuairePage from './pages/SanctuairePage';
import CommandeTemple from './pages/CommandeTemple';
import ConfirmationTemple from './pages/ConfirmationTemple';
import SanctuaireUnified from './pages/SanctuaireUnified';
import LoginSanctuaireSimple from './pages/LoginSanctuaireSimple';
import MentionsLegales from './pages/MentionsLegales';
import ExpertDeskPage from './expert/ExpertDesk';

// Garder l'ancien Sanctuaire pour compatibilité legacy
import Sanctuaire from './pages/Sanctuaire';
import LoginSanctuaire from './pages/LoginSanctuaire';
import SphereSkeleton from './components/ui/SphereSkeleton';

// Lazy imports pour l'ancien système (legacy)
const LazySpiritualPath = React.lazy(() => import('./components/spheres/SpiritualPath'));
const LazyRawDraws = React.lazy(() => import('./components/spheres/RawDraws'));
const LazySynthesis = React.lazy(() => import('./components/spheres/Synthesis'));
const LazyConversations = React.lazy(() => import('./components/spheres/Conversations'));
const LazyProfile = React.lazy(() => import('./components/spheres/Profile'));

const AppRoutes: React.FC = () => (
  <Routes>
    <Route path="/" element={<LandingTempleRefonte />} />
    <Route path="/commande" element={<CommandeTempleSPA />} />
    <Route path="/confirmation" element={<ConfirmationTempleSPA />} />
    <Route path="/payment-confirmation" element={<ConfirmationPage />} />
    <Route path="/upload-sanctuaire" element={<SanctuairePage />} />
    
    {/* ROUTE PRINCIPALE SANCTUAIRE - Gère nouveaux et anciens clients */}
    <Route path="/sanctuaire" element={<SanctuaireUnified />} />
    <Route path="/sanctuaire/login" element={<LoginSanctuaireSimple />} />
    
    {/* ROUTES LEGACY pour compatibilité */}
    <Route path="/commande-legacy" element={<CommandeTemple />} />
    <Route path="/confirmation-legacy" element={<ConfirmationTemple />} />
    <Route path="/sanctuaire-legacy" element={<Sanctuaire />}>
      {/* nested children rendered inside Sanctuaire's <Outlet /> */}
      <Route
        path="path"
        element={
          <React.Suspense fallback={<SphereSkeleton />}> 
            <LazySpiritualPath />
          </React.Suspense>
        }
      />
      <Route
        path="draws"
        element={
          <React.Suspense fallback={<SphereSkeleton />}> 
            <LazyRawDraws />
          </React.Suspense>
        }
      />
      <Route
        path="synthesis"
        element={
          <React.Suspense fallback={<SphereSkeleton />}> 
            <LazySynthesis />
          </React.Suspense>
        }
      />
      <Route
        path="chat"
        element={
          <React.Suspense fallback={<SphereSkeleton />}> 
            <LazyConversations />
          </React.Suspense>
        }
      />
      <Route
        path="profile"
        element={
          <React.Suspense fallback={<SphereSkeleton />}> 
            <LazyProfile />
          </React.Suspense>
        }
      />
    </Route>

    <Route path="/mentions-legales" element={<MentionsLegales />} />
    <Route path="/login" element={<LoginSanctuaire />} />
    <Route path="/expert" element={<ExpertDeskPage />} />
  </Routes>
);

export default AppRoutes;
