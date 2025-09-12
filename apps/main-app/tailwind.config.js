/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        lumira: {
          // Fonds clairs et naturels
          'cream': '#FEFCF8',
          'pearl': '#F8F6F3',
          'mist': '#F5F7FA',
          'dawn': '#FDF8F0',
          
          // Or doux et champagne
          'gold-soft': '#E8D5B7',
          'champagne': '#F7E7CE',
          'copper': '#D2B48C',
          'bronze': '#CD7F32',
          
          // Bleu nuit discret
          'night': '#2C3E50',
          'night-soft': '#34495E',
          'constellation': '#4A6FA5',
          'sky': '#E8F4FD',
          
          // Nuances naturelles
          'sage': '#9CAF88',
          'moss': '#8FBC8F',
          'sand': '#F4E4BC',
          'water': '#B8E6E6',
          'aurora': '#E6F3FF',
        }
      },
      fontFamily: {
        'playfair': ['Cormorant Garamond', 'serif'],
        'inter': ['Inter', 'sans-serif'],
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'gentle-glow': 'gentle-glow 4s ease-in-out infinite',
        'rotate-slow': 'rotate-slow 20s linear infinite',
        'aurora-flow': 'aurora-flow 8s ease-in-out infinite',
        'constellation': 'constellation 12s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'gentle-glow': {
          '0%, 100%': { 
            opacity: '0.6',
            transform: 'scale(1)',
          },
          '50%': { 
            opacity: '0.9',
            transform: 'scale(1.05)',
          },
        },
        'rotate-slow': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        'aurora-flow': {
          '0%, 100%': { 
            background: 'linear-gradient(45deg, rgba(232, 213, 183, 0.1), rgba(184, 230, 230, 0.1))',
            transform: 'translateX(0%)'
          },
          '50%': { 
            background: 'linear-gradient(45deg, rgba(184, 230, 230, 0.1), rgba(156, 175, 136, 0.1))',
            transform: 'translateX(10%)'
          },
        },
        constellation: {
          '0%, 100%': { opacity: '0.3', transform: 'scale(1)' },
          '50%': { opacity: '0.7', transform: 'scale(1.1)' },
        },
      },
      backdropBlur: {
        'xs': '2px',
      },
      boxShadow: {
        'soft': '0 4px 20px rgba(232, 213, 183, 0.15)',
        'aurora': '0 8px 32px rgba(184, 230, 230, 0.2)',
        'constellation': '0 2px 12px rgba(74, 111, 165, 0.1)',
      }
    },
  },
  plugins: [],
};