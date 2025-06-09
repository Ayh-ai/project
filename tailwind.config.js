/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
        fontFamily: {
        sans: [
          '"Segoe UI"',           // Windows default
          'system-ui',            // System fallback
          '-apple-system',        // macOS/iOS
          'BlinkMacSystemFont',   // macOS Chrome
          'Roboto',               // Android/Google
          '"Helvetica Neue"',     // Legacy macOS
          'Arial',                // Ultimate fallback
          'sans-serif',
        ],
        // Optional: Add a custom font stack for Power BI-like headings
        heading: [
          '"Segoe UI Semibold"',
          'Roboto',
          'sans-serif',
        ],
        
      },


    },
  },
  plugins: [],
};
