/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
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
        'shooting-star': 'shooting-star 3s ease-out infinite',
        'shooting-star-delayed': 'shooting-star 4s ease-out infinite 1.5s',
        'shooting-star-slow': 'shooting-star 5s ease-out infinite 3s',
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
        'shooting-star': {
          '0%': { 
            transform: 'translateX(-100px) translateY(-100px) rotate(45deg)',
            opacity: '0',
            width: '2px',
            height: '2px'
          },
          '10%': { 
            opacity: '1',
            width: '4px',
            height: '80px'
          },
          '90%': { 
            opacity: '1',
            width: '4px',
            height: '80px'
          },
          '100%': { 
            transform: 'translateX(400px) translateY(400px) rotate(45deg)',
            opacity: '0',
            width: '2px',
            height: '2px'
          },
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
        'cosmic': '0 20px 40px rgba(0, 0, 0, 0.3), 0 0 40px rgba(139, 123, 216, 0.2)',
        'stellar': '0 0 60px rgba(255, 215, 0, 0.3), 0 20px 40px rgba(0, 0, 0, 0.3)',
        'nebula': '0 20px 60px rgba(45, 43, 90, 0.5)',
        'aurora': '0 0 80px rgba(168, 85, 247, 0.4), 0 20px 60px rgba(0, 0, 0, 0.4)',
        'forest': '0 10px 30px rgba(0, 0, 0, 0.3)',
      },
    },
  },
  plugins: [],
};