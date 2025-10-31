/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        'primary-dark': '#05014A',
        'primary-light': '#3b82f6',
        'primary-black': '#000000',
        'accent-cyan': '#00FFFF',
        'accent-gold': '#EACD76',
        'accent-silver': '#C0C0C0',
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
        montserrat: ['Montserrat', 'sans-serif'],
        poppins: ['Poppins', 'sans-serif'],
      },
      animation: {
        fadeIn: 'fadeIn 1s ease-in-out',
        mistFloat: 'mistFloat 5s infinite',
        pulseGlow: 'pulseGlow 2s infinite',
      },
    },
  },
  plugins: [],
};
