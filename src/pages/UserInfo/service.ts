import request from '@/utils/request';

export enum AccountType {
  EMAIL = 'email',
  GITHUB = 'github',
  PASSWORD = 'password',
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

export const updatePasswordService = async (password: string) => {
  return request<API.BaseResponse<boolean>>('/api/user/update/password', {
    method: 'POST',
    data: { password },
  });
};

export const updateUserinfoService = (username: string) => {
  return request<API.BaseResponse<boolean>>('/api/user/info/update', {
    method: 'POST',
    data: { username },
  });
};

export enum PaymentStatus {
  /** 未支付 */
  NO_PAY = 'NO_PAY',
  /** 已支付待审核 */
  PAID_PENDING_REVIEW = 'PAID_PENDING_REVIEW',
  /** 已审核 */
  REVIEWED = 'REVIEWED',
  /** 审核不通过 */
  NO_PASS = 'NO_PASS',
}

export const getPayApplyInfoService = async () => {
  return request<
    API.BaseResponse<{
      paymentWay: PaymentWay;
      serialNumber: string;
      paymentStatus: PaymentStatus;
    }>
  >('/api/user/pay/apply/info');
};

export const logoutService = async () => {
  return request<API.BaseResponse<boolean>>('/api/auth/logout', {
    method: 'POST',
  });
};
