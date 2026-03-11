import type { Config } from 'tailwindcss'

const config: Config = {
  // Use 'class' strategy so we can toggle dark mode with .dark class
  darkMode: 'class',
  
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  
  theme: {
    extend: {
      colors: {
        // EDGE Branding Final — Foundation
        'sm-black': '#0B0F14',
        'sm-white': '#FAFAFB',

        // EDGE Intelligence (Cyan)
        'edge-cyan': {
          DEFAULT: '#00D4FF',
          glow: 'rgba(0, 212, 255, 0.2)',
        },

        // EDGE Premium (Gold)
        'edge-gold': {
          DEFAULT: '#D6B05E',
          glow: 'rgba(214, 176, 94, 0.2)',
        },

        // SM Brand Colors
        'sm-red': {
          DEFAULT: '#bc0000',
          50: '#fff1f1',
          100: '#ffe1e1',
          200: '#ffc7c7',
          300: '#ffa0a0',
          400: '#ff6b6b',
          500: '#f83b3b',
          600: '#e51d1d',
          700: '#bc0000',
          800: '#a00000',
          900: '#8a0000',
          950: '#4c0000',
        },
        
        // Chicago Team Colors
        'bears': {
          primary: '#0B162A',
          secondary: '#C83200',
        },
        'bulls': {
          primary: '#CE1141',
          secondary: '#000000',
        },
        'cubs': {
          primary: '#0E3386',
          secondary: '#CC3433',
        },
        'whitesox': {
          primary: '#27251F',
          secondary: '#C4CED4',
        },
        'blackhawks': {
          primary: '#CF0A2C',
          secondary: '#000000',
        },
      },
      
      fontFamily: {
        sans: ['var(--font-space-grotesk)', 'Space Grotesk', 'system-ui', '-apple-system', 'sans-serif'],
      },

      borderRadius: {
        'card': '14px',
      },

      fontSize: {
        'xs': ['0.8125rem', { lineHeight: '1.25rem' }],
      },
      
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'pulse-star': 'pulseStar 2s ease-in-out infinite',
        'telemetry': 'telemetry 4s linear infinite',
        'orb-spin': 'orbSpin 6s linear infinite',
      },

      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseStar: {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.8' },
          '50%': { transform: 'scale(1.15)', opacity: '1' },
        },
        telemetry: {
          '0%': { opacity: '0.3', backgroundPosition: '-200% 0' },
          '100%': { opacity: '0.6', backgroundPosition: '200% 0' },
        },
        orbSpin: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
      },
    },
  },
  
  plugins: [],
}

export default config
