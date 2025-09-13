import React from 'react';
import SpiritualWaves from '../SpiritualWaves';

type Variant = 'light' | 'dark';

interface PageLayoutProps {
  children: React.ReactNode;
  variant?: Variant;
  className?: string;
}

const variants: Record<Variant, string> = {
  light: 'bg-gradient-to-b from-mystical-aurora via-mystical-cream to-mystical-pearl',
  dark: 'bg-gradient-to-br from-mystical-dark via-mystical-purple to-mystical-dark',
};

const PageLayout: React.FC<PageLayoutProps> = ({ children, variant = 'light', className = '' }) => {
  const wavesIntensity = variant === 'dark' ? 'strong' : 'subtle';
  return (
    <div className={`min-h-screen relative overflow-hidden ${variants[variant]} ${className}`}>
      {/* Subtle organic waves background */}
      <SpiritualWaves intensity={wavesIntensity as any} />
      <div className="container mx-auto px-4 md:px-6 py-8 md:py-12 relative z-10">
        {children}
      </div>
    </div>
  );
};

export default PageLayout;
