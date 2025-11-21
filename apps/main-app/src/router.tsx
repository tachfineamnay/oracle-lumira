import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LandingTempleRefonte from './pages/LandingTempleRefonte';
import CommandeTempleSPA from './pages/CommandeTempleSPA';
import ConfirmationTempleSPA from './pages/ConfirmationTempleSPA';
import ConfirmationPage from './pages/ConfirmationPage';
import PaymentSuccessRedirect from './pages/PaymentSuccessRedirect';
import LoginSanctuaireSimple from './pages/LoginSanctuaireSimple';
import LoginSanctuaire from './pages/LoginSanctuaire';
import MentionsLegales from './pages/MentionsLegales';
import ExpertDeskPage from './expert/ExpertDesk';
import { SanctuaireProvider } from './contexts/SanctuaireContext';

// Sanctuaire avec OnboardingForm (stepper 4 étapes) - SYSTÈME FONCTIONNEL
import Sanctuaire from './pages/Sanctuaire';
import SphereSkeleton from './components/ui/SphereSkeleton';

// Lazy imports pour les composants du Sanctuaire
const LazySpiritualPath = React.lazy(() => import('./components/spheres/SpiritualPath'));
const LazyDraws = React.lazy(() => import('./components/spheres/Draws'));
const LazySynthesis = React.lazy(() => import('./components/spheres/Synthesis'));
const LazyConversations = React.lazy(() => import('./components/spheres/Conversations'));
const LazyProfile = React.lazy(() => import('./components/spheres/Profile'));
const LazyRituals = React.lazy(() => import('./components/spheres/Rituals'));
const LazyMandala = React.lazy(() => import('./components/spheres/Mandala'));

const AppRoutes: React.FC = () => (
  <Routes>
    <Route path="/" element={<LandingTempleRefonte />} />
    <Route path="/commande" element={<CommandeTempleSPA />} />
    <Route path="/confirmation" element={<ConfirmationTempleSPA />} />
    <Route path="/payment-success" element={<PaymentSuccessRedirect />} />
    <Route path="/payment-confirmation" element={<ConfirmationPage />} />
    
    {/* ROUTE PRINCIPALE SANCTUAIRE */}
    {/* ✅ Sanctuaire.tsx fournit la mise en page (sidebar, header, onboarding overlay) et rend les sphères via <Outlet /> */}
    <Route
      path="/sanctuaire/*"
      element={
        <SanctuaireProvider>
          <Sanctuaire />
        </SanctuaireProvider>
      }
    >
      {/* Sous-routes rendues dans <Outlet /> de Sanctuaire.tsx pour les vues non-home */}
      <Route path="path" element={
        <React.Suspense fallback={<SphereSkeleton />}>
          <LazySpiritualPath />
        </React.Suspense>
      } />
      <Route path="draws" element={
        <React.Suspense fallback={<SphereSkeleton />}>
          <LazyDraws />
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
      <Route path="profile" element={
        <React.Suspense fallback={<SphereSkeleton />}>
          <LazyProfile />
        </React.Suspense>
      } />
      <Route path="rituals" element={
        <React.Suspense fallback={<SphereSkeleton />}>
          <LazyRituals />
        </React.Suspense>
      } />
      <Route path="mandala" element={
        <React.Suspense fallback={<SphereSkeleton />}>
          <LazyMandala />
        </React.Suspense>
      } />
      {/* Page de login intégrée dans la mise en page du Sanctuaire */}
      <Route path="login" element={<LoginSanctuaireSimple />} />
    </Route>
    
    <Route path="/mentions-legales" element={<MentionsLegales />} />
    <Route path="/login" element={<LoginSanctuaire />} />
    <Route path="/expert" element={<ExpertDeskPage />} />
  </Routes>
);

export default AppRoutes;

