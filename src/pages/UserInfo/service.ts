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

export enum PaymentMethod {
  ALIPAY = 'alipay',
  WECHAT = 'wechat',
}
