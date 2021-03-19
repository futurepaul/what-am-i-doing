const colors = require("tailwindcss/colors");

module.exports = {
  purge: ["./pages/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  darkMode: false, // or 'media' or 'class'
  theme: {
    colors: {
      transparent: "transparent",
      current: "currentColor",
      black: colors.black,
      white: colors.white,
      red: {
        light: "#E85B4B",
        DEFAULT: "#E85B4B",
        dark: "#E85B4B",
      },
      blue: {
        light: "#283044",
        DEFAULT: "#283044",
        dark: "#283044",
      },
      gray: colors.gray,
    },
    boxShadow: {
      DEFAULT: "4px 4px 0px rgba(0, 0, 0, 0.25)",
      glow: "0px 0px 0px 4px #FFF",
      none: "none",
    },
    extend: {},
  },
  variants: {
    extend: {},
  },
  plugins: [],
};
