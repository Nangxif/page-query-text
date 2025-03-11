import { defineConfig } from '@umijs/max';

export default defineConfig({
  antd: {},
  access: {},
  model: {},
  initialState: {},
  request: {},
  // publicPath: '/dist/',
  history: {
    type: 'hash',
  },
  mpa: {
    entry: {
      home: 'src/pages/Home/index.tsx', // 第一个入口
      access: 'src/pages/Access/index.tsx', // 第二个入口
    },
  },
  esbuildMinifyIIFE: true,
  // routes: [
  //   {
  //     path: '/',
  //     redirect: '/home',
  //   },
  //   {
  //     name: '首页',
  //     path: '/home',
  //     component: './Home',
  //   },
  //   {
  //     name: '权限演示',
  //     path: '/access',
  //     component: './Access',
  //   },
  //   {
  //     name: ' CRUD 示例',
  //     path: '/table',
  //     component: './Table',
  //   },
  // ],

  npmClient: 'pnpm',
});
