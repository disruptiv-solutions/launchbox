// tailwind.config.js - Updated with new color palette
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
        // New Primary Color Palette
        primary: {
          50: '#f0f9ff',   // Very light blue tint
          100: '#e0f2fe',  // Light blue tint
          200: '#bae6fd',  // Lighter Nova Blue
          300: '#7dd3fc',  // Light Nova Blue
          400: '#38bdf8',  // Medium Nova Blue
          500: '#19afe2',  // Nova Blue (main)
          600: '#0284c7',  // Darker Nova Blue
          700: '#0369a1',  // Much darker Nova Blue
          800: '#075985',  // Very dark Nova Blue
          900: '#0c4a6e',  // Darkest Nova Blue
          DEFAULT: '#19afe2', // Nova Blue as default primary
        },

        // Secondary colors based on your palette
        secondary: {
          50: '#f8fafc',   // Very light Steel Grey tint
          100: '#f1f5f9',  // Light Steel Grey tint
          200: '#e2e8f0',  // Lighter Steel Grey
          300: '#cbd5e1',  // Light Steel Grey
          400: '#94a3b8',  // Medium Steel Grey
          500: '#919497',  // Steel Grey (main)
          600: '#475569',  // Darker Steel Grey
          700: '#334155',  // Much darker Steel Grey
          800: '#1e293b',  // Very dark Steel Grey
          900: '#0f172a',  // Darkest Steel Grey
          DEFAULT: '#919497', // Steel Grey as default secondary
        },

        // Neutral colors based on your palette
        neutral: {
          50: '#fafafa',   // Very light Dust Tan tint
          100: '#f5f5f4',  // Light Dust Tan tint
          200: '#e7e5e4',  // Lighter Dust Tan
          300: '#d6d3d1',  // Light Dust Tan
          400: '#a8a29e',  // Medium Dust Tan
          500: '#eae9e4',  // Dust Tan (main)
          600: '#78716c',  // Darker Dust Tan
          700: '#57534e',  // Much darker Dust Tan
          800: '#44403c',  // Very dark Dust Tan
          900: '#1c1917',  // Darkest Dust Tan
          DEFAULT: '#eae9e4', // Dust Tan as default neutral
        },

        // Dark colors based on your palette
        dark: {
          50: '#f8fafc',   // Very light Graphite tint
          100: '#f1f5f9',  // Light Graphite tint
          200: '#e2e8f0',  // Lighter Graphite
          300: '#cbd5e1',  // Light Graphite
          400: '#94a3b8',  // Medium Graphite
          500: '#64748b',  // Medium Graphite
          600: '#475569',  // Graphite-like
          700: '#334155',  // Darker Graphite
          800: '#1e293b',  // Very dark Graphite
          900: '#071520',  // Graphite (main)
          DEFAULT: '#071520', // Graphite as default dark
        },

        // Your exact colors for direct usage
        'nova-blue': '#19afe2',
        'steel-grey': '#919497', 
        'dust-tan': '#eae9e4',
        'graphite': '#071520',

        // Legacy colors (keeping for backward compatibility)
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
        '18': '4.5rem',   
        '30': '7.5rem',   
        '96': '24rem',    
        '108': '27rem',   
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
          '0%, 100%': { boxShadow: '0 0 20px rgba(25, 175, 226, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(25, 175, 226, 0.6)' },
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
        'primary-gradient': 'linear-gradient(135deg, #19afe2 0%, #0284c7 100%)',
        'neutral-gradient': 'linear-gradient(135deg, #eae9e4 0%, #d6d3d1 100%)',
        'dark-gradient': 'linear-gradient(135deg, #071520 0%, #1e293b 100%)',
        'mystic-gradient': 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
        'disruptiv-gradient': 'linear-gradient(135deg, #da3019 0%, #e63c29 100%)',
        'disruptiv-glass': 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
      },
      backdropBlur: {
        'disruptiv': '20px',
      },
      boxShadow: {
        'primary': '0 6px 24px rgba(25, 175, 226, 0.3)',
        'primary-hover': '0 12px 36px rgba(25, 175, 226, 0.4)',
        'neutral': '0 6px 24px rgba(234, 233, 228, 0.3)',
        'dark': '0 8px 32px rgba(7, 21, 32, 0.3)',
        'disruptiv-primary': '0 6px 24px rgba(218, 48, 25, 0.3)',
        'disruptiv-primary-hover': '0 12px 36px rgba(218, 48, 25, 0.4)',
        'disruptiv-glass': '0 8px 32px rgba(0, 0, 0, 0.3)',
      }
    },
  },
  plugins: [],
}