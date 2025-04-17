import { notification } from 'antd';
import axios, { AxiosRequestConfig } from 'axios';
import Cookies from 'js-cookie';
import { getChromeStorage } from '.';
const instance = axios.create({
  baseURL: 'http://localhost:3001',
  withCredentials: true,
  proxy: {
    host: 'localhost',
    port: 3001,
  },
});

instance.interceptors.request.use(async (config) => {
  config.headers.Authorization =
    (await getChromeStorage(['PAGE_TOOLKIT_TOKEN']))?.PAGE_TOOLKIT_TOKEN ||
    Cookies.get('PAGE_TOOLKIT_TOKEN');
  return config;
});
instance.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error?.response?.status === 401) {
      if (window.location.pathname !== '/Setting.html') {
        window.location.href = '/Login.html';
      }
    }
    if (window.location.pathname !== '/Setting.html') {
      notification.error({
        message: '请求失败',
        description: error?.message,
      });
    }
    return Promise.reject(error);
  },
);

function request<T = any>(url: string, config?: AxiosRequestConfig) {
  return instance({
    url,
    ...config,
  }) as Promise<T>;
}

export default request;
