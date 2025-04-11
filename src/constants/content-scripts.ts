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
