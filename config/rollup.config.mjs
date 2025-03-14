import commonjs from '@rollup/plugin-commonjs';
import image from '@rollup/plugin-image';
import resolve from '@rollup/plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';
import typescript from 'rollup-plugin-typescript2';

export default [
  {
    input: 'src/content-scripts/insert-script.ts', // insert-script 输入文件
    output: {
      file: 'dist/content-scripts/insert-script.js', // 输出到特定目录
      format: 'iife', // 输出格式
    },
    plugins: [
      resolve(), // 解析 node_modules 中的模块
      image(),
      commonjs(), // 转换 CommonJS 模块为 ES6
      typescript(), // 使用 TypeScript
      terser(), // 压缩输出文件
    ],
  },
  {
    input: 'src/content-scripts/floating-search-box.ts', // insert-script 输入文件
    output: {
      file: 'dist/content-scripts/floating-search-box.js', // 输出到特定目录
      format: 'iife', // 输出格式
    },
    plugins: [
      resolve(), // 解析 node_modules 中的模块
      image(),
      commonjs(), // 转换 CommonJS 模块为 ES6
      typescript(), // 使用 TypeScript
      terser(), // 压缩输出文件
    ],
  },
  {
    input: 'src/background/index.ts', // background 输入文件
    output: {
      file: 'dist/background/background.js', // 输出到特定目录
      format: 'iife', // 输出格式
    },
    plugins: [
      resolve(), // 解析 node_modules 中的模块
      commonjs(), // 转换 CommonJS 模块为 ES6
      typescript(), // 使用 TypeScript
      terser(), // 压缩输出文件
    ],
  },
];
