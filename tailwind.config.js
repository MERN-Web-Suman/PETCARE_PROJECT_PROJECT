/** @type {import('tailwindcss').Config} */
import colors from 'tailwindcss/colors';

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        outfit: ['Outfit', 'sans-serif'],
      },
      colors: {
        primary: colors.blue,
        secondary: colors.pink,
        accent: colors.purple,
        dark: "#1F2937",
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
        'gradient-secondary': 'linear-gradient(135deg, #EC4899 0%, #DB2777 100%)',
        'gradient-accent': 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)',
      }
    },
  },
  plugins: [],
}
