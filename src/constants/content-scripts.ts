import { TextSelectionType } from '@/types';

export const defaultConfig = {
  shortcut: ['ctrlKey', 'f'],
  // 文字高亮常用的颜色
  color: '#000000',
  bgColor: '#FFC107',
  selectedColor: '#000000',
  selectedBgColor: '#FF0000',
  fixed: true,
  startX: 0,
  startY: 0,
  model: undefined,
  apiKey: undefined,
  systemPrompt: undefined,
  userPrompt: undefined,
  temperature: undefined,
  maxTokens: undefined,
};

export const textStyleProperties = [
  // 字体相关
  'font-family',
  'font-size',
  'font-weight',
  'font-style',
  'font-variant',
  'font-stretch',
  'font-kerning',
  'font-optical-sizing',
  'font-feature-settings',
  'font-variation-settings',

  // 文本排版相关
  'color',
  'text-align',
  'text-decoration',
  'text-transform',
  'text-indent',
  'text-shadow',
  'text-overflow',
  'text-justify',
  'text-orientation',
  'text-rendering',
  'text-underline-position',
  'text-emphasis',
  'letter-spacing',
  'word-spacing',
  'line-height',
  'white-space',
  'word-break',
  'word-wrap',
  'overflow-wrap',
  'hyphens',
  'hanging-punctuation',

  // 书写方向
  'direction',
  'unicode-bidi',
  'writing-mode',

  // 其他可能影响文本的属性
  'vertical-align',
];

export const ResponseCode = {
  SUCCESS: 200,
  ERROR: 500,
};

export const codeMessage = {
  200: '服务器成功返回请求的数据。',
  201: '新建或修改数据成功。',
  202: '一个请求已经进入后台排队（异步任务）。',
  204: '删除数据成功。',
  400: '发出的请求有错误，服务器没有进行新建或修改数据的操作。',
  401: '请先登录Page Toolkit',
  403: '用户得到授权，但是访问是被禁止的。',
  404: '发出的请求针对的是不存在的记录，服务器没有进行操作。',
  406: '请求的格式不可得。',
  410: '请求的资源被永久删除，且不会再得到的。',
  419: '接口权限被禁止',
  422: '当创建一个对象时，发生一个验证错误。',
  500: '服务器发生错误，请检查服务器。',
  502: '网关错误。',
  503: '服务不可用，服务器暂时过载或维护。',
  504: '网关超时。',
} as Record<number, string>;

export const textSelectionTypeTextMap = {
  [TextSelectionType.PageText]: '全文总结',
  [TextSelectionType.SelectionText]: '选择总结',
};
