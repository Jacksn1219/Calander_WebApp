module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        accent: "#ffb74d",
      },
      fontFamily: {
        inter: ["Inter", "sans-serif"],
        bebas: ["Bebas Neue", "cursive"],
      },
      animation: {
        "pulse-slow": "pulse 8s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
