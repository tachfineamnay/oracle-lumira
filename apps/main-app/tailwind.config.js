/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        mystical: {
          // Base colors - Noir abyssal et Bleu nuit
          'black': '#000000',
          'abyss': '#0A0A0F',
          'midnight': '#0F172A',
          'deep-blue': '#1E293B',
          'navy': '#334155',
          // Lumières mystiques
          'gold': '#D4AF37',
          'gold-light': '#FFD700',
          'violet-astral': '#C084FC',
          'purple': '#A78BFA',
          // Accents lunaires
          'moonlight': '#E2E8F0',
          'starlight': '#F8FAFC',
          'silver': '#CBD5E1',
          // Forêt mystique
          'forest-dark': '#0A0F0A',
          'forest-deep': '#1A2F1A',
          'moss': '#2D5A2D',
          'sage': '#4A6741',
        }
      },
      fontFamily: {
        'playfair': ['Playfair Display', 'serif'],
        'inter': ['Inter', 'sans-serif'],
      },
      animation: {
        'wave-gentle': 'wave-gentle 8s ease-in-out infinite',
        'gold-pulse': 'gold-pulse 3s ease-in-out infinite',
        'shooting-star': 'shooting-star 2s ease-out forwards',
        'float': 'float 6s ease-in-out infinite',
        'moonbeam': 'moonbeam 5s ease-in-out infinite',
        'startwinkle': 'startwinkle 2.5s ease-in-out infinite',
      },
      keyframes: {
        'wave-gentle': {
          '0%, 100%': { transform: 'translateY(0px) scale(1)' },
          '50%': { transform: 'translateY(-10px) scale(1.02)' },
        },
        'gold-pulse': {
          '0%, 100%': { opacity: '0.6', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.05)' },
        },
        'shooting-star': {
          '0%': { transform: 'translateX(-100px) translateY(-100px)', opacity: '0' },
          '10%': { opacity: '1' },
          '90%': { opacity: '1' },
          '100%': { transform: 'translateX(300px) translateY(300px)', opacity: '0' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'moonbeam': {
          '0%, 100%': { opacity: '0.5', transform: 'scale(1)' },
          '50%': { opacity: '0.9', transform: 'scale(1.06)' },
        },
        'startwinkle': {
          '0%, 100%': { opacity: '0.2', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.3)' },
        },
      },
      boxShadow: {
        'gold-glow': '0 0 20px rgba(212, 175, 55, 0.3)',
        'moonlight': '0 4px 20px rgba(226, 232, 240, 0.1)',
        'forest': '0 8px 32px rgba(10, 15, 10, 0.3)',
      },
    },
  },
  plugins: [],
};

