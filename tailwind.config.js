/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js, ts, jsx, tsx}',
    './pages/**/*.{js, ts, jsx, tsx}',
    './components/**/*.{js, ts, jsx, tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#5542F6',
        grayPreset: '#808080',
        primaryDark: '#293241',
        primaryBg: '#98C1D9',
        secondaryBg: '#E0FBFC',
        secondary: '#EE6C4D',
        extraDetails: '#bfdbe4',
      },
    },
  },
  plugins: [],
};
