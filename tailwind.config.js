/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
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
