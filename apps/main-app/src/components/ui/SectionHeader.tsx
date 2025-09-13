import React from 'react';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  align?: 'left' | 'center';
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ title, subtitle, icon, align = 'center' }) => {
  return (
    <div className={`text-${align} mb-6 md:mb-8`}>
      <div className={`flex ${align === 'center' ? 'justify-center' : ''} items-center gap-3 mb-3`}>
        {icon}
        <h2 className="font-playfair italic text-2xl md:text-3xl font-medium bg-gradient-to-r from-mystical-gold via-mystical-gold-light to-mystical-gold bg-clip-text text-transparent">
          {title}
        </h2>
      </div>
      {subtitle && (
        <p className="font-inter text-sm md:text-base text-mystical-silver max-w-2xl mx-auto">{subtitle}</p>
      )}
    </div>
  );
};

export default SectionHeader;
