import { LoadingEnum } from '@/types';
import { setStyle } from '@/utils';
import CloseIcon from '../assets/images/close-icon.png';
import LoadingIcon from '../assets/images/loading-icon.png';

class SummaryBox extends HTMLElement {
  private summaryBox: HTMLElement | null = null;
  private loading = LoadingEnum.Loaded;
  private loadingIcon: HTMLElement | null = null;
  static get observedAttributes() {
    return ['data-loading'];
  }
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.createSummaryBox();
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    if (name === 'data-loading') {
      this.loading = newValue as LoadingEnum;
      if (this.loading === LoadingEnum.Loading) {
        setStyle(this.loadingIcon!, {
          display: 'block',
        });
      } else if (this.loading === LoadingEnum.Loaded) {
        setStyle(this.loadingIcon!, {
          display: 'none',
        });
      }
    }
  }

  private createSummaryBox() {
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }

      *::-webkit-scrollbar {
        width: 6px;
        height: 6px;
      }

      *::-webkit-scrollbar-thumb {
        background: #e1e1e6;
        border-radius: 3px;
        box-shadow: inset 0 0 5px rgb(0 21 41 / 5%);
      }

      *::-webkit-scrollbar-track {
        background: #f3f4fa;
        border-radius: 3px;
        box-shadow: inset 0 0 5px rgb(37 37 37 / 5%);
      }
    `;
    this.shadowRoot?.appendChild(styleElement);
    // 创建悬浮框
    this.summaryBox = document.createElement('div');
    setStyle(this.summaryBox, {
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      width: '400px',
      height: '300px',
      backgroundColor: 'rgb(32 32 32)',
      borderRadius: '4px',
      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.5)',
      zIndex: '1000000',
    });

    const titleBox = document.createElement('div');
    setStyle(titleBox, {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      fontSize: '13px',
      color: 'white',
      margin: '8px auto',
      width: 'calc(100% - 24px)',
    });
    titleBox.textContent = '页面内容总结';

    // 创建关闭按钮
    const closeButtonBox = document.createElement('div');
    setStyle(closeButtonBox, {
      width: '24px',
      height: '24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      borderRadius: '4px',
    });
    closeButtonBox.onmouseenter = () => {
      setStyle(closeButtonBox, {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
      });
    };
    closeButtonBox.onmouseleave = () => {
      setStyle(closeButtonBox, {
        backgroundColor: 'transparent',
      });
    };
    const closeButtonIcon = document.createElement('div');
    setStyle(closeButtonIcon, {
      width: '16px',
      height: '16px',
      userSelect: 'none',
      backgroundImage: `url(${CloseIcon})`,
      backgroundSize: '100% 100%',
    });
    closeButtonBox.appendChild(closeButtonIcon);

    closeButtonBox.onclick = () => {
      this.dispatchEvent(new CustomEvent('close'));
    };
    titleBox.appendChild(closeButtonBox);
    this.summaryBox.appendChild(titleBox);

    // 内容区域
    const contentBox = document.createElement('div');
    setStyle(contentBox, {
      position: 'relative',
      boxSizing: 'border-box',
      margin: '0 auto',
      marginBottom: '12px',
      padding: '8px',
      width: 'calc(100% - 24px)',
      flex: '1',
      borderRadius: '4px',
      overflowY: 'auto',
      background: 'rgb(49 49 49)',
      fontSize: '13px',
      color: 'white',
      lineHeight: '20px',
      whiteSpace: 'pre-wrap',
      wordBreak: 'break-all',
    });

    this.summaryBox.appendChild(contentBox);

    this.loadingIcon = document.createElement('div');
    setStyle(this.loadingIcon, {
      margin: 'auto',
      position: 'absolute',
      left: '0px',
      right: '0px',
      top: '0px',
      bottom: '0px',
      width: '24px',
      height: '24px',
      backgroundImage: `url(${LoadingIcon})`,
      backgroundSize: '100% 100%',
      animation: 'spin 1s linear infinite',
    });
    contentBox?.appendChild(this.loadingIcon);

    const slot = document.createElement('slot');
    contentBox?.appendChild(slot);

    this.shadowRoot?.appendChild(this.summaryBox);
  }
}

customElements.define('summary-box', SummaryBox);

export type SummaryBoxElement = SummaryBox;
