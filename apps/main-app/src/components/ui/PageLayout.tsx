import React from 'react';

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
  return (
    <div className={`min-h-screen ${variants[variant]} ${className}`}>
      <div className="container mx-auto px-4 md:px-6 py-8 md:py-12">
        {children}
      </div>
    </div>
  );
};

export default PageLayout;
