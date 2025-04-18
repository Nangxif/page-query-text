/* eslint-disable @typescript-eslint/no-this-alias */
import { LoadingEnum, MatchCaseEnum } from '@/types';
import { setStyle } from '@/utils';
import CloseIcon from '../assets/images/close-icon.png';
import DragIcon from '../assets/images/drag-icon.png';
import LoadingIcon from '../assets/images/loading-icon.png';
import MatchCaseIcon from '../assets/images/match-case-icon.png';
import NextIcon from '../assets/images/next-icon.png';
import PrevIcon from '../assets/images/prev-icon.png';
import SettingsIcon from '../assets/images/setting-icon.png';

// 定义一个悬浮搜索框的Web Component
class FloatingSearchBox extends HTMLElement {
  private floatingBox: HTMLElement | null = null;
  private dragButton: HTMLElement | null = null;
  private input: HTMLInputElement | null = null;
  private loadingIcon: HTMLElement | null = null;
  private searchResultId: string = `search-result`;
  private matchCase = MatchCaseEnum.DontMatch;
  private startX = 0;
  private startY = 0;
  private translateX = 0;
  private translateY = 0;
  private loading = LoadingEnum.Loaded;
  private searchBoxWidth = 420;
  private searchBoxHeight = 38;
  private searchBoxMargin = 20;

  static get observedAttributes() {
    return [
      'data-fixed',
      'data-startx',
      'data-starty',
      'data-loading',
      'data-selected-content',
    ];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.createFloatingBox();
  }

  private createFloatingBox() {
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    this.shadowRoot?.appendChild(styleElement);
    this.startX = this.dataset.startx ? Number(this.dataset.startx) : 0;
    this.startY = this.dataset.starty ? Number(this.dataset.starty) : 0;
    // 创建悬浮框
    this.floatingBox = document.createElement('div');
    setStyle(this.floatingBox, {
      boxSizing: 'border-box',
      display: 'flex',
      alignItems: 'center',
      position: 'fixed',
      top: `${this.searchBoxMargin}px`,
      right: `${this.searchBoxMargin}px`,
      width: `${this.searchBoxWidth}px`,
      height: `${this.searchBoxHeight}px`,
      padding: '6px 4px',
      backgroundColor: 'rgb(32 32 32)',
      borderRadius: '4px',
      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.5)',
      zIndex: '1000000',
      transform: `translate3d(${this.startX}px,${this.startY}px,0)`,
    });

    // 拖拽按钮
    this.dragButton = document.createElement('div');
    setStyle(this.dragButton, {
      width: '16px',
      height: '16px',
      cursor: this.dataset.fixed === 'true' ? 'not-allowed' : 'pointer',
      userSelect: 'none',
      backgroundImage: `url(${DragIcon})`,
      backgroundSize: '100% 100%',
    });

