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
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6', // Electric Blue
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        'acid-green': '#bef264',
        'hot-pink': '#f472b6',
        'pop-yellow': '#facc15',
        'deep-black': '#0f172a',
      },
      boxShadow: {
        'hard': '4px 4px 0 0 #000',
        'hard-sm': '2px 2px 0 0 #000',
        'hard-lg': '6px 6px 0 0 #000',
      }
    },
  },
  plugins: [],
}
