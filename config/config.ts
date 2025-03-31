import { defineConfig } from '@umijs/max';

export default defineConfig({
  antd: {},
  mpa: {
    entry: {},
  },
  esbuildMinifyIIFE: true,
  npmClient: 'pnpm',
});
