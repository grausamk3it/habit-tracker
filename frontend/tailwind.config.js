/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Новая палитра Slate & Emerald
        slate: {
          900: '#0f172a', // Основной фон / темные элементы
          800: '#1e293b', // Карточки
          700: '#334155', // Границы
        },
        emerald: {
          500: '#10b981', // Акцентный цвет (кнопки, галочки)
          600: '#059669', // Hover эффект
          50: '#ecfdf5',  // Светлый фон для выполненных задач
        }
      },
      fontFamily: {
        sans: ['Manrope', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}