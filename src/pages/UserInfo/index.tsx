import { ConfigProvider } from 'antd';
import classNames from 'classnames';
import { useState } from 'react';
import PaymentForm from './components/PaymentForm';
import UpdatePasswordForm from './components/UpdatePasswordForm';
import UpdatePersonDataForm from './components/UpdatePersonDataForm';
import styles from './index.less';

enum TabEnum {
  /** 个人资料 */
  PersonalData,
  /** 密码设置 */
  PasswordSetting,
  /** 支付 */
  Payment,
}

const Tabs = [
  { label: '个人资料', key: TabEnum.PersonalData },
  { label: '密码设置', key: TabEnum.PasswordSetting },
  { label: '支付', key: TabEnum.Payment },
];
export default function UserCenter() {
  const [activeTab, setActiveTab] = useState<TabEnum>(TabEnum.PersonalData);

  return (
    <div className={styles['content-wrapper']}>
      <div className={styles.tabs}>
        {Tabs.map((item) => {
          return (
            <div
              className={classNames(styles.tab, {
                [styles['active-tab']]: item.key === activeTab,
              })}
              onClick={() => {
                if (activeTab !== item.key) {
                  setActiveTab(item.key);
                }
              }}
              key={item.key}
            >
              {item.label}
            </div>
          );
        })}
      </div>
      <ConfigProvider
        theme={{
          components: {
            Form: {
              labelColor: '#383533',
              verticalLabelPadding: '0 0 8px',
              itemMarginBottom: 24,
            },
            Input: {
              colorBorder: '#F0EEEC',
            },
          },
        }}
      >
        {activeTab === TabEnum.PersonalData && <UpdatePersonDataForm />}
        {activeTab === TabEnum.PasswordSetting && <UpdatePasswordForm />}
        {activeTab === TabEnum.Payment && <PaymentForm />}
      </ConfigProvider>
    </div>
  );
}
