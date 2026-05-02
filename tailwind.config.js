/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Sora"', '"Alexandria"', 'system-ui', 'sans-serif'],
        sans: ['"Alexandria"', 'system-ui', 'sans-serif'],
        mono: ['"Alexandria"', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Brand purple — primary identity
        brand: {
          50:  '#faf6ff',
          100: '#f1e8ff',
          200: '#e3d2ff',
          300: '#cdb1ff',
          400: '#b385ff',
          500: '#9a5cff',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#3b0e7c',
          950: '#1f0658',
        },
        // Soft tinted neutrals (white-purple)
        ink: {
          50:  '#fbf8ff',
          100: '#efe8f8',
          200: '#ddd2f0',
          300: '#c2afe6',
          400: '#9d83d6',
          500: '#7a5fc2',
          600: '#5b3aa3',
          700: '#3d2370',
          800: '#2a1659',
          900: '#1a0b3d',
        },
        // Aliases preserved so legacy refs still resolve
        void: {
          950: '#fbf8ff',
          900: '#f4eeff',
          800: '#ece2ff',
          700: '#dec9ff',
          600: '#c2a4ff',
        },
        prism: {
          violet: '#7c3aed',
          pink:   '#c026d3',
          amber:  '#f59e0b',
          cyan:   '#a855f7',
          lime:   '#84cc16',
        },
      },
      animation: {
        'float': 'float 7s ease-in-out infinite',
        'shimmer': 'shimmer 2.5s linear infinite',
        'glow': 'glow-pulse 5s ease-in-out infinite',
        'marquee': 'marquee 45s linear infinite',
        'aurora': 'aurora-flow 14s ease-in-out infinite',
        'orbit': 'orbit 25s linear infinite',
        'grain': 'grain 0.5s steps(1) infinite',
        'float-orb': 'float-orb 12s ease-in-out infinite',
      },
      keyframes: {
        float: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-16px)' } },
        shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
        'glow-pulse': { '0%,100%': { opacity: '0.4', transform: 'scale(1)' }, '50%': { opacity: '0.7', transform: 'scale(1.04)' } },
        marquee: { from: { transform: 'translateX(0)' }, to: { transform: 'translateX(-50%)' } },
        orbit: { 'from': { transform: 'rotate(0deg)' }, 'to': { transform: 'rotate(360deg)' } },
        grain: { '0%,100%': { transform: 'translate(0,0)' }, '10%': { transform: 'translate(-5%,-10%)' }, '30%': { transform: 'translate(3%,-15%)' }, '50%': { transform: 'translate(12%,9%)' }, '70%': { transform: 'translate(9%,4%)' }, '90%': { transform: 'translate(-1%,7%)' } },
      },
      backgroundSize: { '200%': '200%' },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(135deg, #7c3aed 0%, #9333ea 38%, #a855f7 68%, #c026d3 112%)',
        'gradient-brand-soft': 'linear-gradient(135deg, rgba(124,58,237,0.10) 0%, rgba(168,85,247,0.07) 50%, rgba(217,70,239,0.05) 100%)',
        'gradient-radial': 'radial-gradient(circle at center, var(--tw-gradient-stops))',
      },
      boxShadow: {
        'violet-sm': '0 2px 8px rgba(124, 58, 237, 0.06)',
        'violet-md': '0 12px 32px -10px rgba(124, 58, 237, 0.18)',
        'violet-lg': '0 24px 60px -16px rgba(124, 58, 237, 0.28)',
        'violet-xl': '0 36px 80px -20px rgba(124, 58, 237, 0.32)',
      },
      transitionDuration: {
        '350': '350ms',
        '400': '400ms',
        '450': '450ms',
      },
    },
  },
  plugins: [],
}
