const {nextui} = require('@nextui-org/theme');
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@nextui-org/theme/dist/components/(input|form).js"
  ],
  theme: {
    extend: {
      fontFamily: {
        montserrat: ['"Montserrat"', "serif"], // Custom Montserrat font
      },
    },
  },
  plugins: [nextui()],
};
