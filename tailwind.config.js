/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/pages/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        customPrimary: "#1E2A36",
        customSecondary: "#34BE97",
        customGreen: "#008464",
        customAccent: "#30B08C",
        customMuted: "#30B08C",
        background: "#F8FAFC",
      },
    },
  },
  plugins: [],
}
