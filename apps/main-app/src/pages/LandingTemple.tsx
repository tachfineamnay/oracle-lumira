import React from 'react';
import Hero from '../components/Hero';
import LevelsSection from '../components/LevelsSection';
import DynamicForm from '../components/DynamicForm';
import Testimonials from '../components/Testimonials';
import UpsellSection from '../components/UpsellSection';
import Footer from '../components/Footer';
import PageLayout from '../components/ui/PageLayout';

const LandingTemple: React.FC = () => {
  return (
    <PageLayout variant="light" className="pt-0">
      <Hero />
      {/* Section existante (conservée) */}
      <LevelsSection />
      <DynamicForm />
      <Testimonials />
      <UpsellSection />
      <Footer />
    </PageLayout>
  );
};

export default LandingTemple;
