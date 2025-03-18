class HighlightBox extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.createHighlightBox();
  }

  private createHighlightBox() {
    const slot = document.createElement('slot');
    const styles = JSON.parse(this.dataset.styles || '{}');
    let containerStylesCSS = '';
    Object.entries(styles).forEach(([styleName, styleValue]) => {
      containerStylesCSS += `${styleName
        .replace(/([A-Z])/g, '-$1')
        .toLowerCase()}: ${styleValue}; `;
    });
    // 添加样式
    const style = document.createElement('style');
    style.textContent = `
      ::slotted(*) {
        ${containerStylesCSS}
      }
    `;
    this.shadowRoot?.appendChild(style);
    this.shadowRoot?.appendChild(slot);
  }
}

customElements.define('highlight-box', HighlightBox);

export type HighlightBoxElement = HighlightBox;
