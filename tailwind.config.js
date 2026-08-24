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
      },
      boxShadow: {
        'soft': '0 2px 20px -4px rgba(0, 0, 0, 0.08)',
        'card': '0 4px 24px -6px rgba(20, 62, 34, 0.12)',
        'card-hover': '0 12px 40px -8px rgba(20, 62, 34, 0.2)',
        'glow': '0 0 24px rgba(105, 195, 59, 0.25)',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-up': 'slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'scale-in': 'scaleIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'pulse-soft': 'pulseSoft 3s ease-in-out infinite',
      },
      keyframes: {
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
    },
  },
  plugins: [],
}
