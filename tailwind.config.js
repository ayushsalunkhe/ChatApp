/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#128C7E',
        'primary-dark': '#008f72',
        secondary: '#25D366',
        light: '#DCF8C6',
        dark: '#075E54',
      },
    },
  },
  darkMode: 'class',
  plugins: [],
}
