export const setStyle = (
  element: HTMLElement,
  styles: Partial<CSSStyleDeclaration>,
) => {
  Object.keys(styles).forEach((key: string) => {
    const styleKey = (key as keyof CSSStyleDeclaration)!;
    element.style[styleKey as any] = String(styles[styleKey]);
  });
};