    const that = this;
    function handleMouseMove(e: any) {
      // 这里要判断有没有超出屏幕
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;
      let translateX = that.startX + e.clientX - that.translateX;
      let translateY = that.startY + e.clientY - that.translateY;

      if (
        translateX <
        -(windowWidth - that.searchBoxWidth - 2 * that.searchBoxMargin)
      ) {
        translateX = -(
          windowWidth -
          that.searchBoxWidth -
          2 * that.searchBoxMargin
        );
      }
      if (translateX > 0) {
        translateX = 0;
      }
      if (
        translateY >
        windowHeight - that.searchBoxHeight - 2 * that.searchBoxMargin
      ) {
        translateY =
          windowHeight - that.searchBoxHeight - 2 * that.searchBoxMargin;
      }
      if (translateY < 0) {
        translateY = 0;
      }
      setStyle(that.floatingBox!, {
        transform: `translate3d(${translateX}px,${translateY}px,0)`,
      });
    }
    // 创建一个单独的mouseup处理函数
    function handleMouseUp(e: MouseEvent) {
      that.startX = that.startX + e.clientX - that.translateX;
      that.startY = that.startY + e.clientY - that.translateY;
      that.dispatchEvent(
        new CustomEvent('move', {
          detail: {
            startX: that.startX,
            startY: that.startY,
          },
        }),
      );
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp); // 移除全局mouseup监听
    }
    this.dragButton.addEventListener('mousedown', (e) => {
      if (that.dataset.fixed === 'true') return; // 如果固定则不拖拽
      that.translateX = e.clientX;
      that.translateY = e.clientY;
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    });

    this.floatingBox.appendChild(this.dragButton);

    // 设置按钮
    const settingButtonBox = document.createElement('div');
    setStyle(settingButtonBox, {
      width: '24px',
      height: '24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      borderRadius: '4px',
      marginRight: '4px',
    });
    settingButtonBox.onmouseenter = () => {
      setStyle(settingButtonBox, {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
      });
    };
    settingButtonBox.onmouseleave = () => {
      setStyle(settingButtonBox, {
        backgroundColor: 'transparent',
      });
    };
    settingButtonBox.onclick = () => {
      this.dispatchEvent(new CustomEvent('setting'));
    };
    const settingButtonIcon = document.createElement('div');
    setStyle(settingButtonIcon, {
      width: '16px',
      height: '16px',
      userSelect: 'none',
      backgroundImage: `url(${SettingsIcon})`,
      backgroundSize: '100% 100%',
    });
    settingButtonBox.appendChild(settingButtonIcon);
    this.floatingBox.appendChild(settingButtonBox);

    // 创建输入框
    const inputBox = document.createElement('div');
    setStyle(inputBox, {
      flex: '1',
      display: 'flex',
      alignItems: 'center',
      width: '100%',
      height: '26px',
      borderRadius: '4px',
      border: 'none',
      overflow: 'hidden',
      background: 'rgb(49 49 49)',
      marginRight: '12px',
    });

    this.input = document.createElement('input');
    this.input.type = 'text';
    setStyle(this.input, {
      flex: '1',
      width: '100%',
      height: '26px',
      border: 'none',
      outline: 'none',
      color: 'white',
      fontSize: '14px',
      padding: '0 10px',
      background: 'transparent',
    });
    this.input.autofocus = true;
    this.input.placeholder = '查找';
    if (this.dataset.selectedContent) {
      this.input.value = this.dataset.selectedContent;
      const timer = setTimeout(() => {
        this.dispatchEvent(
          new CustomEvent('search', {
            detail: this.dataset.selectedContent,
          }),
        );
        clearTimeout(timer);
      }, 100);
    }
    // 绑定事件，当输入框内容变化时，调用search函数
    this.input.addEventListener('input', (e) => {
      this.dispatchEvent(
        new CustomEvent('search', {
          detail: (e.target as HTMLInputElement).value,
        }),
      );
    });
    this.input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        this.dispatchEvent(
          new CustomEvent('search', {
            detail: (e.target as HTMLInputElement).value,
          }),
        );
      }
    });
    inputBox.appendChild(this.input);

    this.loadingIcon = document.createElement('div');
    setStyle(this.loadingIcon, {
      width: '14px',
      height: '14px',
      backgroundImage: `url(${LoadingIcon})`,
      backgroundSize: '100% 100%',
      marginRight: '4px',
      display: 'none',
      animation:
        this.loading === LoadingEnum.Loading
          ? 'spin 1s linear infinite'
          : 'none',
    });

    const matchcaseButtonBox = document.createElement('div');
    setStyle(matchcaseButtonBox, {
      width: '22px',
      height: '22px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      borderRadius: '4px',
      marginRight: '4px',
    });
    matchcaseButtonBox.onmouseenter = () => {
      setStyle(matchcaseButtonBox, {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
      });
    };
    matchcaseButtonBox.onmouseleave = () => {
      if (this.matchCase === MatchCaseEnum.DontMatch) {
        setStyle(matchcaseButtonBox, {
          backgroundColor: 'transparent',
        });
      }
    };
    matchcaseButtonBox.onclick = () => {
      this.matchCase =
        this.matchCase === MatchCaseEnum.DontMatch
          ? MatchCaseEnum.Match
          : MatchCaseEnum.DontMatch;
      if (this.matchCase === MatchCaseEnum.Match) {
        setStyle(matchcaseButtonBox, {
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
        });
      }
      this.dispatchEvent(
        new CustomEvent('matchcasechange', {
          detail: this.matchCase,
        }),
      );
    };
    const matchCaseButtonIcon = document.createElement('div');
    setStyle(matchCaseButtonIcon, {
      width: '18px',
      height: '18px',
      userSelect: 'none',
      backgroundImage: `url(${MatchCaseIcon})`,
      backgroundSize: '100% 100%',
    });
    matchcaseButtonBox.appendChild(matchCaseButtonIcon);

    inputBox.appendChild(this.loadingIcon);
    inputBox.appendChild(matchcaseButtonBox);

    // 将输入框添加到内容区域
    this.floatingBox.appendChild(inputBox);

    // 搜索结果
    const searchResult = document.createElement('div');
    searchResult.id = this.searchResultId;
    searchResult.textContent = '无结果';
    setStyle(searchResult, {
      color: 'white',
      fontSize: '13px',
      marginRight: '12px',
    });
    this.floatingBox.appendChild(searchResult);

    const prevButtonBox = document.createElement('div');
    setStyle(prevButtonBox, {
      width: '24px',
      height: '24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      borderRadius: '4px',
      marginRight: '4px',
    });
    prevButtonBox.onmouseenter = () => {
      setStyle(prevButtonBox, {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
      });
    };
    prevButtonBox.onmouseleave = () => {
      setStyle(prevButtonBox, {
        backgroundColor: 'transparent',
      });
    };
    prevButtonBox.onclick = () => {
      this.dispatchEvent(new CustomEvent('searchprevious'));
    };
    const prevButtonIcon = document.createElement('div');
    setStyle(prevButtonIcon, {
      width: '16px',
      height: '16px',
      userSelect: 'none',
      backgroundImage: `url(${PrevIcon})`,
      backgroundSize: '100% 100%',
    });
    prevButtonBox.appendChild(prevButtonIcon);

    const nextButtonBox = document.createElement('div');
    setStyle(nextButtonBox, {
      width: '24px',
      height: '24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      borderRadius: '4px',
      marginRight: '4px',
    });
    nextButtonBox.onmouseenter = () => {
      setStyle(nextButtonBox, {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
      });
    };
    nextButtonBox.onmouseleave = () => {
      setStyle(nextButtonBox, {
        backgroundColor: 'transparent',
      });
    };
    nextButtonBox.onclick = () => {
      this.dispatchEvent(new CustomEvent('searchnext'));
    };
    const nextButtonIcon = document.createElement('div');
    setStyle(nextButtonIcon, {
      width: '16px',
      height: '16px',
      userSelect: 'none',
      backgroundImage: `url(${NextIcon})`,
      backgroundSize: '100% 100%',
    });
    nextButtonBox.appendChild(nextButtonIcon);

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
      marginRight: '4px',
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

    this.floatingBox.appendChild(prevButtonBox);
    this.floatingBox.appendChild(nextButtonBox);
    this.floatingBox.appendChild(closeButtonBox);

    // 将悬浮框添加到文档中
    this.shadowRoot?.appendChild(this.floatingBox);
  }

  attributeChangedCallback(name: string, _: string, newValue: string) {
    if (name === 'data-selected-content') {
      if (this.input) {
        this.input!.value = newValue;
        this.dispatchEvent(
          new CustomEvent('search', {
            detail: newValue,
          }),
        );
      }
    }
    if (name === 'data-loading') {
      this.loading = newValue as LoadingEnum;
      if (this.loading === LoadingEnum.Loading) {
        setStyle(this.loadingIcon!, {
          display: 'block',
          animation: 'spin 1s linear infinite',
        });
      } else if (this.loading === LoadingEnum.Loaded) {
        const timer = setTimeout(() => {
          setStyle(this.loadingIcon!, {
            display: 'none',
            animation: 'none',
          });
          clearTimeout(timer);
        }, 100);
      }
    }
  }
}

customElements.define('floating-search-box', FloatingSearchBox);

export type FloatingSearchBoxElement = FloatingSearchBox;
