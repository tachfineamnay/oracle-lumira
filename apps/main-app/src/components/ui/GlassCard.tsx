import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
}

const GlassCard: React.FC<GlassCardProps> = ({ children, className = '' }) => {
  return (
    <div className={`bg-gradient-to-br from-mystical-gold/10 to-mystical-purple/10 backdrop-blur-sm border border-mystical-gold/30 rounded-2xl md:rounded-3xl p-6 md:p-8 ${className}`}>
      {children}
    </div>
  );
};

export default GlassCard;

