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
        gold: { 400: '#D4AF37', 500: '#C9A029' },
        rose: { 300: '#C9A88E' },
        gray: { 850: '#1F1F1F', 950: '#0A0A0A' }
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
        montserrat: ['Montserrat', 'sans-serif'],
        poppins: ['Poppins', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif']
      },
      spacing: { '18': '4.5rem', '88': '22rem', '128': '32rem' },
      borderRadius: { 'xl': '0.75rem', '2xl': '1rem', '3xl': '1.5rem' },
      boxShadow: { 'premium': '0 25px 50px -12px rgba(0, 0, 0, 0.5)', 'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)' },
      backdropBlur: { xs: '2px' },
      animation: {
        fadeIn: 'fadeIn 1s ease-in-out',
        mistFloat: 'mistFloat 5s infinite',
        pulseGlow: 'pulseGlow 2s infinite',
        float: 'float 6s ease-in-out infinite',
        shimmer: 'shimmer 2s infinite linear',
        'pulse-slow': 'pulse 3s infinite',
        'bounce-slow': 'bounce 3s infinite',
        'spin-slow': 'spin 3s linear infinite'
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'premium-gradient': 'linear-gradient(135deg, #D4AF37 0%, #C9A88E 50%, #D4AF37 100%)'
      },
      keyframes: {
        float: { '0%, 100%': { transform: 'translateY(0px)' }, '50%': { transform: 'translateY(-10px)' } },
        shimmer: { '0%': { backgroundPosition: '-468px 0' }, '100%': { backgroundPosition: '468px 0' } }
      }
    },
  },
  plugins: [],
};
