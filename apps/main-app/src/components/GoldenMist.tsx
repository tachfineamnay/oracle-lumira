import React from 'react';

// Effet de brume lunaire paisible
const GoldenMist: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      {/* Brume lunaire douce */}
      <div className="absolute inset-0 bg-gradient-to-tr from-mystical-moonlight/5 via-transparent to-mystical-moonlight/3 animate-moonbeam"></div>
      
      {/* Relief de forêt en arrière-plan */}
      <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-mystical-forest-dark/30 via-mystical-forest-deep/20 to-transparent"></div>
      
      {/* Halo lunaire */}
      <div className="absolute top-20 right-20 w-64 h-64 bg-mystical-moonlight/8 rounded-full blur-3xl animate-moonbeam"></div>
    </div>
  );
};

export default GoldenMist;