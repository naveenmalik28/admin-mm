/* eslint-env node */
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        slatex: "#0f172a",
        mint: "#0f766e",
        cream: "#f8f4ea",
        gold: "#c58940",
      },
      boxShadow: {
        card: "0 18px 40px rgba(15, 23, 42, 0.12)",
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}

