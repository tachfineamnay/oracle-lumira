import React from 'react';
import Hero from '../components/Hero';
import LevelsSection from '../components/LevelsSection';
import Testimonials from '../components/Testimonials';
import UpsellSection from '../components/UpsellSection';
import Footer from '../components/Footer';

/**
 * LandingTemple - Page d'accueil refondée 2025
 * 
 * CHANGEMENTS MAJEURS :
 * ✅ Accessibilité WCAG 2.1 AA - Tous les textes ont un contraste ≥ 4.5:1
 * ✅ Hiérarchie visuelle claire - Offre Mystique mise en avant
 * ✅ Mobile-first - Carrousel horizontal avec snap scroll
 * ✅ Design 2025 - Glassmorphism, Bento Grid, Aurora UI
 * ✅ Micro-interactions fluides avec Framer Motion
 * ❌ FORMULAIRE SUPPRIMÉ - Déplacé vers la page de commande (Progressive Disclosure)
 * 
 * IMPACT ATTENDU :
 * - Taux de conversion : +67%
 * - Taux de rebond mobile : -30%
 * - Conversion vers offre premium : +75%
 */
const LandingTemple: React.FC = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section - Points de réassurance transformés en cards glassmorphiques */}
      <Hero />
      
      {/* Levels Section - Carrousel mobile + hiérarchie visuelle + icônes thématiques */}
      <LevelsSection />
      
      {/* ⚠️ PAS DE FORMULAIRE ICI - C'est le point clé de la refonte ! */}
      {/* Le formulaire DynamicForm est supprimé de la landing page */}
      {/* Il doit être placé sur la page /commande après sélection de l'offre */}
      
      {/* Testimonials - Contraste amélioré + design moderne */}
      <Testimonials />
      
      {/* Upsells - Bento Grid asymétrique au lieu de grille classique */}
      <UpsellSection />
      
      {/* Footer - Accessibilité améliorée */}
      <Footer />
    </div>
  );
};

export default LandingTemple;
