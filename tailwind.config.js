
// tailwind.config.js - Extended for Disruptiv Solutions & Mystical Oracle
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Disruptiv Solutions Color Palette
        'blood-red': '#da3019',
        'electric-yellow': '#ffde59',
        'pure-black': '#000000',
        'void-black': '#0a0a0a',
        'charcoal': '#1a1a1a',
        'steel': '#2d2d2d',
        'disruptiv-white': '#ffffff',
        'disruptiv-grey': {
          100: '#f5f5f5',
          300: '#d1d5db', 
          500: '#6b7280',
          700: '#374151',
          900: '#111827',
        },

        // Existing Mystical Oracle Colors (keeping for backward compatibility)
        'mystic-purple': '#1a1a2e',
        'midnight-blue': '#16213e',
        'deep-purple': '#0f3460',
        'golden': '#d4af37',
        'celestial-blue': '#4169e1',
        'mystic-accent': '#8a2be2',
      },
      fontFamily: {
        'cinzel': ['Cinzel', 'serif'],
        'inter': ['Inter', 'sans-serif'],
      },
      spacing: {
        '18': '4.5rem',   // h-18 for small cards
        '30': '7.5rem',   // h-30 for normal cards
        '96': '24rem',    // h-96 for large cards
        '108': '27rem',   // h-108 for large cards on md screens
      },
      animation: {
        'shuffle': 'shuffle 0.8s ease-in-out',
        'flip': 'cardFlip 1s ease-in-out',
        'glow': 'mysticalGlow 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'shimmer': 'shimmer 0.6s ease',
      },
      keyframes: {
        shuffle: {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '25%': { transform: 'translateY(-10px) rotate(-5deg)' },
          '50%': { transform: 'translateY(-5px) rotate(5deg)' },
          '75%': { transform: 'translateY(-15px) rotate(-3deg)' },
        },
        cardFlip: {
          '0%': { transform: 'rotateY(0deg)' },
          '50%': { transform: 'rotateY(90deg)' },
          '100%': { transform: 'rotateY(0deg)' },
        },
        mysticalGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(212, 175, 55, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(212, 175, 55, 0.6)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotate(45deg)' },
          '50%': { transform: 'translateY(-4px) rotate(45deg)' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
      },
      backgroundImage: {
        'mystic-gradient': 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
        'disruptiv-gradient': 'linear-gradient(135deg, #da3019 0%, #e63c29 100%)',
        'disruptiv-glass': 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
      },
      backdropBlur: {
        'disruptiv': '20px',
      },
      boxShadow: {
        'disruptiv-primary': '0 6px 24px rgba(218, 48, 25, 0.3)',
        'disruptiv-primary-hover': '0 12px 36px rgba(218, 48, 25, 0.4)',
        'disruptiv-glass': '0 8px 32px rgba(0, 0, 0, 0.3)',
      }
    },
  },
  plugins: [],
}
