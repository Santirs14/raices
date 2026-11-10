/** @type {import('tailwind.config').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        zajuna: {
          purple: "#4C1D95",
          purpleLight: "#6D28D9",
          green: "#15803D",
          greenLight: "#22C55E",
          yellow: "#EAB308",
          yellowLight: "#FACC15",
        },
      },
    },
  },
  plugins: [],
};