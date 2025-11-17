/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    fontFamily: {
      sans: ['Inter', 'system-ui', 'sans-serif']
    },
    extend: {
      colors: {
        primary: '#111827'
      },
      boxShadow: {
        soft: '0 4px 6px -1px rgba(0, 0, 0, 0.08), 0 2px 4px -2px rgba(0, 0, 0, 0.04)'
      },
      borderRadius: {
        xl: '0.75rem'
      }
    }
  },
  plugins: []
};

