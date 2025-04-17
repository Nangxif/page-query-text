import AliPay from '@/assets/images/ali-pay.png';
import WechatPay from '@/assets/images/wechat-pay.png';
import { AccountType, PaymentWay } from '@/pages/UserInfo/service';
import { ModelType } from '@/types';

export const paymentWayTextOptions = [
  { label: '支付宝', value: PaymentWay.ALIPAY, img: AliPay },
  { label: '微信', value: PaymentWay.WECHAT, img: WechatPay },
];

export const modelOptions = [
  {
    label: 'deepseek-chat',
    value: ModelType.Deepseek_Chat,
    apiKeyApplyUrl: 'https://platform.deepseek.com/api_keys',
    minTemperature: 0.01,
    maxTemperature: 2,
    temperatureStep: 0.01,
    defaultTemperature: 0.3,
    minTokens: 1,
    maxTokens: 4096,
    defaultTokens: 1000,
  },
  {
    label: 'moonshot-v1-8k',
    value: ModelType.Moonshot_V1_8k,
    apiKeyApplyUrl: 'https://platform.moonshot.cn/console/api-keys',
    minTemperature: 0.01,
    maxTemperature: 2,
    temperatureStep: 0.01,
    defaultTemperature: 0.3,
    minTokens: 1,
    maxTokens: 8192,
    defaultTokens: 1000,
  },
  {
    label: 'moonshot-v1-32k',
    value: ModelType.Moonshot_V1_32k,
    apiKeyApplyUrl: 'https://platform.moonshot.cn/console/api-keys',
    minTemperature: 0.01,
    maxTemperature: 2,
    temperatureStep: 0.01,
    defaultTemperature: 0.3,
    minTokens: 1,
    maxTokens: 32768,
    defaultTokens: 1000,
  },
];

export const modelTextMap = {
  [ModelType.Deepseek_Chat]: 'deepseek-chat',
  [ModelType.Moonshot_V1_8k]: 'moonshot-v1-8k',
  [ModelType.Moonshot_V1_32k]: 'moonshot-v1-32k',
};

export const ResponseCode = {
  SUCCESS: 200,
  ERROR: 500,
};

export const accountTypeTextOptions = [
  { label: '邮箱登录', value: AccountType.EMAIL },
  { label: 'GitHub登录', value: AccountType.GITHUB },
  { label: '账号密码登录', value: AccountType.PASSWORD },
];
