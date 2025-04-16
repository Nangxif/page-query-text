import { NotificationType } from '@/types';
import { setStyle } from '@/utils';
import ErrorIcon from '../assets/images/error-icon.png';
import InfoIcon from '../assets/images/info-icon.png';
import CloseIcon from '../assets/images/notification-close-icon.png';
import SuccessIcon from '../assets/images/success-icon.png';
class NotificationBox extends HTMLElement {
  static get observedAttributes() {
    return [
      'data-show',
      'data-title',
      'data-content',
      'data-duration',
      'data-type',
    ];
  }
  private iconMap = {
    [NotificationType.Success]: SuccessIcon,
    [NotificationType.Error]: ErrorIcon,
    [NotificationType.Info]: InfoIcon,
  };
  private localStyle!: HTMLStyleElement;
  private iconContainer!: HTMLDivElement;
  private notificationBox!: HTMLDivElement;
  private notificationTitle!: HTMLDivElement;
  private notificationContent!: HTMLDivElement;
  private notificationAction!: HTMLDivElement;
  private timer: number | null = null;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.createNotification();
  }

  disconnectedCallback() {
    if (this.timer) {
      clearTimeout(this.timer);
    }
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    if (name === 'data-show') {
      if (newValue === 'true') {
        this.show();
      } else {
        this.hide();
      }
    } else if (name === 'data-type') {
      const type = this.dataset.type;
      const icon = this.iconMap[type as keyof typeof this.iconMap];
      this.iconContainer.style.backgroundImage = `url(${icon})`;
    } else if (name === 'data-title' && this.notificationTitle) {
      this.notificationTitle.textContent = newValue;
    } else if (name === 'data-content' && this.notificationContent) {
      this.notificationContent.textContent = newValue;
    } else if (name === 'data-duration') {
      this.resetTimer();
    }
  }

  private createNotification() {
    // 添加样式
    this.localStyle = document.createElement('style');

    this.localStyle.textContent = `
         .notification-box {
             position: fixed;
             bottom: 20px;
             right: 20px;
             width: 300px;
             background-color: white;
             padding: 20px 12px;
             border-radius: 8px;
             z-index: 10000;
             transition: all 0.5s ease;
             opacity: 0;
             display: flex;
             box-shadow: 0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 9px 28px 8px rgba(0, 0, 0, 0.05);
             pointer-events: none;
         }
         
         .notification-box.visible {
             opacity: 1;
             pointer-events: auto;
         }

         .notification-box-icon {
             flex:0 0 24px;
             width: 24px;
             height: 24px;
             background-size: 100% 100%;
             background-repeat: no-repeat;
             margin-right: 8px;
         }

         .notification-box-container {
             flex: 1;
             width: 100%;
             margin-right: 8px;
         }

         .notification-box-title {
             color: rgba(0,0,0,0.88);
             font-size: 14px;
             margin-bottom: 4px;
         }

         .notification-box-content {
             font-size: 13px;
             color: rgba(0,0,0,0.65);
             margin-bottom: 8px;
         }

         .close-button {
             flex: 0 0 22px;
             width: 22px;
             height: 22px;
             cursor: pointer;
             display: flex;
             align-items: center;
             justify-content: center;
             border-radius: 4px;
         }

         .close-icon {
             width: 18px;
             height: 18px;
             background-image: url(${CloseIcon});
             background-size: 100% 100%;
             background-repeat: no-repeat;
         }
     `;
    this.shadowRoot?.appendChild(this.localStyle);

    this.notificationBox = document.createElement('div');
    this.notificationBox.className = 'notification-box';

    this.iconContainer = document.createElement('div');
    this.iconContainer.className = 'notification-box-icon';
    this.notificationBox.appendChild(this.iconContainer);

    // 创建容器
    const notificationContainer = document.createElement('div');
    notificationContainer.className = 'notification-box-container';
    this.notificationBox.appendChild(notificationContainer);

    this.notificationTitle = document.createElement('div');
    this.notificationTitle.className = 'notification-box-title';
    this.notificationTitle.textContent = this.dataset.title || '';
    notificationContainer.appendChild(this.notificationTitle);

    this.notificationContent = document.createElement('div');
    this.notificationContent.className = 'notification-box-content';
    this.notificationContent.textContent = this.dataset.content || '';
    notificationContainer.appendChild(this.notificationContent);

    this.notificationAction = document.createElement('div');
    const notificationActionSlot = document.createElement('slot');
    this.notificationAction.appendChild(notificationActionSlot);
    notificationContainer.appendChild(this.notificationAction);

    const closeButton = document.createElement('div');
    closeButton.className = 'close-button';
    closeButton.onclick = () => {
      this.hide();
    };
    closeButton.onmouseenter = () => {
      setStyle(closeButton, {
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
      });
    };
    closeButton.onmouseleave = () => {
      setStyle(closeButton, {
        backgroundColor: 'transparent',
      });
    };
    const closeIcon = document.createElement('div');
    closeIcon.className = 'close-icon';

    closeButton.appendChild(closeIcon);
    this.notificationBox.appendChild(closeButton);

    this.shadowRoot?.appendChild(this.notificationBox);
  }

  private show() {
    setTimeout(() => {
      this.notificationBox.classList.add('visible');
      this.resetTimer();
    }, 10);
  }

  private hide() {
    this.notificationBox.classList.remove('visible');
  }

  private resetTimer() {
    if (this.timer) {
      clearTimeout(this.timer);
    }

    const duration = parseInt(this.dataset.duration || '0', 10);
    if (duration > 0) {
      this.timer = window.setTimeout(() => {
        this.hide();
      }, duration);
    }
  }
}

customElements.define('notification-box', NotificationBox);

export type NotificationBoxElement = NotificationBox;

class NotificationAction extends HTMLElement {
  private notificationAction!: HTMLDivElement;
  static get observedAttributes() {
    return ['data-action-text'];
  }
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.createNotificationAction();
  }

  private createNotificationAction() {
    const localStyle = document.createElement('style');
    localStyle.textContent = `
      .notification-action {
        color: white;
        background-color: #ccac85;
        cursor: pointer;
        font-size: 12px;
        padding: 2px 4px;
        border-radius: 4px;
        width: fit-content;
      }
    `;
    this.shadowRoot?.appendChild(localStyle);
    this.notificationAction = document.createElement('div');
    this.notificationAction.className = 'notification-action';
    this.shadowRoot?.appendChild(this.notificationAction);
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    if (name === 'data-action-text' && this.notificationAction) {
      this.notificationAction.textContent = newValue;
    }
  }
}

customElements.define('notification-action', NotificationAction);
export type NotificationActionElement = NotificationAction;
