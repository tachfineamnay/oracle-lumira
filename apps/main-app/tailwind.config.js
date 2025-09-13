/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        mystical: {
          // Dark theme colors (original)
          'dark': '#0A0A0F',
          'purple': '#6B46C1',
          'purple-light': '#A78BFA',
          'gold': '#D4AF37',
          'gold-light': '#FFD700',
          'amber': '#FBBF24',
          'night': '#1A202C',
          'deep': '#0F1419',
          'shadow': '#1A1A1A',
        }
      },
      fontFamily: {
        'playfair': ['Playfair Display', 'serif'],
        'inter': ['Inter', 'sans-serif'],
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
      },
      boxShadow: {
        'mystical-gold': '0 0 30px rgba(212, 175, 55, 0.3)',
      },
    },
  },
  plugins: [],
};