/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        mystical: {
          // Base colors - Noir et Bleu nuit
          'black': '#000000',
          'midnight': '#0F172A',
          'deep-blue': '#1E293B',
          'navy': '#334155',
          
          // Accents - Lumière lunaire et étoiles
          'moonlight': '#E2E8F0',
          'starlight': '#F8FAFC',
          'silver': '#CBD5E1',
          'pearl': '#F1F5F9',
          
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
        'moonbeam': 'moonbeam 12s ease-in-out infinite',
        'startwinkle': 'startwinkle 4s ease-in-out infinite',
      },
      keyframes: {
        'wave-gentle': {
          '0%, 100%': { transform: 'translateY(0px) scale(1)' },
          '50%': { transform: 'translateY(-10px) scale(1.02)' },
        },
        'moonbeam': {
          '0%, 100%': { opacity: '0.3' },
          '50%': { opacity: '0.6' },
        },
        'startwinkle': {
          '0%, 100%': { opacity: '0.4', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.1)' },
        },
      },
      boxShadow: {
        'moonlight': '0 4px 20px rgba(226, 232, 240, 0.1)',
        'forest': '0 8px 32px rgba(10, 15, 10, 0.3)',
      },
    },
  },
  plugins: [],
};