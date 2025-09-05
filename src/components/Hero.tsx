import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, Sparkles } from 'lucide-react';
import MandalaAnimation from './MandalaAnimation';

const Hero: React.FC = () => {
  const navigate = useNavigate();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <section className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-mystical-dark via-mystical-dark to-mystical-purple/10" />
      
      {/* Interactive Glow */}
      <motion.div
        className="absolute w-96 h-96 rounded-full bg-mystical-gold/10 blur-3xl"
        animate={{
          x: mousePosition.x - 192,
          y: mousePosition.y - 192,
        }}
        transition={{ type: "spring", damping: 30, stiffness: 100 }}
      />

      <div className="container mx-auto px-6 text-center relative z-10">
        {/* Mandala Background */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <MandalaAnimation />
        </div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.5 }}
          className="relative z-20"
        >
          {/* Floating Stars */}
          <div className="absolute -top-12 left-1/4 animate-float">
            <Star className="w-6 h-6 text-mystical-gold opacity-60" fill="currentColor" />
          </div>
          <div className="absolute -top-8 right-1/3 animate-float" style={{ animationDelay: '2s' }}>
            <Sparkles className="w-5 h-5 text-mystical-amber opacity-70" />
          </div>

          <motion.h1 
            className="font-playfair italic text-6xl md:text-8xl lg:text-9xl font-medium mb-6 leading-tight"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.5, delay: 0.8 }}
          >
            <span className="bg-gradient-to-r from-mystical-gold via-mystical-gold-light to-mystical-amber bg-clip-text text-transparent">
              Révèle
            </span>
            <br />
            <span className="text-white">ton</span>
            <br />
            <span className="bg-gradient-to-r from-mystical-purple via-mystical-purple-light to-mystical-gold bg-clip-text text-transparent">
              Archétype
            </span>
          </motion.h1>

          <motion.p 
            className="font-inter font-light text-xl md:text-2xl mb-12 text-gray-300 max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1.2 }}
          >
            Une lecture vibratoire, livrée en 24h<br />
            sous forme d'audio mystique
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1.5 }}
          >
            <button 
              onClick={() => {
                const element = document.getElementById('levels-section');
                element?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="group relative px-12 py-4 rounded-full bg-gradient-to-r from-mystical-gold to-mystical-gold-light font-inter font-medium text-mystical-dark text-lg transition-all duration-500 hover:shadow-2xl hover:shadow-mystical-gold/30 hover:scale-105"
            >
              <span className="relative z-10">Commencer mon tirage</span>
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-mystical-gold-light to-mystical-amber opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              {/* Glow Effect */}
              <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-mystical-gold to-mystical-gold-light blur opacity-30 group-hover:opacity-60 transition-opacity duration-500" />
            </button>
          </motion.div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-12 left-1/2 transform -translate-x-1/2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.5 }}
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-1 h-12 bg-gradient-to-b from-mystical-gold to-transparent rounded-full"
          />
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;