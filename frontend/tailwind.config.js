/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Твоя палитра
        mint: '#b9e5c8',
        espresso: '#2b1a12',
        // Дополнительные оттенки для интерактивности (hover-эффекты)
        'mint-dark': '#9dd4b0',
        'espresso-light': '#4a332a',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}