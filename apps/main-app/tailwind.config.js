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
        },
        cosmic: {
          // Palette cosmique inspirée de l'image
          'void': '#0B0B1A',
          'deep': '#1A1B3A',
          'nebula': '#2D2B5A',
          'galaxy': '#4A4B7A',
          'stardust': '#6B6B9A',
          'aurora': '#8B7BD8',
          'celestial': '#B19CD9',
          'ethereal': '#D4C5E8',
          'divine': '#F0E6FF',
          // Or cosmique
          'gold': '#FFD700',
          'gold-warm': '#FFC947',
          'gold-bright': '#FFEB3B',
          // Violets mystiques
          'violet': '#8B5CF6',
          'purple': '#A855F7',
          'magenta': '#D946EF',
          // Accents stellaires
          'star': '#FFFFFF',
          'moonbeam': '#E2E8F0',
          'silver': '#CBD5E1',
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
        'mandala-rotate': 'mandala-rotate 20s linear infinite',
        'mandala-pulse': 'mandala-pulse 4s ease-in-out infinite',
        'cosmic-drift': 'cosmic-drift 15s ease-in-out infinite',
        'stardust': 'stardust 8s ease-in-out infinite',
        'galaxy-swirl': 'galaxy-swirl 25s linear infinite',
        'aurora-wave': 'aurora-wave 12s ease-in-out infinite',
        'float-gentle': 'float-gentle 6s ease-in-out infinite',
        'glow-pulse': 'glow-pulse 3s ease-in-out infinite',
        'twinkle': 'twinkle 2s ease-in-out infinite',
        'nebula-flow': 'nebula-flow 20s ease-in-out infinite',
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
        'mandala-rotate': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        'mandala-pulse': {
          '0%, 100%': { 
            opacity: '0.3',
            transform: 'scale(1)',
          },
          '50%': { 
            opacity: '0.6',
            transform: 'scale(1.05)',
          },
        },
        'cosmic-drift': {
          '0%, 100%': { 
            transform: 'translateY(0px) translateX(0px)',
          },
          '33%': { 
            transform: 'translateY(-20px) translateX(10px)',
          },
          '66%': { 
            transform: 'translateY(10px) translateX(-15px)',
          },
        },
        'stardust': {
          '0%, 100%': { 
            opacity: '0.4',
            transform: 'scale(1)',
          },
          '50%': { 
            opacity: '1',
            transform: 'scale(1.2)',
          },
        },
        'galaxy-swirl': {
          '0%': { 
            transform: 'rotate(0deg) scale(1)',
            opacity: '0.2',
          },
          '50%': { 
            transform: 'rotate(180deg) scale(1.1)',
            opacity: '0.4',
          },
          '100%': { 
            transform: 'rotate(360deg) scale(1)',
            opacity: '0.2',
          },
        },
        'aurora-wave': {
          '0%, 100%': { 
            transform: 'translateX(-50%) scaleY(1)',
            opacity: '0.3',
          },
          '50%': { 
            transform: 'translateX(-50%) scaleY(1.2)',
            opacity: '0.6',
          },
        },
        'float-gentle': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-15px)' },
        },
        'glow-pulse': {
          '0%, 100%': { 
            boxShadow: '0 0 20px rgba(255, 215, 0, 0.3)',
            opacity: '0.8',
          },
          '50%': { 
            boxShadow: '0 0 40px rgba(255, 215, 0, 0.6)',
            opacity: '1',
          },
        },
        'twinkle': {
          '0%, 100%': { opacity: '0.3', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.4)' },
        },
        'nebula-flow': {
          '0%': { 
            transform: 'translateX(-100%) rotate(0deg)',
            opacity: '0',
          },
          '10%': { 
            opacity: '0.3',
          },
          '90%': { 
            opacity: '0.3',
          },
          '100%': { 
            transform: 'translateX(100%) rotate(360deg)',
            opacity: '0',
          },
        },
      },
      backgroundImage: {
        'cosmic-gradient': 'linear-gradient(135deg, #0B0B1A 0%, #1A1B3A 25%, #2D2B5A 50%, #4A4B7A 75%, #2D2B5A 100%)',
        'galaxy-spiral': 'radial-gradient(ellipse at center, rgba(139, 123, 216, 0.3) 0%, rgba(45, 43, 90, 0.2) 50%, transparent 70%)',
        'stardust-trail': 'linear-gradient(45deg, transparent 0%, rgba(255, 215, 0, 0.1) 50%, transparent 100%)',
      },
      boxShadow: {
        'gold-glow': '0 0 20px rgba(212, 175, 55, 0.3)',
        'moonlight': '0 4px 20px rgba(226, 232, 240, 0.1)',
        'forest': '0 8px 32px rgba(10, 15, 10, 0.3)',
        'cosmic': '0 0 50px rgba(139, 123, 216, 0.3)',
        'stellar': '0 0 30px rgba(255, 215, 0, 0.4)',
        'nebula': '0 20px 60px rgba(45, 43, 90, 0.5)',
        'aurora': '0 0 80px rgba(168, 85, 247, 0.4)',
      },
    },
  },
  plugins: [],
};

