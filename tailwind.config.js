/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        titleMain: '#2E4369',
        backgroundPage: '#34495e',  
        mainColor: "#1b347b",
      },
    },
  },
  plugins: [],
}