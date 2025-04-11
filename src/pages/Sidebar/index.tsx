import { defaultConfig } from '@/constants/content-scripts';
import { modelOptions } from '@/constants/pages';
import { ModelType } from '@/types';
import { formatColor } from '@/utils';
import { useRequest } from 'ahooks';
import {
  Button,
  Card,
  ColorPicker,
  Form,
  Input,
  message,
  Modal,
  Result,
  Segmented,
  Select,
  Switch,
} from 'antd';
import { useEffect, useState } from 'react';
import { getPayApplyInfoService, PaymentStatus } from '../UserInfo/service';
import ShortcutPicker, { specialKeys } from './ShortcutPicker';
import styles from './index.less';

const { Item: FormItem, useForm } = Form;
type NormalFormValues = {
  shortcut: string[];
  color: string;
  bgColor: string;
  selectedColor: string;
  selectedBgColor: string;
  fixed: boolean;
};

type AdvancedFormValues = {
  model: ModelType;
  apiKey: string;
};

enum SettingType {
  NORMAL = 'NORMAL',
  ADVANCED = 'ADVANCED',
}

const settingOptions = [
  {
    label: '常规设置',
    value: SettingType.NORMAL,
  },
  {
    label: '高级设置',
    value: SettingType.ADVANCED,
  },
];

