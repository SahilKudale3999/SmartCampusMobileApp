import defaultTheme from 'tailwindcss/defaultTheme'

export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', ...defaultTheme.fontFamily.sans],
      },
      boxShadow: {
        brand: '0 18px 55px rgba(29, 28, 25, 0.12)',
      },
      colors: {
        surface: '#fffdf9',
        surfaceSoft: '#ece7df',
        surfaceStrong: '#e0d8cc',
        accent: '#7c5e3c',
        accentSoft: '#b29371',
        muted: '#6d6a62',
      },
    },
  },
  plugins: [],
}
