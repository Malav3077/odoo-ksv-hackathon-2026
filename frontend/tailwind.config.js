/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/hooks/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Odoo brand plum — overrides purple & indigo across the whole app
        odoo: {
          50: '#f8f4f7', 100: '#f0e6ee', 200: '#e0cddc', 300: '#c9a8c2',
          400: '#ab7ba1', 500: '#8d5a80', 600: '#714B67', 700: '#5d3e55',
          800: '#4b3245', 900: '#3a2736', 950: '#231521',
        },
        purple: {
          50: '#f8f4f7', 100: '#f0e6ee', 200: '#e0cddc', 300: '#c9a8c2',
          400: '#ab7ba1', 500: '#8d5a80', 600: '#714B67', 700: '#5d3e55',
          800: '#4b3245', 900: '#3a2736', 950: '#231521',
        },
        indigo: {
          50: '#f8f4f7', 100: '#f0e6ee', 200: '#e0cddc', 300: '#c9a8c2',
          400: '#ab7ba1', 500: '#8d5a80', 600: '#714B67', 700: '#5d3e55',
          800: '#4b3245', 900: '#3a2736', 950: '#231521',
        },
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: { DEFAULT: 'hsl(var(--card))', foreground: 'hsl(var(--card-foreground))' },
        popover: { DEFAULT: 'hsl(var(--popover))', foreground: 'hsl(var(--popover-foreground))' },
        primary: { DEFAULT: 'hsl(var(--primary))', foreground: 'hsl(var(--primary-foreground))' },
        secondary: { DEFAULT: 'hsl(var(--secondary))', foreground: 'hsl(var(--secondary-foreground))' },
        muted: { DEFAULT: 'hsl(var(--muted))', foreground: 'hsl(var(--muted-foreground))' },
        accent: { DEFAULT: 'hsl(var(--accent))', foreground: 'hsl(var(--accent-foreground))' },
        destructive: { DEFAULT: 'hsl(var(--destructive))', foreground: 'hsl(var(--destructive-foreground))' },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar-background))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'fade-in-0': { from: { opacity: '0' }, to: { opacity: '1' } },
        'zoom-in-95': { from: { transform: 'scale(.95)' }, to: { transform: 'scale(1)' } },
        'slide-in-from-left': { from: { transform: 'translateX(-100%)' }, to: { transform: 'translateX(0)' } },
        'slide-out-to-left': { from: { transform: 'translateX(0)' }, to: { transform: 'translateX(-100%)' } },
        'slide-in-from-right': { from: { transform: 'translateX(100%)' }, to: { transform: 'translateX(0)' } },
        'slide-out-to-right': { from: { transform: 'translateX(0)' }, to: { transform: 'translateX(100%)' } },
        'fade-out-0': { from: { opacity: '1' }, to: { opacity: '0' } },
      },
      animation: {
        'in': 'fade-in-0 0.15s ease-out, zoom-in-95 0.15s ease-out',
        'out': 'fade-out-0 0.15s ease-in',
      },
    },
  },
  plugins: [],
}
