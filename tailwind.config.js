/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {
      colors: {
        "surface": "#0f172a",
        "surface-container": "#1e293b",
        "surface-container-low": "#0f172a",
        "surface-container-lowest": "#020617",
        "surface-container-highest": "#334155",
        "on-surface": "#e2e8f0",
        "primary": "#4edea3",
        "secondary": "#ffb2b7",
        "tertiary": "#7bd0ff",
        "outline-variant": "#334155",
      },
      fontFamily: {
        "headline": ["Manrope", "sans-serif"],
        "body": ["Inter", "sans-serif"],
        "mono": ["JetBrains Mono", "monospace"]
      },
    },
  },
  plugins: [],
}