import { textStyleProperties } from '@/constants';

export const setStyle = (
  element: HTMLElement,
  styles: Partial<CSSStyleDeclaration>,
) => {
  Object.keys(styles).forEach((key: string) => {
    const styleKey = (key as keyof CSSStyleDeclaration)!;
    element.style[styleKey as any] = String(styles[styleKey]);
  });
};

// 将驼峰式属性名转换为连字符式
export const camelToDash = (str: string) =>
  str.replace(/([A-Z])/g, (g) => `-${g[0].toLowerCase()}`);

// 将连字符式属性名转换为驼峰式
export const dashToCamel = (str: string) =>
  str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());

export const getTextRelatedStyles = (textNode: Text) => {
  // 获取文本节点的父元素
  const parentElement = textNode.parentNode as Element;

  // 获取所有计算样式
  const computedStyle = window.getComputedStyle(parentElement);

  // 创建一个只包含文本相关样式的对象
  const textStyles = {} as Record<string, any>;

  // 获取每个文本相关属性的值
  textStyleProperties.forEach((property) => {
    // 处理可能的属性名格式差异
    const camelProperty = dashToCamel(property);

    // 有些属性可能在computedStyle中是驼峰式(如fontSize)
    // 或者原始连字符式(如font-size)都可能存在
    if (camelProperty in computedStyle) {
      textStyles[property] = computedStyle[camelProperty as any];
    } else if (property in computedStyle) {
      textStyles[property] = computedStyle[property as any];
    }
  });

  return textStyles;
};
