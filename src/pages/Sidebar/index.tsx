import { defaultConfig } from '@/constants';
import { formatColor } from '@/utils';
import {
  Button,
  Card,
  ColorPicker,
  ConfigProvider,
  Form,
  message,
  Modal,
  Switch,
} from 'antd';
import { useEffect } from 'react';
import ShortcutPicker, { specialKeys } from './ShortcutPicker';
import styles from './index.less';

const { Item: FormItem, useForm } = Form;
type FormValues = {
  shortcut: string[];
  color: string;
  bgColor: string;
  selectedColor: string;
  selectedBgColor: string;
  fixed: boolean;
};

const Sidebar: React.FC = () => {
  const [form] = useForm<FormValues>();

  // 初始化数据
  useEffect(() => {
    chrome.storage.sync.get(
      [
        'shortcut',
        'color',
        'bgColor',
        'selectedColor',
        'selectedBgColor',
        'fixed',
      ],
      (result) => {
        form.setFieldsValue(result);
      },
    );
  }, []);

  const handleSubmit = (values: FormValues) => {
    const color = formatColor(values.color);
    const bgColor = formatColor(values.bgColor);
    const selectedColor = formatColor(values.selectedColor);
    const selectedBgColor = formatColor(values.selectedBgColor);
    chrome.storage.sync.set({
      shortcut: values.shortcut,
      color,
      bgColor,
      selectedColor,
      selectedBgColor,
      fixed: values.fixed,
    });
    message.success('保存成功，刷新页面之后配置才可生效');
  };

  const handleReset = () => {
    Modal.confirm({
      title: '确定要重置配置吗？',
      content: '重置配置后，刷新页面之后配置才可生效',
      onOk: () => {
        form.setFieldsValue(defaultConfig);
        chrome.storage.sync.set({
          shortcut: defaultConfig.shortcut,
          color: defaultConfig.color,
          bgColor: defaultConfig.bgColor,
          selectedColor: defaultConfig.selectedColor,
          selectedBgColor: defaultConfig.selectedBgColor,
        });
        message.success('重置成功，刷新页面之后配置才可生效');
      },
      cancelText: '取消',
      okText: '确定',
    });
  };
  return (
    <ConfigProvider
      theme={{
        components: {
          Button: {
            colorPrimary: 'rgb(0 120 212)',
          },
          Switch: {
            colorPrimary: 'rgb(0 120 212)',
          },
          Select: {
            borderRadius: 4,
            colorBgContainer: 'rgb(49 49 49)',
            colorText: '#bbb',
            multipleItemBg: 'rgb(32 32 32)',
            optionSelectedBg: 'rgb(32 32 32)',
            optionActiveBg: 'rgb(32 32 32)',
            colorTextPlaceholder: 'rgba(255,255,255,0.5)',
          },
        },
      }}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={defaultConfig}
        className={styles.container}
        onFinish={handleSubmit}
      >
        <FormItem
          label="自定义搜索快捷键"
          name="shortcut"
          className={styles['form-item']}
          rules={[
            {
              required: true,
              message: '请选择自定义搜索快捷键',
            },
            {
              validator(_, value) {
                console.log(
                  value.length < 2,
                  value.every((item: string) => !specialKeys.includes(item)),
                );
                if (
                  !value &&
                  (value.length < 2 ||
                    value.every((item: string) => !specialKeys.includes(item)))
                ) {
                  return Promise.reject(
                    new Error(
                      '至少选择两个自定义搜索快捷键，其中一个必须是功能键',
                    ),
                  );
                }
                return Promise.resolve();
              },
              message: '至少选择两个自定义搜索快捷键，其中一个必须是功能键',
            },
          ]}
          tooltip="可以自定义搜索快捷键，其中一个必须是功能键（如：Ctrl、Shift、Alt等），使用者自己注意热键冲突，尽量设置不会冲突的快捷键"
        >
          <ShortcutPicker />
        </FormItem>
        <FormItem
          label="命中的文字颜色"
          name="color"
          className={styles['form-item']}
        >
          <ColorPicker format="rgb" />
        </FormItem>
        <FormItem
          label="命中的文字背景颜色"
          name="bgColor"
          className={styles['form-item']}
        >
          <ColorPicker format="rgb" />
        </FormItem>

        <FormItem noStyle shouldUpdate>
          {({ getFieldsValue }) => {
            const { color, bgColor } = getFieldsValue();
            return (
              <Card className={styles.card} title="示例">
                <p
                  style={{
                    color: formatColor(color),
                    background: formatColor(bgColor),
                  }}
                >
                  命中的文字
                </p>
              </Card>
            );
          }}
        </FormItem>
        <FormItem
          label="当前选中的文字颜色"
          name="selectedColor"
          className={styles['form-item']}
        >
          <ColorPicker format="rgb" />
        </FormItem>
        <FormItem
          label="当前选中的文字背景颜色"
          name="selectedBgColor"
          className={styles['form-item']}
        >
          <ColorPicker format="rgb" />
        </FormItem>

        <FormItem noStyle shouldUpdate>
          {({ getFieldsValue }) => {
            const { selectedColor, selectedBgColor } = getFieldsValue();
            return (
              <Card className={styles.card} title="示例">
                <p
                  style={{
                    color: formatColor(selectedColor),
                    background: formatColor(selectedBgColor),
                  }}
                >
                  当前选中的文字
                </p>
              </Card>
            );
          }}
        </FormItem>
        <FormItem
          label="固定位置"
          name="fixed"
          className={styles['form-item']}
          valuePropName="checked"
        >
          <Switch />
        </FormItem>
        <Button type="primary" htmlType="submit" className={styles['save-btn']}>
          保存
        </Button>
        <Button
          type="primary"
          className={styles['save-btn']}
          onClick={handleReset}
          danger
        >
          重置成默认配置
        </Button>
        <Button
          type="link"
          className={styles['how-to-use-btn']}
          onClick={() => {
            window.location.href = '/Instruction.html';
          }}
        >
          如何使用文本搜索？
        </Button>

        <div className={styles['copy-right']}>©️该插件版权归Nangxif所有</div>
      </Form>
    </ConfigProvider>
  );
};

export default Sidebar;
