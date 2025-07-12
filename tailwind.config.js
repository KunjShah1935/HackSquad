/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      animation: {
        'in': 'fadeIn 0.5s ease-in-out',
        'bounce-slow': 'bounce 2s infinite',
        'pulse-slow': 'pulse 3s infinite',
        'spin-slow': 'spin 3s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      colors: {
        // Dark mode colors
        dark: {
          bg: '#1E1E1E',
          'bg-secondary': '#121212',
          text: '#FFFFFF',
          'text-secondary': '#CCCCCC',
          accent: '#4F8EF7',
          upvote: '#2ECC71',
          downvote: '#E74C3C',
          border: '#333333',
        },
        // Light mode colors
        light: {
          bg: '#FFFFFF',
          'bg-secondary': '#F5F5F5',
          text: '#000000',
          'text-secondary': '#555555',
          accent: '#6C63FF',
          upvote: '#27AE60',
          downvote: '#C0392B',
          border: '#DDDDDD',
        },
      },
      boxShadow: {
        'glow-blue': '0 0 20px rgba(79, 142, 247, 0.3)',
        'glow-purple': '0 0 20px rgba(108, 99, 255, 0.3)',
        'glow-green': '0 0 20px rgba(46, 204, 113, 0.3)',
        'glow-red': '0 0 20px rgba(231, 76, 60, 0.3)',
      },
    },
  },
  plugins: [],
};