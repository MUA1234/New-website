import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Ceylon Modern palette — black base
        sapphire: {
          DEFAULT: '#000000',
          light: '#0a0a10',
          dark: '#000000',
        },
        royal: {
          DEFAULT: '#0a0a14',
          light: '#0f0f1a',
          dark: '#050508',
        },
        gold: {
          DEFAULT: '#e8b930',
          light: '#f0cc5a',
          dark: '#c49a18',
          muted: 'rgba(232, 185, 48, 0.15)',
        },
        emerald: {
          DEFAULT: '#16a085',
          light: '#1abc9c',
          dark: '#0e7a65',
          muted: 'rgba(22, 160, 133, 0.15)',
        },
        coral: {
          DEFAULT: '#e74c3c',
          light: '#ec6b5c',
          dark: '#c0392b',
          muted: 'rgba(231, 76, 60, 0.15)',
        },
        cream: '#f8f5f0',
        slate: {
          muted: '#64748b',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Noto Sans Sinhala', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gold-emerald': 'linear-gradient(135deg, #e8b930, #16a085)',
        'sapphire-royal': 'linear-gradient(135deg, #000000, #0a0a14)',
      },
      animation: {
        'count-up': 'countUp 1s ease-out forwards',
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'slide-up': 'slideUp 0.5s ease-out forwards',
        'pulse-gold': 'pulseGold 2s ease-in-out infinite',
        'spin-slow': 'spin 8s linear infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        countUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseGold: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(232, 185, 48, 0.4)' },
          '50%': { boxShadow: '0 0 0 10px rgba(232, 185, 48, 0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'glass': '0 8px 32px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255,255,255,0.05)',
        'gold': '0 0 20px rgba(232, 185, 48, 0.3)',
        'emerald': '0 0 20px rgba(22, 160, 133, 0.3)',
        'coral': '0 0 20px rgba(231, 76, 60, 0.3)',
      },
    },
  },
  plugins: [],
}
export default config
