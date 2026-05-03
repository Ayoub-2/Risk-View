module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"], // ✅ important for React
  theme: {
    extend: {
      colors: {
        'ebios-orange': '#F97316', // Tailwind orange-500 equivalent, or custom hex like #E65100
        'ebios-orange-dark': '#C2410C',
        'ebios-dark': '#111827', // Tailwind gray-900 equivalent
        'ebios-dark-secondary': '#1F2937', // Tailwind gray-800
      },
      fontFamily: {
        outfit: ['Outfit', 'sans-serif'],
      }
    },
  },
}
