/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'app-bg': 'var(--background)',
        'app-fg': 'var(--foreground)',
        'app-card': 'var(--card)',
        'app-border': 'var(--border)',
      },
    }
  },
  plugins: [],
}