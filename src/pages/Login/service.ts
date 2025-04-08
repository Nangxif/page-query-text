import request from '@/utils/request';

export const getEmailCodeService = async (email: string) => {
  return request<API.BaseResponse<string>>('/api/auth/email/code', {
    method: 'POST',
    data: {
      email,
    },
  });
};

export const loginService = async (email: string, code: string) => {
  return request<API.BaseResponse<string>>('/api/auth/email/verify', {
    method: 'POST',
    data: { email, code },
  });
};
