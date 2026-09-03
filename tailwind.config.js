/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#0F1E1A',
          800: '#16281F',
          700: '#1D3327',
        },
        paper: '#FBF6EC',
        pine: {
          50: '#EEF3EE',
          100: '#D7E4DA',
          300: '#8FB39B',
          500: '#2F5C46',
          600: '#234433',
          700: '#1A3327',
        },
        gold: {
          DEFAULT: '#C79A4B',
          light: '#E4CFA0',
          dark: '#9C7530',
        },
        ink50: '#F4F1E9',
        charcoal: '#22252A',
        muted: '#6E7268',
        line: '#E4DFCF',
      },
      fontFamily: {
        display: ['"Fraunces"', 'serif'],
        body: ['"Work Sans"', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(15, 30, 26, 0.06), 0 8px 24px -8px rgba(15, 30, 26, 0.12)',
        lift: '0 20px 45px -20px rgba(15, 30, 26, 0.35)',
      },
      borderRadius: {
        xl2: '1.25rem',
      },
      backgroundImage: {
        horizon: 'linear-gradient(90deg, transparent 0%, #C79A4B 50%, transparent 100%)',
      },
    },
  },
  plugins: [],
}
