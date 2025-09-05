import React from 'react';
import { motion } from 'framer-motion';
import Hero from '../components/Hero';
import LevelsSection from '../components/LevelsSection';
import DynamicForm from '../components/DynamicForm';
import Testimonials from '../components/Testimonials';
import Footer from '../components/Footer';
import ParticleSystem from '../components/ParticleSystem';
import GoldenMist from '../components/GoldenMist';

const LandingTemple: React.FC = () => {
  return (
    <div className="min-h-screen bg-mystical-dark text-white relative overflow-hidden">
      {/* Background Effects */}
      <ParticleSystem />
      <GoldenMist />
      
      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
        className="relative z-10"
      >
        <Hero />
        <LevelsSection />
        <DynamicForm />
        <Testimonials />
        <Footer />
      </motion.div>
    </div>
  );
};

export default LandingTemple;
