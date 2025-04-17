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
  InputNumber,
  message,
  Modal,
  Result,
  Segmented,
  Select,
  Slider,
  Switch,
} from 'antd';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { getPayApplyInfoService, PaymentStatus } from '../UserInfo/service';
import ShortcutPicker, { specialKeys } from './ShortcutPicker';
import styles from './index.less';

const { Item: FormItem, useForm } = Form;
const { TextArea } = Input;
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
  systemPrompt?: string;
  userPrompt?: string;
  temperature?: number;
  maxTokens?: number;
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

const Setting: React.FC = () => {
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
      chrome?.storage?.sync?.get(
        [
          'model',
          'apiKey',
          'systemPrompt',
          'userPrompt',
          'temperature',
          'maxTokens',
        ],
        (result) => {
          advancedForm.setFieldsValue(result);
        },
      );
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
    <>
      <Helmet>
        <title>设置面板</title>
      </Helmet>
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
                      value.filter((item: string) => item.length === 1).length >
                        1
                    ) {
                      return Promise.reject(
                        new Error('字母键最多只能设置一个'),
                      );
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

            <div className={styles['copy-right']}>
              ©️该插件版权归Nangxif所有
            </div>
          </Form>
        )}

        {selectedSetting === SettingType.ADVANCED &&
          data &&
          data?.paymentStatus === PaymentStatus.REVIEWED && (
            <Form
              form={advancedForm}
              layout="vertical"
              onFinish={handleSubmitAdvanced}
              onValuesChange={(changedValues) => {
                if (changedValues.model) {
                  const modelInfo = modelOptions.find(
                    (m) => m.value === changedValues.model,
                  );
                  advancedForm.setFieldsValue({
                    temperature: modelInfo?.defaultTemperature,
                    maxTokens: modelInfo?.defaultTokens,
                  });
                }
              }}
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
                tooltip="为了保障您的资金安全，您的apiKey将会被存储在您电脑本地，不会上传至服务器"
                rules={[
                  {
                    required: true,
                    message: '请填写apiKey',
                  },
                ]}
              >
                <Input placeholder="请填写apiKey" allowClear />
              </FormItem>

              <FormItem
                label="系统提示词"
                name="systemPrompt"
                className={styles['form-item']}
                tooltip={
                  <>
                    系统提示词通常用于：
                    <br />
                    1. 定义AI助手的角色和身份
                    <br />
                    2. 设置AI应该遵循的规则和指导方针
                    <br />
                    3. 提供AI执行任务所需的背景信息
                  </>
                }
              >
                <TextArea
                  placeholder="请填写系统提示词【不填写默认使用默认提示词】"
                  allowClear
                  maxLength={500}
                  rows={4}
                  showCount
                />
              </FormItem>

              <FormItem
                label={
                  <>
                    用户提示词
                    <Button
                      type="link"
                      size="small"
                      style={{
                        marginLeft: '4px',
                        padding: 0,
                      }}
                      onClick={() => {
                        const userPrompt =
                          advancedForm?.getFieldValue('userPrompt');
                        advancedForm.setFieldsValue({
                          userPrompt: (userPrompt || '') + '{{text}}',
                        });
                      }}
                    >
                      插入&#123;&#123;text&#125;&#125;占位符
                    </Button>
                  </>
                }
                name="userPrompt"
                className={styles['form-item']}
                rules={[
                  {
                    pattern: /\{\{text\}\}/,
                    message: '请插入{{text}}占位符',
                  },
                ]}
                tooltip={
                  <>
                    用户提示词通常用于：
                    <br />
                    1.
                    提供具体任务内容：向AI传递需要处理的实际文本内容（$text变量）
                    <br />
                    2. 明确任务要求：清晰地告诉AI需要“为页面内容生成专业摘要”
                    <br />
                    3. 指定输出格式：要求AI按照特定结构输出结果
                    <br />
                    4. 建立上下文：与系统提示词结合，形成完整的指令集
                    <br />
                    5. 触发执行：作为用户的直接请求，促使AI执行总结任务
                  </>
                }
              >
                <TextArea
                  placeholder="请填写用户提示词【不填写默认使用默认提示词】"
                  allowClear
                  maxLength={500}
                  rows={4}
                  showCount
                />
              </FormItem>

              <FormItem noStyle shouldUpdate>
                {({ getFieldsValue }) => {
                  const { model } = getFieldsValue();
                  const modelInfo = modelOptions.find((m) => m.value === model);
                  const {
                    minTemperature,
                    maxTemperature,
                    temperatureStep,
                    minTokens,
                    maxTokens,
                  } = modelInfo || {};
                  return (
                    <>
                      <FormItem
                        name="temperature"
                        label="随机性"
                        className={styles['form-item']}
                        tooltip="随机性越高，AI的回答越随机，但可能会导致回答不准确"
                      >
                        <Slider
                          tooltip={{ formatter: (value) => value }}
                          min={minTemperature}
                          max={maxTemperature}
                          step={temperatureStep}
                          style={{
                            width: '90%',
                          }}
                        />
                      </FormItem>

                      <FormItem
                        name="maxTokens"
                        label="最大token数"
                        className={styles['form-item']}
                        tooltip="最大token数决定了AI可以处理的最大文本长度，过高的token数可能会导致AI回答不准确"
                      >
                        <InputNumber
                          min={minTokens}
                          max={maxTokens}
                          precision={0}
                        />
                      </FormItem>
                    </>
                  );
                }}
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
    </>
  );
};

export default Setting;
