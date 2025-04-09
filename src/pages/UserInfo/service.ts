import request from '@/utils/request';

export enum AccountType {
  EMAIL = 'email',
  GITHUB = 'github',
}
export type UserInfoData = {
  _id: string;
  username: string;
  avatar: string;
  accountType: AccountType;
  email?: string;
};
export const getUserInfoService = async () => {
  return request<API.BaseResponse<UserInfoData>>('/api/user/info');
};

export enum PaymentWay {
  ALIPAY = 'ALIPAY',
  WECHAT = 'WECHAT',
}

export type IPayApplyParams = {
  paymentWay: PaymentWay;
  serialNumber: string;
};
export const payApplyService = async (params: IPayApplyParams) => {
  return request<API.BaseResponse<any>>('/api/user/pay/apply', {
    method: 'POST',
    data: params,
  });
};