const Sidebar: React.FC = () => {
  const [normalForm] = useForm<NormalFormValues>();
  const [advancedForm] = useForm<AdvancedFormValues>();
  const [selectedSetting, setSelectedSetting] = useState(SettingType.NORMAL);

  const { data, run: getPayApplyInfo } = useRequest(
    async () => {
      try {
        const res = await getPayApplyInfoService();
        return res?.data;
      } catch {
        message.warning('此功能需登录后才能使用');
      }
    },
    {
      manual: true,
    },
  );

  // 初始化数据
  useEffect(() => {
    if (selectedSetting === SettingType.NORMAL) {
      chrome?.storage?.sync?.get(
        [
          'shortcut',
          'color',
          'bgColor',
          'selectedColor',
          'selectedBgColor',
          'fixed',
        ],
        (result) => {
          normalForm.setFieldsValue(result);
        },
      );
    } else if (selectedSetting === SettingType.ADVANCED) {
      getPayApplyInfo();
      chrome?.storage?.sync?.get(['model', 'apiKey'], (result) => {
        advancedForm.setFieldsValue(result);
      });
    }
  }, [selectedSetting]);

  const handleSubmitNormalSetting = (values: NormalFormValues) => {
    const color = formatColor(values.color);
    const bgColor = formatColor(values.bgColor);
    const selectedColor = formatColor(values.selectedColor);
    const selectedBgColor = formatColor(values.selectedBgColor);
    chrome?.storage?.sync?.set({
      shortcut: values.shortcut,
      color,
      bgColor,
      selectedColor,
      selectedBgColor,
      fixed: values.fixed,
    });
    message.success('保存成功，刷新页面之后配置才可生效');
  };

  const handleResetNormalSetting = () => {
    Modal.confirm({
      title: '确定要重置配置吗？',
      content: '重置配置后，刷新页面之后配置才可生效',
      onOk: () => {
        normalForm.setFieldsValue(defaultConfig);
        chrome?.storage?.sync?.set({
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

  const handleResetPosition = () => {
    chrome?.storage?.local?.set({
      startX: 0,
      startY: 0,
    });
    message.success('搜索栏已挪动到初始位置，刷新页面之后配置才可生效');
  };

  const handleSubmitAdvanced = (values: AdvancedFormValues) => {
    chrome?.storage?.sync?.set(values);
    message.success('保存成功，刷新页面之后配置才可生效');
  };

  return (
    <div className={styles.container}>
      <Segmented
        options={settingOptions}
        style={{
          marginBottom: '24px',
        }}
        value={selectedSetting}
        onChange={(val) => setSelectedSetting(val)}
      />
      {selectedSetting === SettingType.NORMAL && (
        <Form
          form={normalForm}
          layout="vertical"
          initialValues={defaultConfig}
          onFinish={handleSubmitNormalSetting}
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
                  if (value && value.length > 0 && value.length < 2) {
                    return Promise.reject(
                      new Error('至少选择两个自定义搜索快捷键'),
                    );
                  }

                  if (
                    value &&
                    value.length > 0 &&
                    value.filter((item: string) => specialKeys.includes(item))
                      .length === 0
                  ) {
                    return Promise.reject(new Error('其中一个必须是功能键'));
                  }

                  if (
                    value &&
                    value.length > 0 &&
                    value.filter((item: string) => item.length === 1).length > 1
                  ) {
                    return Promise.reject(new Error('字母键最多只能设置一个'));
                  }
                  return Promise.resolve();
                },
                message:
                  '至少选择两个自定义搜索快捷键，其中一个必须是功能键且字母键最多只能设置一个',
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
          <Button
            type="primary"
            htmlType="submit"
            className={styles['save-btn']}
          >
            保存
          </Button>
          <Button
            type="primary"
            className={styles['save-btn']}
            onClick={handleResetNormalSetting}
            danger
          >
            重置成默认配置
          </Button>
          <Button
            type="primary"
            className={styles['save-btn']}
            onClick={handleResetPosition}
            ghost
          >
            将搜索栏挪动到初始位置
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
      )}

      {selectedSetting === SettingType.ADVANCED &&
        data &&
        data?.paymentStatus === PaymentStatus.REVIEWED && (
          <Form
            form={advancedForm}
            layout="vertical"
            onFinish={handleSubmitAdvanced}
          >
            <FormItem
              label="模型"
              name="model"
              className={styles['form-item']}
              rules={[
                {
                  required: true,
                  message: '请选择一个模型',
                },
              ]}
            >
              <Select
                options={modelOptions}
                placeholder="请选择一个模型"
                allowClear
              />
            </FormItem>
            <FormItem
              label={
                <>
                  apiKey(
                  <a
                    onClick={() => {
                      const modelType = advancedForm?.getFieldValue('model');
                      if (!modelType) {
                        message.warning('请先选择一个模型');
                        return;
                      }
                      const model = modelOptions.find(
                        (m) => m.value === modelType,
                      );
                      const link = model?.apiKeyApplyUrl;
                      window.open(link, '__blank');
                    }}
                  >
                    不知道在哪里申请？
                  </a>
                  )
                </>
              }
              name="apiKey"
              className={styles['form-item']}
              tooltip="您的apiKey将会被存储在您电脑本地，不会上传至服务器"
              rules={[
                {
                  required: true,
                  message: '请填写apiKey',
                },
              ]}
            >
              <Input placeholder="请填写apiKey" allowClear />
            </FormItem>
            <Button
              type="primary"
              htmlType="submit"
              className={styles['save-btn']}
            >
              保存
            </Button>

            <Button
              type="default"
              className={styles['save-btn']}
              onClick={() => {
                chrome.tabs.create({
                  url: chrome.runtime.getURL('/UserInfo.html'),
                });
              }}
            >
              查看账号信息
            </Button>
            <div className={styles['copy-right']}>
              ©️该插件版权归Nangxif所有
            </div>
          </Form>
        )}

      {selectedSetting === SettingType.ADVANCED && !data && (
        <Result
          status="403"
          subTitle="此功能需登录后才能使用"
          extra={
            <Button
              type="primary"
              onClick={() => {
                chrome.tabs.create({
                  url: chrome.runtime.getURL('/Login.html'),
                });
              }}
            >
              点此登录
            </Button>
          }
        />
      )}

      {selectedSetting === SettingType.ADVANCED &&
        data &&
        data.paymentStatus !== PaymentStatus.REVIEWED && (
          <Result
            status="403"
            subTitle="此功能需购买才能使用"
            extra={
              <Button
                type="primary"
                onClick={() => {
                  chrome.tabs.create({
                    url: chrome.runtime.getURL('/UserInfo.html'),
                  });
                }}
              >
                点此购买
              </Button>
            }
          />
        )}
    </div>
  );
};

export default Sidebar;
