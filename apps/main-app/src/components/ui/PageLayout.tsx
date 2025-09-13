import React from 'react';

type Variant = 'dark';

interface PageLayoutProps {
  children: React.ReactNode;
  variant?: Variant;
  className?: string;
}

const variants: Record<Variant, string> = {
  dark: 'bg-gradient-to-br from-mystical-abyss via-mystical-midnight to-mystical-deep-blue',
};

const PageLayout: React.FC<PageLayoutProps> = ({ children, variant = 'dark', className = '' }) => {
  return (
    <div className={`min-h-screen ${variants[variant]} ${className}`}>
      <div className="container mx-auto px-4 md:px-6 py-8 md:py-12">
        {children}
      </div>
    </div>
  );
};

export default PageLayout;
