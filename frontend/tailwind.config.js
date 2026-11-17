/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        spendora: {
          dark: '#14271d',
          forest: '#1a3326',
          sidebar: '#162b20',
          sage: '#8fa89b',
          gold: '#dfab3d',
          cream: '#f9f6f0',
          card: '#ffffff',
          peach: '#fdeee9',
          mint: '#eaf7ef',
          lavender: '#f3e8ff',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        handwriting: ['Caveat', 'cursive'],
      }
    },
  },
  plugins: [],
}
