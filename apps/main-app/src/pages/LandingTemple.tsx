import React from 'react';
import Hero from '../components/Hero';
import LevelsSection from '../components/LevelsSection';
import LuminousPath from '../components/LuminousPath';
import DynamicForm from '../components/DynamicForm';
import Testimonials from '../components/Testimonials';
import UpsellSection from '../components/UpsellSection';
import Footer from '../components/Footer';

const LandingTemple: React.FC = () => {
  return (
    <div className="min-h-screen">
      <Hero />
      {/* Nouveau parcours ascendant */}
      <LuminousPath />
      {/* Section existante (conservée) */}
      <LevelsSection />
      <DynamicForm />
      <Testimonials />
      <UpsellSection />
      <Footer />
    </div>
  );
};

export default LandingTemple;
