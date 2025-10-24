import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
}

const GlassCard: React.FC<GlassCardProps> = ({ children, className = '' }) => {
  return (
    <div className={`bg-gradient-to-br from-purple-400/10 to-blue-400/10 backdrop-blur-sm border border-purple-400/30 rounded-2xl md:rounded-3xl p-6 md:p-8 ${className}`}>
      {children}
    </div>
  );
};

export default GlassCard;

