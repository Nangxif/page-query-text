import { theme } from 'antd';
import { default as tailwindTheme } from 'tailwindcss/defaultTheme';
import { theme as antTheme } from './config/antdTheme';

const tokens = theme.getDesignToken(antTheme);

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{ts,less,tsx}'],
  theme: {
    extend: {
      ant: {
        ...tokens,
        components: antTheme.components,
      },
      colors: {
        ...tailwindTheme.colors,
        primary: '#CCAC85',
        'primary-50': '#F9F7F1',
        'primary-100': '#F3EDE1',
        'primary-200': '#E6D9C2',
        'primary-300': '#D6BF9B',
        'primary-400': '#CCAC85',
        'primary-500': '#B88956',
        'primary-600': '#AA754D',
        'primary-700': '#8E5F40',
        'primary-800': '#724D39',
        'primary-900': '#5E4130',
        'primary-950': '#312118',

        'text-strong': '#383533',
        'text-regular': '#61605F',
        'text-secondary': '#969390',
        'text-placeholder': '#C7C4C2',

        'border-first': '#E2DFDD',
        'border-second': '#F0EEEC',
        'border-third': '#F4F2F1',

        error: '#ec7d57',
      },
    },
  },
  plugins: [],
};
