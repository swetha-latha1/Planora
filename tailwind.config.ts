/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        accent:  '#7c6af7',
        accent2: '#a78bfa',
        accent3: '#06b6d4',
        neon:    '#22d3ee',
        surface: {
          DEFAULT: 'rgba(255,255,255,0.06)',
          light:   'rgba(255,255,255,0.12)',
          dark:    'rgba(10,10,20,0.7)',
        },
      },
      backgroundImage: {
        'grad-main':   'linear-gradient(135deg,#0f0c29,#1a1040,#0d1b2a)',
        'grad-accent': 'linear-gradient(135deg,#7c6af7,#a78bfa)',
        'grad-cyan':   'linear-gradient(135deg,#06b6d4,#7c6af7)',
        'grad-green':  'linear-gradient(135deg,#10b981,#06b6d4)',
        'grad-rose':   'linear-gradient(135deg,#f43f5e,#f97316)',
        'grad-card':   'linear-gradient(145deg,rgba(255,255,255,0.07),rgba(255,255,255,0.02))',
      },
      boxShadow: {
        glass:  '0 8px 32px rgba(0,0,0,0.37)',
        glow:   '0 0 24px rgba(124,106,247,0.45)',
        'glow-cyan': '0 0 24px rgba(6,182,212,0.4)',
        card:   '0 4px 24px rgba(0,0,0,0.25)',
        'inner-light': 'inset 0 1px 0 rgba(255,255,255,0.1)',
      },
      backdropBlur: { xs: '4px', glass: '20px' },
      borderRadius: { '3xl': '1.5rem', '4xl': '2rem' },
      animation: {
        'fade-in':    'fadeIn 0.4s ease forwards',
        'slide-up':   'slideUp 0.4s ease forwards',
        'slide-in':   'slideIn 0.3s ease forwards',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'float':      'float 6s ease-in-out infinite',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn:    { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp:   { from: { opacity: '0', transform: 'translateY(20px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        slideIn:   { from: { opacity: '0', transform: 'translateX(-16px)' }, to: { opacity: '1', transform: 'translateX(0)' } },
        float:     { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-8px)' } },
        glowPulse: { '0%,100%': { boxShadow: '0 0 20px rgba(124,106,247,0.3)' }, '50%': { boxShadow: '0 0 40px rgba(124,106,247,0.7)' } },
      },
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
    },
  },
  plugins: [],
};
