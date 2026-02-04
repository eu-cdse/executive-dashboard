/** @type {import('tailwindcss').Config} */
const colors = require('tailwindcss/colors');
const fonts = require('tailwindcss/defaultConfig').theme.fontSize;

module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    colors: {
      ...colors,
      sbg: 'var(--csbg)',
      sdark: 'var(--csdark)',
      smain: 'var(--csmain)',
      smain2: 'var(--csmain2)',
      smain21: 'var(--csmain21)',
      smain3: 'var(--csmain3)',
      sred: 'var(--csred)',
      ssec: 'var(--cssec)',
      swhite: 'var(--cswhite)',
      snav: 'var(--csnav)',
      stext: 'var(--cstext)',
      smaintext: 'var(--csmaintext)',
      stxt: 'var(--cstxt)',
      sgrey: 'var(--csgrey)',
      sgrey2: 'var(--csgrey2)',
      sdgrey: 'var(--csdgrey)',
      sacc: 'var(--csacc)',
      background: 'var(--csbg)',
      shgh: 'var(--cshighlight)',
      htext: 'var(--cshtext)',
      bluetxt: 'var(--bluetxt)',
      bluetxtlight: 'var(--bluetxtlight)',
      bgcolor: 'var(--bgcolor)',
    },
    fontSize: {
      ...fonts,
      xxs: ['0.65rem', { lineHeight: '0.75rem' }],
      xxxs: ['0.55rem', { lineHeight: '0.50rem' }],
    },
    extend: {},
    screens: {
      '2xl': { max: '1535px' },
      xl: { max: '1279px' },
      lg: { max: '1023px' },
      md: { max: '767px' },
      sm: { max: '550px' },
    },
  },
  plugins: [require('@tailwindcss/line-clamp')],
};
