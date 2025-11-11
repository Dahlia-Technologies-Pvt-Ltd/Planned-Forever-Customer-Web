/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}", "./node_modules/react-tailwindcss-datepicker/dist/index.esm.js",],
  theme: {
    extend: {
      fontFamily: {
        poppins: ["Poppins", "sans-serif"],
      },
      colors: {
        background: "#f8f9fa",
        primary: "#FDC064",
        secondary: "#155145",
        accent: "#FB4C6D",
        "info-color": "#676D75",
        "light-white": "#FFFFFF1A",
        "primary-color": "#5B5B5B",
        "secondary-color": "#303030",
        "primary-light-color": "#C5C5C5",
        "secondary-light-color": "#707070",
      },
      spacing: {
        4.5: "1.125rem",
        7.5: "1.875rem",
        18: "4.5rem",
        30: "7.5rem",
        38: "9.5rem",
        54: "13.5rem",
        66: "16.5rem",
        68: "17rem",
        70: "17.5rem",
        71: "17.75rem",
        74: "18.5rem",
        76: "19rem",
        78: "19.5rem",
        84: "21rem",
      },
      screens: {
        "2xxl": "1599px",
        "3xl": "1700px",
      },
      fontSize: {
        10: ".625rem",
        13: ".8125rem",
        15: ".9375rem",
        20: "1.25rem",
      },
      dropShadow: {
        custom: "0px 4px 40px rgba(0, 0, 0, 0.07)",
      },
      borderRadius: {
        10: ".625rem",
        20: "1.25rem",
      },
      boxShadow: {
        card: "0px 4px 14px rgba(0, 0, 0, 0.07)",
        "orange-card": "0px 4px 20px 0px #F38E7433",
        "gray-card": "0px 4px 20px 0px #26425433",
        "green-card": "0px 4px 20px 0px #97F0C533",
        "card-bottom": "-1px -6px 15px 0px #0000000D",
        "card-top": "1px 20px 0px #f8f9fa",
      },
    },
  },
  plugins: [require("@tailwindcss/forms"), require("tailwind-scrollbar")({ nocompatible: true }),],
};
