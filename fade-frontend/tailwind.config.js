/** @type {import('tailwindcss').Config} */
// Zine collage: cut-out paper with thick ink outlines and hard shadows on a flat lavender page.
const sans = ['"Hanken Grotesk"', 'system-ui', 'sans-serif']

const ink = '#1F1A3A'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Zine palette (note paper and sticker colors live in src/paper.ts)
        ink,
        paper: '#FFFFFF',
        sun: '#FFD23F',

        // Roles used across the components
        background: '#E7E3F7', // the lavender page
        'surface-container': '#F1EFF9',
        'surface-container-high': '#E4E0F3',
        'surface-container-highest': '#D6D1EC',
        'on-surface': ink,
        'on-surface-variant': '#3B355E',
        outline: '#5E5880',
        primary: ink,
        'primary-container': '#FFD23F',
        'on-primary-container': ink,
        // Dark enough for 4.5:1 on every note paper, including peach
        error: '#9A1B12',
        'error-container': '#F9DEDC',
      },
      borderRadius: {
        DEFAULT: '0.25rem',
        lg: '0.5rem',
        xl: '0.75rem',
        full: '9999px',
      },
      spacing: {
        'space-sm': '0.5rem',
        'space-xl': '1.75rem',
        'space-md': '0.75rem',
        margin: '1rem',
        'space-xs': '0.25rem',
        'space-lg': '1.25rem',
      },
      fontFamily: {
        'body-lg': sans,
        'body-md': sans,
        'display-lg': sans,
        'body-sm': sans,
        'headline-lg': sans,
        'headline-md': sans,
        'headline-sm': sans,
        'display-lg-mobile': sans,
      },
      fontSize: {
        'body-lg': ['17px', { lineHeight: '26px', fontWeight: '400' }],
        'body-md': ['15px', { lineHeight: '22px', fontWeight: '400' }],
        'display-lg': ['52px', { lineHeight: '54px', letterSpacing: '-0.025em', fontWeight: '800' }],
        'body-sm': ['13px', { lineHeight: '18px', fontWeight: '400' }],
        'headline-lg': ['38px', { lineHeight: '42px', letterSpacing: '-0.02em', fontWeight: '800' }],
        'headline-md': ['24px', { lineHeight: '30px', letterSpacing: '-0.01em', fontWeight: '700' }],
        'headline-sm': ['19px', { lineHeight: '24px', letterSpacing: '-0.01em', fontWeight: '700' }],
        'display-lg-mobile': ['38px', { lineHeight: '42px', letterSpacing: '-0.02em', fontWeight: '800' }],
      },
    },
  },
  plugins: [],
}
