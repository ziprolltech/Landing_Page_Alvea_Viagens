import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'sky-abyss':  '#030A14',
        'sky-deep':   '#050D1A',
        'sky-dark':   '#0A1628',
        'sky-mid':    '#0D2447',
        'sky-bright': '#1A5FA0',
        'sky-horizon':'#1F4D8C',
        gold:         '#D4A853',
        'gold-light': '#ECC96A',
        'gold-dim':   '#A0782E',
        'orange-soft':'#E8824A',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'sky-gradient':  'linear-gradient(175deg, #030A14 0%, #050D1A 20%, #0A1628 45%, #0D2447 70%, #1A3A6A 85%, #1F4D8C 100%)',
        'gold-gradient': 'linear-gradient(135deg, #D4A853 0%, #ECC96A 50%, #E8824A 100%)',
        'hero-radial':   'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(26,95,160,0.25) 0%, transparent 70%)',
      },
      animation: {
        'float-a': 'floatA 9s ease-in-out infinite',
        'float-b': 'floatB 7s ease-in-out infinite',
        'float-c': 'floatC 11s ease-in-out infinite',
        'float-d': 'floatD 8s ease-in-out infinite 2s',
        'shimmer': 'shimmer 4s linear infinite',
        'pulse-soft': 'pulseSoft 3s ease-in-out infinite',
        'star-twinkle': 'starTwinkle 4s ease-in-out infinite',
        'drift-right': 'driftRight 60s linear infinite',
        'drift-right-slow': 'driftRight 90s linear infinite',
      },
      keyframes: {
        floatA: {
          '0%,100%': { transform: 'translate(0px, 0px)' },
          '30%':     { transform: 'translate(12px, -16px)' },
          '60%':     { transform: 'translate(-8px, -8px)' },
        },
        floatB: {
          '0%,100%': { transform: 'translate(0px, 0px)' },
          '50%':     { transform: 'translate(-18px, 12px)' },
        },
        floatC: {
          '0%,100%': { transform: 'translate(0px, 0px) scale(1)' },
          '40%':     { transform: 'translate(10px, -14px) scale(1.03)' },
          '70%':     { transform: 'translate(-6px, 8px) scale(0.98)' },
        },
        floatD: {
          '0%,100%': { transform: 'translate(0px, 0px)' },
          '50%':     { transform: 'translate(14px, -10px)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-400% 0' },
          '100%': { backgroundPosition: '400% 0' },
        },
        pulseSoft: {
          '0%,100%': { opacity: '0.6', transform: 'scale(1)' },
          '50%':     { opacity: '1',   transform: 'scale(1.04)' },
        },
        starTwinkle: {
          '0%,100%': { opacity: '0.2' },
          '50%':     { opacity: '0.9' },
        },
        driftRight: {
          '0%':   { transform: 'translateX(-10%)' },
          '100%': { transform: 'translateX(110%)' },
        },
      },
      boxShadow: {
        gold:     '0 0 30px rgba(212,168,83,0.4)',
        'gold-lg':'0 0 60px rgba(212,168,83,0.3), 0 0 30px rgba(212,168,83,0.5)',
        blue:     '0 0 30px rgba(26,95,160,0.4)',
        glass:    '0 8px 32px rgba(0,0,0,0.4)',
      },
    },
  },
  plugins: [],
}

export default config
