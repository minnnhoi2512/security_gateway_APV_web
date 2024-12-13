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
        buttonColor: "#2ecc71",
        buttonCancel: "#f5b041",
      },
      keyframes: {
        cardPulse: {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.05)" },  
        },
      },
      animation: {
        cardPulse: "cardPulse 2s infinite ease-in-out", 
      },
    },
  },
  plugins: [],
}