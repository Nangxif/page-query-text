import { setStyle } from '@/utils';
import CloseIcon from '../assets/images/close-icon.png';
import LowercaseIcon from '../assets/images/lowercase-icon.png';
import NextIcon from '../assets/images/next-icon.png';
import PrevIcon from '../assets/images/prev-icon.png';
import SettingsIcon from '../assets/images/setting-icon.png';
import UppercaseIcon from '../assets/images/uppercase-icon.png';

// 定义一个悬浮搜索框的Web Component
class FloatingSearchBox extends HTMLElement {
  private floatingBox: HTMLElement | null = null;
  private searchResultElement: HTMLElement | null = null;
  private searchResultId: string = `search-result`;
  private searchResultEmptyText: string = '无结果';

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.createFloatingBox();
    console.log('====悬浮搜索框已创建====');
  }

  private createFloatingBox() {
    // 创建悬浮框
    this.floatingBox = document.createElement('div');
    setStyle(this.floatingBox, {
      display: 'flex',
      alignItems: 'center',
      position: 'fixed',
      top: '20px',
      right: '20px',
      width: 'calc(100vw - 40px)',
      maxWidth: '400px',
      padding: '6px 4px',
      backgroundColor: 'rgb(32 32 32)',
      borderRadius: '4px',
      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.5)',
      zIndex: '1000000',
    });

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
    const settingButtonIcon = document.createElement('img');
    settingButtonIcon.src = SettingsIcon;
    setStyle(settingButtonIcon, {
      width: '16px',
      height: '16px',
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

    const input = document.createElement('input');
    input.type = 'text';
    setStyle(input, {
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
    input.autofocus = true;
    input.placeholder = '查找';
    // 绑定事件，当输入框内容变化时，调用search函数
    input.oninput = () => {
      this.dispatchEvent(new CustomEvent('search', { detail: input.value }));
    };

    const uppercaseButtonBox = document.createElement('div');
    setStyle(uppercaseButtonBox, {
      width: '22px',
      height: '22px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      borderRadius: '4px',
      marginRight: '4px',
    });
    uppercaseButtonBox.onmouseenter = () => {
      setStyle(uppercaseButtonBox, {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
      });
    };
    uppercaseButtonBox.onmouseleave = () => {
      setStyle(uppercaseButtonBox, {
        backgroundColor: 'transparent',
      });
    };
    const uppercaseButtonIcon = document.createElement('img');
    uppercaseButtonIcon.src = UppercaseIcon;
    setStyle(uppercaseButtonIcon, {
      width: '18px',
      height: '18px',
    });
    uppercaseButtonBox.appendChild(uppercaseButtonIcon);

    const lowercaseButtonBox = document.createElement('div');
    setStyle(lowercaseButtonBox, {
      width: '22px',
      height: '22px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      borderRadius: '4px',
      marginRight: '4px',
    });
    lowercaseButtonBox.onmouseenter = () => {
      setStyle(lowercaseButtonBox, {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
      });
    };
    lowercaseButtonBox.onmouseleave = () => {
      setStyle(lowercaseButtonBox, {
        backgroundColor: 'transparent',
      });
    };
    const lowercaseButtonIcon = document.createElement('img');
    lowercaseButtonIcon.src = LowercaseIcon;
    setStyle(lowercaseButtonIcon, {
      width: '18px',
      height: '18px',
    });
    lowercaseButtonBox.appendChild(lowercaseButtonIcon);

    inputBox.appendChild(input);
    inputBox.appendChild(uppercaseButtonBox);
    inputBox.appendChild(lowercaseButtonBox);

    // 将输入框添加到内容区域
    this.floatingBox.appendChild(inputBox);

    // 搜索结果
    const searchResult = document.createElement('div');
    searchResult.id = this.searchResultId;
    searchResult.textContent = this.searchResultEmptyText;
    setStyle(searchResult, {
      color: 'white',
      fontSize: '13px',
      marginRight: '12px',
    });
    this.searchResultElement = searchResult;
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
    const prevButtonIcon = document.createElement('img');
    prevButtonIcon.src = PrevIcon;
    setStyle(prevButtonIcon, {
      width: '16px',
      height: '16px',
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
    const nextButtonIcon = document.createElement('img');
    nextButtonIcon.src = NextIcon;
    setStyle(nextButtonIcon, {
      width: '16px',
      height: '16px',
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
    const closeButtonIcon = document.createElement('img');
    closeButtonIcon.src = CloseIcon;
    setStyle(closeButtonIcon, {
      width: '16px',
      height: '16px',
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
}

customElements.define('floating-search-box', FloatingSearchBox);

export type FloatingSearchBoxElement = FloatingSearchBox;
