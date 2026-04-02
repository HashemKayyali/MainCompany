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
        void: { 950:'#06060e', 900:'#0b0b18', 800:'#111126', 700:'#1a1a38', 600:'#24244a' },
        prism: { violet:'#7c3aed', pink:'#ec4899', amber:'#f59e0b', cyan:'#06b6d4', lime:'#84cc16' },
      },
      animation: {
        'float':'float 7s ease-in-out infinite',
        'shimmer':'shimmer 2.5s linear infinite',
        'glow':'glow-pulse 5s ease-in-out infinite',
        'marquee':'marquee 45s linear infinite',
        'aurora':'aurora 12s ease-in-out infinite',
        'orbit':'orbit 25s linear infinite',
        'grain':'grain 0.5s steps(1) infinite',
      },
      keyframes: {
        float:{'0%,100%':{transform:'translateY(0)'},'50%':{transform:'translateY(-16px)'}},
        shimmer:{'0%':{backgroundPosition:'-200% 0'},'100%':{backgroundPosition:'200% 0'}},
        'glow-pulse':{'0%,100%':{opacity:'0.25',transform:'scale(1)'},'50%':{opacity:'0.6',transform:'scale(1.04)'}},
        marquee:{from:{transform:'translateX(0)'},to:{transform:'translateX(-50%)'}},
        aurora:{'0%,100%':{transform:'translateX(-10%) translateY(-5%) rotate(0deg)',opacity:'0.3'},'33%':{transform:'translateX(5%) translateY(8%) rotate(120deg)',opacity:'0.5'},'66%':{transform:'translateX(-5%) translateY(-3%) rotate(240deg)',opacity:'0.35'}},
        orbit:{'from':{transform:'rotate(0deg)'},'to':{transform:'rotate(360deg)'}},
        grain:{'0%,100%':{transform:'translate(0,0)'},'10%':{transform:'translate(-5%,-10%)'},'30%':{transform:'translate(3%,-15%)'},'50%':{transform:'translate(12%,9%)'},'70%':{transform:'translate(9%,4%)'},'90%':{transform:'translate(-1%,7%)'}},
      },
      backgroundSize: { '200%': '200%' },
    },
  },
  plugins: [],
}
