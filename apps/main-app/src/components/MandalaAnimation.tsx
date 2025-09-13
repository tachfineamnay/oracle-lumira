import React from 'react';

// Mandala statique simplifié
const MandalaAnimation: React.FC = () => {
  return (
    <div className="relative w-96 h-96 opacity-10">
      {/* Cercles concentriques statiques */}
      <svg width="384" height="384" viewBox="0 0 384 384" className="absolute inset-0">
        {/* Cercle extérieur */}
        <circle
          cx="192"
          cy="192"
          r="180"
          fill="none"
          stroke="rgba(226, 232, 240, 0.3)"
          strokeWidth="1"
          strokeDasharray="2,12"
        />
        
        {/* Cercle moyen */}
        <circle
          cx="192"
          cy="192"
          r="120"
          fill="none"
          stroke="rgba(226, 232, 240, 0.2)"
          strokeWidth="1"
          strokeDasharray="1,8"
        />
        
        {/* Cercle intérieur */}
        <circle
          cx="192"
          cy="192"
          r="60"
          fill="none"
          stroke="rgba(226, 232, 240, 0.4)"
          strokeWidth="1.5"
          strokeDasharray="0.5,6"
        />
      </svg>

      {/* Centre lumineux */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-mystical-moonlight/20 blur-xl"></div>
    </div>
  );
};

export default MandalaAnimation;