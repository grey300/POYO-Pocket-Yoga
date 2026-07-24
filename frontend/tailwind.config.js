/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Core surfaces (black theme)
        ink: {
          950: '#05070D',
          900: '#0A0E17',
          850: '#0E131F',
          800: '#131A28',
          700: '#1B2436',
          600: '#26324A',
          500: '#3A4864',
        },
        // Brand accent (blue)
        glow: {
          50: '#EAF3FF',
          100: '#D3E6FF',
          200: '#A9CEFF',
          300: '#71AEFF',
          400: '#3B8CFF',
          500: '#1A6DFF',
          600: '#0B54DB',
          700: '#0B43A8',
          800: '#0A3179',
        },
      },
      fontFamily: {
        display: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(59,140,255,0.25), 0 8px 30px -6px rgba(26,109,255,0.45)',
        card: '0 1px 0 0 rgba(255,255,255,0.04) inset, 0 10px 30px -12px rgba(0,0,0,0.8)',
      },
      backgroundImage: {
        'grid-fade': 'radial-gradient(ellipse at top, rgba(26,109,255,0.18), transparent 60%)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(-4px) scale(0.98)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        rise: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.5' },
          '50%': { opacity: '1' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 140ms ease-out',
        rise: 'rise 600ms cubic-bezier(0.16,1,0.3,1) both',
        pulseGlow: 'pulseGlow 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
