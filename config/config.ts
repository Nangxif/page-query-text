import { defineConfig } from '@umijs/max';
import { theme as antTheme } from './antdTheme';

export default defineConfig({
  antd: {
    theme: antTheme,
    configProvider: {
      theme: {
        cssVar: true,
        hashed: false,
      },
    },
  },
  mpa: {
    layout: '@/Layout.tsx',
    entry: {},
  },
  esbuildMinifyIIFE: true,
  npmClient: 'pnpm',
  request: {},
  tailwindcss: {},
  extraPostCSSPlugins: [require('tailwindcss')()],
});
