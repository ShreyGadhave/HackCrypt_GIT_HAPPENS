/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0099FF',
          foreground: '#ffffff',
        },
        secondary: {
          DEFAULT: '#FF6B35',
          foreground: '#ffffff',
        },
        holiday: {
          DEFAULT: '#FFD700',
          foreground: '#000000',
        },
        present: {
          DEFAULT: '#0099FF',
          foreground: '#ffffff',
        },
        absent: {
          DEFAULT: '#FF6B35',
          foreground: '#ffffff',
        },
        leave: {
          DEFAULT: '#9CA3AF',
          foreground: '#ffffff',
        },
      },
      borderRadius: {
        lg: '0.5rem',
        md: '0.375rem',
        sm: '0.25rem',
      },
    },
  },
  plugins: [],
}
