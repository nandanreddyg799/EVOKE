/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'warm-white':     '#F5F1EA',
        'travertine':     '#D8CEC0',
        'sand':           '#C7B9A6',
        'warm-grey':      '#8F8981',
        'charcoal':       '#171717',
        'soft-black':     '#0E0E0D',
        'brushed-nickel': '#A7A39B',
      },
      fontFamily: {
        // Playfair Display — high-contrast transitional serif for all display text
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        // DM Sans — humanist geometric sans for all body, UI, and navigation
        body:    ['"DM Sans"', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        // Named scale — use these instead of raw px values where possible
        'label':   ['11px', { lineHeight: '1.4', letterSpacing: '0.22em' }],
        'eyebrow': ['11px', { lineHeight: '1.4', letterSpacing: '0.28em' }],
        'caption': ['13px', { lineHeight: '1.6', letterSpacing: '0.02em' }],
        'body-sm': ['14px', { lineHeight: '1.7', letterSpacing: '0.01em' }],
        'body':    ['16px', { lineHeight: '1.8', letterSpacing: '0.01em' }],
        'body-lg': ['18px', { lineHeight: '1.9', letterSpacing: '0.01em' }],
        'ui-sm':   ['12px', { lineHeight: '1.5', letterSpacing: '0.03em' }],
        'ui':      ['13px', { lineHeight: '1.5', letterSpacing: '0.02em' }],
        'nav':     ['12px', { lineHeight: '1', letterSpacing: '0.20em' }],
      },
      letterSpacing: {
        widest2: '0.25em',
        display: '0.15em',
        body:    '0.02em',
        nav:     '0.20em',
        label:   '0.22em',
        eyebrow: '0.28em',
      },
      lineHeight: {
        'editorial': '1.25',
        'reading':   '1.8',
        'loose':     '2.0',
      },
      aspectRatio: {
        '4/3':  '4 / 3',
        '3/4':  '3 / 4',
        '16/9': '16 / 9',
      },
    },
  },
  plugins: [],
};
