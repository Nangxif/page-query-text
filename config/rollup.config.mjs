import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import image from '@rollup/plugin-image';
import { terser } from 'rollup-plugin-terser';
import typescript from 'rollup-plugin-typescript2';

export default {
  input: 'src/content-scripts/insert-script.ts', // 输入文件路径
  output: {
    file: 'dist/content-scripts/index.js', // 输出文件路径
    format: 'iife', // 输出格式
    name: 'ContentScript', // 全局变量名
  },
  plugins: [
    resolve(), // 解析 node_modules 中的模块
    image(),
    commonjs(), // 转换 CommonJS 模块为 ES6
    typescript({ tsconfig: './tsconfig.json' }), // 使用 TypeScript
    terser(), // 压缩输出文件
  ],
};
