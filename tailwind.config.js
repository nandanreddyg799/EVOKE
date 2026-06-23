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
        display: ['"Cormorant Garamond"', 'serif'],
        body:    ['"Inter"', 'sans-serif'],
      },
      letterSpacing: {
        widest2: '0.25em',
        display: '0.15em',
        body:    '0.03em',
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
