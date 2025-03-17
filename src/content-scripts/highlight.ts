class Highlight extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.createHighlightBox();
  }

  private createHighlightBox() {
    const span = document.createElement('span');
    const styles = JSON.parse(this.dataset.styles || '{}') as Record<
      keyof CSSStyleDeclaration,
      any
    >;
    Object.entries(styles).forEach(([styleName, styleValue]) => {
      span.style[styleName as any] = styleValue;
    });
    this.shadowRoot?.appendChild(span);
  }
}

customElements.define('highlight', Highlight);

export type HighlightElement = Highlight;
