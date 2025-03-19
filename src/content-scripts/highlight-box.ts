class HighlightBox extends HTMLElement {
  static get observedAttributes() {
    return ['data-styles'];
  }
  private localStyle!: HTMLStyleElement;
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.createHighlightBox();
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    if (name === 'data-styles' && this.localStyle) {
      const styles = JSON.parse(newValue || '{}');
      let containerStylesCSS = '';
      Object.entries(styles).forEach(([styleName, styleValue]) => {
        containerStylesCSS += `${styleName
          .replace(/([A-Z])/g, '-$1')
          .toLowerCase()}: ${styleValue}; `;
      });
      this.localStyle.textContent = `
        ::slotted(*) {
          ${containerStylesCSS}
        }
      `;
    }
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
    this.localStyle = document.createElement('style');
    this.localStyle.textContent = `
      ::slotted(*) {
        ${containerStylesCSS}
      }
    `;
    this.shadowRoot?.appendChild(this.localStyle);
    this.shadowRoot?.appendChild(slot);
  }
}

customElements.define('highlight-box', HighlightBox);

export type HighlightBoxElement = HighlightBox;
