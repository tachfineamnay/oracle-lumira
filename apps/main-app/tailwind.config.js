/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Palette claire et naturelle
        mystical: {
          // Fonds clairs et naturels
          'cream': '#FEFCF8',
          'pearl': '#F8F6F3',
          'mist': '#F5F7FA',
          'dawn': '#FDF8F0',
          'sky': '#E8F4FD',
          
          // Or doux et champagne
          'gold': '#E8D5B7',
          'gold-light': '#F7E7CE',
          'champagne': '#F4E4BC',
          'copper': '#D2B48C',
          'bronze': '#CD7F32',
          'amber': '#F0C674',
          
          // Bleu nuit discret (touches uniquement)
          'night': '#2C3E50',
          'night-soft': '#34495E',
          'constellation': '#4A6FA5',
          
          // Nuances naturelles
          'sage': '#9CAF88',
          'moss': '#8FBC8F',
          'sand': '#F4E4BC',
          'water': '#B8E6E6',
          'aurora': '#E6F3FF',
          
          // Couleurs sombres (pour texte et contraste)
          'dark': '#1A1A1A',
          'purple': '#6B46C1',
          'purple-light': '#A78BFA',
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
        'breathe': 'breathe 6s ease-in-out infinite',
        'wave-subtle': 'wave-subtle 8s ease-in-out infinite',
        'ripple': 'ripple 6s ease-in-out infinite',
        'spiritual-flow': 'spiritual-flow 12s ease-in-out infinite',
        'energy-pulse': 'energy-pulse 4s ease-in-out infinite',
        'harmony-wave': 'harmony-wave 10s ease-in-out infinite',
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
        'cream': '#FEFCF8',
        'pearl': '#F8F6F3',
        'mist': '#F5F7FA',
        'dawn': '#FDF8F0',
        'sky': '#E8F4FD',
        'serenity': '#F0F8FF',
        'whisper': '#FAFBFC',
            background: 'linear-gradient(45deg, rgba(184, 230, 230, 0.1), rgba(156, 175, 136, 0.1))',
            transform: 'translateX(10%)'
        'gold': '#E8D5B7',
        'gold-light': '#F7E7CE',
        'champagne': '#F4E4BC',
        'copper': '#D2B48C',
        'bronze': '#CD7F32',
        'amber': '#F0C674',
        'radiance': '#FFE5B4',
        'luminous': '#FFF8DC',
        breathe: {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.8' },
        'night': '#1A202C',
        'night-soft': '#2D3748',
        'wave-subtle': {
          '0%, 100%': { 
            transform: 'translateY(0px) scaleY(1)',
            opacity: '0.3'
          },
          '33%': { 
            transform: 'translateY(-2px) scaleY(1.02)',
            opacity: '0.5'
          },
          '66%': { 
            transform: 'translateY(1px) scaleY(0.98)',
            opacity: '0.4'
          },
        },
        'ripple': {
          '0%': { 
            transform: 'scale(1) rotate(0deg)',
            opacity: '0.2'
          },
          '50%': { 
            transform: 'scale(1.1) rotate(180deg)',
            opacity: '0.4'
          },
          '100%': { 
            transform: 'scale(1) rotate(360deg)',
            opacity: '0.2'
          },
        },
        'spiritual-flow': {
          '0%, 100%': { 
            background: 'radial-gradient(circle at 20% 50%, rgba(232, 213, 183, 0.1) 0%, transparent 50%)',
            transform: 'translateX(0%)'
          },
          '25%': { 
            background: 'radial-gradient(circle at 80% 20%, rgba(184, 230, 230, 0.08) 0%, transparent 50%)',
            transform: 'translateX(5%)'
          },
          '50%': { 
            background: 'radial-gradient(circle at 50% 80%, rgba(156, 175, 136, 0.06) 0%, transparent 50%)',
            transform: 'translateX(0%)'
          },
          '75%': { 
            background: 'radial-gradient(circle at 10% 30%, rgba(244, 228, 188, 0.09) 0%, transparent 50%)',
            transform: 'translateX(-3%)'
          },
        },
        'energy-pulse': {
          '0%, 100%': { 
            boxShadow: '0 0 20px rgba(232, 213, 183, 0.1)',
            transform: 'scale(1)'
          },
          '50%': { 
            boxShadow: '0 0 40px rgba(232, 213, 183, 0.2)',
            transform: 'scale(1.02)'
          },
        },
        'harmony-wave': {
          '0%, 100%': { 
            clipPath: 'polygon(0% 0%, 100% 0%, 100% 85%, 0% 100%)'
          },
          '50%': { 
            clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 85%)'
          },
        },
        'constellation': '#4A6FA5',
        'deep': '#0F1419',
        'shadow': '#1A1A1A',
      backdropBlur: {
        'xs': '2px',
        'sage': '#9CAF88',
        'moss': '#8FBC8F',
        'sand': '#F4E4BC',
        'water': '#B8E6E6',
        'aurora': '#E6F3FF',
        'flow': '#E0F2F1',
        'harmony': '#F3E5F5',
        'organic': '0 10px 40px rgba(156, 175, 136, 0.15)',
        'spiritual': '0 8px 32px rgba(232, 213, 183, 0.12)',
        'harmony': '0 4px 24px rgba(156, 175, 136, 0.08)',
        'serenity': '0 2px 16px rgba(184, 230, 230, 0.1)',
        'energy': '0 0 30px rgba(232, 213, 183, 0.15)',
      },
        'dark': '#0A0A0F',
        'purple': '#6B46C1',
        'purple-light': '#A78BFA',
        'spiritual-gradient': 'linear-gradient(135deg, var(--tw-gradient-stops))',
        'wave-pattern': 'repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(232, 213, 183, 0.03) 2px, rgba(232, 213, 183, 0.03) 4px)',
        'violet': '#8B5CF6',
        'indigo': '#6366F1',
      }
    },
  },
  plugins: [],
};