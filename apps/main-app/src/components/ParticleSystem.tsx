import React from 'react';

// Composant simplifié - plus de particules complexes
const ParticleSystem: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      {/* Étoiles fixes simples */}
      <div className="absolute top-20 left-20 w-1 h-1 bg-mystical-starlight rounded-full opacity-60"></div>
      <div className="absolute top-32 left-60 w-1 h-1 bg-mystical-starlight rounded-full opacity-40"></div>
      <div className="absolute top-16 right-40 w-1 h-1 bg-mystical-starlight rounded-full opacity-70"></div>
      <div className="absolute top-40 right-80 w-1 h-1 bg-mystical-starlight rounded-full opacity-50"></div>
      <div className="absolute bottom-60 left-40 w-1 h-1 bg-mystical-starlight rounded-full opacity-60"></div>
      <div className="absolute bottom-80 right-60 w-1 h-1 bg-mystical-starlight rounded-full opacity-45"></div>
    </div>
  );
};

export default ParticleSystem;