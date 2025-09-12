import React from 'react';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  children: React.ReactNode;
};

export const PrimaryButton: React.FC<ButtonProps> = ({ children, className = '', ...props }) => (
  <button
    className={`px-6 md:px-8 py-3 md:py-4 rounded-xl bg-gradient-to-r from-mystical-gold to-mystical-gold-light text-mystical-dark font-inter font-semibold shadow-soft hover:shadow-aurora transition-all duration-300 hover:scale-[1.02] ${className}`}
    {...props}
  >
    {children}
  </button>
);

export const SecondaryButton: React.FC<ButtonProps> = ({ children, className = '', ...props }) => (
  <button
    className={`px-6 md:px-8 py-3 md:py-4 rounded-xl border border-mystical-gold/40 text-mystical-gold hover:bg-mystical-gold/10 transition-colors duration-300 ${className}`}
    {...props}
  >
    {children}
  </button>
);

