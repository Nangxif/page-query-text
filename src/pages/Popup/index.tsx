import LogoIcon from '@/assets/images/logo.png';
import { defaultConfig } from '@/constants';
import { Button } from 'antd';
import { useEffect, useState } from 'react';
import styles from './index.less';

const Popup: React.FC = () => {
  const [shortcut, setShortcut] = useState<string>();
  useEffect(() => {
    chrome.storage.sync.get(['shortcut'], (syncConfig) => {
      const config = {
        ...defaultConfig,
        ...syncConfig,
      };
      const { shortcut } = config;
      setShortcut(`请按快捷键: ${shortcut.join('+')}打开搜索工具`);
    });
  }, []);
  return (
    <div className={styles.popup}>
      <div className={styles['logo-box']}>
        <img src={LogoIcon} className={styles.logo} />
        <div className={styles['logo-box-bottom']}>
          <div className={styles.name}>PageQueryText</div>
          <div className={styles.desc}>复刻代码编辑器vscode的文本搜索插件</div>
        </div>
      </div>

      <div className={styles.content}>
        {shortcut}，或点击
        <Button
          type="link"
          size="small"
          onClick={() => {
            chrome.runtime.sendMessage({ action: 'insertSearchBox' });
          }}
          style={{
            padding: 0,
          }}
        >
          此处
        </Button>
        打开搜索工具。
        <br />
        不知道怎么使用？可以点击
        <Button
          type="link"
          size="small"
          style={{
            padding: 0,
          }}
          onClick={() => {
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
              if (tabs.length > 0) {
                const tab = tabs[0];
                const tabId = tab.id;
                const windowId = tab.windowId;
                chrome.sidePanel.open({
                  tabId: tabId,
                  windowId: windowId,
                });
              }
            });
          }}
        >
          查看使用说明
        </Button>
      </div>
    </div>
  );
};

export default Popup;
