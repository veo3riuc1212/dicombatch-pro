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
        medical: {
          dark: '#0b1329',
          card: '#0f172a',
          cardHover: '#1e293b',
          cyan: '#06b6d4',
          cyanHover: '#0891b2',
          cyanLight: '#22d3ee',
          border: '#1e293b',
          accent: '#0284c7'
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif']
      }
    },
  },
  plugins: [],
}
