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

export const updatePasswordService = async (password: string) => {
  return request<API.BaseResponse<boolean>>('/api/user/update/password', {
    method: 'POST',
    data: { password },
  });
};

export const logoutService = async () => {
  return request<API.BaseResponse<boolean>>('/api/auth/logout', {
    method: 'POST',
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
  PASS = 'PASS',
  /** 审核不通过 */
  NO_PASS = 'NO_PASS',
}

export enum PaymentWay {
  ALIPAY = 'ALIPAY',
  WECHAT = 'WECHAT',
}

export const getPaymentApplyInfoService = async () => {
  return request<
    API.BaseResponse<{
      paymentWay: PaymentWay;
      serialNumber: string;
      paymentStatus: PaymentStatus;
    }>
  >('/api/payment/apply/info');
};

export type IPaymentApplyParams = {
  paymentWay: PaymentWay;
  serialNumber: string;
};
export const paymentApplyService = async (params: IPaymentApplyParams) => {
  return request<API.BaseResponse<any>>('/api/payment/apply', {
    method: 'POST',
    data: params,
  });
};

export const getRemainTimesService = async () => {
  return request<API.BaseResponse<number>>('/api/remaining-times');
};
