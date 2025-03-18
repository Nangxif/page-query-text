class HighlightBox extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.createHighlightBox();
  }

  private createHighlightBox() {
    const span = document.createElement('span');
    const slot = document.createElement('slot');
    span.appendChild(slot);
    this.shadowRoot?.appendChild(span);
  }
}

customElements.define('highlight-box', HighlightBox);

export type HighlightBoxElement = HighlightBox;
