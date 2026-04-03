/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      boxShadow: {
        glow: '0 22px 60px rgba(4, 38, 26, 0.28)',
        soft: '0 10px 40px rgba(3, 18, 13, 0.16)',
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', 'serif'],
        body: ['"Manrope"', 'sans-serif'],
      },
      backgroundImage: {
        'emerald-mesh':
          'radial-gradient(circle at top, rgba(57, 122, 89, 0.34), transparent 38%), radial-gradient(circle at bottom right, rgba(6, 65, 43, 0.3), transparent 28%)',
      },
    },
  },
  plugins: [],
};
