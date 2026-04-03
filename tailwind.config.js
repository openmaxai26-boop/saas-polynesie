/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          50:  '#eef2f9',
          100: '#d5def0',
          400: '#4a6db8',
          600: '#1e3a80',
          700: '#162d68',
          800: '#0f2050',
          900: '#091540',
          950: '#040c26',
        },
        ocean: {
          400: '#22f0e8',
          500: '#00d4cc',
          600: '#00a8a4',
          700: '#008584',
        },
        coral: {
          400: '#ff7a5c',
          500: '#ff5733',
          600: '#ed3610',
        },
        brand: {
          50:  '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          900: '#1e3a5f',
        },
      },
      fontFamily: {
        display: ['Syne', 'system-ui', 'sans-serif'],
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.06)',
        'card-hover': '0 4px 8px rgba(0,0,0,0.06), 0 12px 32px rgba(0,0,0,0.10)',
        'glow-ocean': '0 0 24px rgba(0,212,204,0.20)',
      },
    },
  },
  plugins: [],
}
