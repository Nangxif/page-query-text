import { MatchCaseEnum } from '@/types';
import { setStyle } from '@/utils';
import CloseIcon from '../assets/images/close-icon.png';
import DontMatchCaseIcon from '../assets/images/dont-match-case-icon.png';
import MatchCaseIcon from '../assets/images/match-case-icon.png';
import NextIcon from '../assets/images/next-icon.png';
import PrevIcon from '../assets/images/prev-icon.png';
import SettingsIcon from '../assets/images/setting-icon.png';

// 定义一个悬浮搜索框的Web Component
class FloatingSearchBox extends HTMLElement {
  private floatingBox: HTMLElement | null = null;
  private searchResultId: string = `search-result`;
  private matchCase = MatchCaseEnum.DontMatch;

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
    const matchCaseButtonIcon = document.createElement('img');
    matchCaseButtonIcon.src = MatchCaseIcon;
    setStyle(matchCaseButtonIcon, {
      width: '18px',
      height: '18px',
    });
    matchcaseButtonBox.appendChild(matchCaseButtonIcon);

    const dontMatchCaseButtonBox = document.createElement('div');
    setStyle(dontMatchCaseButtonBox, {
      width: '22px',
      height: '22px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      borderRadius: '4px',
      marginRight: '4px',
    });
    dontMatchCaseButtonBox.onmouseenter = () => {
      setStyle(dontMatchCaseButtonBox, {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
      });
    };
    dontMatchCaseButtonBox.onmouseleave = () => {
      setStyle(dontMatchCaseButtonBox, {
        backgroundColor: 'transparent',
      });
    };
    const dontMatchCaseButtonIcon = document.createElement('img');
    dontMatchCaseButtonIcon.src = DontMatchCaseIcon;
    setStyle(dontMatchCaseButtonIcon, {
      width: '18px',
      height: '18px',
    });
    dontMatchCaseButtonBox.appendChild(dontMatchCaseButtonIcon);

    inputBox.appendChild(input);
    inputBox.appendChild(matchcaseButtonBox);
    inputBox.appendChild(dontMatchCaseButtonBox);

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
    nextButtonBox.onclick = () => {
      this.dispatchEvent(new CustomEvent('searchnext'));
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
