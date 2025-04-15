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
  },
  {
    label: 'gpt-3.5-turbo',
    value: ModelType.Gpt_3_5_Turbo,
    apiKeyApplyUrl: 'https://platform.openai.com/api-keys',
  },
  {
    label: 'moonshot-v1-8k',
    value: ModelType.Moonshot_V1_8k,
    apiKeyApplyUrl: 'https://platform.moonshot.cn/console/api-keys',
  },
];

export const modelTextMap = {
  [ModelType.Deepseek_Chat]: 'deepseek-chat',
  [ModelType.Gpt_3_5_Turbo]: 'gpt-3.5-turbo',
  [ModelType.Moonshot_V1_8k]: 'moonshot-v1-8k',
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
