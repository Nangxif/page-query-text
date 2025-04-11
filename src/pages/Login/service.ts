import request from '@/utils/request';

export const getEmailCodeService = async (email: string) => {
  return request<API.BaseResponse<string>>('/api/auth/email/code', {
    method: 'POST',
    data: {
      email,
    },
  });
};

export const emailLoginService = async (email: string, code: string) => {
  return request<API.BaseResponse<{ token: string }>>(
    '/api/auth/email/verify',
    {
      method: 'POST',
      data: { email, code },
    },
  );
};

export const passwordLoginService = async (email: string, password: string) => {
  return request<API.BaseResponse<{ token: string }>>(
    '/api/auth/password/login',
    {
      method: 'POST',
      data: { email, password },
    },
  );
};
