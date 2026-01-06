/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./App.tsx",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./services/**/*.{js,ts,jsx,tsx}",
    "./utils/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        meme: ['"Permanent Marker"', 'cursive', 'sans-serif'],
        impact: ['Anton', 'sans-serif'],
        comic: ['"Comic Neue"', 'cursive', 'sans-serif'],
        roboto: ['Roboto', 'sans-serif'],
        oswald: ['Oswald', 'sans-serif'],
        hand: ['"Architects Daughter"', 'cursive'],
        cinzel: ['Cinzel', 'serif'],
        pacifico: ['Pacifico', 'cursive'],
        creepster: ['Creepster', 'cursive'],
        courier: ['"Courier Prime"', 'monospace'],
      },
      colors: {
        brand: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981', // Emerald Green (More premium than generic blue)
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
        },
        'acid-green': '#d9f99d',
        'hot-pink': '#fb7185',
        'pop-yellow': '#fde047',
        'deep-black': '#020617', // Richer black
        'off-white': '#fdfbf7', // Warm paper-like white
      },
      boxShadow: {
        'hard': '3px 3px 0 0 #000',
        'hard-sm': '1px 1px 0 0 #000',
        'hard-lg': '5px 5px 0 0 #000',
        'hard-xl': '8px 8px 0 0 #000',
        'glow': '0 0 15px rgba(16, 185, 129, 0.5)',
      }
    },
  },
  plugins: [],
}
