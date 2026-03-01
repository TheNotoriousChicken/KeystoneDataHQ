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
      }
    },
  },
  plugins: [],
}
