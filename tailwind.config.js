/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "primary": "#296c00",
        "primary-container": "#69c33b",
        "on-primary": "#ffffff",
        "on-primary-container": "#1b4c00",
        "surface": "#f9f9f9",
        "surface-container": "#eeeeee",
        "surface-container-low": "#f3f3f3",
        "surface-container-high": "#e8e8e8",
        "surface-container-highest": "#e2e2e2",
        "surface-variant": "#e2e2e2",
        "surface-dark": "#121212",
        "on-surface": "#1a1c1c",
        "on-surface-variant": "#404a39",
        "outline": "#707a67",
        "outline-variant": "#bfcab4",
        "secondary": "#5f5e5e",
        "secondary-container": "#e2dfde",
        "on-secondary-container": "#636262",
        "success-green": "#4CAF50",
        "glass-border": "rgba(255, 255, 255, 0.2)",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        display: ["Manrope", "sans-serif"],
        manrope: ["Manrope", "sans-serif"],
      },
      spacing: {
        "unit": "8px",
        "margin-mobile": "20px",
        "gutter": "24px",
        "container-max": "1280px",
        "margin-desktop": "64px"
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      }
    },
  },
  plugins: [],
}
