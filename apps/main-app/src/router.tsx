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
const LazyMesLectures = React.lazy(() => import('./components/spheres/MesLectures')); // Composant MIS À JOUR avec DrawsWaiting
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
    
    {/* ROUTE PRINCIPALE SANCTUAIRE - Enveloppée dans SanctuaireProvider */}
    {/* ✅ UTILISE LES COMPOSANTS MIS À JOUR (Profile + MesLectures avec DrawsWaiting) */}
    <Route
      path="/sanctuaire/*"
      element={
        <SanctuaireProvider>
          <Routes>
            <Route index element={<Sanctuaire />} />
            <Route path="path" element={
              <React.Suspense fallback={<SphereSkeleton />}>
                <LazySpiritualPath />
              </React.Suspense>
            } />
            {/* Route draws: utilise MesLectures (contient DrawsWaiting pour état vide) */}
            <Route path="draws" element={
              <React.Suspense fallback={<SphereSkeleton />}>
                <LazyMesLectures />
              </React.Suspense>
            } />
            <Route path="synthesis" element={
              <React.Suspense fallback={<SphereSkeleton />}>
                <LazySynthesis />
              </React.Suspense>
            } />
            <Route path="chat" element={
              <React.Suspense fallback={<SphereSkeleton />}>
                <LazyConversations />
              </React.Suspense>
            } />
            {/* Route profile: utilise Profile (injection données API email/phone) */}
            <Route path="profile" element={
              <React.Suspense fallback={<SphereSkeleton />}>
                <LazyProfile />
              </React.Suspense>
            } />
          </Routes>
        </SanctuaireProvider>
      }
    />
    {/* Garder la nouvelle version pour tests et référence */}
    <Route path="/sanctuaire-unified" element={
      <SanctuaireProvider>
        <SanctuaireUnified />
      </SanctuaireProvider>
    } />
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

