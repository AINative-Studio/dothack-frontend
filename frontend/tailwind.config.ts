import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    // Override default border radius to zero everywhere
    borderRadius: {
      none: '0',
      DEFAULT: '0',
      sm: '0',
      md: '0',
      lg: '0',
      xl: '0',
      '2xl': '0',
      '3xl': '0',
      full: '9999px',
    },
    extend: {
      colors: {
        // PRESS design system palette
        ink: '#16140f',
        cream: '#f4f1e8',
        'cream-dark': '#e7e5df',
        'cream-mid': '#e2ddd0',
        accent: '#ff4d23',
        muted: '#8c8676',
        'muted-light': '#c2a08f',
        'border-light': '#ddd6c6',
        'input-bg': '#fbfaf5',
        danger: '#b8442c',
        success: '#9fe0ac',
        warning: '#9a7b1a',
        'warning-bg': '#fbf3d9',

        // Retain shadcn/radix semantic tokens for compatibility with
        // components we are NOT replacing in this pass.
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        'muted-ui': {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        'accent-ui': {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
      },
      fontFamily: {
        archivo: ['Archivo', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      fontSize: {
        // PRESS type scale
        display: ['64px', { lineHeight: '1', letterSpacing: '-0.04em', fontWeight: '900' }],
        h1: ['36px', { lineHeight: '1.05', letterSpacing: '-0.03em', fontWeight: '900' }],
        h2: ['24px', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '800' }],
        body: ['15px', { lineHeight: '1.6', letterSpacing: '0.005em', fontWeight: '400' }],
        label: ['10px', { lineHeight: '1.2', letterSpacing: '0.08em', fontWeight: '500' }],
        data: ['34px', { lineHeight: '1', letterSpacing: '-0.02em', fontWeight: '900' }],
        badge: ['9px', { lineHeight: '1.2', letterSpacing: '0.04em', fontWeight: '400' }],
      },
      borderWidth: {
        '1.5': '1.5px',
      },
      spacing: {
        // Panel/section spacing
        'panel': '18px',
        'section-sm': '38px',
        'section': '56px',
      },
      boxShadow: {
        frame: '0 24px 60px rgba(0,0,0,.18)',
        modal: '0 30px 80px rgba(0,0,0,.4)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'dh-pulse': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.4' },
        },
        'dh-blink': {
          '0%, 100%': { opacity: '1' },
          '49.9%': { opacity: '1' },
          '50%': { opacity: '0' },
          '99.9%': { opacity: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'dh-pulse': 'dh-pulse 1.6s ease-in-out infinite',
        'dh-blink': 'dh-blink 1s step-end infinite',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
