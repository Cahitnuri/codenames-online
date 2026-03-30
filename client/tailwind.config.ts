import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'card-red': '#DC2626',
        'card-blue': '#2563EB',
        'card-neutral': '#92400E',
        'card-assassin': '#0A0A0F',
        'card-unknown': '#F4EDD8',
        'board-bg': '#07091A',
        ink: {
          900: '#07091A',
          800: '#0D1128',
          700: '#111827',
          600: '#1A2035',
          500: '#252D47',
          400: '#374160',
        },
        crimson: {
          900: '#450a0a',
          800: '#7f1d1d',
          700: '#991b1b',
          600: '#dc2626',
          500: '#ef4444',
          400: '#f87171',
          glow: 'rgba(220,38,38,0.35)',
        },
        cobalt: {
          900: '#1e3a8a',
          800: '#1d4ed8',
          700: '#2563eb',
          600: '#3b82f6',
          500: '#60a5fa',
          glow: 'rgba(37,99,235,0.35)',
        },
      },
      fontFamily: {
        display: ['Bebas Neue', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        body: ['Outfit', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'dot-grid': "radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)",
        'noise': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E\")",
      },
      backgroundSize: {
        'dot-sm': '24px 24px',
      },
      boxShadow: {
        'red-glow': '0 0 20px rgba(220,38,38,0.4), 0 0 40px rgba(220,38,38,0.15)',
        'red-glow-sm': '0 0 8px rgba(220,38,38,0.5)',
        'blue-glow': '0 0 20px rgba(37,99,235,0.4), 0 0 40px rgba(37,99,235,0.15)',
        'blue-glow-sm': '0 0 8px rgba(37,99,235,0.5)',
        'card-hover': '0 8px 24px rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.3)',
        'card-lift': '0 16px 40px rgba(0,0,0,0.6)',
        'inner-dark': 'inset 0 1px 0 rgba(255,255,255,0.05)',
      },
      keyframes: {
        flipCard: {
          '0%': { transform: 'rotateY(0deg) scale(1)' },
          '40%': { transform: 'rotateY(90deg) scale(1.05)' },
          '60%': { transform: 'rotateY(90deg) scale(1.05)' },
          '100%': { transform: 'rotateY(0deg) scale(1)' },
        },
        comboBurst: {
          '0%': { transform: 'scale(0.3) translateY(20px)', opacity: '0' },
          '50%': { transform: 'scale(1.15) translateY(-5px)', opacity: '1' },
          '80%': { transform: 'scale(0.95) translateY(0)', opacity: '1' },
          '100%': { transform: 'scale(1) translateY(0)', opacity: '0' },
        },
        timerPulse: {
          '0%, 100%': { filter: 'drop-shadow(0 0 4px #ef4444)' },
          '50%': { filter: 'drop-shadow(0 0 12px #ef4444)' },
        },
        slideIn: {
          '0%': { transform: 'translateY(-8px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(12px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%': { transform: 'translateX(-6px)' },
          '40%': { transform: 'translateX(6px)' },
          '60%': { transform: 'translateX(-4px)' },
          '80%': { transform: 'translateX(4px)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
      },
      animation: {
        'flip-card': 'flipCard 0.55s cubic-bezier(0.4,0,0.2,1)',
        'combo-burst': 'comboBurst 1s cubic-bezier(0.4,0,0.2,1) forwards',
        'timer-pulse': 'timerPulse 1s ease-in-out infinite',
        'slide-in': 'slideIn 0.25s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'shake': 'shake 0.4s ease-in-out',
        'fade-in': 'fadeIn 0.4s ease-out',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
} satisfies Config;
