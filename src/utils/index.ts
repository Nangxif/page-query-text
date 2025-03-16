import { Position } from '@/types';

export const setStyle = (
  element: HTMLElement,
  styles: Partial<CSSStyleDeclaration>,
) => {
  Object.keys(styles).forEach((key: string) => {
    const styleKey = (key as keyof CSSStyleDeclaration)!;
    element.style[styleKey as any] = String(styles[styleKey]);
  });
};

export const isSameHighlight = (
  prevPosition: Position,
  nextPosition: Position,
) => {
  return (
    prevPosition.left === nextPosition.left &&
    prevPosition.top === nextPosition.top &&
    prevPosition.width === nextPosition.width &&
    prevPosition.height === nextPosition.height
  );
};
