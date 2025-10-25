import type { Config } from 'tailwindcss';
import cssAnimate from 'tailwindcss-animate';

export default {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  plugins: [cssAnimate],
} satisfies Config;
