/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        light: '#F8F9FA',
        dark: '#212529',
        primary: '#0D6EFD',
        secondary: '#6C757D',
      },
      boxShadow: {
        'brutal': '4px 4px 0px #212529',
      }
    },
  },
  plugins: [],
}