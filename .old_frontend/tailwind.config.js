/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ignia: {
          yellow: '#eec75d',
          purple: '#592f7e',
          orange: '#db6934',
          'dark-purple': '#401531',
          'dark-blue': '#15192d',
          'dark-gray': '#1e1e20',
        },
        primary: {
          50: '#fef9e7',
          100: '#fef0c7',
          200: '#fde592',
          300: '#fbd454',
          400: '#f9c926',
          500: '#eec75d',
          600: '#e6b84d',
          700: '#d4a73d',
          800: '#b8943e',
          900: '#9c7b3f',
        },
        secondary: {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#592f7e',
          600: '#4c2569',
          700: '#401f55',
          800: '#341941',
          900: '#281330',
        },
        accent: {
          50: '#fef7ed',
          100: '#feedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#db6934',
          600: '#c5522a',
          700: '#a04020',
          800: '#7c2d12',
          900: '#581c0c',
        },
      },
      fontFamily: {
        'sans': ['Montserrat', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'ignia-gradient-1': 'linear-gradient(135deg, #eec75d, #db6934)',
        'ignia-gradient-2': 'linear-gradient(135deg, #db6934, #401531)',
        'ignia-gradient-3': 'linear-gradient(135deg, #401531, #592f7e)',
        'ignia-gradient-4': 'linear-gradient(135deg, #592f7e, #15192d)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}
