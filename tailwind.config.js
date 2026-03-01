/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0f1117',
        surface: '#1a1d27',
        surfaceHover: '#232736',
        primary: '#3b82f6',
        'text-main': '#f3f4f6',
        'text-muted': '#9ca3af',
        border: '#2a2e3d',
      },
      boxShadow: {
        'glass': '0 4px 30px rgba(0, 0, 0, 0.1)',
        'glow': '0 0 20px rgba(59, 130, 246, 0.15)',
        'inner-light': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.05)'
      }
    },
  },
  plugins: [],
}
