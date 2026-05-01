/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        iscev: {
          navy:  "#1B3F84",
          blue:  "#4988C5",
          light: "#DDE9F8",
        },
      },
      fontFamily: {
        gilroy: ["Gilroy", "sans-serif"],
      },
      screens: {
        xs: "480px",
      },
    },
  },
  plugins: [],
};
