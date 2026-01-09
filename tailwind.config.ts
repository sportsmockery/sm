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
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
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
      },
    },
  },
  
  plugins: [],
}

export default config
