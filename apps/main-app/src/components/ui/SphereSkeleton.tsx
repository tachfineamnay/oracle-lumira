import React from 'react';
import GlassCard from './GlassCard';

const SphereSkeleton: React.FC = () => {
  return (
    <GlassCard className="p-6">
      <div className="animate-pulse space-y-4">
        <div className="h-4 bg-white/10 rounded-md w-3/4"></div>
        <div className="h-4 bg-white/10 rounded-md w-1/2"></div>
        <div className="h-4 bg-white/10 rounded-md w-5/6"></div>
      </div>
    </GlassCard>
  );
};

export default SphereSkeleton;