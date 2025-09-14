/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Ignacio Brand Colors
        ignacio: {
          dark: '#0f172a',         // slate-900
          'dark-secondary': '#1e293b', // slate-800
          'dark-overlay': '#1e293b80', // slate-800/50
          purple: '#581c87',       // purple-900
          'purple-primary': '#9333ea', // purple-600
          'purple-hover': '#a855f7',   // purple-500
          'pink-primary': '#db2777',   // pink-600
          'pink-hover': '#ec4899',     // pink-500
          'text-primary': '#ffffff',   // white
          'text-secondary': '#d1d5db', // gray-300
          'text-tertiary': '#9ca3af',  // gray-400
          'border-subtle': '#33415580', // slate-700/50
        }
      },
      backgroundImage: {
        // Ignacio Brand Gradients
        'ignacio-main': 'linear-gradient(to bottom right, #0f172a, #581c87, #0f172a)',
        'ignacio-purple-pink': 'linear-gradient(to right, #9333ea, #db2777)',
        'ignacio-purple-pink-hover': 'linear-gradient(to right, #a855f7, #ec4899)',
        'ignacio-text-purple': 'linear-gradient(to right, #c084fc, #f0abfc, #a78bfa)',
        'ignacio-text-blue': 'linear-gradient(to right, #60a5fa, #22d3ee)',
        'ignacio-text-yellow': 'linear-gradient(to right, #facc15, #fb923c)',
        'ignacio-cta-section': 'linear-gradient(to right, #581c8780, #881337)',
      },
      backgroundSize: {
        'grid-pattern': '50px 50px',
      },
      backdropBlur: {
        'glass': '4px',
      },
      animation: {
        'pulse-delayed': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) 1s infinite',
      }
    },
  },
  plugins: [],
}