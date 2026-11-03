/** @type {import('tailwindcss').Config} */

// Colours are defined as RGB channels in src/index.css (:root).
// To re-theme the whole site, edit those variables only.
const v = (name) => `rgb(var(--${name}) / <alpha-value>)`;

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      screens: {
        xs: '475px',
      },
      colors: {
        // Navy ink: text, dark sections and outlines
        ink: {
          950: v('ink-950'),
          900: v('ink-900'),
          800: v('ink-800'),
          700: v('ink-700'),
        },
        // Verified emerald: links, icons, focus, "valid" states
        brand: {
          50: v('brand-50'),
          100: v('brand-100'),
          200: v('brand-200'),
          500: v('brand-500'),
          600: v('brand-600'),
          700: v('brand-700'),
          800: v('brand-800'),
          900: v('brand-900'),
        },
        // Mint seal: primary buttons, highlights, accents on dark
        seal: {
          DEFAULT: v('seal'),
          light: v('seal-light'),
          deep: v('seal-deep'),
        },
        // Cool textured section background (use with .bg-texture)
        porcelain: {
          DEFAULT: v('porcelain'),
          deep: v('porcelain-deep'),
        },
        // Warm certificate paper
        parchment: v('parchment'),
        // Soft fills for cards and notices
        mist: v('mist'),
        mint: v('mint'),
        rose: v('rose'),
        peach: v('peach'),
        paper: {
          DEFAULT: v('paper'),
          2: v('paper-2'),
        },
        line: v('line'),
        muted: v('muted'),
        body: v('body'),
        whatsapp: '#1FAF54',
      },
      fontFamily: {
        serif: ['"Instrument Serif"', 'Georgia', 'Times', '"Times New Roman"', 'serif'],
        sans: ['Geist', '"Helvetica Neue"', 'Helvetica', 'Arial', 'sans-serif'],
        mono: ['"Geist Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.6875rem', { lineHeight: '1rem' }],
      },
      maxWidth: {
        site: '80rem',
      },
      borderRadius: {
        card: '1rem',
        panel: '1.625rem',
      },
      boxShadow: {
        soft: '0 1px 2px rgb(11 26 46 / 0.06)',
        lift: '0 18px 44px -22px rgb(11 26 46 / 0.45)',
        edge: '0 0 0 1px rgb(11 26 46)',
        paper: '0 1px 1px rgb(11 26 46 / 0.04), 0 12px 24px -12px rgb(11 26 46 / 0.25), 0 40px 80px -40px rgb(11 26 46 / 0.45)',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        rise: {
          '0%': { opacity: '0', transform: 'translateY(14px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        stamp: {
          '0%': { opacity: '0', transform: 'scale(1.6) rotate(-14deg)' },
          '60%': { opacity: '1', transform: 'scale(0.94) rotate(-8deg)' },
          '100%': { opacity: '1', transform: 'scale(1) rotate(-8deg)' },
        },
        scan: {
          '0%, 100%': { transform: 'translateY(0)', opacity: '0' },
          '10%, 90%': { opacity: '1' },
          '50%': { transform: 'translateY(var(--scan-distance, 220px))' },
        },
        spinSlow: {
          to: { transform: 'rotate(360deg)' },
        },
      },
      animation: {
        marquee: 'marquee 50s linear infinite',
        rise: 'rise .7s cubic-bezier(.2,.7,.2,1) both',
        stamp: 'stamp .7s cubic-bezier(.2,.7,.2,1) both',
        scan: 'scan 4.5s ease-in-out infinite',
        'spin-slow': 'spinSlow 60s linear infinite',
      },
    },
  },
  plugins: [],
};
